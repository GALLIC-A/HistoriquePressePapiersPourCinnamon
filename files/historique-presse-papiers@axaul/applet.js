const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const St = imports.gi.St;
const Mainloop = imports.mainloop;

const UUID = "historique-presse-papiers@axaul";
const AppletDir = imports.ui.appletManager.appletMeta[UUID].path;
const Settings = imports.ui.settings;
const MAX_TAILLE_CONTENU = 100;

function HistoriquePressePapiers(metadata, orientation, panelHeight, instanceId) {
    this._init(metadata, orientation, panelHeight, instanceId);
}

HistoriquePressePapiers.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(metadata, orientation, panelHeight, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);

        // ***********************************
        // ** Initialisation des paramètres **
        // ***********************************

        this._preferences = this._getDefaultSettings();
        this.settings = new Settings.AppletSettings(this._preferences, UUID, instanceId);
        this._bindSettings();

        // ****************************************
        // ** Initialisation de l'UI de l'applet **
        // ****************************************

        this.set_applet_icon_path(AppletDir + '/icon.png');
        this.set_applet_tooltip("Ouvrir l'historique du presse-papiers");

        // Menu principal
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        // Création & ajout des éléments statiques du menu
        this._addStaticMenuItems();

        // Section dynamique (contenant l'historique du presse-papiers)
        this.sectionHistorique = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this.sectionHistorique);

        // *****************************************
        // ** Initialisation des données internes **
        // *****************************************
        this.historiquePressePapiers = [];
        this.menuItems = [];
        this.timeoutId = null;

        // ***************************
        // ** Démarrage de l'applet **
        // ***************************
        this._reloadHistorique();
        this._startClipboardWatcher();
    },

    on_applet_clicked: function() {
        this.menu.toggle();
    },

    // ****************************
    // ** GESTION DES PARAMETRES **
    // ****************************
    _getDefaultSettings: function() {
        return {
            debug_mode: false,
            clipboard_history_limit: 15,
            poll_interval: 5,
            open_applet_shortcut: "<Ctrl><Alt>v"
        };
    },

    _bindSettings: function() {
        this.settings.bindProperty(
            Settings.BindingDirection.IN,
            "debug_mode", // Clé du settings-schema.json
            "debug_mode", // Propriété de _preferences
            this._onSettingsChanged.bind(this), // callback
            null
        );
        this.settings.bindProperty(Settings.BindingDirection.IN, "clipboard_history_limit", "clipboard_history_limit", this._onSettingsChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "poll_interval", "poll_interval", this._onSettingsChanged.bind(this), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, "open_applet_shortcut", "open_applet_shortcut", () => {
            Main.keybindingManager.addHotKey(
                UUID,
                this._preferences.open_applet_shortcut,
                () => this.menu.toggle()
            );
        }, null);
    },

    _onSettingsChanged: function() {
        this._logDebug(`[PARAMS] Changement de paramètres détecté`);
        this._updateDebugButton();
        this._restartClipboardWatcher();
    },

    // ***************
    // ** MENU & UI **
    // ***************
    _addStaticMenuItems: function() {
        this.boutonEffacerTout = new PopupMenu.PopupMenuItem("🗑️ Vider tout l'historique")
        this.boutonEffacerTout.connect('activate', () => {
            this._clearHistorique();
            Main.notify("Historique vidé et presse-papiers effacé !");
        });
        this.menu.addMenuItem(this.boutonEffacerTout);

        this._updateDebugButton();

        // Séparation des boutons du menu avec autres commandes due mnu
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    },

    _createMenuItem: function(label, callback) {
        let item = new PopupMenu.PopupMenuItem(label);
        item.connect('activate', callback);
        return item;
    },

    _reloadHistorique: function() {
        this.sectionHistorique.removeAll();
        this.menuItems = [];
        this.historiquePressePapiers.forEach(contenu => {
            let item = this._createClipboardMenuItem(contenu);
            this.sectionHistorique.addMenuItem(item);
            this.menuItems.unshift(item); // unshift au lieu de push pour être raccord avec historiquePressePapiers (qui garde le tableau "à l'envers")
        });
    },

    _createClipboardMenuItem(contenu) {
        let contenuAffiche = contenu.length > MAX_TAILLE_CONTENU
            ? contenu.substring(0, MAX_TAILLE_CONTENU - 3) + "..."
            : contenu;
        let item = new PopupMenu.PopupMenuItem(contenuAffiche);
        item.connect('activate', () => {
            this._copyToClipboard(contenu);
            Main.notify(`"${contenuAffiche}" copié dans le presse-papiers.`);
        });
        return item;
    },

    _updateDebugButton: function() {
        if (this.boutonDebogage) {
            this.menu.removeMenuItem(this.boutonDebogage);
            this.boutonDebogage = null;
        }
        if(this._preferences.debug_mode){
            this.boutonDebogage = new PopupMenu.PopupMenuItem("⚙ Débogage")
            this.boutonDebogage.connect('activate', () => {
                this._showDebugInfo();
                Main.notify("Alt+F2, lg pour voir les logs des applets.");
            });
            this.menu.addMenuItem(this.boutonDebogage, 1); // 1 = position
        }
    },

    // *****************************
    // ** GESTION DE L'HISTORIQUE **
    // *****************************
    _clearHistorique: function() {
        this._logDebug("Le presse-papiers a été vidé.");
        this.historiquePressePapiers = [];
        this._reloadHistorique();
        this._copyToClipboard(""); // on vide le presse-papiers au passage
    },

    _addToHistorique: function(contenu) {
        try {
            if(this.historiquePressePapiers.length >= this._preferences.clipboard_history_limit) {
                this.historiquePressePapiers.pop();
            }
            this.historiquePressePapiers.unshift(contenu);
            this._reloadHistorique();
        } catch(ex) {
            global.logError(`Une erreur est survenue lors de l'ajout du contenu à l'historique du presse-papiers : ${ex}`);
        }
    },

    _moveToTopHistorique: function(contenu) {
        // Cette fonction a pour but de faire passer l'élément sélectionner pour être copié en tête de la liste.
        // D'abord on supprime l'occurrence existante, on la réinsère en haut de la liste, puis on recharge l'historique.
        this.historiquePressePapiers = this.historiquePressePapiers.filter(c => c !== contenu);
        this.historiquePressePapiers.unshift(contenu);
        this._reloadHistorique();
    },

    _handleClipboardContent: function(contenu) {
        if(!contenu || contenu.trim() === "") return;
        if(this.historiquePressePapiers.includes(contenu)) {
            this._moveToTopHistorique(contenu);
        } else {
            this._addToHistorique(contenu);
        }
    },

    // ******************
    // ** SURVEILLANCE **
    // ******************
    _startClipboardWatcher: function() {
        let dernierContenu = "";
        const verifierPressePapiers = () => {
            let pressePapiers = St.Clipboard.get_default();
            pressePapiers.get_text(St.ClipboardType.CLIPBOARD, (clip, contenu) => {
                if(contenu && contenu !== dernierContenu) {
                    this._logDebug(`Nouveau contenu détecté : ${contenu}`);
                    dernierContenu = contenu;
                    this._handleClipboardContent(contenu);
                } else {
                    this._logDebug(`Le contenu du presse-papiers n'a pas changé depuis ces ${this._preferences.poll_interval} dernières secondes.`);
                }
            });
            return true; // sans ça la boucle ne boucle pas
        }
        this._logDebug("Démarrage de la surveillance du presse-papiers.");
        this._timeoutId = Mainloop.timeout_add_seconds(this._preferences.poll_interval, verifierPressePapiers);
    },

    _restartClipboardWatcher: function() {
        if (this._timeoutId) {
            Mainloop.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        this._startClipboardWatcher();
    },

    _copyToClipboard: function(contenu) {
        let pressePapiers = St.Clipboard.get_default();
        pressePapiers.set_text(St.ClipboardType.CLIPBOARD, contenu);
    },
    
    // **************
    // ** DÉBOGAGE **
    // **************
    _showDebugInfo: function() {
        global.log("===== ⚙ Mode débogage ⚙ =====");
        global.log(`[PARAMS] Débogage activé : ${this._preferences.debug_mode}`);
        global.log(`[PARAMS] Limite de l'historique : ${this._preferences.clipboard_history_limit} éléments max.`);
        global.log(`[PARAMS] Fréquence de vérification du presse-papiers : ${this._preferences.poll_interval} secondes`);
        global.log(`[PARAMS] Raccourci clavier pour ouvrir l'applet : ${this._preferences.open_applet_shortcut}`);
        global.log(`[HISTORIQUE] Nombre d'éléments dans l'historique : ${this.historiquePressePapiers.length}`);
        global.log(`[HISTORIQUE] Nombre d'éléments affichés : ${this.menuItems.length}`);
        global.log("==============================");
    },

    _logDebug: function(msg){
        if (this._preferences.debug_mode) global.log(`[DEBUG] ${msg}`);
    }
};

function main(metadata, orientation, panelHeight, instanceId) {
    return new HistoriquePressePapiers(metadata, orientation, panelHeight, instanceId);
}
