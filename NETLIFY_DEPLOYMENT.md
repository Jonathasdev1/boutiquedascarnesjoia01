# 🚀 Guia de Publicação para Netlify

Aqui você encontra as instruções passo-a-passo para publicar o frontend no Netlify e conectar com o backend em produção.

---

## ✅ Pré-Requisitos

1. **Conta Netlify** — Crie uma em https://app.netlify.com
2. **Repositório Git** — O projeto deve estar em GitHub, GitLab ou Bitbucket
3. **Backend em produção** — URL da API em Render/Railway (próximo passo)

---

## 📋 Passo 1: Preparar o Repositório

### 1.1 Criar `.gitignore` se não existir

```bash
# Arquivo: .gitignore
node_modules/
.env
.env.local
.env.*.local
backups/
logs/
exportacao/
acougue.db
*.log
.DS_Store
```

### 1.2 Inicializar Git e fazer push

```bash
# Inicializar repositório (se ainda não está)
git init
git add .
git commit -m "Initial commit"

# Adicionar remote e fazer push
# Substitua SEU_USUARIO e SEU_REPO pelos seus dados
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

---

## 🌐 Passo 2: Conectar Netlify ao Repositório

### 2.1 Criar documento novo no Netlify
1. Acesse https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha seu provedor (GitHub, GitLab, Bitbucket)
4. Selecione o repositório do projeto

### 2.2 Configurar build

Na tela de configuração:
- **Build command**: deixe em branco (não precisa compilar)
- **Publish directory**: `projeto Açougue01/projeto Açougue01`
- Clique em **"Deploy site"**

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente (CORS)

Depois que o site estiver publicado:

1. Acesse **Site settings** → **Build & deploy** → **Environment**
2. Clique em **"Edit variables"**
3. Adicione as variáveis necessárias:

### Variáveis para Netlify

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `VITE_API_BASE_URL` | `https://sua-api.onrender.com` | URL do backend em produção |
| `REACT_APP_API_URL` | `https://sua-api.onrender.com` | Alternativa para compatibilidade |

**Nota**: Você precisará da URL do backend antes disso. Primeiro publique o backend em Render/Railway (veja o próximo passo do projeto).

---

## 🔗 Passo 4: Conectar ao Backend

### 4.1 Obter a URL do Backend

Após publicar o backend em Render ou Railway, você terá uma URL como:
- `https://seu-api.onrender.com` (Render)
- `https://seu-api.up.railway.app` (Railway)

### 4.2 Atualizar CORS no Servidor

No arquivo `.env` do backend:

```env
ADMIN_PASSWORD=Jon@3388
ALLOWED_ORIGINS=https://sua-loja.netlify.app,https://api.sua-loja.com
```

E redeploy o backend.

### 4.3 Atualizar Frontend no Netlify

1. No Netlify Dashboard, vá para **Environment Variables**
2. Atualize `VITE_API_BASE_URL` com a URL do seu backend
3. Netlify fará rebuild automaticamente

---

## 🧪 Passo 5: Testar Antes de Colocar em Produção

### Teste Local

```bash
# Terminal 1: Rodar backend localmente
npm start

# Terminal 2: Abrir frontend no navegador
# Arquivo: projeto Açougue01/projeto Açougue01/index.html
# Ou usar um servidor local simples:
python -m http.server 8000
# acesse http://localhost:8000/projeto\ Açougue01/projeto\ Açougue01/
```

### Teste em Deploy Preview (antes de ir para main)

1. Crie uma branch para testes:
   ```bash
   git checkout -b feature/netlify-setup
   git push origin feature/netlify-setup
   ```
2. Netlify criará automaticamente um "Deploy Preview"
3. Teste em: `https://deploy-preview-NUM--sua-loja.netlify.app`
4. Se tudo OK, faça merge para `main`

---

## 📊 Monitoramento

### Verificar Builds no Netlify

1. Acesse seu site no Netlify
2. **Deploys** → Veja o histórico de publicações
3. **Logs** → Se algo falhar, veja os detalhes

### Testar Conectividade

Abra o painel **Admin** depois de publicado:
1. Acesse `https://sua-loja.netlify.app/admin.html`
2. Faça login com a senha configurada
3. Se os dados carreguem, a API está conectada corretamente

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch from API"

**Causa**: CORS configurado incorretamente no backend
**Solução**: 
1. Verifique `ALLOWED_ORIGINS` no `.env` do backend
2. Inclua a URL exata do seu Netlify
3. Redeploy o backend

### Erro: "Not Found" ao acessar admin.html

**Causa**: netlify.toml configurado incorretamente
**Solução**: 
1. Verifique que o caminho `publish` está correto
2. Redeploy manualmente no Netlify

### Site está offline

**Causa**: Netlify foi desativado ou limite foi atingido
**Solução**:
1. Verifique o plano Netlify (Free tem limites)
2. Confirme que o repositório Git estiver atualizado

---

## 📝 Checklist Final

- [ ] Repositório Git criado e com .gitignore
- [ ] Netlify conectado ao repositório
- [ ] Deploy inicial feito com sucesso
- [ ] URL do Netlify anotada (`https://seu-site.netlify.app`)
- [ ] Backend publicado em Render/Railway
- [ ] URL do backend anotada
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] CORS atualizado no backend
- [ ] Teste local funcionando
- [ ] Teste em Deploy Preview OK
- [ ] Merge para `main` feito
- [ ] Admin acessível e carregando dados

---

## 🚀 Próximos Passos

1. **Publicar Backend** — Veja o guia: `DEPLOYMENT_BACKEND.md`
2. **Migrar para PostgreSQL** — Quando precisar de múltiplos usuários
3. **SSL/HTTPS** — Netlify já fornece automaticamente
4. **Custom Domain** — Configure seu domínio próprio em Netlify

