# Turkish localization

This branch adds **Turkish (Türkçe)** to HomeTiles v0.9.5 on the display and
in Web Admin. Select **Settings > Localization > Language > Türkçe**.

It includes translated settings and state labels, Turkish weekday/month
names, date and number formatting, and keyboard support for `çğıöşü`,
`i/İ` and `ı/I`. User-defined tile names and Home Assistant entity names
remain as configured.

This is a community contribution. It has not been included in an official
HomeTiles release. The source is available under the existing MIT license.

## Tested hardware

The Turkish localization changes were validated on **Waveshare Touch LCD
7B with ESP32-P4 silicon revision 3.2**. The user reported correct Turkish
UI and normal operation with no observed problems.

The source also passes 398 host test cases, with one unavailable private
fixture skipped. The `waveshare_7b_rev3` firmware build succeeds and its
device metadata is verified. The standalone downloadable image still
requires its own on-device verification before publication.

Other panels and silicon revisions have not been physically validated.

## Using the source

This branch currently provides source code, not a separately installable
language file. Compile it for your exact device, back up your existing
installation, install the resulting firmware and select Türkçe.

```sh
git clone --branch turkish-localization https://github.com/tughanbuyukkibar/HomeTiles.git
cd HomeTiles
npm ci --ignore-scripts
```

Follow `CONTRIBUTING.md` for the build tools. Arduino requires the sketch
folder to be named `HomeTiles`, containing `HomeTiles.ino`; rename the
extracted folder if using GitHub Download ZIP.

For the validated Waveshare 7B revision 3.2, use profile
`waveshare_7b_rev3` (`post_v3`, revision range 301-399).
A firmware image is specific to its board; do not use it on another model.

## Carrying Turkish to a newer HomeTiles version

Keep a working installation and its backup. In a source clone, fetch the
upstream version and apply the complete contribution range on a new branch:

```sh
git remote add upstream https://github.com/GalusPeres/HomeTiles.git
git fetch upstream --tags
git fetch origin turkish-localization
git switch -c integrate/turkish-next upstream/main
git cherry-pick 4cb22f67e0305f93599bec0acf9a7c6488f02010..origin/turkish-localization
```

The range includes the language change and its documentation follow-ups.
Resolve conflicts and translate any new central i18n fields; this is not
a guaranteed automatic migration. If upstream already includes Turkish,
use its implementation and review differences before applying anything.

For an offline patch series:

```sh
git format-patch 4cb22f67e0305f93599bec0acf9a7c6488f02010..origin/turkish-localization --stdout > hometiles-turkish.patch
git am --3way hometiles-turkish.patch
```

Run the checks before building the updated firmware:

```sh
npm ci --ignore-scripts
node tools/run-tests.mjs
node tools/generate-device-profiles.mjs --check
node tools/generate-web-assets.mjs --check
git diff --check
```

Install the optional host-test dependencies described in `CONTRIBUTING.md`
when needed. A skipped test has not verified that behavior.

A stock firmware that does not include Turkish will remove this code when
installed. Restoring a settings export cannot restore a missing language.
