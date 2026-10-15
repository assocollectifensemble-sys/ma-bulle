/* Ma bulle — V1. Tout reste sur le téléphone : aucun compte, aucun serveur. */
(() => {
const C = window.CONTENUS;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2, "0");
const cle = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const auj = () => cle(new Date());
const MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const dateLongue = k => { const d = new Date(k + "T12:00"); return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`; };

/* ---------- Stockage local ---------- */
const S = {
  get(k, def) { try { const v = localStorage.getItem("mb_" + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { localStorage.setItem("mb_" + k, JSON.stringify(v)); }
};
const journal = () => S.get("journal", {});           // { "2026-10-15": {humeur, emotions[], envie, positif, dur, t} }
const setJournal = j => S.set("journal", j);

/* Photos : IndexedDB (trop lourdes pour localStorage) */
const idb = () => new Promise((ok, ko) => {
  const r = indexedDB.open("mabulle", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "id" });
  r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
});
const photos = {
  async tout() { const db = await idb(); return new Promise(ok => { const q = db.transaction("photos").objectStore("photos").getAll(); q.onsuccess = () => ok(q.result.sort((a,b)=>a.t-b.t)); q.onerror = () => ok([]); }); },
  async ajouter(blob) { const db = await idb(); return new Promise(ok => { const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").put({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()), t: Date.now(), blob }); tx.oncomplete = ok; }); },
  async suppr(id) { const db = await idb(); return new Promise(ok => { const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").delete(id); tx.oncomplete = ok; }); },
  async vider() { const db = await idb(); return new Promise(ok => { const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").clear(); tx.oncomplete = ok; }); }
};
const compresser = file => new Promise((ok, ko) => {
  const img = new Image(); const url = URL.createObjectURL(file);
  img.onload = () => { const m = 1100, k = Math.min(1, m / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    c.toBlob(b => b ? ok(b) : ko(new Error("compression")), "image/jpeg", 0.82); };
  img.onerror = () => { URL.revokeObjectURL(url); ko(new Error("image")); };
  img.src = url;
});

/* ---------- Outils d'interface ---------- */
const ecran = $("#ecran");
let minuteurs = [];
const stopMinuteurs = () => { minuteurs.forEach(clearInterval); minuteurs.forEach(clearTimeout); minuteurs = []; };
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2200); }
function ouvrir(html, apres) {
  stopMinuteurs(); $("#feuilleContenu").innerHTML = html; $("#feuille").hidden = false;
  document.body.style.overflow = "hidden"; if (apres) apres($("#feuilleContenu"));
}
function fermer() { stopMinuteurs(); $("#feuille").hidden = true; document.body.style.overflow = ""; }
$("#feuille").addEventListener("click", e => { if (e.target.closest("[data-fermer]")) fermer(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#feuille").hidden) fermer(); });

/* ---------- Compteur ---------- */
function joursSans() {
  const d = S.get("compteur", null); if (!d) return null;
  return Math.max(0, Math.floor((new Date(auj() + "T12:00") - new Date(d + "T12:00")) / 864e5));
}

/* ---------- Écrans ---------- */
const VUES = {
accueil() {
  const j = journal(), today = j[auj()], n = joursSans();
  const idx = Math.floor(new Date(auj()).getTime() / 864e5);
  const ex = C.exercices[idx % C.exercices.length];
  const ordre = C.phrases.map((p, i) => C.phrases[(i + idx) % C.phrases.length]);
  const coul = ["peche","rose","menthe","ciel","lavande","jaune"];
  const prenom = S.get("prenom", "");
  return `
  <h1>${prenom ? "Coucou " + esc(prenom) + " 👋" : "Coucou 👋"}</h1>
  <p class="doux">${dateLongue(auj())}</p>

  <section class="carte orange compteur">
    <div class="compteur-rond">${n == null ? "<b>–</b><small>jours</small>" : `<b>${n}</b><small>jour${n > 1 ? "s" : ""}</small>`}</div>
    <div>
      ${n == null
        ? `<h2>Mon compteur</h2><p>Compte les jours depuis que tu as décidé de faire une pause.</p><button class="bouton blanc" data-act="compteur">Démarrer</button>`
        : `<h2>${n === 0 ? "C'est le début 🌱" : "Bravo, continue 💪"}</h2><p class="petit">Depuis le ${dateLongue(S.get("compteur"))}</p><button class="lien" style="color:#fff" data-act="compteur">Modifier</button>`}
    </div>
  </section>

  <section class="carte">
    <h2>Comment tu te sens ?</h2>
    <div class="humeurs">${C.humeurs.map(h => `<button class="humeur ${today && today.humeur === h.n ? "on" : ""}" data-humeur="${h.n}"><span>${h.e}</span>${h.mot}</button>`).join("")}</div>
    ${today ? `<p class="petit doux" style="margin:10px 0 0">Noté aujourd'hui. <button class="lien" data-vue-go="journal">Compléter mon journal</button></p>` : ""}
  </section>

  <div class="titre-section"><h2>Phrases pour toi</h2></div>
  <div class="defile" id="defile">${ordre.map((p, i) => `<div class="phrase ${coul[i % coul.length]}">${esc(p)}</div>`).join("")}</div>
  <div class="points" id="points">${ordre.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>

  <div class="titre-section"><h2>L'exercice du jour</h2></div>
  <button class="tuile ${ex.couleur}" style="width:100%;min-height:0;flex-direction:row;align-items:center;gap:14px" data-ex="${ex.id}">
    <span class="ico">${ex.ico}</span><span style="flex:1"><b>${esc(ex.titre)}</b><small>${ex.duree}</small></span><span class="bouton" style="min-height:40px;padding:8px 16px">Go</span>
  </button>

  <section class="carte peche bientot" style="margin-top:22px">
    <span class="badge">BIENTÔT</span>
    <h2 style="margin-top:8px">Le carnet complet</h2>
    <p class="doux" style="margin:0">Plus d'outils, d'explications et d'exercices pour aller plus loin.</p>
  </section>`;
},

journal() {
  const j = journal(), k = journal.jour || auj(), e = j[k] || {};
  const m = journal.mois || auj().slice(0, 7);
  return `
  <h1>Mon journal</h1>
  <p class="doux">Rien que pour toi. Tout reste sur ton téléphone.</p>

  <section class="carte">
    <div class="cal-entete" style="margin-bottom:4px"><h2 style="margin:0">${k === auj() ? "Aujourd'hui" : esc(dateLongue(k))}</h2>
      ${k !== auj() ? `<button class="lien" data-jour="${auj()}">Revenir à aujourd'hui</button>` : ""}</div>
    <label class="etiquette">Mon humeur</label>
    <div class="humeurs">${C.humeurs.map(h => `<button class="humeur ${e.humeur === h.n ? "on" : ""}" data-j-humeur="${h.n}"><span>${h.e}</span>${h.mot}</button>`).join("")}</div>

    <label class="etiquette">Ce que je ressens</label>
    <div class="puces">${C.emotions.map(x => `<button class="puce ${(e.emotions || []).includes(x) ? "on" : ""}" data-emo="${esc(x)}">${esc(x)}</button>`).join("")}</div>

    <label class="etiquette" for="envie">Mon envie aujourd'hui <span class="curseur-val" id="envieVal">${e.envie ?? 0}</span>/10</label>
    <input type="range" min="0" max="10" value="${e.envie ?? 0}" class="curseur" id="envie">

    <label class="etiquette" for="positif">Un moment positif ✨</label>
    <textarea id="positif" rows="2" placeholder="Même tout petit…">${esc(e.positif || "")}</textarea>

    <label class="etiquette" for="dur">Un moment où ça n'allait pas</label>
    <textarea id="dur" rows="2" placeholder="Qu'est-ce qui s'est passé ? Qu'est-ce qui m'a aidé·e ?">${esc(e.dur || "")}</textarea>

    <button class="bouton plein" style="margin-top:14px" data-act="enregistrer">Enregistrer</button>
  </section>

  <section class="carte">
    <div class="cal-entete"><button data-mois="-1" aria-label="Mois précédent">‹</button><h2 style="margin:0">${MOIS[+m.slice(5) - 1]} ${m.slice(0, 4)}</h2><button data-mois="1" aria-label="Mois suivant">›</button></div>
    ${calendrier(m, j)}
    <div class="legende">${C.humeurs.map(h => `<span><i style="background:${h.c}"></i>${h.mot}</span>`).join("")}</div>
  </section>

  <section class="carte">
    <h2>Mon parcours (14 jours)</h2>
    ${courbe(j)}
    <p class="petit doux" style="margin:6px 0 0"><span style="color:var(--orange-f);font-weight:900">●</span> humeur &nbsp; <span style="color:#9B87E8;font-weight:900">●</span> envie</p>
  </section>

  ${Object.keys(j).length ? `<div class="titre-section"><h2>Mes dernières notes</h2></div>
  <section class="carte">${Object.keys(j).sort().reverse().slice(0, 7).map(d => { const x = j[d]; const h = C.humeurs.find(h => h.n === x.humeur);
    return `<div class="entree"><time>${esc(dateLongue(d))} ${h ? h.e : ""}</time>
      ${x.emotions && x.emotions.length ? `<div class="petit doux">${x.emotions.map(esc).join(" · ")}</div>` : ""}
      ${x.positif ? `<p style="margin:4px 0 0">✨ ${esc(x.positif)}</p>` : ""}${x.dur ? `<p style="margin:4px 0 0">☁️ ${esc(x.dur)}</p>` : ""}</div>`; }).join("")}</section>` : ""}`;
},

exercices() {
  return `
  <h1>Exercices</h1>
  <p class="doux">Pour te calmer, revenir dans ton corps, laisser passer une envie.</p>
  <div class="tuiles">${C.exercices.map(x => `<button class="tuile ${x.couleur}" data-ex="${x.id}"><span class="ico">${x.ico}</span><span><b>${esc(x.titre)}</b><small>${x.duree}</small></span></button>`).join("")}</div>
  <p class="provisoire">Exercices à valider par Cindy</p>`;
},

comprendre() {
  return `
  <h1>Comprendre</h1>
  <p class="doux">De petits articles, à lire quand tu veux.</p>
  ${C.articles.map(a => `<button class="rangee" data-art="${a.id}"><span class="ico">${a.ico}</span><span><b>${esc(a.titre)}</b><small>${a.lecture} de lecture</small></span><span class="fleche">›</span></button>`).join("")}
  <p class="provisoire">Textes provisoires, à valider par Cindy</p>`;
},

coffre() {
  const motiv = S.get("motivations", []), musiques = S.get("musiques", []);
  return `
  <h1>Mon coffre</h1>
  <p class="doux">Ce qui te donne de la force, à garder sous la main.</p>

  <section class="carte jaune">
    <h2>Mes motivations</h2>
    <p class="petit doux">Pourquoi je fais ça ? Pour qui ? Pour quoi ?</p>
    <ul class="liste-perso">${motiv.map((x, i) => `<li><span>💛 ${esc(x)}</span><button data-suppr-motiv="${i}" aria-label="Supprimer">×</button></li>`).join("")}</ul>
    <form class="ajout-ligne" data-form="motiv"><input class="champ" name="v" maxlength="140" placeholder="Ex. : me sentir libre"><button class="bouton">+</button></form>
  </section>

  <section class="carte">
    <h2>Mes photos qui font du bien</h2>
    <p class="petit doux">Famille, amis, endroits que j'aime… Elles restent sur ton téléphone.</p>
    <div class="galerie" id="galerie"><label class="ajout-photo" aria-label="Ajouter une photo">+<input type="file" accept="image/*" multiple hidden id="filePhoto"></label></div>
  </section>

  <section class="carte ciel">
    <h2>Mes musiques calmes</h2>
    <p class="petit doux">Colle le lien d'une musique ou d'une playlist (YouTube, Spotify, Deezer…).</p>
    <ul class="liste-perso">${musiques.map((x, i) => `<li><span>🎵 <a class="lien" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.nom)}</a></span><button data-suppr-musique="${i}" aria-label="Supprimer">×</button></li>`).join("")}</ul>
    <form class="ajout-ligne" data-form="musique"><input class="champ" name="v" inputmode="url" placeholder="https://…"><button class="bouton">+</button></form>
  </section>

  <section class="carte">
    <h2>Réglages</h2>
    <button class="rangee" data-act="prenom"><span class="ico">🙂</span><span><b>Mon prénom</b><small>${esc(S.get("prenom", "") || "Pas encore choisi")}</small></span><span class="fleche">›</span></button>
    <button class="rangee" data-act="code"><span class="ico">🔒</span><span><b>Code secret</b><small>${S.get("pin", null) ? "Activé" : "Désactivé"} · protège l'ouverture de l'appli</small></span><span class="fleche">›</span></button>
    <button class="rangee" data-act="compteur"><span class="ico">⏱️</span><span><b>Mon compteur</b><small>${S.get("compteur", null) ? "Depuis le " + esc(dateLongue(S.get("compteur"))) : "Pas démarré"}</small></span><span class="fleche">›</span></button>
    <button class="rangee" data-act="effacer"><span class="ico">🗑️</span><span><b>Tout effacer</b><small>Supprime toutes tes données de ce téléphone</small></span><span class="fleche">›</span></button>
  </section>`;
}
};

function calendrier(m, j) {
  const [y, mo] = m.split("-").map(Number);
  const premier = new Date(y, mo - 1, 1), nb = new Date(y, mo, 0).getDate();
  const decal = (premier.getDay() + 6) % 7;
  let h = ["L","M","M","J","V","S","D"].map(x => `<div class="j">${x}</div>`).join("");
  for (let i = 0; i < decal; i++) h += `<div class="c vide"></div>`;
  for (let d = 1; d <= nb; d++) {
    const k = `${y}-${pad(mo)}-${pad(d)}`, e = j[k], hu = e && C.humeurs.find(x => x.n === e.humeur);
    h += `<button class="c ${k === auj() ? "auj" : ""}" data-jour="${k}" style="${hu ? "background:" + hu.c : ""}" aria-label="${d}">${hu ? hu.e : d}</button>`;
  }
  return `<div class="cal">${h}</div>`;
}

function courbe(j) {
  const W = 320, H = 130, P = 16, jours = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); jours.push(cle(d)); }
  const x = i => P + i * (W - 2 * P) / 13;
  const ligne = (val, max, coul) => {
    const pts = jours.map((k, i) => j[k] && val(j[k]) != null ? [x(i), H - P - (val(j[k]) / max) * (H - 2 * P)] : null);
    let d = "", deb = true; pts.forEach(p => { if (!p) { deb = true; return; } d += (deb ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " "; deb = false; });
    return `<path d="${d}" fill="none" stroke="${coul}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
      pts.filter(Boolean).map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${coul}"/>`).join("");
  };
  const vide = !jours.some(k => j[k]);
  return `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe d'humeur et d'envie">
    ${[0, .5, 1].map(f => `<line x1="${P}" x2="${W - P}" y1="${P + f * (H - 2 * P)}" y2="${P + f * (H - 2 * P)}" stroke="#F3E2D6" stroke-dasharray="4 4"/>`).join("")}
    ${ligne(e => e.envie ?? null, 10, "#9B87E8")}${ligne(e => e.humeur ? e.humeur - 1 : null, 4, "#FF8A3D")}
    ${vide ? `<text x="${W / 2}" y="${H / 2 + 5}" text-anchor="middle" fill="#7A675C" font-size="13" font-weight="700">Remplis ton journal pour voir ta courbe</text>` : ""}
  </svg>`;
}

/* ---------- Navigation ---------- */
let vue = "accueil";
const TITRES = { accueil: C.nomAppli, journal: "Journal", exercices: "Exercices", comprendre: "Comprendre", coffre: "Mon coffre" };
function afficher(v, garderJour) {
  vue = v; if (!garderJour && v === "journal") { journal.jour = null; }
  ecran.innerHTML = VUES[v]();
  $("#titreEcran").textContent = TITRES[v];
  document.querySelectorAll(".onglets button").forEach(b => b.classList.toggle("actif", b.dataset.vue === v));
  if (v === "coffre") chargerGalerie();
  if (v === "accueil") brancherDefile();
  window.scrollTo(0, 0);
}
document.querySelector(".onglets").addEventListener("click", e => { const b = e.target.closest("[data-vue]"); if (b) afficher(b.dataset.vue); });

function brancherDefile() {
  const d = $("#defile"), pts = [...document.querySelectorAll("#points i")]; if (!d) return;
  d.addEventListener("scroll", () => { const i = Math.round(d.scrollLeft / (d.firstElementChild.offsetWidth + 12)); pts.forEach((p, k) => p.classList.toggle("on", k === i)); }, { passive: true });
}

/* ---------- Journal : sauvegarde ---------- */
function majJour(modif) {
  const j = journal(), k = journal.jour || auj(); j[k] = Object.assign({ emotions: [] }, j[k], modif, { t: Date.now() }); setJournal(j);
}
function lireFormulaire() {
  const k = journal.jour || auj(), e = journal()[k] || {};
  return { envie: +$("#envie").value, positif: $("#positif").value.trim(), dur: $("#dur").value.trim(), emotions: e.emotions || [] };
}

/* ---------- Clics ---------- */
ecran.addEventListener("click", async e => {
  const t = e.target.closest("button, [data-jour]"); if (!t) return;
  const d = t.dataset;
  if (d.humeur) { majJour({ humeur: +d.humeur }); toast("C'est noté 💛"); afficher("accueil"); return; }
  if (d.vueGo) { afficher(d.vueGo); return; }
  if (d.jHumeur) { majJour(Object.assign(lireFormulaire(), { humeur: +d.jHumeur })); afficher("journal", true); return; }
  if (d.emo) { const k = journal.jour || auj(), j = journal(), em = new Set((j[k] && j[k].emotions) || []);
    em.has(d.emo) ? em.delete(d.emo) : em.add(d.emo); majJour(Object.assign(lireFormulaire(), { emotions: [...em] })); t.classList.toggle("on"); return; }
  if (d.jour) { journal.jour = d.jour === auj() ? null : d.jour; journal.mois = d.jour.slice(0, 7); afficher("journal", true); return; }
  if (d.mois) { const [y, m] = (journal.mois || auj().slice(0, 7)).split("-").map(Number); const n = new Date(y, m - 1 + +d.mois, 1);
    journal.mois = `${n.getFullYear()}-${pad(n.getMonth() + 1)}`; afficher("journal", true); return; }
  if (d.ex) { ouvrirExercice(d.ex); return; }
  if (d.art) { const a = C.articles.find(x => x.id === d.art);
    ouvrir(`<div style="font-size:2.4rem">${a.ico}</div><h1>${esc(a.titre)}</h1>${a.texte.map(p => `<p>${esc(p)}</p>`).join("")}<p class="provisoire">Texte provisoire, à valider par Cindy</p>`); return; }
  if (d.supprMotiv != null) { const m = S.get("motivations", []); m.splice(+d.supprMotiv, 1); S.set("motivations", m); afficher("coffre"); return; }
  if (d.supprMusique != null) { const m = S.get("musiques", []); m.splice(+d.supprMusique, 1); S.set("musiques", m); afficher("coffre"); return; }
  if (d.supprPhoto) { if (confirm("Supprimer cette photo ?")) { await photos.suppr(d.supprPhoto); chargerGalerie(); } return; }
  const act = d.act;
  if (act === "enregistrer") { majJour(lireFormulaire()); toast("Journal enregistré 💛"); afficher("journal", true); }
  if (act === "compteur") reglerCompteur();
  if (act === "prenom") { ouvrir(`<h2>Mon prénom</h2><p class="doux">Pour que l'appli te dise bonjour. Optionnel.</p>
      <form data-form="prenom"><input class="champ" name="v" maxlength="30" value="${esc(S.get("prenom", ""))}"><button class="bouton plein" style="margin-top:12px">Enregistrer</button></form>`); }
  if (act === "code") reglerCode();
  if (act === "effacer") { if (confirm("Effacer TOUT ce que tu as noté sur ce téléphone ? Ça ne peut pas être annulé.")) {
      Object.keys(localStorage).filter(k => k.startsWith("mb_")).forEach(k => localStorage.removeItem(k)); await photos.vider(); toast("Tout est effacé"); afficher("accueil"); } }
});
ecran.addEventListener("input", e => { if (e.target.id === "envie") $("#envieVal").textContent = e.target.value; });
ecran.addEventListener("change", async e => {
  if (e.target.id === "envie") majJour(lireFormulaire());
  if (e.target.id === "filePhoto") {
    for (const f of e.target.files) { try { await photos.ajouter(await compresser(f)); } catch { toast("Cette image n'a pas pu être ajoutée"); } }
    e.target.value = ""; chargerGalerie();
  }
});
ecran.addEventListener("focusout", e => { if (e.target.id === "positif" || e.target.id === "dur") majJour(lireFormulaire()); });
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-form]"); if (!f) return; e.preventDefault();
  const v = f.v.value.trim(), type = f.dataset.form;
  if (type === "prenom") { S.set("prenom", v); fermer(); afficher(vue); return; }
  if (!v) return;
  if (type === "motiv") { S.set("motivations", [...S.get("motivations", []), v]); afficher("coffre"); }
  if (type === "musique") { let url = v; if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    try { const u = new URL(url); S.set("musiques", [...S.get("musiques", []), { url: u.href, nom: u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname.slice(0, 24) : "") }]); afficher("coffre"); }
    catch { toast("Ce lien n'a pas l'air valide"); } }
});

