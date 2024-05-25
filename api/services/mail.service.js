const nodemailer = require('nodemailer');

async function sendEmail(email, subject, content) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '', 
                pass: '' 
            }
        });

        const mailOptions = {
            from: '',
            to: email, 
            subject: subject, 
            text: content 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail envoyé : ', info.response);
        return { success: true, message: 'E-mail envoyé avec succès' };
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail : ', error);
        return { success: false, error: 'Erreur lors de l\'envoi de l\'e-mail' };
    }
}

module.exports = {
    sendEmail
};
