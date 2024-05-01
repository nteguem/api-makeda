const GroupService = require('../services/group.service');
const ResponseService = require('../services/response.service');

async function createGroup(req, res) {
  const groupData = req.body;
  const response = await GroupService.createGroup(groupData);
  if (response.success) {
    return ResponseService.created(res, { message: response.message });
  } else {
    return ResponseService.internalServerError(res, { error: response.error });
  }
}

async function updateGroup(req, res) {
  const groupId = req.query.id;
  const updatedData = req.body;
  const response = await GroupService.updateGroup(groupId, updatedData);
  if (response.success) {
    return ResponseService.success(res, { message: response.message, group: response.group });
  } else {
    if (response.error === 'Groupe non trouvé') {
      return ResponseService.notFound(res, { message: response.error });
    } else {
      return ResponseService.internalServerError(res, { error: response.error });
    }
  }
}

async function deleteGroup(req, res) {
  const groupId = req.query.id;
  const response = await GroupService.deleteGroup(groupId);
  if (response.success) {
    return ResponseService.success(res, { message: response.message });
  } else {
    if (response.error === 'Groupe non trouvé') {
      return ResponseService.notFound(res, { message: response.error });
    } else {
      return ResponseService.internalServerError(res, { error: response.error });
    }
  }
}

async function listGroups(req, res) {
  const response = await GroupService.listGroups();
  if (response.success) {
    return ResponseService.success(res, { groups: response.groups });
  } else {
    return ResponseService.internalServerError(res, { error: response.error });
  }
}

module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  listGroups,
}