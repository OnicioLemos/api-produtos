# API de Produtos — Node.js + Express + Prisma + MySQL (MVC)

API REST simples (CRUD de produtos) organizada em MVC, pronta para rodar localmente e para ser hospedada de graça.

## Estrutura

```
api-produtos/
├── prisma/
│   └── schema.prisma          # definição da tabela "produtos"
├── src/
│   ├── config/prisma.js       # instância única do Prisma Client
│   ├── models/produtoModel.js # MODEL: acesso ao banco
│   ├── controllers/produtoController.js # CONTROLLER: validação e regras
│   ├── routes/produtoRoutes.js # ROTAS: URL + verbo → controller
│   ├── app.js                 # configuração do Express
│   └── server.js              # sobe o servidor (usa process.env.PORT)
├── .env.example
├── .gitignore
└── package.json
```

Numa API, a **View** é a resposta em JSON que o controller devolve.

## Rotas

| Método | Rota             | O que faz              | Corpo (JSON)                                   |
|--------|------------------|------------------------|------------------------------------------------|
| GET    | `/`              | Verifica se está no ar | —                                              |
| GET    | `/produtos`      | Lista todos            | —                                              |
| GET    | `/produtos/:id`  | Busca um               | —                                              |
| POST   | `/produtos`      | Cria                   | `{ "nome": "Caneta", "preco": 2.5, "estoque": 10 }` |
| PUT    | `/produtos/:id`  | Atualiza (parcial)     | `{ "preco": 3 }`                               |
| DELETE | `/produtos/:id`  | Remove                 | —                                              |

Respostas de erro: `400` (dados inválidos), `404` (não encontrado), `500` (erro interno).

## Rodando localmente

1. Tenha um MySQL rodando (XAMPP, Laragon, MySQL Server…).
2. Copie `.env.example` para `.env` e ajuste a `DATABASE_URL`.
3. No terminal, na pasta do projeto:

```bash
npm install        # instala as dependências e gera o Prisma Client
npm run db:push    # cria o banco e a tabela a partir do schema.prisma
npm run dev        # sobe a API em http://localhost:3000 (reinicia ao salvar)
```

Teste com o Thunder Client / Insomnia / Postman, ou no navegador em `http://localhost:3000/produtos`.

---

# Passo a passo: hospedando de graça

Vamos usar dois serviços gratuitos, sem cartão de crédito:

- **TiDB Cloud Starter** → banco de dados compatível com MySQL (o Prisma usa `provider = "mysql"` sem mudar nada).
- **Render** → hospeda a API Node.js e gera uma URL pública `https://...onrender.com`.

E o **GitHub** faz a ponte: o Render busca o código direto do seu repositório.

```
[ Cliente / Front-end ] ──HTTPS──► [ Render: API Express ] ──SSL──► [ TiDB Cloud: MySQL ]
                                           ▲
                                  código vem do GitHub
```

## Etapa 1 — Publicar o código no GitHub

1. Crie um repositório novo em <https://github.com/new> (ex.: `api-produtos`). Pode ser público ou privado.
2. Na pasta do projeto, rode:

```bash
git init
git add .
git commit -m "API de produtos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/api-produtos.git
git push -u origin main
```

> ⚠️ Confira que o arquivo `.env` **não** foi enviado (ele está no `.gitignore`). Senhas nunca vão para o GitHub.

## Etapa 2 — Criar o banco MySQL no TiDB Cloud

1. Acesse <https://tidbcloud.com> e crie uma conta (dá para entrar com GitHub ou Google).
2. Crie um cluster do tipo **Starter** (gratuito). Escolha uma região da AWS (ex.: `us-east-1`) e dê um nome, como `aula-api`.
3. Abra o cluster e clique em **Connect**.
4. Em **Connect With**, escolha **Prisma**. Clique em **Generate Password** e **guarde a senha** (ela só aparece uma vez).
5. Copie a `DATABASE_URL` mostrada. Ela tem este formato:

