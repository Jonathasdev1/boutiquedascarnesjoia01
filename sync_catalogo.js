const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const args = process.argv.slice(2);
const apiBaseUrl = (args[0] || '').trim().replace(/\/+$/, '');
const adminPassword = args[1] || '';

if (!apiBaseUrl || !adminPassword) {
  console.error('Uso: node sync_catalogo.js <API_BASE_URL> <ADMIN_PASSWORD>');
  console.error('Exemplo: node sync_catalogo.js https://seu-backend.onrender.com MinhaSenha123');
  process.exit(1);
}

const indexPath = path.join(__dirname, 'projeto Açougue01', 'projeto Açougue01', 'index.html');
const html = fs.readFileSync(indexPath, 'utf-8');
const $ = cheerio.load(html);

const cleanText = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toCategoria = (sectionId) => {
  const id = String(sectionId || '').toLowerCase();
  if (id === 'rotisseria') return 'rotisseria';
  if (id === 'conveniencia') return 'conveniencia';
  if (id === 'bovino' || id === 'suino' || id === 'frango') return id;
  return 'geral';
};

const parsePreco = (raw) => {
  const clean = String(raw || '')
    .replace(/R\$/gi, '')
    .replace(/\/\s*kg/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '')
    .trim();
  const n = Number(clean);
  return Number.isFinite(n) && n > 0 ? Number(n.toFixed(2)) : null;
};

const produtos = [];

$('section.secao-carnes').each((_, sectionEl) => {
  const sectionId = $(sectionEl).attr('id') || '';
  const categoria = toCategoria(sectionId);

  $(sectionEl)
    .find('.produtos > .produto')
    .each((__, produtoEl) => {
      const nome = cleanText($(produtoEl).find('h3').first().text());
      const preco = parsePreco(cleanText($(produtoEl).find('.preco').first().text()));
      const imagem_url = String($(produtoEl).find('img').first().attr('src') || '').trim() || null;

      if (!nome || !preco) {
        return;
      }

      produtos.push({ nome, preco, categoria, imagem_url });
    });
});

// Remove duplicados por nome normalizado, mantendo o ultimo encontrado.
const normalizeName = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const byName = new Map();
for (const p of produtos) {
  byName.set(normalizeName(p.nome), p);
}
const catalogo = Array.from(byName.values());

if (!catalogo.length) {
  console.error('Nenhum produto encontrado no index.html para sincronizar.');
  process.exit(1);
}

(async () => {
  try {
    const loginResp = await fetch(`${apiBaseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: adminPassword })
    });

    const loginData = await loginResp.json().catch(() => ({}));
    if (!loginResp.ok || !loginData.token) {
      throw new Error(loginData.error || `Falha no login admin (HTTP ${loginResp.status})`);
    }

    const syncResp = await fetch(`${apiBaseUrl}/produtos/sync-catalogo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`
      },
      body: JSON.stringify({ produtos: catalogo })
    });

    const syncData = await syncResp.json().catch(() => ({}));
    if (!syncResp.ok) {
      throw new Error(syncData.error || `Falha ao sincronizar catalogo (HTTP ${syncResp.status})`);
    }

    console.log('Sincronizacao concluida.');
    console.log(`Cadastrados: ${syncData?.resumo?.criados ?? 0}`);
    console.log(`Atualizados: ${syncData?.resumo?.atualizados ?? 0}`);
    console.log(`Ignorados: ${syncData?.resumo?.ignorados ?? 0}`);
    console.log(`Total no banco: ${syncData?.resumo?.total ?? 0}`);
  } catch (error) {
    console.error('Erro:', error.message || error);
    process.exit(1);
  }
})();
