/* Contenus de l'appli — TEXTES PROVISOIRES à valider ou réécrire par Cindy.
   Tout ce qui est ici peut être modifié sans toucher au reste du code. */
window.CONTENUS = {
  nomAppli: "Ma bulle",

  // Numéros vérifiés le 15/10/2026 sur les sites officiels (service-public.gouv.fr, sites des lignes).
  aide: [
    { nom: "Urgence vitale", detail: "SAMU 15 ou numéro européen 112", tel: "15", urgent: true },
    { nom: "3114", detail: "Prévention du suicide, 24h/24, 7j/7, gratuit", tel: "3114", urgent: true },
    { nom: "Fil Santé Jeunes", detail: "Pour les 12-25 ans, gratuit et anonyme", tel: "0800235236", aff: "0 800 235 236" },
    { nom: "Drogues Info Service", detail: "8h-23h, 7j/7, gratuit et anonyme", tel: "0800231313", aff: "0 800 23 13 13" },
    { nom: "Alcool Info Service", detail: "7j/7, anonyme, non surtaxé", tel: "0980980930", aff: "0 980 980 930" },
    { nom: "Joueurs Info Service", detail: "Jeux d'argent et écrans, 8h-23h, 7j/7", tel: "0974751313", aff: "09 74 75 13 13" }
  ],

  phrases: [
    "Une envie, c'est une vague : elle monte, puis elle redescend.",
    "Tu n'as pas besoin d'être parfait·e pour avancer.",
    "Chaque petite victoire compte. Même aujourd'hui.",
    "Demander de l'aide, c'est une force.",
    "Tu as déjà traversé des journées difficiles. Tu es encore là.",
    "Ce que tu ressens est important.",
    "Respire. Ce moment va passer.",
    "Un pas à la fois, c'est déjà avancer.",
    "Tu mérites de prendre soin de toi.",
    "Si tu as craqué, tu n'as pas tout perdu : tu repars avec ce que tu as appris."
  ],

  emotions: ["Joie", "Calme", "Fierté", "Fatigue", "Tristesse", "Colère", "Peur", "Stress", "Ennui", "Solitude", "Envie forte"],

  humeurs: [
    { n: 1, e: "😣", mot: "Très dur", c: "#B9A7F5" },
    { n: 2, e: "🙁", mot: "Pas top", c: "#9EC9F5" },
    { n: 3, e: "😐", mot: "Bof", c: "#F7D98B" },
    { n: 4, e: "🙂", mot: "Ça va", c: "#FFB98A" },
    { n: 5, e: "😄", mot: "Super", c: "#FF8A3D" }
  ],

  exercices: [
    { id: "coherence", titre: "Cohérence cardiaque", duree: "3 min", ico: "💗", couleur: "rose",
      intro: "Suis la bulle : tu inspires quand elle grandit, tu expires quand elle rapetisse. 5 secondes chacune. Ça calme le cœur et la tête.",
      type: "respiration", rythme: [5, 0, 5, 0], total: 180 },
    { id: "carre", titre: "Respiration carrée", duree: "2 min", ico: "🟧", couleur: "orange",
      intro: "Inspire 4 secondes, bloque 4, expire 4, bloque 4. Comme si tu dessinais un carré.",
      type: "respiration", rythme: [4, 4, 4, 4], total: 120 },
    { id: "cinqsens", titre: "Les 5 sens", duree: "3 min", ico: "🖐️", couleur: "menthe",
      intro: "Pour revenir ici et maintenant, quand ça tourne trop vite dans ta tête. Décris sans juger.",
      type: "etapes", etapes: [
        "Regarde autour de toi : trouve 5 choses que tu vois.",
        "Trouve 4 choses que tu peux toucher. Sens leur texture.",
        "Écoute : repère 3 sons.",
        "Trouve 2 odeurs (ou souviens-toi de 2 odeurs que tu aimes).",
        "Remarque 1 goût dans ta bouche.",
        "Bravo. Prends une grande respiration. Comment tu te sens maintenant ?"
      ] },
    { id: "vague", titre: "Surfer sur l'envie", duree: "10 min", ico: "🌊", couleur: "ciel",
      intro: "Quand l'envie arrive, tu n'es pas obligé·e d'y répondre tout de suite. On la regarde passer, comme une vague.",
      type: "etapes", minuteur: 600, etapes: [
        "Note la force de ton envie, de 0 à 10.",
        "Où est-ce que tu la sens dans ton corps ? Le ventre, la gorge, les mains ?",
        "Respire doucement. Tu observes, sans rien faire d'autre.",
        "Lance le minuteur de 10 minutes. Pendant ce temps, tu peux bouger, boire un verre d'eau, mettre une musique.",
        "Note à nouveau ton envie de 0 à 10. Elle a bougé ? Même un peu, c'est une victoire."
      ] },
    { id: "pensees", titre: "Repérer ses pensées", duree: "5 min", ico: "💭", couleur: "lavande",
      intro: "Nos pensées ne sont pas toujours des vérités. On apprend à les remarquer.",
      type: "etapes", etapes: [
        "Quelle pensée tourne dans ta tête en ce moment ? Écris-la dans ton journal ou dans ta tête.",
        "Est-ce un fait, ou une interprétation ?",
        "Qu'est-ce que tu dirais à un·e ami·e qui aurait cette pensée ?",
        "Trouve une phrase plus douce pour toi."
      ] },
    { id: "yoga", titre: "Yoga tout doux", duree: "5 min", ico: "🧘", couleur: "peche",
      intro: "Trois postures simples pour relâcher les tensions. Va doucement, sans forcer.",
      type: "etapes", etapes: [
        "La montagne : debout, pieds ancrés au sol. Grandis-toi en inspirant, relâche les épaules en expirant. 5 respirations.",
        "L'enfant : à genoux, assieds-toi sur tes talons, pose le front au sol, bras le long du corps. 5 respirations.",
        "Le chat-vache : à quatre pattes, creuse le dos en inspirant, arrondis-le en expirant. 5 fois.",
        "Termine allongé·e sur le dos, une main sur le ventre. Sens ta respiration."
      ] }
  ],

  articles: [
    { id: "addiction", titre: "C'est quoi, une addiction ?", ico: "🧩", lecture: "2 min",
      texte: [
        "Une addiction, c'est quand quelque chose (une substance, les écrans, les jeux, un comportement) prend de plus en plus de place, au point d'être difficile à arrêter, même quand ça fait du mal.",
        "Ce n'est pas un manque de volonté. C'est un mécanisme du cerveau, qui peut toucher tout le monde.",
        "La bonne nouvelle : on peut en sortir, pas à pas, et on n'est pas obligé·e de le faire seul·e."
      ] },
    { id: "emotions", titre: "Émotions et envies : le lien", ico: "🌈", lecture: "2 min",
      texte: [
        "Souvent, l'envie de consommer arrive quand une émotion est trop forte : stress, tristesse, colère, ennui, solitude.",
        "Le comportement sert alors à ne plus sentir cette émotion. Ça soulage un moment, puis l'émotion revient.",
        "Apprendre à reconnaître ce qu'on ressent, c'est déjà reprendre un peu la main. C'est à ça que sert ton journal."
      ] },
    { id: "cerveau", titre: "Mon cerveau et mon corps", ico: "🧠", lecture: "2 min",
      texte: [
        "Ton corps et ta tête sont liés : quand tu respires lentement, ton cœur ralentit et ton cerveau reçoit le message que tu es en sécurité.",
        "C'est pour ça que les exercices de respiration marchent, même s'ils paraissent simples.",
        "Bouger, dormir, manger, voir des gens qu'on aime : tout ça aide aussi le cerveau à aller mieux."
      ] },
    { id: "vague", titre: "Une envie, ça passe", ico: "🌊", lecture: "1 min",
      texte: [
        "Une envie forte monte, atteint un pic, puis redescend, comme une vague. Elle ne dure pas éternellement.",
        "Chaque fois que tu laisses passer une vague sans y répondre, la suivante devient un peu plus facile.",
        "Essaie l'exercice « Surfer sur l'envie » la prochaine fois."
      ] },
    { id: "aide", titre: "Demander de l'aide", ico: "🤝", lecture: "1 min",
      texte: [
        "Parler à quelqu'un de confiance, c'est une force, pas une faiblesse : un parent, un·e ami·e, l'infirmerie scolaire, un·e professionnel·le.",
        "Des lignes d'écoute gratuites et anonymes existent aussi. Elles sont dans le bouton « Besoin d'aide », en haut de l'écran.",
        "Si tu es en danger, appelle le 15 ou le 112."
      ] }
  ]
};
