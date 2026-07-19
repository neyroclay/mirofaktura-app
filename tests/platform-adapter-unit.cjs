const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const coreSource = fs.readFileSync(path.join(root, 'platform', 'platform-core.js'), 'utf8');
const maxSource = fs.readFileSync(path.join(root, 'platform', 'max-adapter.js'), 'utf8');
const telegramSource = fs.readFileSync(path.join(root, 'platform', 'telegram-adapter.js'), 'utf8');
const telegramEntry = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const maxEntry = fs.readFileSync(path.join(root, 'max', 'index.html'), 'utf8');

function createContext(platform, extraWindow = {}) {
  const window = {
    MIROFAKTURA_PLATFORM: platform,
    location: {
      protocol: 'https:',
      hostname: 'neyroclay.github.io',
      href: `https://neyroclay.github.io/mirofaktura-app/${platform === 'max' ? 'max/' : ''}`,
      search: '',
    },
    open() { return null; },
    ...extraWindow,
  };
  const context = vm.createContext({
    window,
    navigator: {
      share: null,
      clipboard: { writeText: async () => {} },
    },
    URL,
    URLSearchParams,
    setTimeout,
    clearTimeout,
    console,
  });
  vm.runInContext(coreSource, context);
  return context;
}

{
  const context = createContext('max', {
    WebApp: {
      initData: '',
      initDataUnsafe: {},
      user: {},
    },
  });
  vm.runInContext(maxSource, context);
  const adapter = context.window.MirofacturaPlatforms.current();
  assert.equal(adapter.key, 'max');
  assert.equal(adapter.messenger, 'MAX');
  assert.equal(adapter.entryUrl, 'https://max.ru/id590417093305_bot?startapp');
  assert.equal(adapter.getReferralLink('12345'), 'https://max.ru/id590417093305_bot?startapp=ref_12345');
  assert.equal(adapter.getReferralLink(''), 'https://max.ru/id590417093305_bot');
  assert.equal(adapter.progress.loadItem, 'trend_deck_load_v2');
  assert.equal(adapter.progress.saveItem, 'trend_deck_save_v2');
  assert.equal(adapter.progress.followupItem, 'trend_deck_started_max_v2');
}

{
  const context = createContext('telegram', {
    Telegram: {
      WebApp: {
        initData: '',
        initDataUnsafe: {},
      },
    },
  });
  vm.runInContext(telegramSource, context);
  const adapter = context.window.MirofacturaPlatforms.current();
  assert.equal(adapter.key, 'telegram');
  assert.equal(adapter.messenger, 'Telegram');
  assert.equal(adapter.entryUrl, 'https://t.me/mirofactura_bot');
  assert.equal(adapter.getReferralLink('12345'), 'https://t.me/mirofactura_bot?start=12345');
  assert.equal(adapter.progress.followupItem, 'trend_deck_started_telegram');
  assert.equal(typeof adapter.prefetchProgress, 'function');
  assert.equal(typeof adapter.loadProgress, 'function');
}

assert.match(telegramEntry, /platform\/telegram-adapter\.js/);
assert.doesNotMatch(telegramEntry, /platform\/max-adapter\.js/);
assert.match(maxEntry, /platform\/max-adapter\.js/);
assert.doesNotMatch(maxEntry, /telegram-web-app\.js|platform\/telegram-adapter\.js|platform=telegram/);
assert.doesNotMatch(maxEntry, /id590417093305_biz/);

console.log('platform adapter unit checks passed');
