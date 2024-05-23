const Account = require('../models/account.model');

async function createAccount(accountData) {
    try {
        const newAccount = new Account(accountData);
        await newAccount.save();
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
        const account = await Account.findByIdAndDelete(accountId);
        if (!account) {
            return { success: false, error: 'Compte non trouvé' };
        }
        return { success: true, message: 'Compte supprimé avec succès' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function listAccounts(service) {
    try {
        const query = service ? { service } : {};
        const accounts = await Account.find(query);
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
