(function () {
  const app = document.getElementById('app');
  const MAX_CHANNEL_URL = 'https://max.ru/id590417093305_biz';
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
  const NATIVE_TRENDS_ASSET_VERSION = '20260713-native-onboarding-layout-19';
  const IS_TELEGRAM_LAUNCH = Boolean(
    telegramWebApp?.initData
    || telegramWebApp?.initDataUnsafe?.user?.id
    || TELEGRAM_LAUNCH_PARAMS.get('tgWebAppData')
    || TELEGRAM_LAUNCH_PARAMS.get('tgWebAppPlatform')
  );
  const APP_PLATFORM = (() => {
    const params = URL_PARAMS;
    const raw = String(
      window.MIROFAKTURA_PLATFORM
      || params.get('platform')
      || params.get('messenger')
      || (IS_TELEGRAM_LAUNCH ? 'telegram' : '')
      || ''
    ).toLowerCase();
    return PLATFORM_ALIASES[raw] || 'max';
  })();
  const USE_NATIVE_TRENDS = NATIVE_TRENDS_MODE === '1'
    || (NATIVE_TRENDS_MODE !== '0' && APP_PLATFORM === 'telegram');
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
  const SUBSCRIPTION_WEBHOOK_URL = window.MIROFAKTURA_SUBSCRIPTION_WEBHOOK_URL || '';
  const ACCESS_MODE = (() => {
    const params = new URLSearchParams(window.location.search);
    const mode = String(window.MIROFAKTURA_ACCESS_MODE || params.get('access') || params.get('mode') || '').toLowerCase();
    return ['gated', 'closed', 'protected'].includes(mode) ? 'gated' : 'open';
  })();
  const IS_OPEN_ACCESS = ACCESS_MODE === 'open';

  if (APP_PLATFORM === 'telegram' && telegramWebApp) {
    telegramWebApp.ready();
    telegramWebApp.expand();
  }
  const assets = {
    logo: './assets/logo-black-yellow.webp',
    stepanStart: './assets/stepan-start.webp',
    stepanProduct: './assets/stepan-product-question.webp',
    stepanChannels: './assets/stepan-clients-channels.webp',
    stepanRegularity: './assets/stepan-sales-regularity.webp',
    stepanFinal: './assets/stepan-final-map.webp',
    aristarch: './assets/aristarch-recommendations.webp',
    potap: './assets/potap-digital-system.webp',
    authors: './assets/authors-photo.webp'
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
      note: 'Готово. Аристарх сравнит ответы и покажет, с какого материала лучше начать.',
      answers: [
        ['map', 'Увидеть общую картину', 'Понять, что уже работает и чего не хватает.', 'Хорошо. Сначала соберём картину без догадок, потом выберем один следующий шаг.'],
        ['test', 'Выбрать один канал для теста', 'Решить, что и как проверить первым.', 'Один тест даст больше пользы, чем пять каналов, запущенных одновременно.'],
        ['repeat', 'Продумать следующую покупку', 'Связать первый продукт с понятным продолжением.', 'Тогда смотрим не только на первую продажу. Важно понять, зачем клиенту возвращаться.']
      ]
    }
  ];

  const warmedImageCache = [];

  function warmAppImages() {
    const sources = [
      ...quiz.map((item) => item.image),
      assets.aristarch,
      assets.potap,
      assets.authors,
    ];

    sources.forEach((source) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
      warmedImageCache.push(image);
      image.decode?.().catch(() => {});
    });
  }

  function prepareImageReveals() {
    app.querySelectorAll('img').forEach((image) => {
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
      tone: ''
    },
    sales: {
      tag: 'Каналы продаж',
      title: 'Карта каналов продаж',
      text: 'Список из 16 каналов продаж и навигатор, который поможет выбрать один канал для следующего теста.',
      tone: 'warm'
    },
    products: {
      tag: 'Повторные покупки',
      title: 'Линейки продуктов',
      text: 'Четыре модели продуктовых линеек и конструктор цепочки: от первого знакомства до следующей покупки.',
      tone: 'deep'
    }
  };

  const productLinesMaterial = {
    diagnostic: [
      {
        id: 'single',
        number: '01',
        title: 'Покупка чаще разовая',
        text: 'Клиент покупает один продукт или услугу, а дальше понятного продолжения пока нет.',
        result: 'Начните с одного следующего шага: что человек может купить после первого результата.'
      },
      {
        id: 'random',
        number: '02',
        title: 'Возвращаются, но случайно',
        text: 'Повторные покупки бывают, но зависят от личного контакта, напоминания или удачного момента.',
        result: 'Зафиксируйте 2–3 ситуации, когда клиенту уместно предложить следующий продукт.'
      },
      {
        id: 'task',
        number: '03',
        title: 'Покупают под новую задачу',
        text: 'Люди возвращаются, когда появляется новый проект, сезон, уровень или проблема.',
        result: 'Здесь хорошо работает линейка по этапам: старт, основное решение и продолжение.'
      },
      {
        id: 'system',
        number: '04',
        title: 'Система уже есть',
        text: 'Вы понимаете, что предложить после покупки, и часть клиентов регулярно идет дальше.',
        result: 'Следующий шаг — точнее разделить предложения: кому допродажа, кому меньшая версия, кому новый продукт.'
      }
    ],
    models: [
      {
        id: 'funnel',
        number: '01',
        title: 'Классическая воронка',
        text: 'Последовательно знакомит человека с компанией и подводит к основному продукту.',
        fit: 'Когда есть один главный продукт и понятный путь к покупке.',
        tags: ['one-main', 'launch', 'new-clients'],
        template: ['lead', 'tripwire', 'core', 'upsell', 'downsell', 'refusal']
      },
      {
        id: 'development',
        number: '02',
        title: 'Развитие клиента',
        text: 'Продукты выстраиваются по этапам: старт, следующий уровень, экспертность и новые задачи.',
        fit: 'Для долгой работы, B2B, обучения, спорта и помогающих практик.',
        tags: ['long', 'stages', 'service'],
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
        text: 'Подходит, когда есть один главный продукт. Человек сначала знакомится с вами, затем пробует недорогой вход, покупает основной продукт и получает понятное продолжение.',
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
          ['many', 'Много …24740 tokens truncated…= new Promise((resolve, reject) => {
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

  function openTelegramShare(shareUrl) {
    telegramWebApp.openTelegramLink(shareUrl);
    window.setTimeout(() => telegramWebApp.close(), 120);
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

    if (action === 'openEmail') {
      const subject = encodeURIComponent('Заявка с приложения Мирофактуры');
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}`;
      return;
    }

    if (action === 'openContacts') {
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

      const text = 'Загляните в Мирофактуру — мастерскую цифровых миров. Здесь можно найти идеи и интерактивные инструменты для маркетинга, продуктов и продаж, а ещё вытянуть карту из авторской колоды «Тренды 2026».';
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

