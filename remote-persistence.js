const { Pool } = require("pg");

const connectionString = String(
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || ""
).trim();

const isEnabled = () => Boolean(connectionString);

const pool = isEnabled()
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null;

const normalizeKey = (nome, categoria) =>
  `${String(categoria || "geral").trim().toLowerCase()}::${String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;

const ensureSchema = async () => {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS catalogo_persistente (
      produto_key TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      preco NUMERIC(12,2) NOT NULL DEFAULT 0,
      imagem_url TEXT,
      ativo BOOLEAN NOT NULL DEFAULT FALSE,
      quantidade NUMERIC(12,3) NOT NULL DEFAULT 0,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const readLocalSnapshot = (db) => {
  return db
    .prepare(
      `SELECT
        p.id,
        p.nome,
        p.categoria,
        p.preco,
        p.imagem_url,
        p.ativo,
        COALESCE(e.quantidade, 0) AS quantidade
       FROM produto p
       LEFT JOIN estoque e ON e.produto_id = p.id
       ORDER BY p.id`
    )
    .all()
    .map((row) => ({
      produto_key: normalizeKey(row.nome, row.categoria),
      nome: row.nome,
      categoria: row.categoria,
      preco: Number(row.preco || 0),
      imagem_url: row.imagem_url || null,
      ativo: Boolean(row.ativo),
      quantidade: Number(row.quantidade || 0),
    }));
};

const syncSnapshotToRemote = async (db) => {
  if (!pool) {
    return;
  }

  await ensureSchema();
  const rows = readLocalSnapshot(db);

  for (const row of rows) {
    await pool.query(
      `INSERT INTO catalogo_persistente
        (produto_key, nome, categoria, preco, imagem_url, ativo, quantidade, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (produto_key)
       DO UPDATE SET
         nome = EXCLUDED.nome,
         categoria = EXCLUDED.categoria,
         preco = EXCLUDED.preco,
         imagem_url = EXCLUDED.imagem_url,
         ativo = EXCLUDED.ativo,
         quantidade = EXCLUDED.quantidade,
         atualizado_em = NOW()`,
      [
        row.produto_key,
        row.nome,
        row.categoria,
        row.preco,
        row.imagem_url,
        row.ativo,
        row.quantidade,
      ]
    );
  }

  const keys = rows.map((row) => row.produto_key);
  if (keys.length > 0) {
    await pool.query(
      `DELETE FROM catalogo_persistente
       WHERE NOT (produto_key = ANY($1::text[]))`,
      [keys]
    );
  }
};

const restoreSnapshotFromRemote = async (db) => {
  if (!pool) {
    return { restored: 0 };
  }

  await ensureSchema();
  const result = await pool.query(
    `SELECT produto_key, nome, categoria, preco, imagem_url, ativo, quantidade
     FROM catalogo_persistente
     ORDER BY categoria, nome`
  );

  if (!result.rows.length) {
    return { restored: 0 };
  }

  const localProducts = db.prepare("SELECT id, nome, categoria FROM produto").all();
  const localByKey = new Map(localProducts.map((row) => [normalizeKey(row.nome, row.categoria), row]));

  const insertProduto = db.prepare(
    "INSERT INTO produto (nome, preco, categoria, imagem_url, ativo) VALUES (?, ?, ?, ?, ?)"
  );
  const updateProduto = db.prepare(
    "UPDATE produto SET nome = ?, preco = ?, categoria = ?, imagem_url = ?, ativo = ? WHERE id = ?"
  );
  const insertEstoque = db.prepare(
    "INSERT OR IGNORE INTO estoque (produto_id, quantidade, unidade) VALUES (?, 0, 'kg')"
  );
  const updateEstoque = db.prepare(
    "UPDATE estoque SET quantidade = ?, atualizado_em = datetime('now') WHERE produto_id = ?"
  );

  const restore = db.transaction((rows) => {
    let restored = 0;

    for (const row of rows) {
      const key = row.produto_key || normalizeKey(row.nome, row.categoria);
      const existing = localByKey.get(key);
      const ativo = Number(row.quantidade) > 0 ? 1 : 0;

      if (existing) {
        updateProduto.run(
          row.nome,
          Number(row.preco || 0),
          row.categoria,
          row.imagem_url || null,
          ativo,
          existing.id
        );
        insertEstoque.run(existing.id);
        updateEstoque.run(Number(row.quantidade || 0), existing.id);
      } else {
        const info = insertProduto.run(
          row.nome,
          Number(row.preco || 0),
          row.categoria,
          row.imagem_url || null,
          ativo
        );
        insertEstoque.run(info.lastInsertRowid);
        updateEstoque.run(Number(row.quantidade || 0), info.lastInsertRowid);
        localByKey.set(key, { id: info.lastInsertRowid, nome: row.nome, categoria: row.categoria });
      }

      restored += 1;
    }

    return restored;
  });

  return { restored: restore(result.rows) };
};

module.exports = {
  isRemotePersistenceEnabled: isEnabled,
  restoreSnapshotFromRemote,
  syncSnapshotToRemote,
};