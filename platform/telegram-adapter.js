(function () {
  const platformCore = window.MirofacturaPlatforms;
  if (!platformCore) throw new Error('Mirofactura platform core is not loaded');

  const BOT_URL = 'https://t.me/mirofactura_bot';
  const webApp = window.Telegram?.WebApp || null;
  let progressCachePromise = null;
  let progressRefreshPromise = null;
  let progressSaveQueue = Promise.resolve();
  let progressSaveInFlight = null;
  let progressRevision = 0;
  let lastSavedRevision = 0;
  let visibilityRefreshBound = false;

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

  async function postProgress(url, payload, errorLabel) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller ? window.setTimeout(() => controller.abort(), 20000) : null;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        signal: controller?.signal
      });
      if (!response.ok) throw new Error(`${errorLabel}: HTTP ${response.status}`);
      return response;
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  }

  async function requestProgress() {
    const userId = adapter.getUserId();
    if (!userId) return { exists: false };

    const response = await postProgress(adapter.progress.loadUrl, {
      item: adapter.progress.loadItem,
      user_id: userId,
      profile_key: `telegram:${userId}`,
      platform: adapter.key,
      messenger: adapter.messenger,
      source: 'mirofaktura-app'
    }, 'Telegram progress load failed');
    return await response.json();
  }

  function rememberProgress(promise) {
    progressCachePromise = promise;
    promise.catch(() => {
      if (progressCachePromise === promise) progressCachePromise = null;
    });
    return promise;
  }

  function progressSnapshot(appData = {}) {
    return {
      exists: true,
      first_launch_time: String(appData.firstLaunchTime || ''),
      last_date: appData.lastDate || '',
      collected: Array.isArray(appData.collected) ? [...appData.collected] : [],
      onboarding_seen: appData.onboardingSeen === true,
      bonus_cards: Number(appData.bonusCards) || 0,
      invited_friends: Number(appData.invitedFriends) || 0
    };
  }

  function bindVisibilityRefresh() {
    if (visibilityRefreshBound || typeof document === 'undefined') return;
    visibilityRefreshBound = true;
    let wasHidden = document.visibilityState === 'hidden';
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
        return;
      }
      if (!wasHidden) return;
      wasHidden = false;
      adapter.refreshProgress().catch(() => {});
    });
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
      bindVisibilityRefresh();
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
      if (progressCachePromise) return progressCachePromise;
      return rememberProgress(requestProgress());
    },
    loadProgress() {
      return adapter.prefetchProgress();
    },
    async refreshProgress() {
      if (!adapter.getUserId()) return { exists: false };
      if (progressRefreshPromise) return progressRefreshPromise;

      progressRefreshPromise = (async () => {
        await progressSaveQueue;
        const revisionAtRequest = progressRevision;
        if (revisionAtRequest > lastSavedRevision && progressCachePromise) {
          return progressCachePromise;
        }
        const data = await requestProgress();
        if (progressRevision === revisionAtRequest) {
          progressCachePromise = Promise.resolve(data);
        }
        return data;
      })();

      try {
        return await progressRefreshPromise;
      } finally {
        progressRefreshPromise = null;
      }
    },
    saveProgress(appData) {
      const userId = adapter.getUserId();
      if (!userId) return Promise.resolve({ ok: false, reason: 'missing-user' });

      const user = adapter.getUser();
      const snapshot = progressSnapshot(appData);
      const revision = ++progressRevision;
      progressCachePromise = Promise.resolve(snapshot);

      const persist = async () => {
        await postProgress(adapter.progress.saveUrl, {
          item: adapter.progress.saveItem,
          user_id: userId,
          profile_key: `telegram:${userId}`,
          first_name: String(user.first_name || ''),
          last_name: String(user.last_name || ''),
          messenger: adapter.messenger,
          platform: adapter.key,
          source: 'mirofaktura-app',
          first_launch_time: snapshot.first_launch_time,
          last_date: snapshot.last_date,
          collected_cards: JSON.stringify(snapshot.collected),
          onboarding_seen: snapshot.onboarding_seen,
          bonus_cards: String(snapshot.bonus_cards),
          invited_friends: String(snapshot.invited_friends)
        }, 'Telegram progress save failed');
        lastSavedRevision = Math.max(lastSavedRevision, revision);
        return { ok: true };
      };
      const request = progressSaveInFlight ? progressSaveQueue.then(persist) : persist();
      progressSaveInFlight = request;
      progressSaveQueue = request.catch(() => {});
      request.finally(() => {
        if (progressSaveInFlight === request) progressSaveInFlight = null;
      }).catch(() => {});
      return request;
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
