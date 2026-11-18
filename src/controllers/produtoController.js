// CONTROLLER: recebe a requisição, valida, chama o Model e devolve a resposta.
// Numa API, a "View" é a resposta em JSON.
const ProdutoModel = require('../models/produtoModel');

function validar(body, parcial = false) {
  const erros = [];
  const { nome, preco, estoque } = body;

  if (!parcial || nome !== undefined) {
    if (typeof nome !== 'string' || nome.trim() === '') erros.push('nome é obrigatório');
  }
  if (!parcial || preco !== undefined) {
    if (isNaN(Number(preco)) || Number(preco) < 0) erros.push('preco deve ser um número >= 0');
  }
  if (estoque !== undefined) {
    if (!Number.isInteger(Number(estoque)) || Number(estoque) < 0) erros.push('estoque deve ser um inteiro >= 0');
  }
  return erros;
}

function montarDados(body) {
  const dados = {};
  if (body.nome !== undefined) dados.nome = body.nome.trim();
  if (body.preco !== undefined) dados.preco = Number(body.preco);
  if (body.estoque !== undefined) dados.estoque = Number(body.estoque);
  return dados;
}

const ProdutoController = {
  async listar(req, res, next) {
    try {
      const produtos = await ProdutoModel.listar();
      res.json(produtos);
    } catch (erro) {
      next(erro);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const produto = await ProdutoModel.buscarPorId(id);
      if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
      res.json(produto);
    } catch (erro) {
      next(erro);
    }
  },

  async criar(req, res, next) {
    try {
      const erros = validar(req.body);
      if (erros.length) return res.status(400).json({ erros });
      const produto = await ProdutoModel.criar(montarDados(req.body));
      res.status(201).json(produto);
    } catch (erro) {
      next(erro);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const erros = validar(req.body, true);
      if (erros.length) return res.status(400).json({ erros });
      if (!(await ProdutoModel.buscarPorId(id))) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      const produto = await ProdutoModel.atualizar(id, montarDados(req.body));
      res.json(produto);
    } catch (erro) {
      next(erro);
    }
  },

  async remover(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!(await ProdutoModel.buscarPorId(id))) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      await ProdutoModel.remover(id);
      res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  },
};

module.exports = ProdutoController;
