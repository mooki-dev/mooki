---
title: "Configuration Hyprland complète"
date: 2025-08-02
tags: [hyprland, wayland, tiling, linux, arch, config]
author: mooki
excerpt: "Guide complet pour configurer Hyprland : gestionnaire de fenêtres tiling moderne sous Wayland avec animations fluides et configuration avancée"
category: configurations
---

# Configuration Hyprland complète

Hyprland est un gestionnaire de fenêtres tiling dynamique pour Wayland, offrant des animations fluides, une configuration flexible et des performances exceptionnelles. Ce guide couvre une installation et configuration complète.

## Installation

### Arch Linux

```bash
# Installation des paquets principaux
sudo pacman -S hyprland xdg-desktop-portal-hyprland

# Dépendances recommandées
sudo pacman -S \
    waybar \           # Barre de statut
    rofi-wayland \     # Lanceur d'applications
    dunst \            # Gestionnaire de notifications
    swww \             # Gestionnaire de wallpapers
    grim \             # Screenshots
    slurp \            # Sélection de zone
    wl-clipboard \     # Presse-papiers Wayland
    brightnessctl \    # Contrôle luminosité
    pamixer \          # Contrôle audio
    thunar \           # Gestionnaire de fichiers
    kitty              # Terminal
```

### Autres distributions

**Ubuntu/Debian**
```bash
# Ajouter les dépôts nécessaires
sudo add-apt-repository ppa:hyprland/hyprland
sudo apt update
sudo apt install hyprland
```

**Fedora**
```bash
sudo dnf install hyprland waybar rofi dunst
```

## Configuration de base

### Structure des fichiers

```bash
# Créer la structure de configuration
mkdir -p ~/.config/hypr
mkdir -p ~/.config/waybar
mkdir -p ~/.config/rofi
mkdir -p ~/.config/dunst
mkdir -p ~/.config/swww
```

### Configuration principale Hyprland

