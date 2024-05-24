const Group = require('../models/group.model');
const User = require('../models/user.model');
const { generateAndDownloadCSV } = require('./generateCsv.service');

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
    const groups = await Group.find().populate('members');
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

    const formattedUsers = result.users.map(user => {
      const { _id, password, createdAt, updatedAt, __v, ...rest } = user._doc;
      return rest;
    });
    return generateAndDownloadCSV(formattedUsers, result.groupName)
  } catch (error) {
    throw new Error('Error generating CSV file', error);
  }
}

async function addUserToGroupByPhoneNumber(groupName, phoneNumber) {
  try {
    // Recherche de l'utilisateur par numéro de téléphone
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }
    // Recherche du groupe par son nom
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return { success: false, error: 'Groupe non trouvé' };
    }

    // Vérifie si l'utilisateur est déjà membre du groupe
    const isMember = group.members.includes(user._id);
    if (isMember) {
      return { success: false, error: 'L\'utilisateur est déjà membre du groupe' };
    }

    // Ajoute l'utilisateur à la liste des membres du groupe
    group.members.push(user._id);
    await group.save();

    return { success: true, message: 'Utilisateur ajouté au groupe avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


async function ensureDefaultGroupsExist() {
  const defaultGroups = [
    { 
        name: 'Groupe Personne physique', 
        description: 'Groupe des utilisateurs individuels ou particuliers ayant ouvert un compte lié à un service.' 
    },
    { 
        name: 'Groupe Personne morale', 
        description: 'Groupe des utilisateurs représentant des entités juridiques, telles que des entreprises ou des organisations ayant ouvert un compte lié à un service.' 
    },
    { 
        name: 'Groupe Gestion sous Mandat', 
        description: 'Groupe des utilisateurs ayant souscrit au service de gestion sous mandat.' 
    },
    { 
        name: 'Groupe Gestion Collective', 
        description: 'Groupe des utilisateurs ayant souscrit au service de gestion collective.' 
    },
    { 
        name: 'Groupe Conseil Financier', 
        description: 'Groupe des utilisateurs ayant souscrit au service de conseils financiers.' 
    },
    { 
        name: "Groupe d'utilisateurs avec au moins un compte", 
        description: 'Groupe des utilisateurs ayant créé au moins un compte lié à un service.' 
    },
    { 
        name: "Groupe de tous les utilisateurs", 
        description: 'Groupe de tous ceux qui ont écrit au moins une fois au bot WhatsApp.' 
    }
];

  try {
    for (const defaultGroup of defaultGroups) {
      const groupExists = await Group.findOne({ name: defaultGroup.name });
      if (!groupExists) {
        await createGroup(defaultGroup);
        console.log(`Default group ${defaultGroup.name} created.`);
      }
    }
  } catch (error) {
    console.error('Error ensuring default groups exist:', error.message);
  }
}


module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  listGroups,
  getUsersInGroup,
  download,
  ensureDefaultGroupsExist,
  addUserToGroupByPhoneNumber
};
