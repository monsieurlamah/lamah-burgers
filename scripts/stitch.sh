#!/usr/bin/env bash
# Stitches extension segments into one master.
# Usage: bash scripts/stitch.sh out.mp4 seg1.mp4 seg2.mp4 [seg3.mp4 ...]
#   Hard concat for segments that come straight from an extension (they match).
#   Set XFADE="1,2" to use a 0.125 s crossfade at the given joins (1 = between
#   seg1 and seg2) where a repaired piece meets an original one.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/ff.sh
OUTFILE=$1; shift
NORM="scale=1920:1080:flags=lanczos,fps=24,format=yuv420p,setsar=1"
TMP=$(mktemp -d)
i=0
for s in "$@"; do i=$((i+1)); "$FFMPEG" -v error -y -i "$s" -an -vf "$NORM" -c:v libx264 -crf 14 -preset slow "$TMP/n$i.mp4"; done
if [ -z "${XFADE:-}" ]; then
  for n in $(seq 1 $i); do echo "file '$TMP/n$n.mp4'"; done > "$TMP/list.txt"
  "$FFMPEG" -v error -y -f concat -safe 0 -i "$TMP/list.txt" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUTFILE"
else
  # Build an xfade/concat chain.
  inputs=""; for n in $(seq 1 $i); do inputs="$inputs -i $TMP/n$n.mp4"; done
  dur() { { "$FFMPEG" -i "$1" 2>&1 || true; } | grep -oE 'Duration: [0-9:.]+' | awk -F'[: ]' '{print $3*3600+$4*60+$5}'; }
  filter=""; prev="[0:v]"; offset=0
  for n in $(seq 2 $i); do
    d=$(dur "$TMP/n$((n-1)).mp4"); offset=$(awk "BEGIN{print $offset+$d}")
    if echo ",$XFADE," | grep -q ",$((n-1)),"; then
      offset=$(awk "BEGIN{print $offset-0.125}")
      filter="$filter${prev}[$((n-1)):v]xfade=transition=fade:duration=0.125:offset=$offset[v$n];"
    else
      filter="$filter${prev}[$((n-1)):v]concat=n=2:v=1:a=0[v$n];"
    fi
    prev="[v$n]"
  done
  "$FFMPEG" -v error -y $inputs -filter_complex "${filter%;}" -map "$prev" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUTFILE"
fi
rm -rf "$TMP"
bash scripts/inspect-clip.sh "$OUTFILE"
