const ServiceCampaign = require('../services/campaign.service');
const ResponseService = require('../services/response.service');

async function createCampaign(req, res, client) {
  const campaignData = req.body;
  const response = await ServiceCampaign.createCampaign(campaignData, client);
  if (response.success) {
    return ResponseService.created(res, { message: response.message });
  } else {
    return ResponseService.internalServerError(res, { error: response.error });
  }
}

async function updateCampaign(req, res, client) {
  const campaignId = req.query.id;
  const updatedData = req.body;
  const response = await ServiceCampaign.updateCampaign(campaignId, updatedData, client);
  if (response.success) {
    return ResponseService.success(res, { message: response.message, campaign: response.campaign });
  } else {
    if (response.error === 'Campagne non trouvée') {
      return ResponseService.notFound(res, { message: response.error });
    } else {
      return ResponseService.internalServerError(res, { error: response.error });
    }
  }
}

async function deleteCampaign(req, res, client) {
  const campaignId = req.query.id;
  const response = await ServiceCampaign.deleteCampaign(campaignId,client);
  if (response.success) {
    return ResponseService.success(res, { message: response.message });
  } else {
    if (response.error === 'Campagne non trouvée') {
      return ResponseService.notFound(res, { message: response.error });
    } else {
      return ResponseService.internalServerError(res, { error: response.error });
    }
  }
}

async function listCampaigns(req, res, client) {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const type = req.query.type;

  const response = await ServiceCampaign.listCampaigns({ type, limit, offset }, client);

  if (response.success) {
    return ResponseService.success(res, { campaigns: response.campaigns, total: response.total });
  } else {
    return ResponseService.internalServerError(res, { error: response.error });
  }
}

module.exports = {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listCampaigns,
};
