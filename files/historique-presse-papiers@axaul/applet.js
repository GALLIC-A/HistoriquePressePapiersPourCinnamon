const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const UUID = "historique-presse-papiers@axaul";
const AppletDir = imports.ui.appletManager.appletMeta[UUID].path;
const Settings = imports.ui.settings;

// Variables paramétrables
const ENABLE_DEBUG = true;
const LIMITE_NOMBRE_ELEMENTS_DANS_HISTORIQUE = 15;
const INTERVALE_VERIFICATION_PRESSE_PAPIERS_EN_SECONDES = 5;

// Variables fixes
const MAX_TAILLE_CONTENU = 100;

function HistoriquePressePapiers(metadata, orientation, panelHeight, instanceId) {
    this._init(metadata, orientation, panelHeight, instanceId);
}

HistoriquePressePapiers.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(metadata, orientation, panelHeight, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);

        this._preferences = {};

        this.set_applet_icon_path(AppletDir + '/icon.png');
        this.set_applet_tooltip("Ouvrir l'historique du presse-papiers");

        // chargement des paramètres
        this.settings = new Settings.AppletSettings(this._preferences, UUID, instanceId);

        // liaison des propriétés aux préférences this._preferences.propriete
        this.settings.bindProperty(
            Settings.BindingDirection.IN,
            "debug_mode", // Clé du settings-schema.json
            "debug_mode", // Propriété de _preferences
            this.on_settings_changed.bind(this), // callback
            null
        );

        // Utilise la valeur initiale
        this._updateDebug();

        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        // Création du bouton "effacer tout"
        this.boutonEffacerTout = new PopupMenu.PopupMenuItem("🗑️ Vider tout l'historique");
        this.boutonEffacerTout.connect('activate', () => {
            this.effacerHistorique();
            Main.notify("Historique vidé !");
        });

        // [DEV] Création du bouton de débogage
        this.boutonDebogage = new PopupMenu.PopupMenuItem("⚙ Débogage");
        this.boutonDebogage.connect('activate', () => {
            this.afficherDebogage();
            Main.notify("Alt+F2, lg pour voir les logs des applets.");
        });

        // Ajout des boutons au menu
        this.menu.addMenuItem(this.boutonEffacerTout);
        if(this._preferences.debug_mode){
            this.menu.addMenuItem(this.boutonDebogage);
        }

        // Séparation des boutons du menu avec autres commandes due mnu
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Section dynamique (contenant l'historique du presse-papiers)
        this.sectionHistorique = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this.sectionHistorique);

        // init
        this.historiquePressePapiers = [];
        this.menuItems = [];

        this.rechargerHistorique();
        this.demarrerSurveillancePressePapiers();
    },

    on_applet_clicked: function() {
        this.menu.toggle();
    },

    on_settings_changed: function() {
        this._updateDebug()
    },

    _updateDebug: function() {
        // On utilise la valeur dynamique
        if(this._preferences.debug_mode){
            global.log(`Débogage activé (${this._preferences.debug_mode})`);
        } else 
        {
            global.log(`Débogage désactivé (${this._preferences.debug_mode})`);
        }
    },

    rechargerHistorique: function() {
        // On nettoie la section d'historique UNIQUEMENT !
        this.sectionHistorique.removeAll();

        // Puis on ajoute les éléments
        this.menuItems = [];

        this.historiquePressePapiers.forEach(contenu => {
            let item = this.creerBoutonContenuPressePapiers(contenu);
            this.sectionHistorique.addMenuItem(item);
            this.menuItems.unshift(item); // unshift au lieu de push pour être raccord avec historiquePressePapiers (qui garde le tableau "à l'envers")
        });
    },

    effacerHistorique: function() {
        if(this._preferences.debug_mode){
            global.log("Le presse-papiers a été vidé.");
        }

        // Reset des données puis rafraîchissement de l'ihm
        this.historiquePressePapiers = [];
        this.rechargerHistorique();
    },

    afficherDebogage: function() {
        global.log("===== ⚙ Informations de débogage ⚙ =====");
        global.log(`Nombre d'éléments contenus dans le presse-papiers : ${this.historiquePressePapiers.length}`);
        global.log(`Nombre d'éléments affichés dans le menu : ${this.menuItems.length}`);
        global.log("=========================================");
    },

    ajouterContenuAHistoriqueDuPressePapiers: function(contenu) {
        try {
            // on vérifie la taille de l'historique, si elle est dépassée avec le nouvel ajout, on supprime le plus ancien élément
            if(this.historiquePressePapiers.length >= LIMITE_NOMBRE_ELEMENTS_DANS_HISTORIQUE) {
                this.historiquePressePapiers.shift();
            }

            // on stocke le contenu complet dans l'historique
            this.historiquePressePapiers.unshift(contenu);
            
            this.creerBoutonContenuPressePapiers(contenu);
            
            this.rechargerHistorique();
        } catch(ex) {
            global.logError(`Une erreur est survenue lors de l'ajout du contenu à l'historique du presse-papiers : ${ex}`);
        }
    },

    actualiserContenuDeLHistorique: function(contenu) {
        // Cette fonction a pour but de faire passer l'élément sélectionner pour être copié en tête de la liste.
        // D'abord on supprime l'occurrence existante, on la réinsère en haut de la liste, puis on recharge l'historique.
        this.historiquePressePapiers = this.historiquePressePapiers.filter(c => c !== contenu);
        this.historiquePressePapiers.unshift(contenu);
        this.rechargerHistorique();
    },

    gererContenu: function(contenu) {
        if(! (contenu === null || contenu.trim() === "") ) {
            if(this.historiquePressePapiers.includes(contenu)) {
                this.actualiserContenuDeLHistorique(contenu);
            } else {
                this.ajouterContenuAHistoriqueDuPressePapiers(contenu);
            }
        }
    },

    demarrerSurveillancePressePapiers: function() {
        let dernierContenu = "";
    
        const verifierPressePapiers = () => {
            let pressePapiers = St.Clipboard.get_default();
            pressePapiers.get_text(St.ClipboardType.CLIPBOARD, (clip, contenu) => {
                if(contenu && contenu !== dernierContenu) {
                    if(this._preferences.debug_mode){
                        global.log(`Nouveau contenu détecté dans le presse-papiers : "${contenu}"`);
                    }
                    dernierContenu = contenu;
                    this.gererContenu(contenu);
                } else {
                    if(this._preferences.debug_mode){
                        global.log(`Le contenu du presse-papiers n'a pas changé depuis ces 5 dernières secondes.`);
                    }
                }
            });
            return true; // sans ça la boucle ne boucle pas
        }
    
        if(this._preferences.debug_mode){
            global.log("Démarrage de la boucle de surveillance du presse-papiers.");
        }
        Mainloop.timeout_add_seconds(INTERVALE_VERIFICATION_PRESSE_PAPIERS_EN_SECONDES, verifierPressePapiers);
    },

    copierDansPressePapiers: function(contenu) {
        let pressePapiers = St.Clipboard.get_default();
        pressePapiers.set_text(St.ClipboardType.CLIPBOARD, contenu);
    },

    creerBoutonContenuPressePapiers: function(contenu) {
        let contenuAffiche = contenu;
        if(contenu.length > MAX_TAILLE_CONTENU) {
            contenuAffiche = contenu.substring(0, MAX_TAILLE_CONTENU - 3) + "...";
        }

        let item = new PopupMenu.PopupMenuItem(contenuAffiche);
        item.connect('activate', () => {
            this.copierDansPressePapiers(contenu);
            Main.notify(`"${contenuAffiche}" copié dans le presse-papiers.`);
        });

        return item;
    },
};

// ********* MAIN **********

function main(metadata, orientation, panelHeight, instanceId) {
    return new HistoriquePressePapiers(metadata, orientation, panelHeight, instanceId);
}
