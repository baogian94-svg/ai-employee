const form=document.querySelector('#chatForm');
const input=document.querySelector('#chatInput');
const messages=document.querySelector('#messages');
let stage=0;
const prompts=['Pour mieux vous orienter, vous êtes propriétaire du logement ?','Vous souhaitez démarrer quand ?','Très bien ! Pour un projet de rénovation, notre équipe peut vous conseiller. Quel créneau vous conviendrait ?'];
const replies=['Oui, je suis propriétaire','Dans les prochains mois','Jeudi après-midi'];
function addMessage(text,who){const node=document.createElement('div');node.className=`msg ${who}`;node.textContent=text;const time=document.createElement('small');time.textContent=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});node.append(time);messages.append(node);messages.scrollTop=messages.scrollHeight;}
function removeQuick(){messages.querySelector('.quick-replies')?.remove();}
function quick(items){const box=document.createElement('div');box.className='quick-replies';items.forEach(label=>{const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.dataset.message=label;box.append(btn)});messages.append(box);messages.scrollTop=messages.scrollHeight;}
function send(text){const clean=text.trim();if(!clean)return;removeQuick();addMessage(clean,'user');input.value='';const typing=document.createElement('div');typing.className='msg bot typing';typing.innerHTML='<i></i><i></i><i></i>';messages.append(typing);messages.scrollTop=messages.scrollHeight;setTimeout(()=>{typing.remove();let response;if(stage===0){response=prompts[0];stage=1;quick(['Oui, je suis propriétaire','Je suis locataire']);}else if(stage===1){response=prompts[1];stage=2;quick(['Dès que possible','Dans les prochains mois','Je me renseigne']);}else if(stage===2){response=prompts[2];stage=3;quick(['Jeudi après-midi','Vendredi matin']);}else{response=`Parfait, je note votre préférence : « ${clean} ». Dans un vrai service, Nova vérifierait ici les disponibilités de l’équipe et confirmerait le rendez-vous.`;stage=4;}addMessage(response,'bot');},650);}
form.addEventListener('submit',e=>{e.preventDefault();send(input.value)});
messages.addEventListener('click',e=>{if(e.target.matches('button[data-message]'))send(e.target.dataset.message)});
document.querySelector('.menu').addEventListener('click',()=>{const nav=document.querySelector('.nav nav');nav.classList.toggle('mobile-open');});
