/* Controlador: eventos, navegação, sorteio, timer, formulários e PWA. */
import {getData,getGame,saveGame,deleteGame,saveSession,deleteSession,saveTimer,exportData,importData} from './storage.js?release=9';
import {searchGames,gameDetails,hasApiKey,isDemoId,automaticCover} from './api.js?release=9';
import {suggestVibe,VIBES} from './vibes.js?release=9';
import {home,library,stats,settings,gameModal,detailModal,escapeHTML} from './ui.js?release=9';
const app=document.querySelector('#app-content'),modal=document.querySelector('#modal-root');
const state={page:'inicio',time:60,vibe:'historia',suggestionId:null,matchLabel:'',lastSuggested:null,filterStatus:'todos',filterVibe:'todos',filterSearch:''};
let debounce,controller,searchCounter=0,deferredInstall=null,tickId,modalReturnFocus=null;
const uid=()=>globalThis.crypto?.randomUUID?.()||`game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
function toast(message){const el=document.createElement('div');el.className='toast';el.textContent=message;document.querySelector('#toast-root').append(el);setTimeout(()=>el.remove(),4800);}
function guard(fn){try{const result=fn();if(result instanceof Promise)result.catch(e=>toast(e.message||'Ocorreu um erro.'));}catch(e){toast(e.message||'Ocorreu um erro.');}}
function render(){const data=getData();document.querySelector('#nav-count').textContent=data.games.length;
 document.querySelectorAll('[data-page]').forEach(b=>{const active=b.dataset.page===state.page;b.classList.toggle('active',active);if(b.classList.contains('nav-link')||b.classList.contains('mobile-link')){if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}});
 app.innerHTML=({inicio:()=>home(data,state),biblioteca:()=>library(data,state),estatisticas:()=>stats(data),configuracoes:()=>settings(data)}[state.page]||(()=>home(data,state)))();}
function navigate(page){state.page=page;history.replaceState(null,'',`#${page}`);render();window.scrollTo({top:0,behavior:'smooth'});}
function updateModal(content){modal.innerHTML=content;document.body.classList.add('modal-open');modal.querySelector('.icon-btn, input:not([type="hidden"]), button')?.focus();refreshTimer();}
function closeModal(){modal.innerHTML='';document.body.classList.remove('modal-open');if(controller)controller.abort();clearTimeout(debounce);clearInterval(tickId);modalReturnFocus?.focus?.();modalReturnFocus=null;}
function addGame(existing=null){modalReturnFocus=document.activeElement;updateModal(gameModal(existing));const form=modal.querySelector('#game-form');if(form)form.addEventListener('submit',event=>{event.preventDefault();event.stopPropagation();saveGameForm(form);});}
function viewGame(id){const game=getGame(id);if(!game)return;modalReturnFocus=document.activeElement;updateModal(detailModal(game,getData()));}
function saveGameForm(form){guard(()=>{if(!form.reportValidity())return;const game=fieldsToGame(form);saveGame(game);const stored=getGame(game.id);if(!stored)throw Error('Não foi possível confirmar o jogo salvo.');closeModal();render();toast(`✓ ${game.name} adicionado à biblioteca!`);});}
function fieldsToGame(form){const fd=new FormData(form);const csv=k=>String(fd.get(k)||'').split(',').map(x=>x.trim()).filter(Boolean);const name=String(fd.get('name')||'').trim();if(!name)throw Error('Informe o nome do jogo.');
 const old=getGame(String(fd.get('id'))) || {};
 const cover=String(fd.get('cover')||'').trim()||automaticCover(name);if(cover&&!/^https?:\/\//i.test(cover))throw Error('A capa precisa ter um endereço http(s).');
 const playtime=Number(fd.get('playtime'));if(!Number.isFinite(playtime)||playtime<0||playtime>10000)throw Error('Tempo estimado inválido.');
 return {...old,id:old.id||uid(),rawgId:fd.get('rawgId')||null,name,cover,genres:csv('genres'),tags:csv('tags'),description:String(fd.get('description')||''),playtime,vibe:fd.get('vibe')||'historia',status:fd.get('status')||'backlog',notes:String(fd.get('notes')||''),createdAt:old.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};}
function candidateGames(){return getData().games.filter(g=>['backlog','jogando'].includes(g.status));}
function suggest(){const list=candidateGames();if(!list.length){toast('Adicione jogos ao backlog primeiro.');return;}
 const ideal=list.filter(g=>g.vibe===state.vibe);const pool=ideal.length?ideal:list;
 // O playtime da RAWG é uma estimativa total, não duração mínima de sessão.
 // Priorizamos jogos já iniciados em sessões curtas, sem excluir jogos longos.
 const weight=g=>(g.vibe===state.vibe?4:1)+(g.status==='jogando'&&state.time<=60?3:0)+(g.playtime>0&&g.playtime<=state.time/60*2?2:0);
 const options=pool.length>1?pool.filter(g=>g.id!==state.lastSuggested):pool;
 const total=options.reduce((n,g)=>n+weight(g),0);let pick=Math.random()*total;let found=options.at(-1);for(const g of options){pick-=weight(g);if(pick<=0){found=g;break;}}
 state.suggestionId=found.id;state.lastSuggested=found.id;state.matchLabel=ideal.length?'Vibe combinando ✓':'Surpresa do backlog';state.page='inicio';render();document.querySelector('#recomendacao')?.scrollIntoView({behavior:'smooth',block:'center'});
}
function startGame(id){const game=getGame(id);if(!game)return;saveGame({...game,status:'jogando',updatedAt:new Date().toISOString()});render();viewGame(id);toast('Boa jogatina! Inicie o cronômetro ou registre seu tempo depois.');}
function elapsed(t){return t.accumulatedMs+(t.startedAt?Math.max(0,Date.now()-t.startedAt):0);}
function refreshTimer(){clearInterval(tickId);const display=document.querySelector('#timer-display');if(!display)return;const show=()=>{const t=getData().timer;if(!t)return;const s=Math.floor(elapsed(t)/1000);display.textContent=[Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(x=>String(x).padStart(2,'0')).join(':');};show();tickId=setInterval(show,1000);}
function toggleTimer(id){let t=getData().timer;if(!t||t.gameId!==id)throw Error('Cronômetro não encontrado.');if(t.startedAt)t={...t,accumulatedMs:elapsed(t),startedAt:null};else t={...t,startedAt:Date.now()};saveTimer(t);viewGame(id);}
function saveTrackedSession(id){const t=getData().timer;if(!t||t.gameId!==id)return;const minutes=Math.round(elapsed(t)/60000*100)/100;if(minutes<0.01){toast('Deixe o cronômetro rodar por pelo menos um segundo.');return;}saveSession({id:uid(),gameId:id,minutes,date:new Date().toISOString()});saveTimer(null);viewGame(id);render();toast('Sessão salva!');}
async function handleSearch(term){const target=document.querySelector('#search-results');if(!target)return;controller?.abort();clearTimeout(debounce);const seq=++searchCounter;
 if(term.trim().length<2){target.innerHTML='<p class="hint">Digite ao menos 2 letras ou cadastre manualmente.</p>';return;}
 target.innerHTML='<p class="hint">Buscando jogos...</p>';
 debounce=setTimeout(async()=>{controller=new AbortController();try{const result=await searchGames(term,controller.signal);if(seq!==searchCounter||!document.querySelector('#search-results'))return;target.innerHTML=result.length?result.map(g=>`<button type="button" class="search-hit" role="option" data-action="select-rawg" data-id="${g.id}"><span class="search-cover">${g.image?`<img src="${escapeHTML(g.image)}" alt="" loading="lazy">`:'✦'}</span><span><strong>${escapeHTML(g.name)}</strong><small>${escapeHTML(g.genres.join(', ')||g.released||'Jogo')}</small></span><span>＋</span></button>`).join(''):'<p class="hint">Nada encontrado. Você pode adicionar manualmente.</p>';}catch(e){if(e.name!=='AbortError'&&seq===searchCounter)target.innerHTML=`<p class="search-error">${escapeHTML(e.message)}</p>`;}},380);
}
async function selectRawg(id){const target=document.querySelector('#search-results');if(target)target.innerHTML='<p class="hint">Carregando detalhes do jogo...</p>';try{const detail=await gameDetails(id);const form=document.querySelector('#game-form');if(!form)return;for(const key of ['name','cover','description','playtime','rawgId'])form.elements[key].value=detail[key]??'';form.elements.genres.value=detail.genres.join(', ');form.elements.tags.value=detail.tags.join(', ');{const vibe=detail.vibe||suggestVibe(detail.genres,detail.tags);const radio=form.querySelector(`input[name="vibe"][value="${vibe}"]`);if(radio)radio.checked=true;}document.querySelector('#api-search').value=detail.name;target.innerHTML='<p class="search-success">✓ Jogo encontrado! Adicione à biblioteca ou ajuste os detalhes.</p>';form.querySelector('[type="submit"]')?.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e){if(target)target.innerHTML=`<p class="search-error">${escapeHTML(e.message)} Preencha manualmente abaixo.</p>`;}}
function downloadBackup(){const blob=new Blob([exportData()],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`qual-jogo-hoje-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exportado.');}
async function importBackup(file){if(!file)return;if(file.size>20*1024*1024)throw Error('Arquivo muito grande (máximo 20 MB).');const text=await file.text();if(!confirm('Isso substituirá TODOS os jogos e sessões atuais. Quer continuar?'))return;importData(text);state.suggestionId=null;render();toast('Backup importado com sucesso!');}
// Delegação de cliques mantém o funcionamento mesmo após re-renderizações.
document.addEventListener('click',event=>guard(()=>{const pageBtn=event.target.closest('[data-page]');if(pageBtn){navigate(pageBtn.dataset.page);return;}const time=event.target.closest('[data-time]');if(time){state.time=Number(time.dataset.time);render();return;}const vibe=event.target.closest('[data-vibe]');if(vibe){state.vibe=vibe.dataset.vibe;render();return;}
 const el=event.target.closest('[data-action]');if(!el)return;const action=el.dataset.action,id=el.dataset.id;
 if(action==='close-modal'){if(event.target===el||el.tagName==='BUTTON')closeModal();return;}
 if(action==='save-game'){event.preventDefault();const form=el.closest('#game-form');if(form)saveGameForm(form);return;}
 if(action==='add-game')addGame();if(action==='edit-game')addGame(getGame(id));if(action==='details')viewGame(id);
 if(action==='suggest')suggest();if(action==='start')startGame(id);
 if(action==='select-rawg')return selectRawg(id);
 if(action==='delete-game'){if(confirm(`Excluir "${getGame(id)?.name}" e todo o histórico de sessões?`)){deleteGame(id);if(state.suggestionId===id)state.suggestionId=null;closeModal();render();toast('Jogo removido.');}}
 if(action==='delete-session'){if(confirm('Excluir esta sessão?')){const current=modal.querySelector('.detail-modal');const selected=current?current.querySelector('[data-action="edit-game"]')?.dataset.id:null;deleteSession(id);render();if(selected)viewGame(selected);toast('Sessão removida.');}}
 if(action==='timer-start'){const t=getData().timer;if(t&&t.gameId!==id){toast('Finalize ou descarte o cronômetro do outro jogo primeiro.');return;}saveTimer({gameId:id,startedAt:Date.now(),accumulatedMs:0});viewGame(id);}
 if(action==='timer-toggle')toggleTimer(id);if(action==='timer-save')saveTrackedSession(id);
 if(action==='timer-discard'){if(confirm('Descartar esta sessão do cronômetro?')){const gameId=getData().timer?.gameId;saveTimer(null);if(gameId)viewGame(gameId);}}
 if(action==='export')downloadBackup();if(action==='clear-filters'){state.filterStatus='todos';state.filterVibe='todos';state.filterSearch='';render();}
}));
document.addEventListener('submit',event=>{if(event.target.id==='game-form'){event.preventDefault();saveGameForm(event.target);}
 if(event.target.id==='session-form'){event.preventDefault();guard(()=>{const fd=new FormData(event.target);const gameId=String(fd.get('gameId'));const minutes=Number(fd.get('hours'))*60+Number(fd.get('minutes'));if(!Number.isFinite(minutes)||minutes<=0||minutes>600000)throw Error('Informe um tempo válido maior que zero.');const date=new Date(`${fd.get('date')}T12:00:00`);if(Number.isNaN(date.getTime()))throw Error('Data inválida.');saveSession({id:uid(),gameId,minutes,date:date.toISOString()});render();viewGame(gameId);toast('Tempo registrado!');});}});
document.addEventListener('input',event=>{if(event.target.id==='api-search')handleSearch(event.target.value);if(event.target.id==='library-search'){state.filterSearch=event.target.value;const start=event.target.selectionStart;render();const input=document.querySelector('#library-search');input.focus();input.setSelectionRange(start,start);}});
document.addEventListener('change',event=>guard(async()=>{if(event.target.id==='filter-status'){state.filterStatus=event.target.value;render();}if(event.target.id==='filter-vibe'){state.filterVibe=event.target.value;render();}if(event.target.id==='detail-status'){const id=event.target.dataset.id,g=getGame(id);if(g){saveGame({...g,status:event.target.value});render();viewGame(id);toast('Status atualizado.');}}if(event.target.id==='import-file'){await importBackup(event.target.files[0]);event.target.value='';}}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.innerHTML)closeModal();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;document.querySelector('#install-btn').classList.remove('hidden');});
document.querySelector('#install-btn').addEventListener('click',async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;document.querySelector('#install-btn').classList.add('hidden');});
window.addEventListener('appinstalled',()=>{deferredInstall=null;document.querySelector('#install-btn').classList.add('hidden');toast('App instalado!');});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
const initial=location.hash.slice(1);state.page=['inicio','biblioteca','estatisticas','configuracoes'].includes(initial)?initial:'inicio';render();
