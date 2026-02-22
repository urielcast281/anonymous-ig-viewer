// Minimal proxy service stub — proxies disabled by default
class ProxyService {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.failedProxies = new Set();
  }

  getCurrentProxy() { return null; }
  rotateProxy() {}
  markProxyAsFailed() {}
  markProxyAsWorking() {}
  getProxyAxiosConfig() { return {}; }
  getStats() {
    return { totalProxies: 0, currentProxy: 'None', failedProxies: 0, enabled: false };
  }
}

module.exports = new ProxyService();