**~/.config/hypr/hyprland.conf**
```bash
# ===================
# MONITEURS
# ===================
monitor=,preferred,auto,1
# monitor=DP-1,2560x1440@144,0x0,1
# monitor=HDMI-A-1,1920x1080@60,2560x0,1

# ===================
# PROGRAMMES AU DÉMARRAGE
# ===================
exec-once = waybar
exec-once = dunst
exec-once = swww init && swww img ~/Pictures/wallpaper.jpg
exec-once = /usr/lib/polkit-kde-authentication-agent-1
exec-once = dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP

# ===================
# VARIABLES D'ENVIRONNEMENT
# ===================
env = XCURSOR_SIZE,24
env = QT_QPA_PLATFORMTHEME,qt6ct
env = QT_QPA_PLATFORM,wayland;xcb
env = GDK_BACKEND,wayland,x11
env = SDL_VIDEODRIVER,wayland
env = CLUTTER_BACKEND,wayland
env = XDG_CURRENT_DESKTOP,Hyprland
env = XDG_SESSION_TYPE,wayland
env = XDG_SESSION_DESKTOP,Hyprland

# ===================
# APPARENCE
# ===================
general {
    gaps_in = 5
    gaps_out = 10
    border_size = 2
    col.active_border = rgba(33ccffee) rgba(00ff99ee) 45deg
    col.inactive_border = rgba(595959aa)
    resize_on_border = false
    allow_tearing = false
    layout = dwindle
}

decoration {
    rounding = 10
    active_opacity = 1.0
    inactive_opacity = 0.95
    
    drop_shadow = true
    shadow_range = 4
    shadow_render_power = 3
    col.shadow = rgba(1a1a1aee)
    
    blur {
        enabled = true
        size = 8
        passes = 1
        vibrancy = 0.1696
    }
}

animations {
    enabled = true
    bezier = myBezier, 0.05, 0.9, 0.1, 1.05
    
    animation = windows, 1, 7, myBezier
    animation = windowsOut, 1, 7, default, popin 80%
    animation = border, 1, 10, default
    animation = borderangle, 1, 8, default
    animation = fade, 1, 7, default
    animation = workspaces, 1, 6, default
}

# ===================
# LAYOUT DWINDLE
# ===================
dwindle {
    pseudotile = true
    preserve_split = true
    smart_split = false
    smart_resizing = true
}

# ===================
# LAYOUT MASTER
# ===================
master {
    new_is_master = true
    orientation = left
    always_center_master = false
}

# ===================
# GESTURES
# ===================
gestures {
    workspace_swipe = true
    workspace_swipe_fingers = 3
    workspace_swipe_distance = 300
    workspace_swipe_invert = true
    workspace_swipe_min_speed_to_force = 30
    workspace_swipe_cancel_ratio = 0.5
}

# ===================
# DIVERS
# ===================
misc {
    force_default_wallpaper = 0
    disable_hyprland_logo = true
    disable_splash_rendering = true
    mouse_move_enables_dpms = true
    enable_swallow = true
    swallow_regex = ^(kitty)$
    vfr = true
}

# ===================
# RÈGLES FENÊTRES
# ===================
windowrulev2 = float,class:^(pavucontrol)$
windowrulev2 = float,class:^(blueman-manager)$
windowrulev2 = float,class:^(nm-connection-editor)$
windowrulev2 = float,class:^(thunar)$,title:^(File Operation Progress)$

# Navigateurs web
windowrulev2 = workspace 2,class:^(firefox)$
windowrulev2 = workspace 2,class:^(google-chrome)$

# IDE/Éditeurs
windowrulev2 = workspace 3,class:^(code)$
windowrulev2 = workspace 3,class:^(jetbrains-.*)$

# Communication
windowrulev2 = workspace 4,class:^(discord)$
windowrulev2 = workspace 4,class:^(slack)$

# ===================
# RACCOURCIS CLAVIER
# ===================

# Variables pour les modificateurs
$mainMod = SUPER
$shiftMod = SUPER_SHIFT
$ctrlMod = SUPER_CTRL

# Applications
bind = $mainMod, RETURN, exec, kitty
bind = $mainMod, E, exec, thunar
bind = $mainMod, R, exec, rofi -show drun
bind = $mainMod, V, exec, rofi -modi "clipboard:greenclip print" -show clipboard

# Gestion des fenêtres
bind = $mainMod, Q, killactive
bind = $shiftMod, Q, exit
bind = $mainMod, F, fullscreen
bind = $mainMod, SPACE, togglefloating
bind = $mainMod, P, pseudo # dwindle
bind = $mainMod, J, togglesplit # dwindle

# Focus sur les fenêtres
bind = $mainMod, left, movefocus, l
bind = $mainMod, right, movefocus, r
bind = $mainMod, up, movefocus, u
bind = $mainMod, down, movefocus, d

# Déplacer les fenêtres
bind = $shiftMod, left, movewindow, l
bind = $shiftMod, right, movewindow, r
bind = $shiftMod, up, movewindow, u
bind = $shiftMod, down, movewindow, d

# Workspaces
bind = $mainMod, 1, workspace, 1
bind = $mainMod, 2, workspace, 2
bind = $mainMod, 3, workspace, 3
bind = $mainMod, 4, workspace, 4
bind = $mainMod, 5, workspace, 5
bind = $mainMod, 6, workspace, 6
bind = $mainMod, 7, workspace, 7
bind = $mainMod, 8, workspace, 8
bind = $mainMod, 9, workspace, 9
bind = $mainMod, 0, workspace, 10

# Déplacer vers workspace
bind = $shiftMod, 1, movetoworkspace, 1
bind = $shiftMod, 2, movetoworkspace, 2
bind = $shiftMod, 3, movetoworkspace, 3
bind = $shiftMod, 4, movetoworkspace, 4
bind = $shiftMod, 5, movetoworkspace, 5
bind = $shiftMod, 6, movetoworkspace, 6
bind = $shiftMod, 7, movetoworkspace, 7
bind = $shiftMod, 8, movetoworkspace, 8
bind = $shiftMod, 9, movetoworkspace, 9
bind = $shiftMod, 0, movetoworkspace, 10

# Workspaces spéciaux
bind = $mainMod, S, togglespecialworkspace, magic
bind = $shiftMod, S, movetoworkspace, special:magic

# Scroll workspaces
bind = $mainMod, mouse_down, workspace, e+1
bind = $mainMod, mouse_up, workspace, e-1

# Redimensionner avec la souris
bindm = $mainMod, mouse:272, movewindow
bindm = $mainMod, mouse:273, resizewindow

# Multimédia
bind = , XF86AudioRaiseVolume, exec, pamixer -i 5
bind = , XF86AudioLowerVolume, exec, pamixer -d 5
bind = , XF86AudioMute, exec, pamixer -t
bind = , XF86AudioPlay, exec, playerctl play-pause
bind = , XF86AudioPause, exec, playerctl play-pause
bind = , XF86AudioNext, exec, playerctl next
bind = , XF86AudioPrev, exec, playerctl previous

# Luminosité
bind = , XF86MonBrightnessUp, exec, brightnessctl set +5%
bind = , XF86MonBrightnessDown, exec, brightnessctl set 5%-

# Screenshots
bind = , Print, exec, grim -g "$(slurp)" - | wl-copy
bind = $shiftMod, Print, exec, grim ~/Pictures/$(date +'screenshot_%Y-%m-%d-%H%M%S.png')

# Verrouillage
bind = $mainMod, L, exec, swaylock
```

