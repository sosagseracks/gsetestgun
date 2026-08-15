// storage.js
// Stockage simple en JSON sur disque.
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
    fs.writeFileSync(DATA_PATH, JSON.stringify({ completed: {}, usedIds: {} }, null, 2));
  }
}

function load() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!data.completed) data.completed = {};
    if (!data.usedIds) data.usedIds = {};
    return data;
  } catch (e) {
    return { completed: {}, usedIds: {} };
  }
}

function save(data) {
  ensureFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function hasCompleted(discordId) {
  const data = load();
  return Boolean(data.completed[discordId]);
}

function isIdUsed(providedId) {
  const data = load();
  const key = providedId.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(data.usedIds, key);
}

function markCompleted(discordId, providedId, score, maxScore) {
  const data = load();
  const key = providedId.trim().toLowerCase();
  data.completed[discordId] = {
    providedId,
    score,
    maxScore,
    completedAt: new Date().toISOString(),
  };
  data.usedIds[key] = discordId;
  save(data);
}

function resetUser(discordId) {
  const data = load();
  const entry = data.completed[discordId];
  if (entry) {
    const key = entry.providedId.trim().toLowerCase();
    delete data.usedIds[key];
  }
  delete data.completed[discordId];
  save(data);
}

function getResult(discordId) {
  const data = load();
  return data.completed[discordId] || null;
}

module.exports = {
  hasCompleted,
  isIdUsed,
  markCompleted,
  resetUser,
  getResult,
};
