const { chromium } = require('playwright');

const BASE_URL = process.env.MIROFAKTURA_TEST_URL || 'http://127.0.0.1:8765';
const executablePath = process.env.MIROFAKTURA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installTelegramStub(page) {
  await page.addInitScript(() => {
    const backButton = { show() {}, hide() {}, onClick() {}, offClick() {} };
    window.Telegram = { WebApp: {
      initData: 'telegram-signed-data',
      initDataUnsafe: { user: { id: 555, first_name: 'Telegram' } },
      BackButton: backButton,
      ready() {}, expand() {}, disableVerticalSwipes() {}, openTelegramLink() {}, openLink() {}, close() {}
    } };
  });
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({
    contentType: 'application/javascript', body: ''
  }));
  const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Xw2jVQAAAABJRU5ErkJggg==', 'base64');
  await page.route('https://cdn.jsdelivr.net/gh/neyroclay/img-host-trends-2026@main/trends-v2/**', (route) => route.fulfill({
    contentType: 'image/png', body: transparentPng
  }));
}

function installProgressBackend(context, state) {
  return context.route('https://cb.multy.ai/**', async (route) => {
    const request = route.request();
    let payload = {};
    try { payload = JSON.parse(request.postData() || '{}'); } catch (_) {}

    if (payload.item === 'trend_deck_save_v2') {
      state.value = {
        exists: true,
        first_launch_time: payload.first_launch_time,
        last_date: payload.last_date,
        collected: payload.collected_cards,
        onboarding_seen: payload.onboarding_seen,
        bonus_cards: payload.bonus_cards,
        invited_friends: payload.invited_friends
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"saved"}' });
      return;
    }

    if (state.loadDelayMs) await new Promise((resolve) => setTimeout(resolve, state.loadDelayMs));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(state.value || { exists: false })
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const state = { value: null, loadDelayMs: 0 };
  try {
    const firstDevice = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await installProgressBackend(firstDevice, state);
    const firstPage = await firstDevice.newPage();
    await installTelegramStub(firstPage);
    await firstPage.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    await firstPage.evaluate(() => {
      localStorage.setItem('oracle_10_trends_release_v23_telegram_555', JSON.stringify({
        firstLaunchTime: String(Date.now()),
        lastDate: new Date().toDateString(),
        collected: [2],
        onboardingSeen: true,
        timerSeen: true,
        bonusCards: 0,
        invitedFriends: 0
      }));
    });
    await firstPage.reload({ waitUntil: 'domcontentloaded' });
    const saveRequest = firstPage.waitForRequest((request) => request.postData()?.includes('trend_deck_save_v2'));
    await firstPage.click('[data-action="openTrends"]');
    await firstPage.waitForFunction(() => window.MirofacturaTrendDeck?.isReady?.() === true, null, { timeout: 25000 });
    await saveRequest;
    for (let attempt = 0; attempt < 20 && !state.value; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert(state.value, 'Local-only progress was not repaired in Baserow');
    await firstPage.close();
    await firstDevice.close();

    state.loadDelayMs = 6500;
    const secondDevice = await browser.newContext({ viewport: { width: 382, height: 688 } });
    await installProgressBackend(secondDevice, state);
    const secondPage = await secondDevice.newPage();
    await installTelegramStub(secondPage);
    await secondPage.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    await secondPage.click('[data-action="openTrends"]');
    await secondPage.waitForFunction(() => window.MirofacturaTrendDeck?.isReady?.() === true, null, { timeout: 25000 });
    assert(await secondPage.locator('#onboarding-view.visible').count() === 0, 'Second device started onboarding again');
    await secondPage.click('[data-trends-tab="collection"]');
    await secondPage.waitForSelector('#lib-grid-content .lib-card-container');
    assert(await secondPage.locator('#lib-grid-content .lib-card-container').count() === 1, 'Second device did not restore the saved card');

    const cardWidth = await secondPage.locator('#lib-grid-content .lib-card-container').first().evaluate((card) => card.getBoundingClientRect().width);
    assert(cardWidth >= 220, `Collection card is unexpectedly small: ${cardWidth}`);
    await secondDevice.close();

    state.loadDelayMs = 0;
    state.value = {
      ...state.value,
      last_date: new Date().toDateString(),
      collected: '[2]',
      bonus_cards: '1'
    };
    const cardDevice = await browser.newContext({ viewport: { width: 382, height: 688 } });
    await installProgressBackend(cardDevice, state);
    const cardPage = await cardDevice.newPage();
    await installTelegramStub(cardPage);
    await cardPage.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    await cardPage.click('[data-action="openTrends"]');
    await cardPage.waitForFunction(() => window.MirofacturaTrendDeck?.isReady?.() === true, null, { timeout: 25000 });
    await cardPage.waitForSelector('#active-ui', { state: 'visible' });

    const canvas = cardPage.locator('#canvas-container canvas');
    const canvasRect = await canvas.boundingBox();
    const hitPoints = [];
    for (let y = canvasRect.y + 20; y < canvasRect.y + canvasRect.height - 20; y += 24) {
      for (let x = canvasRect.x + 20; x < canvasRect.x + canvasRect.width - 20; x += 20) {
        await cardPage.mouse.move(x, y);
        if (await canvas.evaluate((element) => element.style.cursor === 'crosshair')) hitPoints.push({ x, y });
      }
    }
    assert(hitPoints.length > 20, 'Daily card hit area was not found');
    const left = Math.min(...hitPoints.map((point) => point.x));
    const right = Math.max(...hitPoints.map((point) => point.x));
    const top = Math.min(...hitPoints.map((point) => point.y));
    const bottom = Math.max(...hitPoints.map((point) => point.y));
    const dailyCardWidth = right - left + 20;
    assert(dailyCardWidth >= 215, `Daily card is unexpectedly small: ${dailyCardWidth}`);

    for (let row = 0; row < 10; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        const x = left + ((right - left) * (column + 0.5)) / 12;
        const y = top + ((bottom - top) * (row + 0.5)) / 10;
        await cardPage.mouse.move(x, y);
        await cardPage.mouse.down();
        await cardPage.mouse.move(x + 16, y);
        await cardPage.mouse.up();
      }
    }
    await cardPage.waitForSelector('.collection-hint', { state: 'visible', timeout: 10000 });
    await cardPage.waitForTimeout(1000);
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    await cardPage.mouse.click(centerX, centerY);
    await cardPage.waitForTimeout(900);
    assert(await cardPage.locator('.collection-hint').evaluate((hint) => getComputedStyle(hint).visibility === 'hidden'), 'Saved-card notice still covers the open-text action');
    const drawnButtonY = top + ((bottom - top) * 705) / 768;
    const buttonProbe = await cardPage.evaluate(({ x, y }) => ({
      point: { x, y },
      stack: document.elementsFromPoint(x, y).slice(0, 6).map((element) => ({
        tag: element.tagName,
        id: element.id,
        className: typeof element.className === 'string' ? element.className : ''
      }))
    }), { x: centerX, y: drawnButtonY });
    await cardPage.screenshot({ path: require('path').join(process.env.MIROFAKTURA_ARTIFACT_DIR || '.', 'daily-card-back-button.png'), fullPage: true });
    await cardPage.mouse.click(centerX, drawnButtonY);
    await cardPage.waitForSelector('#read-trend-modal.visible', { timeout: 3000 }).catch((error) => {
      throw new Error(`${error.message}\nButton probe: ${JSON.stringify(buttonProbe)}`);
    });
    const modalGeometry = await cardPage.evaluate(() => {
      const modal = document.getElementById('read-trend-modal').getBoundingClientRect();
      const content = document.querySelector('#read-trend-modal .modal-content').getBoundingClientRect();
      const title = document.getElementById('read-trend-title').getBoundingClientRect();
      const text = document.getElementById('read-trend-text');
      const source = document.getElementById('read-trend-source').getBoundingClientRect();
      const action = document.getElementById('btn-read-apply').getBoundingClientRect();
      const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
      return {
        modal: { top: modal.top, bottom: modal.bottom },
        content: { top: content.top, bottom: content.bottom },
        title: { top: title.top, bottom: title.bottom },
        text: { clientHeight: text.clientHeight, scrollHeight: text.scrollHeight, overflowY: getComputedStyle(text).overflowY },
        source: { top: source.top, bottom: source.bottom, display: getComputedStyle(document.getElementById('read-trend-source')).display },
        action: { top: action.top, bottom: action.bottom },
        nav: { top: nav.top, bottom: nav.bottom }
      };
    });
    assert(modalGeometry.content.top >= modalGeometry.modal.top - 1, `Telegram trend title escapes above the dialog: ${JSON.stringify(modalGeometry)}`);
    assert(modalGeometry.title.top >= modalGeometry.content.top + 8, `Telegram trend title is clipped: ${JSON.stringify(modalGeometry)}`);
    assert(modalGeometry.content.bottom <= modalGeometry.nav.top - 8, `Telegram dialog is covered by navigation: ${JSON.stringify(modalGeometry)}`);
    assert(modalGeometry.source.display !== 'none' && modalGeometry.source.bottom <= modalGeometry.nav.top - 8, `Telegram trend source is hidden by navigation: ${JSON.stringify(modalGeometry)}`);
    assert(modalGeometry.action.bottom <= modalGeometry.nav.top - 8, `Telegram trend action is hidden by navigation: ${JSON.stringify(modalGeometry)}`);
    assert(modalGeometry.text.clientHeight >= 48 && modalGeometry.text.overflowY === 'auto', `Telegram trend text has no usable scroll area: ${JSON.stringify(modalGeometry)}`);
    await cardPage.locator('#read-trend-text').evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await cardPage.screenshot({ path: require('path').join(process.env.MIROFAKTURA_ARTIFACT_DIR || '.', 'telegram-read-modal.png'), fullPage: true });
    await cardDevice.close();

    console.log(JSON.stringify({ ok: true, restoredCards: 1, collectionCardWidth: cardWidth, dailyCardWidth, dailyCardAction: true, modalGeometry }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
