#!/usr/bin/env bash
# Extracts the browser frame sequence from the stitched master.
# Usage: bash scripts/make-frames.sh media/video/flythrough-master.mp4 [fps=20] [quality=78]
# Writes media/frames/{1440,960}/frame-%04d.webp, poster.webp and manifest.json
# into a fresh staging directory, then swaps it in.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/ff.sh
MASTER=${1:-media/video/flythrough-master.mp4}
FPS=${2:-20}
Q=${3:-78}
OUT=${OUT:-media/frames}
mkdir -p "$(dirname "$OUT")"
STAGE="$(mktemp -d "$(dirname "$OUT")/.frames-staging.XXXX")"
trap 'rm -rf "$STAGE"' ERR
[ -f "$MASTER" ] || { echo "Master introuvable : $MASTER" >&2; exit 1; }

for W in 1440 960; do
  mkdir -p "$STAGE/$W"
  "$FFMPEG" -v error -i "$MASTER" -an -vf "fps=$FPS,scale=$W:-2:flags=lanczos" \
    -c:v libwebp -quality "$Q" -compression_level 5 -start_number 0 "$STAGE/$W/frame-%04d.webp"
done
cp "$STAGE/1440/frame-0000.webp" "$STAGE/poster.webp"

COUNT=$(ls "$STAGE/1440" | wc -l | tr -d ' ')
COUNT_SMALL=$(ls "$STAGE/960" | wc -l | tr -d ' ')
[ "$COUNT" = "$COUNT_SMALL" ] || { echo "Nombre d'images différent entre tailles ($COUNT / $COUNT_SMALL)" >&2; exit 1; }
dims() { { "$FFMPEG" -i "$1" 2>&1 || true; } | grep -oE "[0-9]{3,4}x[0-9]{3,4}" | head -1; }
DIMS=$(dims "$STAGE/1440/frame-0000.webp")
H1440=${DIMS##*x}
DIMS_S=$(dims "$STAGE/960/frame-0000.webp")
H960=${DIMS_S##*x}
VERSION=$(date +%Y%m%d%H%M)
SIZE=$(du -sk "$STAGE/1440" | cut -f1)
SIZE_S=$(du -sk "$STAGE/960" | cut -f1)
cat > "$STAGE/manifest.json" <<JSON
{
  "version": "$VERSION",
  "fps": $FPS,
  "count": $COUNT,
  "duration": $(awk "BEGIN{printf \"%.2f\", $COUNT/$FPS}"),
  "width": 1440,
  "height": $H1440,
  "pattern": "frame-%04d.webp",
  "startNumber": 0,
  "poster": "poster.webp",
  "source": "$(basename "$MASTER")",
  "sources": [
    { "dir": "960", "width": 960, "height": $H960, "totalKB": $SIZE_S },
    { "dir": "1440", "width": 1440, "height": $H1440, "totalKB": $SIZE }
  ]
}
JSON
rm -rf "$OUT.old"; [ -d "$OUT" ] && mv "$OUT" "$OUT.old"
mkdir -p "$(dirname "$OUT")"; mv "$STAGE" "$OUT"; rm -rf "$OUT.old"
chmod -R a+rX "$OUT"
echo "Frames : $COUNT @ ${FPS} fps — 1440 : ${SIZE} KB, 960 : ${SIZE_S} KB → $OUT"
node scripts/check-assets.mjs "$OUT/manifest.json"
