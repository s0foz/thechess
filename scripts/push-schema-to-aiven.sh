#!/bin/bash
# Push the Prisma schema to your Aiven Postgres database.
# Run this ONCE to create the User + Game tables.
#
# Usage:
#   1. Edit AIVEN_URI below to be your real Aiven connection string
#      (copy it from Aiven Console → your service → "Connection URI")
#   2. Run: bash scripts/push-schema-to-aiven.sh
#
set -e

# ─── EDIT THIS LINE: paste your Aiven Connection URI between the quotes ───
AIVEN_URI="postgres://avnadmin:YOUR_PASSWORD@your-host.aivencloud.com:PORT/defaultdb?sslmode=require"
# ──────────────────────────────────────────────────────────────────────────

if [[ "$AIVEN_URI" == *"YOUR_PASSWORD"* ]] || [[ "$AIVEN_URI" == "" ]]; then
  echo "ERROR: Edit this file and set AIVEN_URI to your real Aiven connection string."
  echo "       Get it from: Aiven Console → your service → Overview → Connection URI"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "Pushing Prisma schema to Aiven..."
echo "  Target: $(echo $AIVEN_URI | sed 's/:[^:@]*@/:****@/')"
echo ""

DATABASE_URL="$AIVEN_URI" \
DIRECT_URL="$AIVEN_URI" \
bunx prisma db push --accept-data-loss

echo ""
echo "Done! Verify by running this query in Aiven Console → SQL tab:"
echo "  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
echo "You should see: User and Game tables."
