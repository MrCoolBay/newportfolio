#!/usr/bin/env bash
# Régénère public/og-image.png depuis scripts/og-image.svg.
#
# Pourquoi un script maison et pas `nuxt-og-image` : ce module tire
# `chrome-launcher` et des bindings resvg/takumi natifs, soit un Chrome headless
# pour un site de cinq pages. Ici la carte est statique, `qlmanage` (fourni avec
# macOS) suffit, et l'arbre de dépendances du projet reste à zéro vulnérabilité.
#
# Astuce de rastérisation : `qlmanage` aligne l'illustration en haut d'une
# vignette carrée. Le SVG est donc une toile 1200x1200 dont le visuel occupe la
# bande centrale y=285..915 — exactement ce que récupère le recadrage centré de
# `sips` au format Open Graph 1200x630.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/scripts/og-image.svg"
OUT="$ROOT/public/og-image.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

command -v qlmanage >/dev/null || { echo "qlmanage introuvable (macOS requis)"; exit 1; }
command -v sips >/dev/null || { echo "sips introuvable (macOS requis)"; exit 1; }

cp "$SRC" "$TMP/og.svg"
qlmanage -t -s 1200 -o "$TMP" "$TMP/og.svg" >/dev/null 2>&1
sips -c 630 1200 "$TMP/og.svg.png" --out "$OUT" >/dev/null

printf 'og-image.png régénérée : %s (%s octets)\n' \
  "$(sips -g pixelWidth -g pixelHeight "$OUT" | tail -2 | tr -d ' \n')" \
  "$(wc -c < "$OUT" | tr -d ' ')"
