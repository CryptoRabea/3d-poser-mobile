# 3D Poser Mobile - APK Packaging Guide

This guide explains how to convert the 3D Poser web application into an Android APK (Android Package) that can be installed on mobile devices.

## Overview

The 3D Poser Mobile app is built as a **Progressive Web App (PWA)** that can be packaged as a native Android APK using several methods. This provides:

- ✅ Full offline support via service workers
- ✅ Native app experience with fullscreen mode
- ✅ Installation on home screen
- ✅ Access to device features (camera, file system, etc.)
- ✅ Automatic updates when deployed

## Method 1: Using Capacitor (Recommended)

Capacitor is the easiest way to convert your web app into a native Android APK.

### Prerequisites

- Node.js and npm/pnpm installed
- Android Studio installed (for building APK)
- Java Development Kit (JDK) 11 or higher
- Android SDK with API level 30+

### Step-by-Step Instructions

#### 1. Install Capacitor

```bash
cd /home/ubuntu/3d-poser-mobile
pnpm add -D @capacitor/core @capacitor/cli @capacitor/android
```

#### 2. Initialize Capacitor

```bash
pnpm exec cap init
```

When prompted, enter:
- App name: `3D Poser`
- App ID: `com.crg.poser3d` (or your preferred package name)
- Directory: `.` (current directory)

#### 3. Build the web app

```bash
pnpm build
```

#### 4. Add Android platform

```bash
pnpm exec cap add android
```

#### 5. Configure Android app

Edit `capacitor.config.json`:

```json
{
  "appId": "com.crg.poser3d",
  "appName": "3D Poser",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  }
}
```

#### 6. Sync files to Android project

```bash
pnpm exec cap sync android
```

#### 7. Open in Android Studio

```bash
pnpm exec cap open android
```

#### 8. Build APK in Android Studio

1. Open Android Studio
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for the build to complete
4. The APK will be located in `android/app/build/outputs/apk/debug/`

#### 9. Install on device or emulator

```bash
# Via Android Studio: Run → Run 'app'
# Or via command line:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Method 2: Using Cordova

Cordova is an older but still viable alternative to Capacitor.

### Prerequisites

- Node.js installed
- Android SDK
- Gradle

### Installation

```bash
cd /home/ubuntu/3d-poser-mobile
npm install -g cordova
cordova create . com.crg.poser3d "3D Poser"
cordova platform add android
cordova build android
```

The APK will be in `platforms/android/build/outputs/apk/`

## Method 3: Using PWA Builders (Online Tool)

For a quick APK without local setup:

1. Go to https://www.pwabuilder.com/
2. Enter your app URL: `https://3d-poser-mobile.manus.space/` (or your deployed URL)
3. Click "Start"
4. Download the Android package
5. Extract and build using Android Studio

## Method 4: Manual Wrapping with WebView

For advanced customization, you can create a native Android app that wraps the web app in a WebView.

### Basic Android Project Structure

```
android-app/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/
│   │   │   │   └── MainActivity.java
│   │   │   └── res/
│   │   │       ├── values/
│   │   │       ├── drawable/
│   │   │       └── layout/
│   │   └── build.gradle
│   └── build.gradle
└── gradle/
```

### Key Files

**AndroidManifest.xml:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.crg.poser3d">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
```

**MainActivity.java:**
```java
package com.crg.poser3d;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        
        // Enable JavaScript
        webSettings.setJavaScriptEnabled(true);
        
        // Enable local file access
        webSettings.setAllowFileAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Load your web app
        webView.loadUrl("https://your-deployed-app-url.com");
    }
}
```

## Deployment & Distribution

### Option A: Manus Hosting (Recommended)

Your app is already hosted on Manus. Users can:
1. Visit the URL in their mobile browser
2. Tap the menu button
3. Select "Install app" or "Add to Home Screen"
4. The PWA will install like a native app

### Option B: Google Play Store

To publish on Google Play:

1. **Create a Google Play Developer Account** ($25 one-time fee)
2. **Sign your APK:**
   ```bash
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
     -keystore my-release-key.jks \
     app-release.apk alias_name
   ```

3. **Optimize the APK:**
   ```bash
   zipalign -v 4 app-release.apk app-release-aligned.apk
   ```

4. **Upload to Google Play Console:**
   - Create new app
   - Fill in app details
   - Upload APK
   - Set pricing and distribution
   - Submit for review

### Option C: Direct Distribution

Share the APK directly:
- Email the APK file
- Host on a website
- Use file sharing services

Users can install via:
```bash
adb install path/to/app.apk
```

Or by enabling "Unknown Sources" in Android settings and tapping the APK file.

## Testing

### On Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_4_API_30

# Install APK
adb install app-debug.apk

# View logs
adb logcat
```

### On Physical Device

1. Enable Developer Mode (tap Build Number 7 times in About Phone)
2. Enable USB Debugging
3. Connect via USB
4. Run: `adb install app-debug.apk`

## Troubleshooting

### Issue: "File not found" when loading models

**Solution:** Ensure your app has file access permissions in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Issue: Three.js not rendering

**Solution:** Enable WebGL in WebView settings:
```java
webSettings.setDomStorageEnabled(true);
webSettings.setDatabaseEnabled(true);
```

### Issue: Touch controls not working

**Solution:** Ensure touch events are not blocked. Check `index.html` for `touch-action: none` on canvas elements.

### Issue: Large file uploads fail

**Solution:** Increase WebView file size limits in `capacitor.config.json`:
```json
{
  "server": {
    "maxSize": 100
  }
}
```

## Performance Optimization

### For Mobile Devices

1. **Reduce WebGL quality on low-end devices:**
   ```javascript
   const pixelRatio = Math.min(window.devicePixelRatio, 2);
   renderer.setPixelRatio(pixelRatio);
   ```

2. **Lazy load Three.js modules:**
   ```javascript
   const THREE = await import('three');
   ```

3. **Optimize model loading:**
   - Use DRACO compression
   - Reduce polygon count
   - Use LOD (Level of Detail)

4. **Cache assets:**
   - Service worker caching
   - LocalStorage for user data
   - IndexedDB for large datasets

## Security Considerations

1. **HTTPS Only:** Always use HTTPS for production
2. **Content Security Policy:** Add CSP headers
3. **Permissions:** Request only necessary permissions
4. **Data Privacy:** Encrypt sensitive data
5. **Code Obfuscation:** Minify and obfuscate JavaScript

## Next Steps

1. **Test the web app** on mobile browsers first
2. **Build and test APK** on emulator
3. **Test on physical devices** with various Android versions
4. **Optimize performance** based on device capabilities
5. **Publish to app stores** or distribute directly

## Resources

- [Capacitor Documentation](https://capacitorjs.com/)
- [Android Studio Guide](https://developer.android.com/studio)
- [PWA Builder](https://www.pwabuilder.com/)
- [Google Play Console](https://play.google.com/console)
- [Three.js Mobile Optimization](https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally)

## Support

For issues or questions:
- Check the browser console for errors
- Review Android logcat: `adb logcat`
- Test in Android emulator first
- Verify all permissions in AndroidManifest.xml

---

**Brand:** C.R.G Studio (Crazy Rooster Games)  
**App:** 3D Poser Mobile  
**Version:** 1.0.0  
**Last Updated:** 2026-04-04
