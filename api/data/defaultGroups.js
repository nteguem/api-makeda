const DefaultGroupNames = {
    GROUPE_PERSONNE_PHYSIQUE: 'Groupe Personne physique',
    GROUPE_PERSONNE_MORALE: 'Groupe Personne morale',
    GROUPE_GESTION_SOUS_MANDAT: 'Groupe Gestion sous Mandat',
    GROUPE_GESTION_COLLECTIVE: 'Groupe Gestion Collective',
    GROUPE_CONSEIL_FINANCIER: 'Groupe Conseil Financier',
    GROUPE_UTILISATEURS_AVEC_COMPTE: "Groupe d'utilisateurs avec au moins un compte",
    GROUPE_TOUS_LES_UTILISATEURS: "Groupe de tous les utilisateurs",
    GROUPE_FONCTIONNAIRE: 'Groupe Fonctionnaire/Salarié du secteur public',
    GROUPE_ETUDIANT: 'Groupe Etudiant',
    GROUPE_PLANTEUR: 'Groupe Planteur/Exploitant rural',
    GROUPE_SALARIE_PRIVE: 'Groupe Salarié du secteur privé',
    GROUPE_COMMERCANT: 'Groupe Commerçant et entrepreneur individuel',
    GROUPE_AGENT_INTERNATIONAL: 'Groupe Agent d’organismes internationaux',
    GROUPE_PROFESSION_LIBERALE: 'Groupe Profession Libérale',
    GROUPE_AUTRE: 'Groupe Autre',
};

const DefaultGroupDescriptions = {
    GROUPE_PERSONNE_PHYSIQUE: 'Groupe des utilisateurs individuels ou particuliers ayant ouvert un compte lié à un service.',
    GROUPE_PERSONNE_MORALE: 'Groupe des utilisateurs représentant des entités juridiques, telles que des entreprises ou des organisations ayant ouvert un compte lié à un service.',
    GROUPE_GESTION_SOUS_MANDAT: 'Groupe des utilisateurs ayant souscrit au service de gestion sous mandat.',
    GROUPE_GESTION_COLLECTIVE: 'Groupe des utilisateurs ayant souscrit au service de gestion collective.',
    GROUPE_CONSEIL_FINANCIER: 'Groupe des utilisateurs ayant souscrit au service de conseils financiers.',
    GROUPE_UTILISATEURS_AVEC_COMPTE: 'Groupe des utilisateurs ayant créé au moins un compte lié à un service.',
    GROUPE_TOUS_LES_UTILISATEURS: 'Groupe de tous ceux qui ont écrit au moins une fois au bot WhatsApp.',
    GROUPE_FONCTIONNAIRE: 'Groupe des fonctionnaires ou salariés du secteur public.',
    GROUPE_ETUDIANT: 'Groupe des étudiants.',
    GROUPE_PLANTEUR: 'Groupe des planteurs ou exploitants ruraux.',
    GROUPE_SALARIE_PRIVE: 'Groupe des salariés du secteur privé.',
    GROUPE_COMMERCANT: 'Groupe des commerçants et entrepreneurs individuels.',
    GROUPE_AGENT_INTERNATIONAL: 'Groupe des agents d’organismes internationaux.',
    GROUPE_PROFESSION_LIBERALE: 'Groupe des professions libérales.',
    GROUPE_AUTRE: 'Groupe des utilisateurs appartenant à d’autres catégories.',
};

const defaultGroups = Object.keys(DefaultGroupNames).map(key => ({
    name: DefaultGroupNames[key],
    description: DefaultGroupDescriptions[key],
}));

module.exports = { defaultGroups, DefaultGroupNames, DefaultGroupDescriptions };
