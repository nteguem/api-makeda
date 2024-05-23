const AccountService = require('../services/account.service');
const ResponseService = require('../services/response.service');

async function createAccount(req, res) {
    const accountData = req.body;
    const response = await AccountService.createAccount(accountData);
    if (response.success) {
        return ResponseService.created(res, { message: response.message });
    } else {
        return ResponseService.internalServerError(res, { error: response.error });
    }
}

async function updateAccount(req, res) {
    const accountId = req.query.id;
    const updatedData = req.body;
    const response = await AccountService.updateAccount(accountId, updatedData);
    if (response.success) {
        return ResponseService.success(res, { message: response.message, account: response.account });
    } else {
        if (response.error === 'Compte non trouvé') {
            return ResponseService.notFound(res, { message: response.error });
        } else {
            return ResponseService.internalServerError(res, { error: response.error });
        }
    }
}

async function deleteAccount(req, res) {
    const accountId = req.query.id;
    const response = await AccountService.deleteAccount(accountId);
    if (response.success) {
        return ResponseService.success(res, { message: response.message });
    } else {
        if (response.error === 'Compte non trouvé') {
            return ResponseService.notFound(res, { message: response.error });
        } else {
            return ResponseService.internalServerError(res, { error: response.error });
        }
    }
}

async function listAccounts(req, res) {
    const service = req.query.service;
    const response = await AccountService.listAccounts(service);
    if (response.success) {
        return ResponseService.success(res, { accounts: response.accounts });
    } else {
        return ResponseService.internalServerError(res, { error: response.error });
    }
}

module.exports = {
    createAccount,
    updateAccount,
    deleteAccount,
    listAccounts
};
