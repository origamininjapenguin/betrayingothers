const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(fs.readFileSync(path.join(__dirname,'public/index.html')))});
const wss=new WebSocketServer({server:srv});
const T=[0,2,3,3,4,5,6,7,8],K={spd:0,mgt:1,san:2,kno:3},NM=['Speed','Might','Sanity','Knowledge'];
const CH=[{n:'Ada Whitlock, Scholar',s:[3,2,4,6]},{n:'Bram Colter, Veteran',s:[4,6,3,3]},{n:'Cecile Marne, Medium',s:[4,3,6,4]},{n:'Dorian Vane, Runner',s:[7,3,3,3]},{n:'Edda Holt, Nurse',s:[4,3,5,5]},{n:'Felix Orr, Brute',s:[3,7,3,2]}];
const dice=n=>{let s=0;for(let i=0;i<n;i++)s+=Math.floor(Math.random()*3);return s};
const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const DR={n:'e',e:'s',s:'w',w:'n'},OP={n:'s',s:'n',e:'w',w:'e'},V={n:[0,1],s:[0,-1],e:[1,0],w:[-1,0]};
const rot=(d,k)=>[...d].map(c=>{for(let i=0;i<k;i++)c=DR[c];return c}).join('');
const RM={G:[['Foyer','E','nsew'],['Kitchen','','ns'],['Dining Room','O','nsew'],['Library','E','ew'],['Chapel','E','ns'],['Conservatory','I','nesw'],['Parlor','E','nes'],['Gallery','O','ew'],['Study','I','nw'],['Pantry','I','s'],['Billiard Room','E','new'],['Servants Hall','','nsw']],
 U:[['Bedroom','I','ns'],['Attic','E','s'],['Master Bedroom','O','nsew'],['Nursery','E','ew'],['Balcony','E','e'],['Observatory','I','nsw'],['Sewing Room','O','ne'],['Mirror Hall','E','ew'],['Guest Room','I','nes'],['Trophy Room','O','nsew']],
 B:[['Cellar','E','nsew'],['Crypt','O','ns'],['Vault','I','s'],['Wine Cellar','E','ew'],['Catacombs','E','nesw'],['Boiler Room','I','nw'],['Pit','O','n'],['Ossuary','E','ne'],['Flooded Tunnel','','ew'],['Ritual Chamber','O','nsw']]};
const EV=[['A cold hand brushes your neck.','san',3,'kno',1,''],['The floor splinters beneath you.','spd',3,'mgt',1,'spd'],['A whispered riddle fills the room.','kno',4,'san',1,'kno'],['Something heavy falls from the ceiling.','mgt',3,'spd',1,''],['A portrait weeps blood and watches you.','san',4,'kno',1,'san'],['A music box plays by itself.','san',3,'san',1,''],['Your reflection moves a moment too late.','kno',3,'san',2,'kno'],['The walls begin to close in.','mgt',4,'spd',1,'mgt'],['A spider swarm pours from a vent.','spd',4,'mgt',1,''],['Ghostly children beckon from the dark.','san',5,'san',2,'san'],['A hidden compartment clicks open.','kno',3,'',0,'mgt'],['Sleepwalking memories flood you.','kno',4,'kno',1,'san'],['The lights gutter and die.','spd',3,'kno',1,''],['A bitter wind carries a laugh.','san',4,'spd',1,'']];
const IT=[['Rusted Axe',1,2],['Lucky Locket',2,1],['Old Journal',3,1],['Running Boots',0,1],['Silver Dagger',1,1],['Brass Key',-1,0],['Brass Key',-1,0],['Brass Key',-1,0],['Holy Candle',2,2],['Lantern',3,1],['Heavy Gloves',1,1],['Smelling Salts',2,1],['Spyglass',3,2],['Iron Pipe',1,1]];
const OM=['Skull Mask','Spirit Board','Bloodstained Ring','Cursed Dog Tag','Madmans Notebook','Black Candle','Cracked Mirror','Hollow Doll','Rusted Locket'];
const HT=[{n:'The Hollow Choir',r:'kill',aura:1,i:'Unseen voices sing. The traitor is their conductor, and their song drains the mind of any who linger near.',g:'Heroes: slay the traitor. Traitor: silence every hero. Heroes near the traitor lose Sanity.'},
 {n:'Ritual of the Deep',r:'ritual',i:'Beneath the house a seal is breaking. The traitor chants in the dark.',g:'Traitor: end 6 turns in the Basement to complete the ritual. Heroes: kill the traitor first.'},
 {n:'The Rising Doom',r:'doom',i:'The house screams and the walls bleed. Something vast is waking.',g:'Heroes: kill the traitor within 10 rounds or the house wins.'},
 {n:'The Locked House',r:'escape',i:'Every window seals. Only the Entrance Hall door can still be forced.',g:'Heroes: bring Brass Keys to the Entrance Hall (2 keys escape). Traitor: stop them.'},
 {n:'Blood Moon',r:'survive',i:'A crimson moon rises. The traitor changes, hungry and fast.',g:'Heroes: survive 12 rounds or kill the traitor. The traitor is faster and stronger.'},
 {n:'The Collector',r:'kill',i:'The traitor has begun collecting. Each hero is a piece for the display.',g:'Traitor: eliminate all heroes. Heroes: destroy the collector.'}];
