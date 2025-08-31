#!/bin/bash

# Image Optimization Script for STC IISER TVM Gallery
# This script creates optimized versions of images for faster loading

echo "🖼️ Starting Image Optimization for Gallery..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️ ImageMagick not found. Installing..."
    apt update && apt install -y imagemagick
fi

# Check if WebP tools are installed
if ! command -v cwebp &> /dev/null; then
    echo "⚠️ WebP tools not found. Installing..."
    apt update && apt install -y webp
fi

# Base directory for images
BASE_DIR="/workspaces/STC_IISERTVM/images/gallery/Events"

# Function to optimize images in a directory
optimize_directory() {
    local dir="$1"
    echo "📁 Processing directory: $dir"
    
    # Find all image files
    find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img; do
        if [[ -f "$img" ]]; then
            echo "🔄 Processing: $(basename "$img")"
            
            # Get file info
            filename=$(basename "$img")
            directory=$(dirname "$img")
            name="${filename%.*}"
            extension="${filename##*.}"
            
            # Create optimized versions only if they don't exist
            
            # Small version (400px width) for mobile
            small_jpg="$directory/${name}-small.jpg"
            small_webp="$directory/${name}-small.webp"
            
            if [[ ! -f "$small_jpg" ]]; then
                convert "$img" -resize 400x -quality 75 -strip "$small_jpg" 2>/dev/null
                echo "✅ Created: $(basename "$small_jpg")"
            fi
            
            if [[ ! -f "$small_webp" ]]; then
                cwebp -q 75 -resize 400 0 "$img" -o "$small_webp" 2>/dev/null
                echo "✅ Created: $(basename "$small_webp")"
            fi
            
            # Medium version (800px width) for tablets/laptops
            medium_jpg="$directory/${name}-medium.jpg"
            medium_webp="$directory/${name}-medium.webp"
            
            if [[ ! -f "$medium_jpg" ]]; then
                convert "$img" -resize 800x -quality 80 -strip "$medium_jpg" 2>/dev/null
                echo "✅ Created: $(basename "$medium_jpg")"
            fi
            
            if [[ ! -f "$medium_webp" ]]; then
                cwebp -q 80 -resize 800 0 "$img" -o "$medium_webp" 2>/dev/null
                echo "✅ Created: $(basename "$medium_webp")"
            fi
            
            # Optimize original for desktop (max 1200px width)
            optimized_jpg="$directory/${name}-large.jpg"
            optimized_webp="$directory/${name}-large.webp"
            
            if [[ ! -f "$optimized_jpg" ]]; then
                convert "$img" -resize 1200x\> -quality 85 -strip "$optimized_jpg" 2>/dev/null
                echo "✅ Created: $(basename "$optimized_jpg")"
            fi
            
            if [[ ! -f "$optimized_webp" ]]; then
                cwebp -q 85 -resize 1200 0 "$img" -o "$optimized_webp" 2>/dev/null
                echo "✅ Created: $(basename "$optimized_webp")"
            fi
        fi
    done
}

# Process all event directories
if [[ -d "$BASE_DIR" ]]; then
    # Process each event directory
    find "$BASE_DIR" -type d | while read -r event_dir; do
        if [[ -n "$(find "$event_dir" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) 2>/dev/null)" ]]; then
            optimize_directory "$event_dir"
        fi
    done
else
    echo "❌ Base directory not found: $BASE_DIR"
    echo "ℹ️ Please ensure the images directory exists"
fi

echo "✨ Image optimization completed!"
echo ""
echo "📊 Summary:"
echo "- Created small versions (400px) for mobile devices"
echo "- Created medium versions (800px) for tablets and laptops"
echo "- Created large versions (1200px) for desktop displays"
echo "- Generated WebP versions for modern browsers"
echo ""
echo "💡 Tips for optimal performance:"
echo "- Use small versions for mobile views"
echo "- Use medium versions for laptop/tablet views"
echo "- Use large versions for desktop displays"
echo "- WebP versions provide 25-35% smaller file sizes"
