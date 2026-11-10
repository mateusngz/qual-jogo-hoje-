/* RAWG: resultados de busca e detalhes com cache local de 7 dias. */
const BASE='https://api.rawg.io/api', PREFIX='qjh:rawg:', TTL=7*86400000;
const memory=new Map();
export const hasApiKey=()=>Boolean(window.APP_CONFIG?.RAWG_API_KEY&&window.APP_CONFIG.RAWG_API_KEY!=='SUA_CHAVE_RAWG_AQUI');
function getCache(key){const hit=memory.get(key);if(hit&&Date.now()-hit.time<TTL)return hit.value;try{const e=JSON.parse(localStorage.getItem(PREFIX+key));if(e&&Date.now()-e.time<TTL){memory.set(key,e);return e.value;}}catch{}return null;}
function setCache(key,value){const e={time:Date.now(),value};memory.set(key,e);try{localStorage.setItem(PREFIX+key,JSON.stringify(e));}catch{}}
async function request(path,query={},signal){
 if(!hasApiKey())throw Error('Adicione sua chave RAWG ao config.js, ou use o cadastro manual.');
 const params=new URLSearchParams({...query,key:window.APP_CONFIG.RAWG_API_KEY});let res;
 try{res=await fetch(`${BASE}${path}?${params}`,{signal,headers:{Accept:'application/json'}});}catch(e){if(e.name==='AbortError')throw e;throw Error('Sem conexão com a RAWG. Cadastre manualmente ou tente novamente.');}
 if(res.status===429)throw Error('Limite temporário da RAWG atingido. Tente mais tarde.');
 if([401,403].includes(res.status))throw Error('Chave RAWG inválida ou sem permissão. Verifique config.js.');
 if(!res.ok)throw Error(`Falha na RAWG (${res.status}). Tente novamente.`);
 try{return await res.json();}catch{throw Error('A RAWG retornou dados inválidos.');}
}
export async function searchGames(term,signal){const q=term.trim().toLowerCase();if(q.length<2)return [];const key=`search:${q}`,cached=getCache(key);if(cached)return cached;const body=await request('/games',{search:q,page_size:8},signal);const games=(body.results||[]).map(g=>({id:g.id,name:g.name,image:g.background_image,released:g.released,genres:(g.genres||[]).map(x=>x.name)}));setCache(key,games);return games;}
export async function gameDetails(id,signal){const key=`details:${id}`,cached=getCache(key);if(cached)return cached;const g=await request(`/games/${encodeURIComponent(id)}`,{},signal);const game={rawgId:g.id,name:g.name||'',cover:g.background_image||'',genres:(g.genres||[]).map(x=>x.name),tags:(g.tags||[]).map(x=>x.name).slice(0,30),description:g.description_raw||'',playtime:Number(g.playtime)||0};setCache(key,game);return game;}
