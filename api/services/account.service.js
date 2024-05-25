const Account = require('../models/account.model');
const User = require('../models/user.model');
const { DefaultGroupNames } = require("../data/defaultGroups");
const {addUserToGroupByPhoneNumber} = require("./group.service")

async function createAccount(accountData) {
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
            DefaultGroupNames.GROUPE_PERSONNE_PHYSIQUE
        ];

        for (const group of groups) {
            await addUserToGroupByPhoneNumber(group, userPhoneNumber);
        } 

        return { success: true, message: 'Compte créé avec succès' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}


async function updateAccount(accountId, updatedData) {
    try {
        const account = await Account.findByIdAndUpdate(accountId, updatedData, { new: true });
        if (!account) {
            return { success: false, error: 'Compte non trouvé' };
        }
        return { success: true, message: 'Compte mis à jour avec succès', account };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteAccount(accountId) {
    try {
        // await sendMessageToNumber(client,phoneNumber, stepMessage + additionalMessage);

        const account = await Account.findByIdAndDelete(accountId);
        if (!account) {
            return { success: false, error: 'Compte non trouvé' };
        }
        return { success: true, message: 'Compte supprimé avec succès' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function listAccounts(service, phoneNumber) {
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
                return { success: true, accounts: [] };
            }
        }

        const accounts = await Account.find(query).populate('user');
        return { success: true, accounts };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    createAccount,
    updateAccount,
    deleteAccount,
    listAccounts
};
