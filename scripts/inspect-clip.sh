#!/usr/bin/env bash
# Quality control for one generated clip.
# Usage: bash scripts/inspect-clip.sh media/video/clip-a.mp4
# Outputs (production/inspect/<name>/): contact sheet at 2 fps, scene-cut log,
# first/last frames, and a zoomed sheet of the final 3 seconds.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/ff.sh
CLIP=$1; NAME=$(basename "${CLIP%.*}"); OUT=production/inspect/$NAME
mkdir -p "$OUT"
DUR=$({ "$FFMPEG" -i "$CLIP" 2>&1 || true; } | grep -oE 'Duration: [0-9:.]+' | awk -F'[: ]' '{print $3*3600+$4*60+$5}')
echo "$NAME — durée ${DUR}s"
"$FFMPEG" -v error -y -i "$CLIP" -vf "fps=2,scale=384:-2,tile=6x6:padding=4:color=black" -frames:v 1 "$OUT/contact-2fps.jpg"
"$FFMPEG" -v error -y -i "$CLIP" -vf "fps=1,scale=480:-2,tile=5x4:padding=4" -frames:v 1 "$OUT/contact-1fps.jpg"
"$FFMPEG" -v error -y -i "$CLIP" -frames:v 1 "$OUT/first.png"
"$FFMPEG" -v error -y -sseof -0.05 -i "$CLIP" -update 1 -frames:v 1 "$OUT/last.png"
"$FFMPEG" -v error -y -sseof -3 -i "$CLIP" -vf "fps=4,scale=640:-2,tile=4x3:padding=4" -frames:v 1 "$OUT/tail-3s.jpg"
"$FFMPEG" -hide_banner -i "$CLIP" -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -oE 'pts_time:[0-9.]+' > "$OUT/cuts.txt" || true
if [ -s "$OUT/cuts.txt" ]; then echo "⚠ coupes possibles :"; cat "$OUT/cuts.txt"; else echo "✓ aucune coupe détectée (seuil 0.3)"; fi
echo "→ $OUT"