## Configuration Waybar

**~/.config/waybar/config**
```json
{
    "layer": "top",
    "position": "top",
    "height": 30,
    "spacing": 4,
    
    "modules-left": ["hyprland/workspaces", "hyprland/mode", "hyprland/window"],
    "modules-center": ["clock"],
    "modules-right": ["idle_inhibitor", "pulseaudio", "network", "cpu", "memory", "temperature", "backlight", "battery", "tray"],

    "hyprland/workspaces": {
        "disable-scroll": true,
        "all-outputs": true,
        "format": "{icon}",
        "format-icons": {
            "1": "󰈹",
            "2": "",
            "3": "",
            "4": "󰙯",
            "5": "",
            "urgent": "",
            "focused": "",
            "default": ""
        }
    },

    "hyprland/mode": {
        "format": "<span style=\"italic\">{}</span>"
    },

    "hyprland/window": {
        "format": "{}",
        "max-length": 50
    },

    "idle_inhibitor": {
        "format": "{icon}",
        "format-icons": {
            "activated": "",
            "deactivated": ""
        }
    },

    "tray": {
        "spacing": 10
    },

    "clock": {
        "timezone": "Europe/Paris",
        "tooltip-format": "<big>{:%Y %B}</big>\n<tt><small>{calendar}</small></tt>",
        "format-alt": "{:%Y-%m-%d}"
    },

    "cpu": {
        "format": "{usage}% ",
        "tooltip": false
    },

    "memory": {
        "format": "{}% "
    },

    "temperature": {
        "critical-threshold": 80,
        "format": "{temperatureC}°C {icon}",
        "format-icons": ["", "", ""]
    },

    "backlight": {
        "format": "{percent}% {icon}",
        "format-icons": ["", "", "", "", "", "", "", "", ""]
    },

    "battery": {
        "states": {
            "warning": 30,
            "critical": 15
        },
        "format": "{capacity}% {icon}",
        "format-charging": "{capacity}% ",
        "format-plugged": "{capacity}% ",
        "format-alt": "{time} {icon}",
        "format-icons": ["", "", "", "", ""]
    },

    "network": {
        "format-wifi": "{essid} ({signalStrength}%) ",
        "format-ethernet": "{ipaddr}/{cidr} ",
        "tooltip-format": "{ifname} via {gwaddr} ",
        "format-linked": "{ifname} (No IP) ",
        "format-disconnected": "Disconnected ⚠",
        "format-alt": "{ifname}: {ipaddr}/{cidr}"
    },

    "pulseaudio": {
        "format": "{volume}% {icon} {format_source}",
        "format-bluetooth": "{volume}% {icon} {format_source}",
        "format-bluetooth-muted": " {icon} {format_source}",
        "format-muted": " {format_source}",
        "format-source": "{volume}% ",
        "format-source-muted": "",
        "format-icons": {
            "headphone": "",
            "hands-free": "",
            "headset": "",
            "phone": "",
            "portable": "",
            "car": "",
            "default": ["", "", ""]
        },
        "on-click": "pavucontrol"
    }
}
```

