[English Version] | [Version Française](#historique-du-presse-papiers)

# Clipboard History

**Clipboard History** is an applet for the Cinnamon desktop environment. It allows you to view, manage and reuse the most recent items copied to your clipboard.

## Requirements

- **Cinnamon environment** (Linux Mint or any compatible distribution)
- **Python 3** used only for installation

## Installation

1. **Clone or download this repository** into a directory of your choice.

2. Open a terminal in that directory and run :
```bash
python3 install_applet.py
```
>⚠️ Make sure Python 3 is installed on your system (`python3 --version`)

3. **Restart Cinnamon** by pressing `Alt + F2`, typing `r`, then hitting Enter.

4. **Add the applet to your panel** via the applet menu (righ-click on the panel => Applets => Add)

# Usage
- **Click the applet icon** to open the menu.
- **Select an item** from the list to copy it back to the clipboard.
- **Clear** the history using the dedicated button.
- **Enable debug mode** to see logs via `Alt + F2`, then type `lg`.
- **Configure a keyboard shortcut** for quicker access.

# Available Settings
- **Enable debug mode**: Shows log information in the system journal.
- **Maximum number of item stored**: Defines the clipboard history size.
- **Clipboard check interval** (in seconds): Sets how often the clipboard is monitored.
- **Open clipboard history**: Configure a custom keyboard shortcut to open the applet.

# Limitations
- A short check interval may slightly affect system performance.
- History is cleared each time Cinnamon restarts (no persistence).
- Only plain text is supported (no images or files).

# Author
- [Axel GALLIC (alias Axaul)](https://github.com/GALLIC-A)

# Licence

This project is licensed under the MIT License. All code, including past commits, is now covered by this license. See the [LICENCE](https://github.com/GALLIC-A/HistoriquePressePapiersPourCinnamon/blob/main/LICENCE) file for more details.

---

[Version Française] | [English Version](#clipboard-history)

# Historique du presse-papiers
**Historique du presse-papiers** est un applet développé pour Cinnamon et permet de consulter et réutiliser les derniers éléments copiés dans votre presse-papiers.

## Prérequis
- **Environnement Cinnamon** (Linux Mint ou toute autre distribution compatible)
- **Python 3** pour l'installation de l'applet uniquement

## Installation

1. **Télécharger ou cloner ce dépôt Git** dans un répertoire de votre choix.

2. Ouvrez un terminal, placez-vous dans le répertoire où vous avez téléchargé/cloné le dépôt, puis exécutez la commande suivante :
```bash
python3 install_applet.py
```
>⚠️ Assurez-vous que Python 3 est installé sur votre système (`python3 --version`)

3. **Redémarrer Cinnamon** en appuyant sur `Alt + F2`, en tapant `r` puis en validant.

4. **Ajouter l'applet** à votre panneau via le menu (clic droit sur la barre des tâches => Applets => Ajouter).

# Utilisation
- **Cliquez sur l'icône** de l'applet pour ouvrir le menu.
- **Sélectionnez un élément** pour le copier à nouveau dans votre presse-papiers.
- **Videz l'historique** avec le bouton prévu à cet effet.
- **Activez le mode de débogage** pour voir les journaux via `Alt + F2`, puis `lg`.
- **Configurez un raccourci clavier** pour accéder plus rapidement à l'applet.

# Paramètres
- **Activer le mode de débogage** : Affiche les informations de log dans les journaux système.
- **Nombre maximal d'éléments enregistrés** : Définit la taille maximale de l'historique.
- **Intervalle de vérification du presse-papiers** (en secondes) : Ajuste la fréquence de surveillance.
- **Ouvrir l'historique du presse-papiers** : Permet de configurer un raccourci clavier pour ouvrir l'applet.

# Limitations
- Une fréquence de vérification trop élevée du presse-papiers peut impacter légèrement les performances.
- L'historique est réinitialisé après un redémarrage de Cinnamon.
- Seuls les contenus texte sont gérés.

# Auteur
- [Axel GALLIC (alias Axaul)](https://github.com/GALLIC-A)

# Licence

Ce projet est sous licence MIT. Tout le code, y compris les commits passés, est maintenant couvert par cette licence. Consultez le fichier [LICENCE](https://github.com/GALLIC-A/HistoriquePressePapiersPourCinnamon/blob/main/LICENCE) pour plus de détails.
