const Plateforme = require('../models/plateforme.model');
const ResponseService = require('./response.service');
const logger = require("../helpers/logger")

async function createPlateforme(req, res) {
  try {
    const plateformeData = req.body;
    const newPlateforme = new Plateforme(plateformeData);
    await newPlateforme.save();
    return ResponseService.created(res, { message: 'Plateforme créée avec succès' });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function getPlateforme(req, res) {
  try {
    const plateformeId = req.params.plateformeId;
    const plateforme = await Plateforme.findById(plateformeId);
    if (!plateforme) {
      return ResponseService.notFound(res, { message: 'Plateforme non trouvée' });
    }
    return ResponseService.success(res, { plateforme });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function updatePlateforme(req, res) {
  try {
    const plateformeId = req.query.id;
    const updatedData = req.body;
    const plateforme = await Plateforme.findByIdAndUpdate(plateformeId, updatedData, { new: true });
    if (!plateforme) {
      return ResponseService.notFound(res, { message: 'Plateforme non trouvée' });
    }
    return ResponseService.success(res, { message: 'Plateforme mise à jour avec succès', plateforme });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function deletePlateforme(req, res) {
  try {
    const plateformeId = req.query.id;
    const plateforme = await Plateforme.findByIdAndDelete(plateformeId);
    if (!plateforme) {
      return ResponseService.notFound(res, { message: 'Plateforme non trouvée' });
    }
    return ResponseService.success(res, { message: 'Plateforme supprimée avec succès' });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

async function listPlateformes(req, res) {
  try {
    const plateformes = await Plateforme.find();
    return ResponseService.success(res, { plateformes });
  } catch (error) {
    return ResponseService.internalServerError(res, { error: error.message });
  }
}

module.exports = {
  createPlateforme,
  getPlateforme,
  updatePlateforme,
  deletePlateforme,
  listPlateformes,
};