**~/.config/waybar/style.css**
```css
* {
    border: none;
    border-radius: 0;
    font-family: 'JetBrainsMono Nerd Font', monospace;
    font-size: 13px;
    min-height: 0;
}

window#waybar {
    background-color: rgba(43, 48, 59, 0.85);
    border-bottom: 3px solid rgba(100, 114, 125, 0.5);
    color: #ffffff;
    transition-property: background-color;
    transition-duration: .5s;
}

window#waybar.hidden {
    opacity: 0.2;
}

button {
    box-shadow: inset 0 -3px transparent;
    border: none;
    border-radius: 0;
}

button:hover {
    background: inherit;
    box-shadow: inset 0 -3px #ffffff;
}

#workspaces button {
    padding: 0 5px;
    background-color: transparent;
    color: #ffffff;
}

#workspaces button:hover {
    background: rgba(0, 0, 0, 0.2);
}

#workspaces button.focused {
    background-color: #64727D;
    box-shadow: inset 0 -3px #ffffff;
}

#workspaces button.urgent {
    background-color: #eb4d4b;
}

#mode {
    background-color: #64727D;
    border-bottom: 3px solid #ffffff;
}

#clock,
#battery,
#cpu,
#memory,
#disk,
#temperature,
#backlight,
#network,
#pulseaudio,
#custom-media,
#tray,
#mode,
#idle_inhibitor,
#mpd {
    padding: 0 10px;
    color: #ffffff;
}

#window,
#workspaces {
    margin: 0 4px;
}

.modules-left > widget:first-child > #workspaces {
    margin-left: 0;
}

.modules-right > widget:last-child > #workspaces {
    margin-right: 0;
}

#clock {
    background-color: #64727D;
}

#battery {
    background-color: #ffffff;
    color: #000000;
}

#battery.charging, #battery.plugged {
    color: #ffffff;
    background-color: #26A65B;
}

@keyframes blink {
    to {
        background-color: #ffffff;
        color: #000000;
    }
}

#battery.critical:not(.charging) {
    background-color: #f53c3c;
    color: #ffffff;
    animation-name: blink;
    animation-duration: 0.5s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: alternate;
}

label:focus {
    background-color: #000000;
}

#cpu {
    background-color: #2ecc71;
    color: #000000;
}

#memory {
    background-color: #9b59b6;
}

#disk {
    background-color: #964B00;
}

#backlight {
    background-color: #90b1b1;
}

#network {
    background-color: #2980b9;
}

#network.disconnected {
    background-color: #f53c3c;
}

#pulseaudio {
    background-color: #f1c40f;
    color: #000000;
}

#pulseaudio.muted {
    background-color: #90b1b1;
    color: #2a5c45;
}

#temperature {
    background-color: #f0932b;
}

#temperature.critical {
    background-color: #eb4d4b;
}

#tray {
    background-color: #2980b9;
}

#tray > .passive {
    -gtk-icon-effect: dim;
}

#tray > .needs-attention {
    -gtk-icon-effect: highlight;
    background-color: #eb4d4b;
}

#idle_inhibitor {
    background-color: #2d3748;
}

#idle_inhibitor.activated {
    background-color: #ecf0f1;
    color: #2d3748;
}

#mpd {
    background-color: #66cc99;
    color: #2a5c45;
}

#mpd.disconnected {
    background-color: #f53c3c;
}

#mpd.stopped {
    background-color: #90b1b1;
}

#mpd.paused {
    background-color: #51a37a;
}
```

