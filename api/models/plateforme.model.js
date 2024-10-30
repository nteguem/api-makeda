const mongoose = require('mongoose');

const plateformeSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  description: { type: String,required: [true, 'Description is required'] },
});


const Plateforme = mongoose.model('Plateforme', plateformeSchema);

module.exports = Plateforme;
