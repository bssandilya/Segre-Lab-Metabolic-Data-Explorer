#!/usr/bin/bash

# install comets and cobra
pip3 install --user cobra
pip3 install --user cometspy

# === CONFIG ===
PYTHON_VERSION="3.12"  # Adjust if needed
COMETSPY_DIR="$HOME/.local/lib/python${PYTHON_VERSION}/site-packages/cometspy"
TARGET_FILE="${COMETSPY_DIR}/comets.py"

# === CHECK FILE EXISTS ===
if [[ ! -f "$TARGET_FILE" ]]; then
    echo "❌ Error: comets.py not found at $TARGET_FILE"
    exit 1
fi

# === BACKUP ORIGINAL ===
cp "$TARGET_FILE" "${TARGET_FILE}.bak"
echo "Backup created at ${TARGET_FILE}.bak"

# === COMMENT THE CORRECT LINE RANGES ===
echo "🔧 Commenting Gurobi environment block (lines 125–141)..."
sed -i '125,141s/^/# /' "$TARGET_FILE"

echo "🔧 Commenting Gurobi classpath addition (lines 172–173)..."
sed -i '172,173s/^/# /' "$TARGET_FILE"

echo "🔧 Commenting Gurobi Java missing class handling (lines 552–566)..."
sed -i '552,566s/^/# /' "$TARGET_FILE"

echo "Preview of patched lines:"
echo "----- Line 130 -----"
sed -n '130p' "$TARGET_FILE"
echo "----- Line 172 -----"
sed -n '172p' "$TARGET_FILE"
echo "----- Line 552 -----"
sed -n '552p' "$TARGET_FILE"
echo "---------------------"







