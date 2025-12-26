# How to Build APK for TrackMyFunds

Your web app has been successfully converted to an Android project using Capacitor! 

## 🎯 Current Status
✅ Capacitor installed and configured  
✅ Android platform added  
✅ Web app built and synced to Android project  
✅ Ready to build APK  

## 📋 Prerequisites for Building APK

To build the APK, you need to install:

### 1. Java JDK 17
```bash
# Install using Homebrew
brew install openjdk@17

# Add to your PATH (add to ~/.zshrc)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
```

### 2. Android Studio
Download from: https://developer.android.com/studio

During installation, make sure to install:
- Android SDK
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android Emulator (optional, for testing)

## 🔨 Method 1: Build using Android Studio (Easiest)

1. **Open Android Studio**

2. **Open the Android project:**
   - Click "Open an Existing Project"
   - Navigate to: `/Users/pavankodange/budgetappython/budgetapppython/android`
   - Click "Open"

3. **Wait for Gradle sync** (first time may take a few minutes)

4. **Build APK:**
   - Go to menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for the build to complete
   - Click "locate" in the notification to find your APK

5. **Find your APK at:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

## 🔨 Method 2: Build using Command Line

Once Java and Android SDK are installed:

```bash
cd /Users/pavankodange/budgetappython/budgetapppython/android

# Build debug APK
./gradlew assembleDebug

# Build release APK (unsigned)
./gradlew assembleRelease
```

Your APK will be at:
- **Debug:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release:** `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 🎨 Customization (Optional)

### Change App Icon
Replace these files in `android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Change App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">TrackMyFunds</string>
```

### Change Package Name
Currently: `com.trackmyfunds.app`

To change, edit:
1. `capacitor.config.ts` - change `appId`
2. `android/app/build.gradle` - change `applicationId`
3. Rebuild the project

## 📱 Testing the APK

### Install on Physical Device:
1. Enable USB Debugging on your Android device
2. Connect via USB
3. Run: `adb install app-debug.apk`

### Install on Emulator:
1. Create an emulator in Android Studio
2. Drag and drop the APK onto the emulator

## 🔐 Creating Signed APK for Play Store

For production release, you need to sign your APK:

1. **Generate a keystore:**
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure signing in** `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("path/to/my-release-key.keystore")
            storePassword "your-store-password"
            keyAlias "my-key-alias"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. **Build signed APK:**
```bash
./gradlew assembleRelease
```

## 🚀 Next Steps After Building

1. **Test thoroughly** on multiple devices
2. **Optimize APK size** if needed
3. **Create store listings** (screenshots, description)
4. **Submit to Google Play Store**

## 📝 Notes

- The debug APK is for testing only (larger size, not optimized)
- For production, always use a signed release APK
- Current package name: `com.trackmyfunds.app`
- Current app name: `TrackMyFunds`

## 🆘 Troubleshooting

### Gradle build fails
- Make sure Java 17 is installed and in PATH
- Make sure ANDROID_HOME environment variable is set
- Try: `./gradlew clean` then rebuild

### App crashes on launch
- Check logs: `adb logcat`
- Verify Supabase credentials are correct
- Make sure all web assets are synced: `npx cap sync android`

## 📚 Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Android Developer Guide: https://developer.android.com/guide
- Google Play Console: https://play.google.com/console
