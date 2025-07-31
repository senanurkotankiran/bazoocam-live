#!/bin/sh
set -e

ENV_FILE="/home/deployment/.env"
MONGO_URI=$(grep BAZOOCAM_LIVE_MONGODB_URI "$ENV_FILE" | cut -d '=' -f2-)

if [ -z "$MONGO_URI" ]; then
  echo "❌ Hata: BAZOOCAM_LIVE_MONGODB_URI $ENV_FILE içinde bulunamadı!"
  exit 1
fi

echo "✅ MONGO_URI bulundu: $MONGO_URI"

# Her zaman proje kök dizinine geç
cd "$(dirname "$0")/.."

docker build \
  --target production-target \
  --build-arg MONGODB_URI="$MONGO_URI" \
  -t bazoocam-live-app:latest .
