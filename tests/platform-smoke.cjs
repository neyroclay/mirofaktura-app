const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.MIROFAKTURA_TEST_URL || 'http://127.0.0.1:8765';
const artifacts = process.env.MIROFAKTURA_ARTIFACT_DIR
  ? path.resolve(process.env.MIROFAKTURA_ARTIFACT_DIR)
  : path.join(__dirname, '..', 'test-artifacts');
fs.mkdirSync(artifacts, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installMaxStub(page) {
  await page.addInitScript(() => {
    window.__maxCalls = [];
    const backButton = {
      isVisible: false,
      callback: null,
      show() { this.isVisible = true; window.__maxCalls.push(['back.show']); },
      hide() { this.isVisible = false; window.__maxCalls.push(['back.hide']); },
      onClick(callback) { this.callback = callback; window.__maxCalls.push(['back.onClick']); },
      offClick(callback) { if (this.callback === callback) this.callback = null; }
    };
    window.WebApp = {
      initData: 'query_id=test&user=signed&auth_date=1783950000&hash=test',
      initDataUnsafe: {
        user: { id: 777, first_name: 'Макс', last_name: 'Тестовый' },
        start_param: 'ref_42'
      },
      user: { id: 777, first_name: 'Макс', last_name: 'Тестовый' },
      BackButton: backButton,
      openMaxLink(url) { window.__maxCalls.push(['openMaxLink', url]); },
      openLink(url) { window.__maxCalls.push(['openLink', url]); },
      async shareMaxContent(payload) { window.__maxCalls.push(['shareMaxContent', payload]); return { status: 'shared' }; },
      async shareContent(payload) { window.__maxCalls.push(['shareContent', payload]); return { status: 'shared' }; }
    };
  });
  await page.route('https://st.max.ru/js/max-web-app.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
}

async function installTelegramStub(page) {
  await page.addInitScript(() => {
    window.__telegramCalls = [];
    const backButton = {
      isVisible: false,
      callback: null,
      show() { this.isVisible = true; window.__telegramCalls.push(['back.show']); },
      hide() { this.isVisible = false; window.__telegramCalls.push(['back.hide']); },
      onClick(callback) { this.callback = callback; window.__telegramCalls.push(['back.onClick']); }
    };
    window.Telegram = { WebApp: {
      initData: 'telegram-signed-data',
      initDataUnsafe: { user: { id: 555, first_name: 'Телеграм' } },
      BackButton: backButton,
      ready() { window.__telegramCalls.push(['ready']); },
      expand() { window.__telegramCalls.push(['expand']); },
      disableVerticalSwipes() { window.__telegramCalls.push(['disableVerticalSwipes']); },
      openTelegramLink(url) { window.__telegramCalls.push(['openTelegramLink', url]); },
      openLink(url) { window.__telegramCalls.push(['openLink', url]); },
      close() { window.__telegramCalls.push(['close']); }
    } };
  });
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
}

function collectDiagnostics(page, name) {
  const errors = [];
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
    console.error(`[${name}] pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
      console.error(`[${name}] console: ${message.text()}`);
    }
  });
  return { name, errors };
}

async function testMax(browser, viewport, suffix) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const diagnostics = collectDiagnostics(page, `max-${suffix}`);
  await installMaxStub(page);
  await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hero');

  assert(await page.evaluate(() => document.documentElement.dataset.mirofacturaPlatform) === 'max', 'MAX entry did not select MAX adapter');
  await page.click('.share-btn');
  await page.waitForTimeout(50);
  const calls = await page.evaluate(() => window.__maxCalls);
  const shareCall = calls.find(([name]) => name === 'shareMaxContent');
  assert(shareCall, 'MAX shareMaxContent was not called');
  assert(String(shareCall[1].link).includes('startapp=ref_777'), 'MAX referral share link is invalid');

  if (suffix === 'phone-portrait') {
    await page.click('[data-action="startQuiz"]');
    for (let question = 0; question < 4; question += 1) {
      await page.locator('[data-answer]').first().click();
      await page.click('[data-action="nextQuestion"]');
    }
    assert(await page.locator('.result-screen').count() === 1, 'Full quiz did not reach its result');
    await page.click('[data-page="home"]');
  }

  const pages = [
    ['quiz', '[data-action="startQuiz"]'],
    ['library', '[data-action="openLibrary"]'],
    ['contacts', '[data-page="contacts"]']
  ];
  for (const [target, selector] of pages) {
    await page.click(selector);
    await page.waitForTimeout(40);
    assert(await page.locator('.screen').count(), `Screen ${target} did not render`);
  }

  await page.click('[data-action="openTrends"]');
  await page.waitForSelector('.trends-native-host');
  await page.waitForSelector('#onboarding-view.visible, #game-ui', { timeout: 15000 });
  await page.waitForFunction(() => window.MirofacturaTrendDeck?.isReady?.() === true, null, { timeout: 15000 });
  const onboardingButton = page.locator('#btn-start-onboard');
  if (await onboardingButton.isVisible()) {
    await onboardingButton.click();
    await page.waitForFunction(() => !document.getElementById('onboarding-view')?.classList.contains('visible'));
  }
  assert(await page.locator('.trends-native-tab').count() === 3, 'Native trends tabs are missing');
  await page.click('[data-trends-tab="authors"]');
  await page.waitForTimeout(80);
  assert(await page.locator('#authors-view.visible').count() === 1, 'Authors tab did not open');
  const backHandled = await page.evaluate(() => {
    const callback = window.WebApp.BackButton.callback;
    if (!callback) return false;
    callback();
    return true;
  });
  assert(backHandled, 'MAX BackButton handler was not registered');
  assert(await page.locator('#authors-view.visible').count() === 0, 'MAX BackButton did not close the authors tab');
  await page.click('[data-trends-tab="collection"]');
  await page.waitForTimeout(80);
  assert(await page.locator('#library-view.visible').count() === 1, 'Collection tab did not open');
  await page.click('[data-trends-tab="daily"]');

  const sharesBeforeDeck = await page.evaluate(() => window.__maxCalls.filter(([name]) => name === 'shareMaxContent').length);
  await page.evaluate(() => document.getElementById('btn-invite-friend')?.click());
  await page.waitForTimeout(50);
  const sharesAfterDeck = await page.evaluate(() => window.__maxCalls.filter(([name]) => name === 'shareMaxContent').length);
  assert(sharesAfterDeck === sharesBeforeDeck + 1, 'Invite friend did not use MAX native sharing');

  const geometry = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    bottomNav: Boolean(document.querySelector('.bottom-nav')),
    platform: document.documentElement.dataset.mirofacturaPlatform
  }));
  assert(geometry.bodyWidth <= geometry.viewportWidth + 1, `Horizontal overflow: ${geometry.bodyWidth}/${geometry.viewportWidth}`);
  assert(geometry.bottomNav, 'Bottom navigation is missing');

  await page.screenshot({ path: path.join(artifacts, `max-${suffix}.png`), fullPage: true });
  await context.close();
  return diagnostics;
}

async function testMaxPersistence(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const diagnostics = collectDiagnostics(page, 'max-persistence');
  await installMaxStub(page);
  await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('oracle_10_trends_release_v23_max_777', JSON.stringify({
      lastDate: null,
      collected: [1],
      onboardingSeen: true,
      timerSeen: false,
      firstLaunchTime: '1783950000',
      bonusCards: 0,
      invitedFriends: 0
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.click('[data-action="openTrends"]');
  await page.waitForFunction(() => window.MirofacturaTrendDeck?.isReady?.() === true, null, { timeout: 15000 });
  assert(await page.locator('#onboarding-view.visible').count() === 0, 'Saved onboarding state was not restored');
  await page.click('[data-trends-tab="collection"]');
  await page.waitForTimeout(100);
  assert(await page.locator('#lib-grid-content .lib-card-container').count() >= 1, 'Saved card was not restored in the collection');
  const maxCollectionCard = page.locator('#lib-grid-content .lib-card-container').first();
  await maxCollectionCard.click();
  await page.waitForTimeout(700);
  assert(await maxCollectionCard.evaluate((card) => card.classList.contains('flipped')), 'Saved MAX collection card did not flip');
  assert(await maxCollectionCard.locator('.lib-card-inner').evaluate((inner) => getComputedStyle(inner).transform !== 'none'), 'Saved MAX collection card has no flip transform');
  await context.close();
  return diagnostics;
}

async function testMaxWaitingLayout(browser, viewport, suffix) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const diagnostics = collectDiagnostics(page, `max-waiting-${suffix}`);
  await installMaxStub(page);
  await page.route('https://cb.multy.ai/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ exists: false })
  }));
  await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('oracle_10_trends_release_v23_max_777', JSON.stringify({
      lastDate: new Date().toDateString(),
      collected: [1],
      onboardingSeen: true,
      timerSeen: true,
      firstLaunchTime: String(Date.now()),
      bonusCards: 0,
      invitedFriends: 0
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.click('[data-action="openTrends"]');
  await page.waitForFunction(() => window.MirofacturaTrendDeck?.isReady?.() === true, null, { timeout: 15000 });
  await page.waitForSelector('#game-ui.waiting-for-next-card .native-waiting-sheet');
  await page.waitForTimeout(1200);

  assert(await page.locator('.max-card-fallback').count() === 0, 'MAX daily card was replaced with a 2D fallback');
  const canvasInput = await page.locator('#canvas-container canvas').evaluate((canvas) => ({
    opacity: getComputedStyle(canvas).opacity,
    visibility: getComputedStyle(canvas).visibility
  }));
  assert(canvasInput.visibility === 'hidden', `MAX waiting screen still shows the daily card: ${JSON.stringify(canvasInput)}`);

  const geometry = await page.evaluate(() => {
    const sheet = document.querySelector('.native-waiting-sheet').getBoundingClientRect();
    const timer = document.querySelector('#daily-timer');
    const timerStyle = getComputedStyle(timer);
    const timerDigits = document.querySelector('.timer-digits');
    const timerDigitsStyle = getComputedStyle(timerDigits);
    const inviteButton = document.querySelector('#btn-invite-friend');
    const inviteButtonRect = inviteButton.getBoundingClientRect();
    const topbar = document.querySelector('.topbar').getBoundingClientRect();
    const tabs = document.querySelector('.trends-native-tabs').getBoundingClientRect();
    const host = document.querySelector('.trends-native-host').getBoundingClientRect();
    const gameUi = document.querySelector('#game-ui').getBoundingClientRect();
    const gameUiElement = document.querySelector('#game-ui');
    const gameUiStyle = getComputedStyle(gameUiElement);
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const availableCenter = (tabs.bottom + nav.top) / 2;
    const sheetCenter = (sheet.top + sheet.bottom) / 2;
    return {
      sheet: { top: sheet.top, bottom: sheet.bottom, height: sheet.height },
      topbar: { top: topbar.top, bottom: topbar.bottom },
      tabs: { top: tabs.top, bottom: tabs.bottom },
      host: { top: host.top, bottom: host.bottom },
      gameUi: { top: gameUi.top, bottom: gameUi.bottom },
      scroll: { clientHeight: gameUiElement.clientHeight, scrollHeight: gameUiElement.scrollHeight, overflowY: gameUiStyle.overflowY, touchAction: gameUiStyle.touchAction },
      nav: { top: nav.top, bottom: nav.bottom },
      timer: { backgroundImage: `${timerStyle.backgroundImage} ${timerDigitsStyle.backgroundImage}`, height: timer.getBoundingClientRect().height },
      timerDigits: { clientWidth: timerDigits.clientWidth, scrollWidth: timerDigits.scrollWidth },
      inviteButton: { display: getComputedStyle(inviteButton).display, bottom: inviteButtonRect.bottom, height: inviteButtonRect.height },
      availableCenter,
      sheetCenter,
      offset: sheetCenter - availableCenter
    };
  });
  await page.screenshot({ path: path.join(artifacts, `max-waiting-${suffix}.png`), fullPage: true });
  const scrollable = geometry.scroll.scrollHeight > geometry.scroll.clientHeight + 1;
  assert(geometry.scroll.overflowY === 'auto' && geometry.scroll.touchAction === 'pan-y', `MAX waiting screen cannot scroll: ${JSON.stringify(geometry)}`);
  if (scrollable) {
    const scrollTop = await page.locator('#game-ui').evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop;
    });
    assert(scrollTop > 0, `MAX waiting screen reports overflow but does not scroll: ${JSON.stringify(geometry)}`);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(artifacts, `max-waiting-${suffix}-scrolled.png`), fullPage: true });
  }
  if (!scrollable) {
    assert(geometry.sheet.bottom <= geometry.nav.top - 8, `Waiting panel is clipped by navigation: ${JSON.stringify(geometry)}`);
  }
  assert(geometry.timer.backgroundImage.includes('trends-waiting-panel.webp'), `MAX waiting timer visual is missing: ${JSON.stringify(geometry)}`);
  assert(geometry.timerDigits.scrollWidth <= geometry.timerDigits.clientWidth + 1, `MAX timer digits are clipped: ${JSON.stringify(geometry)}`);
  assert(geometry.inviteButton.display !== 'none' && geometry.inviteButton.height >= 48, `MAX invite action is missing: ${JSON.stringify(geometry)}`);
  assert(geometry.inviteButton.bottom <= geometry.sheet.bottom + 1, `MAX invite action requires internal scrolling: ${JSON.stringify(geometry)}`);
  if (viewport.height >= 700 && !scrollable) {
    assert(Math.abs(geometry.offset) <= 72, `Waiting panel is not vertically centered: ${JSON.stringify(geometry)}`);
  }
  await context.close();
  return diagnostics;
}

async function testTelegramWaitingLayout(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const diagnostics = collectDiagnostics(page, 'telegram-waiting');
  await installTelegramStub(page);
  await page.route('https://cb.multy.ai/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ exists: false })
  }));
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('oracle_10_trends_release_v23_telegram_555', JSON.stringify({
      lastDate: new Date().toDateString(),
      collected: [1],
      onboardingSeen: true,
      timerSeen: true,
      firstLaunchTime: String(Date.now()),
      bonusCards: 0,
      invitedFriends: 0
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.click('[data-action="openTrends"]');
  await page.waitForSelector('#game-ui.waiting-for-next-card .native-waiting-sheet', { timeout: 15000 });
  await page.waitForTimeout(500);
  const geometry = await page.evaluate(() => {
    const sheet = document.querySelector('.native-waiting-sheet').getBoundingClientRect();
    const tabs = document.querySelector('.trends-native-tabs').getBoundingClientRect();
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const canvas = document.querySelector('#canvas-container canvas');
    const inviteButton = document.querySelector('#btn-invite-friend');
    const inviteButtonRect = inviteButton.getBoundingClientRect();
    const timer = document.querySelector('#daily-timer');
    const timerStyle = getComputedStyle(timer);
    const timerDigitsStyle = getComputedStyle(document.querySelector('.timer-digits'));
    return {
      sheet: { top: sheet.top, bottom: sheet.bottom },
      navTop: nav.top,
      offset: ((sheet.top + sheet.bottom) / 2) - ((tabs.bottom + nav.top) / 2),
      canvasVisibility: getComputedStyle(canvas).visibility,
      timer: { backgroundImage: `${timerStyle.backgroundImage} ${timerDigitsStyle.backgroundImage}`, height: timer.getBoundingClientRect().height },
      inviteButton: { display: getComputedStyle(inviteButton).display, top: inviteButtonRect.top, bottom: inviteButtonRect.bottom, height: inviteButtonRect.height }
    };
  });
  await page.screenshot({ path: path.join(artifacts, 'telegram-waiting-phone-portrait.png'), fullPage: true });
  assert(geometry.canvasVisibility === 'hidden', `Telegram waiting screen still shows the daily card: ${JSON.stringify(geometry)}`);
  assert(geometry.timer.backgroundImage.includes('trends-waiting-panel.webp'), `Telegram waiting timer visual is missing: ${JSON.stringify(geometry)}`);
  assert(geometry.inviteButton.display !== 'none' && geometry.inviteButton.height >= 48, `Telegram invite action is missing: ${JSON.stringify(geometry)}`);
  assert(geometry.inviteButton.bottom <= geometry.sheet.bottom + 1, `Telegram invite action requires internal scrolling: ${JSON.stringify(geometry)}`);
  assert(geometry.sheet.bottom <= geometry.navTop - 8, `Telegram waiting panel is clipped by navigation: ${JSON.stringify(geometry)}`);
  assert(Math.abs(geometry.offset) <= 48, `Telegram waiting panel is not vertically centered: ${JSON.stringify(geometry)}`);
  await page.click('[data-trends-tab="collection"]');
  const telegramCollectionCard = page.locator('#lib-grid-content .lib-card-container').first();
  await telegramCollectionCard.waitFor();
  await telegramCollectionCard.click();
  await page.waitForTimeout(700);
  assert(await telegramCollectionCard.evaluate((card) => card.classList.contains('flipped')), 'Saved Telegram collection card did not flip');
  assert(await telegramCollectionCard.locator('.lib-card-inner').evaluate((inner) => getComputedStyle(inner).transform !== 'none'), 'Saved Telegram collection card has no flip transform');
  await context.close();
  return diagnostics;
}

async function testTelegram(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const diagnostics = collectDiagnostics(page, 'telegram');
  const maxBridgeRequests = [];
  const progressLoadRequests = [];
  const progressSaveRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('max-web-app.js')) maxBridgeRequests.push(request.url());
    if (request.url().includes('cb.multy.ai') && request.postData()?.includes('trend_deck_load_v2')) {
      progressLoadRequests.push(request.url());
    }
    if (request.url().includes('cb.multy.ai') && request.postData()?.includes('trend_deck_save_v2')) {
      progressSaveRequests.push(request.url());
    }
  });
  await page.route('https://cb.multy.ai/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ exists: false })
  }));
  await installTelegramStub(page);
  await page.goto(`${BASE_URL}/index.html?platform=max`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hero');
  assert(await page.evaluate(() => document.documentElement.dataset.mirofacturaPlatform) === 'telegram', 'Main entry did not remain Telegram');
  await page.waitForFunction(() => Boolean(window.MirofacturaTrendDeck), null, { timeout: 5000 });
  await page.waitForFunction(() => Boolean(window.THREE && window.TWEEN && window.confetti), null, { timeout: 15000 });
  await page.waitForFunction(() => performance.getEntriesByName('https://cb.multy.ai/api/v1/hook/app/b9c89cbdf0f21aa63c6111487770196a').length > 0, null, { timeout: 5000 });
  assert(await page.locator('.home-screen').count() === 1, 'Telegram trend warmup replaced the home screen');
  assert(await page.evaluate(() => typeof window.MirofacturaTrendDeck.preloadLibraries === 'function'), 'Telegram deck libraries cannot be warmed in the background');
  assert(progressLoadRequests.length === 1, 'Telegram progress was not prefetched exactly once');
  const savedProgress = await page.evaluate(async () => {
    const adapter = window.MirofacturaPlatforms.current();
    await adapter.saveProgress({
      firstLaunchTime: '1783950000',
      lastDate: '',
      collected: [2],
      onboardingSeen: true,
      bonusCards: 0,
      invitedFriends: 0
    });
    return adapter.loadProgress();
  });
  assert(progressSaveRequests.length === 1, 'Telegram progress save did not use the existing save webhook');
  assert(savedProgress.exists === true && savedProgress.collected.includes(2), 'Saved Telegram progress did not update the session cache');
  assert(progressLoadRequests.length === 1, 'Reading saved Telegram progress unexpectedly reloaded it');
  await page.click('.share-btn');
  await page.waitForTimeout(50);
  const calls = await page.evaluate(() => window.__telegramCalls);
  assert(calls.some(([name]) => name === 'ready'), 'Telegram ready was not called');
  assert(calls.some(([name]) => name === 'openTelegramLink'), 'Telegram share flow changed');
  await page.click('[data-action="openTrends"]');
  await page.waitForSelector('.trends-native-host');
  assert(progressLoadRequests.length === 1, 'Opening Telegram trends ignored the prefetched progress response');
  assert(maxBridgeRequests.length === 0, 'Telegram version loaded MAX Bridge');
  await page.screenshot({ path: path.join(artifacts, 'telegram-main.png'), fullPage: true });
  await context.close();
  return diagnostics;
}

async function testTelegramOnboardingLayout(browser) {
  const context = await browser.newContext({ viewport: { width: 480, height: 1218 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const diagnostics = collectDiagnostics(page, 'telegram-onboarding-layout');
  await installTelegramStub(page);
  await page.route('https://cb.multy.ai/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ exists: false })
  }));
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.click('[data-action="openTrends"]');
  await page.waitForSelector('#onboarding-view.visible', { timeout: 15000 });
  await page.waitForFunction(() => window.MirofacturaTrendDeck?.isReady?.() === true, null, { timeout: 15000 });
  const geometry = await page.evaluate(() => {
    const topbar = document.querySelector('.topbar').getBoundingClientRect();
    const card = document.querySelector('#onboarding-view').getBoundingClientRect();
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const availableCenter = (topbar.bottom + nav.top) / 2;
    const cardCenter = (card.top + card.bottom) / 2;
    return { availableCenter, cardCenter, offset: cardCenter - availableCenter };
  });
  assert(Math.abs(geometry.offset) <= 48, `Telegram onboarding is not vertically centered: ${JSON.stringify(geometry)}`);
  await page.screenshot({ path: path.join(artifacts, 'telegram-onboarding-tall.png'), fullPage: true });
  await context.close();
  return diagnostics;
}

(async () => {
  const executablePath = process.env.MIROFAKTURA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ headless: true, executablePath });
  const results = [];
  try {
    if (process.env.MIROFAKTURA_SMOKE_FOCUS === 'waiting') {
      results.push(await testTelegramWaitingLayout(browser));
      results.push(await testMaxWaitingLayout(browser, { width: 390, height: 844 }, 'phone-portrait'));
      results.push(await testMaxWaitingLayout(browser, { width: 480, height: 1218 }, 'phone-tall'));
      results.push(await testMaxWaitingLayout(browser, { width: 844, height: 390 }, 'phone-landscape'));
      results.push(await testMaxWaitingLayout(browser, { width: 1024, height: 768 }, 'tablet-landscape'));
      results.push(await testMaxWaitingLayout(browser, { width: 1024, height: 320 }, 'tablet-landscape-short'));
    } else {
    results.push(await testTelegram(browser));
    results.push(await testMax(browser, { width: 390, height: 844 }, 'phone-portrait'));
    results.push(await testMax(browser, { width: 844, height: 390 }, 'phone-landscape'));
    results.push(await testMax(browser, { width: 768, height: 1024 }, 'tablet-portrait'));
    results.push(await testMax(browser, { width: 1024, height: 768 }, 'tablet-landscape'));
    results.push(await testMaxPersistence(browser));
    results.push(await testMaxWaitingLayout(browser, { width: 390, height: 844 }, 'phone-portrait'));
    results.push(await testMaxWaitingLayout(browser, { width: 480, height: 1218 }, 'phone-tall'));
    results.push(await testMaxWaitingLayout(browser, { width: 844, height: 390 }, 'phone-landscape'));
    results.push(await testMaxWaitingLayout(browser, { width: 1024, height: 768 }, 'tablet-landscape'));
    results.push(await testMaxWaitingLayout(browser, { width: 1024, height: 320 }, 'tablet-landscape-short'));
    results.push(await testTelegramOnboardingLayout(browser));
    }
  } finally {
    await browser.close();
  }
  const errors = results.flatMap((result) => result.errors.map((error) => `${result.name}: ${error}`));
  console.log(JSON.stringify({ ok: errors.length === 0, results, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
