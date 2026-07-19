(function () {
  const adapters = new Map();

  function isLocalPreview() {
    return window.location.protocol === 'file:'
      || window.location.hostname === 'localhost'
      || window.location.hostname === '127.0.0.1';
  }

  async function shareWithBrowser({ title, text, url }) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        if (error?.name === 'AbortError') return true;
      }
    }

    try {
      await navigator.clipboard.writeText([text, url].filter(Boolean).join('\n'));
      return true;
    } catch (_) {
      return false;
    }
  }

  function openWithBrowser(url) {
    window.open(url, '_blank', 'noopener');
    return true;
  }

  const browserAdapter = {
    key: 'browser',
    messenger: 'WEB',
    entryUrl: window.location.href,
    channelUrl: '',
    botUrl: '',
    init() {},
    isEmbedded() { return false; },
    getUserId() { return ''; },
    getUser() { return {}; },
    getInitData() { return ''; },
    getStartParam() { return ''; },
    getReferralLink() { return window.location.href; },
    openUrl: openWithBrowser,
    share: shareWithBrowser,
    backButton: null,
    progress: {},
    reportCardOpened() { return Promise.resolve({ ok: false, reason: 'browser' }); }
  };

  adapters.set('browser', browserAdapter);

  window.MirofacturaPlatforms = {
    register(key, adapter) {
      if (!key || !adapter) return;
      adapters.set(String(key).toLowerCase(), adapter);
    },
    current() {
      const requested = String(window.MIROFAKTURA_PLATFORM || 'browser').toLowerCase();
      return adapters.get(requested) || browserAdapter;
    },
    isLocalPreview,
    shareWithBrowser,
    openWithBrowser
  };
})();
