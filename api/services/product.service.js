const Product = require('../models/product.model');
const ResponseService = require('./response.service');
const logger = require("../helpers/logger")

async function createProduct(req, res) {
  try {
    const productData = req.body;
    const hasDuplicates = new Set(productData.offers).size !== productData.offers.length;
    const newProduct = new Product(productData);
    if(hasDuplicates)    
    {
        return ResponseService.badRequest(res, { message: "La création d'un produit avec des offres identiques n'est pas autorisée." })
    }
    await newProduct.save();
    return ResponseService.created(res, { message: 'Produit créé avec succès' });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function getProduct(req, res) {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('offers');
    if (!product) {
      return ResponseService.notFound(res, { message: 'Produit non trouvé' });
    }
    
    return ResponseService.success(res, { product });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const productId = req.query.id;
    const updatedData = req.body;
    const hasDuplicates = new Set(updatedData.offers).size !== updatedData.offers.length;
    if(hasDuplicates)    
    {
        return ResponseService.badRequest(res, { message: "La mise a jour d'un produit avec des offres identiques n'est pas autorisée." })
    }
    const product = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
    if (!product) {
      return ResponseService.notFound(res, { message: 'Produit non trouvé' });
    }
    return ResponseService.success(res, { message: 'Produit mis à jour avec succès', product });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = req.query.id;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return ResponseService.notFound(res, { message: 'Produit non trouvé' });
    }
    return ResponseService.success(res, { message: 'Produit supprimé avec succès' });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function listProducts(req, res) {
  try {
    const products = await Product.find().populate('offers');
    return ResponseService.success(res, { products });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

module.exports = {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts,
};
