// fuzzy.js
// Outils pour comparer les réponses des utilisateurs de façon "approximative"
// (fautes de frappe, accents manquants, majuscules, mots dans le désordre, etc.)

const STOPWORDS = new Set([
  "de", "des", "du", "le", "la", "les", "un", "une", "a", "à", "au", "aux",
  "en", "pour", "sur", "ce", "ces", "cette", "que", "qu", "qui", "dans",
  "et", "ou", "est", "il", "elle", "on", "tu", "vous", "nous", "je",
  "son", "sa", "ses", "avec", "par", "se", "ne", "pas", "être", "etre",
  "d", "l", "s", "j", "y"
]);

// Enlève les accents, la ponctuation, met en minuscule
function normalize(str) {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Distance de Levenshtein (nombre de modifications entre 2 mots)
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = temp;
    }
  }
  return dp[n];
}

// Est-ce que deux mots sont "assez proches" pour être considérés identiques ?
function isWordMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 3) return a === b;
  const dist = levenshtein(a, b);
  const threshold = maxLen <= 5 ? 1 : maxLen <= 8 ? 2 : 3;
  return dist <= threshold;
}

function keywordsOf(str) {
  return normalize(str)
    .split(" ")
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));
}

// Vérifie qu'une bonne partie des mots-clés attendus se retrouve dans la réponse
function keywordAnswerCheck(expected, userInput, ratio = 0.6) {
  const expKeywords = keywordsOf(expected);
  const userWords = normalize(userInput)
    .split(" ")
    .filter(Boolean);
  if (expKeywords.length === 0 || userWords.length === 0) return false;

  let matched = 0;
  for (const kw of expKeywords) {
    if (userWords.some((uw) => isWordMatch(kw, uw))) matched++;
  }
  return matched / expKeywords.length >= ratio;
}

// Pour des réponses courtes (1-2 mots) : contient / mot proche
function singleSimpleCheck(expected, userInput) {
  const e = normalize(expected);
  const u = normalize(userInput);
  if (!u) return false;
  if (u === e) return true;
  if (u.includes(e) || e.includes(u)) return true;
  // tolère les espaces en trop/en moins (ex: "time out" vs "timeout")
  const eNoSpace = e.replace(/\s+/g, "");
  const uNoSpace = u.replace(/\s+/g, "");
  if (isWordMatch(eNoSpace, uNoSpace)) return true;
  // sinon on compare mot à mot
  return e
    .split(" ")
    .filter(Boolean)
    .every((ew) => u.split(" ").some((uw) => isWordMatch(ew, uw)));
}

// "expected" peut être un texte unique OU un tableau de réponses acceptées
function simpleAnswerCheck(expected, userInput) {
  const alternatives = Array.isArray(expected) ? expected : [expected];
  return alternatives.some((alt) => singleSimpleCheck(alt, userInput));
}

// Vérifie qu'au moins n noms parmi la liste sont cités dans la réponse
function citeNCheck(namesList, userInput, n) {
  const userWords = normalize(userInput)
    .split(" ")
    .filter(Boolean);
  let matchedNames = 0;
  for (const name of namesList) {
    const nm = normalize(name);
    if (userWords.some((uw) => isWordMatch(nm, uw))) matchedNames++;
  }
  return matchedNames >= n;
}

// Fonction principale utilisée par le bot
function checkAnswer(question, userInput) {
  switch (question.type) {
    case "simple":
      return simpleAnswerCheck(question.answer, userInput);
    case "keyword":
      return keywordAnswerCheck(question.answer, userInput, question.ratio || 0.6);
    case "cite":
      return citeNCheck(question.names, userInput, question.n);
    default:
      return simpleAnswerCheck(question.answer, userInput);
  }
}

module.exports = {
  normalize,
  levenshtein,
  isWordMatch,
  keywordAnswerCheck,
  simpleAnswerCheck,
  citeNCheck,
  checkAnswer,
};