## Configuration Rofi

**~/.config/rofi/config.rasi**
```css
configuration{
    modi: "run,drun,window";
    icon-theme: "Oranchelo";
    show-icons: true;
    terminal: "kitty";
    drun-display-format: "{icon} {name}";
    location: 0;
    disable-history: false;
    hide-scrollbar: true;
    display-drun: "   Apps ";
    display-run: "   Run ";
    display-window: " 﩯  Window";
    display-Network: " 󰤨  Network";
    sidebar-mode: true;
}

@theme "catppuccin-mocha"
```

**~/.config/rofi/catppuccin-mocha.rasi**
```css
* {
    bg-col:  #1e1e2e;
    bg-col-light: #1e1e2e;
    border-col: #1e1e2e;
    selected-col: #1e1e2e;
    blue: #89b4fa;
    fg-col: #cdd6f4;
    fg-col2: #f38ba8;
    grey: #6c7086;

    width: 600;
    font: "JetBrainsMono Nerd Font 14";
}

element-text, element-icon , mode-switcher {
    background-color: inherit;
    text-color:       inherit;
}

window {
    height: 360px;
    border: 3px;
    border-color: @border-col;
    background-color: @bg-col;
}

mainbox {
    background-color: @bg-col;
}

inputbar {
    children: [prompt,entry];
    background-color: @bg-col;
    border-radius: 5px;
    padding: 2px;
}

prompt {
    background-color: @blue;
    padding: 6px;
    text-color: @bg-col;
    border-radius: 3px;
    margin: 20px 0px 0px 20px;
}

textbox-prompt-colon {
    expand: false;
    str: ":";
}

entry {
    padding: 6px;
    margin: 20px 0px 0px 10px;
    text-color: @fg-col;
    background-color: @bg-col;
}

listview {
    border: 0px 0px 0px;
    padding: 6px 0px 0px;
    margin: 10px 0px 0px 20px;
    columns: 2;
    lines: 5;
    background-color: @bg-col;
}

element {
    padding: 5px;
    background-color: @bg-col;
    text-color: @fg-col  ;
}

element-icon {
    size: 25px;
}

element selected {
    background-color:  @selected-col ;
    text-color: @fg-col2  ;
}

mode-switcher {
    spacing: 0;
}

button {
    padding: 10px;
    background-color: @bg-col-light;
    text-color: @grey;
    vertical-align: 0.5; 
    horizontal-align: 0.5;
}

button selected {
  background-color: @bg-col;
  text-color: @blue;
}
```

## Configuration Dunst

**~/.config/dunst/dunstrc**
```ini
[global]
    monitor = 0
    follow = mouse
    width = 350
    height = 300
    origin = top-right
    offset = 10x50
    scale = 0
    notification_limit = 0

    progress_bar = true
    progress_bar_height = 10
    progress_bar_frame_width = 1
    progress_bar_min_width = 150
    progress_bar_max_width = 300

    indicate_hidden = yes
    transparency = 0
    separator_height = 2
    padding = 8
    horizontal_padding = 8
    text_icon_padding = 0
    frame_width = 3
    frame_color = "#89b4fa"
    separator_color = frame
    sort = yes

    font = JetBrainsMono Nerd Font 10
    line_height = 0
    markup = full
    format = "<b>%s</b>\n%b"
    alignment = left
    vertical_alignment = center
    show_age_threshold = 60
    ellipsize = middle
    ignore_newline = no
    stack_duplicates = true
    hide_duplicate_count = false
    show_indicators = yes

    icon_position = left
    min_icon_size = 0
    max_icon_size = 32
    icon_path = /usr/share/icons/gnome/16x16/status/:/usr/share/icons/gnome/16x16/devices/

    sticky_history = yes
    history_length = 20

    dmenu = /usr/bin/rofi -dmenu -p dunst:
    browser = /usr/bin/xdg-open
    always_run_script = true
    title = Dunst
    class = Dunst
    corner_radius = 10
    ignore_dbusclose = false

    force_xwayland = false
    force_xinerama = false
    mouse_left_click = close_current
    mouse_middle_click = do_action, close_current
    mouse_right_click = close_all

[experimental]
    per_monitor_dpi = false

[urgency_low]
    background = "#1e1e2e"
    foreground = "#cdd6f4"
    timeout = 10

[urgency_normal]
    background = "#1e1e2e"
    foreground = "#cdd6f4"
    timeout = 10

[urgency_critical]
    background = "#1e1e2e"
    foreground = "#cdd6f4"
    frame_color = "#f38ba8"
    timeout = 0
```

