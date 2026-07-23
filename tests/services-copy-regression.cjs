const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.MIROFAKTURA_TEST_URL || 'http://127.0.0.1:8765';
const executablePath = process.env.MIROFAKTURA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = process.env.MIROFAKTURA_ARTIFACT_DIR
  ? path.resolve(process.env.MIROFAKTURA_ARTIFACT_DIR)
  : null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const tasks = [
  {
    id: 'strategy',
    label: 'Увеличить прибыль',
    title: 'Аудит и стратегия',
    text: 'Находим, как быстрее и проще увеличить прибыль и снизить расходы именно в вашем бизнесе. Для этого проводим аудит системы маркетинга в компании и выявляем точки роста. Это не страшно, но иногда больно - понимать, что увеличить прибыль можно было еще вчера.\nДальше - разрабатываем стратегию, как прийти к новым результатам.',
    example: 'У онлайн-школы несколько курсов, но после просмотра сайта люди редко оставляют заявку. Клиенты не могли разобраться, какой курс нужен именно им и просто уходили. При отличном трафике на сайт, курсы продавались только через запуски.\nРешение: добавить мини-приложение для подбора курса под задачи клиента, которое ведет на консультацию менеджера и усиление блоков, демонстрирующих разницу между программами (кнопка сравнить) и тарифами.',
    benefit: 'Понятный план работы: что улучшить в вашей воронке продаж, как поменять описание продукта или оффер в рекламе, какие способы привлечения аудитории протестировать, где клиенты уходят, но могут вернуться. Что из этого всего реализовать первым и по каким показателям оценивать результат.'
  },
  {
    id: 'traffic',
    label: 'Найти новых клиентов',
    title: 'Воронки продаж и интерактивные механики',
    text: 'Узнаем, кто нам нужен, где и как они ищут варианты решения своих проблем и предлагаем купить: нужным людям, в том самом месте и в правильный момент.\nДобавляем впечатления и игровые механики, чтобы число купивших было максимальным.\nНикакой магии: знание маркетинга, психологии и точный расчет.',
    example: 'Пост или реклама ведут в мини-приложение, в котором человек отвечает на несколько вопросов, получает рекомендации по его задачам и подходящий вариант продукта и может сразу оставить заявку. Узнали? По этой схеме работает и наш мир.',
    benefit: 'Управляемый маршрут клиентов от интереса к покупке, с учетом паттернов поведения и ключевых триггеров.\nНе просто подписчиков и охваты, а деньги на счете.'
  },
  {
    id: 'content',
    label: 'Убедить клиентов купить именно у вас',
    title: 'Понятные описания продукта, контент и маскоты',
    text: 'Четко определяем для кого создан продукт, какую задачу он решает, что получает клиент и чем один вариант отличается от другого. На этой основе готовим тексты, страницы, презентации и контент. Если бренду нужен узнаваемый герой, разрабатываем маскота с внешностью, характером и своей ролью в общении с аудиторией.',
    example: 'Маскот объясняет сложную тему в постах, появляется в игре и мини-приложении и помогает людям узнавать бренд на разных площадках.',
    benefit: 'Клиент понимает: что вы предлагаете, почему нужно выбрать именно вас и какой продукт подходит в его ситуации. Команда получает понятные принципы для новых текстов и материалов.'
  },
  {
    id: 'retention',
    label: 'Вернуть клиентов за следующей покупкой',
    title: 'Повторные продажи и продуктовая линейка',
    text: 'Определяем, что можно предложить человеку после первой покупки и в какой момент это будет уместно. Продумываем продуктовую линейку, напоминания о сопутствующих и повторных покупках. Проектируем игровую программу лояльности (стимулирования повторных покупок и рекомендаций).',
    example: 'После первой покупки клиент получает обучающий материал, который помогает улучшить результат от продукта, а позже — предложение для следующей задачи. Например, после консультации можно предложить шаблон, сопровождение или отдельную услугу.',
    benefit: 'Экономию на привлечении аудитории (дешевле продать существующим клиентам, чем искать новых) и понятный сценарий повторных обращений. Клиент понимает, зачем возвращаться и какой продукт может понадобиться ему дальше.'
  },
  {
    id: 'launch',
    label: 'Запустить новый продукт или направление',
    title: 'От проверки гипотез до первых продаж',
    text: 'Превращаем идею в понятное предложение: исследуем рынок и оцениваем коммерческий потенциал, выбираем, кому лучше всего сможем помочь. Проверяем, готовы ли они платить за решение своей проблемы. Затем готовим подачу, материалы и сценарий запуска.',
    example: 'Исследование аудитории методом глубинных интервью показало, что ИТ-продукт в его первоначальной задумке покупать не готовы, зато есть набор функций, которые очень нужны клиентам и, если их реализовать, можно увеличить стоимость.',
    benefit: 'Снижение риска: вкладываете время и деньги в продукт, к которому люди уже проявили интерес и получаете пошаговый план действий и все инструменты и материалы для старта продаж.'
  },
  {
    id: 'support',
    label: 'Превратить маркетинг в работающую систему',
    title: 'Маркетинговое сопровождение',
    text: 'Определяем на какие продукты и сегменты клиентов сделать ставки, за счет чего можно достичь нужного результата и реализуем все запланированное. Анализируем полученный результат и придумываем, как сделать еще лучше. А еще, своевременно реагируем на все изменения, готовим контент, превращаем маркетинг в игру и игру в маркетинг.',
    example: 'Перед запуском рекламы, уже подготовлен весь дальнейший маршрут клиента: сайт, игровой чат-бот и серия писем по e-mail, презентация для встречи с менеджером. В это время контент в соцсетях также поддерживает воронку продаж и дает дополнительные заявки. Результаты каждого этапа фиксируются и вы видите, какая из гипотез сработала лучше, а где стоит что-то поправить. Маркетинг из "черного ящика" превращается в управляемый процесс.',
    benefit: 'Одна команда разрабатывает стратегию, готовит контент, запускает рекламу и отвечает за результаты. Вам не нужно координировать нескольких подрядчиков, пытаться состыковать их работу и каждый раз заново объяснять общую задачу.'
  },
  {
    id: 'automation',
    label: 'Освободить свое время',
    title: 'Автоматизация и ИИ-инструменты',
    text: 'Смотрим, какие действия команда повторяет каждый день: переносит заявки, отвечает на одинаковые вопросы, собирает отчёты или готовит типовые материалы. Подключаем формы, таблицы, CRM, рассылки и ИИ-помощников там, где автоматизация действительно экономит время.',
    example: 'После заявки данные автоматически попадают в таблицу или CRM, клиент получает нужное сообщение, а менеджер сразу видит его запрос и предыдущие действия.',
    benefit: 'Время тратится на важные задачи, а не рутину. Заявки и важная информация не теряются между разными сервисами. А каждое действие в маркетинге легко оценить по его результатам'
  }
];

