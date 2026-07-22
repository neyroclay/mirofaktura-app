const { chromium } = require('playwright');

const BASE_URL = process.env.MIROFAKTURA_TEST_URL || 'http://127.0.0.1:8765';
const executablePath = process.env.MIROFAKTURA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installMaxStub(page) {
  await page.addInitScript(() => {
    window.WebApp = {
      initData: 'max-test-data',
      initDataUnsafe: { user: { id: 777, first_name: 'Макс' } },
      user: { id: 777, first_name: 'Макс' },
      BackButton: { show() {}, hide() {}, onClick() {}, offClick() {} },
      ready() {},
      expand() {},
      disableVerticalSwipes() {},
      openMaxLink(url) { window.__openedMaxLink = url; },
      openLink(url) { window.__openedMaxLink = url; }
    };
  });
  await page.route('https://st.max.ru/js/max-web-app.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: ''
  }));
}

async function installTelegramStub(page) {
  await page.addInitScript(() => {
    window.Telegram = {
      WebApp: {
        initData: 'telegram-test-data',
        initDataUnsafe: { user: { id: 888, first_name: 'Телеграм' } },
        BackButton: { show() {}, hide() {}, onClick() {}, offClick() {} },
        ready() {},
        expand() {},
        disableVerticalSwipes() {},
        openTelegramLink(url) { window.__openedTelegramLink = url; },
        openLink(url) { window.__openedTelegramLink = url; }
      }
    };
  });
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: ''
  }));
}

async function openMaterial(page, material) {
  if (await page.locator('.library-screen').count() === 0) {
    await page.click('[data-action="openLibrary"]');
  }
  await page.click(`[data-action="openMaterial"][data-material="${material}"]`);
  await page.waitForSelector('.material-screen');
}

async function assertMaterialFooter(page, material) {
  const button = page.locator('.material-home-return [data-page="home"]');
  assert(await button.count() === 1, `${material}: return-to-home button is missing`);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  const layout = await page.evaluate(() => {
    const buttonRect = document.querySelector('.material-home-return').getBoundingClientRect();
    const navRect = document.querySelector('.bottom-nav').getBoundingClientRect();
    return {
      clearance: navRect.top - buttonRect.bottom,
      navHeight: navRect.height,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      documentHeight: document.documentElement.scrollHeight
    };
  });
  assert(layout.clearance >= 12, `${material}: return-to-home button is covered by navigation (${JSON.stringify(layout)})`);
  await button.click();
  await page.waitForSelector('.home-screen');
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await installMaxStub(page);
    await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });

    await openMaterial(page, 'sales');
    const goalCopy = (await page.locator('[data-question="goal"][data-value="brand"]').textContent()).trim();
    assert(goalCopy === 'Привлечь новых клиентов', `Sales goal copy was not updated: ${goalCopy}`);
    const answers = {
      audience: 'both',
      goal: 'brand',
      resource: 'team',
      format: 'online',
      current: 'online'
    };
    for (const [question, value] of Object.entries(answers)) {
      await page.click(`[data-action="chooseSalesChannelSelector"][data-question="${question}"][data-value="${value}"]`);
    }
    const candidates = await page.locator('.channel-recommendation-card').evaluateAll((cards) => cards.map((card) => card.dataset.channel));
    assert(candidates.length === 3, `Expected three sales candidates, got ${candidates.length}`);
    assert(!candidates.includes('online'), 'The already working online channel was recommended again');
    await page.locator('.sales-zone-list [data-action="focusSalesChannel"][data-channel="offline"]').click();
    assert(await page.locator('#sales-channel-focus .sales-focus-card h3').textContent() === 'Офлайн', 'Sales channel detail heading uses the group name');
    await assertMaterialFooter(page, 'sales');

    await openMaterial(page, 'traffic');
    await assertMaterialFooter(page, 'traffic');

    await openMaterial(page, 'products');
    await assertMaterialFooter(page, 'products');

    await page.click('[data-page="contacts"]');
    assert(await page.locator('[data-action="focusContactMap"]').count() === 0, 'Redundant possibilities button is still visible');
    const maxContactButtons = page.locator('[data-action="openElenaContact"]');
    const maxContactCount = await maxContactButtons.count();
    assert(maxContactCount === 2, `Expected two MAX contact buttons, got ${maxContactCount}`);
    await maxContactButtons.nth(0).click();
    assert(
      await page.evaluate(() => window.__openedMaxLink) === 'https://max.ru/u/f9LHodD0cOL6WZFmWoaBowA5ZAdNLubiIRJlhbrL5vxjlmvr16DBtsGJcLY',
      'MAX contact button did not open Elena personal profile'
    );

    await context.close();

    const telegramContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const telegramPage = await telegramContext.newPage();
    await installTelegramStub(telegramPage);
    await telegramPage.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    await telegramPage.click('[data-page="contacts"]');
    const telegramContactButtons = telegramPage.locator('[data-action="openElenaContact"]');
    const telegramContactCount = await telegramContactButtons.count();
    assert(telegramContactCount === 2, `Expected two Telegram contact buttons, got ${telegramContactCount}`);
    await telegramContactButtons.nth(0).click();
    const telegramContactUrl = await telegramPage.evaluate(() => window.__openedTelegramLink);
    assert(
      telegramContactUrl === 'https://t.me/PopovaE',
      `Telegram contact button did not open Elena personal profile: ${telegramContactUrl}`
    );
    await telegramContext.close();

    console.log(JSON.stringify({ ok: true, materials: ['sales', 'traffic', 'products'] }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
