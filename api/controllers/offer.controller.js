const ServiceOffer = require('../services/offer.service');

async function createOffer(req, res) {
  const response = await ServiceOffer.createOffer(req, res);
  return response;
}

async function updateOffer(req, res) {
  const response = await ServiceOffer.updateOffer(req, res);
  return response; 
}

async function deleteOffer(req, res) {
  const response = await ServiceOffer.deleteOffer(req, res);
  return response;
}

async function listOffers(req, res) {
  const response = await ServiceOffer.listOffers(req, res);
  return response;
}

module.exports = {
  createOffer,
  updateOffer,
  deleteOffer,
  listOffers,
};
