# Project rules (Fit 90 – Android app)

**Standing delivery rule (set by the owner):** after EVERY change or improvement to the app:
1. Commit and push to the working branch (`claude/weight-loss-meal-plan-app-e2ziwl`).
2. Wait for the "Build Android APK" GitHub Actions run to finish successfully (fix the build if it fails).
3. The workflow publishes the APKs to the `apk-builds` branch (`Fit90-unsigned.apk`, `Fit90-installable.apk`, `BUILD.txt`).
   Fetch that branch and send BOTH APK files to the owner in the chat with `SendUserFile` so they can tap to download.
4. Always include the unsigned release build. Android cannot install an unsigned APK, so also send the installable
   (signed) copy and say which is which.

Other conventions: UI is Apple-HIG-inspired, responsive and accessible (see README "Design"); app language is English;
do not create a pull request unless asked.