## Scripts utilitaires

### Script de lancement

**~/.config/hypr/scripts/startup.sh**
```bash
#!/bin/bash

# Attendre que Hyprland soit prêt
sleep 2

# Démarrer les applications en arrière-plan
pgrep -x waybar > /dev/null || waybar &
pgrep -x dunst > /dev/null || dunst &

# Configurer le wallpaper
swww init
swww img ~/Pictures/wallpaper.jpg --transition-fps 60 --transition-type wipe

# Démarrer les services système
systemctl --user start pipewire
systemctl --user start wireplumber

# Applications de démarrage
sleep 5
firefox &
code &
```

### Script de screenshots

**~/.config/hypr/scripts/screenshot.sh**
```bash
#!/bin/bash

DIR="$HOME/Pictures/Screenshots"
NAME="screenshot_$(date +%d%m%Y_%H%M%S).png"

option2="Selected area"
option3="Fullscreen (delay 3 sec)"
option4="Fullscreen (delay 10 sec)"

options="$option2\n$option3\n$option4"

choice=$(echo -e "$options" | rofi -dmenu -i -no-show-icons -l 3 -width 30 -p "Screenshot")

case $choice in
    $option2)
        mkdir -p $DIR
        grim -g "$(slurp)" $DIR/$NAME
        if [[ -f $DIR/$NAME ]]; then
            notify-send "Screenshot" "Screenshot saved to $DIR/$NAME"
            wl-copy < $DIR/$NAME
        fi
        ;;
    $option3)
        mkdir -p $DIR
        sleep 3
        grim $DIR/$NAME
        if [[ -f $DIR/$NAME ]]; then
            notify-send "Screenshot" "Screenshot saved to $DIR/$NAME"
        fi
        ;;
    $option4)
        mkdir -p $DIR
        sleep 10
        grim $DIR/$NAME
        if [[ -f $DIR/$NAME ]]; then
            notify-send "Screenshot" "Screenshot saved to $DIR/$NAME"
        fi
        ;;
esac
```

### Script d'alimentation

**~/.config/hypr/scripts/power.sh**
```bash
#!/bin/bash

option1="Lock"
option2="Logout"
option3="Reboot"
option4="Shutdown"

options="$option1\n$option2\n$option3\n$option4"

choice=$(echo -e "$options" | rofi -dmenu -i -no-show-icons -l 4 -width 20 -p "Power Options")

case $choice in
    $option1)
        swaylock
        ;;
    $option2)
        hyprctl dispatch exit
        ;;
    $option3)
        systemctl reboot
        ;;
    $option4)
        systemctl poweroff
        ;;
esac
```

## Configuration avancée

### Workspace rules

```bash
# Dans hyprland.conf
workspace = 1, monitor:DP-1, default:true
workspace = 2, monitor:DP-1
workspace = 3, monitor:DP-1
workspace = 4, monitor:HDMI-A-1
workspace = 5, monitor:HDMI-A-1

# Règles spécifiques
workspace = special:scratchpad, gapsout:50, gapsin:20, bordersize:5, border:true, shadow:false
```

### Animations personnalisées

