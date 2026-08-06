const { chromium } = require('playwright');

const BASE_URL = process.env.MIROFAKTURA_TEST_URL || 'http://127.0.0.1:8765';
const executablePath = process.env.MIROFAKTURA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installPlatformStubs(page) {
  await page.addInitScript(() => {
    window.__copiedText = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text) => { window.__copiedText = text; } }
    });
    window.Telegram = {
      WebApp: {
        initData: 'telegram-test-data',
        initDataUnsafe: { user: { id: 888, first_name: 'Телеграм' } },
        BackButton: { show() {}, hide() {}, onClick() {}, offClick() {} },
        ready() {}, expand() {}, disableVerticalSwipes() {},
        openTelegramLink(url) { window.__openedTelegramLink = url; },
        openLink(url) { window.__openedTelegramLink = url; }
      }
    };
    window.WebApp = {
      initData: 'max-test-data',
      initDataUnsafe: { user: { id: 777, first_name: 'Макс' } },
      user: { id: 777, first_name: 'Макс' },
      BackButton: { show() {}, hide() {}, onClick() {}, offClick() {} },
      ready() {}, expand() {}, disableVerticalSwipes() {},
      openMaxLink(url) { window.__openedMaxLink = url; },
      openLink(url) { window.__openedMaxLink = url; }
    };
  });
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://st.max.ru/js/max-web-app.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
}

async function answer(page, value) {
  await page.click(`[data-answer="${value}"]`);
  await page.click('[data-action="nextQuestion"]');
}

