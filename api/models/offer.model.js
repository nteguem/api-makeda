const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'] },
    description: { type: String,required: [true, 'Description is required'] },
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;