#!/usr/bin/env python3
"""Crée assets/qr_inscription.png à partir de registration_url (campaign.json). Tester le QR avec un téléphone avant le BAT."""
import json, os, qrcode
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url = json.load(open(os.path.join(ROOT, "campaign.json"), encoding="utf-8")).get("registration_url")
if not url: raise SystemExit("registration_url vide dans campaign.json : QR non généré (emplacement réservé conservé).")
qrcode.make(url, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=20, border=2).save(os.path.join(ROOT, "assets", "qr_inscription.png"))
print("QR créé pour", url)
