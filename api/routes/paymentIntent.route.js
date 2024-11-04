// paymentIntent.routes.js
const express = require('express');
const router = express.Router();
const paymentIntentHandler = require('../controllers/paymentIntent.controller');

/**
 * Set up the paymentIntent routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 * @param {string} client - The client for WhatsApp.
 */
const setupPaymentIntent = (app, client) => {
    app.use("/paymentIntent", router);
    
    router.get('/list', (req, res) => {
        paymentIntentHandler.listPaymentIntents(req, res, client);
    });

    router.post('/add', (req, res) => {
        paymentIntentHandler.createPaymentIntent(req, res, client);
    });

    router.put('/update', (req, res) => {
        paymentIntentHandler.updatePaymentIntent(req, res, client);
    });

    router.delete('/delete', (req, res) => {
        paymentIntentHandler.deletePaymentIntent(req, res, client);
    });
};

module.exports = { setupPaymentIntent };