```
mysql://XXXXXXXX.root:SENHA@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
```

6. Troque o nome do banco `test` por `api_produtos` (o Prisma cria o banco se ele não existir). Mantenha o `?sslaccept=strict` no final: o TiDB exige conexão segura.

**(Opcional) Testar o banco a partir da sua máquina:** coloque essa URL no seu `.env` e rode `npm run db:push`. Se aparecer "Your database is now in sync with your Prisma schema", está tudo certo.

## Etapa 3 — Hospedar a API no Render

1. Acesse <https://render.com> e crie a conta **com o GitHub** (facilita a conexão com o repositório).
2. No painel, clique em **New → Web Service**.
3. Escolha o repositório `api-produtos` (se ele não aparecer, clique em *Configure GitHub App* e libere o acesso).
4. Preencha:

| Campo              | Valor                                  |
|--------------------|----------------------------------------|
| Name               | `api-produtos` (vira parte da URL)     |
| Language / Runtime | `Node`                                 |
| Branch             | `main`                                 |
| Build Command      | `npm install && npx prisma db push`    |
| Start Command      | `npm start`                            |
| Instance Type      | **Free**                               |

5. Em **Environment Variables**, adicione:
   - `DATABASE_URL` = a URL do TiDB da etapa 2 (com `api_produtos` e `?sslaccept=strict`).
   - Não crie `PORT`: o Render define sozinho, e o `server.js` já lê `process.env.PORT`.
6. Clique em **Deploy Web Service** e acompanhe os logs. O deploy terminou quando aparecer `Servidor rodando na porta ...` e o status ficar **Live**.

O `npx prisma db push` no build cria/atualiza a tabela no TiDB a cada deploy, então não é preciso rodar nada manualmente.

## Etapa 4 — Testar a API online

Sua URL fica como `https://api-produtos-xxxx.onrender.com`.

- Navegador: abra `https://SUA-URL.onrender.com/produtos` → deve retornar `[]`.
- Thunder Client / Postman: faça um `POST` em `/produtos` com o JSON de exemplo e depois um `GET` de novo.
- Pelo terminal:

```bash
curl -X POST https://SUA-URL.onrender.com/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Caneta","preco":2.5,"estoque":10}'
```

## Etapa 5 — Atualizar a API

Basta enviar alterações para o GitHub:

```bash
git add .
git commit -m "nova rota"
git push
```

O Render detecta o push e faz o deploy automaticamente (Auto-Deploy fica ligado por padrão).

## Limitações do plano gratuito (vale avisar a turma)

- **Render "dorme"**: após 15 minutos sem requisições o serviço é desligado; a próxima requisição o acorda e pode levar perto de 1 minuto. Antes de uma demonstração em aula, abra a URL uns minutos antes.
- **Render tem 750 horas gratuitas por mês** por conta — suficiente para uma API ligada o mês todo.
- **Arquivos não persistem no Render**: tudo que precisa ficar salvo deve ir para o banco (por isso usamos o TiDB, e não um arquivo local).
- **TiDB Starter tem cota gratuita mensal** (armazenamento e "Request Units"); para uma API de aula, sobra.

## Problemas comuns

| Sintoma                                       | Causa provável / solução |
|-----------------------------------------------|--------------------------|
| `P1001: Can't reach database server`          | `DATABASE_URL` errada ou sem `?sslaccept=strict`. Copie de novo do painel do TiDB. |
| `Access denied for user`                      | Senha errada. Gere outra em **Connect → Reset Password** e atualize no Render. |
| Deploy falha em `prisma generate`             | Confirme que `prisma` e `@prisma/client` estão na mesma versão no `package.json`. |
| Primeira requisição demora muito              | Normal no plano Free (serviço estava dormindo). |
| Front-end recebe erro de CORS                 | O projeto já usa `cors()`; confira se a URL chamada é `https://` e se a rota existe. |
| Mudou o `.env` local e nada mudou online      | O `.env` não vai para o servidor: altere as variáveis no painel do Render (**Environment**). |
