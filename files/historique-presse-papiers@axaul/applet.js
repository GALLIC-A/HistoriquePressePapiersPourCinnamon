const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const St = imports.gi.St;
const AppletDir = imports.ui.appletManager.appletMeta['historique-presse-papiers@axaul'].path;

const ENABLE_DEBUG = true;

function HistoriquePressePapiers(orientation) {
    this._init(orientation);
}

HistoriquePressePapiers.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation) {
        Applet.IconApplet.prototype._init.call(this, orientation);
        this.set_applet_icon_path(AppletDir + '/icon.png');
        this.set_applet_tooltip("Ouvrir l'historique du presse-papiers");

        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        // Historique fictif pour les tests
        this.historiquePressePapiers = ["Contenu 1", "Contenu 2", "Bonjour"];
        this.menuItems = [];

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

        // [DEV] Création du bouton "récupérer contenu actuel du presse-papiers"
        this.boutonGetClipboardContent = new PopupMenu.PopupMenuItem("Récupérer contenu actuel du presse-papiers");
        this.boutonGetClipboardContent.connect('activate', () => {
            global.log("Bouton du clipboard cliqué");
            
            let clipboard = St.Clipboard.get_default();
            clipboard.get_text(St.ClipboardType.CLIPBOARD, (clip, text) => {
                if(text){
                    global.log(`Le presse-papiers contient actuellement : "${text}"`);
                } else global.log("Le presse-papiers est vide, ou inaccessible");
            });
        });

        // Ajout des boutons au menu
        this.menu.addMenuItem(this.boutonEffacerTout);
        if(ENABLE_DEBUG){
            this.menu.addMenuItem(this.boutonDebogage);
            this.menu.addMenuItem(this.boutonGetClipboardContent);
        }

        // Séparation des boutons du menu avec autres commandes due mnu
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Section dynamique (contenant l'historique du presse-papiers)
        this.sectionHistorique = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this.sectionHistorique);

        this.rechargerHistorique();
    },

    on_applet_clicked: function() {
        this.menu.toggle();
    },

    rechargerHistorique: function() {
        // On nettoie la section d'historique UNIQUEMENT !
        this.sectionHistorique.removeAll();

        // Puis on ajoute les éléments
        this.menuItems = [];

        this.historiquePressePapiers.forEach(contenu => {
            let item = new PopupMenu.PopupMenuItem(contenu);
            item.connect('activate', () => {
                Main.notify("Contenu cliqué :", contenu);
            });
            this.sectionHistorique.addMenuItem(item);
            this.menuItems.push(item);
        });
    },

    effacerHistorique: function() {
        global.log("Le presse-papiers a été vidé.");

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
};

// ********* MAIN **********

function main(metadata, orientation) {
    return new HistoriquePressePapiers(orientation);
}
