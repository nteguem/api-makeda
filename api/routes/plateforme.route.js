const express = require('express');
const router = express.Router();
const plateformeHandler = require('../controllers/plateforme.controller');

/**
 * Set up the plateforme routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 */
const setupPlateforme = (app) => {
    // Mount the 'router' to handle routes with the base path '/plateforme'.
    app.use("/plateforme", router);
    router.get('/list', plateformeHandler.listPlateformes);
    router.post('/add', plateformeHandler.createPlateforme);
    router.put('/update', plateformeHandler.updatePlateforme);
    router.delete('/delete', plateformeHandler.deletePlateforme);    
  };
  
  module.exports = { setupPlateforme };
