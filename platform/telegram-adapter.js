(function () {
  const platformCore = window.MirofacturaPlatforms;
  if (!platformCore) throw new Error('Mirofactura platform core is not loaded');

  const BOT_URL = 'https://t.me/mirofactura_bot';
  const webApp = window.Telegram?.WebApp || null;
  const PROGRESS_PREFETCH_MAX_AGE_MS = 60000;
  let prefetchedProgress = null;

  function hasTelegramLaunch() {
    return Boolean(webApp?.initData || webApp?.initDataUnsafe?.user?.id);
  }

  function queryUserId() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['telegram_user_id', 'telegramUserId', 'tg_user_id', 'tgUserId', 'user_id', 'userId'];
    for (const key of keys) {
      const value = params.get(key);
      if (value) return String(value);
    }
    return '';
  }

  async function requestProgress() {
    const userId = adapter.getUserId();
    if (!userId) return { exists: false };

    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller ? window.setTimeout(() => controller.abort(), 6000) : null;
    try {
      const response = await fetch(adapter.progress.loadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: adapter.progress.loadItem,
          user_id: userId,
          profile_key: `telegram:${userId}`,
          platform: adapter.key,
          messenger: adapter.messenger,
          source: 'mirofaktura-app'
        }),
        signal: controller?.signal
      });
      if (!response.ok) throw new Error(`Telegram progress load failed: HTTP ${response.status}`);
      return await response.json();
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  }

  const adapter = {
    key: 'telegram',
    messenger: 'Telegram',
    entryUrl: BOT_URL,
    botUrl: BOT_URL,
    channelUrl: BOT_URL,
    authorUrls: {
      elizaveta: 'https://t.me/gameneurons',
      elena: 'https://t.me/adviceperm',
      elenaContact: 'https://t.me/PopovaE'
    },
    progress: {
      loadUrl: 'https://cb.multy.ai/api/v1/hook/app/b9c89cbdf0f21aa63c6111487770196a',
      saveUrl: 'https://cb.multy.ai/api/v1/hook/app/bfbc41275aaab161df78a4d0b0f399af',
      followupUrl: 'https://cb.multy.ai/api/v1/hook/app/e0cd16a80fb1553178dbdeace2747156',
      loadItem: 'trend_deck_load_v2',
      saveItem: 'trend_deck_save_v2',
      followupItem: 'trend_deck_started_telegram'
    },
    init(options = {}) {
      if (!webApp || !hasTelegramLaunch()) return;
      webApp.ready();
      webApp.expand();
      if (options.useNativeTrends && typeof webApp.disableVerticalSwipes === 'function') {
        webApp.disableVerticalSwipes();
      }
    },
    isEmbedded() {
      return hasTelegramLaunch();
    },
    getUserId() {
      return queryUserId() || String(webApp?.initDataUnsafe?.user?.id || '');
    },
    getUser() {
      return webApp?.initDataUnsafe?.user || {};
    },
    getInitData() {
      return String(webApp?.initData || '');
    },
    getStartParam() {
      return String(webApp?.initDataUnsafe?.start_param || '');
    },
    getReferralLink(userId) {
      return userId ? `${BOT_URL}?start=${encodeURIComponent(String(userId))}` : BOT_URL;
    },
    prefetchProgress() {
      if (!adapter.getUserId()) return Promise.resolve({ exists: false });
      const now = Date.now();
      if (prefetchedProgress && now - prefetchedProgress.startedAt <= PROGRESS_PREFETCH_MAX_AGE_MS) {
        return prefetchedProgress.promise;
      }

      const promise = requestProgress();
      prefetchedProgress = { startedAt: now, promise };
      promise.catch(() => {
        if (prefetchedProgress?.promise === promise) prefetchedProgress = null;
      });
      return promise;
    },
    loadProgress() {
      const cached = prefetchedProgress;
      prefetchedProgress = null;
      if (cached && Date.now() - cached.startedAt <= PROGRESS_PREFETCH_MAX_AGE_MS) {
        return cached.promise;
      }
      return requestProgress();
    },
    openUrl(rawUrl) {
      const url = new URL(rawUrl);
      if (webApp && hasTelegramLaunch()) {
        if (url.hostname === 't.me' && typeof webApp.openTelegramLink === 'function') {
          webApp.openTelegramLink(url.href);
          return true;
        }
        if (typeof webApp.openLink === 'function') {
          webApp.openLink(url.href);
          return true;
        }
      }
      return platformCore.openWithBrowser(url.href);
    },
    async share({ title, text, url }) {
      if (hasTelegramLaunch() && webApp?.openTelegramLink) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        webApp.openTelegramLink(shareUrl);
        window.setTimeout(() => webApp.close?.(), 120);
        return true;
      }
      return platformCore.shareWithBrowser({ title, text, url });
    },
    backButton: hasTelegramLaunch() ? webApp?.BackButton || null : null,
    reportCardOpened() {
      return Promise.resolve({ ok: false, reason: 'telegram-unchanged' });
    }
  };

  platformCore.register('telegram', adapter);
})();
