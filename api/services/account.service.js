const Account = require('../models/account.model');
const User = require('../models/user.model');
const { DefaultGroupNames } = require("../data/defaultGroups");
const {addUserToGroupByPhoneNumber} = require("./group.service")
const {sendMessageToNumber} = require('../views/whatsApp/whatsappMessaging')
const logger = require("../helpers/logger")

async function createAccount(accountData,client) {
    try {
        const newAccount = new Account(accountData);
        await newAccount.save();

        const user = await User.findById(accountData.user);
        const userPhoneNumber = user.phoneNumber;

        const groups = [
            DefaultGroupNames.GROUPE_UTILISATEURS_AVEC_COMPTE,
            accountData.service === "Conseil Financier" ? DefaultGroupNames.GROUPE_CONSEIL_FINANCIER :
            accountData.service === "Gestion sous Mandat" ? DefaultGroupNames.GROUPE_GESTION_SOUS_MANDAT :
            DefaultGroupNames.GROUPE_GESTION_COLLECTIVE,
            accountData.accountType === "personne_morale" ? DefaultGroupNames.GROUPE_PERSONNE_MORALE :
            DefaultGroupNames.GROUPE_PERSONNE_PHYSIQUE,
            accountData.typeProfession === 'Fonctionnaire/Salarié du secteur public' ? DefaultGroupNames.GROUPE_FONCTIONNAIRE :
            accountData.typeProfession === 'Etudiant' ? DefaultGroupNames.GROUPE_ETUDIANT :
            accountData.typeProfession === 'Planteur/Exploitant rural' ? DefaultGroupNames.GROUPE_PLANTEUR :
            accountData.typeProfession === 'Salarié du secteur privé' ? DefaultGroupNames.GROUPE_SALARIE_PRIVE :
            accountData.typeProfession === 'Commerçant et entrepreneur individuel' ? DefaultGroupNames.GROUPE_COMMERCANT :
            accountData.typeProfession === 'Agent d’organismes internationaux' ? DefaultGroupNames.GROUPE_AGENT_INTERNATIONAL :
            accountData.typeProfession === 'Profession Libérale' ? DefaultGroupNames.GROUPE_PROFESSION_LIBERALE :
            DefaultGroupNames.GROUPE_AUTRE
        ];

        for (const group of groups) {
            await addUserToGroupByPhoneNumber(group, userPhoneNumber);
        } 

        return { success: true, message: 'Compte créé avec succès' };
    } catch (error) {
        logger(client).error('Error createAccount:', error);
        return { success: false, error: error.message };
    }
}


async function updateAccount(accountId, updatedData,client) {
    try {       
        const account = await Account.findByIdAndUpdate(accountId, updatedData, { new: true });
        const user = await User.findById(account.user);
        const userPhoneNumber = user.phoneNumber;
        if (!account) {
            return { success: false, error: 'Compte non trouvé' };
        }
        if(updatedData.verified === "rejected")
            {
                await sendMessageToNumber(client,userPhoneNumber,`*Rejet de votre demande de création de compte*\n\n${account.rejectionReason}`);
            }
            else
            {
                await sendMessageToNumber(client, userPhoneNumber,  
                    `*Approbation de votre demande de création de compte*\n\n 1-compte : ${account.accountType === "personne_physique" ? `${account.name} ${account.firstName}` : account.socialName}\n 2-service : ${account.service}\n 3-type : ${account.accountType}\n\n L'équipe Makeda Asset Management vous contactera rapidement pour assurer le suivi de votre compte.`
                );
            }
        return { success: true, message: 'Compte mis à jour avec succès', account };
    } catch (error) {
        logger(client).error('Error updateAccount:', error);
        return { success: false, error: error.message };
    }
}

async function deleteAccount(accountId,client) {
    try {

        const account = await Account.findByIdAndDelete(accountId);
        if (!account) {
            return { success: false, error: 'Compte non trouvé' };
        }
        return { success: true, message: 'Compte supprimé avec succès' };
    } catch (error) {
        logger(client).error('Error deleteAccount:', error);
        return { success: false, error: error.message };
    }
}

async function listAccounts(service, phoneNumber, client, limit = 10, offset = 0) {
    try {
      let query = {};
      
      // Appliquer le filtre par service
      if (service) {
        query.service = service;
      }
      
      // Appliquer le filtre par numéro de téléphone
      if (phoneNumber) {
        const user = await User.findOne({ phoneNumber });
        if (user) {
          query.user = user._id;
        } else {
          return {
            success: true,
            accounts: [],
            total: 0 // Total égal à 0 si aucun utilisateur n'est trouvé
          };
        }
      }
  
      // Récupérer les comptes avec pagination
      const accounts = await Account.find(query).populate('user').skip(offset).limit(limit);
  
      // Calculer le total des comptes correspondant à la requête
      const total = await Account.countDocuments(query);
      
      return {
        success: true,
        accounts,
        total // Retourner seulement le total
      };
    } catch (error) {
      logger(client).error('Error listAccounts:', error);
      return { success: false, error: error.message };
    }
  }
  
  async function statsAccounts(service, phoneNumber, client, limit = 10, offset = 0) {
    try {
      let query = {};
  
      if (service) {
        query.service = service;
      }
  
      if (phoneNumber) {
        const user = await User.findOne({ phoneNumber });
        if (user) {
          query.user = user._id;
        } else {
          return {
            success: true,
            accounts: [],
            totals: {
              totalAccounts: 0,
              totalVerified: 0,
              totalPending: 0,
              totalRejected: 0
            }
          };
        }
      }
  
      // Récupérer les comptes avec pagination
      const accounts = await Account.find(query).populate('user').skip(offset).limit(limit);
  
      // Calculer les totaux
      const totalAccounts = await Account.countDocuments(query);
      const totalVerified = await Account.countDocuments({ ...query, verified: 'approved' });
      const totalPending = await Account.countDocuments({ ...query, verified: 'pending' });
      const totalRejected = await Account.countDocuments({ ...query, verified: 'rejected' });
  
      return {
        success: true,
        accounts,
        totals: {
          totalAccounts,
          totalVerified,
          totalPending,
          totalRejected
        }
      };
    } catch (error) {
      logger(client).error('Error listAccounts:', error);
      return { success: false, error: error.message };
    }
  }
  


module.exports = {
    createAccount,
    updateAccount,
    deleteAccount,
    listAccounts,
    statsAccounts
};
