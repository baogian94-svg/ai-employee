import { createClient } from '@supabase/supabase-js';

const form = document.querySelector('#chatForm');
const input = document.querySelector('#chatInput');
const messages = document.querySelector('#messages');
let stage = 0;
const prompts = ['Pour mieux vous orienter, vous êtes propriétaire du logement ?', 'Vous souhaitez démarrer quand ?', 'Très bien ! Pour un projet de rénovation, notre équipe peut vous conseiller. Quel créneau vous conviendrait ?'];
function addMessage(text, who) {
  const node = document.createElement('div');
  node.className = `msg ${who}`;
  node.textContent = text;
  const time = document.createElement('small');
  time.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  node.append(time); messages.append(node); messages.scrollTop = messages.scrollHeight;
}
function removeQuick() { messages.querySelector('.quick-replies')?.remove(); }
function quick(items) {
  const box = document.createElement('div'); box.className = 'quick-replies';
  items.forEach(label => { const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = label; btn.dataset.message = label; box.append(btn); });
  messages.append(box); messages.scrollTop = messages.scrollHeight;
}
function send(text) {
  const clean = text.trim(); if (!clean) return;
  removeQuick(); addMessage(clean, 'user'); input.value = '';
  const typing = document.createElement('div'); typing.className = 'msg bot typing'; typing.innerHTML = '<i></i><i></i><i></i>'; messages.append(typing);
  setTimeout(() => {
    typing.remove(); let response;
    if (stage === 0) { response = prompts[0]; stage = 1; quick(['Oui, je suis propriétaire', 'Je suis locataire']); }
    else if (stage === 1) { response = prompts[1]; stage = 2; quick(['Dès que possible', 'Dans les prochains mois', 'Je me renseigne']); }
    else if (stage === 2) { response = prompts[2]; stage = 3; quick(['Jeudi après-midi', 'Vendredi matin']); }
    else { response = `Parfait, je note votre préférence : « ${clean} ». Dans un vrai service, Nova vérifierait ici les disponibilités de l’équipe et confirmerait le rendez-vous.`; stage = 4; }
    addMessage(response, 'bot');
  }, 650);
}
form?.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
messages?.addEventListener('click', e => { if (e.target.matches('button[data-message]')) send(e.target.dataset.message); });
document.querySelector('.menu')?.addEventListener('click', () => document.querySelector('.nav nav')?.classList.toggle('mobile-open'));

const authPanel = document.querySelector('#authPanel');
const dashboard = document.querySelector('#customerDashboard');
const landingSections = [...document.querySelector('main').children].filter(el => !['authPanel', 'customerDashboard'].includes(el.id));
const authForm = document.querySelector('#authForm');
const authMessage = document.querySelector('#authMessage');
const config = import.meta.env;
const supabaseUrl = config.VITE_SUPABASE_URL;
const supabaseKey = config.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
let authMode = 'signin';

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle('error', isError);
}
function setView(view) {
  const isAuth = view === 'connexion';
  const isDashboard = view === 'dashboard';
  landingSections.forEach(section => { section.hidden = isAuth || isDashboard; });
  authPanel.hidden = !isAuth;
  dashboard.hidden = !isDashboard;
  document.body.classList.toggle('account-view', isAuth || isDashboard);
  document.querySelectorAll('[data-auth-link]').forEach(link => { link.href = '#connexion'; });
  if (isAuth) showMessage(supabase ? '' : 'La connexion Supabase n’est pas configurée. Vérifiez les variables Vercel et relancez le déploiement.', !supabase);
  window.scrollTo(0, 0);
}
function navigate() {
  const route = location.hash.replace('#', '') || '';
  if (route === 'dashboard') {
    if (!supabase) { setView('connexion'); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setView('dashboard');
      else { location.hash = 'connexion'; }
    });
  } else if (route === 'connexion') setView('connexion');
  else setView('home');
}
document.querySelectorAll('[data-auth-link]').forEach(link => link.addEventListener('click', () => { authMode = 'signin'; }));
document.querySelector('#switchAuthMode')?.addEventListener('click', () => {
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  document.querySelector('#authTitle').textContent = authMode === 'signup' ? 'Créer mon compte' : 'Bon retour chez Nova';
  document.querySelector('#authSubmit').textContent = authMode === 'signup' ? 'Créer mon compte' : 'Se connecter';
  document.querySelector('#switchAuthMode').textContent = authMode === 'signup' ? 'J’ai déjà un compte' : 'Créer un compte';
  showMessage('');
});
authForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!supabase) { showMessage('La connexion Supabase n’est pas configurée. Vérifiez les variables Vercel.', true); return; }
  const email = document.querySelector('#authEmail').value.trim();
  const password = document.querySelector('#authPassword').value;
  const submit = document.querySelector('#authSubmit');
  submit.disabled = true; showMessage('Connexion en cours…');
  try {
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/#connexion` } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    if (authMode === 'signup' && !result.data.session) {
      showMessage('Compte créé. Consultez votre boîte mail pour confirmer votre adresse, puis connectez-vous.');
    } else {
      showMessage('Connexion réussie.');
      location.hash = 'dashboard';
    }
  } catch (error) { showMessage(error.message || 'Une erreur est survenue.', true); }
  finally { submit.disabled = false; }
});
document.querySelector('#signOut')?.addEventListener('click', async () => {
  await supabase?.auth.signOut();
  authMode = 'signin'; location.hash = 'connexion';
});
if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (location.hash === '#dashboard' && !session) location.hash = 'connexion';
    if (location.hash === '#dashboard' && session) setView('dashboard');
    const emailLabel = document.querySelector('#customerEmail');
    if (emailLabel && session?.user) emailLabel.textContent = session.user.email;
  });
}
window.addEventListener('hashchange', navigate);
navigate();

