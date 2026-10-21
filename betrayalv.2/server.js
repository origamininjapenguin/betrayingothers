const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html'});r.end(fs.readFileSync(path.join(__dirname,'public/index.html')))});
const wss=new WebSocketServer({server:srv});
const T=[0,2,3,3,4,5,6,7,8],NM=['Speed','Might','Sanity','Knowledge'],AT=['Ambush','Brawl','Mind Strike','Lore Strike'];
const CH=[{n:'Ada Whitlock, Scholar',s:[3,2,4,6],b:'A library-haunting academic who has read far too much.'},{n:'Bram Colter, Veteran',s:[4,6,3,3],b:'A scarred soldier who trusts his fists over his fears.'},{n:'Cecile Marne, Medium',s:[4,3,6,4],b:'She hears the house breathing, and it hears her back.'},{n:'Dorian Vane, Runner',s:[7,3,3,3],b:'A courier who never stops moving, for good reason.'},{n:'Edda Holt, Nurse',s:[4,3,5,5],b:'Steady hands, steady mind, and a bag of bandages.'},{n:'Felix Orr, Brute',s:[3,7,3,2],b:'Enormous, gentle, and surprisingly easy to frighten.'}];
const roll=n=>Array.from({length:n},()=>Math.floor(Math.random()*3)),sum=a=>a.reduce((x,y)=>x+y,0);
const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const DR={n:'e',e:'s',s:'w',w:'n'},OP={n:'s',s:'n',e:'w',w:'e'},V={n:[0,1],s:[0,-1],e:[1,0],w:[-1,0]};
const rot=(d,k)=>[...d].map(c=>{for(let i=0;i<k;i++)c=DR[c];return c}).join('');
const RM={G:[['Foyer','E','nsew'],['Kitchen','','ns'],['Dining Room','O','nsew'],['Library','E','ew'],['Chapel','E','ns'],['Conservatory','I','nesw'],['Parlor','E','nes'],['Gallery','O','ew'],['Study','I','nw'],['Pantry','I','s'],['Billiard Room','E','new'],['Servants Hall','','nsw']],
 U:[['Bedroom','I','ns'],['Attic','E','s'],['Master Bedroom','O','nsew'],['Nursery','E','ew'],['Balcony','E','e'],['Observatory','I','nsw'],['Sewing Room','O','ne'],['Mirror Hall','E','ew'],['Guest Room','I','nes'],['Trophy Room','O','nsew']],
 B:[['Cellar','E','nsew'],['Crypt','O','ns'],['Vault','I','s'],['Wine Cellar','E','ew'],['Catacombs','E','nesw'],['Boiler Room','I','nw'],['Pit','O','n'],['Ossuary','E','ne'],['Flooded Tunnel','','ew'],['Ritual Chamber','O','nsw']]};
