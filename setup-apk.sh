#!/bin/bash

# 3D Poser Mobile - APK Setup Script
# This script automates the setup process for building an Android APK

set -e

echo "🚀 3D Poser Mobile - APK Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

echo "✓ pnpm detected: $(pnpm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✓ Dependencies installed"
echo ""

# Build the web app
echo "🔨 Building web app..."
pnpm build
echo "✓ Web app built successfully"
echo ""

# Install Capacitor if not already installed
if [ ! -d "node_modules/@capacitor/core" ]; then
    echo "📥 Installing Capacitor..."
    pnpm add -D @capacitor/core @capacitor/cli @capacitor/android
    echo "✓ Capacitor installed"
    echo ""
fi

# Check if Android platform exists
if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    pnpm exec cap add android
    echo "✓ Android platform added"
    echo ""
fi

# Sync files to Android
echo "🔄 Syncing files to Android project..."
pnpm exec cap sync android
echo "✓ Files synced"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Install Android Studio: https://developer.android.com/studio"
echo "2. Open the Android project:"
echo "   pnpm exec cap open android"
echo "3. Build the APK in Android Studio:"
echo "   Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo ""
echo "For detailed instructions, see: APK_PACKAGING_GUIDE.md"
echo ""
