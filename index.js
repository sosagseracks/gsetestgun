// index.js
require("dotenv").config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ChannelType } = require("discord.js");
const ALL_QUESTIONS = require("./questions");
const { checkAnswer } = require("./fuzzy");
const storage = require("./storage");

const POINTS_PER_QUESTION = parseInt(process.env.POINTS_PER_QUESTION || "3", 10);
const OWNER_ID = process.env.OWNER_ID || null;
const QUIZ_TITLE = "Questionnaire GSE";

// Le bot tire ce nombre de questions au hasard parmi ALL_QUESTIONS à chaque participation
const QUIZ_QUESTION_COUNT = 20;

function maxScoreFor(questions) {
  return questions.length * POINTS_PER_QUESTION;
}

// Mélange aléatoire (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickQuestions() {
  return shuffle(ALL_QUESTIONS).slice(0, QUIZ_QUESTION_COUNT);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// Sessions en mémoire : discordId -> { state, questions, providedId, score, currentIndex }
// state: "awaiting_id" | "in_quiz"
const sessions = new Map();

client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.guild) return; // uniquement les DM
    if (message.channel.type !== ChannelType.DM) return;

    const discordId = message.author.id;
    const content = message.content.trim();

    // Commande admin (facultative), ex: !admin-reset 123456789012345678
    if (OWNER_ID && discordId === OWNER_ID && content.startsWith("!admin-reset")) {
      const parts = content.split(/\s+/);
      const targetId = parts[1];
      if (targetId) {
        storage.resetUser(targetId);
        sessions.delete(targetId);
        await message.reply(`✅ Le participant ${targetId} a été réinitialisé.`);
      } else {
        await message.reply("Utilisation : `!admin-reset <discordId>`");
      }
      return;
    }

    // Si la personne a déjà terminé le quiz, on bloque
    if (storage.hasCompleted(discordId)) {
      const result = storage.getResult(discordId);
      await message.reply(
        `❌ Tu as déjà participé au questionnaire GSE.\n` +
        `Ton score était de **${result.score}/${result.maxScore}** points.\n` +
        `Si tu penses qu'il y a une erreur, contacte un HG.`
      );
      return;
    }

    let session = sessions.get(discordId);

    // Nouvelle personne / pas de session en cours -> on propose le quiz
    if (!session) {
      session = { state: "awaiting_id", questions: pickQuestions() };
      sessions.set(discordId, session);
      const sessionMaxScore = maxScoreFor(session.questions);

      const introEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`🎮 ${QUIZ_TITLE}`)
        .setDescription(
          "Salut ! Je te propose de participer à un petit questionnaire sur la GSE pour gagner des points 🏆\n\n" +
          `Il y a **${session.questions.length} questions**, chacune vaut **${POINTS_PER_QUESTION} points** (max ${sessionMaxScore} points).\n` +
          "⚠️ Tu ne peux participer qu'une seule fois.\n\n" +
          "Pour commencer, envoie-moi **ton identifiant** (celui qui prouve que c'est bien toi qui as participé)."
        )
        .setFooter({ text: "Réponds simplement avec ton identifiant pour démarrer." });

      await message.channel.send({ embeds: [introEmbed] });
      return;
    }

    // Étape 1 : on attend l'identifiant
    if (session.state === "awaiting_id") {
      if (!content) {
        await message.reply("Merci d'envoyer ton identifiant sous forme de texte pour commencer.");
        return;
      }

      if (storage.isIdUsed(content)) {
        await message.reply(
          "❌ Cet identifiant a déjà été utilisé pour participer au questionnaire.\n" +
          "Si tu penses qu'il y a une erreur, contacte un HG."
        );
        return;
      }

      session.providedId = content;
      session.score = 0;
      session.currentIndex = 0;
      session.state = "in_quiz";

      await message.channel.send(`✅ Identifiant enregistré : **${content}**\nC'est parti pour le quiz !`);
      await sendQuestion(message, session);
      return;
    }

    // Étape 2 : on est en plein quiz
    if (session.state === "in_quiz") {
      const question = session.questions[session.currentIndex];
      const isCorrect = checkAnswer(question, content);

      if (isCorrect) {
        session.score += POINTS_PER_QUESTION;
        await message.channel.send("✅ Bonne réponse !");
      } else {
        await message.channel.send("❌ Pas tout à fait, mais on continue !");
      }

      session.currentIndex++;

      if (session.currentIndex < session.questions.length) {
        await sendQuestion(message, session);
      } else {
        const maxScore = maxScoreFor(session.questions);
        storage.markCompleted(discordId, session.providedId, session.score, maxScore);
        sessions.delete(discordId);

        const finalEmbed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle("🏁 Questionnaire terminé !")
          .setDescription(
            `Bravo ! Tu as terminé le **${QUIZ_TITLE}**.\n\n` +
            `**Score final : ${session.score}/${maxScore} points**\n\n` +
            "📸 Fais une capture d'écran de ce message et envoie-la dans ton salon personnel pour valider tes points."
          );

        await message.channel.send({ embeds: [finalEmbed] });
      }
      return;
    }
  } catch (err) {
    console.error("Erreur lors du traitement du message :", err);
    try {
      await message.reply("Une erreur est survenue, réessaie dans un instant.");
    } catch (_) {}
  }
});

async function sendQuestion(message, session) {
  const question = session.questions[session.currentIndex];
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`Question ${session.currentIndex + 1}/${session.questions.length}`)
    .setDescription(question.q);
  await message.channel.send({ embeds: [embed] });
}

client.login(process.env.DISCORD_TOKEN);
