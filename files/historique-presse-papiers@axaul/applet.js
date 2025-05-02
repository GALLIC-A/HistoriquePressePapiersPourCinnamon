const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Main = imports.ui.main;
const AppletDir = imports.ui.appletManager.appletMeta['historique-presse-papiers@axaul'].path;

const UUID = "historique-presse-papiers@axaul";

function HistoriquePressePapiers(orientation, panelHeight, instanceId) {
    this._init(orientation, panelHeight, instanceId);
}

HistoriquePressePapiers.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation, panelHeight, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panelHeight, instanceId);

        this.set_applet_icon_path(AppletDir + '/icon.png');
        this.set_applet_tooltip("Ouvrir l'historique du presse-papiers");
    },

    on_applet_clicked: function() {
        // pour l'instant j'envoie juste une notification
        Main.notify("Hitorique du presse-papiers", "Applet cliqué.");
    }
};

function main(metadata, orientation, panelHeight, instanceId) {
    return new HistoriquePressePapiers(orientation, panelHeight, instanceId);
}