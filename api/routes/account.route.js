const express = require('express');
const router = express.Router();
const accountHandler = require('../controllers/account.controller');

/**
 * Set up the account routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 * @param {string} client - The client whatapp .
 */
const setupAccount = (app, client) => {
    app.use("/account", router);
     
    router.get('/list', (req, res) => {
        accountHandler.listAccounts(req, res, client);
    });

    router.get('/stats', (req, res) => {
        accountHandler.statsAccounts(req, res, client);
    });

    router.post('/add', (req, res) => {
        accountHandler.createAccount(req, res, client);
    });

    router.put('/update', (req, res) => {
        accountHandler.updateAccount(req, res, client);
    });

    router.delete('/delete', (req, res) => {
        accountHandler.deleteAccount(req, res, client);
    });
};

module.exports = { setupAccount };