const EV=[['Cold Touch','A cold hand brushes your neck.',2,3,3,1,''],['Rotten Boards','The floor splinters beneath you.',0,3,1,1,0],['Whispered Riddle','A whispered riddle fills the room.',3,4,2,1,3],['Falling Debris','Something heavy falls from the ceiling.',1,3,0,1,''],['Weeping Portrait','A portrait weeps blood and watches you.',2,4,3,1,2],['Music Box','A music box plays by itself.',2,3,2,1,''],['Late Reflection','Your reflection moves a moment too late.',3,3,2,2,3],['Closing Walls','The walls begin to close in.',1,4,0,1,1],['Spider Swarm','A swarm of spiders pours from a vent.',0,4,1,1,''],['Beckoning Children','Ghostly children beckon from the dark.',2,5,2,2,2],['Hidden Compartment','A hidden compartment clicks open.',3,3,'',0,1],['Lost Memories','Sleepwalking memories flood you.',3,4,3,1,2],['Lights Die','The lights gutter and die.',0,3,3,1,''],['Bitter Wind','A bitter wind carries a laugh.',2,4,0,1,'']];
const IT=[['Rusted Axe',1,2,'Heavy, notched, eager.'],['Lucky Locket',2,1,'It is warm, as if recently worn.'],['Old Journal',3,1,'Someone documented their own descent.'],['Running Boots',0,1,'Worn soles, light step.'],['Silver Dagger',1,1,'Cold even by firelight.'],['Brass Key',-1,0,'It fits some lock in this house.'],['Brass Key',-1,0,'It fits some lock in this house.'],['Brass Key',-1,0,'It fits some lock in this house.'],['Holy Candle',2,2,'It burns with steady white light.'],['Holy Candle',2,2,'It burns with steady white light.'],['Holy Candle',2,2,'It burns with steady white light.'],['Lantern',3,1,'Shadows retreat from it.'],['Heavy Gloves',1,1,'Thick leather, bloodstained.'],['Smelling Salts',2,1,'Sharp enough to wake the dead.'],['Spyglass',3,2,'It shows what the eye refuses.'],['Iron Pipe',1,1,'Crude, solid, effective.']];
const OM=[['Skull Mask','Its hollow eyes follow you.'],['Spirit Board','The planchette moves unbidden.'],['Bloodstained Ring','Still wet.'],['Cursed Dog Tag','Engraved with a name you almost know.'],['Madmans Notebook','Every page reads: LEAVE.'],['Black Candle','It burns without heat.'],['Cracked Mirror','Something paces behind the glass.'],['Hollow Doll','It blinks, slowly.'],['Rusted Locket','It will not open. It hums.'],['Plague Bell','It tolls when no one touches it.']];
const MT={'Wailing Shade':{hp:3,s:[5,2,5,3],k:2},'Deep Thrall':{hp:4,s:[3,4,3,2],k:1},'Doom Wraith':{hp:6,s:[4,3,6,4],k:2},'Door Warden':{hp:6,s:[2,6,3,2],k:1},'Porcelain Doll':{hp:2,s:[3,3,4,2],k:0},'Cultist':{hp:3,s:[3,3,4,4],k:3},'Plague Rat':{hp:1,s:[4,2,2,1],k:0},'Gravewalker':{hp:4,s:[2,5,3,1],k:1},'Hunger Hound':{hp:5,s:[6,5,3,2],k:1}};
const HT=[{n:'The Hollow Choir',r:'kill',aura:1,mon:[['Wailing Shade',2,'T']],i:'Unseen voices sing. The traitor conducts them, and their song drains the mind of any who linger near.',g:'Heroes: slay the traitor. Traitor: silence all heroes. Heroes beside the traitor lose Sanity each round.'},
 {n:'Ritual of the Deep',r:'ritual',mon:[['Deep Thrall',2,'B']],i:'Beneath the house a seal is breaking while the traitor chants in the dark.',g:'Traitor: end 6 turns in the Basement to finish the ritual. Heroes: kill the traitor first.'},
 {n:'The Rising Doom',r:'doom',mon:[['Doom Wraith',1,'T']],i:'The walls bleed and something vast is waking.',g:'Heroes: kill the traitor within 10 rounds or the house wins.'},
 {n:'The Locked House',r:'escape',mon:[['Door Warden',1,'E']],i:'Every window seals. Only the front door can still be forced, and a warden stands before it.',g:'Heroes: bring Brass Keys to the Entrance Hall (2 keys escape). Traitor: stop them.'},
 {n:'Blood Moon',r:'survive',mon:[],i:'A crimson moon rises and the traitor changes, hungry and fast.',g:'Heroes: survive 12 rounds or kill the traitor. The traitor is faster and stronger.'},
 {n:'The Collector',r:'kill',mon:[['Porcelain Doll',3,'T']],i:'The traitor has begun collecting. Each hero is a piece for the display.',g:'Traitor: eliminate all heroes. Heroes: destroy the collector.'},
 {n:'The Black Mass',r:'ward',mon:[['Cultist',2,'T']],i:'Robed figures chant in the dark. Only holy light can break the rite.',g:'Heroes: end turns in the Chapel with Holy Candles (3 candles win). Traitor: stop them.'},
 {n:'The Plague Cellar',r:'hunt',mon:[],i:'The walls swarm. Every round, more rats claw out of the dark.',g:'Heroes: kill the traitor before the rats overrun you. A new rat appears each round.'},
 {n:'The Gravewalkers',r:'kill',mon:[['Gravewalker',3,'B']],i:'The dead climb out of the Basement, patient and relentless.',g:'Heroes: kill the traitor. The Gravewalkers rise from the Basement Landing.'},
 {n:'The Slow Hunger',r:'decay',mon:[['Hunger Hound',1,'T']],i:'A hound with too many ribs stalks the halls, and the house itself feeds on your thoughts.',g:'Heroes: kill the traitor. Every round each hero loses 1 Knowledge.'}];
