const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const AppletDir = imports.ui.appletManager.appletMeta['historique-presse-papiers@axaul'].path;

// Variables paramétrables
const ENABLE_DEBUG = true;
const LIMITE_NOMBRE_ELEMENTS_DANS_HISTORIQUE = 15;
const INTERVALE_VERIFICATION_PRESSE_PAPIERS_EN_SECONDES = 5;

// Variables fixes
const MAX_TAILLE_CONTENU = 100;

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
        if(ENABLE_DEBUG){
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

    ajouterContenuAHistoriqueDuPressePapiers: function(contenu) {
        try {
            // on stocke le contenu complet dans l'historique
            this.historiquePressePapiers.push(contenu);
            
            let contenuAffiche = contenu;
            if(contenu.length > MAX_TAILLE_CONTENU) {
                contenuAffiche = contenu.substring(0, MAX_TAILLE_CONTENU - 3) + "...";
            }

            let item = new PopupMenu.PopupMenuItem(contenuAffiche);
            item.connect('activate', () => {
                this.copierDansPressePapiers(contenu);
                Main.notify(`"${contenuAffiche}" copié dans le presse-papiers.`);
            });
            this.sectionHistorique.addMenuItem(item);
            this.menuItems.push(item);
            global.log(`"${contenuAffiche}" a été ajouté à l'historique du presse-papiers.`);
        } catch(ex) {
            global.log(`Une erreur est survenue lors de l'ajout du contenu à l'historique du presse-papiers : ${ex}`);
        }
    },

    verifierHistorique: function(dernierContenu, contenu) {
        // Vérifier si le contenu donné en argument
        // est déjà présent dans l'historique ou pas.
        // S'il est déjà présent, il ne faut pas l'ajouter, masi le faire remonter dans la liste pour qu'il apparaîsse de nouveau en premier, PUIS on retourne TRUE
        // Sinon s'il n'est pas déjà présent, on l'ajoute et on retourne TRUE
        // Sinon c'est que le texte est probablement null ou vide, dans ce cas on retourne simplement FALSE.
    
        // En attendant que tout ce qui est décrit juste au dessus soit mis en place,
        // je me base juste sur le "denrierContenu", qui sera retiré plus tard.
        return contenu && contenu !== dernierContenu;
    },

    demarrerSurveillancePressePapiers: function() {
        let dernierContenu = "";
    
        const verifierPressePapiers = () => {
            let pressePapiers = St.Clipboard.get_default();
            pressePapiers.get_text(St.ClipboardType.CLIPBOARD, (clip, contenu) => {
                if(this.verifierHistorique(dernierContenu, contenu)) {
                    global.log(`Nouveau contenu détecté dans le presse-papiers : "${contenu}"`);
                    dernierContenu = contenu;
                    this.ajouterContenuAHistoriqueDuPressePapiers(contenu);
                } else {
                    global.log(`Le contenu du presse-papiers n'a pas changé depuis ces 5 dernières secondes.`);
                }
            });
            return true; // sans ça la boucle ne boucle pas
        }
    
        global.log("Démarrage de la boucle de surveillance du presse-papiers.");
        Mainloop.timeout_add_seconds(INTERVALE_VERIFICATION_PRESSE_PAPIERS_EN_SECONDES, verifierPressePapiers);
    },

    copierDansPressePapiers: function(contenu) {
        let pressePapiers = St.Clipboard.get_default();
        pressePapiers.set_text(St.ClipboardType.CLIPBOARD, contenu);
    }
};

// ********* MAIN **********

function main(metadata, orientation) {
    return new HistoriquePressePapiers(orientation);
}
