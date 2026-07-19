(function () {
  const platformCore = window.MirofacturaPlatforms;
  if (!platformCore) throw new Error('Mirofactura platform core is not loaded');

  const BOT_URL = String(window.MIROFAKTURA_MAX_BOT_URL || 'https://max.ru/id590417093305_bot');
  const CHANNEL_URL = String(window.MIROFAKTURA_MAX_CHANNEL_URL || 'https://max.ru/channel_mirofactura');

  function bridge() {
    return window.WebApp || null;
  }

  function localQueryUserId() {
    if (!platformCore.isLocalPreview()) return '';
    const params = new URLSearchParams(window.location.search);
    return String(params.get('max_user_id') || params.get('maxUserId') || params.get('user_id') || '');
  }

  function getUser() {
    return bridge()?.initDataUnsafe?.user || bridge()?.user || {};
  }

  const adapter = {
    key: 'max',
    messenger: 'MAX',
    entryUrl: `${BOT_URL}?startapp`,
    botUrl: BOT_URL,
    channelUrl: CHANNEL_URL,
    authorUrls: {
      elizaveta: 'https://max.ru/u/f9LHodD0cOJ7KLcSGQ2-nIru39qLMDByEa3oTWgNABebA15thaMVXVpHB-w',
      elena: 'https://max.ru/u/f9LHodD0cOL6WZFmWoaBowA5ZAdNLubiIRJlhbrL5vxjlmvr16DBtsGJcLY',
      elenaContact: 'https://max.ru/u/f9LHodD0cOL6WZFmWoaBowA5ZAdNLubiIRJlhbrL5vxjlmvr16DBtsGJcLY'
    },
    progress: {
      loadUrl: String(window.MIROFAKTURA_MAX_LOAD_PROGRESS_URL || ''),
      saveUrl: String(window.MIROFAKTURA_MAX_SAVE_PROGRESS_URL || ''),
      followupUrl: String(window.MIROFAKTURA_MAX_FOLLOWUP_URL || ''),
      loadItem: 'trend_deck_load_v2',
      saveItem: 'trend_deck_save_v2',
      followupItem: 'trend_deck_started_max_v2'
    },
    init(options = {}) {
      const maxBridge = bridge();
      if (!maxBridge?.initData && !getUser().id) return;
      maxBridge?.ready?.();
      maxBridge?.expand?.();
      if (options.useNativeTrends && typeof maxBridge?.disableVerticalSwipes === 'function') {
        maxBridge.disableVerticalSwipes();
      }
    },
    isEmbedded() {
      return Boolean(bridge()?.initData || getUser().id);
    },
    getUserId() {
      return String(getUser().id || localQueryUserId());
    },
    getUser,
    getInitData() {
      return String(bridge()?.initData || '');
    },
    getStartParam() {
      return String(bridge()?.initDataUnsafe?.start_param || '');
    },
    getReferralLink(userId) {
      if (!userId) return BOT_URL;
      const payload = String(userId).replace(/[^A-Za-z0-9_-]/g, '');
      return `${BOT_URL}?startapp=${encodeURIComponent(`ref_${payload}`)}`;
    },
    openUrl(rawUrl) {
      const url = new URL(rawUrl);
      const maxBridge = bridge();
      if (maxBridge) {
        if (url.hostname === 'max.ru' && typeof maxBridge.openMaxLink === 'function') {
          maxBridge.openMaxLink(url.href);
          return true;
        }
        if (typeof maxBridge.openLink === 'function') {
          maxBridge.openLink(url.href);
          return true;
        }
      }
      return platformCore.openWithBrowser(url.href);
    },
    async share({ title, text, url }) {
      const maxBridge = bridge();
      if (typeof maxBridge?.shareMaxContent === 'function') {
        await maxBridge.shareMaxContent({ text, link: url });
        return true;
      }
      if (typeof maxBridge?.shareContent === 'function') {
        await maxBridge.shareContent({ text, link: url });
        return true;
      }
      return platformCore.shareWithBrowser({ title, text, url });
    },
    backButton: (bridge()?.initData || getUser().id) ? bridge()?.BackButton || null : null,
    reportCardOpened() { return Promise.resolve({ ok: true, reason: 'referral-handled-by-bot-start' }); }
  };

  platformCore.register('max', adapter);
})();
