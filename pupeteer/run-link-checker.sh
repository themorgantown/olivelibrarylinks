#!/bin/bash

# Navigate to the script directory
cd "$(dirname "$0")"

# Log the execution
echo "[$(date)] Running link checker script" >> link-checker-runs.log

# Make sure we have the latest version of the dependencies
npm ci --silent

# Execute the Node.js script
/usr/local/bin/node count-links.js >> link-checker-runs.log 2>&1