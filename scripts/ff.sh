# Resolves an ffmpeg binary: $FFMPEG, then PATH, then ffmpeg-static (npm i -g ffmpeg-static).
if [ -n "${FFMPEG:-}" ]; then :;
elif command -v ffmpeg >/dev/null 2>&1; then FFMPEG=ffmpeg;
elif [ -x "$(npm root -g 2>/dev/null)/ffmpeg-static/ffmpeg" ]; then FFMPEG="$(npm root -g)/ffmpeg-static/ffmpeg";
else echo "ffmpeg introuvable : installez-le (brew install ffmpeg) ou npm i -g ffmpeg-static" >&2; exit 1; fi
export FFMPEG
