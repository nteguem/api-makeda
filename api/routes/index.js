const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.middleware'); 
const { setupUserRoutes } = require('./user.route');
const { setupPlateforme } = require('./plateforme.route');
const { setupOffer } = require('./offer.route');
const { setupProduct } = require('./product.route');
const { setupCampaign } = require('./campaign.route');
const { setupGroup } = require('./group.route');
const { setupAccount } = require('./account.route');
const { setupUpload } = require('./upload.route');
const { setupPaymentIntent } = require('./paymentIntent.route');

/* GET home page. */
router.get('/', function (req, res) {
  res.json({ title: 'chatbot Makeda' });
});

/**
 * Global middleware to secure all routes except for specified exclusions.
 * @param {Array} excludedPaths - List of routes to exclude from authentication.
 */
const globalAuthenticate = (excludedPaths = []) => {
  return (req, res, next) => {
    // Check if the current route is part of the exclusions
    if (excludedPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }
    authenticateToken(req, res, next);
  };
};

/**
 * Function to set up all application routes and connect them to their respective route modules.
 * @param {Object} client - Optional client object passed to routes (e.g., WhatsApp client).
 * @returns {express.Router} - The configured router instance.
 */
const setupAppRoutes = (client) => {
  const app = router;

  // Apply the global middleware to all routes with specified exclusions
  app.use(globalAuthenticate(['/user/login'])); 

  // Set up route modules
  setupUserRoutes(app, client);
  setupPlateforme(app);
  setupOffer(app);
  setupProduct(app);
  setupCampaign(app, client);
  setupGroup(app, client);
  setupAccount(app, client);
  setupUpload(app);
  setupPaymentIntent(app, client);

  return app;
};

module.exports = setupAppRoutes;
