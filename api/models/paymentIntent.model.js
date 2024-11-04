const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentIntentSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    description: {
        type: String,
        maxlength: 255
    },
    referenceId: {
        type: String,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

paymentIntentSchema.pre('save', function (next) {
    if (!this.referenceId) {
        this.referenceId = `INTENT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    next();
});

const PaymentIntent = mongoose.model('PaymentIntent', paymentIntentSchema);

module.exports = PaymentIntent;
