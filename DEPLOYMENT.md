# 3D Poser Mobile - Deployment Guide

This guide covers all deployment options for the 3D Poser Mobile application.

## 📋 Table of Contents

1. [Web Deployment (Manus)](#web-deployment-manus)
2. [Android APK Deployment](#android-apk-deployment)
3. [iOS App Deployment](#ios-app-deployment)
4. [Google Play Store](#google-play-store)
5. [Direct APK Distribution](#direct-apk-distribution)
6. [Progressive Web App (PWA)](#progressive-web-app-pwa)

---

## Web Deployment (Manus)

The app is automatically deployed to Manus hosting. Users can access it via:

```
https://3d-poser-mobile.manus.space/
```

### Features

- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic updates
- ✅ PWA installable
- ✅ Custom domain support

### Update Deployment

```bash
# Make changes to the code
git add .
git commit -m "Update features"

# Trigger deployment
pnpm build
# Upload to Manus (automatic via CI/CD)
```

---

## Android APK Deployment

### Quick Start

**Option 1: Automated Setup (Recommended)**

```bash
# On macOS/Linux
./setup-apk.sh

# On Windows
setup-apk.bat
```

**Option 2: Manual Setup**

```bash
# Install dependencies
pnpm install

# Build web app
pnpm build

# Install Capacitor
pnpm add -D @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
pnpm exec cap init

# Add Android platform
pnpm exec cap add android

# Sync files
pnpm exec cap sync android

# Open in Android Studio
pnpm exec cap open android
```

### Building APK in Android Studio

1. **Open Android Studio**
   ```bash
   pnpm exec cap open android
   ```

2. **Wait for Gradle sync** (first time takes 5-10 minutes)

3. **Build APK**
   - Menu: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Or use keyboard shortcut: `Ctrl+Shift+B`

4. **Locate APK**
   - Path: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Size: ~50-100 MB

5. **Install on device**
   - Via Android Studio: `Run` → `Run 'app'`
   - Via command line: `adb install app-debug.apk`

### Building Release APK

For production release:

1. **Generate signing key** (first time only)
   ```bash
   keytool -genkey -v -keystore release.keystore \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias 3d-poser
   ```

2. **Configure signing in Android Studio**
   - `Build` → `Generate Signed Bundle / APK`
   - Select `APK` option
   - Choose your keystore file
   - Enter password
   - Build type: `Release`

3. **Sign and optimize**
   ```bash
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
     -keystore release.keystore \
     app-release.apk 3d-poser

   zipalign -v 4 app-release.apk app-release-aligned.apk
   ```

4. **Result**
   - File: `app-release-aligned.apk`
   - Ready for distribution

---

## iOS App Deployment

### Prerequisites

- Mac with Xcode
- Apple Developer account ($99/year)
- iOS 13+

### Setup

```bash
# Install iOS platform
pnpm add -D @capacitor/ios

# Add iOS platform
pnpm exec cap add ios

# Sync files
pnpm exec cap sync ios

# Open in Xcode
pnpm exec cap open ios
```

### Building for iOS

1. **Open Xcode**
   ```bash
   pnpm exec cap open ios
   ```

2. **Configure signing**
   - Select project in Xcode
   - Go to `Signing & Capabilities`
   - Select your team
   - Update bundle identifier

3. **Build**
   - Select device or simulator
   - Press `Cmd+B` to build
   - Press `Cmd+R` to run

4. **Archive for distribution**
   - `Product` → `Archive`
   - `Distribute App`
   - Choose `App Store Connect`

---

## Google Play Store

### Prerequisites

- Google Play Developer account ($25 one-time fee)
- Release APK (signed and optimized)
- App assets (screenshots, descriptions, etc.)

### Step-by-Step

#### 1. Create Google Play Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new developer account
3. Pay $25 registration fee
4. Complete profile information

#### 2. Create App

1. Click `Create app`
2. Enter app name: "3D Poser"
3. Select category: "Graphics & Design"
4. Complete store listing

#### 3. Prepare App Assets

**Screenshots (required)**
- Minimum 2, maximum 8 per device type
- Sizes:
  - Phone: 1080x1920 px
  - Tablet: 1200x1920 px
  - Wear OS: 512x512 px

**Descriptions**
- Short description (50 chars)
- Full description (4000 chars)
- Changelog

**Graphics**
- Feature graphic: 1024x500 px
- Icon: 512x512 px (PNG)
- Screenshots: See above

#### 4. Upload APK

1. Go to `Release` → `Production`
2. Click `Create new release`
3. Upload signed APK
4. Review and confirm

#### 5. Set Pricing & Distribution

1. Go to `Pricing & distribution`
2. Select countries
3. Set price (free or paid)
4. Configure content rating

#### 6. Review & Submit

1. Complete all required fields
2. Review app content
3. Accept policies
4. Submit for review

**Review time:** 1-3 hours typically

### Post-Launch

- Monitor crash reports
- Read user reviews
- Release updates regularly
- Maintain minimum rating

---

## Direct APK Distribution

### Method 1: Email

```bash
# Build release APK
pnpm build
# Open Android Studio and build release APK

# Email the file
# File: app-release-aligned.apk (50-100 MB)
```

### Method 2: Cloud Storage

1. Upload to Google Drive, Dropbox, or OneDrive
2. Share link with users
3. Users download and install

### Method 3: Website

1. Host APK on your website
2. Create download page
3. Users tap link on mobile device
4. Browser prompts to install

### Method 4: QR Code

```bash
# Generate QR code pointing to APK download URL
# Users scan with phone camera
# Automatic download and install
```

### User Installation Steps

1. **Enable Unknown Sources**
   - Settings → Security → Unknown Sources (toggle ON)
   - Or Settings → Apps & notifications → Advanced → Install unknown apps

2. **Download APK**
   - Tap download link
   - Wait for download to complete

3. **Install**
   - Open file manager
   - Navigate to Downloads
   - Tap APK file
   - Tap "Install"
   - Wait for installation

4. **Launch**
   - App appears in app drawer
   - Tap to launch

---

## Progressive Web App (PWA)

### Installation from Browser

**On Android:**
1. Open app in Chrome/Firefox
2. Tap menu (⋯)
3. Select "Install app" or "Add to Home Screen"
4. Confirm
5. App appears on home screen

**On iOS:**
1. Open app in Safari
2. Tap share button
3. Select "Add to Home Screen"
4. Confirm
5. App appears on home screen

### Features

- ✅ Works offline
- ✅ Fast loading
- ✅ No app store needed
- ✅ Automatic updates
- ✅ Takes up less space

### Advantages over APK

- No app store review needed
- Instant updates
- Works on any device
- Smaller file size

### Disadvantages

- Less native feel
- Limited device access
- Requires internet first time

---

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - name: Deploy to Manus
        run: |
          # Deploy command here
          echo "Deployed to production"
```

---

## Monitoring & Analytics

### Track Downloads

- Google Play Console: Real-time download stats
- Firebase: User analytics
- Sentry: Error tracking

### Performance Monitoring

```javascript
// Add to your app
if ('performance' in window) {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page load time:', pageLoadTime);
}
```

### Error Tracking

```javascript
// Report errors
window.addEventListener('error', (event) => {
  console.error('Error:', event.error);
  // Send to error tracking service
});
```

---

## Troubleshooting Deployment

### APK too large

**Problem:** APK exceeds 100 MB  
**Solution:**
- Enable code splitting
- Remove unused dependencies
- Use DRACO compression
- Split into multiple APKs

### Build fails in Android Studio

**Problem:** Gradle build error  
**Solution:**
- Update Gradle: `gradle wrapper --gradle-version 8.0`
- Clear cache: `./gradlew clean`
- Sync again: `File` → `Sync Now`

### App crashes on startup

**Problem:** App closes immediately  
**Solution:**
- Check logcat: `adb logcat | grep 3d-poser`
- Verify permissions in AndroidManifest.xml
- Test on emulator first
- Check for missing dependencies

### Play Store rejection

**Problem:** App rejected by Google Play  
**Solution:**
- Review rejection reason
- Fix issues
- Resubmit
- Common reasons:
  - Crashes on startup
  - Missing privacy policy
  - Inappropriate content
  - Misleading description

---

## Version Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH
1.0.0

1 = Major version (breaking changes)
0 = Minor version (new features)
0 = Patch version (bug fixes)
```

### Update in package.json

```json
{
  "version": "1.0.0"
}
```

### Update in capacitor.config.json

```json
{
  "appId": "com.crg.poser3d",
  "appName": "3D Poser"
}
```

### Release Notes Template

```markdown
## Version 1.0.1

### New Features
- Feature 1
- Feature 2

### Bug Fixes
- Fixed issue with X
- Fixed issue with Y

### Performance
- Improved loading time
- Reduced memory usage

### Known Issues
- Issue 1 (workaround: ...)
```

---

## Rollback Procedure

If a release has critical issues:

### Web (Manus)

```bash
# Revert to previous commit
git revert <commit-hash>
git push

# Automatic redeployment
```

### Google Play Store

1. Go to `Release` → `Production`
2. Click `Manage releases`
3. Click `View release details`
4. Click `Deactivate release`
5. Previous version becomes active

### Direct APK

1. Distribute previous APK version
2. Instruct users to uninstall current version
3. Install previous version

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Content Security Policy headers set
- [ ] Dependencies updated
- [ ] No hardcoded secrets
- [ ] Permissions minimized
- [ ] Privacy policy available
- [ ] Terms of service available
- [ ] Data encryption enabled
- [ ] Regular security audits

---

## Support & Maintenance

### Regular Tasks

- Weekly: Check crash reports
- Monthly: Review user feedback
- Quarterly: Update dependencies
- Yearly: Security audit

### Contact

- Support email: support@crg-studio.com
- Bug reports: GitHub Issues
- Feature requests: GitHub Discussions
- Community: Discord Server

---

**Last Updated:** 2026-04-04  
**Version:** 1.0.0  
**Brand:** C.R.G Studio (Crazy Rooster Games)
