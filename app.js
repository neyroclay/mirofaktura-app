(function () {
  const app = document.getElementById('app');
  const MAX_CHANNEL_URL = 'https://max.ru/channel_mirofactura';
  const TELEGRAM_BOT_URL = 'https://t.me/mirofactura_bot';
  const ELIZAVETA_TELEGRAM_CHANNEL_URL = 'https://t.me/gameneurons';
  const ELENA_TELEGRAM_CHANNEL_URL = 'https://t.me/adviceperm';
  const CONTACT_EMAIL = 'info@mirofactura.ru';
  const PLATFORM_ALIASES = {
    max: 'max',
    tg: 'telegram',
    telegram: 'telegram',
  };
  const telegramWebApp = window.Telegram?.WebApp || null;
  const URL_PARAMS = new URLSearchParams(window.location.search);
  const TELEGRAM_LAUNCH_PARAMS = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const NATIVE_TRENDS_MODE = URL_PARAMS.get('trends_native');
  const NATIVE_TRENDS_ASSET_VERSION = '20260719-authors-01';
  const IS_TELEGRAM_LAUNCH = Boolean(
    telegramWebApp?.initData
    || telegramWebApp?.initDataUnsafe?.user?.id
    || TELEGRAM_LAUNCH_PARAMS.get('tgWebAppData')
    || TELEGRAM_LAUNCH_PARAMS.get('tgWebAppPlatform')
  );
  const IS_MAX_LAUNCH = Boolean(
    window.WebApp?.initData
    || window.WebApp?.initDataUnsafe?.user?.id
    || window.WebApp?.user?.id
    || window.WebApp?.start_param
  );
  const APP_PLATFORM = (() => {
    const params = URL_PARAMS;
    const explicit = String(params.get('platform') || params.get('messenger') || '').toLowerCase();
    if (PLATFORM_ALIASES[explicit]) return PLATFORM_ALIASES[explicit];
    if (IS_MAX_LAUNCH) return 'max';
    if (IS_TELEGRAM_LAUNCH) return 'telegram';

    const raw = String(window.MIROFAKTURA_PLATFORM || '').toLowerCase();
    return PLATFORM_ALIASES[raw] || 'max';
  })();
  const USE_NATIVE_TRENDS = NATIVE_TRENDS_MODE !== '0';
  const PLATFORM = {
    max: {
      key: 'max',
      messenger: 'MAX',
      entryUrl: MAX_CHANNEL_URL,
      channelUrl: MAX_CHANNEL_URL,
      channelLabel: '\u041a\u0430\u043d\u0430\u043b \u0432 MAX',
      channelText: 'Материалы о маркетинге, продуктах и цифровых мирах.',
    },
    telegram: {
      key: 'telegram',
      messenger: 'Telegram',
      entryUrl: TELEGRAM_BOT_URL,
      channelUrl: TELEGRAM_BOT_URL,
      channelLabel: 'Карманная Вселенная',
      channelText: 'Бот Мирофактуры с приложением, новыми материалами и напоминаниями.',
    },
  }[APP_PLATFORM];
  const STORY_DESTINATION_URL = PLATFORM.entryUrl;
  const STORY_DESTINATION_CTA_ACTION = APP_PLATFORM === 'telegram'
    ? 'Получить совет в боте Мирофактуры →'
    : 'Получить совет в канале Мирофактуры →';
  const STORY_CARD_ASSET_VERSION = '20260717-performance-01';
  const TELEGRAM_STORY_CARD_ASSETS = {
    products: './assets/story-telegram-products.png',
    sales: './assets/story-telegram-sales.png',
    traffic: './assets/story-telegram-traffic.png',
  };
  const SUBSCRIPTION_WEBHOOK_URL = window.MIROFAKTURA_SUBSCRIPTION_WEBHOOK_URL || '';
  const ACCESS_MODE = (() => {
    const params = new URLSearchParams(window.location.search);
    const mode = String(window.MIROFAKTURA_ACCESS_MODE || params.get('access') || params.get('mode') || '').toLowerCase();
    return ['gated', 'closed', 'protected'].includes(mode) ? 'gated' : 'open';
  })();
  const IS_OPEN_ACCESS = ACCESS_MODE === 'open';
  const getLaunchPage = () => {
    const maxStartParam = window.WebApp?.start_param
      || window.WebApp?.initDataUnsafe?.start_param
      || '';
    const telegramStartParam = telegramWebApp?.initDataUnsafe?.start_param || '';
    const raw = String(
      URL_PARAMS.get('screen')
      || URL_PARAMS.get('page')
      || URL_PARAMS.get('startapp')
      || URL_PARAMS.get('start_param')
      || URL_PARAMS.get('start')
      || TELEGRAM_LAUNCH_PARAMS.get('tgWebAppStartParam')
      || maxStartParam
      || telegramStartParam
      || ''
    ).toLowerCase().trim();

    const normalized = raw.replace(/^\/+/, '').split(/[?&#]/)[0];
    const pageAliases = {
      home: 'home',
      main: 'home',
      quiz: 'quiz',
      diagnostic: 'quiz',
      diagnostics: 'quiz',
      library: 'library',
      storage: 'library',
      pantry: 'library',
      trends: 'trends',
      trend: 'trends',
      deck: 'trends',
      card: 'trends',
      contacts: 'contacts',
      services: 'contacts',
      'page-11106': 'trends',
    };

    return pageAliases[normalized] || 'home';
  };

  if (APP_PLATFORM === 'telegram' && telegramWebApp) {
    telegramWebApp.ready();
    telegramWebApp.expand();
    if (USE_NATIVE_TRENDS && typeof telegramWebApp.disableVerticalSwipes === 'function') {
      telegramWebApp.disableVerticalSwipes();
    }
  }
  const assets = {
    logo: './assets/logo-black-yellow.webp',
    logoStory: './assets/logo-white-yellow.png',
    stepanStart: './assets/stepan-start.webp',
    stepanProduct: './assets/stepan-product-question.webp',
    stepanChannels: './assets/stepan-clients-channels.webp',
    stepanRegularity: './assets/stepan-sales-regularity.webp',
    stepanFinal: './assets/stepan-final-map.webp',
    aristarch: './assets/aristarch-recommendations.webp',
    aristarchStory: './assets/aristarch-recommendations.png',
    potap: './assets/potap-digital-system.webp',
    authors: './assets/authors-photo-labeled.jpg'
  };

  const quiz = [
    {
      kicker: 'Сначала — продукт',
      title: 'Что у вас уже есть для продажи?',
      hint: 'Выберите вариант, который точнее описывает вашу ситуацию.',
      image: assets.stepanProduct,
      note: 'Если предложение пока трудно описать одним предложением, это нормально. Для начала достаточно понять, что уже можно предложить клиенту.',
      answers: [
        ['one', 'Один основной продукт', 'Услуга, консультация, курс или другой главный формат.', 'Один продукт — уже основа. Теперь проверим, приводит ли он клиента к следующему шагу.'],
        ['many', 'Несколько продуктов или направлений', 'Они уже образуют линейку или пока продаются отдельно.', 'Несколько направлений — ещё не обязательно линейка. Посмотрим, связаны ли они для клиента или просто стоят рядом.'],
        ['idea', 'Пока только идея', 'Направление понятно, но само предложение ещё не оформлено.', 'Идея — это ещё не предложение. Ничего страшного. Дальше проверим, для кого и через какой канал её можно превратить в продукт.']
      ]
    },
    {
      kicker: 'Теперь — клиенты',
      title: 'Откуда сейчас приходят клиенты?',
      hint: 'Выберите основной источник, даже если он работает нерегулярно.',
      image: assets.stepanChannels,
      note: 'Неровный поток заявок не означает, что всё плохо. Сначала важно увидеть канал, который уже приводит людей, пусть и не каждый месяц.',
      answers: [
        ['word', 'Через рекомендации', 'Сарафан работает, но его сложно планировать.', 'Рекомендации работают, но плохо поддаются планированию. Посмотрим, какой канал можно добавить к ним.'],
        ['content', 'Через контент', 'Посты, видео, эфиры или канал уже приводят обращения.', 'Контент уже приводит людей — хорошо. Теперь важно понять, где он заканчивается просмотром, а где начинается продажа.'],
        ['ads', 'Через рекламу', 'Платные размещения уже работают или вы начинаете их тестировать.', 'Реклама даёт цифры быстрее других каналов. Проверим, есть ли у неё понятный продукт и следующий шаг.'],
        ['random', 'Из разных мест', 'Заявки появляются, но устойчивого источника пока нет.', 'Пока заявки приходят случайно, на этот поток трудно рассчитывать. Дальше посмотрим, какой канал можно развивать регулярно.']
      ]
    },
    {
      kicker: 'Выбираем задачу',
      title: 'Что сейчас важнее всего?',
      hint: 'Выберите задачу, которой стоит заняться в первую очередь.',
      image: assets.stepanRegularity,
      note: 'Не нужно решать всё сразу. Выберите вопрос, который сильнее всего мешает двигаться дальше сейчас.',
      answers: [
        ['traffic', 'Где искать новую аудиторию', 'Хочу выбрать каналы для первого теста.', 'Значит, ищем не все каналы сразу, а первый разумный тест.'],
        ['sales', 'Какие каналы продаж использовать', 'Хочу увидеть все варианты и выбрать следующий.', 'Список каналов сам по себе не поможет. Нужен один вариант, который подходит вашей ситуации.'],
        ['products', 'Как связать продукты', 'Хочу продумать линейку и повторные покупки.', 'Тогда будем смотреть, что человек покупает сначала и что ему можно предложить потом.']
      ]
    },
    {
      kicker: 'Последний вопрос',
      title: 'Что хотите получить в итоге?',
      hint: 'Выберите результат, который будет полезнее прямо сейчас.',
      image: assets.stepanFinal,
      note: 'Готово. Аристарх возьмёт выбранную задачу и покажет материал, с которого удобно начать.',
      answers: [
        ['recommendation', 'Получить короткую рекомендацию', 'Сразу увидеть, с чего лучше начать.', 'Хорошо. Сначала покажем несколько подходящих вариантов, а не весь список сразу.'],
        ['map', 'Сравнить все варианты', 'Посмотреть карту и понять различия.', 'Тогда сначала откроем общую карту, а уже потом можно выбрать один вариант.'],
        ['draft', 'Собрать свой черновик', 'Ответить на вопросы и сохранить итог.', 'Значит, нужен не только материал для чтения, но и результат, который можно забрать с собой.']
      ]
    }
  ];

  const warmedImageCache = [];
  const warmedImageSources = new Set();

  function warmImages(sources) {
    sources.forEach((source) => {
      if (!source || warmedImageSources.has(source)) return;
      warmedImageSources.add(source);
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
      warmedImageCache.push(image);
      image.decode?.().catch(() => {});
    });
  }

  function warmQuizImages() {
    warmImages([
      ...quiz.map((item) => item.image),
      assets.aristarch,
      assets.logoStory,
    ]);
  }

  function warmContactsImages() {
    warmImages([
      assets.potap,
      assets.authors,
    ]);
  }

  function warmAppImages() {
    warmImages([
      assets.logo,
      assets.logoStory,
      assets.stepanStart,
      ...quiz.map((item) => item.image),
      assets.aristarch,
      assets.potap,
      assets.authors,
      './assets/home-trend-creator.jpg',
      './assets/home-trend-ai-fatigue.jpg',
      './assets/home-trend-end-normal.jpg',
    ]);
  }

  function prepareImageReveals() {
    const instantImages = [
      '.mascot',
      '.quiz-mascot img',
      '.result-mascot img',
      '.library-mascot img',
      '.story-card-logo',
      '.story-card-mascot',
      '.potap-figure img',
      '.aristarch img',
      '.authors-photo img',
      '.day-card-cover img',
    ].join(',');

    app.querySelectorAll('img').forEach((image) => {
      if (image.matches(instantImages)) {
        image.classList.add('is-loaded');
        return;
      }

      if (image.complete && image.naturalWidth > 0) {
        image.classList.add('image-reveal', 'is-loaded');
      } else {
        image.classList.add('image-reveal');
        const reveal = () => window.requestAnimationFrame(() => image.classList.add('is-loaded'));
        image.addEventListener('load', reveal, { once: true });
      }
    });
  }

  const materials = {
    traffic: {
      tag: 'Новая аудитория',
      title: 'Атлас трафика 2026',
      text: 'Карта каналов привлечения: что можно быстро проверить, а что потребует больше времени, денег или подготовки.',
      service: 'Вовлечение и маркетинговое сопровождение',
      tone: ''
    },
    sales: {
      tag: 'Каналы продаж',
      title: 'Карта каналов продаж',
      text: 'Список из 16 каналов продаж и навигатор, который поможет выбрать один канал для следующего теста.',
      service: 'Стратегия, продажи и продукт-мир',
      tone: 'warm'
    },
    products: {
      tag: 'Повторные покупки',
      title: 'Линейки продуктов',
      text: 'Четыре модели продуктовых линеек и конструктор цепочки: от первого знакомства до следующей покупки.',
      service: 'Продуктовая система и экосистема',
      tone: 'deep'
    }
  };

  const marketingTasks = [
    {
      id: 'strategy',
      label: 'Непонятно, с чего начать',
      title: 'Стратегия и концепция',
      text: 'Изучаем продукт, аудиторию, текущий маркетинг и путь до покупки. Находим, где люди теряют интерес, что им непонятно и какое действие должно стать следующим.',
      example: 'У онлайн-школы несколько программ, но новым ученикам сложно выбрать подходящий уровень. Мы упрощаем линейку и собираем квиз: он помогает подобрать программу и объясняет, чем один уровень отличается от другого. После результата человек может сразу оставить заявку.',
      benefit: 'Команда получает концепцию проекта и план работы. Тексты, визуальный стиль, контент и цифровые продукты помогают решить одну общую задачу.'
    },
    {
      id: 'content',
      label: 'Продукт сложно объяснить',
      title: 'Упаковка, контент и маскоты',
      text: 'Сначала определяем, что бренд должен говорить и показывать. Затем создаём тексты, визуальную систему, страницы, презентации и контент. При необходимости разрабатываем маскота с внешностью, характером, речью и ролью в коммуникации.',
      example: 'Маскот объясняет сложные темы в постах, появляется в приложении и помогает аудитории узнавать бренд на разных площадках.',
      benefit: 'У продукта появляется понятная подача и узнаваемый образ. Команде проще выпускать новые материалы и сохранять единый стиль.'
    },
    {
      id: 'traffic',
      label: 'Люди быстро теряют интерес',
      title: 'Впечатления и игровые механики',
      text: 'Проектируем игры, квизы, квесты, коллекции и другие механики, через которые человек знакомится с продуктом в действии, а не только читает его описание.',
      example: 'Для новой линейки создаём мини-квест: товары становятся частью заданий, а в финале человек открывает подборку, составленную по его действиям в игре.',
      benefit: 'Интерактив удерживает внимание, помогает заметить особенности продукта и лучше запомнить предложение. Бизнес получает не развлечение ради развлечения, а инструмент для запуска, продажи, программы лояльности или повторного обращения.'
    },
    {
      id: 'automation',
      label: 'Нужен цифровой продукт',
      title: 'Продукты-миры и экосистемы',
      text: 'Создаём самостоятельный цифровой продукт — сайт, бот, игру, квиз или мини-приложение со своей задачей, сценарием и механикой. Если нужно связать несколько этапов, объединяем их в систему, где результаты одного действия используются дальше.',
      example: 'Это может быть витрина для всей продуктовой линейки, прогрев вокруг одного предложения, клуб для постоянной аудитории или онбординг для сотрудников и партнёров.',
      benefit: 'Бизнес получает продукт, который можно развивать: добавлять новые материалы, задания и предложения. Связанная система сокращает повторные вопросы и помогает продолжать работу с человеком с учётом его предыдущих действий.'
    },
    {
      id: 'support',
      label: 'Маркетинг ведётся урывками',
      title: 'Маркетинговое сопровождение',
      text: 'Берём на себя регулярную работу вокруг проекта: планируем контент и кампании, готовим посты и рассылки, проводим игровые активности и смотрим, что приводит людей к заявке, покупке или повторному обращению. Рекламу и автоматизацию подключаем, когда они действительно нужны.',
      example: 'Готовим серию постов, проводим игровую активацию, приводим в неё аудиторию и дорабатываем сценарий по результатам. Для повторяющихся задач можем настроить помощника, который ускорит подготовку черновиков и материалов.',
      benefit: 'Одна команда отвечает за стратегию, контент и интерактивные продукты. Не нужно координировать нескольких подрядчиков и каждый раз заново объяснять им общую задумку.'
    }
  ];

  const productLinesMaterial = {
    diagnostic: [
      {
        id: 'single',
        number: '01',
        title: 'Покупка чаще разовая',
        text: 'Клиент покупает один продукт или услугу, а дальше понятного продолжения пока нет.',
        result: 'Начните с одного следующего шага: что человек может купить после первого результата.',
        scores: { funnel: 2 }
      },
      {
        id: 'random',
        number: '02',
        title: 'Возвращаются, но случайно',
        text: 'Повторные покупки бывают, но зависят от личного контакта, напоминания или удачного момента.',
        result: 'Зафиксируйте 2–3 ситуации, когда клиенту уместно предложить следующий продукт.',
        scores: { chaos: 2, development: 1 }
      },
      {
        id: 'task',
        number: '03',
        title: 'Покупают под новую задачу',
        text: 'Люди возвращаются, когда появляется новый проект, сезон, уровень или проблема.',
        result: 'Разделите предложения по ситуациям клиента: с чего он начинает, что ему нужно на следующем уровне и с какой новой задачей он может вернуться.',
        scores: { development: 2 }
      },
      {
        id: 'system',
        number: '04',
        title: 'Система уже есть',
        text: 'Вы понимаете, что предложить после покупки, и часть клиентов регулярно идет дальше.',
        result: 'Следующий шаг — точнее разделить предложения: кому допродажа, кому меньшая версия, кому новый продукт.',
        scores: { funnel: 1, development: 1, chaos: 1, impression: 1 }
      }
    ],
    models: [
      {
        id: 'funnel',
        number: '01',
        title: 'Классическая воронка',
        text: 'Последовательно знакомит человека с компанией и подводит к основному продукту.',
        fit: 'Когда есть один главный продукт и понятный путь к покупке.',
        tags: ['one-main', 'launch', 'core-sale'],
        template: ['lead', 'tripwire', 'core', 'upsell', 'downsell', 'refusal']
      },
      {
        id: 'development',
        number: '02',
        title: 'Развитие клиента',
        text: 'Продукты выстраиваются по этапам: старт, следующий уровень, экспертность и новые задачи.',
        fit: 'Для долгой работы, B2B, обучения, спорта и помогающих практик.',
        tags: ['long', 'stages', 'growth'],
        template: ['lead', 'core', 'next']
      },
      {
        id: 'chaos',
        number: '03',
        title: 'Управляемый хаос',
        text: 'Любой продукт может стать точкой входа, а дальше человеку нужны уместные рекомендации.',
        fit: 'Для каталогов, библиотек продуктов и частых новинок.',
        tags: ['many', 'catalog', 'personal'],
        template: ['lead', 'core', 'next', 'upsell']
      },
      {
        id: 'impression',
        number: '04',
        title: 'Впечатляющие продукты',
        text: 'Линейка держится на серии, коллекции, заданиях или закрытых предложениях.',
        fit: 'Когда важно желание собрать, пройти или открыть продолжение.',
        tags: ['emotion', 'collection', 'community'],
        template: ['lead', 'tripwire', 'core', 'next']
      }
    ],
    modelDetails: [
      {
        id: 'funnel',
        title: 'Классическая воронка',
        text: 'Подходит, когда есть один главный продукт. Человек сначала знакомится с вами, затем пробует недорогой вход, покупает основной продукт и видит, что можно купить после него.',
        points: [
          'Лид-магнит обозначает задачу и помогает снизить стоимость привлечения.',
          'Недорогой вход снимает барьер первой оплаты и показывает качество работы.',
          'Основной продукт решает главную задачу клиента.',
          'Допродажа вверх увеличивает чек за счет пакета, расширенной версии или индивидуальной работы.',
          'Меньшая версия помогает тем, кто пока не готов купить полный продукт.',
          'Продукт после отказа дает небольшой вариант решения той же задачи.'
        ]
      },
      {
        id: 'development',
        title: 'Развитие клиента',
        text: 'Подходит, когда клиент работает с вами долго. Продукты распределяются по этапам: старт, следующий уровень, экспертность и новые задачи.',
        points: [
          'Хорошо работает в B2B, обучении, помогающих практиках, спорте и товарах для детей.',
          'Даже одну услугу можно разделить по темам и ситуациям.',
          'Следующий продукт появляется не случайно, а когда у клиента меняется задача или уровень.'
        ]
      },
      {
        id: 'chaos',
        title: 'Управляемый хаос',
        text: 'Подходит, когда продуктов много и любая покупка может стать первой. Главная задача — быстро предложить человеку уместное продолжение.',
        points: [
          'Можно идти от нового продукта к дополняющим.',
          'Можно вести от популярного продукта к следующему популярному.',
          'Можно группировать предложения по сегментам аудитории.',
          'Важно учитывать уже купленные продукты, чтобы не предлагать человеку одно и то же.'
        ]
      },
      {
        id: 'impression',
        title: 'Впечатляющие продукты',
        text: 'Подходит брендам, где повторная покупка держится на интересе: хочется собрать, пройти, открыть продолжение или получить особый вариант.',
        points: [
          'Геймификация: цепочка заданий, для которых нужны разные продукты.',
          'Коллекционирование: человеку хочется собрать серию.',
          'Закрытые серии и секретные продукты: предложения, которых нет в открытой продаже.'
        ]
      }
    ],
    selectorQuestions: [
      {
        id: 'portfolio',
        title: 'Как устроены продукты?',
        options: [
          ['one-main', 'Один основной'],
          ['many', 'Много самостоятельных'],
          ['stages', 'Для разных этапов'],
          ['collection', 'Серии и коллекции']
        ]
      },
      {
        id: 'relationship',
        title: 'Как долго работаете с клиентом?',
        options: [
          ['launch', 'Один запуск'],
          ['long', 'Месяцы и годы'],
          ['catalog', 'Зависит от покупки'],
          ['community', 'Возвращаются ради серии или участия']
        ]
      },
      {
        id: 'driver',
        title: 'Что ведет к следующей покупке?',
        options: [
          ['core-sale', 'Переход к основному продукту'],
          ['growth', 'Новая задача или новый уровень клиента'],
          ['personal', 'Персональная рекомендация'],
          ['emotion', 'Желание продолжить или собрать']
        ]
      }
    ],
    selectorScores: {
      portfolio: {
        'one-main': { funnel: 6, development: 1 },
        many: { chaos: 6, development: 1 },
        stages: { development: 6, funnel: 1 },
        collection: { impression: 6, chaos: 1 }
      },
      relationship: {
        launch: { funnel: 5, impression: 1 },
        long: { development: 5, chaos: 1 },
        catalog: { chaos: 5, funnel: 1 },
        community: { impression: 5, development: 1 }
      },
      driver: {
        'core-sale': { funnel: 7 },
        growth: { development: 7 },
        personal: { chaos: 7 },
        emotion: { impression: 7 }
      }
    },
    stages: [
      ['lead', 'Лид-магнит', 'Первое полезное касание'],
      ['tripwire', 'Недорогой вход', 'Маленькая первая покупка'],
      ['core', 'Основной продукт', 'Главное решение задачи'],
      ['upsell', 'Допродажа вверх', 'Пакет дороже или шире'],
      ['downsell', 'Меньшая версия', 'Вариант проще и дешевле'],
      ['refusal', 'Продукт после отказа', 'Небольшое решение той же задачи'],
      ['next', 'Следующий продукт', 'Новая задача после результата']
    ],
    support: [
      ['Письма и чат-боты', 'Напоминают о следующем подходящем продукте.'],
      ['Личная рекомендация', 'Помогает предложить продукт с учетом уже купленного.'],
      ['Блоки на сайте', 'Связывают продукты и помогают увеличить средний чек.'],
      ['История покупок', 'Не предлагайте человеку то, что он уже купил.']
    ]
  };

  const salesChannelsMaterial = {
    safety: [
      ['Сначала укрепите рабочий канал', 'Если один канал уже приводит клиентов, но работает нестабильно, сначала разберитесь с ним.'],
      ['Тестируйте по одному', 'Новый канал требует отдельного процесса, времени на запуск и понятных критериев оценки.'],
      ['Не добавляйте «чтобы было»', 'Канал должен окупать поддержку или усиливать другие способы продаж.'],
      ['Не копируйте конкурентов вслепую', 'Если канал работает у других, это еще не значит, что он сразу сработает у вас. Сначала разберите реализацию.']
    ],
    questions: [
      {
        id: 'audience',
        title: 'Кто обычно покупает?',
        options: [
          ['people', 'Частные клиенты'],
          ['companies', 'Компании'],
          ['both', 'Частные клиенты и компании']
        ]
      },
      {
        id: 'goal',
        title: 'Что сейчас важнее?',
        options: [
          ['fast', 'Быстрее получить продажи'],
          ['repeat', 'Повторные покупки'],
          ['brand', 'Стать заметнее'],
          ['scale', 'Масштабироваться']
        ]
      },
      {
        id: 'resource',
        title: 'Какой ресурс есть?',
        options: [
          ['low', 'Время и связи'],
          ['team', 'Команда'],
          ['budget', 'Бюджет'],
          ['expert', 'Экспертиза и переговоры']
        ]
      },
      {
        id: 'format',
        title: 'Где может происходить продажа?',
        options: [
          ['online', 'Дистанционно'],
          ['local', 'В конкретном месте или на выезде'],
          ['partners', 'Через партнёров'],
          ['all', 'Подходят разные форматы']
        ]
      },
      {
        id: 'current',
        title: 'Что уже приносит продажи?',
        options: [
          ['none', 'Стабильного канала пока нет'],
          ['online', 'Онлайн'],
          ['offline', 'Офлайн и мероприятия'],
          ['direct', 'Отдел продаж и прямые контакты'],
          ['partners', 'Партнёры и рекомендации']
        ]
      }
    ],
    channels: [
      {
        id: 'online',
        number: '01',
        title: 'Онлайн',
        zone: 'Базовые',
        short: 'Сайт, приложение, маркетплейсы, соцсети и мессенджеры.',
        text: 'Онлайн становится каналом продаж, когда у клиента есть понятное действие: купить, записаться или оставить заявку. Сегодня хотя бы одна рабочая онлайн-точка нужна почти любой компании.',
        tags: ['all', 'fast', 'low', 'b2c', 'b2b', 'online']
      },
      {
        id: 'offline',
        number: '02',
        title: 'Офлайн',
        zone: 'Базовые',
        short: 'Магазины, шоу-румы, офисы, салоны и флагманские точки.',
        text: 'Если продукт предполагает личное взаимодействие, офлайн незаменим. Здесь должны продавать не только сотрудники, но и оформление, акции, навигация, связь с онлайном и причина вернуться.',
        tags: ['local', 'b2c', 'team']
      },
      {
        id: 'sales-team',
        number: '03',
        title: 'Свой отдел продаж',
        zone: 'Базовые',
        short: 'Даже один сотрудник может заметно увеличить продажи.',
        text: 'Отдел продаж работает с исходящими контактами, входящими заявками, участниками мероприятий и повторными покупками. Для многих компаний это ближайшая точка роста.',
        tags: ['b2b', 'team', 'repeat', 'fast', 'online']
      },
      {
        id: 'events',
        number: '04',
        title: 'Мероприятия',
        zone: 'Коммуникация',
        short: 'Выставки, ярмарки, конференции, вебинары и презентации.',
        text: 'Можно участвовать в чужом мероприятии или проводить свое. Иногда продажи происходят сразу, иногда мероприятие только собирает лиды для дальнейшей работы.',
        tags: ['b2b', 'b2c', 'team', 'brand']
      },
      {
        id: 'partners',
        number: '05',
        title: 'Бизнес-партнеры',
        zone: 'Партнерства',
        short: 'Агенты, дилеры, интеграторы и реселлеры.',
        text: 'Партнер не просто размещает ссылку, а активно продает продукт. Обычно он получает скидку, комиссию или делает собственную наценку только после реальной продажи.',
        tags: ['b2b', 'low', 'scale', 'partners']
      },
      {
        id: 'competitors',
        number: '06',
        title: 'Конкуренты',
        zone: 'Партнерства',
        short: 'Нецелевые заявки, перегрузка и субподряд.',
        text: 'Конкуренты могут передавать небольшие или неподходящие им заявки, а при овербукинге привлекать вас как подрядчика. Канал требует отношений и навыка переговоров.',
        tags: ['b2b', 'low', 'expert', 'partners']
      },
      {
        id: 'remote',
        number: '07',
        title: 'Дистанционные продажи',
        zone: 'Коммуникация',
        short: 'Звонки, каталоги и прямые эфиры.',
        text: 'Телефонные продажи по-прежнему работают, особенно с автоматизацией и ИИ. Каталог можно добавлять к заказу, а прямые эфиры использовать как современный телемагазин.',
        tags: ['b2b', 'b2c', 'team', 'fast', 'online']
      },
      {
        id: 'tenders',
        number: '08',
        title: 'Тендеры',
        zone: 'Масштаб',
        short: 'Продажи крупным компаниям и государственным организациям.',
        text: 'У тендеров свои правила участия и конкуренции. Для одних компаний это основной канал, остальным разумнее пробовать его после появления запаса прочности.',
        tags: ['b2b', 'scale', 'expert', 'budget']
      },
      {
        id: 'corporate',
        number: '09',
        title: 'Корпоративные продажи',
        zone: 'Масштаб',
        short: 'Продукты для компаний и их сотрудников.',
        text: 'Платить может компания или сами сотрудники по корпоративной программе. В обе стороны можно связывать корпоративные и персональные продукты.',
        tags: ['b2b', 'scale', 'repeat', 'online']
      },
      {
        id: 'retail',
        number: '10',
        title: 'Сети и ретейл',
        zone: 'Масштаб',
        short: 'Чужие офлайн-точки, где представлен ваш продукт.',
        text: 'Канал прежде всего подходит производителям товаров. Он дает охват, но требует готовности к условиям сети, логистике, запасам и переговорам.',
        tags: ['b2c', 'scale', 'budget', 'local']
      },
      {
        id: 'vending',
        number: '11',
        title: 'Вендинг',
        zone: 'Нестандартные',
        short: 'Автоматы с товарами, услугами и сертификатами.',
        text: 'Через вендинг продают не только кофе и снеки: сертификат позволяет упаковать почти любую услугу. Потребуются аппарат, обслуживание и аренда места.',
        tags: ['b2c', 'budget', 'local']
      },
      {
        id: 'mobile',
        number: '12',
        title: 'Передвижные каналы',
        zone: 'Нестандартные',
        short: 'Выездные презентации, замеры и временные точки.',
        text: 'Продажа может происходить во время доставки, монтажа, установки или в мобильной точке. Особенно полезно, когда клиенту важно увидеть продукт в своей среде.',
        tags: ['local', 'team', 'b2c', 'b2b']
      },
      {
        id: 'everyone',
        number: '13',
        title: 'Продает каждый',
        zone: 'Партнерства',
        short: 'Сотрудники, клиенты, фанаты и знакомые передают заявки.',
        text: 'Чтобы этот канал работал, людям нужно коротко и понятно объяснить преимущества продукта и ситуации, в которых его стоит рекомендовать.',
        tags: ['all', 'low', 'brand', 'repeat', 'partners']
      },
      {
        id: 'regional',
        number: '14',
        title: 'Региональные продажи',
        zone: 'Масштаб',
        short: 'Менеджеры, офисы и филиалы в отдельных регионах.',
        text: 'Канал постепенно уступает дистанционной работе, но остается полезным там, где важны локальные связи, присутствие и обслуживание на месте.',
        tags: ['b2b', 'scale', 'team', 'local']
      },
      {
        id: 'network',
        number: '15',
        title: 'Сетевой бизнес',
        zone: 'Нестандартные',
        short: 'Многоуровневая сеть продавцов с комиссией.',
        text: 'Модель подходит продуктам, где важны личное общение и небольшая экспертиза продавца. Её отдельные элементы используют и крупные компании.',
        tags: ['b2c', 'scale', 'team', 'brand', 'partners']
      },
      {
        id: 'franchise',
        number: '16',
        title: 'Франчайзинг',
        zone: 'Масштаб',
        short: 'Продажа бренда, бизнес-модели и поддержки.',
        text: 'Покупатель должен получить процессы и материалы, которыми сможет пользоваться. Плохо упакованная франшиза быстро теряет доверие.',
        tags: ['scale', 'expert', 'budget', 'b2b', 'partners']
      }
    ],
    rules: {
      audience: {
        people: ['online', 'offline', 'events', 'remote', 'retail', 'vending', 'mobile', 'everyone', 'network'],
        companies: ['sales-team', 'partners', 'online', 'competitors', 'tenders', 'corporate', 'events', 'remote', 'regional', 'franchise'],
        both: ['online', 'events', 'sales-team', 'partners', 'everyone', 'remote', 'offline']
      },
      goal: {
        fast: ['sales-team', 'online', 'remote', 'events', 'competitors', 'everyone'],
        repeat: ['sales-team', 'online', 'offline', 'remote', 'corporate', 'everyone'],
        brand: ['events', 'online', 'offline', 'everyone', 'network', 'franchise'],
        scale: ['partners', 'tenders', 'corporate', 'retail', 'regional', 'network', 'franchise', 'online']
      },
      resource: {
        low: ['online', 'partners', 'competitors', 'everyone', 'events'],
        team: ['sales-team', 'remote', 'events', 'offline', 'mobile', 'regional', 'network'],
        budget: ['online', 'tenders', 'retail', 'vending', 'offline', 'franchise'],
        expert: ['competitors', 'partners', 'tenders', 'corporate', 'franchise', 'events']
      },
      format: {
        online: ['online', 'remote', 'sales-team', 'events', 'corporate'],
        local: ['offline', 'mobile', 'vending', 'events', 'retail', 'regional'],
        partners: ['partners', 'competitors', 'everyone', 'network', 'franchise', 'retail'],
        all: ['online', 'sales-team', 'events', 'partners', 'everyone', 'remote']
      },
      current: {
        none: ['online', 'sales-team', 'events', 'partners', 'offline', 'remote'],
        online: ['sales-team', 'events', 'partners', 'offline', 'everyone', 'remote', 'corporate'],
        offline: ['online', 'partners', 'sales-team', 'remote', 'everyone', 'corporate'],
        direct: ['online', 'events', 'partners', 'corporate', 'everyone', 'offline'],
        partners: ['online', 'sales-team', 'events', 'remote', 'offline', 'corporate']
      }
    }
  };

  const trafficAtlasMaterial = {
    questions: [
      {
        id: 'offer',
        title: 'Что вы продвигаете?',
        options: [
          ['services', 'Услуги и экспертиза', 'Консалтинг, обучение, медицина, ремонт, бьюти.'],
          ['products', 'Товары', 'Интернет-магазин, производство, розница.'],
          ['both', 'Товары и услуги', 'В предложении есть оба направления.']
        ]
      },
      {
        id: 'audience',
        title: 'Кто ваши клиенты?',
        options: [
          ['people', 'Частные клиенты', 'Люди выбирают и оплачивают продукт для себя.'],
          ['companies', 'Компании', 'Решение выбирают для бизнеса или команды.'],
          ['both', 'И люди, и компании', 'Вы работаете и с B2C, и с B2B.']
        ]
      },
      {
        id: 'reach',
        title: 'Где нужны новые клиенты?',
        options: [
          ['local', 'В вашем городе или районе', 'Клиенты должны приехать в конкретное место.'],
          ['national', 'Без привязки к городу', 'Можно продавать и работать дистанционно.'],
          ['both', 'И локально, и шире', 'Нужны оба направления.']
        ]
      },
      {
        id: 'goal',
        title: 'Какая задача сейчас главная?',
        options: [
          ['quick-leads', 'Быстрые заявки', 'Получить обращения в ближайшее время.'],
          ['new-audience', 'Новая аудитория', 'Найти людей, которые вас ещё не знают.'],
          ['recognition', 'Узнаваемость', 'Стать заметнее и понятнее на рынке.'],
          ['long-term', 'Долгий поток', 'Создать источник обращений на перспективу.']
        ]
      },
      {
        id: 'budget',
        title: 'Сколько можете вложить в первый тест?',
        options: [
          ['none', 'Пока без бюджета', 'Есть время, но нет рекламного бюджета.'],
          ['small', 'До 30 000 ₽', 'Небольшой тест на первые сигналы.'],
          ['medium', '30 000–100 000 ₽', 'Хватит на несколько объявлений или площадок.'],
          ['large', 'Больше 100 000 ₽', 'Можно провести полноценный тест.']
        ]
      }
    ],
    groups: [
      {
        id: 'paid',
        number: '01',
        title: 'Платные каналы',
        intro: 'Результат зависит от бюджета, настройки и качества предложения.',
        channels: ['vk', 'yandex', 'max', 'banks', 'avito', 'marketplaces', 'mts']
      },
      {
        id: 'niche',
        number: '02',
        title: 'Нишевые каналы',
        intro: 'Здесь важны тема, площадка, репутация и личное участие.',
        channels: ['performances', 'media', 'outdoor']
      },
      {
        id: 'restricted',
        number: '03',
        title: 'С ограничениями',
        intro: 'Рабочие варианты, где нужно учитывать правила площадок и правовые условия.',
        channels: ['foreign', 'telegram-ads', 'telegram-seeding']
      },
      {
        id: 'organic',
        number: '04',
        title: 'Условно бесплатные каналы',
        intro: 'Не требуют оплаты за каждый переход, но требуют времени, контента и дисциплины.',
        channels: ['seo-geo', 'content', 'partnerships', 'geo', 'threads']
      }
    ],
    channelMeta: {
      vk: { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'small' },
      yandex: { audiences: ['people', 'companies'], reach: ['local', 'national'], minBudget: 'small' },
      max: { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'small' },
      banks: { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'medium' },
      avito: { audiences: ['people', 'companies'], reach: ['local', 'national'], minBudget: 'small' },
      marketplaces: { audiences: ['people'], reach: ['national'], minBudget: 'large' },
      mts: { audiences: ['people', 'companies'], reach: ['local', 'national'], minBudget: 'small' },
      performances: { audiences: ['people', 'companies'], reach: ['local', 'national'], minBudget: 'none' },
      media: { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'none' },
      outdoor: { audiences: ['people'], reach: ['local'], minBudget: 'medium' },
      foreign: { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'small' },
      'telegram-ads': { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'medium' },
      'telegram-seeding': { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'small' },
      'seo-geo': { audiences: ['people', 'companies'], reach: ['local', 'national'], minBudget: 'none' },
      content: { audiences: ['people', 'companies'], reach: ['national'], minBudget: 'none' },
      partnerships: { audiences: ['people', 'companies'], reach: ['local', 'national'], minBudget: 'none' },
      geo: { audiences: ['people', 'companies'], reach: ['local'], minBudget: 'none' },
      threads: { audiences: ['people'], reach: ['national'], minBudget: 'none' }
    },
    channels: [
      {
        id: 'vk',
        number: '01',
        group: 'Платные каналы',
        title: 'ВКонтакте',
        short: 'Широкая аудитория и понятные массовые предложения.',
        fit: 'Подходит, если есть несколько креативов, бюджет на тест и готовность считать удержание.',
        text: 'Лента сильно перегружена рекламой и рекомендациями. Канал можно тестировать, но одной закупкой трафика проблему удержания не решить.',
        weights: {
          business: { services: 6, products: 7, local: 6, b2b: 4 },
          goal: { 'quick-leads': 7, 'new-audience': 7, recognition: 6, 'long-term': 3 },
          budget: { none: 0, small: 4, medium: 7, large: 8 }
        }
      },
      {
        id: 'yandex',
        number: '02',
        group: 'Платные каналы',
        title: 'Яндекс Директ и РСЯ',
        short: 'Один из самых стабильных платных каналов.',
        fit: 'Хорош для сформированного спроса, тематических площадок и серии тестов.',
        text: 'В Яндексе рынок тоже переполнен, но обычно можно открутить больше бюджета и получить больше регистраций. РСЯ часто даёт чуть меньше конкуренции, чем поиск.',
        weights: {
          business: { services: 7, products: 8, local: 8, b2b: 8 },
          goal: { 'quick-leads': 10, 'new-audience': 5, recognition: 3, 'long-term': 6 },
          budget: { none: 0, small: 5, medium: 8, large: 8 }
        }
      },
      {
        id: 'max',
        number: '03',
        group: 'Платные каналы',
        title: 'Размещения в каналах MAX',
        short: 'Площадка ещё не так перегрета, но цены растут.',
        fit: 'Подходит экспертам, услугам и сообществам, если можно найти тематические каналы.',
        text: 'Пока не все рекламодатели вышли в MAX, размещения могут быть выгодными. Но тестировать нужно с аналитикой: стоимость быстро меняется.',
        weights: {
          business: { services: 7, products: 5, local: 5, b2b: 6 },
          goal: { 'quick-leads': 5, 'new-audience': 8, recognition: 6, 'long-term': 3 },
          budget: { none: 1, small: 7, medium: 7, large: 5 }
        }
      },
      {
        id: 'banks',
        number: '04',
        group: 'Платные каналы',
        title: 'Рекламные платформы банков',
        short: 'Интересны данными об аудитории и покупательском поведении.',
        fit: 'Подходят B2C и B2B, если есть бюджет на тест качества лидов.',
        text: 'Лид может стоить дороже, чем в ВК и РСЯ, но качество аудитории иногда выглядит лучше. На больших объёмах выводы нужно проверять отдельно.',
        weights: {
          business: { services: 5, products: 7, local: 5, b2b: 9 },
          goal: { 'quick-leads': 8, 'new-audience': 7, recognition: 4, 'long-term': 3 },
          budget: { none: 0, small: 2, medium: 7, large: 6 }
        }
      },
      {
        id: 'avito',
        number: '05',
        group: 'Платные каналы',
        title: 'Авито',
        short: 'Работает не только для товаров, но заявки заметно подорожали.',
        fit: 'Товары, услуги, обучение и предложения с понятным спросом.',
        text: 'Авито остаётся одной из немногих площадок с относительно недорогим трафиком, но дешёвым по умолчанию его уже считать нельзя.',
        weights: {
          business: { services: 7, products: 9, local: 7, b2b: 5 },
          goal: { 'quick-leads': 9, 'new-audience': 5, recognition: 2, 'long-term': 3 },
          budget: { none: 1, small: 6, medium: 7, large: 5 }
        }
      },
      {
        id: 'marketplaces',
        number: '06',
        group: 'Платные каналы',
        title: 'Ozon и Wildberries',
        short: 'Прежде всего для товаров и выраженного B2C.',
        fit: 'Имеет смысл, если есть товарные материалы и бюджет от 100 000 ₽ на тест.',
        text: 'Аудитория маркетплейсов пока не привыкла искать там услуги. Для небольших проектов порог входа часто слишком высокий.',
        weights: {
          business: { services: 0, products: 12, local: 2, b2b: 0 },
          goal: { 'quick-leads': 10, 'new-audience': 6, recognition: 5, 'long-term': 3 },
          budget: { none: 0, small: 0, medium: 2, large: 10 }
        }
      },
      {
        id: 'mts',
        number: '07',
        group: 'Платные каналы',
        title: 'МТС Маркетолог',
        short: 'Упрощённый запуск рекламы и SMS-рассылки по базе МТС.',
        fit: 'Можно проверить, если нужен быстрый доступ к знакомым рекламным площадкам.',
        text: 'Инструмент во многом дублирует уже перечисленные системы. Отдельно ценна возможность SMS-рассылок, но с ней нужно работать аккуратно.',
        weights: {
          business: { services: 4, products: 5, local: 6, b2b: 3 },
          goal: { 'quick-leads': 6, 'new-audience': 4, recognition: 2, 'long-term': 2 },
          budget: { none: 0, small: 3, medium: 6, large: 6 }
        }
      },
      {
        id: 'performances',
        number: '08',
        group: 'Нишевые каналы',
        title: 'Выступления и эфиры',
        short: 'Самая тёплая аудитория часто приходит после личного контакта.',
        fit: 'Эксперты, основатели и команды с сильной практической темой.',
        text: 'Это может быть доклад, вебинар, урок для клуба или выступление в медиа. Считать нужно не только заявки, но и качество новых контактов.',
        weights: {
          business: { services: 8, products: 2, local: 4, b2b: 7 },
          goal: { 'quick-leads': 4, 'new-audience': 10, recognition: 9, 'long-term': 5 },
          budget: { none: 7, small: 7, medium: 5, large: 3 }
        }
      },
      {
        id: 'media',
        number: '09',
        group: 'Нишевые каналы',
        title: 'СМИ, подкасты и совместные эфиры',
        short: 'Работают на доверие и узнаваемость.',
        fit: 'Нужны инфоповод, понятная тема и способ быстро найти вас после выхода.',
        text: 'Платное размещение в крупном медиа не всегда окупается напрямую. Если нет ссылок и нормальной поисковой видимости, эффект легко теряется.',
        weights: {
          business: { services: 7, products: 3, local: 3, b2b: 7 },
          goal: { 'quick-leads': 2, 'new-audience': 7, recognition: 10, 'long-term': 5 },
          budget: { none: 5, small: 6, medium: 5, large: 4 }
        }
      },
      {
        id: 'outdoor',
        number: '10',
        group: 'Нишевые каналы',
        title: 'Наружная реклама',
        short: 'Инструмент заметности, а не быстрых заявок.',
        fit: 'Локальный бизнес и бренды, которым важно стать знакомыми в конкретном месте.',
        text: 'Наружная реклама имеет смысл, когда нужна узнаваемость и повторяемость контакта. Быстрых заявок от неё лучше не ждать.',
        weights: {
          business: { services: 2, products: 5, local: 9, b2b: 1 },
          goal: { 'quick-leads': 1, 'new-audience': 4, recognition: 10, 'long-term': 4 },
          budget: { none: 0, small: 1, medium: 5, large: 7 }
        }
      },
      {
        id: 'foreign',
        number: '11',
        group: 'С ограничениями',
        title: 'Зарубежные площадки',
        short: 'Только если нужна аудитория за пределами России.',
        fit: 'Нужна отдельная правовая проверка и доступ к зарубежной инфраструктуре.',
        text: 'Этот вариант может быть уместен для внешних рынков. Для аудитории внутри РФ есть ограничения, которые нельзя игнорировать.',
        weights: {
          business: { services: 5, products: 5, local: 1, b2b: 6 },
          goal: { 'quick-leads': 3, 'new-audience': 7, recognition: 5, 'long-term': 4 },
          budget: { none: 0, small: 2, medium: 5, large: 7 }
        }
      },
      {
        id: 'telegram-ads',
        number: '12',
        group: 'С ограничениями',
        title: 'Telegram Ads',
        short: 'Мало настроек, но может сработать через крупные каналы конкурентов.',
        fit: 'Подходит, если есть список каналов с нужной аудиторией и бюджет на тест.',
        text: 'Платёжеспособная аудитория не равна владельцам Premium. Но у инструмента мало настроек, поэтому ожидания лучше держать осторожными.',
        weights: {
          business: { services: 6, products: 4, local: 3, b2b: 6 },
          goal: { 'quick-leads': 5, 'new-audience': 7, recognition: 6, 'long-term': 3 },
          budget: { none: 0, small: 4, medium: 7, large: 7 }
        }
      },
      {
        id: 'telegram-seeding',
        number: '13',
        group: 'С ограничениями',
        title: 'Размещения в Telegram-каналах',
        short: 'Нужно долго и внимательно отбирать площадки.',
        fit: 'Имеет смысл, если готовы просеивать много каналов и считать фактический результат.',
        text: 'Даже небольшие каналы могут просить 15–17 тысяч рублей при 200–300 просмотрах. Иногда разумнее вернуться к взаимопиару и бартеру.',
        weights: {
          business: { services: 6, products: 4, local: 3, b2b: 5 },
          goal: { 'quick-leads': 4, 'new-audience': 7, recognition: 5, 'long-term': 3 },
          budget: { none: 2, small: 5, medium: 7, large: 5 }
        }
      },
      {
        id: 'seo-geo',
        number: '14',
        group: 'Условно бесплатные каналы',
        title: 'SEO и GEO',
        short: 'Долгий источник переходов через поиск и нейросетевые ответы.',
        fit: 'Проекты с сайтом, экспертным контентом и горизонтом больше пары недель.',
        text: 'SEO продолжает работать, особенно в Google. В Яндексе органику теснит реклама и ИИ-ответы, но сайт всё равно остаётся базой для попадания в рекомендации нейросетей.',
        weights: {
          business: { services: 7, products: 6, local: 5, b2b: 9 },
          goal: { 'quick-leads': 1, 'new-audience': 6, recognition: 7, 'long-term': 12 },
          budget: { none: 5, small: 6, medium: 7, large: 7 }
        }
      },
      {
        id: 'content',
        number: '15',
        group: 'Условно бесплатные каналы',
        title: 'Дзен, Pinterest и короткие видео',
        short: 'Органический охват, если команда готова регулярно делать контент.',
        fit: 'Подходит проектам, которым есть что показывать, объяснять или демонстрировать.',
        text: 'Дзен остаётся сильной рекомендательной лентой. Pinterest может работать для визуальных ниш. Короткие видео дают охваты, но чаще требуют тем для широкой аудитории.',
        weights: {
          business: { services: 7, products: 7, local: 5, b2b: 4 },
          goal: { 'quick-leads': 2, 'new-audience': 8, recognition: 10, 'long-term': 8 },
          budget: { none: 9, small: 7, medium: 5, large: 3 }
        }
      },
      {
        id: 'partnerships',
        number: '16',
        group: 'Условно бесплатные каналы',
        title: 'Партнёрства',
        short: 'Обмен доверием и аудиторией без крупного рекламного бюджета.',
        fit: 'Почти любой бизнес, если у партнёров есть взаимно полезные аудитории или ресурсы.',
        text: 'Это могут быть совместный продукт, взаимная реклама, общий контент или партнёрская программа. Главное — заранее договориться, как считать покупателей и делить результат.',
        weights: {
          business: { services: 9, products: 4, local: 6, b2b: 8 },
          goal: { 'quick-leads': 3, 'new-audience': 9, recognition: 7, 'long-term': 8 },
          budget: { none: 10, small: 8, medium: 5, large: 2 }
        }
      },
      {
        id: 'geo',
        number: '17',
        group: 'Условно бесплатные каналы',
        title: 'Яндекс Карты и 2ГИС',
        short: 'Обязательная база для мест, куда приезжают клиенты.',
        fit: 'Магазины, офисы, студии, клиники, салоны и локальные сервисы.',
        text: 'Карточку нужно заполнить, регулярно обновлять, добавлять фото и отвечать на отзывы. Заметный объём часто требует платного размещения.',
        weights: {
          business: { services: 4, products: 4, local: 12, b2b: 2 },
          goal: { 'quick-leads': 8, 'new-audience': 5, recognition: 6, 'long-term': 8 },
          budget: { none: 4, small: 8, medium: 7, large: 4 }
        }
      },
      {
        id: 'threads',
        number: '18',
        group: 'Условно бесплатные каналы',
        title: 'Threads',
        short: 'Может давать охваты, но не всегда нужную аудиторию.',
        fit: 'Только для проектов, которые учли действующие ограничения и готовы экспериментировать с короткими текстами.',
        text: 'Большой охват ещё не означает, что компания собрала свою целевую аудиторию. Канал лучше воспринимать как эксперимент и отдельно проверять правовые условия его использования.',
        weights: {
          business: { services: 5, products: 3, local: 2, b2b: 4 },
          goal: { 'quick-leads': 1, 'new-audience': 6, recognition: 8, 'long-term': 4 },
          budget: { none: 8, small: 5, medium: 3, large: 2 }
        }
      }
    ]
  };

  const state = {
    page: getLaunchPage(),
    step: 0,
    answers: {},
    contactTask: 'strategy',
    material: 'products',
    pendingMaterial: '',
    pendingGateTarget: 'material',
    gateStatus: 'idle',
    productLineRepeat: '',
    productLineAnswers: {},
    productLineStages: ['lead', 'core'],
    productLineTemplate: '',
    salesChannelAnswers: {},
    salesChannelFocus: '',
    trafficAtlasAnswers: {},
    trafficAtlasFocus: '',
    toast: ''
  };

  const APP_HISTORY_KEY = 'mirofakturaNavigation';
  let navigationDepth = 0;
  let navigationReady = false;

  function syncTelegramBackButton() {
    const backButton = telegramWebApp?.BackButton;
    if (!backButton) return;

    if (state.page !== 'home' && navigationDepth > 0) {
      backButton.show();
    } else {
      backButton.hide();
    }
  }

  function navigateTo(page, options = {}) {
    if (!page) return;

    const replace = options.replace === true;
    const scroll = options.scroll !== false;
    const pageChanged = state.page !== page;
    state.page = page;

    if (navigationReady && pageChanged) {
      try {
        if (replace) {
          window.history.replaceState({
            ...(window.history.state || {}),
            [APP_HISTORY_KEY]: true,
            page,
            depth: navigationDepth
          }, '');
        } else {
          navigationDepth += 1;
          window.history.pushState({
            [APP_HISTORY_KEY]: true,
            page,
            depth: navigationDepth
          }, '');
        }
      } catch (_) {
        // Telegram BackButton still provides navigation if WebView history is unavailable.
      }
    }

    render({ scroll });
    syncTelegramBackButton();
  }

  function goBack(fallbackPage = 'home') {
    if (navigationDepth > 0) {
      window.history.back();
      return;
    }

    navigateTo(fallbackPage, { replace: true });
  }

  const PAGES_WITH_BOTTOM_NAV = new Set(['home', 'quiz', 'library', 'material', 'contacts']);

  const icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 9h8M8 13h5"/></svg>',
    library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m8 4 10 3-3 13-10-3L8 4Z"/><path d="m10 8 5 1.5"/></svg>',
    trends: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 18V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11"/><path d="m8 14 2.2-2.2 2 2L16 10"/></svg>',
    max: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 7.5A3.5 3.5 0 0 1 8.5 4h7A3.5 3.5 0 0 1 19 7.5v5A3.5 3.5 0 0 1 15.5 16H12l-4.5 4v-4A3.5 3.5 0 0 1 4 12.5v-5Z"/><path d="M8 9h8M8 12h5"/></svg>',
    contacts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 15V4"/><path d="m8 8 4-4 4 4"/></svg>',
    docs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 4h7l3 3v13H7V4Z"/><path d="M14 4v4h4"/><path d="M9 13h6M9 16h6"/></svg>'
  };

  function header() {
    return `
      <header class="topbar">
        <button class="logo-button" type="button" data-page="home" aria-label="На главную">
          <img class="logo" src="${assets.logo}" alt="Мирофактура" decoding="async" fetchpriority="high">
        </button>
        <button class="share-btn" type="button" data-action="share">Поделиться</button>
      </header>
    `;
  }

  function bottomNav() {
    return `
      <nav class="bottom-nav" aria-label="Навигация">
        <button class="nav-item ${state.page === 'home' ? 'active' : ''}" type="button" data-page="home" ${state.page === 'home' ? 'aria-current="page"' : ''}>
          ${icons.home}<span>Главная</span>
        </button>
        <button class="nav-item ${['library', 'material'].includes(state.page) ? 'active' : ''}" type="button" data-action="openLibrary" ${['library', 'material'].includes(state.page) ? 'aria-current="page"' : ''}>
          ${icons.library}<span>Кладовая</span>
        </button>
        <button class="nav-item ${state.page === 'trends' ? 'active' : ''}" type="button" data-action="openTrends" ${state.page === 'trends' ? 'aria-current="page"' : ''}>
          ${icons.trends}<span>Тренды</span>
        </button>
        <button class="nav-item ${state.page === 'contacts' ? 'active' : ''}" type="button" data-page="contacts" ${state.page === 'contacts' ? 'aria-current="page"' : ''}>
          ${icons.contacts}<span>Услуги</span>
        </button>
      </nav>
    `;
  }

  function screen(content, cls = '') {
    const hasBottomNav = PAGES_WITH_BOTTOM_NAV.has(state.page) || (USE_NATIVE_TRENDS && state.page === 'trends');
    const hasNativeTrendsShell = USE_NATIVE_TRENDS && state.page === 'trends';
    return `
      <main class="app-shell ${hasNativeTrendsShell ? 'trends-native-shell' : ''}">
        <section class="screen ${hasBottomNav ? 'has-bottom-nav' : ''} ${cls}">
          ${header()}
          ${content}
          ${hasBottomNav ? bottomNav() : ''}
        </section>
        <div class="toast ${state.toast ? 'visible' : ''}" role="status" aria-live="polite">${state.toast}</div>
      </main>
    `;
  }

  function isLocalPreview() {
    return window.location.protocol === 'file:'
      || window.location.hostname === 'localhost'
      || window.location.hostname === '127.0.0.1';
  }

  function getMaxUserId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('max_user_id')
      || params.get('maxUserId')
      || params.get('max_user')
      || params.get('user_id')
      || '';
  }

  function getPlatformUserId() {
    const params = new URLSearchParams(window.location.search);
    const keys = PLATFORM.key === 'telegram'
      ? ['telegram_user_id', 'telegramUserId', 'tg_user_id', 'tgUserId', 'user_id', 'userId']
      : ['max_user_id', 'maxUserId', 'max_user', 'user_id', 'userId'];

    for (const key of keys) {
      const value = params.get(key);
      if (value) return value;
    }

    if (PLATFORM.key === 'telegram') {
      const telegramUserId = telegramWebApp?.initDataUnsafe?.user?.id;
      if (telegramUserId) return String(telegramUserId);
    }

    return '';
  }

  function getPlatformUser() {
    if (PLATFORM.key === 'telegram') {
      return telegramWebApp?.initDataUnsafe?.user || {};
    }

    return window.WebApp?.initDataUnsafe?.user || window.WebApp?.user || {};
  }

  async function isSubscribedInMax() {
    if (IS_OPEN_ACCESS) return { ok: true, reason: 'open-access' };

    const maxUserId = getMaxUserId();
    if (!maxUserId) return { ok: false, reason: 'missing-id' };
    if (!SUBSCRIPTION_WEBHOOK_URL) return { ok: false, reason: 'error' };

    try {
      const response = await fetch(SUBSCRIPTION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: 'max_channel_subscription',
          max_user_id: maxUserId
        })
      });
      if (!response.ok) return { ok: false, reason: 'error' };

      const data = await response.json();
      return data?.isSubscribed === true
        ? { ok: true }
        : { ok: false, reason: 'not-subscribed' };
    } catch (_) {
      return { ok: false, reason: 'error' };
    }
  }

  async function openMaterialWithGate(material) {
    if (!['traffic', 'products', 'sales'].includes(material)) {
      showToast('Этот материал еще готовим');
      return;
    }

    state.pendingMaterial = material;
    state.pendingGateTarget = 'material';

    if (IS_OPEN_ACCESS || isLocalPreview()) {
      state.material = material;
      state.gateStatus = 'idle';
      navigateTo('material');
      return;
    }

    state.gateStatus = 'checking';
    navigateTo('gate');

    const subscription = await isSubscribedInMax();
    if (subscription.ok) {
      state.material = material;
      state.gateStatus = 'idle';
      navigateTo('material', { replace: true });
      return;
    }

    state.gateStatus = subscription.reason;
    render();
  }

  async function openLibraryWithGate() {
    state.pendingMaterial = '';
    state.pendingGateTarget = 'library';

    if (IS_OPEN_ACCESS || isLocalPreview()) {
      state.gateStatus = 'idle';
      navigateTo('library');
      return;
    }

    state.gateStatus = 'checking';
    navigateTo('gate');

    const subscription = await isSubscribedInMax();
    if (subscription.ok) {
      state.gateStatus = 'idle';
      navigateTo('library', { replace: true });
      return;
    }

    state.gateStatus = subscription.reason;
    render();
  }

  function renderHome() {
    return screen(`
      <div class="hero">
        <div class="mascot-zone">
          <img class="mascot" src="${assets.stepanStart}" alt="Степан, Цветок-Критик Мирофактуры" decoding="async" fetchpriority="high">
        </div>

        <div class="mascot-note">
          <div><span class="mascot-name">Степан</span> <span class="mascot-role">Цветок-Критик · маскот Мирофактуры</span></div>
          <p class="quote">«Где сейчас теряются клиенты? Давайте разберёмся»</p>
        </div>

        <div class="home-copy">
          <p class="brand-label">Подарок от Мирофактуры</p>
          <h1 class="home-title">С чего начать</h1>
          <p class="lead">Ответьте на четыре вопроса и получите интерактивный материал про продукт, продажи или привлечение аудитории.</p>
          <button class="primary-btn" type="button" data-action="startQuiz">Получить подарок</button>
        </div>

        <div class="home-links">
          <button class="home-link" type="button" data-action="openContacts">
            <span><strong>Что мы делаем</strong><span>Пять направлений работы с примерами и понятной пользой.</span></span>
          </button>
          <button class="home-link" type="button" data-action="openLibrary">
            <span><strong>Кладовая Мирофактуры</strong><span>Небольшие интерактивные инструменты для первого разбора задачи.</span></span>
          </button>
          <button class="home-link" type="button" data-action="openExternalLink" data-url="${MAX_CHANNEL_URL}">
            <span><strong>Канал в MAX</strong><span>Материалы о маркетинге, продуктах и цифровых мирах.</span></span>
          </button>
        </div>

        <button class="day-card" type="button" data-action="openTrends">
          <span class="day-card-copy">
            <span class="day-card-kicker">Мирофактура · 2026</span>
            <span class="day-card-title">Колода трендов для бизнеса</span>
            <span class="day-card-text">Найдите новую идею для продукта, маркетинга или продаж.</span>
            <span class="day-card-action">Открыть колоду</span>
          </span>
          <span class="day-card-cards" aria-hidden="true">
            <span class="day-card-cover"><img src="./assets/home-trend-creator.jpg" alt="" loading="eager" decoding="async"></span>
            <span class="day-card-cover"><img src="./assets/home-trend-ai-fatigue.jpg" alt="" loading="eager" decoding="async"></span>
            <span class="day-card-cover"><img src="./assets/home-trend-end-normal.jpg" alt="" loading="eager" decoding="async"></span>
          </span>
        </button>
      </div>
    `, 'home-screen');
  }

  function renderQuiz() {
    const item = quiz[state.step];
    const selected = state.answers[state.step];
    const selectedAnswer = item.answers.find(([id]) => id === selected);
    const selectedNote = selectedAnswer?.[3] || item.note;
    const progress = Math.round(((state.step + 1) / quiz.length) * 100);
    return screen(`
      <div class="quiz-head">
        <div class="quiz-meta">
          <span>Вопрос ${state.step + 1} из ${quiz.length}</span>
          <span>${progress}%</span>
        </div>
        <div class="progress" role="progressbar" aria-label="Прогресс квиза" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
      </div>

      <div class="quiz-mascot">
        <img src="${item.image}" alt="Степан помогает пройти квиз" loading="eager" decoding="async" fetchpriority="high">
      </div>

      <article class="question-card">
        <p class="brand-label">${item.kicker}</p>
        <h1>${item.title}</h1>
        <p class="hint">${item.hint}</p>

        <div class="answers">
          ${item.answers.map(([id, title, text], index) => `
            <button class="answer ${selected === id ? 'selected' : ''}" type="button" data-answer="${id}" aria-pressed="${selected === id}">
              <b class="answer-number">${index + 1}</b>
              <span class="answer-copy"><strong>${title}</strong><small>${text}</small></span>
              <i class="check">✓</i>
            </button>
          `).join('')}
        </div>

        <div class="stepan-comment ${selected ? 'visible' : ''}" id="stepan-comment" role="status" aria-live="polite">
          <b>Степан</b>
          <span>${selectedNote}</span>
        </div>

        <div class="quiz-actions">
          <button class="primary-btn" type="button" data-action="nextQuestion" ${selected ? '' : 'disabled'}>${state.step === quiz.length - 1 ? 'Показать результат' : 'Дальше'}</button>
          ${state.step === 0
            ? '<button class="soft-btn" type="button" data-action="exitQuiz">Выйти из квиза</button>'
            : '<button class="soft-btn" type="button" data-action="prevQuestion">Назад</button>'}
        </div>
      </article>
    `, 'quiz-screen');
  }

  function resultKey() {
    const selectedTask = state.answers[2];
    if (selectedTask === 'products') return 'products';
    if (selectedTask === 'sales') return 'sales';
    if (selectedTask === 'traffic') return 'traffic';
    return 'traffic';
  }

  function resultIntentCopy(key) {
    const intent = state.answers[3];
    if (intent === 'map') {
      return key === 'products'
        ? 'Внутри есть четыре модели продуктовой линейки. Сравните их, а затем соберите подходящую цепочку.'
        : 'Внутри есть общая карта и короткие пояснения. Можно спокойно сравнить варианты, а затем перейти к навигатору.';
    }
    if (intent === 'draft') {
      return key === 'products'
        ? 'Ответьте на вопросы, соберите черновик продуктовой линейки и скопируйте итог в заметки или рабочий чат.'
        : 'Ответьте на вопросы внутри материала, получите короткий список вариантов и скопируйте итог в заметки или рабочий чат.';
    }
    return key === 'products'
      ? 'Начните с короткого подбора: он покажет, какая модель продуктовой линейки лучше подходит вашей ситуации.'
      : 'Начните с короткого навигатора: он сузит выбор и покажет несколько подходящих вариантов.';
  }

  function materialNextStep(key) {
    const steps = {
      traffic: 'Выберите один канал из четырёх рекомендаций. Запишите, кому покажете предложение, сколько времени или денег выделите на тест, сколько дней он продлится и по какому результату вы решите, стоит ли продолжать.',
      sales: state.salesChannelAnswers.current === 'none'
        ? 'Выберите один канал из трёх кандидатов. Заранее определите, что нужно подготовить, сколько времени или денег вы готовы вложить, сколько продлится тест и какой результат покажет, что канал стоит развивать.'
        : 'Сначала оцените канал, который уже приносит продажи. Если он работает нестабильно, разберите, где теряются заявки. Если он работает устойчиво, выберите один новый канал из трёх кандидатов и заранее определите срок и показатель теста.',
      products: 'Проверьте в конструкторе три опорные точки: чем человек знакомится с вами, что покупает как основное решение и что вы предлагаете после первого результата. Если одной из точек нет, начните с неё.'
    };
    return steps[key] || steps.traffic;
  }

  function questionOptionLabel(questions, questionId, value) {
    const question = questions.find((item) => item.id === questionId);
    return question?.options.find(([id]) => id === value)?.[1] || '';
  }

  function materialOutcomeData(key) {
    if (key === 'products') {
      const recommendations = recommendedProductLineModels();
      const topScore = recommendations[0]?.score;
      const matchingModels = recommendations.filter((model) => model.score === topScore).slice(0, 2);
      const stages = productLinesMaterial.stages
        .filter(([id]) => state.productLineStages.includes(id))
        .map(([, title]) => title);
      const repeat = productLinesMaterial.diagnostic.find((item) => item.id === state.productLineRepeat);

      return {
        complete: productLineSelectorComplete() && stages.length > 0,
        title: 'Черновик продуктовой линейки',
        lines: [
          repeat ? ['Текущая ситуация', repeat.title] : null,
          matchingModels.length
            ? ['Подходящая модель', matchingModels.map((model) => model.title).join(' или ')]
            : null,
          stages.length ? ['Цепочка', stages.join(' → ')] : null
        ].filter(Boolean)
      };
    }

    if (key === 'sales') {
      const recommendations = recommendedSalesChannels();
      return {
        complete: salesChannelsComplete(),
        title: 'Каналы для следующей проверки',
        lines: [
          ['Клиенты', questionOptionLabel(salesChannelsMaterial.questions, 'audience', state.salesChannelAnswers.audience)],
          ['Главная задача', questionOptionLabel(salesChannelsMaterial.questions, 'goal', state.salesChannelAnswers.goal)],
          ['Условия', [
            questionOptionLabel(salesChannelsMaterial.questions, 'resource', state.salesChannelAnswers.resource),
            questionOptionLabel(salesChannelsMaterial.questions, 'format', state.salesChannelAnswers.format)
          ].join('; ')],
          ['Что уже работает', questionOptionLabel(salesChannelsMaterial.questions, 'current', state.salesChannelAnswers.current)],
          ['Каналы-кандидаты', recommendations.map((channel) => channel.title).join(', ')]
        ]
      };
    }

    const recommendations = recommendedTrafficChannels();
    return {
      complete: trafficAtlasComplete(),
      title: 'Каналы для первого теста',
      lines: [
        ['Предложение', questionOptionLabel(trafficAtlasMaterial.questions, 'offer', state.trafficAtlasAnswers.offer)],
        ['Клиенты', questionOptionLabel(trafficAtlasMaterial.questions, 'audience', state.trafficAtlasAnswers.audience)],
        ['Охват и бюджет', [
          questionOptionLabel(trafficAtlasMaterial.questions, 'reach', state.trafficAtlasAnswers.reach),
          questionOptionLabel(trafficAtlasMaterial.questions, 'budget', state.trafficAtlasAnswers.budget)
        ].join('; ')],
        ['Задача', questionOptionLabel(trafficAtlasMaterial.questions, 'goal', state.trafficAtlasAnswers.goal)],
        ['Каналы-кандидаты', recommendations.map((channel) => channel.title).join(', ')]
      ]
    };
  }

  function materialStoryData(key) {
    const outcome = materialOutcomeData(key);
    if (!outcome.complete) return null;

    if (key === 'products') {
      return {
        quote: 'Бизнесу не всегда нужен новый продукт. Иногда всё необходимое у вас уже есть.',
        filename: 'mirofaktura-product-line.png'
      };
    }

    if (key === 'sales') {
      return {
        quote: 'В продажах один проверенный канал полезнее пяти «на всякий случай».',
        filename: 'mirofaktura-sales-channels.png'
      };
    }

    return {
      quote: 'В маркетинге большой охват ещё не означает результат. До запуска решите, что будете считать успехом.',
      filename: 'mirofaktura-traffic-test.png'
    };
  }

  function renderStoryCardPreview(key) {
    const story = materialStoryData(key);
    if (!story) return '';

    return `
      <section class="story-result">
        <div class="story-result-copy">
          <p class="brand-label">На что обратить внимание сейчас</p>
          <h3>Сохраните совет Аристарха</h3>
        </div>
        <div class="story-card-preview story-card-preview-${key}" aria-label="Карточка с советом Аристарха">
          <img class="story-card-logo" src="${assets.logoStory}" alt="" aria-hidden="true">
          <div class="story-card-cta">
            <strong>${STORY_DESTINATION_CTA_ACTION}</strong>
          </div>
          <blockquote>${story.quote}</blockquote>
          <p class="story-card-attribution">— Аристарх</p>
          <img class="story-card-mascot" src="${assets.aristarch}" alt="" aria-hidden="true">
        </div>
        <div class="story-result-actions">
          <button class="primary-btn" type="button" data-action="shareStoryCard" data-material="${key}">${APP_PLATFORM === 'telegram' ? 'Добавить в сториз' : 'Поделиться советом'}</button>
          <button class="soft-btn" type="button" data-action="saveStoryCard" data-material="${key}">Скачать картинку</button>
        </div>
        <p class="story-action-hint">${APP_PLATFORM === 'telegram'
          ? 'Первая кнопка откроет редактор сториз. Вторая скачает PNG в «Загрузки» или «Файлы».'
          : 'Первая кнопка откроет меню отправки. Вторая скачает картинку.'}</p>
        <p class="story-link-hint">Для сториз: <button type="button" data-action="copyStoryLink">скопируйте ссылку</button> и добавьте её через стикер «Ссылка».</p>
      </section>
    `;
  }

  function materialResultText(key) {
    const material = materials[key];
    const outcome = materialOutcomeData(key);
    if (!outcome.complete) return '';

    return [
      `Мирофактура — ${material.title}`,
      '',
      ...outcome.lines.map(([label, value]) => `${label}: ${value}`),
      '',
      `Следующий шаг: ${materialNextStep(key)}`
    ].join('\n');
  }

  function renderMaterialOutcome(key, navigatorId) {
    const outcome = materialOutcomeData(key);
    if (!outcome.complete) {
      return `
        <section class="material-outcome muted">
          <p class="brand-label">Ваш результат</p>
          <h2>Сначала завершите подбор</h2>
          <p>Ответьте на вопросы выше, чтобы получить короткий итог и сохранить его.</p>
          <button class="soft-btn" type="button" data-action="focusMaterialNavigator" data-target="${navigatorId}">Вернуться к вопросам</button>
        </section>
      `;
    }

    return `
      <section class="material-outcome">
        <p class="brand-label">Ваш результат</p>
        <h2>${outcome.title}</h2>
        <div class="material-outcome-list">
          ${outcome.lines.map(([label, value]) => `
            <p><strong>${label}</strong><span>${value}</span></p>
          `).join('')}
        </div>
        <div class="material-next-step">
          <p class="brand-label">Следующий шаг</p>
          <p>${materialNextStep(key)}</p>
        </div>
        ${renderStoryCardPreview(key)}
        <button class="soft-btn material-copy-btn" type="button" data-action="copyMaterialResult" data-material="${key}">Скопировать текст результата</button>
        <small>Текст можно вставить в заметки или отправить коллеге.</small>
      </section>
    `;
  }

  function relatedHelp(key) {
    const options = {
      traffic: {
        title: 'Вовлечение и игровые механики',
        text: 'Создадим квиз, игру или мини-приложение — цифровой мир, в котором человек знакомится с продуктом через вопросы, выбор и действия. Так он лучше понимает, чем продукт полезен именно ему, запоминает его и замечает отличия от похожих предложений. После этого ему легче выбрать подходящий вариант и перейти к покупке.'
      },
      sales: {
        title: 'Упаковка и путь к покупке',
        text: 'Поможем ясно объяснить ценность продукта и показать разницу между вариантами. Человеку будет легче понять, какой вариант подходит именно ему, выбрать предложение и перейти к покупке. Для этого разберём, что важно объяснить о продукте, перепишем тексты и при необходимости создадим квиз, игру или мини-приложение.'
      },
      products: {
        title: 'Продуктовая система и продукты-миры',
        text: 'Поможем показать, чем отличаются ваши продукты, кому подходит каждый из них и что можно предложить клиенту после первой покупки. Если нужен отдельный интерактивный продукт, создадим продукт-мир — игру, квиз, бота или мини-приложение со своей идеей, механиками и персонажами.'
      }
    };
    return options[key] || options.traffic;
  }

  function renderResult() {
    const key = resultKey();
    const material = materials[key];
    const help = relatedHelp(key);
    return screen(`
      <button class="back-link" type="button" data-action="startQuiz">← Пройти заново</button>
      <div class="result-mascot">
        <img src="${assets.aristarch}" alt="Аристарх показывает рекомендацию" decoding="async">
      </div>

      <article class="result-card">
        <p class="brand-label">Ваш подарок</p>
        <h1>Вот с чего лучше начать</h1>
        <p class="lead">${resultIntentCopy(key)}</p>

        <div class="result-panel">
          <h2>${material.title}</h2>
          <p>${material.text}</p>
        </div>
      </article>

      <div class="result-actions result-actions-primary">
        <button class="primary-btn" type="button" data-action="openMaterial" data-material="${key}">Открыть подарок</button>
      </div>

      <article class="potap-panel result-help-note">
        <p class="brand-label">Можем помочь</p>
        <h2>${help.title}</h2>
        <p>${help.text}</p>
      </article>

      <div class="result-actions">
        <button class="soft-btn" type="button" data-action="openContacts">Посмотреть, что мы делаем</button>
        <button class="soft-btn" type="button" data-page="home">На главную</button>
      </div>
    `, 'result-screen');
  }

  function renderGate() {
    const isLibraryGate = state.pendingGateTarget === 'library';
    const material = materials[state.pendingMaterial] || materials[resultKey()];
    if (IS_OPEN_ACCESS) {
      return screen(`
        <article class="result-card gate-card">
          <p class="brand-label">Материалы открыты</p>
          <h1>Можно открывать</h1>

          <div class="result-panel">
            <p class="brand-label">${isLibraryGate ? 'Кладовая Мирофактуры' : material.tag}</p>
            <h2>${isLibraryGate ? 'Материалы и инструменты' : material.title}</h2>
            <p>${isLibraryGate ? 'Выберите нужный материал или пройдите квиз, если пока не знаете, с чего начать.' : material.text}</p>
          </div>

          <button class="primary-btn" type="button" data-action="${isLibraryGate ? 'openLibrary' : 'openMaterial'}" ${isLibraryGate ? '' : `data-material="${state.pendingMaterial || resultKey()}"`}>${isLibraryGate ? 'Открыть кладовую' : 'Открыть материал'}</button>
          <button class="soft-btn" type="button" data-action="openMax">Подписаться на канал</button>
          <button class="soft-btn" type="button" data-page="home">На главную</button>
        </article>
      `, 'gate-screen');
    }

    const isChecking = state.gateStatus === 'checking';
    const title = state.gateStatus === 'missing-id'
      ? 'Откройте приложение из бота'
      : state.gateStatus === 'error'
        ? 'Не удалось проверить подписку'
        : isChecking
          ? 'Проверяем доступ'
          : 'Подписка не найдена';
    const copy = state.gateStatus === 'missing-id'
      ? 'Чтобы проверить подписку, откройте приложение из бота.'
      : state.gateStatus === 'error'
        ? 'Проверка не сработала. Попробуйте ещё раз через минуту.'
        : isChecking
          ? 'Проверяем подписку. Если всё в порядке, материал откроется автоматически.'
          : 'Подпишитесь на канал, вернитесь в приложение и нажмите «Проверить подписку».';
    const panel = isLibraryGate
      ? `
        <div class="result-panel">
          <p class="brand-label">Кладовая Мирофактуры</p>
          <h2>Материалы и инструменты</h2>
          <p>Полезные материалы Мирофактуры для практических задач бизнеса: разобраться в ситуации, сравнить варианты и выбрать подходящее решение.</p>
        </div>
      `
      : `
        <div class="result-panel">
          <p class="brand-label">${material.tag}</p>
          <h2>${material.title}</h2>
          <p>${material.text}</p>
        </div>
      `;

    return screen(`
      <article class="result-card gate-card">
        <p class="brand-label">Проверка подписки</p>
        <h1>${title}</h1>
        <p class="lead">${copy}</p>

        ${panel}

        <button class="primary-btn" type="button" data-action="openMax">Подписаться на канал</button>
        <button class="soft-btn" type="button" data-action="checkSubscription" ${isChecking ? 'disabled' : ''}>Проверить подписку</button>
        <button class="soft-btn" type="button" data-page="home">На главную</button>
      </article>
    `, 'gate-screen');
  }

  function renderLibrary() {
    return screen(`
      <div class="library-title">
        <p class="brand-label">Материалы Мирофактуры</p>
        <h1>Кладовая</h1>
        <p class="lead">Здесь собраны три интерактивных материала: про привлечение аудитории, каналы продаж и линейку продуктов. Они помогут быстрее разобраться в задаче перед разговором о проекте.</p>
        <div class="library-actions">
          <button class="primary-btn" type="button" data-action="startQuiz">Подобрать материал</button>
        </div>
      </div>

      <div class="aristarch">
        <img src="${assets.aristarch}" alt="Аристарх, Аксолотль-Профессор Мирофактуры" loading="lazy" decoding="async">
        <div class="caption">
          <b>Аристарх</b>
          <span>Аксолотль-Профессор, маскот-аналитик Мирофактуры. Сравнивает ответы и помогает выбрать подходящий материал.</span>
        </div>
      </div>

      <section class="materials" aria-label="Материалы">
        ${Object.entries(materials).map(([id, item]) => `
          <article class="material-card ${item.tone}" role="button" tabindex="0" data-action="${['traffic', 'products', 'sales'].includes(id) ? 'openMaterial' : 'materialSoon'}" data-material="${id}" aria-label="Открыть: ${item.title}">
            <small>${item.tag}</small>
            <h2>${item.title}</h2>
            <p>${item.text}</p>
            <span class="material-service">Подходит для: ${item.service}</span>
            <span class="primary-btn material-card-action" aria-hidden="true">Открыть</span>
          </article>
        `).join('')}
      </section>

      <section class="library-project-cta">
        <p class="brand-label">Нужна помощь с вашей задачей?</p>
        <h2>Посмотрите, что мы делаем</h2>
        <p>Для каждой услуги есть короткое объяснение, пример и польза для бизнеса.</p>
        <button class="soft-btn" type="button" data-action="openContacts">Перейти к услугам</button>
      </section>
    `, 'library-screen');
  }

  function productLineSelectorComplete() {
    return productLinesMaterial.selectorQuestions.every((question) => state.productLineAnswers[question.id]);
  }

  function recommendedProductLineModels() {
    const repeat = productLinesMaterial.diagnostic.find((item) => item.id === state.productLineRepeat);
    return productLinesMaterial.models
      .map((model) => {
        const selectorScore = Object.entries(state.productLineAnswers).reduce((sum, [question, answer]) => {
          return sum + (productLinesMaterial.selectorScores?.[question]?.[answer]?.[model.id] || 0);
        }, 0);
        return {
          ...model,
          score: selectorScore + (repeat?.scores?.[model.id] || 0)
        };
      })
      .sort((a, b) => b.score - a.score || Number(a.number) - Number(b.number));
  }

  function renderProductLinesMaterial() {
    const repeat = productLinesMaterial.diagnostic.find((item) => item.id === state.productLineRepeat);
    const selectedStages = productLinesMaterial.stages.filter(([id]) => state.productLineStages.includes(id));
    const selectorComplete = productLineSelectorComplete();
    const recommendedModels = recommendedProductLineModels();
    const recommendedModel = recommendedModels[0] || productLinesMaterial.models[0];
    const tiedModel = selectorComplete && recommendedModels[1]?.score === recommendedModel.score
      ? recommendedModels[1]
      : null;
    const templateModel = productLinesMaterial.models.find((model) => model.id === state.productLineTemplate);

    return screen(`
      <button class="back-link" type="button" data-page="library">← В кладовую</button>

      <article class="lead-hero">
        <div>
          <p class="brand-label">Линейки продуктов</p>
          <h1>Как связать продукты и увеличить повторные покупки</h1>
          <p class="lead">Посмотрите, как сейчас устроены ваши продукты и как собрать из них понятную систему: что предложить для знакомства, что продавать как основное решение и что — после него. В конце вы выберете подходящую модель и соберёте черновик продуктовой линейки.</p>
        </div>
      </article>

      <section class="lead-section">
        <p class="brand-label">Быстрый разбор</p>
        <h2>Как часто клиенты возвращаются?</h2>
        <p class="lead-section-copy">Выберите один вариант, который ближе всего к текущей ситуации.</p>
        <div class="lead-choice-list">
          ${productLinesMaterial.diagnostic.map((item) => `
            <button class="lead-choice ${state.productLineRepeat === item.id ? 'selected' : ''}" type="button" data-action="chooseRepeat" data-repeat="${item.id}">
              <b>${item.number}</b>
              <span><strong>${item.title}</strong><em>${item.text}</em></span>
              <i class="lead-choice-mark" aria-hidden="true">${state.productLineRepeat === item.id ? '✓' : ''}</i>
            </button>
          `).join('')}
        </div>
        <div class="lead-insight ${repeat ? '' : 'muted'}" id="product-line-repeat-insight" aria-live="polite">
          <span>${repeat ? 'Подсказка' : 'После выбора'}</span>
          <p>${repeat ? repeat.result : 'Здесь появится короткая рекомендация для вашей ситуации.'}</p>
        </div>
      </section>

      <section class="lead-section">
        <p class="brand-label">Подбор модели</p>
        <h2>Как устроены ваши продукты?</h2>
        <p class="lead-section-copy">Ответьте на три вопроса. По ответам мы предложим модель и заполним пример цепочки.</p>
        <div class="selector-mini">
          ${productLinesMaterial.selectorQuestions.map((question, index) => `
            <article class="selector-question">
              <div class="selector-question-title">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${question.title}</strong>
              </div>
              <div class="selector-options">
                ${question.options.map(([value, label]) => `
                  <button class="selector-option ${state.productLineAnswers[question.id] === value ? 'selected' : ''}" type="button" data-action="chooseProductLineSelector" data-question="${question.id}" data-value="${value}">
                    ${label}
                  </button>
                `).join('')}
              </div>
            </article>
          `).join('')}
        </div>
        <div class="lead-recommendation ${selectorComplete ? '' : 'muted'}" id="product-line-recommendation" aria-live="polite">
          <span>${selectorComplete ? (tiedModel ? 'Подойдут две модели' : 'С чего начать') : 'Рекомендация появится здесь'}</span>
          <h3>${selectorComplete ? recommendedModel.title : 'Ответьте на 3 вопроса'}</h3>
          <p>${selectorComplete ? recommendedModel.fit : 'Нужны все три ответа: как устроены продукты, как долго вы работаете с клиентом и что приводит к следующей покупке.'}</p>
          ${tiedModel ? `<p class="recommendation-alternative"><strong>Также подходит «${tiedModel.title}».</strong> ${tiedModel.fit}</p>` : ''}
          ${selectorComplete ? `
            <div class="recommendation-actions">
              <button class="soft-btn" type="button" data-action="applyProductLineTemplate" data-model="${recommendedModel.id}">Собрать «${recommendedModel.title}»</button>
              ${tiedModel ? `<button class="soft-btn" type="button" data-action="applyProductLineTemplate" data-model="${tiedModel.id}">Собрать «${tiedModel.title}»</button>` : ''}
            </div>
          ` : ''}
        </div>
      </section>

      <section class="lead-section">
        <p class="brand-label">Четыре модели</p>
        <h2>Сравните варианты</h2>
        <p class="lead-section-copy">Откройте модель, если хотите понять её логику или собрать пример цепочки.</p>
        <div class="lead-detail-list">
          ${productLinesMaterial.modelDetails.map((detail, index) => `
            <details class="lead-detail" ${(selectorComplete ? detail.id === recommendedModel.id : index === 0) ? 'open' : ''}>
              <summary>
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${detail.title}</strong>
              </summary>
              <p>${detail.text}</p>
              <ul>
                ${detail.points.map((point) => `<li>${point}</li>`).join('')}
              </ul>
              <button class="model-template-btn" type="button" data-action="applyProductLineTemplate" data-model="${detail.id}">Собрать пример цепочки</button>
            </details>
          `).join('')}
        </div>
      </section>

      <section class="lead-section" id="product-line-builder">
        <p class="brand-label">Черновик линейки</p>
        <h2>Соберите свою цепочку</h2>
        <p class="lead-section-copy">Выберите этапы, которые уже есть, и добавьте те, которые хотите проверить.</p>
        ${templateModel ? `<p class="builder-template-note">Сейчас показан пример для модели «${templateModel.title}». Его можно менять вручную.</p>` : ''}
        <div class="stage-picker">
          ${productLinesMaterial.stages.map(([id, title, hint]) => `
            <button class="${state.productLineStages.includes(id) ? 'selected' : ''}" type="button" data-action="toggleProductStage" data-stage="${id}">
              <strong>${title}</strong>
              <span>${hint}</span>
            </button>
          `).join('')}
        </div>
        <div class="route-strip">
          ${selectedStages.length ? selectedStages.map(([id, title], index) => `
            <span>${String(index + 1).padStart(2, '0')} ${title}</span>
          `).join('') : '<p>Выберите хотя бы один этап.</p>'}
        </div>
        <button class="soft-btn" type="button" data-action="resetProductStages">Начать с двух основных этапов</button>
      </section>

      <section class="lead-section">
        <p class="brand-label">Поддержка линейки</p>
        <h2>Чем поддерживать линейку</h2>
        <div class="support-list">
          ${productLinesMaterial.support.map(([title, text]) => `
            <article>
              <strong>${title}</strong>
              <p>${text}</p>
            </article>
          `).join('')}
        </div>
      </section>

      ${renderMaterialOutcome('products', 'product-line-builder')}

      <section class="lead-cta">
        <h2>Нужно разобрать ваши продукты?</h2>
        <p>Поможем увидеть, что уже можно связать в линейку и какое предложение добавить следующим.</p>
        <button class="primary-btn" type="button" data-action="openEmail" data-service="Продуктовая линейка">Написать нам</button>
      </section>
    `, 'material-screen product-lines-screen');
  }

  function trafficAtlasComplete(answers = state.trafficAtlasAnswers) {
    return trafficAtlasMaterial.questions.every((question) => answers[question.id]);
  }

  function trafficAtlasScore(channel, answers = state.trafficAtlasAnswers) {
    const offerWeights = channel.weights?.business || {};
    const offerScore = answers.offer === 'both'
      ? Math.max(offerWeights.services || 0, offerWeights.products || 0) - 1
      : (offerWeights[answers.offer] || 0);
    const meta = trafficAtlasMaterial.channelMeta[channel.id] || {};
    const audienceScore = answers.audience === 'both'
      ? (meta.audiences?.length > 1 ? 4 : 2)
      : (meta.audiences?.includes(answers.audience) ? 4 : 0);
    const reachScore = answers.reach === 'both'
      ? (meta.reach?.length > 1 ? 4 : 2)
      : (meta.reach?.includes(answers.reach) ? 4 : 0);

    return Math.max(0, offerScore)
      + audienceScore
      + reachScore
      + (channel.weights?.goal?.[answers.goal] || 0)
      + (channel.weights?.budget?.[answers.budget] || 0);
  }

  function trafficChannelFitsBudget(channel, answers = state.trafficAtlasAnswers) {
    const budgetOrder = { none: 0, small: 1, medium: 2, large: 3 };
    const minBudget = trafficAtlasMaterial.channelMeta[channel.id]?.minBudget || 'none';
    return (budgetOrder[answers.budget] ?? 0) >= (budgetOrder[minBudget] ?? 0);
  }

  function recommendedTrafficChannels(answers = state.trafficAtlasAnswers) {
    const channels = trafficAtlasMaterial.channels
      .filter((channel) => !answers.budget || trafficChannelFitsBudget(channel, answers))
      .map((channel) => ({ ...channel, score: trafficAtlasScore(channel, answers) }))
      .sort((a, b) => b.score - a.score || Number(a.number) - Number(b.number))
      .slice(0, 4);

    if (channels.length >= 4) return channels;

    return [
      ...channels,
      ...trafficAtlasMaterial.channels
        .filter((channel) => !channels.some((item) => item.id === channel.id))
        .map((channel) => ({ ...channel, score: trafficAtlasScore(channel, answers) }))
        .sort((a, b) => b.score - a.score || Number(a.number) - Number(b.number))
        .slice(0, 4 - channels.length)
    ];
  }

  function renderTrafficAtlasMaterial() {
    const complete = trafficAtlasComplete();
    const answeredCount = trafficAtlasMaterial.questions.filter((question) => state.trafficAtlasAnswers[question.id]).length;
    const recommendations = recommendedTrafficChannels();
    const focus = state.trafficAtlasFocus
      ? trafficAtlasMaterial.channels.find((channel) => channel.id === state.trafficAtlasFocus)
      : complete
        ? recommendations[0]
        : null;

    return screen(`
      <button class="back-link" type="button" data-page="library">← В кладовую</button>

      <article class="lead-hero traffic-hero">
        <div>
          <p class="brand-label">Атлас трафика 2026</p>
          <h1>Куда идти за новой аудиторией?</h1>
          <p class="lead">Сузьте выбор источников трафика с учётом предложения, аудитории, географии, задачи и бюджета. После пяти коротких вопросов вы получите список каналов, с которых можно начать. Наблюдения о площадках обновлены в июне 2026 года.</p>
        </div>
      </article>

      <section class="lead-section">
        <p class="brand-label">Карта каналов</p>
        <h2>Четыре группы</h2>
        <p class="lead-section-copy">Каналы отличаются по задаче, сроку и ресурсу. Для быстрых заявок и долгого привлечения нужны разные варианты.</p>
        <div class="support-list traffic-zone-summary">
          ${trafficAtlasMaterial.groups.map((group) => `
            <article>
              <strong>${group.number} ${group.title}</strong>
              <p>${group.intro}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="lead-section" id="traffic-atlas-navigator">
        <p class="brand-label">Навигатор</p>
        <h2>Что проверить первым?</h2>
        <p class="lead-section-copy">Выберите по одному варианту в каждом блоке. После пятого ответа появятся четыре канала для первой проверки.</p>
        <div class="sales-answer-status traffic-answer-status" aria-live="polite">
          <span>${answeredCount} из ${trafficAtlasMaterial.questions.length}</span>
          <strong>${complete ? 'Маршрут готов' : answeredCount ? 'Продолжайте выбирать' : 'Начните с первого блока'}</strong>
        </div>
        <div class="selector-mini sales-selector traffic-selector">
          ${trafficAtlasMaterial.questions.map((question, index) => `
            <article class="selector-question">
              <div class="selector-question-title">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${question.title}</strong>
              </div>
              <div class="selector-options">
                ${question.options.map(([value, label, hint]) => `
                  <button class="selector-option ${state.trafficAtlasAnswers[question.id] === value ? 'selected' : ''}" type="button" data-action="chooseTrafficAtlasAnswer" data-question="${question.id}" data-value="${value}">
                    <strong>${label}</strong>
                    <small>${hint}</small>
                  </button>
                `).join('')}
              </div>
            </article>
          `).join('')}
        </div>

        <div class="lead-recommendation ${complete ? '' : 'muted'}" id="traffic-atlas-recommendation" aria-live="polite">
          <span>${complete ? 'С чего начать' : `Ответов ${answeredCount} из ${trafficAtlasMaterial.questions.length}`}</span>
          <h3>${complete ? 'Каналы для первой проверки' : 'Ответьте на 5 вопросов'}</h3>
          <p>${complete ? 'Это не медиаплан, а короткий список для старта. Нажмите на канал, чтобы прочитать пояснение.' : 'Нужны все пять ответов: предложение, аудитория, география, главная задача и бюджет на первый тест.'}</p>
          ${complete ? `
            <div class="channel-recommendations">
              ${recommendations.map((channel) => `
                <button class="channel-recommendation-card ${focus?.id === channel.id ? 'selected' : ''}" type="button" data-action="focusTrafficChannel" data-channel="${channel.id}">
                  <b>${channel.number}</b>
                  <span>
                    <strong>${channel.title}</strong>
                    <em>${channel.short}</em>
                  </span>
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </section>

      ${focus ? `
        <section class="lead-section" id="traffic-channel-focus">
          <p class="brand-label">Разбор канала</p>
          <h2>${focus.title}</h2>
          <p class="lead-section-copy">${focus.short}</p>
          <article class="lead-model sales-focus-card traffic-focus-card">
            <b>${focus.number}</b>
            <h3>${focus.group}</h3>
            <p>${focus.fit}</p>
            <p>${focus.text}</p>
          </article>
        </section>
      ` : ''}

      <section class="lead-section">
        <p class="brand-label">Карта</p>
        <h2>Все каналы из атласа</h2>
        <p class="lead-section-copy">Ниже — все каналы из материала. Нажмите на любой, чтобы открыть краткое описание.</p>
        <div class="sales-zone-list traffic-zone-list">
          ${trafficAtlasMaterial.groups.map((group) => `
            <article class="sales-zone traffic-zone">
              <h3>${group.title}</h3>
              <div>
                ${group.channels.map((channelId) => {
                  const channel = trafficAtlasMaterial.channels.find((item) => item.id === channelId);
                  return `
                    <button class="${focus?.id === channel.id ? 'selected' : ''}" type="button" data-action="focusTrafficChannel" data-channel="${channel.id}">
                      <span>${channel.number}</span>
                      <strong>${channel.title}</strong>
                    </button>
                  `;
                }).join('')}
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      ${renderMaterialOutcome('traffic', 'traffic-atlas-navigator')}

      <section class="lead-cta">
        <h2>Нужна помощь с выбором канала?</h2>
        <p>Разберём продукт, аудиторию и доступный ресурс, а затем выберем один канал для первого теста.</p>
        <button class="primary-btn" type="button" data-action="openEmail" data-service="Выбор канала продвижения">Написать нам</button>
      </section>
    `, 'material-screen product-lines-screen traffic-atlas-screen');
  }

  function salesChannelsComplete(answers = state.salesChannelAnswers) {
    return salesChannelsMaterial.questions.every((question) => answers[question.id]);
  }

  function salesRuleScore(channelId, rankedIds) {
    const position = rankedIds.indexOf(channelId);
    if (position === -1) return 0;
    return Math.max(2, 10 - position);
  }

  function salesCurrentChannelPenalty(channelId, current) {
    const currentGroups = {
      online: ['online'],
      offline: ['offline', 'events', 'mobile', 'vending', 'retail'],
      direct: ['sales-team', 'remote'],
      partners: ['partners', 'competitors', 'everyone', 'network']
    };
    return currentGroups[current]?.includes(channelId) ? 6 : 0;
  }

  function salesTagBonus(channel, answers) {
    const audienceBonus = answers.audience === 'people'
      ? (channel.tags.includes('b2c') ? 5 : channel.tags.includes('all') ? 3 : 0)
      : answers.audience === 'companies'
        ? (channel.tags.includes('b2b') ? 5 : channel.tags.includes('all') ? 3 : 0)
        : (channel.tags.includes('all') ? 5 : (channel.tags.includes('b2c') || channel.tags.includes('b2b')) ? 3 : 0);
    const goalBonus = channel.tags.includes(answers.goal) ? 5 : 0;
    const resourceBonus = channel.tags.includes(answers.resource) ? 4 : 0;
    const formatBonus = channel.tags.includes(answers.format) ? 4 : 0;
    return audienceBonus + goalBonus + resourceBonus + formatBonus;
  }

  function recommendedSalesChannels(answers = state.salesChannelAnswers) {
    return salesChannelsMaterial.channels
      .map((channel) => {
        const score = Object.entries(answers).reduce((sum, [question, answer]) => {
          const rankedIds = salesChannelsMaterial.rules[question]?.[answer] || [];
          return sum + salesRuleScore(channel.id, rankedIds);
        }, 0);
        return {
          ...channel,
          score: score
            + salesTagBonus(channel, answers)
            - salesCurrentChannelPenalty(channel.id, answers.current)
        };
      })
      .sort((a, b) => b.score - a.score || Number(a.number) - Number(b.number))
      .slice(0, 3);
  }

  function renderSalesChannelsMaterial() {
    const complete = salesChannelsComplete();
    const answeredCount = salesChannelsMaterial.questions.filter((question) => state.salesChannelAnswers[question.id]).length;
    const recommendations = recommendedSalesChannels();
    const focus = state.salesChannelFocus
      ? salesChannelsMaterial.channels.find((channel) => channel.id === state.salesChannelFocus)
      : complete
        ? recommendations[0]
        : null;
    const zones = [...new Set(salesChannelsMaterial.channels.map((channel) => channel.zone))];

    return screen(`
      <button class="back-link" type="button" data-page="library">← В кладовую</button>

      <article class="lead-hero sales-hero">
        <div>
          <p class="brand-label">Каналы продаж</p>
          <h1>Какой канал продаж проверить следующим?</h1>
          <p class="lead">Сравните способы продаж с учётом клиентов, задачи, ресурсов, подходящего формата и канала, который уже работает. После пяти вопросов вы получите три варианта для следующей проверки.</p>
        </div>
      </article>

      <section class="lead-section">
        <p class="brand-label">Перед запуском</p>
        <h2>Что проверить заранее</h2>
        <p class="lead-section-copy">Перед запуском нового канала проверьте четыре вещи. Они помогут не тратить силы на несколько экспериментов сразу.</p>
        <div class="support-list sales-safety-list">
          ${salesChannelsMaterial.safety.map(([title, text], index) => `
            <article>
              <strong>${String(index + 1).padStart(2, '0')} ${title}</strong>
              <p>${text}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="lead-section" id="sales-channel-navigator">
        <p class="brand-label">Навигатор</p>
        <h2>Какой канал проверить следующим?</h2>
        <p class="lead-section-copy">Выберите по одному варианту в каждом блоке. После пятого ответа появятся три канала для следующей проверки.</p>
        <div class="sales-answer-status" aria-live="polite">
          <span>${answeredCount} из ${salesChannelsMaterial.questions.length}</span>
          <strong>${complete ? 'Подбор готов' : answeredCount ? 'Продолжайте выбирать' : 'Начните с первого блока'}</strong>
        </div>
        <div class="selector-mini sales-selector">
          ${salesChannelsMaterial.questions.map((question, index) => `
            <article class="selector-question">
              <div class="selector-question-title">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${question.title}</strong>
              </div>
              <div class="selector-options">
                ${question.options.map(([value, label]) => `
                  <button class="selector-option ${state.salesChannelAnswers[question.id] === value ? 'selected' : ''}" type="button" data-action="chooseSalesChannelSelector" data-question="${question.id}" data-value="${value}">
                    ${label}
                  </button>
                `).join('')}
              </div>
            </article>
          `).join('')}
        </div>

        <div class="lead-recommendation ${complete ? '' : 'muted'}" id="sales-channel-recommendation" aria-live="polite">
          <span>${complete ? 'Сначала посмотрите' : `Ответов ${answeredCount} из ${salesChannelsMaterial.questions.length}`}</span>
          <h3>${complete ? 'Три канала-кандидата' : 'Ответьте на 5 вопросов'}</h3>
          <p>${complete ? 'Это варианты для следующей проверки, а не готовая стратегия. Нажмите на канал, чтобы прочитать пояснение.' : 'Нужны все пять ответов: кто покупает, какая задача стоит сейчас, какой ресурс доступен, где может происходить продажа и что уже приносит продажи.'}</p>
          ${complete ? `
            <div class="channel-recommendations">
              ${recommendations.map((channel) => `
                <button class="channel-recommendation-card ${focus?.id === channel.id ? 'selected' : ''}" type="button" data-action="focusSalesChannel" data-channel="${channel.id}">
                  <b>${channel.number}</b>
                  <span>
                    <strong>${channel.title}</strong>
                    <em>${channel.short}</em>
                  </span>
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </section>

      ${focus ? `
        <section class="lead-section sales-focus-section" id="sales-channel-focus">
          <p class="brand-label">${complete ? 'Разбор канала' : 'Канал из карты'}</p>
          <h2>${focus.title}</h2>
          <p class="lead-section-copy">${focus.short}</p>
          <article class="lead-model sales-focus-card">
            <b>${focus.number}</b>
            <h3>${focus.zone}</h3>
            <p>${focus.text}</p>
          </article>
        </section>
      ` : ''}

      <section class="lead-section">
        <p class="brand-label">Карта</p>
        <h2>Все 16 каналов</h2>
        <p class="lead-section-copy">Не нужно запускать их все. Откройте список, сравните варианты и выберите один для следующего теста.</p>
        <div class="sales-zone-list">
          ${zones.map((zone) => `
            <article class="sales-zone">
              <h3>${zone}</h3>
              <div>
                ${salesChannelsMaterial.channels.filter((channel) => channel.zone === zone).map((channel) => `
                  <button class="${focus?.id === channel.id ? 'selected' : ''}" type="button" data-action="focusSalesChannel" data-channel="${channel.id}">
                    <span>${channel.number}</span>
                    <strong>${channel.title}</strong>
                  </button>
                `).join('')}
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      ${renderMaterialOutcome('sales', 'sales-channel-navigator')}

      <section class="lead-cta">
        <h2>Нужна помощь с выбором канала?</h2>
        <p>Разберём текущие продажи, найдём слабое место и выберем один канал для проверки.</p>
        <button class="primary-btn" type="button" data-action="openEmail" data-service="Выбор канала продаж">Написать нам</button>
      </section>
    `, 'material-screen product-lines-screen sales-channels-screen');
  }

  function renderMaterial() {
    if (state.material === 'traffic') return renderTrafficAtlasMaterial();
    if (state.material === 'products') return renderProductLinesMaterial();
    if (state.material === 'sales') return renderSalesChannelsMaterial();
    return renderLibrary();
  }

  function renderContacts() {
    const elizavetaChannelButton = APP_PLATFORM === 'telegram'
      ? `<button class="author-channel-link" type="button" data-action="openExternalLink" data-url="${ELIZAVETA_TELEGRAM_CHANNEL_URL}">Канал «Игровые нейроны»</button>`
      : '';
    const elenaChannelButton = APP_PLATFORM === 'telegram'
      ? `<button class="author-channel-link" type="button" data-action="openExternalLink" data-url="${ELENA_TELEGRAM_CHANNEL_URL}">Канал «Воронки впечатлений»</button>`
      : '';
    const nativeDocumentsLink = USE_NATIVE_TRENDS
      ? `
        <section class="native-legal-access" aria-label="Документы">
          <button class="native-legal-access__button" type="button" data-action="openNativeDocuments">
            Политика и соглашения
          </button>
        </section>
      `
      : '';
    const selectedTask = marketingTasks.find((task) => task.id === state.contactTask) || marketingTasks[0];

    return screen(`
      <section class="contacts-hero">
        <p class="brand-label">Услуги Мирофактуры</p>
        <h1>Сначала стратегия. Потом — цифровой мир</h1>
        <p class="lead">Помогаем бизнесу объяснить ценность продукта, удержать внимание аудитории и превратить интерес в заявки и покупки. Сначала определяем стратегию, затем создаём решение под задачу: упаковку и контент, игру, квиз или мини-приложение.</p>
        <div class="contacts-hero-actions">
          <button class="primary-btn" type="button" data-action="focusContactMap">Посмотреть услуги</button>
          <button class="soft-btn" type="button" data-action="openEmail">Написать нам</button>
        </div>
      </section>

      <section class="task-map-panel" id="marketing-task-map" aria-labelledby="task-map-title">
        <p class="brand-label">С чем помочь</p>
        <h2 class="contacts-section-title" id="task-map-title">Наши услуги</h2>
        <p class="contacts-section-lead">Выберите ситуацию, которая сейчас ближе всего.</p>
        <div class="task-map" aria-label="Услуги Мирофактуры">
          ${marketingTasks.map((task) => `
            <button class="task-node ${task.id === selectedTask.id ? 'selected' : ''}" type="button" data-action="selectContactTask" data-task="${task.id}" aria-pressed="${task.id === selectedTask.id}">
              ${task.label}
            </button>
          `).join('')}
        </div>
        <article class="task-detail" aria-live="polite">
          <h3>${selectedTask.title}</h3>
          <dl>
            <div><dt>Что сделаем</dt><dd>${selectedTask.text}</dd></div>
            <div><dt>Например</dt><dd>${selectedTask.example}</dd></div>
            <div><dt>Что получает бизнес</dt><dd>${selectedTask.benefit}</dd></div>
          </dl>
        </article>
      </section>

      <section class="authors-panel" aria-label="Авторы">
        <h2 class="contacts-section-title">Авторы Мирофактуры</h2>
        <div class="authors-photo">
          <img src="${assets.authors}" alt="Лиза и Лена — авторы Мирофактуры" loading="lazy" decoding="async">
        </div>
        <div class="author-list">
          <div class="author-card author-card--experience">
            <span>
              <span class="author-role">Архитектура опыта и цифровые продукты</span>
              <strong>Елизавета Викулова</strong>
              <small>Проектирует продукты-миры и цифровые экосистемы для бизнеса, соединяя режиссуру, геймдизайн и психологию внимания. Создаёт концепции, сценарии и механики интерактивных продуктов.</small>
              ${elizavetaChannelButton}
            </span>
          </div>
          <div class="author-card author-card--marketing">
            <span>
              <span class="author-role">Системный маркетинг и воронки впечатлений</span>
              <strong>Елена Попова</strong>
              <small>Проектирует маркетинг как систему: от первого знакомства с продуктом до покупки, повторного обращения и рекомендации. Продумывает воронки, контент и механики, которые помогают клиентам запомнить компанию, вернуться за следующей покупкой и порекомендовать её знакомым.</small>
              ${elenaChannelButton}
            </span>
          </div>
        </div>
      </section>

      <section class="contacts-cta">
        <p class="brand-label">С чего начать</p>
        <h2>Расскажите о задаче</h2>
        <p>Напишите, что вы продаёте и что сейчас не работает: мало заявок, сложный продукт, нерегулярный контент или слишком много ручной работы. Мы предложим, с чего начать.</p>
        <button class="primary-btn" type="button" data-action="openEmail">Написать нам</button>
      </section>

      ${nativeDocumentsLink}

    `, 'contacts-screen');
  }

  function trendsFrameSrc() {
    const isLocalPreview = window.location.protocol === 'file:'
      || window.location.hostname === 'localhost'
      || window.location.hostname === '127.0.0.1';
    const params = new URLSearchParams({
      platform: PLATFORM.key,
      messenger: PLATFORM.messenger,
      source: 'mirofaktura-app',
      v: '20260719-authors-01',
    });
    const platformUserId = getPlatformUserId();
    const platformUser = getPlatformUser();

    if (platformUserId) {
      params.set(PLATFORM.key === 'telegram' ? 'telegram_user_id' : 'max_user_id', platformUserId);
    }
    if (platformUser.first_name) params.set('first_name', platformUser.first_name);
    if (platformUser.last_name) params.set('last_name', platformUser.last_name);

    if (new URLSearchParams(window.location.search).get('multy_test') === '1') {
      params.set('multy_test', '1');
    }

    if (isLocalPreview) params.set('fresh', '1');

    return `./trends-deck.html?${params.toString()}`;
  }

  function renderTrends() {
    if (USE_NATIVE_TRENDS) {
      return screen(`
        <div class="trends-native-page">
          <div class="trends-native-tabs" role="tablist" aria-label="Разделы колоды трендов">
            <button class="trends-native-tab active" type="button" data-trends-tab="daily" role="tab" aria-selected="true">Карта</button>
            <button class="trends-native-tab" type="button" data-trends-tab="collection" role="tab" aria-selected="false">Коллекция</button>
            <button class="trends-native-tab" type="button" data-trends-tab="authors" role="tab" aria-selected="false">Авторы</button>
          </div>
          <div id="c37" class="trends-native-host" aria-label="Колода трендов 2026">
            <div class="trends-native-loader" role="status" aria-label="Загрузка колоды трендов">
              <span class="trends-native-loader__mark" aria-hidden="true"></span>
              <span class="trends-native-loader__text">Открываем колоду…</span>
            </div>
          </div>
        </div>
      `, 'trends-screen trends-native-screen');
    }

    return screen(`
      <div class="trends-page">
        <div class="trends-frame-wrap" aria-label="Колода трендов 2026">
          <div class="trends-frame-loader" role="status" aria-label="Загрузка колоды трендов">
            <span class="trends-frame-loader__mark" aria-hidden="true"></span>
            <span class="trends-frame-loader__text">Открываем колоду…</span>
          </div>
          <iframe class="trends-frame" src="${trendsFrameSrc()}" title="Колода трендов 2026"></iframe>
        </div>
      </div>
    `, 'trends-screen');
  }

  // Add new screens here before wiring their buttons or actions.
  const PAGE_RENDERERS = {
    home: renderHome,
    quiz: renderQuiz,
    result: renderResult,
    gate: renderGate,
    library: renderLibrary,
    material: renderMaterial,
    contacts: renderContacts,
    trends: renderTrends
  };

  function prepareTrendsFrame() {
    const nativeHost = app.querySelector('.trends-native-host');
    if (nativeHost) {
      nativeHost.addEventListener('mirofactura:trend-ready', () => {
        nativeHost.classList.add('is-ready');
        window.setTimeout(() => nativeHost.querySelector('.trends-native-loader')?.remove(), 300);
      }, { once: true });
      prepareNativeTrends(nativeHost);
      return;
    }

    const frame = app.querySelector('.trends-frame');
    const wrap = frame?.closest('.trends-frame-wrap');
    if (!frame || !wrap) return;

    let fallbackTimer = 0;
    const revealFrame = () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('message', handleFrameReady);
      window.requestAnimationFrame(() => wrap.classList.add('is-loaded'));
    };
    const handleFrameReady = (event) => {
      if (event.source !== frame.contentWindow || event.data?.type !== 'mirofactura:trends-ready') return;
      revealFrame();
    };

    window.addEventListener('message', handleFrameReady);
    frame.addEventListener('load', () => {
      fallbackTimer = window.setTimeout(revealFrame, 12000);
    }, { once: true });
  }

  let nativeTrendDeckScriptPromise = null;
  let nativeTrendDeckStylesPromise = null;

  function loadNativeTrendDeckStyles() {
    if (nativeTrendDeckStylesPromise) return nativeTrendDeckStylesPromise;

    nativeTrendDeckStylesPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('mirofaktura-trends-native-styles');
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.id = 'mirofaktura-trends-native-styles';
      link.rel = 'stylesheet';
      link.href = `./trends-native.css?v=${NATIVE_TRENDS_ASSET_VERSION}`;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('native trend deck styles failed'));
      document.head.appendChild(link);
    });

    return nativeTrendDeckStylesPromise;
  }

  function loadNativeTrendDeckScript() {
    if (window.MirofacturaTrendDeck) return Promise.resolve();
    if (nativeTrendDeckScriptPromise) return nativeTrendDeckScriptPromise;

    window.MIROFAKTURA_TRENDS_MANUAL_MOUNT = true;
    nativeTrendDeckScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `./trend-deck-native.js?v=${NATIVE_TRENDS_ASSET_VERSION}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('native trend deck script failed'));
      document.body.appendChild(script);
    });

    return nativeTrendDeckScriptPromise;
  }

  function loadNativeTrendDeckAssets() {
    return Promise.all([
      loadNativeTrendDeckStyles(),
      loadNativeTrendDeckScript()
    ]);
  }

  function ensureNativeLegalPortal(documents) {
    let portal = document.getElementById('native-legal-portal');
    if (portal) return portal;

    portal = document.createElement('div');
    portal.id = 'native-legal-portal';
    portal.className = 'native-legal-portal';
    portal.setAttribute('aria-hidden', 'true');
    portal.innerHTML = `
      <div class="native-legal-dialog" role="dialog" aria-modal="true" aria-labelledby="native-legal-dialog-title">
        <button class="native-legal-close" type="button" data-native-legal-close aria-label="Закрыть">×</button>
        <div class="native-legal-list-view">
          <h2 id="native-legal-dialog-title">Документы</h2>
          <div class="native-legal-list"></div>
        </div>
        <div class="native-legal-document-view" hidden>
          <header class="native-legal-document-header">
            <button class="native-legal-back" type="button" aria-label="Вернуться к списку">←</button>
            <h2 class="native-legal-document-title"></h2>
            <button class="native-legal-document-close" type="button" data-native-legal-close aria-label="Закрыть">×</button>
          </header>
          <div class="native-legal-document-text"></div>
        </div>
      </div>
    `;

    const listView = portal.querySelector('.native-legal-list-view');
    const documentView = portal.querySelector('.native-legal-document-view');
    const list = portal.querySelector('.native-legal-list');
    const title = portal.querySelector('.native-legal-document-title');
    const text = portal.querySelector('.native-legal-document-text');
    const closePortal = () => {
      portal.classList.remove('visible');
      portal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('native-legal-open');
      window.setTimeout(() => {
        documentView.hidden = true;
        listView.hidden = false;
      }, 180);
    };

    documents.forEach((documentItem) => {
      const button = document.createElement('button');
      button.className = 'native-legal-list__button';
      button.type = 'button';
      button.textContent = documentItem.label;
      button.addEventListener('click', () => {
        title.textContent = documentItem.title;
        text.textContent = documentItem.text;
        listView.hidden = true;
        documentView.hidden = false;
        text.scrollTop = 0;
      });
      list.appendChild(button);
    });

    portal.querySelectorAll('[data-native-legal-close]').forEach((button) => {
      button.addEventListener('click', closePortal);
    });
    portal.querySelector('.native-legal-back').addEventListener('click', () => {
      documentView.hidden = true;
      listView.hidden = false;
    });
    portal.addEventListener('click', (event) => {
      if (event.target === portal) closePortal();
    });
    portal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePortal();
    });

    document.body.appendChild(portal);
    return portal;
  }

  async function openNativeDocuments() {
    try {
      await loadNativeTrendDeckAssets();
      const documents = window.MirofacturaTrendDeck?.getLegalDocuments?.() || [];
      if (!documents.length) throw new Error('native legal documents unavailable');
      const portal = ensureNativeLegalPortal(documents);
      portal.classList.add('visible');
      portal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('native-legal-open');
      window.requestAnimationFrame(() => portal.querySelector('.native-legal-close')?.focus());
    } catch (_) {
      showToast('Не удалось открыть документы');
    }
  }

  function prepareNativeTrends(host) {
    const tabs = [...app.querySelectorAll('.trends-native-tab')];
    const setActiveTab = (tab) => {
      tabs.forEach((button) => {
        const active = button.dataset.trendsTab === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      window.MirofacturaTrendDeck?.showTab?.(tab);
    };

    tabs.forEach((button) => {
      button.addEventListener('click', () => setActiveTab(button.dataset.trendsTab || 'daily'));
    });

    host.addEventListener('mirofactura:trend-tab', (event) => {
      const tab = event.detail?.tab || 'daily';
      tabs.forEach((button) => {
        const active = button.dataset.trendsTab === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    });

    loadNativeTrendDeckAssets()
      .then(() => {
        window.MirofacturaTrendDeck?.mount?.({
          containerId: host.id,
          mode: 'native'
        });
        setActiveTab('daily');
      })
      .catch(() => {
        host.innerHTML = '<div class="trends-native-error">Не удалось открыть колоду. Попробуйте обновить приложение.</div>';
      });
  }

  function render(options = {}) {
    const renderPage = PAGE_RENDERERS[state.page] || renderHome;
    window.MirofacturaTrendDeck?.destroy?.();
    app.innerHTML = renderPage();
    if (USE_NATIVE_TRENDS && state.page === 'contacts') {
      loadNativeTrendDeckStyles().catch(() => {});
    }
    prepareImageReveals();
    prepareTrendsFrame();
    if (options.scroll !== false) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function dismissStartupLoader() {
    const loader = document.getElementById('app-loader');
    const appRoot = document.getElementById('app');
    window.clearTimeout(window.__mirofakturaLoaderTimer);
    appRoot?.classList.add('is-ready');
    if (!loader) return;
    loader.classList.remove('is-visible');
    window.requestAnimationFrame(() => {
      loader.classList.add('is-hidden');
      window.setTimeout(() => loader.remove(), 300);
    });
  }

  function showToast(text) {
    state.toast = text;
    render({ scroll: false });
    window.setTimeout(() => {
      state.toast = '';
      render({ scroll: false });
    }, 1800);
  }

  async function copyPlainText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    }
  }

  async function loadStoryImage(src) {
    if (typeof window.createImageBitmap === 'function' && window.location.protocol !== 'file:') {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await window.createImageBitmap(await response.blob());
      } catch (_) {
        // Image.decode below keeps local previews and older WebViews working.
      }
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = async () => {
        try {
          await image.decode();
        } catch (_) {
          // onload already confirms that the image can be drawn.
        }
        resolve(image);
      };
      image.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`));
      image.src = src;
    });
  }

  function storyImageSize(image) {
    return {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height
    };
  }

  function canvasTextLines(context, text, maxWidth, maxLines = Infinity) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';

    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (!line || context.measureText(next).width <= maxWidth) {
        line = next;
      } else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);

    if (lines.length <= maxLines) return lines;
    const clipped = lines.slice(0, maxLines);
    let last = clipped[maxLines - 1];
    while (last && context.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    clipped[maxLines - 1] = `${last.trim()}…`;
    return clipped;
  }

  function drawCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
    const lines = canvasTextLines(context, text, maxWidth, maxLines);
    lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
    return {
      lines,
      height: lines.length * lineHeight,
      bottom: y + lines.length * lineHeight
    };
  }

  async function createStoryCardCanvas(key) {
    const story = materialStoryData(key);
    if (!story) throw new Error('Сначала завершите подбор');

    const [logo, aristarch] = await Promise.all([
      loadStoryImage(assets.logoStory),
      loadStoryImage(assets.aristarchStory)
    ]);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Не удалось подготовить карточку');

    const background = context.createLinearGradient(0, 0, 1080, 1920);
    background.addColorStop(0, '#052e2c');
    background.addColorStop(0.52, '#07544f');
    background.addColorStop(1, '#00847d');
    context.fillStyle = background;
    context.fillRect(0, 0, 1080, 1920);

    const yellowGlow = context.createRadialGradient(900, 120, 20, 900, 120, 480);
    yellowGlow.addColorStop(0, 'rgba(255, 216, 74, 0.58)');
    yellowGlow.addColorStop(1, 'rgba(255, 216, 74, 0)');
    context.fillStyle = yellowGlow;
    context.fillRect(420, -360, 960, 960);

    const tealGlow = context.createRadialGradient(80, 1580, 20, 80, 1580, 620);
    tealGlow.addColorStop(0, 'rgba(68, 239, 225, 0.5)');
    tealGlow.addColorStop(1, 'rgba(40, 212, 206, 0)');
    context.fillStyle = tealGlow;
    context.fillRect(-540, 960, 1240, 1240);

    const logoSize = storyImageSize(logo);
    const logoCropY = Math.round(logoSize.height * 0.22);
    const logoCropHeight = Math.round(logoSize.height * 0.62);
    context.save();
    context.shadowColor = 'rgba(0, 18, 17, 0.28)';
    context.shadowBlur = 24;
    context.drawImage(
      logo,
      0,
      logoCropY,
      logoSize.width,
      logoCropHeight,
      72,
      54,
      360,
      126
    );
    context.restore();

    context.textBaseline = 'top';
    context.textAlign = 'right';
    context.fillStyle = '#fffbea';
    context.font = '800 30px "Segoe UI", Arial, sans-serif';
    drawCanvasText(context, STORY_DESTINATION_CTA_ACTION, 998, 82, 330, 35, 3);

    context.textAlign = 'left';
    context.fillStyle = '#fffbea';
    const quoteFontSize = key === 'products' ? 70 : key === 'traffic' ? 74 : 78;
    const quoteLineHeight = key === 'products' ? 82 : key === 'traffic' ? 86 : 90;
    context.font = `800 ${quoteFontSize}px "Segoe UI", Arial, sans-serif`;
    const quoteLayout = drawCanvasText(context, story.quote, 82, 278, 900, quoteLineHeight, 7);

    context.fillStyle = '#79f4e8';
    context.font = '800 27px "Segoe UI", Arial, sans-serif';
    context.fillText('— АРИСТАРХ', 82, quoteLayout.bottom + 18);

    const mascotSize = storyImageSize(aristarch);
    const mascotWidth = 790;
    const mascotHeight = mascotWidth * mascotSize.height / mascotSize.width;
    const mascotX = (1080 - mascotWidth) / 2;
    const mascotY = 1920 - mascotHeight - 18;
    const mascotGlow = context.createRadialGradient(790, 1450, 10, 790, 1450, 520);
    mascotGlow.addColorStop(0, 'rgba(255, 216, 74, 0.25)');
    mascotGlow.addColorStop(0.45, 'rgba(64, 226, 220, 0.25)');
    mascotGlow.addColorStop(1, 'rgba(40, 212, 206, 0)');
    context.fillStyle = mascotGlow;
    context.fillRect(260, 860, 1080, 1060);
    context.save();
    context.globalAlpha = 0.22;
    context.strokeStyle = '#65eee2';
    context.lineWidth = 5;
    context.beginPath();
    context.arc(810, 1430, 390, 0, Math.PI * 2);
    context.stroke();
    context.restore();
    context.save();
    context.globalAlpha = 0.98;
    context.drawImage(aristarch, mascotX, mascotY, mascotWidth, mascotHeight);
    context.restore();

    return { canvas, story };
  }

  async function createStoryCardFile(key) {
    const { canvas, story } = await createStoryCardCanvas(key);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('Не удалось сохранить изображение'));
      }, 'image/png');
    });
    const file = typeof File === 'function'
      ? new File([blob], story.filename, { type: 'image/png' })
      : null;
    return { blob, file, story };
  }

  function downloadStoryCard(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function telegramStoryCardUrl(key) {
    const asset = TELEGRAM_STORY_CARD_ASSETS[key];
    if (!asset) return '';
    const url = new URL(asset, window.location.href);
    url.searchParams.set('v', STORY_CARD_ASSET_VERSION);
    return url.href;
  }

  function shareStoryCardToTelegram(key) {
    if (
      APP_PLATFORM !== 'telegram'
      || !telegramWebApp
      || typeof telegramWebApp.shareToStory !== 'function'
      || (typeof telegramWebApp.isVersionAtLeast === 'function' && !telegramWebApp.isVersionAtLeast('7.8'))
    ) {
      return false;
    }

    const mediaUrl = telegramStoryCardUrl(key);
    if (!mediaUrl) return false;
    const params = {
      text: 'Совет Аристарха для бизнеса'
    };
    if (telegramWebApp.initDataUnsafe?.user?.is_premium) {
      params.widget_link = {
        url: TELEGRAM_BOT_URL,
        name: 'Получить совет'
      };
    }

    telegramWebApp.shareToStory(mediaUrl, params);
    return true;
  }

  function downloadStoryCardInTelegram(key) {
    const story = materialStoryData(key);
    if (
      !story
      || APP_PLATFORM !== 'telegram'
      || !telegramWebApp
      || typeof telegramWebApp.downloadFile !== 'function'
      || (typeof telegramWebApp.isVersionAtLeast === 'function' && !telegramWebApp.isVersionAtLeast('8.0'))
    ) {
      return false;
    }

    const url = telegramStoryCardUrl(key);
    if (!url) return false;
    telegramWebApp.downloadFile({
      url,
      file_name: story.filename
    }, (accepted) => {
      showToast(accepted
        ? 'Картинка скачивается. Ищите её в «Загрузках» или «Файлах».'
        : 'Сохранение отменено');
    });
    return true;
  }

  async function shareStoryCard(key) {
    const result = await createStoryCardFile(key);
    const shareText = `Аристарх из Мирофактуры: «${result.story.quote}» Получите совет для своего проекта: ${STORY_DESTINATION_URL}`;
    if (result.file && navigator.share && (!navigator.canShare || navigator.canShare({ files: [result.file] }))) {
      try {
        await navigator.share({
          title: 'Совет Аристарха из Мирофактуры',
          text: shareText,
          files: [result.file]
        });
        return 'shared';
      } catch (error) {
        if (error?.name === 'AbortError') return 'cancelled';
      }
    }

    downloadStoryCard(result.blob, result.story.filename);
    return 'saved';
  }

  function openTelegramShare(shareUrl) {
    if (typeof telegramWebApp?.openTelegramLink === 'function') {
      telegramWebApp.openTelegramLink(shareUrl);
    }
  }

  function closeTelegramAppSoon() {
    if (typeof telegramWebApp?.close !== 'function') return;
    window.setTimeout(() => {
      try {
        telegramWebApp.close();
      } catch (_) {}
    }, 120);
  }

  function openExternalUrl(rawUrl) {
    const allowedHosts = new Set(['t.me', 'payform.ru', 'max.ru']);
    let url;
    try {
      url = new URL(String(rawUrl || ''));
    } catch (_) {
      showToast('Не удалось открыть ссылку');
      return;
    }

    if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname.toLowerCase())) {
      showToast('Не удалось открыть ссылку');
      return;
    }

    if (APP_PLATFORM === 'telegram' && telegramWebApp) {
      try {
        if (url.hostname === 't.me' && typeof telegramWebApp.openTelegramLink === 'function') {
          telegramWebApp.openTelegramLink(url.href);
          closeTelegramAppSoon();
          return;
        }
        if (typeof telegramWebApp.openLink === 'function') {
          telegramWebApp.openLink(url.href);
          return;
        }
      } catch (_) {
        // В обычном браузере и старых версиях Telegram используем безопасный запасной вариант.
      }
    }

    window.open(url.href, '_blank', 'noopener');
  }

  app.addEventListener('click', async (event) => {
    const target = event.target.closest('button, [role="button"]');
    if (!target) return;

    const page = target.getAttribute('data-page');
    const action = target.getAttribute('data-action');
    const answer = target.getAttribute('data-answer');

    if (page) {
      if (target.classList.contains('back-link')) {
        goBack(page);
      } else {
        navigateTo(page);
      }
      return;
    }

    if (answer) {
      state.answers[state.step] = answer;
      render({ scroll: false });
      window.setTimeout(() => {
        document.getElementById('stepan-comment')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 40);
      return;
    }

    if (action === 'startQuiz') {
      warmQuizImages();
      state.step = 0;
      state.answers = {};
      navigateTo('quiz');
      return;
    }

    if (action === 'exitQuiz') {
      state.step = 0;
      state.answers = {};
      navigateTo('home');
      return;
    }

    if (action === 'openTrends') {
      navigateTo('trends');
      return;
    }

    if (action === 'openLibrary') {
      await openLibraryWithGate();
      return;
    }

    if (action === 'openMax') {
      openExternalUrl(PLATFORM.channelUrl);
      return;
    }

    if (action === 'openExternalLink') {
      openExternalUrl(target.getAttribute('data-url'));
      return;
    }

    if (action === 'focusContactMap') {
      document.getElementById('marketing-task-map')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }

    if (action === 'selectContactTask') {
      state.contactTask = target.getAttribute('data-task') || 'strategy';
      render({ scroll: false });
      window.setTimeout(() => {
        app.querySelector(`[data-task="${state.contactTask}"]`)?.focus({ preventScroll: true });
      }, 0);
      return;
    }

    if (action === 'openEmail') {
      const service = target.getAttribute('data-service') || '';
      const subject = encodeURIComponent(service ? `Задача для Мирофактуры: ${service}` : 'Задача для Мирофактуры');
      const body = encodeURIComponent(`Здравствуйте!\n\nЧто у нас есть сейчас:\n\nЧто хотим изменить:\n\nСсылки и материалы, если есть:\n${service ? `\nРезультат квиза: ${service}` : ''}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    if (action === 'openContacts') {
      warmContactsImages();
      navigateTo('contacts');
      return;
    }

    if (action === 'openNativeDocuments') {
      await openNativeDocuments();
      return;
    }

    if (action === 'openMaterial') {
      const material = target.getAttribute('data-material');
      await openMaterialWithGate(material);
      return;
    }

    if (action === 'checkSubscription') {
      if (state.pendingGateTarget === 'library') {
        await openLibraryWithGate();
      } else {
        await openMaterialWithGate(state.pendingMaterial || resultKey());
      }
      return;
    }

    if (action === 'chooseRepeat') {
      state.productLineRepeat = target.getAttribute('data-repeat') || '';
      render({ scroll: false });
      window.setTimeout(() => {
        document.getElementById('product-line-repeat-insight')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 40);
      return;
    }

    if (action === 'chooseProductLineSelector') {
      const question = target.getAttribute('data-question');
      const value = target.getAttribute('data-value');
      if (!question || !value) return;
      const nextAnswers = { ...state.productLineAnswers, [question]: value };
      state.productLineAnswers = nextAnswers;
      render({ scroll: false });
      const complete = productLinesMaterial.selectorQuestions.every((item) => nextAnswers[item.id]);
      if (complete) {
        window.setTimeout(() => {
          document.getElementById('product-line-recommendation')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 40);
      }
      return;
    }

    if (action === 'applyProductLineTemplate') {
      const modelId = target.getAttribute('data-model');
      const model = productLinesMaterial.models.find((item) => item.id === modelId);
      if (!model) return;
      state.productLineStages = [...model.template];
      state.productLineTemplate = model.id;
      render({ scroll: false });
      window.setTimeout(() => {
        document.getElementById('product-line-builder')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }, 40);
      return;
    }

    if (action === 'toggleProductStage') {
      const stage = target.getAttribute('data-stage');
      if (!stage) return;
      if (state.productLineStages.includes(stage)) {
        state.productLineStages = state.productLineStages.filter((item) => item !== stage);
      } else {
        state.productLineStages = [...state.productLineStages, stage];
      }
      state.productLineTemplate = '';
      render({ scroll: false });
      return;
    }

    if (action === 'resetProductStages') {
      state.productLineStages = ['lead', 'core'];
      state.productLineTemplate = '';
      render({ scroll: false });
      return;
    }

    if (action === 'chooseSalesChannelSelector') {
      const question = target.getAttribute('data-question');
      const value = target.getAttribute('data-value');
      if (!question || !value) return;
      const nextAnswers = { ...state.salesChannelAnswers, [question]: value };
      const complete = salesChannelsComplete(nextAnswers);
      state.salesChannelAnswers = nextAnswers;
      if (complete) {
        state.salesChannelFocus = recommendedSalesChannels(nextAnswers)[0]?.id || '';
      }
      render({ scroll: false });
      if (complete) {
        window.setTimeout(() => {
          document.getElementById('sales-channel-recommendation')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 40);
      }
      return;
    }

    if (action === 'chooseTrafficAtlasAnswer') {
      const question = target.getAttribute('data-question');
      const value = target.getAttribute('data-value');
      if (!question || !value) return;
      const nextAnswers = { ...state.trafficAtlasAnswers, [question]: value };
      const complete = trafficAtlasComplete(nextAnswers);
      state.trafficAtlasAnswers = nextAnswers;
      if (complete) {
        state.trafficAtlasFocus = recommendedTrafficChannels(nextAnswers)[0]?.id || '';
      }
      render({ scroll: false });
      if (complete) {
        window.setTimeout(() => {
          document.getElementById('traffic-atlas-recommendation')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 40);
      }
      return;
    }

    if (action === 'focusTrafficChannel') {
      state.trafficAtlasFocus = target.getAttribute('data-channel') || '';
      render({ scroll: false });
      window.setTimeout(() => {
        document.getElementById('traffic-channel-focus')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }, 40);
      return;
    }

    if (action === 'focusSalesChannel') {
      state.salesChannelFocus = target.getAttribute('data-channel') || '';
      render({ scroll: false });
      window.setTimeout(() => {
        document.getElementById('sales-channel-focus')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }, 40);
      return;
    }

    if (action === 'focusMaterialNavigator') {
      const targetId = target.getAttribute('data-target');
      document.getElementById(targetId)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }

    if (action === 'copyMaterialResult') {
      const key = target.getAttribute('data-material');
      const copied = await copyPlainText(materialResultText(key));
      showToast(copied ? 'Результат скопирован' : 'Не удалось скопировать результат');
      return;
    }

    if (action === 'copyStoryLink') {
      const copied = await copyPlainText(STORY_DESTINATION_URL);
      showToast(copied ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку');
      return;
    }

    if (action === 'saveStoryCard' || action === 'shareStoryCard') {
      const key = target.getAttribute('data-material');
      if (!key || target.disabled) return;
      const initialText = target.textContent;
      target.disabled = true;
      target.textContent = 'Готовим карточку…';

      try {
        if (action === 'saveStoryCard') {
          if (downloadStoryCardInTelegram(key)) {
            showToast('Подтвердите загрузку в окне Telegram');
            return;
          }
          const result = await createStoryCardFile(key);
          downloadStoryCard(result.blob, result.story.filename);
          showToast('Загрузка началась');
        } else {
          if (shareStoryCardToTelegram(key)) {
            showToast('Открываем редактор сториз');
            return;
          }
          const status = await shareStoryCard(key);
          if (status === 'shared') showToast('Карточка отправлена');
          if (status === 'saved') showToast('Загрузка началась');
        }
      } catch (_) {
        showToast('Не удалось подготовить карточку');
      } finally {
        if (target.isConnected) {
          target.disabled = false;
          target.textContent = initialText;
        }
      }
      return;
    }

    if (action === 'nextQuestion') {
      if (!state.answers[state.step]) return;
      if (state.step < quiz.length - 1) {
        state.step += 1;
        render();
      } else {
        navigateTo('result');
      }
      return;
    }

    if (action === 'prevQuestion') {
      if (state.step > 0) {
        state.step -= 1;
        render();
      }
      return;
    }

    if (action === 'share') {
      if (state.page === 'trends' && USE_NATIVE_TRENDS && window.MirofacturaTrendDeck?.share?.()) {
        return;
      }

      const text = 'Мирофактура — мастерская цифровых миров для бизнеса. Создаёт стратегии, контент, маскотов, игры, квизы, мини-приложения и цифровые экосистемы, которые помогают привлекать внимание аудитории, объяснять ценность продукта и поддерживать продажи.';
      const shareUrl = PLATFORM.entryUrl;
      if (APP_PLATFORM === 'telegram' && telegramWebApp) {
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        openTelegramShare(telegramShareUrl);
      } else if (navigator.share) {
        try {
          await navigator.share({ title: 'Мирофактура', text, url: shareUrl });
        } catch (error) {
          if (error?.name !== 'AbortError') showToast('Не удалось открыть меню отправки');
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Ссылка скопирована');
        } catch (_) {
          showToast('Ссылку можно скопировать из адресной строки');
        }
      }
      return;
    }

    if (action === 'materialSoon') {
      showToast('Страницу материала ещё готовим');
    }
  });

  app.addEventListener('keydown', (event) => {
    const target = event.target.closest('[role="button"]');
    if (!target || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    target.click();
  });

  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'mirofaktura:share') {
      const shareUrl = String(data.url || PLATFORM.entryUrl);
      const shareText = String(data.text || 'Мирофактура');

      if (APP_PLATFORM === 'telegram' && telegramWebApp) {
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        openTelegramShare(telegramShareUrl);
      } else if (navigator.share) {
        navigator.share({
          title: String(data.title || 'Мирофактура'),
          text: shareText,
          url: shareUrl,
        }).catch(() => {});
      }
      return;
    }
    if (data.type === 'mirofaktura:open-link') {
      openExternalUrl(data.url);
      return;
    }
    if (data.type !== 'mirofaktura:navigate') return;
    if (!PAGE_RENDERERS[data.page]) return;
    navigateTo(data.page);
  });

  function initializeNavigation() {
    try {
      window.history.replaceState({
        ...(window.history.state || {}),
        [APP_HISTORY_KEY]: true,
        page: state.page,
        depth: 0
      }, '');
    } catch (_) {
      // Local file previews can restrict History API in some browsers.
    }

    navigationDepth = 0;
    navigationReady = true;

    window.addEventListener('popstate', (event) => {
      const historyState = event.state || {};
      if (!historyState[APP_HISTORY_KEY]) return;

      navigationDepth = Number.isFinite(historyState.depth)
        ? historyState.depth
        : Math.max(0, navigationDepth - 1);
      state.page = PAGE_RENDERERS[historyState.page] ? historyState.page : 'home';
      render();
      syncTelegramBackButton();
    });

    const backButton = telegramWebApp?.BackButton;
    if (backButton) {
      backButton.onClick(() => goBack('home'));
    }
    syncTelegramBackButton();
  }

  initializeNavigation();
  render();
  dismissStartupLoader();
  window.setTimeout(warmAppImages, 40);
})();
