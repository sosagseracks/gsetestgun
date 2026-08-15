// index.js
require("dotenv").config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ChannelType } = require("discord.js");
const { quiz1, quiz2 } = require("./questions");
const { checkAnswer } = require("./fuzzy");
const storage = require("./storage");

const POINTS_PER_QUESTION = parseInt(process.env.POINTS_PER_QUESTION || "3", 10);
const OWNER_ID = process.env.OWNER_ID || null;

// Config centralisée des quiz disponibles
const QUIZZES = {
  quiz1: {
    id: "quiz1",
    title: "Questionnaire GSE",
    questions: quiz1,
  },
  quiz2: {
    id: "quiz2",
    title: "Questionnaire GSE #2 — Culture GSE",
    questions: quiz2,
  },
};

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

// Le quiz 2 tire 20 questions au hasard parmi toutes les disponibles, à chaque participation
const QUIZ2_QUESTION_COUNT = 20;

function pickQuestionsFor(quizId) {
  const all = QUIZZES[quizId].questions;
  if (quizId === "quiz2") {
    return shuffle(all).slice(0, QUIZ2_QUESTION_COUNT);
  }
  return all;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// Sessions en mémoire : discordId -> { state, quizId, providedId, score, currentIndex }
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

    // Commande admin (facultative), ex: !admin-reset 123456789012345678 quiz2
    if (OWNER_ID && discordId === OWNER_ID && content.startsWith("!admin-reset")) {
      const parts = content.split(/\s+/);
      const targetId = parts[1];
      const targetQuiz = parts[2]; // optionnel
      if (targetId) {
        storage.resetUser(targetId, targetQuiz);
        sessions.delete(targetId);
        await message.reply(
          `✅ Le participant ${targetId} a été réinitialisé${targetQuiz ? ` pour ${targetQuiz}` : " sur tous les quiz"}.`
        );
      } else {
        await message.reply("Utilisation : `!admin-reset <discordId> [quiz1|quiz2]`");
      }
      return;
    }

    let session = sessions.get(discordId);

    // Pas de session en cours -> on détermine quel quiz proposer
    if (!session) {
      const quizId = content === "2" ? "quiz2" : "quiz1";
      const quiz = QUIZZES[quizId];

      if (storage.hasCompleted(discordId, quizId)) {
        const result = storage.getResult(discordId, quizId);
        await message.reply(
          `❌ Tu as déjà participé au **${quiz.title}**.\n` +
          `Ton score était de **${result.score}/${result.maxScore}** points.\n` +
          `Si tu penses qu'il y a une erreur, contacte un HG.`
        );
        return;
      }

      session = { state: "awaiting_id", quizId, questions: pickQuestionsFor(quizId) };
      sessions.set(discordId, session);
      const sessionMaxScore = maxScoreFor(session.questions);

      const introEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`🎮 ${quiz.title}`)
        .setDescription(
          `Salut ! Je te propose de participer au **${quiz.title}** pour gagner des points 🏆\n\n` +
          `Il y a **${session.questions.length} questions**, chacune vaut **${POINTS_PER_QUESTION} points** (max ${sessionMaxScore} points).\n` +
          "⚠️ Tu ne peux participer qu'une seule fois à **ce** questionnaire.\n\n" +
          "Pour commencer, envoie-moi **ton identifiant** (celui qui prouve que c'est bien toi qui as participé)."
        )
        .setFooter({ text: "Réponds simplement avec ton identifiant pour démarrer." });

      await message.channel.send({ embeds: [introEmbed] });
      return;
    }

    const quiz = QUIZZES[session.quizId];

    // Étape 1 : on attend l'identifiant
    if (session.state === "awaiting_id") {
      if (!content) {
        await message.reply("Merci d'envoyer ton identifiant sous forme de texte pour commencer.");
        return;
      }

      if (storage.isIdUsed(content, session.quizId)) {
        await message.reply(
          "❌ Cet identifiant a déjà été utilisé pour participer à ce questionnaire.\n" +
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
        storage.markCompleted(discordId, session.providedId, session.score, maxScore, session.quizId);
        sessions.delete(discordId);

        const finalEmbed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle("🏁 Questionnaire terminé !")
          .setDescription(
            `Bravo ! Tu as terminé le **${quiz.title}**.\n\n` +
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
