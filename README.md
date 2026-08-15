# GSE Quiz Bot

Bot Discord qui, dès qu'on lui envoie un message privé (DM), propose un
questionnaire GSE pour gagner des points. La correction des réponses est
**approximative** (tolère fautes de frappe, accents manquants, majuscules,
formulations différentes). Chaque personne ne peut participer qu'**une
seule fois** (vérifié par son identifiant + son compte Discord).

## 1. Créer l'application Discord

1. Va sur https://discord.com/developers/applications → **New Application**.
2. Onglet **Bot** → clique sur **Reset Token** et copie le token (tu en auras besoin).
3. Toujours dans l'onglet **Bot**, active dans "Privileged Gateway Intents" :
   - **MESSAGE CONTENT INTENT**
   - **DIRECT MESSAGES** (inclus par défaut, mais vérifie que rien n'est décoché)
4. Onglet **OAuth2 → URL Generator** :
   - Scopes : `bot`
   - Permissions : `Read Messages/View Channels`, `Send Messages` (pas besoin de plus)
   - Copie le lien généré et invite le bot sur ton serveur.

⚠️ Un utilisateur ne peut envoyer un DM à un bot que s'il **partage un
serveur** avec lui (ou si le bot lui écrit en premier). Comme le bot est
sur ton serveur Discord, tes membres pourront lui écrire en DM normalement.

## 2. Installer en local (optionnel, pour tester)

```bash
npm install
cp .env.example .env
# colle ton token dans .env (DISCORD_TOKEN=...)
npm start
```

## 3. Déployer sur Railway (24h/24)

1. Mets ce projet sur un repo GitHub (ou utilise `railway up` en CLI directement depuis ce dossier).
2. Sur https://railway.app → **New Project** → **Deploy from GitHub repo** (choisis ton repo).
3. Dans l'onglet **Variables** du service, ajoute :
   - `DISCORD_TOKEN` = ton token du bot
   - `OWNER_ID` = ton ID Discord (optionnel, pour la commande admin)
   - `POINTS_PER_QUESTION` = `3` (avec 20 questions, ça fait 60 points max — modifie si besoin)
4. **Important — persistance des données** : par défaut, Railway efface le
   disque à chaque redéploiement. Pour que les participations ne soient
   pas perdues :
   - Va dans l'onglet **Volumes** du service → **New Volume**.
   - Monte-le sur `/app/data`.
   - Ajoute la variable `DATA_PATH` = `/app/data/participants.json`.
5. Railway détecte automatiquement `npm start` grâce au `package.json`.
   Le bot tournera en continu tant que le service est actif.

## 4. Fonctionnement

- Un membre envoie n'importe quel message en DM au bot → ça lance le **Questionnaire GSE #1**.
- S'il envoie exactement **`2`** en DM (et n'a pas de session en cours), ça lance le **Questionnaire GSE #2** (culture GSE) — il pioche **20 questions au hasard** parmi les 28 disponibles à chaque participation, donc deux personnes n'auront pas forcément les mêmes questions. Les deux quiz sont indépendants, chacun ne peut être fait qu'une fois.
- Le bot demande son **identifiant**, puis pose les questions une par une.
- À chaque réponse, le bot dit si c'est correct ou non (correction tolérante,
  pas besoin d'être exact au mot près) puis pose la question suivante.
- À la fin, le bot annonce le score total : la personne peut faire une
  capture d'écran et l'envoyer dans son salon personnel.
- Si la personne (ou son identifiant) a déjà participé à un quiz donné, le bot le lui rappelle
  et bloque une nouvelle tentative sur ce quiz (mais elle peut faire l'autre quiz).

## 5. Modifier les questions

Toutes les questions/réponses sont dans `questions.js`, séparées en deux
listes exportées : `quiz1` (questionnaire GSE classique) et `quiz2`
(déclenché en envoyant `2` au bot). Chaque question a un `type` :

- `simple` : réponse courte (1-2 mots), ex. "Timeout", "Vrai", "Blacklist".
  `answer` peut être un texte, ou un tableau si plusieurs réponses sont
  acceptées, ex. `["Mexique", "Mexico"]`.
- `keyword` : réponse plus longue, le bot vérifie qu'une majorité des
  mots-clés importants sont présents (tolère les reformulations).
- `cite` : il faut citer au moins `n` éléments parmi une liste (`names`).

Le nombre de points par question et le nombre total de questions
s'adaptent automatiquement (voir `POINTS_PER_QUESTION`).

## 6. Commande admin (optionnelle)

Si tu as défini `OWNER_ID` dans les variables d'environnement, tu peux
envoyer en DM au bot, avec ton propre compte :

```
!admin-reset <idDiscordDeLaPersonne>
```

Cela réinitialise la participation de cette personne (utile en cas d'erreur
ou pour tester le bot toi-même plusieurs fois).