let G;
function fresh(){const t={};const A=(f,x,y,n,st)=>t[`${f},${x},${y}`]={n,sym:'',f,x,y,d:'nesw',st};A('G',0,0,'Entrance Hall');A('G',0,1,'Grand Staircase','U');A('U',0,0,'Upper Landing','G');A('B',0,0,'Basement Landing','G');A('G',1,0,'Basement Stairs','B');
 return{phase:'lobby',players:{},order:[],turn:0,round:1,prog:0,tiles:t,deck:{G:sh(RM.G.slice()),U:sh(RM.U.slice()),B:sh(RM.B.slice())},ev:sh(EV.slice()),it:sh(IT.slice()),om:sh(OM.slice()),omens:0,haunt:null,traitor:null,log:[],n:0,winner:null}}
G=fresh();
const val=(p,k)=>T[p.s[k]];
function log(t,k='info'){G.log.push({i:++G.n,t,k});G.log=G.log.slice(-40)}
function pub(){return JSON.stringify({G:{...G,deck:undefined,ev:undefined,it:undefined,om:undefined},CH:CH.map(c=>c.n)})}
function bc(){const m=pub();wss.clients.forEach(c=>c.readyState===1&&c.send(m))}
function hit(p,k,n){p.s[k]=Math.max(0,p.s[k]-n);if(p.s[k]==0&&!p.dead){p.dead=true;log(p.name+' has died.','death');check()}}
function check(){if(!G.haunt||G.winner)return;const h=G.order.filter(i=>i!==G.traitor&&!G.players[i].dead);
 if(!h.length)G.winner='The Traitor ('+G.players[G.traitor].name+') wins';else if(G.players[G.traitor].dead)G.winner='The Heroes win'}
function draw(p,sym){
 if(sym=='E'){const [t,st,need,lose,n,gain]=G.ev.pop()||EV[0];const r=dice(val(p,K[st]));log(`EVENT: ${t}`,'event');const ok=r>=need;log(`${p.name} rolls ${r} against ${need} (${NM[K[st]]}). `+(ok?(gain?'Fortune smiles: +1 '+NM[K[gain]]+'.':'They endure it.'):(lose?`They suffer, losing ${n} ${NM[K[lose]]}.`:'Nothing happens.')),ok?'info':'hit');
  if(ok&&gain)p.s[K[gain]]=Math.min(8,p.s[K[gain]]+1);if(!ok&&lose)hit(p,K[lose],n)}
 if(sym=='I'){const [nm,k,b]=G.it.pop()||IT[0];p.items.push(nm);log(`ITEM: ${p.name} finds a ${nm}${k>=0?' (+'+b+' '+NM[k]+')':' — it might unlock something'}.`,'item');if(k>=0)p.s[k]=Math.min(8,p.s[k]+b)}
 if(sym=='O'){const c=G.om.pop()||OM[0];const idx=OM.indexOf(c);p.omens.push(c);G.omens++;log(`OMEN: ${p.name} claims the ${c}. The house shudders.`,'omen');
  if(!G.haunt){const r=dice(6);log(`Haunt roll: ${r} against ${G.omens} omens.`);if(r<G.omens){const h=HT[idx%6];G.haunt=h;const o=G.order.filter(i=>i!==p.id&&!G.players[i].dead);G.traitor=o[Math.floor(Math.random()*o.length)]||p.id;const t=G.players[G.traitor];t.s[1]=Math.min(8,t.s[1]+2);if(h.r=='survive'){t.s[0]=Math.min(8,t.s[0]+2);t.s[1]=Math.min(8,t.s[1]+1)}
   log(`THE HAUNT BEGINS: ${h.n}. ${h.i} ${t.name} has turned traitor! ${h.g}`,'haunt')}}}}
