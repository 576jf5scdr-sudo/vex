const $=s=>document.querySelector(s),B=document.body;
let voices=[],voice=null,awake=false;
const PREF=['Serena','Martha','Kate','Stephanie','Google UK English Female','Daniel','Arthur'];
function loadVoices(){voices=speechSynthesis.getVoices();if(!voices.length)return;
 const gb=voices.filter(v=>/en[-_]GB/i.test(v.lang)),rest=voices.filter(v=>!/en[-_]GB/i.test(v.lang)&&/^en/i.test(v.lang));
 const list=[...gb,...rest],saved=localStorage.getItem('vexVoice');
 voice=list.find(v=>v.name===saved)||PREF.map(p=>gb.find(v=>v.name.includes(p))).find(Boolean)||gb[0]||list[0]||null;
 $('#voiceSel').innerHTML=list.map(v=>`<option ${v===voice?'selected':''} value="${v.name}">${v.name} (${v.lang})</option>`).join('');}
if('speechSynthesis' in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
$('#voiceSel').onchange=e=>{voice=voices.find(v=>v.name===e.target.value);localStorage.setItem('vexVoice',voice.name)};
$('#testV').onclick=()=>say('This is how I sound, boss.');
function say(t){$('#reply').textContent=t;if(!('speechSynthesis' in window))return;speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(t);if(voice){u.voice=voice;u.lang=voice.lang}else u.lang='en-GB';u.rate=1;u.pitch=1;
 u.onstart=()=>B.classList.add('speaking');u.onend=u.onerror=()=>B.classList.remove('speaking');speechSynthesis.speak(u);}
const status=t=>$('#status').textContent=t;
const R=[
 [/\b(take|assume)\b.*\bhuman\b|\bhuman form\b/,()=>humanForm()],
 [/\b(revert|go back|normal form|back to (the )?v)\b/,()=>revert()],
 [/\b(sleep|goodbye|bye|good night|shut down)\b/,()=>{say('Going to sleep. Call me when you need me, boss.');awake=false;close();status('Sleeping · tap to wake')}],
 [/\b(dashboard|open dash|show (me )?(my )?(stats|dashboard))\b/,()=>{open('#dash');say('Dashboard is up, boss.')}],
 [/\b(time)\b/,()=>say(`It's ${new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}, boss.`)],
 [/\b(date|day is it|today)\b/,()=>say(`Today is ${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}, boss.`)],
 [/\b(what can you do|help|commands)\b/,()=>say('Right now, boss: time and date, open dashboard, go to sleep, and take a human form. Money, trades and schedule are coming.')],
 [/\b(thank|thanks|cheers)\b/,()=>say('Always, boss.')],
 [/\b(hey|hi|hello|yo|wake up|vex)\b/,()=>{awake=true;say('Yes, boss?')}],
];
function handle(raw){const t=raw.toLowerCase().trim();if(!t)return;$('#heard').textContent='“'+raw+'”';
 for(const[re,fn]of R)if(re.test(t)){fn();status(B.classList.contains('human')?'Full power':'Ready');return}
 say("I can't do that one yet, boss. Say help to hear what I can do.");status('Ready');}
function open(s){close();$(s).classList.add('on')}function close(){document.querySelectorAll('.sheet').forEach(x=>x.classList.remove('on'))}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);
document.querySelectorAll('.sheet').forEach(s=>s.onclick=e=>{if(e.target===s)close()});
$('#dashBtn').onclick=()=>open('#dash');$('#setBtn').onclick=()=>{loadVoices();open('#set')};
function humanForm(){close();if(B.classList.contains('human')){say('Already in human form, boss.');return}
 const w=$('#vidWrap'),v=$('#vid');w.classList.add('on');v.currentTime=0;v.muted=true;
 const done=()=>{w.classList.remove('on');B.classList.add('human');status('Full power');say('Human form engaged, boss. Full power online.')};
 v.onended=done;v.play().catch(done);w.onclick=()=>{v.pause();done()};say('Transforming, boss.');}
function revert(){B.classList.remove('human');say('Back to standby form, boss.');status('Ready')}
$('#revert').onclick=revert;
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null,listening=false;
function listen(){if(!SR){say(awake?'Type your command below, boss.':'Yes, boss? Type your command below.');awake=true;$('#txt').focus();return}
 if(listening){rec.stop();return}
 speechSynthesis&&speechSynthesis.cancel();
 // unlock iOS speech audio inside the gesture
 try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}
 rec=new SR();rec.lang='en-GB';rec.interimResults=true;rec.continuous=false;let final='';
 rec.onstart=()=>{listening=true;B.classList.add('listening');status('Listening…');$('#heard').textContent=''};
 rec.onresult=e=>{let s='';for(const r of e.results){s+=r[0].transcript;if(r.isFinal)final=s}$('#heard').textContent=s};
 rec.onerror=e=>{status(e.error==='not-allowed'?'Mic blocked · use text':'Didn\'t catch that');};
 rec.onend=()=>{listening=false;B.classList.remove('listening');const t=final||$('#heard').textContent;if(t)handle(t.replace(/[“”]/g,''));else status('Tap to talk')};
 try{rec.start()}catch(e){status('Tap to talk')}}
$('#orb').onclick=listen;
$('#bar').onsubmit=e=>{e.preventDefault();const v=$('#txt').value;$('#txt').value='';$('#txt').blur();handle(v)};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
