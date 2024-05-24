const DefaultGroupNames = {
    GROUPE_PERSONNE_PHYSIQUE: 'Groupe Personne physique',
    GROUPE_PERSONNE_MORALE: 'Groupe Personne morale',
    GROUPE_GESTION_SOUS_MANDAT: 'Groupe Gestion sous Mandat',
    GROUPE_GESTION_COLLECTIVE: 'Groupe Gestion Collective',
    GROUPE_CONSEIL_FINANCIER: 'Groupe Conseil Financier',
    GROUPE_UTILISATEURS_AVEC_COMPTE: "Groupe d'utilisateurs avec au moins un compte",
    GROUPE_TOUS_LES_UTILISATEURS: "Groupe de tous les utilisateurs",
};

const DefaultGroupDescriptions = {
    GROUPE_PERSONNE_PHYSIQUE: 'Groupe des utilisateurs individuels ou particuliers ayant ouvert un compte lié à un service.',
    GROUPE_PERSONNE_MORALE: 'Groupe des utilisateurs représentant des entités juridiques, telles que des entreprises ou des organisations ayant ouvert un compte lié à un service.',
    GROUPE_GESTION_SOUS_MANDAT: 'Groupe des utilisateurs ayant souscrit au service de gestion sous mandat.',
    GROUPE_GESTION_COLLECTIVE: 'Groupe des utilisateurs ayant souscrit au service de gestion collective.',
    GROUPE_CONSEIL_FINANCIER: 'Groupe des utilisateurs ayant souscrit au service de conseils financiers.',
    GROUPE_UTILISATEURS_AVEC_COMPTE: 'Groupe des utilisateurs ayant créé au moins un compte lié à un service.',
    GROUPE_TOUS_LES_UTILISATEURS: 'Groupe de tous ceux qui ont écrit au moins une fois au bot WhatsApp.',
};

const defaultGroups = Object.keys(DefaultGroupNames).map(key => ({
    name: DefaultGroupNames[key],
    description: DefaultGroupDescriptions[key],
}));

module.exports = { defaultGroups, DefaultGroupNames, DefaultGroupDescriptions };
