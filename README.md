# Boutique das Carnes e Conveniência Zé das Carnes — API

Sistema de e-commerce para açougue com carrinho, checkout via WhatsApp, gestão de estoque e painel administrativo protegido por senha.

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Backend | Node.js + Express 5 |
| Banco de Dados | SQLite (better-sqlite3) |
| Frontend | HTML / CSS / JavaScript puro |
| Exportação | ExcelJS (XLSX) + CSV nativo |

---

## Instalação

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
```bash
copy .env.example .env
```
Abra o arquivo `.env` e defina uma **senha forte** para `ADMIN_PASSWORD`.

### 3. Inicie o servidor
```bash
npm start
```

O servidor estará disponível em **http://localhost:3000**

---

## Estrutura do Projeto

```
projeto Açougue-Corrigido (1)/
├── server.js                    # API Express (ponto de entrada)
├── db.js                        # Configuração e schema do SQLite
├── exportar.js                  # CLI para gerar exports CSV/XLSX
├── package.json
├── .env                         # Variáveis de ambiente (não commitar!)
├── .env.example                 # Template do .env
├── .gitignore
├── README.md
├── projeto Açougue01/
│   └── projeto Açougue01/
│       ├── index.html           # Loja online
│       ├── admin.html           # Painel administrativo (protegido)
│       ├── java.Script.js       # Carrinho e checkout
│       └── style.css
└── exportacao/                  # Arquivos exportados (gerado automaticamente)
    ├── tudo_em_um.csv
    └── tudo_em_um.xlsx
```

---

## Rotas da API

### Produtos
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/produtos` | Lista todos os produtos |
| `GET` | `/produtos/:id` | Busca produto por ID |
| `POST` | `/produtos` | Cria produto |
| `PUT` | `/produtos/:id` | Atualiza produto completo |
| `DELETE` | `/produtos/:id` | Remove produto |
| `PATCH` | `/produtos/:id/disponibilidade` | Ativa/desativa produto |
| `PATCH` | `/produtos/:id/preco` | Atualiza preço |
| `POST` | `/produtos/sync-catalogo` | Sincroniza catálogo em lote |

### Estoque
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/estoque/:produtoId` | Consulta estoque |
| `POST` | `/estoque/entrada` | Adiciona estoque |
| `POST` | `/estoque/saida` | Remove estoque |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/pedidos` | Cria pedido + baixa automática de estoque |
| `GET` | `/pedidos` | Lista pedidos |
| `GET` | `/pedidos/:id` | Detalha pedido com itens |
| `PATCH` | `/pedidos/:id/confirmar` | Confirma pedido |
| `PATCH` | `/pedidos/:id/cancelar` | Cancela pedido + devolve estoque |

### Clientes
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/clientes` | Cadastra/atualiza cliente por telefone |
| `GET` | `/clientes` | Lista clientes |

### Admin (requer autenticação 🔐)
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/admin/login` | Obtém token de acesso |
| `GET` | `/admin/dashboard-data` | Dados do painel (produtos + estoque) |
| `PATCH` | `/admin/estoque/:id` | Atualiza quantidade em estoque |
| `PATCH` | `/admin/preco/:id` | Atualiza preço do produto |
| `GET` | `/api/exportar?formato=csv` | Exporta todos os dados em CSV |
| `GET` | `/api/exportar?formato=xlsx` | Exporta todos os dados em Excel |

---

## Painel Administrativo

Acesse **http://localhost:3000/admin** para gerenciar estoque e preços.

- A senha é definida no arquivo `.env` como `ADMIN_PASSWORD`
- O token é válido enquanto o servidor estiver rodando
- Para invalidar todos os tokens, basta reiniciar o servidor

---

## Exportação de Dados

### Via Painel Admin (recomendado)
No painel administrativo, use os botões **⬇ CSV** ou **⬇ Excel** para baixar os dados.

### Via API (com token)
```bash
# Obter token
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"senha\": \"sua_senha\"}"

# Exportar CSV
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/exportar?formato=csv -o dados.csv

# Exportar Excel
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/exportar?formato=xlsx -o dados.xlsx
```

### Via CLI (gera arquivos localmente)
```bash
node exportar.js
```

Os arquivos são gerados na pasta `exportacao/`.

---

## Configuração (.env)

```env
PORT=3000
ADMIN_PASSWORD=sua_senha_forte_aqui
```

> ⚠️ **Nunca** suba o arquivo `.env` para o Git. Ele já está no `.gitignore`.

---

## Scripts

```bash
npm start          # Inicia o servidor
npm run exportar   # Gera exports CSV/XLSX localmente
```

---

## Banco de Dados

O banco SQLite (`acougue.db`) é criado automaticamente na primeira execução com:
- Modo WAL para melhor performance
- Chaves estrangeiras ativadas
- 6 tabelas: `cliente`, `produto`, `estoque`, `pedido`, `pedido_item`, `pedido_sequencia`
- Produtos de exemplo (bovino, suíno, frango, rotisseria, conveniência) são inseridos automaticamente se o banco estiver vazio

---

## Fluxo de Compra

1. **Loja** → cliente seleciona produtos e quantidades
2. **Carrinho** → valida estoque em tempo real via API
3. **Checkout** → dados do cliente + endereço de entrega
4. **Pedido** → baixa automática no estoque
5. **WhatsApp** → mensagem formatada enviada para o lojista

---

## Segurança

- Painel admin protegido por senha (token HMAC-SHA256)
- Variáveis sensíveis carregadas do `.env` (nunca hardcoded)
- CORS configurado
- Validação de tipos em todos os endpoints
- Transações SQLite para operações críticas (pedidos, cancelamentos)

---

## 🚀 Publicação em Produção

O projeto está pronto para publicar em produção. As instruções detalhadas estão em:

### Frontend (Netlify)
📖 [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
- Deploy do site estático em Netlify
- Configuração de redirecionamentos
- Variáveis de ambiente para API
- Teste e monitoramento

### Backend (Render / Railway)
📖 [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)
- Deploy da API em Render ou Railway
- Configuração de variáveis de ambiente
- Banco SQLite e backups
- Conectar Frontend + Backend

### Próximos Passos
1. **Publicar Frontend** → Netlify (veja NETLIFY_DEPLOYMENT.md)
2. **Publicar Backend** → Render ou Railway (veja BACKEND_DEPLOYMENT.md)
3. **Migrar para PostgreSQL** (opcional, para escalar)
4. **Configurar domínio próprio** (opcional)

---

## 📞 Suporte

Para problemas ou dúvidas sobre deployment:
1. Verifique os guias de deployment (links acima)
2. Veja os logs na plataforma (Netlify / Render / Railway)
3. Teste localmente antes de publicar
