const GroupService = require('../services/group.service');
const ResponseService = require('../services/response.service');
const {deleteCSVFile} = require('../services/generateCsv.service')
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
    const groupId = req.query.id;
    if (groupId) {
      try {
        const response = await GroupService.getUsersInGroup(groupId);
        if (response.success) {
          return ResponseService.success(res, { users: response.users, groupName: response.groupName });
        } else {
          return ResponseService.internalServerError(res, { error: response.error });
        }
      } catch (error) {
        console.error('Error getting users in group:', error);
        return ResponseService.internalServerError(res, { error: 'Error getting users in group' });
      }
    } else {
      const response = await GroupService.listGroups();
      if (response.success) {
        return ResponseService.success(res, { groups: response.groups });
      } else {
        return ResponseService.internalServerError(res, { error: response.error });
      }
    }
  }

async function generateAndDownloadCSV(req, res) {
    const {id} = req.query
    try {
      const filePath = await GroupService.download(id);
      res.download(filePath, filePath, (err) => {
        if (err) {
          console.error('Error downloading CSV file:', err);
          return ResponseService.internalServerError(res, { error: 'Error downloading CSV file' });
        } else {
          console.log('CSV file downloaded successfully');
          deleteCSVFile(filePath);
        }
      });
    } catch (error) {
      console.error('Error generating CSV file:', error);
      return ResponseService.internalServerError(res, { error: 'Error generating CSV file' });
    }
  }

module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  listGroups,
  generateAndDownloadCSV
}