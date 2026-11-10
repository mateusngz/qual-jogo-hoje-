/* RAWG: resultados de busca e detalhes com cache local de 7 dias. */
const BASE='https://api.rawg.io/api', PREFIX='qjh:rawg:', TTL=7*86400000;
const memory=new Map();
// Catálogo demonstrativo embutido: funciona offline e sem chave. Não é conteúdo da RAWG.
const DEMO=[["Stardew Valley","Simulação, RPG","Relaxing, Farming, Indie, Singleplayer, Co-op",55,"relaxar","Cultive sua fazenda, conheça os moradores e explore o vale."],["Hollow Knight","Ação, Plataforma","Metroidvania, Difficult, Exploration, Atmospheric",27,"adrenalina","Explore um vasto reino subterrâneo cheio de segredos."],["Minecraft","Aventura, Sandbox","Survival, Crafting, Multiplayer, Relaxing",80,"relaxar","Construa, explore e sobreviva em um mundo de blocos."],["Elden Ring","Ação, RPG","Souls-like, Open World, Difficult, Exploration",60,"adrenalina","Uma aventura épica em um vasto mundo de fantasia."],["The Witcher 3: Wild Hunt","RPG, Aventura","Story Rich, Open World, Choices Matter",52,"historia","Acompanhe Geralt em uma jornada repleta de escolhas."],["Celeste","Plataforma, Indie","Difficult, Story Rich, Precision Platformer",9,"historia","Ajude Madeline a escalar uma montanha desafiadora."],["Hades","Ação, Roguelike","Fast-Paced, Roguelite, Hack and Slash",22,"adrenalina","Enfrente os desafios do submundo em combates intensos."],["Portal 2","Puzzle, Aventura","Co-op, Puzzle, Funny, Story Rich",9,"cooperativo","Resolva quebra-cabeças engenhosos usando portais."],["Terraria","Aventura, Sandbox","Crafting, Survival, Co-op, Exploration",50,"cooperativo","Explore, construa e enfrente chefes em mundos gerados."],["Rocket League","Esporte, Corrida","Competitive, Multiplayer, Online Co-op",20,"competir","Futebol com carros em partidas rápidas e competitivas."],["Red Dead Redemption 2","Ação, Aventura","Story Rich, Open World, Western",50,"historia","Viva a jornada de Arthur Morgan no Velho Oeste."],["Cyberpunk 2077","RPG, Ação","Story Rich, Open World, Sci-fi",25,"historia","Explore Night City em uma aventura futurista."],["Overcooked! 2","Casual, Simulação","Co-op, Multiplayer, Funny",8,"cooperativo","Prepare pratos em cozinhas caóticas com amigos."],["Slay the Spire","Estratégia, Roguelike","Card Game, Turn-Based, Deckbuilding",30,"relaxar","Monte seu baralho e enfrente desafios estratégicos."],["Cuphead","Ação, Plataforma","Difficult, Co-op, Boss Rush",12,"adrenalina","Enfrente chefes desafiadores em estilo de desenho clássico."]].map((g,i)=>({id:'demo-'+i,rawgId:null,name:g[0],cover:automaticCover(g[0]),genres:g[1].split(', '),tags:g[2].split(', '),playtime:g[3],vibe:g[4],description:g[5],demo:true}));
export const isDemoId=id=>String(id).startsWith('demo-');

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
export async function searchGames(term,signal){const q=term.trim().toLowerCase();if(q.length<2)return [];const key=`search:${q}`,cached=getCache(key);if(cached)return cached;if(!hasApiKey())return DEMO.filter(g=>g.name.toLowerCase().includes(q)).map(g=>({id:g.id,name:g.name,image:g.cover,released:'',genres:g.genres,demo:true})).slice(0,8);const body=await request('/games',{search:q,page_size:8},signal);const games=(body.results||[]).map(g=>({id:g.id,name:g.name,image:g.background_image,released:g.released,genres:(g.genres||[]).map(x=>x.name)}));setCache(key,games);return games;}
export async function gameDetails(id,signal){if(isDemoId(id)){const game=DEMO.find(g=>g.id===id);if(!game)throw Error('Jogo não encontrado.');return {...game};}const key=`details:${id}`,cached=getCache(key);if(cached)return cached;const g=await request(`/games/${encodeURIComponent(id)}`,{},signal);const game={rawgId:g.id,name:g.name||'',cover:g.background_image||'',genres:(g.genres||[]).map(x=>x.name),tags:(g.tags||[]).map(x=>x.name).slice(0,30),description:g.description_raw||'',playtime:Number(g.playtime)||0};setCache(key,game);return game;}

// Capas públicas da CDN da Steam para jogos conhecidos. Sem chave ou requisições de busca.
const STEAM_APP_IDS={
  "stardew valley": 413150,
  "hollow knight": 367520,
  "elden ring": 1245620,
  "the witcher 3: wild hunt": 292030,
  "celeste": 504230,
  "hades": 1145360,
  "portal 2": 620,
  "terraria": 105600,
  "rocket league": 252950,
  "red dead redemption 2": 1174180,
  "cyberpunk 2077": 1091500,
  "overcooked! 2": 728880,
  "slay the spire": 646570,
  "cuphead": 268910
};
export function automaticCover(name){const id=STEAM_APP_IDS[String(name||'').trim().toLowerCase()];return id? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg` : '' ;}
