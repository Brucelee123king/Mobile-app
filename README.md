# Fit 90 – 3-Month Weight Loss Planner (Android)

Daily meal plan (veg / non-veg), water tracker, daily workouts (3 phases × 12 weeks), calorie counter,
weight chart + BMI, streaks, dark mode and water/meal reminders.

## Get the APK
1. Push to GitHub → **Actions** → *Build Android APK* (or run it manually via *Run workflow*).
2. Open the finished run → **Artifacts** → download `Fit90-apks` → unzip.
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

## Design
Apple-HIG-inspired UI (SF type, grouped cards, translucent tab bar) that is fully responsive: bottom tab bar on phones,
sidebar on desktop/tablet-landscape. Accessibility: 4.5:1 text contrast in light & dark, 44px touch targets, visible focus,
keyboard + screen-reader support, reduced-motion. Reviewed against the `ui-ux-pro-max` skill checklist
(imported into `.claude/skills/ui-ux-pro-max`).

## 3D coach characters
The guided workout player and exercise guides use realistic skinned 3D humans (`assets/Michelle.glb`, `assets/Soldier.glb`,
Mixamo-rigged models from the three.js examples) rendered with three.js (`vendor/`, MIT). Exercise motion is authored as
keyframed joint angles in `poses_a.js` / `poses_b.js` and retargeted onto the character skeleton in `scene3d.js`.
To use your own character, export a Mixamo-rigged `.glb` (bone names `mixamorig:*`) and replace the files in `assets/`.
Check each model's licence terms before redistributing the app.
