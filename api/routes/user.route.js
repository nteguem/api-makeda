const express = require('express');
const router = express.Router();
const userHandler = require('../controllers/user.controller');

/**
 * Set up the user routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 */
const setupUserRoutes = (app) => {
    // Mount the 'router' to handle routes with the base path '/user'.
    app.use("/user", router);
    router.get('/list', userHandler.getAllUser);
    router.post('/login', userHandler.login);
  };
  
  module.exports = { setupUserRoutes };
