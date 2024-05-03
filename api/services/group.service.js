const Group = require('../models/group.model');
const {generateAndDownloadCSV} = require('./generateCsv.service');

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
        const groups = await Group.find({}, { __v:0 });
        return { success: true, groups };
    } catch (error) {
        return { success: false, error: error.message };
    }
}


async function getUsersInGroup(groupId) {
    try {
      const group = await Group.findById(groupId).populate('members');
      if (!group) {
        return { success: false, error: 'Groupe non trouvé' };
      }
      const groupName = group.name;
      const users = group.members;
      return { success: true, users, groupName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  

  async function download(idGroup) {
    try {
      const result = await getUsersInGroup(idGroup);
  
      const  formattedUsers = result.users.map(user => {
        const { _id, password,createdAt,updatedAt,__v, ...rest } = user._doc; 
        return rest;
      });
    return generateAndDownloadCSV(formattedUsers,result.groupName)
    } catch (error) {
      throw new Error('Error generating CSV file', error);
    }
  }
  


module.exports = {
    createGroup,
    updateGroup,
    deleteGroup,
    listGroups,
    getUsersInGroup,
    download
};