```bash
# Animations plus fluides
bezier = overshot, 0.05, 0.9, 0.1, 1.05
bezier = smoothOut, 0.36, 0, 0.66, -0.56
bezier = smoothIn, 0.25, 1, 0.5, 1

animation = windows, 1, 5, overshot, slide
animation = windowsOut, 1, 4, smoothOut, slide
animation = windowsMove, 1, 4, overshot
animation = border, 1, 10, default
animation = fade, 1, 10, smoothIn
animation = fadeDim, 1, 10, smoothIn
animation = workspaces, 1, 6, overshot, slidevert
```

### Configuration multi-moniteurs

```bash
# Configuration spécifique pour chaque moniteur
monitor = DP-1, 2560x1440@144, 0x0, 1
monitor = HDMI-A-1, 1920x1080@60, 2560x0, 1.2

# Workspace par moniteur
wsbind = 1, DP-1
wsbind = 2, DP-1
wsbind = 3, DP-1
wsbind = 4, HDMI-A-1
wsbind = 5, HDMI-A-1

# Cursor sur le bon moniteur
cursor {
    no_hardware_cursors = false
    default_monitor = DP-1
}
```

## Thèmes et personnalisation

### Installation des polices

```bash
# Polices recommandées
sudo pacman -S \
    ttf-jetbrains-mono-nerd \
    ttf-fira-code \
    ttf-font-awesome \
    noto-fonts \
    noto-fonts-emoji
```

### Curseur

```bash
# Installation d'un curseur moderne
yay -S capitaine-cursors

# Configuration dans hyprland.conf
env = XCURSOR_THEME,capitaine-cursors
env = XCURSOR_SIZE,24
```

### GTK Theme

**~/.config/gtk-3.0/settings.ini**
```ini
[Settings]
gtk-theme-name=Adwaita-dark
gtk-icon-theme-name=Papirus-Dark
gtk-font-name=Cantarell 11
gtk-cursor-theme-name=capitaine-cursors
gtk-cursor-theme-size=24
gtk-toolbar-style=GTK_TOOLBAR_BOTH
gtk-toolbar-icon-size=GTK_ICON_SIZE_LARGE_TOOLBAR
gtk-button-images=1
gtk-menu-images=1
gtk-enable-event-sounds=1
gtk-enable-input-feedback-sounds=1
gtk-xft-antialias=1
gtk-xft-hinting=1
gtk-xft-hintstyle=hintfull
```

## Dépannage

### Performance

```bash
# Vérifier les performances
hyprctl monitors
hyprctl clients
hyprctl workspaces

# Log de debug
hyprctl keyword debug:damage_tracking 2
```

### Problèmes courants

**Applications qui ne se lancent pas**
```bash
# Vérifier les variables d'environnement
env | grep -E "(WAYLAND|XDG)"

# Forcer Wayland pour certaines apps
env QT_QPA_PLATFORM=wayland application
```

**Fractional scaling**
```bash
# Pour des écrans HiDPI
monitor=,preferred,auto,1.5
env = GDK_SCALE,1.5
env = QT_SCALE_FACTOR,1.5
```

## Ressources et documentation

### Documentation officielle
- [Hyprland Wiki](https://wiki.hyprland.org/)
- [Configuration Reference](https://wiki.hyprland.org/Configuring/Configuring-Hyprland/)
- [Waybar Documentation](https://github.com/Alexays/Waybar/wiki)

### Thèmes et dotfiles
- [Hyprland Dotfiles](https://github.com/prasanthrangan/hyprdots)
- [Catppuccin Hyprland](https://github.com/catppuccin/hyprland)

### Vidéos tutoriels
- [Hyprland Setup Guide](https://www.youtube.com/watch?v=_nyStxAI75s) par SomeOrdinaryGamers
- [Wayland Tiling WM](https://www.youtube.com/watch?v=jM6IbGNcxOE)

Hyprland offre une expérience Wayland moderne et fluide avec une personnalisation quasi-illimitée. Cette configuration de base vous donne un environnement productif et esthétique pour le développement.