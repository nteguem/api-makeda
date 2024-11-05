const PaymentIntent = require('../models/paymentIntent.model');
const logger = require("../helpers/logger")

async function createPaymentIntent(data, client) {
    try {
        const paymentIntent = new PaymentIntent(data);
        await paymentIntent.save();

        return { success: true, message: 'Payment intent créé avec succès' };
    } catch (error) {
        logger(client).error('Error createPaymentIntent:', error);
        return { success: false, error: error.message };
    }
}

async function updatePaymentIntent(paymentIntentId, updatedData, client) {
    try {
        const paymentIntent = await PaymentIntent.findByIdAndUpdate(paymentIntentId, updatedData, { new: true });
        
        if (!paymentIntent) {
            return { success: false, error: 'Payment intent non trouvé' };
        }

        return { success: true, message: 'Payment intent mis à jour avec succès', paymentIntent };
    } catch (error) {
        logger(client).error('Error updatePaymentIntent:', error);
        return { success: false, error: error.message };
    }
}

async function deletePaymentIntent(paymentIntentId, client) {
    try {
        const paymentIntent = await PaymentIntent.findByIdAndDelete(paymentIntentId);

        if (!paymentIntent) {
            return { success: false, error: 'Payment intent non trouvé' };
        }

        return { success: true, message: 'Payment intent supprimé avec succès' };
    } catch (error) {
        logger(client).error('Error deletePaymentIntent:', error);
        return { success: false, error: error.message };
    }
}

async function listPaymentIntents(service, client, limit = 10, offset = 0) {
    try {
        const query = {};
        if (service) {
            query.service = service;
        }

        const paymentIntents = await PaymentIntent.find(query).populate('account').skip(offset).limit(limit);
        const total = await PaymentIntent.countDocuments(query);

        return { success: true, paymentIntents, total };
    } catch (error) {
        logger(client).error('Error listPaymentIntents:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    createPaymentIntent,
    updatePaymentIntent,
    deletePaymentIntent,
    listPaymentIntents
};
