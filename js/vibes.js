/* Editável: cada vibe tem palavras-chave associadas a tags/gêneros RAWG. */
export const VIBES={
 historia:{label:'História',icon:'📖',description:'Mergulhar em outro universo',keys:['story rich','story','narrative','rpg','role-playing','adventure','visual novel','choices matter','singleplayer','atmospheric']},
 competir:{label:'Competir',icon:'🏆',description:'Dar o meu melhor',keys:['competitive','pvp','esports','ranked','sports','racing','fighting','multiplayer','strategy']},
 relaxar:{label:'Relaxar',icon:'🌿',description:'Jogar sem pressão',keys:['relaxing','casual','cozy','farming','simulation','sandbox','puzzle','building','exploration','walking simulator','indie']},
 adrenalina:{label:'Adrenalina',icon:'⚡',description:'Sentir o coração acelerar',keys:['action','shooter','fps','souls-like','soulslike','horror','survival','fast-paced','hack and slash','difficult','platformer']},
 cooperativo:{label:'Cooperativo',icon:'🤝',description:'Jogar com a galera',keys:['co-op','coop','cooperative','online co-op','local co-op','team-based','party game','split screen','multiplayer']}
};
const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function suggestVibe(genres=[],tags=[]){const words=[...genres,...tags].map(normalize);let best='historia',score=0;for(const [key,v]of Object.entries(VIBES)){const points=v.keys.reduce((sum,term)=>sum+words.reduce((n,w)=>n+(w===term?3:w.includes(term)?1:0),0),0);if(points>score){best=key;score=points;}}return best;}
