const Offer = require('../models/offer.model');
const ResponseService = require('./response.service');
const logger = require("../helpers/logger")

async function createOffer(req, res) {
  try {
    const offerData = req.body;
    const newOffer = new Offer(offerData);
    await newOffer.save();
    return ResponseService.created(res, { message: 'Offer créée avec succès' });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function getOffer(req, res) {
  try {
    const offerId = req.params.offerId;
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return ResponseService.notFound(res, { message: 'Offer non trouvée' });
    }
    return ResponseService.success(res, { offer });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function updateOffer(req, res) {
  try {
    const offerId = req.query.id;
    const updatedData = req.body;
    const offer = await Offer.findByIdAndUpdate(offerId, updatedData, { new: true });
    if (!offer) {
      return ResponseService.notFound(res, { message: 'Offer non trouvée' });
    }
    return ResponseService.success(res, { message: 'Offer mise à jour avec succès', offer });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function deleteOffer(req, res) {
  try {
    const offerId = req.query.id;
    const offer = await Offer.findByIdAndDelete(offerId);
    if (!offer) {
      return ResponseService.notFound(res, { message: 'Offer non trouvée' });
    }
    return ResponseService.success(res, { message: 'Offer supprimée avec succès' });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function listOffers(req, res) {
  try {
    const offers = await Offer.find();
    return ResponseService.success(res, { offers });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

module.exports = {
  createOffer,
  getOffer,
  updateOffer,
  deleteOffer,
  listOffers,
};
