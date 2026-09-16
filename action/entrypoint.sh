#!/bin/sh
# Entrypoint for Perfectable GitHub Action

set -e

# Parse arguments
SCAN_PATH="${1:-src/}"
FORMAT="${2:-sarif}"
FAIL_ON_FINDINGS="${3:-true}"

echo "Perfectable Quality Check"
echo "======================="
echo "Scan path: $SCAN_PATH"
echo "Format: $FORMAT"
echo "Fail on findings: $FAIL_ON_FINDINGS"

# Run perfectable detect
echo "Running perfectable detect..."
perfectable detect --format="$FORMAT" "$SCAN_PATH" > /tmp/perfectable-results.$FORMAT 2>&1
EXIT_CODE=$?

# Output results
cat /tmp/perfectable-results.$FORMAT

# Handle exit codes
# 0 = clean, 2 = findings, 1 = error
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Perfectable: No findings detected"
  exit 0
elif [ $EXIT_CODE -eq 2 ]; then
  echo "⚠️ Perfectable: Findings detected"
  if [ "$FAIL_ON_FINDINGS" = "true" ]; then
    exit 1
  else
    exit 0
  fi
else
  echo "❌ Perfectable: Error running detector"
  exit 1
fi