async function chargerGalerie() {
  const g = $("#galerie"); if (!g) return;
  g.querySelectorAll("figure").forEach(f => { const i = f.querySelector("img"); if (i) URL.revokeObjectURL(i.src); f.remove(); });
  const liste = await photos.tout();
  const ajout = g.querySelector(".ajout-photo");
  liste.forEach(p => { const f = document.createElement("figure"); f.innerHTML = `<img alt="Photo" src="${URL.createObjectURL(p.blob)}"><button class="suppr" data-suppr-photo="${p.id}" aria-label="Supprimer">×</button>`; g.insertBefore(f, ajout); });
}

/* ---------- Compteur & code ---------- */
function reglerCompteur() {
  ouvrir(`<h2>Mon compteur</h2><p class="doux">Depuis quand as-tu arrêté ? Si tu as craqué, tu peux repartir d'aujourd'hui : ce n'est pas un échec, c'est un nouveau départ.</p>
    <input type="date" class="champ" id="dateCompteur" max="${auj()}" value="${S.get("compteur", auj())}">
    <button class="bouton plein" style="margin-top:12px" id="okCompteur">Enregistrer</button>
    <button class="bouton ligne plein" style="margin-top:10px" id="zeroCompteur">Repartir d'aujourd'hui</button>
    ${S.get("compteur", null) ? `<button class="lien" style="margin-top:14px" id="stopCompteur">Arrêter le compteur</button>` : ""}`, el => {
    $("#okCompteur", el).onclick = () => { const v = $("#dateCompteur", el).value; if (v) { S.set("compteur", v > auj() ? auj() : v); fermer(); afficher(vue); toast("Compteur enregistré"); } };
    $("#zeroCompteur", el).onclick = () => { S.set("compteur", auj()); fermer(); afficher(vue); toast("Nouveau départ 🌱"); };
    const s = $("#stopCompteur", el); if (s) s.onclick = () => { localStorage.removeItem("mb_compteur"); fermer(); afficher(vue); };
  });
}
function reglerCode() {
  const actif = !!S.get("pin", null);
  ouvrir(`<h2>Code secret</h2><p class="doux">Un code à 4 chiffres pour ouvrir l'appli. ${actif ? "" : "Attention : si tu l'oublies, il faudra tout effacer."}</p>
    ${actif ? `<button class="bouton ligne plein" id="offPin">Désactiver le code</button>` :
    `<input class="champ" id="pin1" inputmode="numeric" maxlength="4" placeholder="4 chiffres" autocomplete="off">
     <input class="champ" id="pin2" inputmode="numeric" maxlength="4" placeholder="Encore une fois" autocomplete="off" style="margin-top:10px">
     <button class="bouton plein" style="margin-top:12px" id="okPin">Activer</button>`}`, el => {
    if (actif) { $("#offPin", el).onclick = () => { localStorage.removeItem("mb_pin"); fermer(); afficher(vue); toast("Code désactivé"); }; return; }
    $("#okPin", el).onclick = async () => { const a = $("#pin1", el).value, b = $("#pin2", el).value;
      if (!/^\d{4}$/.test(a)) return toast("Il faut 4 chiffres"); if (a !== b) return toast("Les deux codes sont différents");
      S.set("pin", await hache(a)); fermer(); afficher(vue); toast("Code activé 🔒"); };
  });
}
async function hache(s) {
  if (crypto.subtle) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("mabulle:" + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
  return "p" + s;
}
function verrou() {
  const pin = S.get("pin", null); if (!pin) return;
  const v = $("#verrou"), pave = $("#pave"), pts = [...document.querySelectorAll("#pinPoints i")]; let saisie = "";
  v.hidden = false;
  pave.innerHTML = [1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(x => x === "" ? "<span></span>" : `<button data-k="${x}">${x}</button>`).join("");
  pave.onclick = async e => { const k = e.target.closest("[data-k]"); if (!k) return; $("#pinErreur").hidden = true;
    saisie = k.dataset.k === "⌫" ? saisie.slice(0, -1) : (saisie + k.dataset.k).slice(0, 4);
    pts.forEach((p, i) => p.classList.toggle("on", i < saisie.length));
    if (saisie.length === 4) { if (await hache(saisie) === pin) v.hidden = true; else { $("#pinErreur").hidden = false; saisie = ""; pts.forEach(p => p.classList.remove("on")); } } };
}

/* ---------- Exercices ---------- */
function ouvrirExercice(id) {
  const x = C.exercices.find(e => e.id === id);
  if (x.type === "respiration") {
    ouvrir(`<div style="font-size:2.2rem">${x.ico}</div><h1>${esc(x.titre)}</h1><p>${esc(x.intro)}</p>
      <div class="souffle"><div class="bulle" id="bulle"><span id="consigne">Prêt·e ?</span></div>
      <div class="chrono" id="chrono">${Math.floor(x.total / 60)}:00</div>
      <button class="bouton" id="go">Commencer</button></div>`, el => {
      const bulle = $("#bulle", el), cons = $("#consigne", el), chrono = $("#chrono", el);
      $("#go", el).onclick = ev => { ev.target.hidden = true; let reste = x.total, ph = 0;
        const phases = [["Inspire", .95], ["Bloque", .95], ["Expire", .45], ["Bloque", .45]];
        const pas = () => { while (!x.rythme[ph % 4]) ph++; const i = ph % 4, s = x.rythme[i];
          bulle.style.setProperty("--t", s + "s"); bulle.style.setProperty("--s", phases[i][1]); cons.textContent = phases[i][0];
          ph++; minuteurs.push(setTimeout(pas, s * 1000)); };
        pas();
        minuteurs.push(setInterval(() => { reste--; chrono.textContent = `${Math.floor(reste / 60)}:${pad(reste % 60)}`;
          if (reste <= 0) { stopMinuteurs(); cons.textContent = "Bravo 💛"; bulle.style.setProperty("--s", .7); } }, 1000)); };
    });
  } else {
    let i = 0;
    const rendu = el => {
      const fin = i >= x.etapes.length - 1;
      el.querySelector("#etapes").innerHTML = `<div class="barre"><i style="width:${(i + 1) / x.etapes.length * 100}%"></i></div>
        <div class="etape-num">Étape ${i + 1} sur ${x.etapes.length}</div><p class="etape-texte">${esc(x.etapes[i])}</p>
        ${x.minuteur && i === 3 ? `<div class="chrono" id="chrono" style="margin-bottom:12px">10:00</div><button class="bouton ligne" id="lanceMin" style="margin-bottom:12px">Lancer 10 minutes</button>` : ""}
        <div style="display:flex;gap:10px">${i ? `<button class="bouton ligne" id="prec">Retour</button>` : ""}
        <button class="bouton" style="flex:1" id="suiv">${fin ? "Terminer" : "Suivant"}</button></div>`;
      const p = $("#prec", el); if (p) p.onclick = () => { i--; stopMinuteurs(); rendu(el); };
      $("#suiv", el).onclick = () => { if (fin) { fermer(); toast("Bravo, exercice terminé 💛"); } else { i++; rendu(el); } };
      const lm = $("#lanceMin", el); if (lm) lm.onclick = () => { lm.hidden = true; let r = x.minuteur;
        minuteurs.push(setInterval(() => { r--; $("#chrono", el).textContent = `${Math.floor(r / 60)}:${pad(r % 60)}`; if (r <= 0) { stopMinuteurs(); $("#chrono", el).textContent = "C'est passé 🌊"; } }, 1000)); };
    };
    ouvrir(`<div style="font-size:2.2rem">${x.ico}</div><h1>${esc(x.titre)}</h1><p class="doux">${esc(x.intro)}</p><div id="etapes"></div>`, rendu);
  }
}

/* ---------- Aide ---------- */
$("#btnAide").addEventListener("click", () => ouvrir(`<h1>Besoin d'aide ?</h1>
  <p class="doux">Tu n'es pas seul·e. Ces lignes sont là pour t'écouter, sans te juger.</p>
  ${C.aide.map(a => `<a class="num ${a.urgent ? "urgent" : ""}" href="tel:${a.tel}"><span><b>${esc(a.nom)}</b><small>${esc(a.detail)}</small></span><span class="tel">${esc(a.aff || a.tel)}</span></a>`).join("")}
  <p class="petit doux">Tu peux aussi parler à un adulte de confiance : parent, infirmier·e scolaire, éducateur·rice.</p>
  <button class="bouton ligne plein" data-fermer>Faire un exercice de calme</button>`, el => {
    el.querySelector("[data-fermer]").addEventListener("click", () => setTimeout(() => ouvrirExercice("coherence"), 50));
  }));

/* ---------- Démarrage ---------- */
afficher("accueil");
verrou();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