function endTurn(p){const id=p.id,H=G.haunt;
 if(H&&!G.winner){const tr=G.players[G.traitor];
  if(id==G.traitor){if(H.r=='ritual'&&p.f=='B'){G.prog++;log(`The ritual advances (${G.prog}/6).`,'omen');if(G.prog>=6)G.winner='The Traitor completes the ritual'}
   if(H.aura)G.order.forEach(i=>{const q=G.players[i];if(i!=id&&!q.dead&&q.f==p.f&&q.x==p.x&&q.y==p.y){log(q.name+' is drained by the Choir.','hit');hit(q,2,1)}})}
  else if(H.r=='escape'){const t=G.tiles[`${p.f},${p.x},${p.y}`],ki=p.items.indexOf('Brass Key');if(t&&t.n=='Entrance Hall'&&ki>=0){p.items.splice(ki,1);G.prog++;log(`${p.name} forces the door with a key (${G.prog}/2).`,'item');if(G.prog>=2)G.winner='The Heroes escape'}}}
 check();if(G.winner){log(G.winner+'!','win');return}
 const old=G.turn;do{G.turn=(G.turn+1)%G.order.length}while(G.players[G.order[G.turn]].dead);if(G.turn<=old){G.round++;if(H&&H.r=='doom'&&G.round>10)G.winner='The house claims everyone';if(H&&H.r=='survive'&&G.round>12)G.winner='The Heroes survive the night'}
 if(G.winner){log(G.winner+'!','win');return}
 const q=G.players[G.order[G.turn]];q.mv=val(q,0);log(`${q.name}'s turn.`,'turn')}
wss.on('connection',ws=>{ws.id=Math.random().toString(36).slice(2);ws.send(JSON.stringify({you:ws.id}));ws.send(pub());
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}
  if(m.t=='hello'){if(G.players[m.id]){ws.id=m.id;ws.send(JSON.stringify({you:ws.id}))}return}
  const id=ws.id;
  if(m.t=='join'&&G.phase=='lobby'&&!G.players[id]){const ci=+m.c;if(Object.values(G.players).some(p=>p.c==ci)||!CH[ci])return;G.players[id]={id,c:ci,name:CH[ci].n,s:CH[ci].s.slice(),f:'G',x:0,y:0,items:[],omens:[],mv:0,dead:false};G.order.push(id);log(CH[ci].n+' enters the house.')}
  else if(m.t=='start'&&G.phase=='lobby'&&G.order.length>=2){G.phase='play';G.turn=-1;G.order=sh(G.order);G.turn=G.order.length-1;G.round=0;endTurn({id:'',f:'G',x:0,y:0});log('The front door slams shut behind you.','omen')}
  else if(m.t=='reset'){const keep=Object.values(G.players);G=fresh();log('The house resets. Choose your explorers again.')}
  else if(G.phase=='play'&&!G.winner&&G.order[G.turn]==id){const p=G.players[id];let done=false;
   if(m.t=='move'&&p.mv>0&&V[m.d]){const cur=G.tiles[`${p.f},${p.x},${p.y}`];if(!cur.d.includes(m.d)){log('A solid wall blocks the way.');return bc()}
    const x=p.x+V[m.d][0],y=p.y+V[m.d][1],k=`${p.f},${x},${y}`,nx=G.tiles[k];
    if(nx){if(!nx.d.includes(OP[m.d])){log('That room has no door facing you.');return bc()}p.x=x;p.y=y;p.mv--;log(p.name+' enters the '+nx.n+'.','move')}
    else{const t=G.deck[p.f].pop();if(!t){log('No unexplored rooms remain on this floor.');return bc()}let r=0;while(!rot(t[2],r).includes(OP[m.d]))r++;const opts=[0,1,2,3].filter(q=>rot(t[2],q).includes(OP[m.d]));r=opts[Math.floor(Math.random()*opts.length)];
     G.tiles[k]={n:t[0],sym:t[1],f:p.f,x,y,d:rot(t[2],r)};p.x=x;p.y=y;log(`${p.name} opens a door and discovers the ${t[0]}.`,'discover');draw(p,t[1]);if(t[1])p.mv=0;else p.mv--}}
   else if(m.t=='stairs'){const t=G.tiles[`${p.f},${p.x},${p.y}`];if(t&&t.st&&p.mv>0){const a=Object.values(G.tiles).find(q=>q.f==t.st&&q.st==t.f);p.f=t.st;if(a){p.x=a.x;p.y=a.y}p.mv--;log(p.name+' takes the stairs.','move')}}
   else if(m.t=='attack'&&G.haunt){const q=G.players[m.target];if(!q||q.dead||q.f!=p.f||q.x!=p.x||q.y!=p.y||(id!==G.traitor&&m.target!==G.traitor)||m.target==id)return;
    const a=dice(val(p,1)),b=dice(val(q,1));log(`${p.name} attacks ${q.name}: ${a} against ${b}.`,'hit');if(a>b)hit(q,1,a-b>2?2:1);else if(b>a)hit(p,1,1);p.mv=0}
   else if(m.t=='end')p.mv=0;
   if(!G.winner&&p.mv<=0&&m.t!=null)endTurn(p);else if(G.winner)log(G.winner+'!','win')}
  bc()});
 ws.on('close',()=>{})});
srv.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Betrayal server on port '+(process.env.PORT||3000)));
