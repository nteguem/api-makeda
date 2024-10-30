const ProductService = require('../services/product.service');

async function createProduct(req, res) {
  const response = await ProductService.createProduct(req, res);
  return response;
}

async function getProduct(req, res) {
  const response = await ProductService.getProduct(req, res);
  return response;
}

async function updateProduct(req, res) {
  const response = await ProductService.updateProduct(req, res);
  return response;
}

async function deleteProduct(req, res) {
  const response = await ProductService.deleteProduct(req, res);
  return response;
}

async function listProducts(req, res) {
  const response = await ProductService.listProducts(req, res);
  return response;
}

module.exports = {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts,
};
