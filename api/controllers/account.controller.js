const AccountService = require('../services/account.service');
const ResponseService = require('../services/response.service');

async function createAccount(req, res,client) {
    const accountData = req.body;
    const response = await AccountService.createAccount(accountData,client);
    if (response.success) {
        return ResponseService.created(res, { message: response.message });
    } else {
        return ResponseService.internalServerError(res, { error: response.error });
    }
}

async function updateAccount(req, res, client) {
    const accountId = req.query.id;
    const updatedData = req.body;
    const response = await AccountService.updateAccount(accountId, updatedData,client);
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

async function deleteAccount(req, res,client) {
    const accountId = req.query.id;
    const response = await AccountService.deleteAccount(accountId,client);
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

async function listAccounts(req, res,client) {
    const { service, phoneNumber } = req.query;
    const response = await AccountService.listAccounts(service, phoneNumber,client);
    if (response.success) {
        return ResponseService.success(res, { accounts: response.accounts,totals:response.totals });
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
