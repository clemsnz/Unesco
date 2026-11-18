#!/usr/bin/env bash
# Regénère toute la campagne depuis campaign.json. Prérequis : python3 (pillow, python-docx, python-pptx, openpyxl, pypdf, qrcode), node + playwright, ffmpeg, libreoffice.
# Pour activer les QR : renseigner "registration_url" dans campaign.json puis lancer :  python3 make_qr.py
set -e; cd "$(dirname "$0")"
python3 build_visuals.py && node render.js
python3 reel.py
python3 build_visuals.py && node render.js 09_          # storyboard (utilise les plans du Reel)
python3 build_docs.py "${1:-}"                          # 1er argument facultatif : PDF original du dossier, pour l'aperçu intégré
python3 build_slides.py && python3 build_pilotage.py
