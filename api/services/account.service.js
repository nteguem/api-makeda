const Account = require('../models/account.model');
const User = require('../models/user.model');
const { DefaultGroupNames } = require("../data/defaultGroups");
const {addUserToGroupByPhoneNumber} = require("./group.service")
const {sendMessageToNumber} = require('../helpers/whatsApp/whatsappMessaging')

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
        return { success: false, error: error.message };
    }
}

async function deleteAccount(accountId) {
    try {

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

        const accounts = await Account.find(query).populate('user');

        const totalAccounts = accounts.length;
        const totalVerified = accounts.filter(account => account.verified === 'approved').length;
        const totalPending = accounts.filter(account => account.verified === 'pending').length;
        const totalRejected = accounts.filter(account => account.verified === 'rejected').length;

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
        return { success: false, error: error.message };
    }
}


module.exports = {
    createAccount,
    updateAccount,
    deleteAccount,
    listAccounts
};
