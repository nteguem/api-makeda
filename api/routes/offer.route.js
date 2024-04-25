const express = require('express');
const router = express.Router();
const offerHandler = require('../controllers/offer.controller');

/**
 * Set up the offer routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 */
const setupOffer = (app) => {
    // Mount the 'router' to handle routes with the base path '/offer'.
    app.use("/offer", router);
    router.get('/list', offerHandler.listOffers);
    router.post('/add', offerHandler.createOffer);
    router.put('/update', offerHandler.updateOffer);
    router.delete('/delete', offerHandler.deleteOffer);    
  };
  
  module.exports = { setupOffer };
