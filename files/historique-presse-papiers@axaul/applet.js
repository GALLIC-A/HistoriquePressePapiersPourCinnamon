const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Main = imports.ui.main;
const AppletDir = imports.ui.appletManager.appletMeta['historique-presse-papiers@axaul'].path;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const UUID = "historique-presse-papiers@axaul";
const NOMBRE_MAXIMAL_ELEMENTS = 15;

// ********************** //

function HistoriquePressePapiers(orientation) {
    this._init(orientation);
}

HistoriquePressePapiers.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation) {
        Applet.IconApplet.prototype._init.call(this, orientation);

        this.set_applet_icon_path(AppletDir + '/icon.png');
        this.set_applet_tooltip("Ouvrir l'historique du presse-papiers");

        // Ajout de la partie IHM
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this,orientation);
        this.menuManager.addMenu(this.menu);

        // Initialise une liste d'éléments du presse-papiers vide
        // (bon là ils ne sont pas vides, mais c'est pour les tests)
        this.historiquePressePapiers = [
            "Contenu du presse-papiers 1",
            "Contenu du presse-papiers 2",
            "Bien le bonjour"
        ];
        this.menuItems = [];

        let boutonEffacerTout = new PopupMenu.PopupMenuItem("🗑️ Vider tout l'historique");
        boutonEffacerTout.connect('activate', () => {
            Main.notify("Votre presse-papiers a été vidé !");
            this.effacerHistorique();
        });
        this.menu.addMenuItem(boutonEffacerTout);

        // Ajout d'un séparateur
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.afficherHistorique();
    },

    on_applet_clicked: function() {
        this.menu.toggle();
    },

    afficherHistorique: function() {
        this.historiquePressePapiers.forEach(contenu => {
            let item = new PopupMenu.PopupMenuItem(contenu);
            item.connect('activate', () => {
                Main.notify(`Contenu cliqué : ${contenu}`);
            });
            this.menu.addMenuItem(item);
            this.menuItems.push(item);
        });
    },

    effacerHistorique: function() {
        this.menuItems.forEach(item => {
            this.menu.removeMenuItem(item);
        });
        this.menuItems = [];
        this.historiquePressePapiers = [];
    }
};

// ********* MAIN **********

function main(metadata, orientation) {
    return new HistoriquePressePapiers(orientation);
}