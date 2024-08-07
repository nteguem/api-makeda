const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  //same fields
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: String,
    required: true
  },
  verified: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason:{
    type: String,
  },
  accountType: {
    type: String,
    enum: ['personne_morale', 'personne_physique'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fiche: {
    type: String,
    required: true
  },
  FCP: {
    type: String,
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  niu: {
    type: String,
    // required: true
  },
  investmentObjective: {
    type: String,
    // enum: ['Diversification du patrimoine', 'Revenus complémentaires', 'Transmission du patrimoine', 'Rendement', 'Autres'],
    required: true
  },
  financialMarketExperience: {
    type: String,
    // enum: ['oui', 'non'],
    required: true
  },
  financialMarketExperienceNumber:
  {
    type: String,
  },
  investmentHorizon: {
    type: String,
    // enum: ['Court-terme', 'Moyen-terme', 'Long-terme'],
    required: true
  },
  riskLevel: {
    type: String,
    required: true
  },
  financialSituationLastThreeYears: {
    type: String,
    required: true
  },
  bankDomiciliation: {
    type: String,
    required: true
  },
  ribFile: {
    type: String,
    required: true
  },
  taxNumberCertificateFile: {
    type: String,
  },
  civility: {
    type: String,
    enum: ['Monsieur', 'Madame', 'Autre'],
    // required: true
  },
  typeProductFCP: {
    type: String,
  },
  initialAmountFCP: {
    type: String,
  },
  initialAmountLetterFCP: {
    type: String,
  },
  methodPaiementFCP:{
    type: String,
  },
  frequenceFCP:{
    type: String,
  },
  versementFCP:{
    type: String,
  },
  
  //specific fields  accountType = personne physique
  dateOfBirth: {
    type: Date,
  },
  placeOfBirth: {
    type: String,
  },
  nationality: {
    type: String,
  },
  countryOfResidence:{
    type: String,
  },
  cityOfResidence:{
    type: String,
  },
  profession: {
    type: String,
  },
  typeProfession: {
    type: String,
  },
  employerName: {
    type: String,
  },

  identityDocument: {
    type: String,
  },
  typeDocument: {
    type: String,
  },
  numberDocument: {
    type: String,
  },
  issuedDateDocument:{
    type: String,
  },
  expiryDateDocument:{
    type: String,
  },
  placeIssueDocument:{
    type: String,
  },
  maritalStatus: {
    type: String,
    // enum: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'],
  },
  conjoint: {
    type: String,
  },
  emergencyContacts: {
    type: String,
  },
  capitalOrigin: {
    type: String,
    enum: ['épargne', 'crédit', 'cession d\'actifs', 'fonds propres', 'héritage familiale', 'autres'],
  },

  incomeProof: {
    type: String,
  },
  //specific fields  accountType = personne morale
  socialName: {
    type: String,
  },
  statutesCopyFile: {
    type: String,
  },
  incorporationCountry: {
    type: String,
  },
  commerceRegistryNumber: {
    type: String,
  },
  RCCMFile: {
    type: String,
  },
  incorporationDate: {
    type: Date,
  },
  actingAs: {
    type: String,
    // required: true
  },
  investigationHistory: {
    type: String,
    // enum: ['oui', 'non'],
  },
  mainActivity: {
    type: String,
  },
  secondaryActivity: {
    type: String,
  },
  natureActivity: {
    type: String,
  },
  receivesSubsidies: {
    type: String,
  },
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
