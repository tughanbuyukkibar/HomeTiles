# Turkish localization

The `turkish-localization` branch of
[tughanbuyukkibar/HomeTiles](https://github.com/tughanbuyukkibar/HomeTiles/tree/turkish-localization)
contains Turkish support on top of HomeTiles v0.9.5
(`4cb22f67e0305f93599bec0acf9a7c6488f02010`). It is a source contribution,
not an official HomeTiles release or a separately loadable language file.
Keep the upstream MIT license and attribution when redistributing it.

## Scope

Select **Settings > Localization > Language > Türkçe** on the panel or in
Web Admin. Turkish provides all 660 current `Strings` entries and the
`LocaleProfile` data: weekday/month names, weather and device states,
time zones, decimal comma, dates, a 24-hour default, and keyboard letters
`çğıöşü`. Explicitly selected date/time formats and user-defined titles stay.
Home Assistant names, media metadata and arbitrary sensor text are not
machine-translated. Logs and protocol identifiers remain English.

The language data is centralized in `src/core/i18n/i18n.cpp`. The small
shared fixes remove hard-coded System/history/duration labels and correct
alphabet-based uppercase handling (`i` to `İ`, `ı` to `I`). Other languages
retain their existing history/duration labels and keyboard behavior.
Tests cover field alignment, placeholders, font coverage, keyboard case,
clock dates and browser preview parity. The initial welcome text fits the
persisted UTF-8 byte limit.

This branch contains no Alexa overlay, audio changes, device configuration,
credentials, flash dumps or personal dashboard screenshots. It does not
change device profiles or persistent configuration layouts.

## Carry the contribution to a newer upstream version

Work in a new branch; do not overwrite a tested device or a working checkout.
For a new clone:

```sh
git clone https://github.com/tughanbuyukkibar/HomeTiles.git
cd HomeTiles
git remote add upstream https://github.com/GalusPeres/HomeTiles.git
git fetch upstream --tags
git fetch origin turkish-localization
git switch -c integrate/turkish-next upstream/main
git cherry-pick origin/turkish-localization
```

Arduino requires the sketch folder to be named `HomeTiles`, containing
`HomeTiles.ino`. If using GitHub Download ZIP, rename the extracted folder
to `HomeTiles` before building.

The published branch currently contains one contribution commit. If the
fork later carries multiple feature commits, review its history and apply
the feature commits in order instead of blindly picking only the last one.
If upstream has already merged Turkish, use its implementation and inspect
any remaining differences before applying anything.

A cherry-pick is not an automatic translation migration. If upstream adds
`Strings`/`LocaleProfile` fields or changes UI helpers, resolve each conflict
and translate every new field in declaration order. Preserve placeholders,
font coverage and UTF-8 storage limits. An unknown language code falls back
to English; restoring a settings export alone cannot add language code to
an official firmware that does not include it.

For an offline patch, export the feature commit and apply it in a Git clone:

```sh
git format-patch -1 origin/turkish-localization --stdout > hometiles-turkish.patch
git am --3way hometiles-turkish.patch
```

Review conflicts rather than ignoring them. `git cherry-pick --abort` or
`git am --abort` cancels the respective integration attempt.

## Validate before building or proposing upstream

Install the pinned dependencies after checkout, as in `CONTRIBUTING.md`:

```sh
npm ci --ignore-scripts
node tools/run-tests.mjs i18n keyboard clock-date settings
node tools/run-tests.mjs
node tools/generate-device-profiles.mjs --check
node tools/generate-web-assets.mjs --check
git diff --check
```

Host rendering tests need LVGL 9.6.0 and a host compiler. Some tests also
need ArduinoJson, the pinned ESP32 core, mklittlefs, Python documentation
dependencies or a browser. A skipped test has not verified that behavior.
See `CONTRIBUTING.md` and `tools/build-firmware-local.ps1` for the supported
local build workflow. Build the exact requested board profile, verify its
embedded device/silicon metadata, OTA slot size and SHA256, then keep a
working firmware and configuration backup before any device update.

For Waveshare Touch LCD 7B with ESP32-P4 revision 3.2 the profile is
`waveshare_7b_rev3`, silicon `post_v3` (301-399). Do not flash this board's
image onto another model. Source portability does not mean an image is
portable across boards.

## Validation boundary

**Hardware-validated:** Waveshare Touch LCD 7B, ESP32-P4 silicon
revision **3.2**. The user reported that Turkish UI and normal operation
worked correctly with no observed problems. This is user-confirmed hardware
validation, not only a successful compilation.

The Turkish implementation was compiled for Waveshare 7B rev3.2 and tested
on that hardware together with a separate local Alexa overlay. The user
confirmed Turkish text, voice, all three overlay phases and screen return.
That overlay is deliberately absent from this contribution. Standalone
verification covered 398 passing host cases, with one private issue-70
fixture skipped. The full run had one docs-browser startup timeout; that
case passed when rerun on the CI-pinned Chrome for Testing 154.0.8037.57.
There are no unresolved failing tests. Web assets and device-catalog checks
pass. The standalone `waveshare_7b_rev3` application build succeeds and
contains no Alexa overlay symbols. It was not flashed onto the user's
working device.

Standalone build: 5276592 bytes; SHA256
`be76f94b4eb5ef6febcf2981a7d582846b7181347dae9adb4672f0b75f4b37d0`. Other hardware, measured FPS and long-duration soak are not claimed.

Publishing this fork does not make Turkish part of official HomeTiles.
Only acceptance and release by the upstream maintainer can do that. Until
then, rebuild the integrated source for each desired upstream update;
do not install a stock firmware expecting this custom code to survive.
