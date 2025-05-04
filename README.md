# Historique du presse-papiers
**Historique du presse-papiers** est un applet développé pour Cinnamon et permet de consulter et réutiliser les derniers éléments copiés dans votre presse-papiers.

## Prérequis
- **Environnement Cinnamon** (Linux Mint ou toute autre distribution compatible)
- Aucune dépendance supplémentaire n'est requise.

## Installation

1. **Télécharger ou cloner ce dépôt Git** dans un répertoire de votre choix.

2. Se placer dans le répertoire où a été téléchargé/cloné le dépôt Git, puis exécuter la commande suivante :
```bash
cp -r chemin/vers/le/projet/HistoriquePressePapiersPourCinnamon/files/historique-presse-papiers@axaul ~/.local/share/cinnamon/applets/
```
>⚠️ Remplacez chemin/vers/le/projet/historique-presse-papiers@axaul par le chemin réel du dossier cloné.

3. **Redémarrer Cinnamon** (`Alt + F2`, puis taper `r` et validez) puis ajouter l'applet via le menu des applets Cinnamon (clic doit sur la barre des tâches => Applets).

# Utilisation
- **Cliquez sur l'icône** de l'applet (située à droite dans la barre des tâches) pour ouvrir le menu.
- **Sélectionnez un élément** de l'historique pour le remettre dans votre presse-papiers.
- **Videz l'historique** avec le bouton prévu à cet effet.
- **Activez le mode de débogage** dans les paramètres pour plus d'informations (visibles dans les logs, via `Alt + F2`, puis tapez lg et validez)
- **Utilisez le raccourci clavier** configurable pour ouvrir l'applet plus aisément.

# paramètres
- **Activer le mode de débogage** : Affiche les informations de débogage dans les logs.
- **Nombre maximal d'éléments pouvant être stockés dans l'historique du presse-papiers** : Définit la quantité d'éléments stockés dans l'historique.
- **Intervalle de vérification du presse-papiers** : Définit la fréquence de surveillance du presse-papiers (en secondes)
- **Ouvrir l'historique du presse-papiers** : Permet de configurer un raccourci clavier pour ouvrir l'applet.

# Limitations
- Une fréquence de vérification du presse-papiers peut légèrement impacter les performances du système.
- L'historique est effacé à chaque redémarrage de Cinnamon (pas de persistance des données).
- Seuls les contenus texte sont gérés.

# Auteur
- [Axel GALLIC (alias Axaul)](https://github.com/GALLIC-A)

# Licence

Copyright (c) 2025 - Axel GALLIC
Ce projet est distribué sous licence MIT.