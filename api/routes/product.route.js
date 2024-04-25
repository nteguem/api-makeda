const express = require('express');
const router = express.Router();
const productHandler = require('../controllers/product.controller');

/**
 * Set up the product routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 */
const setupProduct = (app) => {
    // Mount the 'router' to handle routes with the base path '/product'.
    app.use("/product", router);
    router.get('/list', productHandler.listProducts);
    router.post('/add', productHandler.createProduct);
    router.put('/update', productHandler.updateProduct);
    router.delete('/delete', productHandler.deleteProduct);    
  };
  
  module.exports = { setupProduct };
