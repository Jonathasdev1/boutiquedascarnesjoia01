/**
 * Configuração centralizada da API para o frontend
 *
 * DESENVOLVIMENTO : localhost:3000 (quando abrir em localhost)
 * PRODUÇÃO        : URL principal definida em PRODUCTION_API_URL
 *
 * Depois de publicar o backend no Render/Railway, troque a linha:
 *   const PRODUCTION_API_URL = '';
 * por:
 *   const PRODUCTION_API_URL = 'https://SEU-BACKEND.onrender.com';
 * e faça um novo commit. O Netlify publica automaticamente.
 */

(function() {
  // ─── EDITE AQUI após publicar o backend ──────────────────────────────────
  const PRODUCTION_API_URL = 'https://boutiquedascarneszedascarnes161.onrender.com';
  // ─────────────────────────────────────────────────────────────────────────

  const API_BASE_URL = (() => {
    const host = String(window.location.hostname || '');
    const origin = window.location.origin.replace(/\/+$/, '');
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const isPrivateIpv4 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host);
    const isLanHost = isPrivateIpv4 || host.endsWith('.local');

    if (isLocalHost || isLanHost) {
      return origin;
    }

    const productionUrl = PRODUCTION_API_URL.trim().replace(/\/+$/, '');
    return productionUrl || origin;
  })();

  // Exporta a configuração globalmente
  window.APP_CONFIG = {
    API_BASE_URL,
    API_ENABLED: Boolean(API_BASE_URL),
    WHATSAPP_NUMBER: '5512991307272',
    // Adicione mais configurações conforme necessário
  };

  // Log de debug (apenas em desenvolvimento)
  if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
    console.log('[APP_CONFIG] Ambiente:', window.location.hostname === 'localhost' ? 'Desenvolvimento' : 'Arquivo local');
    console.log('[APP_CONFIG] API_BASE_URL:', window.APP_CONFIG.API_BASE_URL);
    console.log('[APP_CONFIG] API_ENABLED:', window.APP_CONFIG.API_ENABLED);
  }
})();
