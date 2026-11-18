// MODEL: única camada que conversa com o banco de dados.
const prisma = require('../config/prisma');

const ProdutoModel = {
  listar() {
    return prisma.produto.findMany({ orderBy: { id: 'asc' } });
  },

  buscarPorId(id) {
    return prisma.produto.findUnique({ where: { id } });
  },

  criar(dados) {
    return prisma.produto.create({ data: dados });
  },

  atualizar(id, dados) {
    return prisma.produto.update({ where: { id }, data: dados });
  },

  remover(id) {
    return prisma.produto.delete({ where: { id } });
  },
};

module.exports = ProdutoModel;
