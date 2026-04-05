# 🚀 Guia de Publicação do Backend (Render / Railway)

Aqui você encontra instruções para publicar a API em **Render** ou **Railway** e conectar com o frontend em Netlify.

---

## 🎯 Escolha: Render vs Railway?

| Aspecto | Render | Railway |
|--------|--------|---------|
| **Custo** | Free com limite | Free $5/mês credits |
| **Facilidade** | Muito fácil | Muito fácil |
| **Banco de dados** | Free PostgreSQL | Opcional (pago) |
| **Auto-deploy** | Sim (via Git) | Sim (via Git) |
| **Recomendação** | Para começar | Para escala |

**Este guia cobre ambos. Escolha um.**

---

## ✅ Pré-Requisitos

1. **Código versionado em Git** — GitHub, GitLab ou Bitbucket
2. **Arquivo `.env.example`** — Já existe no projeto
3. **Conta em Render OU Railway**

---

## 📋 Preparar o Backend para Produção

### 1. Arquivo `.env` Correto

No seu repositório, **NÃO commite** `.env`. Use `.env.example`:

```env
# .env.example (commite este)
PORT=3000
ADMIN_PASSWORD=troque_essa_senha_aqui
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
BACKUP_INTERVAL_HOURS=24
```

Sempre copie para `.env` localmente:
```bash
cp .env.example .env
```

### 2. Garantir que `.gitignore` Está Correto

```bash
# .gitignore
node_modules/
.env
.env.local
.env.*.local
backups/
logs/
acougue.db
acougue.db-shm
acougue.db-wal
*.log
.DS_Store
```

### 3. Package.json com Scripts Corretos

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

---

## 🎛️ Opção 1: Deploy no Render

### 1.1 Criar Conta e Projeto

1. Acesse https://render.com
2. Clique em **"Sign up"** com GitHub/GitLab/Bitbucket
3. Clique em **"New"** → **"Web Service"**
4. Selecione seu repositório

### 1.2 Configurar Build

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node
- **Instance Type**: Free (suficiente para começar)

### 1.3 Variáveis de Ambiente

Na seção **Environment**, adicione:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `ADMIN_PASSWORD` | `SuaSenhaForte_123` | Senha do admin |
| `PORT` | `3000` | Porta (Render gerencia automaticamente) |
| `ALLOWED_ORIGINS` | `https://sua-loja.netlify.app` | URL do frontend |
| `BACKUP_INTERVAL_HOURS` | `24` | Intervalo de backup |

### 1.4 Fazer Deploy

Clique em **"Create Web Service"**. Render fará deploy automaticamente.

Sua API estará disponível em:
```
https://seu-servico.onrender.com
```

---

## 🚄 Opção 2: Deploy no Railway

### 2.1 Criar Conta e Projeto

1. Acesse https://railway.app
2. Clique em **"Start Project"**
3. Conecte sua conta GitHub/GitLab
4. Selecione seu repositório

### 2.2 Configurar Build

Railway detecta automaticamente `package.json`. Você pode deixar configuração padrão.

### 2.3 Variáveis de Ambiente

Na aba **Variables**, adicione:

| Chave | Valor |
|-------|-------|
| `ADMIN_PASSWORD` | `SuaSenhaForte_123` |
| `ALLOWED_ORIGINS` | `https://sua-loja.netlify.app` |
| `BACKUP_INTERVAL_HOURS` | `24` |

### 2.4 Fazer Deploy

Railway faz deploy automaticamente quando você faz push no Git.

Sua API estará disponível em:
```
https://seu-servico.up.railway.app
```

---

## 🔗 Conectar Backend ao Frontend

### 1. Obter URL do Backend

Depois de fazer deploy (Render ou Railway), você terá uma URL:
- Render: `https://seu-servico.onrender.com`
- Railway: `https://seu-servico.up.railway.app`

### 2. Atualizar CORS no Backend

Na plataforma (Render/Railway), atualize a variável `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://sua-loja.netlify.app,https://localhost:3000
```

O backend fará redeploy automaticamente.

### 3. Atualizar Frontend no Netlify

No Netlify Dashboard:
1. **Site settings** → **Build & deploy** → **Environment**
2. Adicione ou atualize:
```
VITE_API_BASE_URL=https://seu-backend.onrender.com
```
3. Clique em **"Trigger deploy"** para rebuildar

---

## 🧪 Testar Conectividade

### 1. Verificar Status da API

```bash
curl https://seu-backend.onrender.com/api/status
```

Resposta esperada:
```json
{
  "status": "ok",
  "storage": "sqlite",
  "allowed_origins": ["https://sua-loja.netlify.app"]
}
```

### 2. Testar Admin Portal

1. Acesse `https://sua-loja.netlify.app/admin.html`
2. Faça login com senha configurada
3. Se carregar dados, API está conectada ✅

---

## 💾 Backup em Produção

### Opcional: Usar PostgreSQL

SQLite funciona bem para um pequeno açougue, mas se precisar de:
- Múltiplos usuários
- Acesso simultâneo
- Backups automáticos

**Próximo passo**: Migrar para PostgreSQL (veja guia separado).

---

## 🐛 Troubleshooting

### Erro: "Port is already in use"

**Solução**: Remova a definição de PORT no `.env` para que Render/Railway escolha automaticamente.

### Erro: "Cannot find module 'better-sqlite3'"

**Solução**: Certifique-se de que `npm install` foi executado antes do build.

### API retorna 403 CORS

**Solução**: Verifique `ALLOWED_ORIGINS` no backend:
```
ALLOWED_ORIGINS=https://sua-loja.netlify.app
```

### Build falha no Render

1. Verifique **Deploy Logs** no painel
2. Comum: Arquivo `.env` commitado por acido
3. Solução: Remova do histórico Git se necessário

---

## 📊 Monitoramento

### Logs em Tempo Real

**Render**:
1. Acesse seu serviço
2. Clique em **"Logs"**
3. Veja em tempo real

**Railway**:
1. Acesse seu projeto
2. Abra o **Deployment**
3. **Logs** aparece automaticamente

---

## 📝 Checklist Final

- [ ] `.env.example` criado e correto
- [ ] `.gitignore` inclui `.env`
- [ ] Repositório Git atualizado com `git push`
- [ ] Conta criada em Render OU Railway
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy completo (dizendo "successo")
- [ ] URL do backend anotada
- [ ] CORS atualizado com URL do frontend
- [ ] Frontend (Netlify) atualizado com URL do backend
- [ ] Teste de conectividade OK
- [ ] Admin portal carregando dados

---

## 🚀 Próximos Passos

1. **Migrar para PostgreSQL** — Se precisar escalar
2. **Configurar Custom Domain** — Use seu próprio domínio
3. **Monitorar Performance** — Use ferramentas de profiling
4. **Backups** — Configure backups automáticos do banco

