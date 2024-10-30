const mongoose = require('mongoose');
const Offer = require('./offer.model');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String,required: true },
  offers: [{ type: mongoose.Schema.Types.ObjectId, ref: Offer, required: true }],
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
