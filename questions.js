// questions.js
// Liste des questions des quiz GSE.
// type "simple"  -> réponse courte (1-2 mots), tolère fautes de frappe/accents.
//                    "answer" peut être un texte OU un tableau de réponses acceptées.
// type "keyword" -> réponse plus longue, on vérifie qu'une majorité des mots-clés sont présents
// type "cite"    -> il faut citer au moins n éléments parmi une liste ("names")

const QUIZ1 = [
  { q: "Que signifie TO ?", type: "simple", answer: "Timeout" },
  { q: "Que signifie GSE ?", type: "keyword", answer: "Gestion Serveur" },
  { q: "Que faire en cas de doute sur une sanction ?", type: "keyword", answer: "dm un HG" },
  {
    q: "Cite 3 HG",
    type: "cite",
    names: ["Neb", "Talion", "Rocks", "Sosa", "Échographie", "Suzuya", "Warka", "Noshi", "Ani", "Skyminex", "Nocta"],
    n: 3,
  },
  { q: "Quelle est l'utilité des tickets owners ?", type: "keyword", answer: "Pouvoir se plaindre d'un contrib" },
  { q: "Quelle est l'utilité des tickets BL ?", type: "keyword", answer: "Pouvoir demander à être unBL" },
  { q: "À quoi servent les formations ?", type: "keyword", answer: "Former quelqu'un à entrer en GSE" },
  { q: "À quoi servent les entretiens ?", type: "keyword", answer: "Voir le profil de quelqu'un avant qu'il rentre en GSE" },
  { q: "Quelle est l'utilité des supports vocaux ?", type: "keyword", answer: "Pouvoir régler un problème oralement" },
  { q: "Rocks Mog All, Vrai ou Faux ?", type: "simple", answer: "Vrai" },
  { q: "Plus Tony ou Sosa ?", type: "simple", answer: "Sosa" },
  { q: "À quoi servent les logs ?", type: "keyword", answer: "Voir les actes de modération ou les actions faites sur Shibuya" },
  { q: "Que signifie « grab » ?", type: "keyword", answer: "Ramenez quelqu'un en gestion" },
  { q: "Que signifie BL ?", type: "simple", answer: "Blacklist" },
  { q: "À quoi sert le RC ?", type: "simple", answer: "Recrutement" },
  { q: "À quoi sert le CR ?", type: "keyword", answer: "Compte Rendu" },
  { q: "Que signifie BLR ?", type: "keyword", answer: "Blacklist Role" },
  { q: "Que signifie RC ?", type: "simple", answer: "Recrutement" },
  { q: "À partir de quel grade peut-on faire une formation ?", type: "simple", answer: "Confirmé" },
  { q: "Si tu as un problème en gestion, vers quel grade HG te réfères-tu ?", type: "keyword", answer: "Chef Gestion" },
];

// Quiz 2 : culture GSE. Se déclenche quand la personne envoie "2" en DM.
const QUIZ2 = [
  { q: "Qui a le plus gros paff, Rocks ou Sosa ?", type: "simple", answer: "Sosa" },
  { q: "Qui pourrait mog toute ta hiérarchie ?", type: "simple", answer: "Rocks" },
  { q: "Qui est le chef gestion le plus beau ?", type: "simple", answer: "Suzuya" },
  { q: "Quel est le HG ayant le plus de sleepcall au compteur ?", type: "simple", answer: "Skyminex" },
  { q: "Qui est le GSE ayant fait le record de points ?", type: "simple", answer: "Laxycra" },
  { q: "Qui est le GSE le plus drôle : Ays, Noshi ou Calomnie ?", type: "simple", answer: "Ays" },
  { q: "Quel HG se fait laminer sur FIFA H24 ?", type: "simple", answer: "Warka" },
  { q: "Qui est la chèvre dans le zoo de la GSE ?", type: "simple", answer: ["Solohess", "solo hess"] },
  { q: "Quel HG a le plus de fans (féminines) ?", type: "simple", answer: "Neb" },
  { q: "Quelle est l'origine des deux inspecteurs ?", type: "keyword", answer: "Marocain et Syrien" },
  { q: "Dans quel pays est actuellement Ani ?", type: "simple", answer: "Thaïlande" },
  { q: "De quel pays vient le Cartel ?", type: "simple", answer: ["Mexique", "Mexico"] },
  { q: "Comment s'appelle l'équipe des jails ?", type: "keyword", answer: "Brigade Fantôme" },
  { q: "Combien de jours la GSE a été top 1 jails d'affilé ?", type: "simple", answer: "24" },
  { q: "Comment s'appelle l'oiseau de Sosa ?", type: "simple", answer: ["Rloulou", "loulou"] },
  { q: "Que fait Nocta chaque weekend ?", type: "keyword", answer: "Il va en boîte" },
  { q: "Skyminex a-t-il déjà bu de l'eau avec un cure-dent en cam ? Vrai ou Faux", type: "simple", answer: "Vrai" },
  { q: "Talion aurait déjà hwi avec un hélicoptère. Vrai ou Faux ?", type: "simple", answer: "Faux" },
  { q: "Pourquoi Ani s'appelle Ani ?", type: "keyword", answer: "Pour Anakin Skywalker", ratio: 0.5 },
  { q: "Quel est le rappeur français ayant matrixé Rocks ?", type: "simple", answer: "Lagui" },
  { q: "Qui a développé les bots de la GSE ?", type: "simple", answer: "Skyminex" },
  { q: "Quel HG pourrait sortir avec un membre de ta famille ?", type: "simple", answer: "Nocta" },
  { q: "Qui a écrit le rap contre Warka au dernier roulette ?", type: "simple", answer: "Selima" },
  { q: "Quel HG a vu sa femme se faire BL gestion ?", type: "simple", answer: ["Échographie Cardiaque", "Écho", "Échographie"] },
  { q: "Zudo a décidé d'éradiquer la planète Terre, va-t-il y arriver ? Oui ou Non", type: "simple", answer: "Oui" },
  { q: "Quel HG a déjà ronflé en plein salon GSE ?", type: "simple", answer: ["Rocks", "Sosa"] },
  { q: "L'architecte Nocta mesure la taille de la tour Eiffel, vrai ou faux ?", type: "simple", answer: "Vrai" },
  {
    q: "Quel est ton HG préféré ?",
    type: "cite",
    names: ["Sosa", "Rocks", "Dzcu", "Talion", "Neb", "Ani", "Échographie", "Suzuya", "Warka", "Noshi"],
    n: 1,
  },
];

module.exports = { quiz1: QUIZ1, quiz2: QUIZ2 };
