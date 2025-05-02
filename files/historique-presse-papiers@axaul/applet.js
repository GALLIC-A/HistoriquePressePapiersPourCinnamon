const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Main = imports.ui.main;
const AppletDir = imports.ui.appletManager.appletMeta['historique-presse-papiers@axaul'].path;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const UUID = "historique-presse-papiers@axaul";
const NOMBRE_MAXIMAL_ELEMENTS = 15;

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
        this.menu = new Applet.AppletPopupMenu(this,orientation);
        this._applet_context_menu.addMenuItem(new PopupMenu.PopupMenuItem("Paramètres..."));

        let clearAll = new PopupMenu.PopupMenuItem("🗑️ Vider tout l'historique");
        clearAll.connect("activate", () => {
            Main.notify("Historique vidé !");
            this.clearClipboardItems();
        });
        this.menu.addMenuItem(clearAll);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.clipboardItems = [];

        // Simule l'ajout d'éléments dans le presse-papiers
        this.addClipboardEntry("Texte copié 2");
        this.addClipboardEntry("Bien le bonjour");
    },

    on_applet_clicked: function() {
        this.menu.toggle();
    },

    addClipboardEntry: function(contenu) {
        let item = new PopupMenu.PopupBaseMenuItem();
        let box = new St.BoxLayout({vertical:false});

        let labelContenu = new St.Label({text:`"${contenu}"`, x_expand: true});

        let boutonCopier = new St.Button({label: "Copier"});
        boutonCopier.connect("clicked", () => {
            St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, contenu);
            Main.notify("Copié dans le presse-papiers", contenu);
        });

        let boutonSupprimer = new St.Button({label:"Supprimer"});
        boutonSupprimer.connect("clicked", () => {
            this.menu.box.remove_child(item.actor);
            this.clipboardItems = this.clipboardItems.filter(i => i !== item);
        });

        box.add_child(labelContenu);
        box.add_child(boutonCopier);
        box.add_child(boutonSupprimer);

        item.actor.add_child(box);
        this.menu.addMenuItem(item);
        this.clipboardItems.push(item);
    },

    clearClipboardItems: function() {
        for(let item of this.clipboardItems) {
            this.menu.box.remove_child(item.actor);
        }
        this.clipboardItems = [];
    }
};

function main(metadata, orientation) {
    return new HistoriquePressePapiers(orientation);
}