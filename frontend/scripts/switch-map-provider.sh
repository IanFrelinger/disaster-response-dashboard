#!/bin/bash

# Script to switch between map providers for different testing scenarios

echo "Map Provider Configuration Script"
echo "================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from config.env.example..."
    cp config.env.example .env
fi

# Function to show current configuration
show_current_config() {
    echo ""
    echo "Current Configuration:"
    echo "----------------------"
    
    if [ -f .env ]; then
        if grep -q "VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token-here" .env; then
            echo "Mapbox Token: Not set (using FakeMapProvider)"
        else
            echo "Mapbox Token: Set (using MapboxProvider)"
        fi
        
        if grep -q "VITE_FORCE_FAKE_MAP=true" .env; then
            echo "Force Fake Map: Enabled"
        else
            echo "Force Fake Map: Disabled"
        fi
    else
        echo "No .env file found"
    fi
}

# Function to enable real Mapbox
enable_real_mapbox() {
    echo ""
    echo "To enable real Mapbox:"
    echo "1. Edit .env file"
    echo "2. Replace 'your-mapbox-access-token-here' with your actual Mapbox token"
    echo "3. Remove or comment out 'VITE_FORCE_FAKE_MAP=true' if present"
    echo ""
    echo "Example:"
    echo "VITE_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here"
    echo "# VITE_FORCE_FAKE_MAP=true"
}

# Function to enable fake map
enable_fake_map() {
    echo ""
    echo "Enabling FakeMapProvider..."
    
    # Set placeholder token
    sed -i.bak 's/VITE_MAPBOX_ACCESS_TOKEN=.*/VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token-here/' .env
    
    # Enable force fake map
    if ! grep -q "VITE_FORCE_FAKE_MAP=true" .env; then
        echo "VITE_FORCE_FAKE_MAP=true" >> .env
    fi
    
    echo "FakeMapProvider enabled!"
    echo "This will use FakeMapProvider for all tests and development"
}

# Function to show usage
show_usage() {
    echo ""
    echo "Usage:"
    echo "  $0 show          - Show current configuration"
    echo "  $0 fake          - Enable FakeMapProvider"
    echo "  $0 real          - Show instructions to enable real Mapbox"
    echo "  $0 help          - Show this help message"
}

# Main script logic
case "${1:-show}" in
    "show")
        show_current_config
        ;;
    "fake")
        enable_fake_map
        show_current_config
        ;;
    "real")
        enable_real_mapbox
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac

echo ""
echo "Note: After changing configuration, restart your development server"
echo "      and re-run tests for changes to take effect."
