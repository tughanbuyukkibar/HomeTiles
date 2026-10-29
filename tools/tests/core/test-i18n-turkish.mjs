// Turkish must be selectable and complete on both surfaces. Protocol keys
// stay stable; user-facing values, calendar names and keyboard case change.
import assert from 'node:assert/strict';
import {readRepoFile} from '../../lib/admin-source.mjs';
import {compileAndRun} from '../../lib/cpp-host.mjs';
const source = readRepoFile('src/core/i18n/i18n.cpp');
const header = readRepoFile('src/core/i18n/i18n.h');
const fields = [...header.match(/struct Strings \{([\s\S]*?)\n\};/)[1]
  .matchAll(/const char\*\s+(\w+);/g)].map(m => m[1]);
function table(name) {
  const start = source.indexOf(`static const Strings kStrings${name} = {`);
  assert.ok(start >= 0);
  return [...source.slice(start, source.indexOf('\n};', start)).matchAll(/"(?:[^"\\]|\\.)*"/g)]
    .map(m => JSON.parse(m[0]));
}
const en = table('En'), tr = table('Tr');
assert.equal(tr.length, fields.length);
const texts = Object.fromEntries(fields.map((key, i) => [key, tr[i]]));
assert.match(source, /\{&kStringsTr, &kLocaleTr\}/);
for (const [key, value] of Object.entries({code:'tr', html_lang:'tr', language_label:'Dil:',
  light_on:'Açık', light_off:'Kapalı', tile_type_settings:'Ayarlar', system_title:'Sistem',
  duration_seconds_fmt:'%u sn', duration_minutes_fmt:'%u dk', duration_hours_fmt:'%u sa'})) {
  assert.equal(texts[key], value, key);
}
for (let i = 0; i < fields.length; i++) {
  assert.ok(tr[i].length, `${fields[i]} is translated`);
  const placeholders = value => [...value.matchAll(/\{[a-zA-Z_][a-zA-Z_0-9]*\}/g)].map(m => m[0]).sort();
  assert.deepEqual(placeholders(tr[i]), placeholders(en[i]), `${fields[i]} preserves named placeholders`);
}
const start = source.indexOf('static const LocaleProfile kLocaleTr = {');
const locale = source.slice(start, source.indexOf('\n};', start) + 3);
assert.ok(locale.includes('"Türkçe"'));
for (const name of ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi',
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']) {
  assert.ok(locale.includes(`"${name}"`), name);
}
const sensorPopup = readRepoFile('src/ui/popups/sensor/sensor_popup.cpp');
assert.doesNotMatch(sensorPopup, /(?:lv_label_set_text|make_range_button)\([^;]*"(?:24H|7D)"/);
assert.match(sensorPopup, /make_range_button\(i18n::binary_sensor_label\(configManager\.getConfig\(\)\.language, 7\)\)/);
for (const type of ['energy', 'weather']) {
  const popup = readRepoFile(`src/ui/popups/${type}/${type}_popup.cpp`);
  assert.doesNotMatch(popup, /"7D"/, `${type} week range is localized`);
  assert.ok(popup.includes('i18n::binary_sensor_label(configManager.getConfig().language, 7)'));
}
const own = /"çğıöşü"/.exec(locale)?.[0];
assert.ok(own, 'Turkish letters come from the locale data');
const struct = header.match(/struct Strings \{[\s\S]*?\n\};/)[0];
const trStart = source.indexOf('static const Strings kStringsTr = {');
const trTable = source.slice(trStart, source.indexOf('\n};', trStart) + 3);
const screen = readRepoFile('src/ui/tabs/settings/settings_screen.cpp');
const stepStart = screen.indexOf('void format_step(');
const formatStep = screen.slice(stepStart, screen.indexOf('\n}', stepStart) + 2);
const output = compileAndRun({label:'Turkish keyboard and settings durations', harness:`
#include <cassert>
#include <cstring>
#include <cstdio>
#include "src/ui/tabs/settings/keyboard_letters.h"
namespace i18n { ${struct}
${trTable} }
namespace settings_model {
  int sleep_steps() { return 3; }
  const i18n::Strings& text() { return i18n::kStringsTr; }
  unsigned sleep_step_seconds(int index) { const unsigned steps[] = {30, 300, 3600}; return steps[index]; }
}
${formatStep}
int main() {
  char duration[32];
  const char* expectedSteps[] = {"30 sn", "5 dk", "1 sa", "Asla"};
  for (int i = 0; i < 4; ++i) {
    format_step(duration, sizeof(duration), i);
    assert(std::strcmp(duration, expectedSteps[i]) == 0);
  }
  using namespace keyboard_letters;
  const char* own = ${own};
  assert(upper_for_letters('i', own) == 0x130);
  assert(upper_for_letters(0x131, own) == 'I');
  assert(upper_for_letters('i', "äöüß") == 'I');
  const char* lower = "çğıöşü";
  const char* expected = "ÇĞIÖŞÜ";
  while (*lower) assert(upper_for_letters(next(lower), own) == next(expected));
  assert(!*expected);
  char buf[8];
  assert(encode(upper_for_letters('i', own), buf, sizeof(buf)) == 2);
  assert(std::strcmp(buf, "İ") == 0);
  return 0;
}`});
if (output !== null) console.log('Turkish: complete strings, calendar names, placeholders and UTF-8 keyboard case');
