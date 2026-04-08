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
  const PRODUCTION_API_URL = 'https://boutiquedascarneszedascarnes01.onrender.com';
  // ─────────────────────────────────────────────────────────────────────────

  const API_BASE_URL = (() => {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    // Mantem localhost apenas no ambiente de desenvolvimento local.
    if (isLocal) {
      return 'http://localhost:3000';
    }

    const productionUrl = PRODUCTION_API_URL.trim().replace(/\/+$/, '');
    // Em acesso por IP local (ex.: celular na mesma rede), usa a origem atual.
    return productionUrl || window.location.origin.replace(/\/+$/, '');
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
