const { PDFDocument } = require('pdf-lib');
const { readFile, writeFile } = require('fs/promises');
const path = require('path');

async function fillPdfFields(inputPath, data, outputPath) {
    try {
        const resolvedInputPath = path.resolve(__dirname, inputPath);
        const pdfDoc = await PDFDocument.load(await readFile(resolvedInputPath));
        const form = pdfDoc.getForm();

        for (const fieldName in data) {
            const fieldValue = data[fieldName];
            try {
                const field = form.getFieldMaybe(fieldName);
                if (field) {
                    // Check if the field is a TextField
                    if (field.constructor.name === 'PDFTextField') {
                        field.setText(fieldValue);
                    } else {
                        console.log(`The field "${fieldName}" is not a text field.`);
                    }
                } else {
                    console.log(`The field "${fieldName}" does not exist in the form.`);
                }
            } catch (error) {
                console.log(`An error occurred while processing the field "${fieldName}":`, error.message);
            }
        }

        // Gérer les boutons radio pour la civilité
        const civility = data.civility;
        const civilityOptions = ['Monsieur', 'Madame', 'Autres'];
        if (civilityOptions.includes(civility)) {
            const radioField = form.getFieldMaybe(civility);
            if (radioField && radioField.constructor.name === 'PDFCheckBox') {
                radioField.check();
            } else {
                console.log(`The radio button for "${civility}" does not exist or is not a checkbox.`);
            }
        } else {
            console.log(`Invalid civility value: ${civility}`);
        }
        // Gérer les boutons radio pour le status matrimoniale
        const maritalStatus = data.maritalStatus;
        const maritalStatusOptions = ['Célibataire', 'Marié.e', 'Divorcé.e', 'Veuf.ve'];
        if (maritalStatusOptions.includes(maritalStatus)) {
            const radioField = form.getFieldMaybe(maritalStatus);
            if (radioField && radioField.constructor.name === 'PDFCheckBox') {
                radioField.check();
            } else {
                console.log(`The radio button for "${maritalStatus}" does not exist or is not a checkbox.`);
            }
        } else {
            console.log(`Invalid marital value: ${maritalStatus}`);
        }

        // Gérer les boutons radio pour l'objectif répond le placement envisagé
        const investmentObjective = data.investmentObjective;
        const investmentObjectiveOptions = ['Diversification du patrimoine', 'Revenus complémentaires', 'Transmission du patrimoine','Diversification de placement','Placement de trésorerie', 'Rendement', "Autres"];
        if (investmentObjectiveOptions.includes(investmentObjective)) {
            const radioField = form.getFieldMaybe(investmentObjective);
            if (radioField && radioField.constructor.name === 'PDFCheckBox') {
                radioField.check();
            } else {
                console.log(`The radio button for "${investmentObjective}" does not exist or is not a checkbox.`);
            }
        } else {
            console.log(`Invalid objective value: ${investmentObjective}`);
        }


        // Gérer les boutons radio pour financialMarketExperience
        const financialMarketExperience = data.financialMarketExperience;
        const financialMarketExperienceOptions = ['Oui', 'Non'];
        if (financialMarketExperienceOptions.includes(financialMarketExperience)) {
            const radioField = form.getFieldMaybe(financialMarketExperience);
            if (radioField && radioField.constructor.name === 'PDFCheckBox') {
                radioField.check();
            } else {
                console.log(`The radio button for "${financialMarketExperience}" does not exist or is not a checkbox.`);
            }
        } else {
            console.log(`Invalid financialMarketExperience value: ${financialMarketExperience}`);
        }


        // Gérer les boutons radio pour investmentHorizon
        const investmentHorizon = data.investmentHorizon;
        const investmentHorizonOptions = ['Court-terme', 'Moyen-terme', 'Long-terme'];
        if (investmentHorizonOptions.includes(investmentHorizon)) {
            const radioField = form.getFieldMaybe(investmentHorizon);
            if (radioField && radioField.constructor.name === 'PDFCheckBox') {
                radioField.check();
            } else {
                console.log(`The radio button for "${investmentHorizon}" does not exist or is not a checkbox.`);
            }
        } else {
            console.log(`Invalid investmentHorizon value: ${investmentHorizon}`);
        }

        // Gérer les boutons radio pour capitalOrigin
        const capitalOrigin = data.capitalOrigin;
        const capitalOriginOptions = ['épargne', 'crédit', 'cession d\'actifs', 'fonds propres', 'héritage familiale'];
        if (capitalOriginOptions.includes(capitalOrigin)) {
            const radioField = form.getFieldMaybe(capitalOrigin);
            if (radioField && radioField.constructor.name === 'PDFCheckBox') {
                radioField.check();
            } else {
                console.log(`The radio button for "${capitalOrigin}" does not exist or is not a checkbox.`);
            }
        } else {
            console.log(`Invalid capitalOrigin value: ${capitalOrigin}`);
        }

        // Rendre les champs en lecture seule
        form.getFields().forEach(field => {
            if (field.enableReadOnly) {
                field.enableReadOnly();
            } 
        });
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes, 'base64'); 
    } catch (err) {
        console.log('An error occurred:', err);
    }
}
module.exports = {
    fillPdfFields
};