let G;
function fresh(){const t={};const A=(f,x,y,n,st)=>t[`${f},${x},${y}`]={n,sym:'',f,x,y,d:'nesw',st};A('G',0,0,'Entrance Hall');A('G',0,1,'Grand Staircase','U');A('U',0,0,'Upper Landing','G');A('B',0,0,'Basement Landing','G');A('G',1,0,'Basement Stairs','B');
 return{phase:'lobby',players:{},order:[],turn:0,round:1,prog:0,tiles:t,deck:{G:sh(RM.G.slice()),U:sh(RM.U.slice()),B:sh(RM.B.slice())},ev:sh(EV.slice()),it:sh(IT.slice()),om:sh(OM.slice()),omens:0,haunt:null,traitor:null,mons:[],nid:0,offer:null,log:[],n:0,winner:null}}
G=fresh();
const val=(p,k)=>T[p.s[k]];
function log(t,k='info',x){G.log.push({i:++G.n,t,k,...x});G.log=G.log.slice(-250)}
function rollLog(n,txt){const r=roll(n);log(txt+` Result: ${sum(r)}.`,'roll',{r});return sum(r)}
function pub(){return JSON.stringify({G:{...G,deck:undefined,ev:undefined,it:undefined,om:undefined},CH})}
function bc(){const m=pub();wss.clients.forEach(c=>c.readyState===1&&c.send(m))}
function hit(p,k,n){p.s[k]=Math.max(0,p.s[k]-n);if(p.s[k]==0&&!p.dead){p.dead=true;p.mv=0;log(p.name+' has died.','death');check()}}
function check(){if(!G.haunt||G.winner)return;const h=G.order.filter(i=>i!==G.traitor&&!G.players[i].dead);
 if(!h.length)G.winner='The Traitor ('+G.players[G.traitor].name+') wins';else if(G.players[G.traitor].dead)G.winner='The Heroes win'}
const adj=(p,nm,sg)=>{const it=IT.find(i=>i[0]==nm);if(it&&it[1]>=0)p.s[it[1]]=Math.max(1,Math.min(8,p.s[it[1]]+sg*it[2]))};
const G1=(k,m,once)=>(p,t)=>{if(once){t.u=t.u||{};if(t.u[p.id])return;t.u[p.id]=1}p.s[k]=Math.min(8,p.s[k]+1);log(`${p.name}: ${m} (+1 ${NM[k]}).`,'room')};
const TS=(k,need,l,m)=>(p,t)=>{const r=rollLog(val(p,k),`${m} ${p.name} tests ${NM[k]} (needs ${need}).`);if(r<need){log(`${p.name} loses 1 ${NM[l]}.`,'hit');hit(p,l,1)}else log(p.name+' resists.')};
const FX={Chapel:G1(2,'The chapel hush soothes',0),Library:G1(3,'Forbidden pages teach',1),Kitchen:G1(1,'A hearty larder feeds',1),Pantry:G1(1,'Preserved fruit restores',1),'Wine Cellar':G1(2,'A dusty vintage steadies the nerves',1),Observatory:G1(3,'The stars align',1),Conservatory:G1(0,'Fresh air quickens',1),
 Gallery:TS(2,3,2,'Painted eyes follow you.'),'Mirror Hall':TS(3,3,2,'Your reflection grins.'),Crypt:TS(2,3,2,'The dead whisper.'),Pit:TS(0,3,1,'The floor gives way.'),'Boiler Room':TS(0,3,1,'Steam scalds.'),Nursery:TS(2,3,2,'A lullaby rises.'),Ossuary:TS(2,3,2,'Bones rattle.'),'Ritual Chamber':TS(2,4,2,'The sigils burn your eyes.'),
 'Flooded Tunnel':p=>{log(p.name+' wades through icy water and must stop.','room');p.mv=0}};
