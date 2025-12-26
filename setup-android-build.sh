#!/bin/bash

echo "🚀 TrackMyFunds Android Build Environment Setup"
echo "=============================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew is installed"
fi

# Install Java JDK 17
echo ""
echo "📦 Installing Java JDK 17..."
if brew list openjdk@17 &> /dev/null; then
    echo "✅ Java JDK 17 already installed"
else
    brew install openjdk@17
    echo "✅ Java JDK 17 installed"
fi

# Set up Java environment variables
echo ""
echo "🔧 Setting up Java environment variables..."
JAVA_HOME_PATH="/opt/homebrew/opt/openjdk@17"
if [ -d "$JAVA_HOME_PATH" ]; then
    export PATH="$JAVA_HOME_PATH/bin:$PATH"
    export JAVA_HOME="$JAVA_HOME_PATH"
    
    # Add to shell profile if not already there
    SHELL_PROFILE=""
    if [ -f ~/.zshrc ]; then
        SHELL_PROFILE=~/.zshrc
    elif [ -f ~/.bash_profile ]; then
        SHELL_PROFILE=~/.bash_profile
    fi
    
    if [ ! -z "$SHELL_PROFILE" ]; then
        if ! grep -q "openjdk@17" "$SHELL_PROFILE"; then
            echo "" >> "$SHELL_PROFILE"
            echo "# Java JDK 17 for Android development" >> "$SHELL_PROFILE"
            echo "export PATH=\"$JAVA_HOME_PATH/bin:\$PATH\"" >> "$SHELL_PROFILE"
            echo "export JAVA_HOME=\"$JAVA_HOME_PATH\"" >> "$SHELL_PROFILE"
            echo "✅ Added Java to $SHELL_PROFILE"
        else
            echo "✅ Java already configured in $SHELL_PROFILE"
        fi
    fi
else
    echo "⚠️  Java installation path not found. You may need to configure manually."
fi

# Check if Android Studio is installed
echo ""
if [ -d "/Applications/Android Studio.app" ]; then
    echo "✅ Android Studio is already installed"
else
    echo "⚠️  Android Studio not found"
    echo ""
    echo "📱 Please install Android Studio manually:"
    echo "   1. Download from: https://developer.android.com/studio"
    echo "   2. Install Android Studio"
    echo "   3. During setup, install:"
    echo "      - Android SDK"
    echo "      - Android SDK Platform-Tools"
    echo "      - Android SDK Build-Tools"
    echo ""
    echo "   After installation, set ANDROID_HOME:"
    echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
fi

# Verify installations
echo ""
echo "🔍 Verifying installations..."
echo ""

if command -v java &> /dev/null; then
    echo "✅ Java installed:"
    java -version
else
    echo "❌ Java not found in PATH. Please restart your terminal."
fi

echo ""
echo "=============================================="
echo "✅ Setup script completed!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your terminal to apply environment changes"
echo "2. If you haven't already, install Android Studio from:"
echo "   https://developer.android.com/studio"
echo "3. After Android Studio installation, configure ANDROID_HOME"
echo "4. Follow the instructions in BUILD_APK_GUIDE.md"
echo ""
