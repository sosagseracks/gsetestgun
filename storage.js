// storage.js
// Stockage simple en JSON sur disque, séparé par quiz (quiz1 / quiz2).
// ⚠️ Sur Railway, le disque est éphémère par défaut : ajoute un "Volume"
// monté sur le dossier ./data (voir README) pour garder les données
// entre deux redéploiements.

const fs = require("fs");
const path = require("path");

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, "data", "participants.json");

function ensureFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ quizzes: {} }, null, 2));
  }
}

function load() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!data.quizzes) data.quizzes = {};
    return data;
  } catch (e) {
    return { quizzes: {} };
  }
}

function save(data) {
  ensureFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function getBucket(data, quizId) {
  if (!data.quizzes[quizId]) {
    data.quizzes[quizId] = { completed: {}, usedIds: {} };
  }
  return data.quizzes[quizId];
}

function hasCompleted(discordId, quizId) {
  const data = load();
  const bucket = getBucket(data, quizId);
  return Boolean(bucket.completed[discordId]);
}

function isIdUsed(providedId, quizId) {
  const data = load();
  const bucket = getBucket(data, quizId);
  const key = providedId.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(bucket.usedIds, key);
}

function markCompleted(discordId, providedId, score, maxScore, quizId) {
  const data = load();
  const bucket = getBucket(data, quizId);
  const key = providedId.trim().toLowerCase();
  bucket.completed[discordId] = {
    providedId,
    score,
    maxScore,
    completedAt: new Date().toISOString(),
  };
  bucket.usedIds[key] = discordId;
  save(data);
}

// Si quizId est omis, réinitialise la personne sur TOUS les quiz.
function resetUser(discordId, quizId) {
  const data = load();
  const quizIds = quizId ? [quizId] : Object.keys(data.quizzes);
  for (const qId of quizIds) {
    const bucket = getBucket(data, qId);
    const entry = bucket.completed[discordId];
    if (entry) {
      const key = entry.providedId.trim().toLowerCase();
      delete bucket.usedIds[key];
    }
    delete bucket.completed[discordId];
  }
  save(data);
}

function getResult(discordId, quizId) {
  const data = load();
  const bucket = getBucket(data, quizId);
  return bucket.completed[discordId] || null;
}

module.exports = {
  hasCompleted,
  isIdUsed,
  markCompleted,
  resetUser,
  getResult,
};
