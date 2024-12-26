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

    // Check if the provided data is empty or invalid
    if (Object.keys(updatedData).length === 0) {
      return ResponseService.badRequest(res, { message: 'No data provided for update' });
    }

    // Validate specific fields (example: check if the name is not empty)
    if (updatedData.name && updatedData.name.trim() === '') {
      return ResponseService.badRequest(res, { message: 'Platform name cannot be empty' });
    }

    // Filter out empty fields from updatedData before sending to the database
    const filteredData = Object.fromEntries(
      Object.entries(updatedData).filter(([key, value]) => value !== null && value !== undefined && value !== '')
    );

    // If no valid data remains after filtering, return an error
    if (Object.keys(filteredData).length === 0) {
      return ResponseService.badRequest(res, { message: 'No valid data provided for update' });
    }

    // Update the platform in the database
    const plateforme = await Plateforme.findByIdAndUpdate(plateformeId, filteredData, { new: true });

    if (!plateforme) {
      return ResponseService.notFound(res, { message: 'Platform not found' });
    }

    return ResponseService.success(res, { message: 'Platform successfully updated', plateforme });
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
