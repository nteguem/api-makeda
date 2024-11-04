const PaymentIntentService = require('../services/paymentIntent.service');
const ResponseService = require('../services/response.service');

async function createPaymentIntent(req, res, client) {
    const data = req.body;
    const response = await PaymentIntentService.createPaymentIntent(data, client);

    if (response.success) {
        return ResponseService.created(res, { message: response.message });
    } else {
        return ResponseService.internalServerError(res, { error: response.error });
    }
}

async function updatePaymentIntent(req, res, client) {
    const paymentIntentId = req.query.id;
    const updatedData = req.body;
    const response = await PaymentIntentService.updatePaymentIntent(paymentIntentId, updatedData, client);

    if (response.success) {
        return ResponseService.success(res, { message: response.message, paymentIntent: response.paymentIntent });
    } else {
        if (response.error === 'Payment intent non trouvé') {
            return ResponseService.notFound(res, { message: response.error });
        } else {
            return ResponseService.internalServerError(res, { error: response.error });
        }
    }
}

async function deletePaymentIntent(req, res, client) {
    const paymentIntentId = req.query.id;
    const response = await PaymentIntentService.deletePaymentIntent(paymentIntentId, client);

    if (response.success) {
        return ResponseService.success(res, { message: response.message });
    } else {
        if (response.error === 'Payment intent non trouvé') {
            return ResponseService.notFound(res, { message: response.error });
        } else {
            return ResponseService.internalServerError(res, { error: response.error });
        }
    }
}

async function listPaymentIntents(req, res, client) {
    const { service, limit = 10, offset = 0 } = req.query;
    const response = await PaymentIntentService.listPaymentIntents(service, client, parseInt(limit), parseInt(offset));

    if (response.success) {
        return ResponseService.success(res, { paymentIntents: response.paymentIntents, total: response.total });
    } else {
        return ResponseService.internalServerError(res, { error: response.error });
    }
}

module.exports = {
    createPaymentIntent,
    updatePaymentIntent,
    deletePaymentIntent,
    listPaymentIntents
};
