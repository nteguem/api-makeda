const Group = require('../models/group.model');

async function createGroup(groupData) {
  try {
    const newGroup = new Group(groupData);
    await newGroup.save();
    return { success: true, message: 'Groupe créé avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateGroup(groupId, updatedData) {
  try {
    const group = await Group.findByIdAndUpdate(groupId, updatedData, { new: true });
    if (!group) {
      return { success: false, error: 'Groupe non trouvé' };
    }
    return { success: true, message: 'Groupe mis à jour avec succès', group };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteGroup(groupId) {
  try {
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      return { success: false, error: 'Groupe non trouvé' };
    }
    return { success: true, message: 'Groupe supprimé avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function listGroups() {
  try {
    const groups = await Group.find();
    return { success: true, groups };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  listGroups,
};
