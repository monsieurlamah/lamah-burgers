#!/usr/bin/env bash
# Synthetic TEST sequence (numbered test card) to validate scroll pacing before
# the real footage exists. Not a visual asset. Open the site with ?frames=dev
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/ff.sh
DUR=${1:-45}
mkdir -p media/dev-frames
[ -f media/dev-test-master.mp4 ] || "$FFMPEG" -v error -y -f lavfi -i "testsrc=size=1920x1080:rate=24:duration=$DUR" -pix_fmt yuv420p media/dev-test-master.mp4
OUT=media/dev-frames bash scripts/make-frames.sh media/dev-test-master.mp4 20 60
