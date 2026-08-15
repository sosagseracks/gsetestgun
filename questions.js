// questions.js
// Liste des questions du quiz GSE.
// type "simple"  -> réponse courte (1-2 mots), tolère fautes de frappe/accents.
//                    "answer" peut être un texte OU un tableau de réponses acceptées.
// type "keyword" -> réponse plus longue, on vérifie qu'une majorité des mots-clés sont présents
// type "cite"    -> il faut citer au moins n éléments parmi une liste ("names")
//
// Le bot tire 20 questions au hasard parmi cette liste à chaque participation
// (voir QUIZ_QUESTION_COUNT dans index.js), donc l'ordre et le sous-ensemble
// changent à chaque fois.

const QUESTIONS = [
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
  { q: "L'architecte Nocta mesure la taille de la tour Eiffel, vrai ou faux ?", type: "simple", answer: "Vrai" },
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
  {
    q: "Quel est ton HG préféré ?",
    type: "cite",
    names: ["Sosa", "Rocks", "Dzcu", "Talion", "Neb", "Ani", "Échographie", "Suzuya", "Warka", "Noshi"],
    n: 1,
  },
];

module.exports = QUESTIONS;
