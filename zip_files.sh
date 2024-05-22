#!/bin/bash

# Define the name of the output zip file
OUTPUT_ZIP="Note-Assistantv1..zip"

# List of files and directories to include in the zip
FILES_TO_ZIP=(
    "dist"
    ".env"
    "index.html"
    "package.json"
    "package-lock.json"
    "README.md"
    "server.js"
    "styles.css"
)

# Remove existing zip file if it exists
if [ -f "$OUTPUT_ZIP" ]; then
    rm "$OUTPUT_ZIP"
fi

# Create a new zip file with the specified files and directories
zip -r "$OUTPUT_ZIP" "${FILES_TO_ZIP[@]}"

# Print a success message
echo "Files successfully zipped into $OUTPUT_ZIP"
