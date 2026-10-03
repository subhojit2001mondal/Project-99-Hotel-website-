# Google Play Store Deployment Guide with Bubblewrap CLI

This guide explains how to convert and package **Illusion** into an Android Google Play Store application (Trusted Web Activity - TWA) using Google's official **Bubblewrap CLI** (`@bubblewrap/cli`).

---

## 1. How Bubblewrap & Trusted Web Activities (TWA) Work
A **Trusted Web Activity (TWA)** wraps your high-performance Progressive Web App (PWA) in an Android native container that runs directly on Google Play Store devices with:
- **Zero browser address bar**: Full-screen, edge-to-edge native appearance.
- **Instant updates**: When you update your web app, mobile users get the updates instantly without needing to reinstall an APK from the Play Store!
- **Play Store presence**: Your app gets an official Play Store listing, ratings, downloads, and search discovery.
- **Push notifications**: Integrated with Android notification channels.
- **Offline caching**: Powered by the Workbox service worker precaching.

---

## 2. PWA Compliance Pre-requisites (Already Configured in Illusion)
1. **Web App Manifest**: Configured at `/manifest.webmanifest` and `/manifest.json`.
2. **High-Resolution & Maskable Icons**:
   - `public/pwa-192x192.png` (Standard 192x192)
   - `public/pwa-512x512.png` (High-res 512x512)
   - `public/pwa-maskable-512x512.png` (Maskable with 15% safe zone padding)
   - `public/apple-touch-icon.png` (iOS Safari 180x180)
3. **Digital Asset Links**: Configured at `public/.well-known/assetlinks.json`.
4. **Offline Service Worker**: Powered by `vite-plugin-pwa` in `vite.config.ts`.
5. **In-App Install Prompt**: Powered by `usePWAInstall` and `PWAInstallButton` in the header and navigation drawers.

---

## 3. Pre-configured Bubblewrap Manifest (`twa-manifest.json`)
The root directory includes a complete `twa-manifest.json`:
```json
{
  "packageId": "com.illusion.travel",
  "host": "ais-pre-53ue6p5fwmkwgi4tb6n22h-621399678187.asia-east1.run.app",
  "name": "Illusion - Luxury Hotel & Tour Booking",
  "launcherName": "Illusion",
  "themeColor": "#082F49",
  "navigationColor": "#082F49",
  "backgroundColor": "#082F49",
  "enableNotifications": true,
  "startUrl": "/",
  "iconUrl": "https://ais-pre-53ue6p5fwmkwgi4tb6n22h-621399678187.asia-east1.run.app/pwa-512x512.png",
  "maskableIconUrl": "https://ais-pre-53ue6p5fwmkwgi4tb6n22h-621399678187.asia-east1.run.app/pwa-maskable-512x512.png",
  "appVersionName": "1.0.0",
  "appVersionCode": 1
}
```

---

## 4. How to Generate and Build the Play Store Bundle with Bubblewrap

### Step 1: Initialize the Bubblewrap Project (if starting from a custom domain)
```bash
npx @bubblewrap/cli init --manifest=https://<your-app-domain>/manifest.webmanifest
```
Bubblewrap will read the manifest and generate the Android Gradle project structure.

### Step 2: Build the Google Play Store App Bundle (.aab)
```bash
npx @bubblewrap/cli build
```
Bubblewrap will compile the Android project and generate:
- `app-release-bundle.aab`: **The production Android App Bundle to upload to Google Play Console**.
- `app-release-signed.apk`: **The signed APK for direct testing and sideloading on your Android phone**.
- `android.keystore`: The signing key used for your app release (store this safely!).

### Step 3: Verify Digital Asset Links
Digital Asset Links prove ownership of the website so that the Android browser bar is completely hidden:
1. Bubblewrap automatically outputs the SHA-256 fingerprint from your keystore.
2. Ensure the fingerprint matches in `public/.well-known/assetlinks.json`:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.illusion.travel",
      "sha256_cert_fingerprints": [
        "<YOUR_SHA256_FINGERPRINT_HERE>"
      ]
    }
  }
]
```

### Step 4: Upload to Google Play Console
1. Open the [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - App name: **Illusion - Luxury Hotel & Tour Booking**
   - Default language: English (or preferred)
   - App or game: **App**
   - Free or paid: **Free**
3. Complete the store listing (Store presence > Main store listing):
   - Add short description and full description.
   - Upload app icon (512x512 from `/public/pwa-512x512.png`).
   - Upload screenshots of the app.
4. Navigate to **Release > Production** (or **Testing > Internal testing**).
5. Create a new release and upload `app-release-bundle.aab`.
6. Submit for review!

---

## 5. Instant Updates
Because Trusted Web Activities load your live Progressive Web App, any changes or new features you deploy to your web app are instantly available to all Play Store mobile users without requiring a Play Store app update!
