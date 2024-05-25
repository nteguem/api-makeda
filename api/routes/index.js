// Import the 'express' module to create an instance of the router.
const express = require('express');
const router = express.Router();
const { setupUserRoutes } = require('./user.route');
const {setupPlateforme} = require('./plateforme.route');
const {setupOffer} = require('./offer.route');
const {setupProduct} = require('./product.route');
const {setupCampaign} = require('./campaign.route');
const {setupGroup} = require('./group.route')
const {setupAccount} = require('./account.route')
/* GET home page. */
// Define a route for the home page ('/') that renders the 'index' template with the title 'Bibemella'.
router.get('/', function(req, res, next) {
  res.json({ title: 'chatbot Makeda' });
});

/**
 * Function to set up all the app routes and connect them to their corresponding route modules.
 * @returns {express.Router} - The configured router instance.
 */
const setupAppRoutes = (client) => {
  const app = router;
  setupUserRoutes(app);
  setupPlateforme(app);
  setupOffer(app);
  setupProduct(app);
  setupCampaign(app,client);
  setupGroup(app);
  setupAccount(app,client);
  return app;
}

module.exports = setupAppRoutes;