function spawn(nm,f,x,y){const d=MT[nm];G.mons.push({id:++G.nid,name:nm,f,x,y,hp:d.hp,s:d.s.slice(),k:d.k,mv:0})}
function draw(p,sym){
 if(sym=='E'){const [ti,tx,st,need,lose,n,gain]=G.ev.pop()||EV[0];log(`${p.name} draws an Event card.`,'event',{card:{ty:'Event',ti,tx,ef:`Test ${NM[st]} (${need}+). Fail: ${lose!==''?'lose '+n+' '+NM[lose]:'nothing'}. Pass: ${gain!==''?'+1 '+NM[gain]:'you endure it'}.`}});
  const r=rollLog(val(p,st),`${p.name} tests ${NM[st]} against ${need}.`);if(r>=need){if(gain!==''){p.s[gain]=Math.min(8,p.s[gain]+1);log(`Fortune smiles: +1 ${NM[gain]}.`)}else log('They endure it.')}else if(lose!==''){log(`${p.name} loses ${n} ${NM[lose]}.`,'hit');hit(p,lose,n)}else log('Nothing happens.')}
 if(sym=='I'){const [nm,k,b,f]=G.it.pop()||IT[0];p.items.push(nm);if(k>=0)p.s[k]=Math.min(8,p.s[k]+b);log(`${p.name} draws an Item card: ${nm}.`,'item',{card:{ty:'Item',ti:nm,tx:f,ef:k>=0?`+${b} ${NM[k]} while carried.`:'A key. Useful for escaping, and tradable.'}})}
 if(sym=='O'){const [c,f]=G.om.pop()||OM[0];const idx=OM.findIndex(o=>o[0]==c);p.omens.push(c);G.omens++;log(`${p.name} draws an Omen card: ${c}.`,'omen',{card:{ty:'Omen',ti:c,tx:f,ef:'The house shudders. A haunt roll follows.'}});
  if(!G.haunt){const r=rollLog(6,`Haunt roll against ${G.omens} omens.`);if(r<G.omens){const h=HT[idx%HT.length];G.haunt=h;const o=G.order.filter(i=>i!==p.id&&!G.players[i].dead);G.traitor=o[Math.floor(Math.random()*o.length)]||p.id;const t=G.players[G.traitor];t.s[1]=Math.min(8,t.s[1]+2);if(h.r=='survive'){t.s[0]=Math.min(8,t.s[0]+2);t.s[1]=Math.min(8,t.s[1]+1)}
   h.mon.forEach(([nm,c,w])=>{for(let i=0;i<c;i++)w=='T'?spawn(nm,t.f,t.x,t.y):w=='E'?spawn(nm,'G',0,0):spawn(nm,'B',0,0)});
   log(`THE HAUNT BEGINS: ${h.n}. ${t.name} is the traitor!`,'haunt',{card:{ty:'Haunt',ti:h.n,tx:h.i+` ${t.name} has turned traitor!`,ef:h.g}})}}}}
function room(p,t){const f=FX[t.n];if(f&&!p.dead)f(p,t)}
function round(){const H=G.haunt;if(!H)return;if(H.r=='doom'&&G.round>10)G.winner='The house claims everyone';if(H.r=='survive'&&G.round>12)G.winner='The Heroes survive the night';
 if(H.r=='hunt'&&G.mons.length<6){const t=G.players[G.traitor];spawn('Plague Rat',t.f,t.x,t.y);log('A plague rat claws out of the walls.','omen')}
 if(H.r=='decay')G.order.forEach(i=>{const q=G.players[i];if(i!=G.traitor&&!q.dead){log(q.name+' wastes away.','hit');hit(q,3,1)}});check()}
