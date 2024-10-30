const PlateformeService = require('../services/plateforme.service');

async function createPlateforme(req, res) {
  const response = await PlateformeService.createPlateforme(req, res);
  return response;
}

async function updatePlateforme(req, res) {
  const response = await PlateformeService.updatePlateforme(req, res);
  return response;
}

async function deletePlateforme(req, res) {
  const response = await PlateformeService.deletePlateforme(req, res);
  return response;
}

async function listPlateformes(req, res) {
  const response = await PlateformeService.listPlateformes(req, res);
  return response;
}

module.exports = {
  createPlateforme,
  updatePlateforme,
  deletePlateforme,
  listPlateformes,
};
