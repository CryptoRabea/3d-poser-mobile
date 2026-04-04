@echo off
REM 3D Poser Mobile - APK Setup Script (Windows)
REM This script automates the setup process for building an Android APK

echo.
echo 3D Poser Mobile - APK Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo + Node.js detected: %NODE_VERSION%
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo - pnpm not found. Installing pnpm...
    call npm install -g pnpm
)

for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo + pnpm detected: %PNPM_VERSION%
echo.

REM Install dependencies
echo Downloading dependencies...
call pnpm install
echo + Dependencies installed
echo.

REM Build the web app
echo Building web app...
call pnpm build
echo + Web app built successfully
echo.

REM Install Capacitor if not already installed
if not exist "node_modules\@capacitor\core" (
    echo Downloading Capacitor...
    call pnpm add -D @capacitor/core @capacitor/cli @capacitor/android
    echo + Capacitor installed
    echo.
)

REM Check if Android platform exists
if not exist "android" (
    echo Setting up Android platform...
    call pnpm exec cap add android
    echo + Android platform added
    echo.
)

REM Sync files to Android
echo Syncing files to Android project...
call pnpm exec cap sync android
echo + Files synced
echo.

echo.
echo SETUP COMPLETE!
echo.
echo Next steps:
echo 1. Install Android Studio: https://developer.android.com/studio
echo 2. Open the Android project:
echo    pnpm exec cap open android
echo 3. Build the APK in Android Studio:
echo    Build menu ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo.
echo For detailed instructions, see: APK_PACKAGING_GUIDE.md
echo.
pause
