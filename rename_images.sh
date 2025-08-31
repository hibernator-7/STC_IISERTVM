#!/bin/bash

# Script to rename all image files in Events folder to img1, img2, etc.

BASE_DIR="/workspaces/STC_IISERTVM/images/gallery/Events"

# Function to rename images in a directory
rename_images_in_dir() {
    local dir="$1"
    local counter=1
    
    echo "Processing directory: $dir"
    
    # Find all image files in the directory (not subdirectories)
    find "$dir" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" \) | sort | while read -r file; do
        # Get the file extension
        extension="${file##*.}"
        # Convert extension to lowercase
        extension=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
        
        # Create new filename
        new_name="$(dirname "$file")/img${counter}.${extension}"
        
        # Rename the file
        if [ "$file" != "$new_name" ]; then
            echo "Renaming: $(basename "$file") -> img${counter}.${extension}"
            mv "$file" "$new_name"
        fi
        
        ((counter++))
    done
}

# Process each subfolder in Events
find "$BASE_DIR" -type d | sort | while read -r dir; do
    # Skip if it's the base directory
    if [ "$dir" = "$BASE_DIR" ]; then
        continue
    fi
    
    # Check if directory contains image files
    if find "$dir" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" \) | grep -q .; then
        rename_images_in_dir "$dir"
    fi
done

echo "Image renaming completed!"
