# Project rules (Fit 90 – Android app)

**Standing delivery rule (set by the owner):** after EVERY change or improvement to the app:
1. Commit and push to the working branch (`claude/weight-loss-meal-plan-app-e2ziwl`).
2. Wait for the "Build Android APK" GitHub Actions run to finish successfully (fix the build if it fails).
3. The workflow publishes the APKs to the `apk-builds` branch (`Fit90-installable.apk`, `Fit90-unsigned.apk`, `BUILD.txt`).
   Fetch that branch and send ONLY `Fit90-installable.apk` to the owner in the chat with `SendUserFile` so they can tap to
   download and install. Do NOT send the unsigned APK unless the owner asks for it. Say which commit the build is from.

Other conventions: UI is Apple-HIG-inspired, responsive and accessible (see README "Design"); app language is English;
do not create a pull request unless asked.
