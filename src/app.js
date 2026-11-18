// Configura o Express: middlewares, rotas e tratamento de erros.
const express = require('express');
const cors = require('cors');
const produtoRoutes = require('./routes/produtoRoutes');

const app = express();

app.use(cors());          // permite que um front-end de outro domínio consuma a API
app.use(express.json());  // lê o corpo das requisições em JSON

// Rota de saúde: útil para testar se a API está no ar
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API de Produtos no ar 🚀', rotas: ['/produtos'] });
});

app.use('/produtos', produtoRoutes);

// 404 para rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento central de erros
app.use((erro, req, res, next) => {
  console.error(erro);
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
