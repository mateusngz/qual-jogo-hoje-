/* Persistência local e validação de backups. */
const KEY='qual-jogo-hoje:v1';
const blank=()=>({version:1,games:[],sessions:[],timer:null});
export function validate(input){
 if(!input||!Array.isArray(input.games)||!Array.isArray(input.sessions))throw Error('Backup inválido: jogos ou sessões ausentes.');
 if(input.games.length>10000||input.sessions.length>100000)throw Error('Backup grande demais.');
 const ids=new Set();
 const games=input.games.map(g=>{if(!g||typeof g.id!=='string'||!g.id||typeof g.name!=='string'||!g.name.trim()||ids.has(g.id))throw Error('Backup com jogos inválidos ou duplicados.');ids.add(g.id);return {...g,genres:Array.isArray(g.genres)?g.genres.filter(x=>typeof x==='string').slice(0,60):[],tags:Array.isArray(g.tags)?g.tags.filter(x=>typeof x==='string').slice(0,80):[],status:['backlog','jogando','zerado','abandonado'].includes(g.status)?g.status:'backlog'};});
 const sessions=input.sessions.map(s=>{if(!s||!ids.has(s.gameId)||!Number.isFinite(Number(s.minutes))||Number(s.minutes)<=0||Number(s.minutes)>1000000||Number.isNaN(Date.parse(s.date)))throw Error('Backup com sessões inválidas.');return {id:String(s.id||crypto.randomUUID()),gameId:s.gameId,minutes:Number(s.minutes),date:new Date(s.date).toISOString()};});
 const t=input.timer;
 const timer=t&&ids.has(t.gameId)&&Number.isFinite(t.accumulatedMs)&&t.accumulatedMs>=0?{gameId:t.gameId,accumulatedMs:t.accumulatedMs,startedAt:Number.isFinite(t.startedAt)?t.startedAt:null}:null;
 return {version:1,games,sessions,timer};
}
let data;
try{data=validate(JSON.parse(localStorage.getItem(KEY)||'null')||blank());}catch{data=blank();}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{throw Error('Não foi possível salvar no navegador. Exporte um backup e libere espaço.');}}
export const getData=()=>structuredClone(data);
export const getGame=id=>data.games.find(g=>g.id===id);
export function saveGame(g){const i=data.games.findIndex(x=>x.id===g.id);if(i>=0)data.games[i]=g;else data.games.unshift(g);persist();}
export function deleteGame(id){data.games=data.games.filter(g=>g.id!==id);data.sessions=data.sessions.filter(s=>s.gameId!==id);if(data.timer?.gameId===id)data.timer=null;persist();}
export function saveSession(s){data.sessions.unshift(s);persist();}
export function deleteSession(id){data.sessions=data.sessions.filter(s=>s.id!==id);persist();}
export function saveTimer(t){data.timer=t;persist();}
export const exportData=()=>JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2);
export function importData(raw){const next=validate(JSON.parse(raw));const old=data;data=next;try{persist();}catch(e){data=old;throw e;}}
