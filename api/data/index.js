const menuContent = `
1️⃣ Découvrir Makeda Asset Management, tapez 1.
2️⃣ Nos Services, tapez 2.
3️⃣ Ouvrir un compte, tapez 3.
4️⃣ Parrainnage, tapez 4.
5️⃣ Simulez vos gains, tapez 5.
6️⃣ Mon compte, tapez 6.
    
Votre avenir financier, notre expertise personnalisée 🤝`;

const menuData = (name, isWelcome) => {
  return isWelcome
    ? `📚 Votre menu principal :
  
${menuContent}`
    : `Salut ${name},\n\n Bienvenue chez Makeda, notre engagement envers nos investisseurs se concrétise par des investissements dans les secteurs qui propulsent l'économie de l'avenir.

${menuContent}`;
};

module.exports = { menuData };
