#!/usr/bin/env bash
set -e

MYSQL_BIN="/opt/lampp/bin/mysql"

if [ ! -x "$MYSQL_BIN" ]; then
    MYSQL_BIN=$(which mysql || true)
fi

if [ -z "$MYSQL_BIN" ]; then
    echo "❌ Error: mysql client not found in /opt/lampp/bin/mysql or PATH."
    exit 1
fi

echo "🔍 Checking MySQL connection on 127.0.0.1:3306..."
if ! "$MYSQL_BIN" -u root -h 127.0.0.1 -P 3306 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ Error: Cannot connect to MySQL on 127.0.0.1:3306."
    exit 1
fi

echo "📦 Creating database 'nexalink_crm' if not exists..."
"$MYSQL_BIN" -u root -h 127.0.0.1 -P 3306 -e "CREATE DATABASE IF NOT EXISTS \`nexalink_crm\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "📥 Importing nexalink_crm.sql schema & seed data..."
"$MYSQL_BIN" -u root -h 127.0.0.1 -P 3306 nexalink_crm < nexalink_crm.sql

echo "👤 Importing populate_personas_and_profiles.sql..."
"$MYSQL_BIN" -u root -h 127.0.0.1 -P 3306 nexalink_crm < populate_personas_and_profiles.sql

echo "✅ Database 'nexalink_crm' imported successfully!"
