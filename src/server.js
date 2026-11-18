// Ponto de entrada: carrega as variáveis de ambiente e sobe o servidor.
require('dotenv').config();
const app = require('./app');

// Em produção, o serviço de hospedagem define a porta pela variável PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
