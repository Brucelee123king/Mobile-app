# Fit 90 – 3-Month Weight Loss Planner (Android)

Daily meal plan (veg / non-veg), water tracker, daily workouts (3 phases × 12 weeks), calorie counter,
weight chart + BMI, streaks, dark mode and water/meal reminders.

## Get the APK
1. Push to GitHub → **Actions** → *Build Android APK* (or run it manually via *Run workflow*).
2. Open the finished run → **Artifacts** → download `Fit90-release-apk` → unzip → `Fit90-release.apk`.
3. Copy to your phone and install (allow "install unknown apps").

## Signing with your own key (recommended)
Without secrets the workflow signs with a temporary key, which means later builds can't update an installed copy.
Create a keystore once and add 4 repository secrets (Settings → Secrets and variables → Actions):

```
keytool -genkeypair -v -keystore release.keystore -alias fit90 -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.keystore      # paste output as KEYSTORE_BASE64
```
Secrets: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`. Keep the keystore safe.

## Local web preview
`python3 -m http.server` then open http://localhost:8000