async function completeQuiz(page, { product = 'one', source = 'content', task = 'content-plan', resources = ['time', 'ideas'], budget = 'under-100', obstacle = 'draft' } = {}) {
  await page.click('[data-action="startQuiz"]');
  await answer(page, product);
  await answer(page, source);
  await answer(page, task);
  for (const resource of resources) await page.click(`[data-answer="${resource}"]`);
  await page.click('[data-action="nextQuestion"]');
  await answer(page, budget);
  await answer(page, obstacle);
  await page.waitForSelector('.route-v2-result-screen');
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await installPlatformStubs(page);
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });
    assert(await page.locator('.home-links .home-link').count() === 3, 'The main Telegram home screen changed');
    assert((await page.locator('.share-btn').innerText()).trim() === 'Поделиться', 'The main Telegram share button changed');
    assert(await page.locator('.route-v2').count() === 0, 'The main Telegram page received the test variant');

    await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('.share-btn').innerText()).trim() === 'Поделиться', 'The main MAX share button changed');
    assert(await page.locator('.route-v2').count() === 0, 'The main MAX page received the test variant');

    await page.goto(`${BASE_URL}/next/`, { waitUntil: 'domcontentloaded' });
    assert(await page.locator('.route-v2-home-screen').count() === 1, 'Telegram preview did not enable route-v2');
    assert(await page.locator('.home-links').count() === 0, 'Old home cards are visible in route-v2');
    assert(await page.locator('.day-card[data-action="openTrends"]').count() === 1, 'The trend deck is missing from route-v2 home');
    assert((await page.locator('.share-btn').innerText()).trim() === 'Поделиться', 'Telegram preview lost the share button');

    await completeQuiz(page);
    const blocks = await page.locator('.route-v2-result-screen .brand-label').evaluateAll((nodes) => nodes.map((node) => ({ text: node.textContent.trim(), top: node.getBoundingClientRect().top + scrollY })));
    const insight = blocks.find((item) => item.text === 'Что видно по вашим ответам');
    const advice = blocks.find((item) => item.text === 'Что можно сделать сначала');
    const tool = blocks.find((item) => item.text === 'Инструмент для вашей задачи');
    assert(insight && advice && tool && insight.top < advice.top && advice.top < tool.top, `Result blocks are in the wrong order: ${JSON.stringify(blocks)}`);
    assert((await page.locator('.route-v2-resource-note').innerText()).includes('одной небольшой проверки'), 'Budget did not adjust the first-test scale');
    assert(await page.locator('[data-action="openMaterial"][data-material="content-plan"]').count() === 1, 'Content navigator was not selected for the content task');
    assert(await page.locator('.route-v2-advice-step').count() >= 3, 'Potap advice is still rendered as one long paragraph');
    assert(await page.locator('.route-v2-help-copy p').count() >= 2, 'Mirofactura help copy is still rendered as one long paragraph');
    assert(await page.locator('.route-v2-contact-card').count() === 1, 'The final Mirofactura contact card is missing');
    assert((await page.locator('.route-v2-contact-card [data-action="openElenaContact"]').innerText()).trim() === 'Написать нам', 'The final contact card uses the wrong action');
    await page.click('[data-action="copyQuizResult"]');
    const copied = await page.evaluate(() => window.__copiedText);
    for (const expected of ['Ресурсы для продвижения', 'Бюджет на месяц', 'Инструмент: Контент-навигатор', 'Первый шаг']) {
      assert(copied.includes(expected), `Copied result misses: ${expected}`);
    }

    await page.click('[data-action="openMaterial"][data-material="content-plan"]');
    await page.waitForSelector('.route-v2-content-screen');
    assert(await page.locator('.route-v2-content-mode').count() === 3, 'Content navigator does not offer three routes');
    assert(await page.locator('.route-v2-content-route').count() === 1, 'Quiz did not open the route branch');
    assert(await page.locator('.content-checklist').count() === 0, 'Checklist leaks into the route branch');
    const routeAnswers = ['sales', 'max', 'visual', 'response'];
    for (const value of routeAnswers) await page.click(`[data-action="chooseContentNavigatorAnswer"][data-value="${value}"]`);
    assert(await page.locator('.material-outcome:not(.muted)').count() === 1, 'Route result did not appear after the fourth answer');

    await page.click('[data-action="chooseContentNavigatorMode"][data-mode="checklist"]');
    assert(await page.locator('.content-checklist').count() === 1, 'Checklist branch did not open');
    assert(await page.locator('.route-v2-content-route').count() === 0, 'Route branch remains visible beside the checklist');
    await page.click('[data-action="chooseContentChecklistFormat"][data-value="visual"]');
    assert(await page.locator('[data-check="max-carousel"]').count() === 1, 'MAX visual checklist is missing its carousel check');
    await page.click('[data-action="toggleContentChecklist"][data-check="goal"]');

    await page.click('[data-action="chooseContentNavigatorMode"][data-mode="reference"]');
    assert(await page.locator('.content-checklist').count() === 0, 'Checklist leaks into the reference branch');
    await page.click('[data-action="chooseContentNavigatorGuide"][data-value="max"]');
    const referenceText = (await page.locator('.route-v2-content-reference').innerText()).toLowerCase();
    assert(referenceText.includes('структура публикации'), 'Reference branch misses the publication structure');
    assert(referenceText.includes('тип контента'), 'Reference branch mixes or misses content types');
    assert(await page.locator('.route-v2-platform-card h2').innerText() === 'MAX', 'Reference branch opened the wrong platform');

    await page.click('[data-action="chooseContentNavigatorMode"][data-mode="route"]');
    assert(await page.locator('.material-outcome:not(.muted)').count() === 1, 'Route answers were lost after switching branches');
    await page.click('[data-action="chooseContentNavigatorMode"][data-mode="checklist"]');
    assert(await page.locator('[data-action="toggleContentChecklist"][data-check="goal"]').getAttribute('aria-pressed') === 'true', 'Checklist state was lost after switching branches');

    await page.goto(`${BASE_URL}/next/`, { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="startQuiz"]');
    await answer(page, 'idea');
    assert(await page.locator('.question-card h1').innerText() === 'Где вы планируете искать первых клиентов?', 'Idea branch uses the existing-client question');
    await answer(page, 'random');
    assert(await page.locator('[data-answer="products"]').count() === 0, 'Idea branch offers a product-line diagnosis without a product');

    await page.goto(`${BASE_URL}/next/`, { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="startQuiz"]');
    await answer(page, 'one');
    await answer(page, 'content');
    await answer(page, 'traffic');
    await page.click('[data-action="prevQuestion"]');
    await page.click('[data-action="prevQuestion"]');
    await page.click('[data-answer="ads"]');
    await page.click('[data-action="nextQuestion"]');
    assert(await page.locator('[data-action="nextQuestion"]').isDisabled(), 'Changing a previous answer did not clear later quiz answers');

    await page.goto(`${BASE_URL}/next/`, { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="startQuiz"]');
    await answer(page, 'one');
    await answer(page, 'content');
    await answer(page, 'traffic');
    assert((await page.locator('.quiz-mascot img').getAttribute('src')).includes('stepan-resources-question-v2.webp'), 'Route-v2 still uses the old resources illustration');
    await page.click('[data-answer="time"]');
    await page.click('[data-answer="ideas"]');
    await page.click('[data-answer="time"]');
    assert(await page.locator('[data-answer="time"]').getAttribute('aria-pressed') === 'false', 'Resource multi-select cannot remove an answer');
    assert(await page.locator('[data-answer="ideas"]').getAttribute('aria-pressed') === 'true', 'Resource multi-select lost another selected answer');

    for (const [task, material] of [['traffic', 'traffic'], ['sales', 'sales'], ['products', 'products']]) {
      await page.goto(`${BASE_URL}/next/`, { waitUntil: 'domcontentloaded' });
      await completeQuiz(page, { task, resources: ['budget', 'team'], budget: 'over-500', obstacle: 'recommendation' });
      assert(await page.locator(`[data-action="openMaterial"][data-material="${material}"]`).count() === 1, `Task ${task} selected the wrong material`);
      assert((await page.locator('.route-v2-resource-note').innerText()).includes('что будет считаться результатом'), `High budget did not affect the ${task} result`);
    }

    await page.goto(`${BASE_URL}/next/max/`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/max\/\?variant=route-v2/);
    await page.waitForSelector('.route-v2-home-screen');
    assert(await page.locator('script[src*="route-v2-resources-05"]').count() === 1, 'MAX preview loaded the cached main app script');
    assert((await page.locator('.share-btn').innerText()).trim() === 'Канал в MAX', 'MAX preview did not replace the top share button');
    await page.click('.share-btn');
    assert(await page.evaluate(() => window.__openedMaxLink) === 'https://max.ru/channel_mirofactura', 'MAX channel button opened the wrong URL');

    await page.goto(`${BASE_URL}/max/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.home-screen');
    assert(await page.locator('script[src*="product-line-result-01"]').count() === 1, 'The main MAX page stopped using its stable app script');
    assert(await page.locator('.route-v2-home-screen').count() === 0, 'The main MAX page unexpectedly enabled route-v2');

    for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 600 }]) {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE_URL}/next/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => { document.documentElement.style.fontSize = '22px'; });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 1, `Route-v2 overflows horizontally at ${viewport.width}x${viewport.height}: ${overflow}px`);
    }

    assert(errors.length === 0, `Console errors: ${errors.join(' | ')}`);
    await context.close();
    console.log(JSON.stringify({ ok: true, quizQuestions: 6, resultKeys: ['traffic', 'sales', 'content-plan', 'products'], contentBranches: ['route', 'checklist', 'reference'] }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
