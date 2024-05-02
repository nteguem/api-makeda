const express = require('express');
const router = express.Router();
const groupHandler = require('../controllers/group.controller');

/**
 * Set up the group routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 */
const setupGroup = (app) => {
    // Mount the 'router' to handle routes with the base path '/group'.
    app.use("/group", router);
    router.get('/list', groupHandler.listGroups);
    router.post('/add', groupHandler.createGroup);
    router.get('/download', groupHandler.generateAndDownloadCSV);
    router.put('/update', groupHandler.updateGroup);
    router.delete('/delete', groupHandler.deleteGroup);    
  };
  
  module.exports = { setupGroup };