async function installPlatformStub(page, platform) {
  await page.addInitScript((selectedPlatform) => {
    const common = {
      initData: `${selectedPlatform}-test-data`,
      initDataUnsafe: { user: { id: 777, first_name: 'Тест' } },
      user: { id: 777, first_name: 'Тест' },
      BackButton: { show() {}, hide() {}, onClick() {}, offClick() {} },
      ready() {},
      expand() {},
      disableVerticalSwipes() {},
      openLink() {}
    };
    if (selectedPlatform === 'max') {
      window.WebApp = { ...common, openMaxLink() {} };
    } else {
      window.Telegram = { WebApp: { ...common, openTelegramLink() {}, close() {} } };
    }
  }, platform);
  await page.route('https://st.max.ru/js/max-web-app.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://cb.multy.ai/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, found: false, progress: null })
  }));
}

async function testPlatform(browser, platform) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await installPlatformStub(page, platform);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${BASE_URL}${platform === 'max' ? '/max/' : '/'}`, { waitUntil: 'domcontentloaded' });
  await page.click('[data-page="contacts"]');
  await page.waitForSelector('#marketing-task-map');

  const labels = await page.locator('.task-node').allTextContents();
  assert(JSON.stringify(labels.map((value) => value.trim())) === JSON.stringify(tasks.map(({ label }) => label)), `${platform}: task labels do not match the workbook`);

  for (const task of tasks) {
    await page.click(`[data-task="${task.id}"]`);
    const actual = await page.locator('#marketing-task-detail').evaluate((detail) => {
      const rows = [...detail.querySelectorAll('dl > div')].map((row) => ({
        label: row.querySelector('dt')?.textContent.trim() || '',
        value: row.querySelector('dd')?.textContent.trim().replace(/\r\n/g, '\n') || ''
      }));
      return {
        title: detail.querySelector('h3')?.textContent.trim() || '',
        rows
      };
    });
    const expectedRows = [
      { label: 'Что сделаем', value: task.text },
      ...(task.example ? [{ label: 'Например', value: task.example }] : []),
      { label: 'Что получаете вы', value: task.benefit }
    ];
    assert(actual.title === task.title, `${platform}/${task.id}: title mismatch`);
    assert(JSON.stringify(actual.rows) === JSON.stringify(expectedRows), `${platform}/${task.id}: detail mismatch\n${JSON.stringify(actual, null, 2)}`);
  }

  const bottomClearance = await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const content = document.querySelector('.bottom-nav').previousElementSibling.getBoundingClientRect();
    return { gap: nav.top - content.bottom, navTop: nav.top, contentBottom: content.bottom };
  });
  assert(bottomClearance.gap >= 12, `${platform}: services content is covered by navigation: ${JSON.stringify(bottomClearance)}`);
  if (artifactDir) {
    fs.mkdirSync(artifactDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactDir, `services-${platform}.png`), fullPage: true });
  }
  assert(errors.length === 0, `${platform}: browser errors: ${errors.join('; ')}`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    await testPlatform(browser, 'telegram');
    await testPlatform(browser, 'max');
    console.log('services-copy-regression: ok');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
