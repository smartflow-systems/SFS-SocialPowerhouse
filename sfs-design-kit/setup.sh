#!/bin/bash

# SFS Design Kit - One-Click Setup Script
# Run this in your new app's root directory to instantly copy the design system

set -e

echo "🎨 SFS Design Kit Setup"
echo "======================"

# Check if design kit folder exists
if [ ! -d "sfs-design-kit" ]; then
    echo "❌ Error: sfs-design-kit folder not found in current directory"
    echo "Make sure you've copied the sfs-design-kit folder here first"
    exit 1
fi

echo "✓ Design kit found"
echo ""

# Create directories if they don't exist
mkdir -p client/src/components
mkdir -p client/src

echo "📁 Creating directories..."

# Copy CSS
echo "📋 Copying theme CSS..."
cp sfs-design-kit/styles/sfs-theme.css client/src/index.css
echo "  ✓ client/src/index.css"

# Copy components
echo "🧩 Copying components..."
cp sfs-design-kit/components/SFSHamburgerMenu.tsx client/src/components/
echo "  ✓ SFSHamburgerMenu.tsx"

cp sfs-design-kit/components/GlassCard.tsx client/src/components/
echo "  ✓ GlassCard.tsx"

cp sfs-design-kit/components/GoldenButton.tsx client/src/components/
echo "  ✓ GoldenButton.tsx"

cp sfs-design-kit/components/SFSNavigation.tsx client/src/components/
echo "  ✓ SFSNavigation.tsx"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Import components in your app:"
echo "   import SFSHamburgerMenu from '@/components/SFSHamburgerMenu';"
echo ""
echo "2. Create your menu items:"
echo "   const menuItems = ["
echo "     { label: 'Dashboard', href: '/dashboard' },"
echo "     { label: 'Settings', href: '/settings' },"
echo "   ];"
echo ""
echo "3. Use in your layout:"
echo "   <SFSHamburgerMenu menuItems={menuItems} appName='Your App Name' />"
echo ""
echo "See sfs-design-kit/SETUP-GUIDE.md for full documentation"