function endTurn(p){const id=p.id,H=G.haunt;
 if(H&&!G.winner){
  if(id==G.traitor){if(H.r=='ritual'&&p.f=='B'){G.prog++;log(`The ritual advances (${G.prog}/6).`,'omen');if(G.prog>=6)G.winner='The Traitor completes the ritual'}
   if(H.aura)G.order.forEach(i=>{const q=G.players[i];if(i!=id&&!q.dead&&q.f==p.f&&q.x==p.x&&q.y==p.y){log(q.name+' is drained by the Choir.','hit');hit(q,2,1)}})}
  else{const t=G.tiles[`${p.f},${p.x},${p.y}`];
   if(H.r=='escape'){const ki=p.items.indexOf('Brass Key');if(t&&t.n=='Entrance Hall'&&ki>=0){p.items.splice(ki,1);G.prog++;log(`${p.name} forces the door with a key (${G.prog}/2).`,'item');if(G.prog>=2)G.winner='The Heroes escape'}}
   if(H.r=='ward'){const ki=p.items.indexOf('Holy Candle');if(t&&t.n=='Chapel'&&ki>=0){p.items.splice(ki,1);adj(p,'Holy Candle',-1);G.prog++;log(`${p.name} lights a Holy Candle in the Chapel (${G.prog}/3).`,'item');if(G.prog>=3)G.winner='The Heroes break the rite'}}}}
 check();if(G.winner){log(G.winner+'!','win');return}
 const old=G.turn;do{G.turn=(G.turn+1)%G.order.length}while(G.players[G.order[G.turn]].dead);if(G.turn<=old){G.round++;round()}
 if(G.winner){log(G.winner+'!','win');return}
 const q=G.players[G.order[G.turn]];q.mv=val(q,0);if(H&&q.id==G.traitor)G.mons.forEach(m=>m.mv=m.s[0]);log(`${q.name}'s turn.`,'turn')}
function duel(an,av,dn,dv,k){const A=roll(av),D=roll(dv);log(`${an} uses ${AT[k]} on ${dn}: ${sum(A)} against ${sum(D)}.`,'roll',{r:A.concat(D),n:A.length});return sum(A)-sum(D)}
function dmg(tgt,k,diff){const n=Math.min(3,diff);if(tgt.hp!==undefined){tgt.hp-=n;log(`${tgt.name} takes ${n} damage.`,'hit');if(tgt.hp<=0){G.mons=G.mons.filter(m=>m!==tgt);log(tgt.name+' is destroyed!','death')}}else{log(`${tgt.name} loses ${n} ${NM[k]}.`,'hit');hit(tgt,k,n)}}
const same=(a,b)=>a.f==b.f&&a.x==b.x&&a.y==b.y;
function step(e,d,m){const cur=G.tiles[`${e.f},${e.x},${e.y}`];if(!cur.d.includes(d)){log('A solid wall blocks the way.');return false}const x=e.x+V[d][0],y=e.y+V[d][1],nx=G.tiles[`${e.f},${x},${y}`];if(nx){if(!nx.d.includes(OP[d])){log('That room has no door facing you.');return false}e.x=x;e.y=y;e.mv--;return nx}
 if(m)return false;const t=G.deck[e.f].pop();if(!t){log('No unexplored rooms remain on this floor.');return false}const opts=[0,1,2,3].filter(q=>rot(t[2],q).includes(OP[d]));const r=opts[Math.floor(Math.random()*opts.length)];
 const nt=G.tiles[`${e.f},${x},${y}`]={n:t[0],sym:t[1],f:e.f,x,y,d:rot(t[2],r)};e.x=x;e.y=y;e.mv--;nt.fresh=1;return nt}
