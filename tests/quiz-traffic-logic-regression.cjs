const { chromium } = require('playwright');
const { readFileSync } = require('fs');

const BASE_URL = process.env.MIROFAKTURA_TEST_URL || 'http://127.0.0.1:8765';
const executablePath = process.env.MIROFAKTURA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installMaxStub(page) {
  await page.addInitScript(() => {
    window.WebApp = {
      initData: 'max-test-data',
      initDataUnsafe: { user: { id: 919, first_name: 'Макс' } },
      user: { id: 919, first_name: 'Макс' },
      BackButton: { show() {}, hide() {}, onClick() {}, offClick() {} },
      ready() {},
      expand() {},
      disableVerticalSwipes() {}
    };
  });
  await page.route('https://st.max.ru/js/max-web-app.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: ''
  }));
}

async function answerQuiz(page, answer) {
  await page.click(`[data-answer="${answer}"]`);
  await page.click('[data-action="nextQuestion"]');
}

async function focusTrafficChannel(page, channelId) {
  await page.click(`[data-action="focusTrafficChannel"][data-channel="${channelId}"]`);
  return (await page.locator('#traffic-channel-focus .lead-model').innerText()).replace(/\s+/g, ' ').trim();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await installMaxStub(page);
    await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });

    await page.click('[data-action="startQuiz"]');
    await page.click('[data-answer="idea"]');
    const ideaComment = (await page.locator('#stepan-comment').innerText()).replace(/\s+/g, ' ');
    assert(ideaComment.includes('где можно искать первых покупателей'), 'The idea branch still refers to existing clients');
    await page.click('[data-action="nextQuestion"]');
    assert(
      (await page.locator('.question-card h1').innerText()) === 'Где вы планируете искать первых клиентов?',
      'The idea branch did not receive its own client question'
    );
    await answerQuiz(page, 'random');
    assert(
      (await page.locator('.question-card h1').innerText()) === 'Что нужно проверить сначала?',
      'The idea branch did not receive its own task question'
    );
    assert(await page.locator('[data-answer="products"]').count() === 0, 'Product-line material is still offered when there is only an idea');
    assert(await page.locator('[data-answer="traffic"]').count() === 1, 'Traffic task is missing from the idea branch');
    assert(await page.locator('[data-answer="sales"]').count() === 1, 'Sales task is missing from the idea branch');

    await page.click('[data-answer="traffic"]');
    await page.click('[data-action="prevQuestion"]');
    await page.click('[data-action="prevQuestion"]');
    await page.click('[data-answer="one"]');
    const oneProductComment = (await page.locator('#stepan-comment').innerText()).replace(/\s+/g, ' ');
    assert(oneProductComment.includes('откуда к нему приходят клиенты'), 'The one-product comment does not lead to the next question');
    await page.click('[data-action="nextQuestion"]');
    assert(
      (await page.locator('.question-card h1').innerText()) === 'Откуда сейчас приходят клиенты?',
      'The standard client question was not restored after changing the first answer'
    );
    assert(await page.locator('[data-action="nextQuestion"]').isDisabled(), 'A later quiz answer survived after the first answer changed');
    await answerQuiz(page, 'word');
    assert(await page.locator('[data-answer="products"]').count() === 1, 'Product-line task did not return for an existing product');

    await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="openLibrary"]');
    await page.click('[data-action="openMaterial"][data-material="traffic"]');
    const trafficAnswers = {
      offer: 'services',
      audience: 'people',
      reach: 'national',
      goal: 'new-audience',
      current: 'content',
      budget: 'small'
    };
    for (const [question, value] of Object.entries(trafficAnswers)) {
      await page.click(`[data-action="chooseTrafficAtlasAnswer"][data-question="${question}"][data-value="${value}"]`);
    }
    assert((await page.locator('.traffic-answer-status span').innerText()) === '6 из 6', 'Traffic navigator does not require all six answers');
    const trafficCandidates = await page.locator('.channel-recommendation-card').evaluateAll((cards) => cards.map((card) => card.dataset.channel));
    assert(trafficCandidates.length === 4, `Expected four traffic candidates, got ${trafficCandidates.length}`);
    const currentContentChannels = ['media', 'seo-geo', 'content', 'threads'];
    assert(!trafficCandidates.some((channel) => currentContentChannels.includes(channel)), 'The traffic navigator recommends a channel group that already works');

    const banksCopy = await focusTrafficChannel(page, 'banks');
    assert(banksCopy.includes('доля обращений от подходящих клиентов'), 'Bank advertising copy was not corrected');
    const marketplaceCopy = await focusTrafficChannel(page, 'marketplaces');
    assert(marketplaceCopy.includes('товаров с готовыми карточками'), 'Marketplace copy still uses the unclear product-material phrase');
    const telegramAdsCopy = await focusTrafficChannel(page, 'telegram-ads');
    assert(telegramAdsCopy.includes('точное попадание в нужную аудиторию'), 'Telegram Ads copy was not corrected');
    const geoCopy = await focusTrafficChannel(page, 'geo');
    assert(geoCopy.includes('больше переходов и обращений'), 'Map-platform copy was not corrected');

    const appSource = readFileSync('app.js', 'utf8');
    assert(appSource.includes('схема продуктовой воронки'), 'Product-line gift still uses the unclear constructor wording');

    await context.close();
    console.log(JSON.stringify({ ok: true, quizBranches: ['idea', 'one'], trafficQuestions: 6, trafficCandidates }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