wss.on('connection',ws=>{ws.id=Math.random().toString(36).slice(2);ws.send(JSON.stringify({you:ws.id}));ws.send(pub());
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}
  if(m.t=='hello'){if(G.players[m.id]){ws.id=m.id;ws.send(JSON.stringify({you:ws.id}))}return}
  const id=ws.id,P=G.players;
  if(m.t=='join'&&G.phase=='lobby'&&!P[id]){const ci=+m.c;if(Object.values(P).some(p=>p.c==ci)||!CH[ci])return;P[id]={id,c:ci,name:CH[ci].n,s:CH[ci].s.slice(),f:'G',x:0,y:0,items:[],omens:[],mv:0,dead:false};G.order.push(id);log(CH[ci].n+' enters the house.')}
  else if(m.t=='start'&&G.phase=='lobby'&&G.order.length>=2){G.phase='play';G.order=sh(G.order);G.turn=G.order.length-1;G.round=0;endTurn({id:'',f:'G',x:0,y:0});log('The front door slams shut behind you.','omen')}
  else if(m.t=='reset'){G=fresh();log('The house resets. Choose your explorers again.')}
  else if(G.phase=='play'&&!G.winner&&m.t=='accept'&&G.offer&&G.offer.to==id){const o=G.offer,a=P[o.from],b=P[id];G.offer=null;const gi=a.items.indexOf(o.give),wi=o.want?b.items.indexOf(o.want):-1;
   if(gi>=0&&(!o.want||wi>=0)&&same(a,b)){a.items.splice(gi,1);adj(a,o.give,-1);b.items.push(o.give);adj(b,o.give,1);if(o.want){b.items.splice(b.items.indexOf(o.want),1);adj(b,o.want,-1);a.items.push(o.want);adj(a,o.want,1)}log(`${a.name} trades ${o.give} to ${b.name}${o.want?' for '+o.want:''}.`,'trade')}}
  else if(G.phase=='play'&&m.t=='decline'&&G.offer&&G.offer.to==id){log(P[id].name+' declines the trade.');G.offer=null}
  else if(G.phase=='play'&&!G.winner&&G.order[G.turn]==id){const p=P[id];const trt=id==G.traitor;
   if(m.t=='move'&&p.mv>0&&V[m.d]){const nt=step(p,m.d);if(!nt)return bc();if(nt.fresh){delete nt.fresh;log(`${p.name} opens a door and discovers the ${nt.n}.`,'discover');draw(p,nt.sym);if(nt.sym)p.mv=0}else log(p.name+' enters the '+nt.n+'.','move');room(p,nt)}
   else if(m.t=='stairs'){const t=G.tiles[`${p.f},${p.x},${p.y}`];if(t&&t.st&&p.mv>0){const a=Object.values(G.tiles).find(q=>q.f==t.st&&q.st==t.f);p.f=t.st;if(a){p.x=a.x;p.y=a.y}p.mv--;log(p.name+' takes the stairs.','move')}}
   else if(m.t=='mmove'&&trt&&G.haunt){const e=G.mons.find(q=>q.id==m.id);if(e&&e.mv>0&&V[m.d]){const nt=step(e,m.d,1);if(nt)log(e.name+' lurches into the '+nt.n+'.','move')}}
   else if(m.t=='mattack'&&trt&&G.haunt){const e=G.mons.find(q=>q.id==m.id),q=P[m.target];if(e&&q&&!q.dead&&q.id!=id&&same(e,q)&&e.mv>0){const d=duel(e.name,e.s[e.k],q.name,val(q,e.k),e.k);if(d>0)dmg(q,e.k,d);else log(q.name+' holds firm.');e.mv=0}}
   else if(m.t=='attack'&&G.haunt&&m.k>=0&&m.k<4){const mt=String(m.target).startsWith('m:'),q=mt?G.mons.find(x=>x.id==+m.target.slice(2)):P[m.target];if(!q||q.dead||!same(p,q)||q===p)return bc();
    if(trt&&mt)return bc();if(!trt&&!mt&&m.target!==G.traitor)return bc();
    const d=duel(p.name,val(p,m.k),q.name,mt?q.s[m.k]:val(q,m.k),m.k);if(d>0)dmg(q,m.k,d);else log(q.name+' holds firm.');p.mv=0}
   else if(m.t=='offer'){const q=P[m.to];if(!q||q.dead||q===p||!same(p,q)||(G.haunt&&(trt||m.to==G.traitor)))return bc();const g=p.items[m.give];if(!g||(m.want>=0&&!q.items[m.want]))return bc();G.offer={from:id,to:m.to,give:g,want:m.want>=0?q.items[m.want]:null};log(`${p.name} offers ${g}${G.offer.want?' for '+G.offer.want:''} to ${q.name}.`,'trade');return bc()}
   else if(m.t=='end')p.mv=0;
   const hold=trt&&m.t!='end'&&G.mons.some(x=>x.mv>0);if(!G.winner&&p.mv<=0&&!hold&&m.t!=null&&m.t!='offer')endTurn(p);else if(G.winner)log(G.winner+'!','win')}
  bc()});
 ws.on('close',()=>{})});
srv.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Betrayal server on port '+(process.env.PORT||3000)));
