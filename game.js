(() => {
  'use strict';
  const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
  const mapCanvas = document.querySelector('#minimap'), mapCtx = mapCanvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const PREVIEW=false;
  const WORLD = { w: 4400, h: 1940 }, SAVE_KEY = 'wind-machine-playtest-v1';
  const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const WISH_COST=20;
  const MOVE={speed:330,jump:700,doubleJump:640,flipJump:850,turnWindow:.32,turnMinSpeed:70,flipDuration:.65,airSpinDuration:.55};
  const keys = new Set(), justPressed = new Set();
  let W = 1280, H = 720, player, platforms, coins, books, enemies, particles = [];
  let camera = { x: 0, y: 620 }, clock = 0, paused = false, won = false, sound = true;
  let collectedCoins = new Set(), collectedBooks = new Set(), toastUntil = 0, zone = -1, lastTime = 0, accumulator = 0;
  const ENTRANCE = { x: 490, y: 1204 };
  let scene='courtyard', meadowGeometry;
  let renderDirty=true;
  let bookReveal=null;
  let race=null;
  let opening=null,storyComplete=false,speech=null;
  let expedition=null,expansionProgress={},retiredBooks=[];
  const revealQueue=[];
  const baseline=window.WindLevel?window.WindLevel.resolve(window.WIND_WORLD_DATA):window.WIND_WORLD_DATA;
  const shared=window.WindExpansion?window.WindExpansion.augment(baseline):baseline,catalog=shared.books.filter(b=>b.worldId==='machine');
  // HTML-only hidden loft: normal approach lands on its upper surface.
  {const room=shared.worlds.library,roof=room.platforms.find(p=>p.art_surface==='roof'),floor=room.platforms.find(p=>p!==roof&&p.x===roof.x&&p.y===245);
    const dx=80,dy=320;for(const p of [roof,floor]){p.x+=dx;p.y+=dy;if(p.baseX!==undefined)p.baseX+=dx;if(p.baseY!==undefined)p.baseY+=dy;if(p.surface)p.surface=p.surface.map(([x,y])=>[x+dx,y+dy]);}
    floor.loftFloor=true;floor.disabled=true;shared.loft.slotX+=dx;shared.loft.slotY+=dy;shared.loft.shelf.x+=dx;shared.loft.shelf.y+=dy;room.size.w=Math.max(room.size.w,roof.x+roof.w+40);
  }
  const expansionWorld=()=>shared.expansions?.[scene];
  const adventureScene=()=>scene==='meadow'||!!expansionWorld();
  const meadow=shared.webMeadow||{exit:{x:365,y:1210},caveTop:1320,echoSign:{x:3900,y:900}};
  const portals=shared.portals;
  function libraryBooks(){return catalog.filter(b=>b.worldId==='library');}
  function areaBooks(){return expansionWorld()?catalog.filter(b=>b.worldId===scene):scene==='meadow'?books:libraryBooks();}
  function countBooks(list){return list.filter(b=>collectedBooks.has(b.id)).length;}
  function worldShelves(){return portals.filter(p=>p.target).map(p=>({portal:p,books:p.target==='meadow'?books:catalog.filter(b=>b.worldId===p.target),x:p.x+80,y:p.y,w:288}));}
  function shelfSlots(){
    return [...worldShelves().flatMap(s=>s.books.map((book,i)=>({book,x:s.x+36+(i%4)*72,y:s.y-28-Math.floor(i/4)*110,area:'world',scale:.85}))),
      ...libraryBooks().slice(0,shared.loft.capacity).map((book,i)=>({book,x:shared.loft.slotX+i*shared.loft.spacing,y:shared.loft.slotY,area:'library'}))];
  }
  function loftVisible(){
    if(scene!=='library')return false;
    const roof=platforms.find(p=>p.art_surface==='roof'),x=player.x+15,y=player.y+player.h/2;
    return x>roof.x+16&&x<roof.x+roof.w-16&&y>surfaceHeight(roof,x)+12&&player.y+player.h<=roof.y+roof.h+1&&player.loftEntry===true;
  }
  let saveAvailable = true;
  let questState, nearbyHint = '', millAngle = 0, completionPending = false;
  const hints=[...shared.hints], chimes=shared.chimes, crystals=shared.crystals, echoOrder=[0,2,1,1,2,0];
  const sails=shared.sails, kiteStops=shared.kiteStops, mill=shared.mill, wishingTree=shared.wishingTree;
  hints[0]='登顶赛跑：在最下层找到小孩，按 ↑ 对话，和他比赛登顶。每次进入世界只有一次机会。';
  hints[1]='水晶回声：水晶会回应旋风。留意旅人留下的痕迹。';
  hints[4]='旅人的愿望：带 20 枚金币回听风台，按 X 投币，再按住 ↓ 静坐两秒。';
  function freshQuests(){return {raceWon:false,echo:0,echoInputs:[],echoPattern:'132231',sails:[false,false,false],kite:0,kiteTravel:0,offered:false,offerCost:0,stillness:0,ready:[false,false,false,false,false]};}
  const zoneInfo = [ ['微风草甸','01 — THE MEADOW','每场冒险，都从一小步开始。'], ['水晶回廊','02 — CRYSTAL HOLLOW','往深处走，也会遇见光。'], ['风车山巅','03 — WINDMILL HEIGHTS','风吹来的方向，有新的风景。'], ['云间小径','04 — ABOVE THE CLOUDS','再向上一步，就能碰到云。'] ];
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  function terrain(x,y,w,h,type='grass'){ return {x,y,w,h,type,baseX:x,baseY:y}; }
  const clone=value=>JSON.parse(JSON.stringify(value));
  function buildWorld(){
    ({platforms,coins,enemies}=clone(shared.worlds.meadow));
    books=catalog.filter(b=>b.worldId==='cloud-fields').map((b,i)=>({...b,hint:hints[i]}));
    questState=freshQuests();millAngle=0;meadowGeometry={platforms,coins,enemies};
    $('coin-total').textContent='枚';
  }
  function readSave(){
    collectedCoins=new Set();collectedBooks=new Set();won=false;expansionProgress={};retiredBooks=[];storyComplete=false;
    if(PREVIEW)return;
    try {
      const raw=localStorage.getItem(SAVE_KEY);
      const s=JSON.parse(raw||'null');
      if(!s)return;
      storyComplete=s.storyComplete===true||(s.storyComplete===undefined&&((s.books?.length||0)>0||(s.coins?.length||0)>0));
      retiredBooks=[...new Set([...(Array.isArray(s.retiredBooks)?s.retiredBooks:[]),...(Array.isArray(s.books)?s.books:[])].filter(id=>typeof id==='string'&&!catalog.some(b=>b.id===id)))];
      if(s.expansionProgress&&typeof s.expansionProgress==='object')for(const id of Object.keys(shared.expansions||{})){const p=s.expansionProgress[id];if(p&&typeof p==='object')expansionProgress[id]=p;}
      collectedCoins=new Set((Array.isArray(s.coins)?s.coins:[]).filter(id=>Number.isInteger(id)&&id>=0&&id<coins.length||typeof id==='string'&&Object.values(shared.expansions||{}).some(w=>w.coins.some(c=>c.id===id))));
      // Old coins remain useful; the new stories must be experienced rather than auto-completed.
      if(s.version===3||s.version===4||s.version===5||s.version===6){
        collectedBooks=new Set((Array.isArray(s.books)?s.books:[]).filter(id=>catalog.some(b=>b.id===id)));
        const q=s.quests||{};
        questState.ready=books.map((b,i)=>q.ready?.[i]===true||collectedBooks.has(b.id));
        questState.raceWon=q.raceWon===true||collectedBooks.has(books[0].id);questState.ready[0]=collectedBooks.has(books[0].id)||(questState.raceWon&&q.ready?.[0]===true);
        questState.sails=sails.map((_,i)=>q.sails?.[i]===true);
        questState.echoInputs=q.echoPattern==='132231'&&Array.isArray(q.echoInputs)&&q.echoInputs.length<echoOrder.length&&q.echoInputs.every(i=>Number.isInteger(i)&&i>=0&&i<crystals.length)?q.echoInputs.slice():[];
        questState.echo=questState.echoInputs.length;
        questState.kite=Number.isInteger(q.kite)?clamp(q.kite,0,3):0;
        const paid=q.offerCost===50?50:20;
        questState.offered=q.offered===true&&collectedCoins.size>=paid;questState.offerCost=questState.offered?paid:0;
      }
      won=countBooks(books)===books.length;
    }catch{saveAvailable=false;$('save-status').textContent='本次冒险进度仅在当前页面保留';}
  }
  function save(){if(PREVIEW)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:6,storyComplete,coins:[...collectedCoins],books:[...collectedBooks],retiredBooks,quests:questState,expansionProgress}));}catch{saveAvailable=false;$('save-status').textContent='本次冒险进度仅在当前页面保留';}}
  function wallet(){return collectedCoins.size-(questState.offered?(questState.offerCost||WISH_COST):0);}
  function spawn(){player={x:ENTRANCE.x,y:ENTRANCE.y,w:30,h:44,vx:0,vy:0,facing:1,grounded:false,jumps:0,coyote:0,jumpBuffer:0,invincible:1.3,hp:3,crouching:false,spin:0,spinDuration:.4,spinCooldown:0,airSpinUsed:false,ground:null,dropSurfaces:new Set(),jumpCut:false,lastDirection:0,turnTimer:0,turnDirection:0,runMemory:0,runDirection:0,flipFacing:1,flipTime:0};}
  function init(reset=false){
    $('import-save').hidden=PREVIEW;
    opening=null;buildWorld();particles=[];completionPending=false;
    if(reset){storyComplete=false;collectedCoins.clear();collectedBooks.clear();expansionProgress={};retiredBooks=[];won=false;save();}else readSave();
    storyComplete=true;clock=0;changeScene('machine');
    if(!PREVIEW&&!storyComplete&&window.WindIntro)startOpening();
    else {$('opening-ui').hidden=true;document.querySelector('.game-shell').classList.remove('opening');}


  }
  function finishOpening(){storyComplete=true;save();opening=null;$('opening-ui').hidden=true;document.querySelector('.game-shell').classList.remove('opening');keys.clear();justPressed.clear();renderDirty=true;canvas.focus();}
  function startOpening(){
    $('opening-ui').hidden=false;document.querySelector('.game-shell').classList.add('opening');
    opening=window.WindIntro.create({ctx,art,onCaption:text=>$('opening-caption').textContent=controlText(text),onFinish:finishOpening});
    keys.clear();justPressed.clear();renderDirty=true;
  }
  function updateHud(){
    const localBooks=areaBooks(),found=countBooks(localBooks);
    $('book-count').textContent=found;$('coin-count').textContent=wallet();
    $('hearts').textContent='♥ '.repeat(player.hp)+'♡ '.repeat(3-player.hp);$('hearts').setAttribute('aria-label',player.hp+' 点生命');
    $('book-total').textContent='/ '+localBooks.length;
    $('library-count').textContent=collectedBooks.size;
    $('quest-text').innerHTML=scene==='meadow'?'云间郊野 · 散落的风之书<small>已找回 '+found+' / '+books.length+' 本 · 书洞旁会留下你的收获</small>':scene==='courtyard'?'每段冒险，从这里开始<small>靠近图书馆大门，按 ↑ 进入</small>':'书洞通往小小的世界<small>↑ 进入书洞或阅读 · 书梯通往高处</small>';
    $('return-hub').hidden=!adventureScene();
    $('expedition-journal').hidden=!expansionWorld();$('menu-journal').hidden=!expansionWorld();
  }

  function toast(message,seconds=3.6){$('toast').textContent=controlText(message);$('toast').classList.add('show');toastUntil=performance.now()+seconds*1000;}
  const soundscape=window.WindAudio?.create();
  // First visit defaults to on; an explicit saved preference takes priority.
  try{sound=localStorage.getItem('wind-machine-playtest-audio')!=='false';}catch{sound=true;}
  soundscape?.setEnabled(sound);
  function soundUi(){ $('sound').innerHTML='♪<span>声音'+(sound?'开':'关')+'</span>';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'关闭声音':'打开声音'); }
  soundUi();
  function playFx(name){soundscape?.fx(name);}
  function tone(freq,duration=.12,type='sine',gain=.05,delay=0){
    if(!sound)return;
    if(soundscape){soundscape.tone(freq,duration,type,gain,delay,freq*.7);return;}
  }
  function burst(x,y,color,n=12){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=45+Math.random()*145;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-50,life:.45+Math.random()*.6,max:1,color,r:2+Math.random()*3});}}
  function collectBook(index){
    recoverBook(books[index]);
  }
  function recoverBook(book){
    if(collectedBooks.has(book.id))return;
    collectedBooks.add(book.id);burst(book.x,book.y,'#d9ebc4',36);
    if(scene==='machine')playFx('book');else [523,659,784,1047].forEach((n,i)=>tone(n,.22,'sine',.065,i*.11));
    toast(book.worldId==='library'?'找回馆内藏书 · 它会出现在图书馆顶端的隐藏书架':'找回'+book.world+'的书 · 它会出现在对应书洞旁',5);
    if(book.worldId==='cloud-fields'&&countBooks(books)===books.length&&!won){won=true;completionPending=true;$('win-detail').textContent='云间郊野的 '+books.length+' 本风之书已归还。回到图书馆，可以在书洞旁读到它们。';}
    updateHud();save();openBook(book.id);
  }
  function openBook(id){
    const book=catalog.find(b=>b.id===id);if(!book||!collectedBooks.has(id))return;
    setPaused(true,'reader');
    $('reader-number').textContent='风之图书馆 / '+book.world+' · '+book.id.split('-').at(-1);
    $('reader-title').textContent=book.title;$('reader-genre').textContent=book.genre;
    $('reader-content').innerHTML=book.content.map(p=>'<p>'+escapeText(p)+'</p>').join('');
    $('reader-content').scrollTop=0;
  }
  function openLibrary(){
    setPaused(true,'library');
    $('shelf-summary').textContent='藏书目录 · 已归还 '+collectedBooks.size+' / '+catalog.length+' 本';
    $('shelf').innerHTML=catalog.map((b,i)=>{
      const owned=collectedBooks.has(b.id);
      return '<button class="shelf-book '+(owned?'owned':'missing')+'" '+(owned?'data-book="'+b.id+'"':'disabled')+'><span class="book-cover"><i>≋</i><small>风之书</small></span><span class="shelf-number">'+b.world+' / '+(owned?'已归还':'散落中')+'</span><strong>'+(owned?escapeText(b.title):'等待找回的风之书')+'</strong><span class="shelf-hint">'+(owned?'陈列于'+(b.worldId==='library'?'顶端隐藏书架':b.world+'书洞旁'):escapeText(b.hint||hints[i]||'等待探索'))+'</span></button>';
    }).join('');
  }
  function exportGodotSave(full=false){
    const progress=full?{version:6,storyComplete,books:[...collectedBooks],retiredBooks,coins:[...collectedCoins],quests:questState,expansionProgress}:{version:5,books:[...collectedBooks].filter(id=>catalog.find(b=>b.id===id)?.worldId==='library'||catalog.find(b=>b.id===id)?.worldId==='cloud-fields'),coins:[...collectedCoins].filter(Number.isInteger),quests:questState};
    const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='wind-library-save.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast(full?'完整存档已导出，包含五个新世界的任务和动作进度。':'兼容存档已导出，包含云间郊野与馆内藏书。',6);
  }
  function finishReading(){
    if(completionPending){completionPending=false;setPaused(true,'win');}else setPaused(false);
  }
  function changeScene(next,fromWorld=false,arrival=null){
    next='machine';fromWorld=false;arrival=null;
    closeSpeech();
    if(opening){if(next==='library'&&scene==='courtyard'&&arrival!=='upper')opening.enter('walk');else finishOpening();}
    const sourcePortal=fromWorld?portals.find(p=>p.target===scene):null;
    bookReveal=null;revealQueue.length=0;
    scene=next;soundscape?.setState(scene,false);particles=[];nearbyHint='';zone=-1;toastUntil=0;$('toast').classList.remove('show');
    const definition=clone(shared.worlds[scene]);
    Object.assign(WORLD,definition.size);Object.assign(ENTRANCE,definition.entry);
    ({platforms,coins,enemies}=definition);
    if(scene==='library')for(const shelf of worldShelves()){
      const floor=platforms.find(p=>shelf.portal.x>=p.x&&shelf.portal.x<=p.x+p.w&&Math.abs(p.y-shelf.y)<2);if(floor)floor.w=Math.max(floor.w,shelf.x+shelf.w-floor.x);
      for(let row=1;row<Math.ceil(shelf.books.length/4);row++)platforms.push({id:'book-shelf-'+shelf.portal.target+'-'+row,x:shelf.x,y:shelf.y-row*110,w:shelf.w,h:12,type:'wood',bookShelf:true});
    }
    if(scene==='meadow'){race={status:questState.ready[0]?'won':questState.raceWon?'arrived':'idle',position:{...(questState.raceWon?meadow.raceFinish:meadow.raceNpc)},leg:questState.raceWon?meadow.raceRoute.length+1:0,t:0,countdown:3,giveTime:0};}
    spawn();if(scene==='library'&&fromWorld&&sourcePortal)Object.assign(player,{x:sourcePortal.x-player.w/2,y:sourcePortal.y-player.h});
    expedition=null;
    if(expansionWorld())expedition=window.WindQuestRuntime.create(expansionWorld(),expansionProgress[scene] ||= {},{player:()=>player,keys:()=>keys,pressed:()=>justPressed,platforms:()=>platforms,damage:()=>hurt(false),sfx:playFx,coinCount:()=>coins.filter(c=>collectedCoins.has(c.id)).length,collected:id=>collectedBooks.has(id),toast,dialogue:openAdventure,save,reveal:revealExpansionBook,collect:id=>recoverBook(catalog.find(b=>b.id===id))});
    if(arrival==='upper')Object.assign(player,scene==='library'?{x:450,y:1116}:{x:505,y:776});
    resize();
    camera={x:clamp(player.x-W*.4,0,Math.max(0,WORLD.w-W)),y:clamp(player.y-H*.58,0,Math.max(0,WORLD.h-H))};
    setPaused(false);$('interaction').hidden=true;updateHud();
    $('world-label').textContent=expansionWorld()?.name||(scene==='meadow'?'CLOUD FIELDS':'WIND LIBRARY');
    $('map-title').textContent=scene==='meadow'?'WORLD MAP':'LIBRARY MAP';
    updateZone();
  }
  function updateZone(){
    if(expansionWorld()){const w=expansionWorld(),r=w.regions.find(r=>player.x+15>=r.x&&player.x+15<r.x+r.w&&player.y+22>=r.y&&player.y+22<r.y+r.h);$('zone').textContent=w.name+' · '+(r?.name||'风中旅途');return;}
    if(scene==='meadow'&&meadow.regions){
      const index=meadow.regions.findIndex(r=>player.x+15>=r.x&&player.x+15<r.x+r.w&&player.y+22>=r.y&&player.y+22<r.y+r.h),key='meadow-region-'+index;
      if(zone===key)return;zone=key;$('zone').textContent='云间郊野 · '+(index>=0?meadow.regions[index].name:'风中旅途');$('zone-caption').textContent='';return;
    }
    const z=scene==='meadow'?(player.y>1320?1:player.y<340?3:(player.y<740||player.x>2670)?2:0):scene==='courtyard'?4:player.y<450?6:5;
    if(z===zone)return;zone=z;
    const info=z<4?[ '云间郊野 · '+zoneInfo[z][0],zoneInfo[z][1],zoneInfo[z][2] ]:
      z===4?['风之图书馆 · 门前','THE BEGINNING','每次出发，都有人为你留着门。']:
      z===6?['风之图书馆 · 隐藏阁楼','BETWEEN ROOF & SKY','属于图书馆的故事，藏在最高的地方。']:
      ['风之图书馆 · 书洞大厅','A WORLD BETWEEN THE PAGES','每一个书洞，都是一场新的冒险。'];
    $('zone').textContent=info[0];$('zone-caption').innerHTML='<span>'+info[1]+'</span><strong>'+info[2]+'</strong>';
  }
  function updateHub(){
    const up=!speech&&justPressed.has('ArrowUp');let hint='';
    if(scene==='courtyard'){
      if(!opening&&up&&player.grounded&&(player.ground?.art_surface==='stair'||(player.x+15>=394&&player.x+15<646&&player.y+player.h/2>=766&&player.y+player.h/2<830)||near({x:645,y:532},58))){changeScene('library',false,'upper');return true;}
      if(near({x:810,y:790},90)){hint='↑ 推开馆门，进入风之图书馆';if(up){changeScene('library');return true;}}
    }else{
      if(opening)return false;
      if(!opening&&expansionProgress.machine?.mechanics?.city?.visitor&&near({x:1180,y:1608},65)&&up){openAdventure('想读书的工人',shared.expansions.machine.tasks.find(t=>t.id==='machine-v12-reader')?.challengeData.visitorText||'我终于来到图书馆了。',[],{x:1180,y:1608});return true;}
      if(!opening&&window.WindIntro&&near({x:500,y:1595},65)){hint='↑ 与老馆长交谈';if(up){openAdventure('老馆长',collectedBooks.size?'你已经带回了 '+collectedBooks.size+' 本书。每本书都在等着被重新翻开，去书洞旁看看吧。':'循着书洞去看看吧。书散落在世界各地，有时也藏在别人需要帮助的地方。',[{label:'继续探险',action:()=>{}}]);return true;}}
      if(up&&near({x:465,y:1122},48)){changeScene('courtyard',false,'upper');return true;}
      const accessible=shelfSlots().filter(slot=>slot.area==='library'?loftVisible()&&Math.abs(slot.x-player.x-15)<shared.loft.spacing/2&&near(slot,50):near(slot,35));
      const slot=accessible.sort((a,b)=>Math.hypot(a.x-player.x-15,a.y-player.y-22)-Math.hypot(b.x-player.x-15,b.y-player.y-22))[0];
      if(slot){hint=collectedBooks.has(slot.book.id)?'↑ 阅读《'+slot.book.title+'》':'空书位 · 等待风之书回来';if(up&&collectedBooks.has(slot.book.id)){openBook(slot.book.id);return true;}}
      for(const p of portals)if(near({x:p.x,y:p.y-40},75)){
        hint=p.target?'↑ 进入书洞 · '+p.title:'这页故事还没有展开 · 书洞暂未开放';
        if(up&&p.target){changeScene(p.target);toast(p.title+' · 找回这里散落的 '+areaBooks().length+' 本风之书',4);return true;}
      }
      if(near({x:205,y:1590},70)){hint='↑ 走出图书馆';if(up){changeScene('courtyard');return true;}}
    }
    for(const b of libraryBooks())if(b.scene===scene&&!collectedBooks.has(b.id)&&near(b,36)){recoverBook(b);break;}
    if(hint!==nearbyHint){nearbyHint=hint;$('interaction').textContent=hint;$('interaction').hidden=!hint;}
    return false;
  }
  function hurt(fall=false){
    if(player.invincible>0&&!fall)return;
    player.hp-=1;if(scene==='machine')playFx('hurt');else tone(150,.25,'triangle');burst(player.x+15,player.y+22,'#e8977d',10);
    if((fall||player.hp<=0)&&adventureScene()){changeScene('library',true);toast('风把你送回了机械迷城入口，收集进度保留。');return;}
    if(fall||player.hp<=0){let hp=player.hp;spawn();player.hp=hp<=0?3:hp;camera.x=clamp(player.x-W*.4,0,Math.max(0,WORLD.w-W));camera.y=clamp(player.y-H*.58,0,Math.max(0,WORLD.h-H));toast(scene==='meadow'?'风把你送回了云间郊野入口，收集进度保留。':'风把你送回了门口，收集进度保留。');}
    else {player.invincible=1.7;player.vy=-380;player.vx=-player.facing*240;}
    updateHud();
  }
  function setPaused(value,kind='pause'){
    if(value)closeSpeech();
    paused=value;soundscape?.setState(scene,paused);renderDirty=true;modalKind=value?kind:null;keys.clear();justPressed.clear();
    document.querySelector('.game-shell').classList[value&&['adventure','race','reader','hint','win'].includes(kind)?'add':'remove']('has-subtitles');
    for(const name of ['pause','win','reader','library','settings','hint','confirm','race','adventure','map','journal','journal-entry'])$(name+'-overlay').hidden=!(value&&kind===name);
    if(kind==='pause')$('pause-overlay').querySelector('h2').textContent='让风等你一会儿';
    $('pause').textContent=value?'▷':'Ⅱ';$('pause').setAttribute('aria-label',value?'继续':'暂停');
    if(!value)canvas.focus({preventScroll:true});
    else $(kind+'-overlay').querySelector('button')?.focus({preventScroll:true});
  }
  function update(dt,jumpHeld=true){
    if(opening&&paused)return;
    if(!paused)updateSpeech(dt);
    if(opening){opening.update(dt,player);if(opening?.locked){player.vx=0;player.vy=0;clock+=dt;keys.clear();justPressed.clear();return;}}
    if(bookReveal){if(!paused)updateBookReveal(dt);return;}
    if(scene==='meadow'&&race?.status==='handing'){if(!paused)updateRace(dt);justPressed.clear();return;}
    if(scene==='meadow'&&race?.status==='countdown'){if(paused)return;const previous=Math.ceil(race.countdown);race.countdown=Math.max(0,race.countdown-dt);if(race.countdown===0){race.status='running';toast('出发！先到插着旗的云台。',2);}else if(Math.ceil(race.countdown)!==previous)toast(String(Math.ceil(race.countdown)),1);justPressed.clear();return;}
    clock+=dt;
    player.runMemory=Math.max(0,player.runMemory-dt);player.turnTimer=Math.max(0,player.turnTimer-dt);player.flipTime=Math.max(0,player.flipTime-dt);
    for(const p of platforms){p.previousX=p.x;p.previousY=p.y;p.dx=0;p.dy=0;if(p.motion){let old=p.x;p.x=p.baseX+Math.sin(clock*p.speed)*p.range;p.dx=p.x-old;}}
    if(player.ground&&player.grounded){player.x+=player.ground.dx||0;}
    player.invincible=Math.max(0,player.invincible-dt);
    player.spin=Math.max(0,player.spin-dt);
    player.spinCooldown=Math.max(0,player.spinCooldown-dt);
    player.coyote=player.grounded?.1:Math.max(0,player.coyote-dt);
    const left=keys.has('ArrowLeft')||keys.has('KeyA'),right=keys.has('ArrowRight')||keys.has('KeyD');
    const direction=Number(right)-Number(left);
    // Arm once on a deliberate grounded reversal, before acceleration changes velocity.
    if(player.grounded&&!keys.has('ArrowDown')&&direction&&player.lastDirection!==direction&&(player.vx*direction<-MOVE.turnMinSpeed||(player.runMemory>0&&player.runDirection===-direction))){player.turnTimer=MOVE.turnWindow;player.turnDirection=direction;}
    if((direction&&direction!==player.turnDirection)||keys.has('ArrowDown'))player.turnTimer=0;
    if(player.grounded&&direction&&player.vx*direction>=MOVE.turnMinSpeed){player.runMemory=.14;player.runDirection=direction;}
    player.lastDirection=direction;
    if(scene==='library'&&player.loftEntry){const roof=platforms.find(p=>p.art_surface==='roof');if(player.x+15<=roof.x||player.x+15>=roof.x+roof.w||player.y>roof.y+roof.h+35||player.ground===roof){player.loftEntry=false;platforms.find(p=>p.loftFloor).disabled=true;}}
    let jump=justPressed.has('KeyZ');
    if(jump&&keys.has('ArrowDown')){
      player.jumpCut=false;jump=false;player.jumpBuffer=0;
      if(player.grounded){if(scene==='library'&&player.ground?.art_surface==='roof'){player.loftEntry=true;const floor=platforms.find(p=>p.loftFloor);if(floor)floor.disabled=false;}const feet=player.y+player.h;for(const p of platforms)if(player.x+player.w>p.x&&player.x<p.x+p.w&&Math.abs(surfaceHeight(p,player.x+15)-feet)<2)player.dropSurfaces.add(p);
        player.grounded=false;player.ground=null;player.coyote=0;player.jumps=Math.max(player.jumps,1);player.spin=0;player.vy=Math.max(player.vy,80);}
    }
    player.crouching=player.grounded&&keys.has('ArrowDown')&&!jump&&player.spin<=0;
    if(jump)player.jumpBuffer=.12;else player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
    if(direction&&!player.crouching){player.vx+=direction*2200*dt;player.facing=direction;}else player.vx*=Math.exp(-(player.crouching?28:12)*dt);
    player.vx=clamp(player.vx,-MOVE.speed,MOVE.speed);
    if(player.jumpBuffer>0&&(player.coyote>0||player.jumps<2)){
      const second=player.coyote<=0&&player.jumps>=1;
      const flip=!second&&player.coyote>0&&player.turnTimer>0;
      player.vy=-(flip?MOVE.flipJump:second?MOVE.doubleJump:MOVE.jump);player.jumps=second?2:1;player.grounded=false;player.coyote=0;player.jumpBuffer=0;player.crouching=false;
      player.flipTime=flip?MOVE.flipDuration:0;player.flipFacing=player.facing;player.turnTimer=0;player.runMemory=0;
      if(flip)player.vx=player.turnDirection*Math.max(140,Math.abs(player.vx)*.55);
      player.jumpCut=true;
      if(scene==='machine')playFx(flip?'flip':second?'double':'jump');else tone(flip?760:second?640:420,.16,'triangle',.035);burst(player.x+15,player.y+44,flip?'#f5dfad':second?'#f7ffe7':'#dbedb5',flip?16:second?12:7);
    }
    if(player.jumpCut&&!jumpHeld&&player.vy<0){player.vy*=.65;player.jumpCut=false;}
    if(player.vy>=0)player.jumpCut=false;
    let actionStarted=false;
    if(justPressed.has('KeyX')&&player.spinCooldown<=0&&(player.grounded||!player.airSpinUsed)){
      actionStarted=true;
      player.spinDuration=player.grounded?.4:MOVE.airSpinDuration;player.spin=player.spinDuration;player.spinCooldown=.65;player.crouching=false;
      if(!player.grounded)player.airSpinUsed=true;
      if(scene==='machine')playFx('spin');else tone(340,.22,'triangle',.03);burst(player.x+15,player.y+player.h/2,'#e8fff1',12);
    }
    const height=player.crouching?28:44;
    player.y+=player.h-height;player.h=height;
    const floating=player.spin>0&&player.vy>=0;
    const previousX=player.x+15,previousGround=player.grounded?player.ground:null,oldBottom=player.y+player.h;
    player.vy=Math.min(player.vy+(floating?250:1700)*dt,floating?110:850);
    if(expedition)expedition.physics(dt);
    player.x=clamp(player.x+player.vx*dt,12,WORLD.w-player.w-12);
    player.y+=player.vy*dt;player.grounded=false;player.ground=null;
    const nextBottom=player.y+player.h;let landing=null,landingTime=Infinity;
    for(const p of platforms){
      if(p.disabled||expedition?.climbing)continue;
      if(player.dropSurfaces.has(p)){if(player.y>surfaceHeight(p,player.x+15)+4)player.dropSurfaces.delete(p);else continue;}
      const curved=!!p.surface,overlaps=curved?player.x+15>=p.x&&player.x+15<=p.x+p.w:player.x+player.w>p.x+2&&player.x<p.x+p.w-2;
      if(!overlaps)continue;
      const top=surfaceHeight(p,player.x+15);
      // Compare both bodies over the same step, before any platform carry.
      // Testing yesterday's feet against today's platform misses upward crossings.
      const dx=p.x-p.previousX,dy=p.y-p.previousY;
      const oldTop=surfaceHeight(p,previousX-dx)-dy;
      const before=oldBottom-oldTop,after=nextBottom-top;
      const supported=previousGround===p&&player.vy>=0&&Math.abs(before)<1.5;
      const crossing=before<=.001&&after>=-.001&&after-before>=0;
      if(supported||crossing){
        const time=supported?0:Math.max(0,Math.min(1,-before/Math.max(.000001,after-before)));
        if(time<landingTime||(time===landingTime&&top<=landing?.top)){landing={platform:p,top};landingTime=time;}
      }
    }
    if(landing){player.y=landing.top-player.h;player.vy=0;player.grounded=true;player.ground=landing.platform;player.jumps=0;player.airSpinUsed=false;}
    if(!player.grounded&&player.jumps===0&&player.coyote<=0)player.jumps=1;
    if(player.grounded){player.dropSurfaces.clear();player.jumpCut=false;player.flipTime=0;}
    if(player.y>WORLD.h+60){hurt(true);return;}
    for(const c of coins)if(!collectedCoins.has(c.id)&&Math.hypot(c.x-(player.x+15),c.y-(player.y+22))<32){collectedCoins.add(c.id);if(scene==='machine')playFx('coin');else tone(980,.1,'sine',.025);burst(c.x,c.y,'#ffe492',7);updateHud();save();if(collectedCoins.size===WISH_COST&&!questState.offered)toast('攒够 20 枚金币了，可以回入口左侧的听风台许愿。',5);}
    if(scene==='meadow'){
      if(near(meadow.exit,65)&&justPressed.has('ArrowUp')){changeScene('library',true);return;}
      updateQuests(dt,actionStarted);
      if(bookReveal||paused){justPressed.clear();return;}
    }else if(expedition){
      const world=expansionWorld();
      if(near(world.exit,65)&&justPressed.has('ArrowUp')){changeScene('library',true);return;}
      if(justPressed.has('ArrowUp')){for(const link of world.shortcuts||[]){let destination=null;if(near(link.a,60))destination=link.b;else if(near(link.b,60))destination=link.a;if(destination){Object.assign(player,{x:destination.x-15,y:destination.y-22,vx:0,vy:0,grounded:false,ground:null});camera.x=clamp(player.x-W*.4,0,Math.max(0,WORLD.w-W));camera.y=clamp(player.y-H*.58,0,Math.max(0,WORLD.h-H));justPressed.clear();toast(link.name,3);return;}}}
      expedition.update(dt,actionStarted);if(bookReveal||paused){justPressed.clear();return;}
    }else if(updateHub())return;
    for(const e of enemies){if(!e.alive)continue;e.x+=e.v*dt;if(e.x<e.left||e.x+e.w>e.right)e.v*=-1;
      if(player.spin>0&&Math.hypot(e.x+e.w/2-player.x-15,e.y+e.h/2-player.y-player.h/2)<64){e.alive=false;burst(e.x+17,e.y,'#e9d6a3',16);tone(470,.13,'triangle');continue;}
      if(overlap(player,e)){
      if(player.vy>80&&oldBottom<=e.y+15){e.alive=false;player.vy=-470;player.jumps=1;burst(e.x+17,e.y,'#e9b394',15);tone(240,.14,'triangle');}
      else hurt();
    }}
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=270*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
    updateZone();
    const cx=clamp(player.x+15-W*.40+player.vx*.16,0,Math.max(0,WORLD.w-W)),cy=clamp(player.y+22-H*.58,0,Math.max(0,WORLD.h-H));
    camera.x+=(cx-camera.x)*(1-Math.exp(-5*dt));camera.y+=(cy-camera.y)*(1-Math.exp(-4.5*dt));
    justPressed.clear();
  }
  function surfaceHeight(p,x){
    if(!p.surface)return p.y;
    for(let i=1;i<p.surface.length;i++){const a=p.surface[i-1],b=p.surface[i];if(x<=b[0])return a[1]+(b[1]-a[1])*clamp((x-a[0])/(b[0]-a[0]),0,1);}
    return p.surface.at(-1)[1];
  }
  function near(point,radius=65){return Math.hypot(point.x-player.x-15,point.y-player.y-player.h/2)<radius;}
  function closeSpeech(){
    if(!speech)return;speech=null;$('adventure-overlay').hidden=true;
    document.querySelector('.game-shell').classList.remove('has-subtitles');canvas.focus({preventScroll:true});
  }
  function updateSpeech(dt){
    if(!speech)return;const d=speech;
    if(d.scene!==scene||d.anchor&&Math.hypot(player.x+15-d.anchor.x,player.y+22-d.anchor.y)>210){closeSpeech();return;}
    d.time+=dt;const count=Math.min(d.characters.length,Math.floor(d.time*65));
    if(count!==d.shown){d.shown=count;$('adventure-text').textContent=d.characters.slice(0,count).join('');}
    $('adventure-options').hidden=count<d.characters.length||!d.options.length;
    if(!d.options.length&&d.time>d.characters.length/65+Math.max(4,d.characters.length/14))advanceSpeech();
  }
  function showSpeechPage(){
    const d=speech;d.characters=Array.from(d.pages[d.page]);d.time=0;d.shown=0;d.index=0;
    d.options=d.page===d.pages.length-1?d.choices:[];
    $('adventure-text').textContent='';const panel=$('adventure-options');panel.replaceChildren();panel.hidden=true;
    d.options.forEach((option,i)=>{const button=document.createElement('button');button.textContent=(i===0?'▸ ':'')+option.label;button.onclick=()=>chooseSpeech(i);panel.append(button);});
  }
  function advanceSpeech(){
    const d=speech;if(!d)return;
    if(d.shown<d.characters.length){d.time=d.characters.length/65;updateSpeech(0);return;}
    if(d.options.length){chooseSpeech(d.index);return;}
    if(d.page+1<d.pages.length){d.page++;showSpeechPage();}else closeSpeech();
  }
  function chooseSpeech(index){
    const d=speech;if(!d||d.shown<d.characters.length)return;
    const option=d.options[index];if(!option)return;closeSpeech();option.action();
  }
  function openAdventure(title,text,options=[],anchor=undefined){
    text=controlText(text);
    // Dialogue remains part of the running world. Only real decisions get buttons.
    closeSpeech();if(paused)setPaused(false);justPressed.delete('ArrowUp');
    if(anchor===undefined){const p={x:player.x+15,y:player.y+22};
      anchor=scene==='library'&&near({x:500,y:1595},90)?{x:500,y:1595}:
        expedition?.entities.filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<100).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||p;
    }
    const choices=options.filter(o=>!['继续探索','继续探险','记住了','继续寻找','再试试看','合上对话'].includes(o.label));
    const pages=String(text).match(/[^。！？!?\n]+[。！？!?]?[”’」』]?|[^\s]/g)?.map(line=>line.trim()).filter(Boolean)||[''];
    speech={scene,anchor,pages,page:0,choices};
    $('adventure-title').textContent=title;showSpeechPage();const panel=$('adventure-options');
    $('adventure-overlay').hidden=false;panel.scrollTop=0;document.querySelector('.game-shell').classList.add('has-subtitles');canvas.focus({preventScroll:true});
  }
  let journalReturnToPause=false;
  function openJournal(){if(!expedition)return;journalReturnToPause=paused;showJournal();}
  function showJournal(){
    if(!expedition)return;
    $('journal-title').textContent=expansionWorld().name+' · 旅途札记';
    $('journal-ability').textContent=expansionWorld().ability.name+' · '+(expedition.learned?'已学会':'尚未学会');
    const list=$('journal-list');list.replaceChildren();
    for(const entry of expedition.journal()){
      const button=document.createElement('button');button.textContent=(entry.collected?'已归还 · ':entry.ready?'已出现 · ':'寻找中 · ')+entry.title;
      button.onclick=()=>{setPaused(true,'journal-entry');$('journal-entry-title').textContent=entry.title;$('journal-entry-text').textContent=controlText(entry.text);$('journal-entry-progress').textContent='进度：'+entry.progress;$('journal-entry-text').scrollTop=0;};list.append(button);
    }
    setPaused(true,'journal');list.scrollTop=0;list.children[0]?.focus({preventScroll:true});
    $('journal-back').textContent=journalReturnToPause?'返回暂停菜单':'返回游戏';
  }
  function closeJournal(){setPaused(journalReturnToPause);}
  function revealExpansionBook(id){playFx('book');const b=catalog.find(b=>b.id===id);if(!b)return;burst(b.x,b.y,'#edf8c9',25);if(bookReveal)revealQueue.push(b);else{bookReveal={book:b,time:0,origin:{...camera}};keys.clear();justPressed.clear();}toast('一本风之书出现了。',4);save();}
  function revealBook(index){
    if(questState.ready[index])return;
    questState.ready[index]=true;const b=books[index];burst(b.x,b.y,'#edf8c9',25);
    if(bookReveal)revealQueue.push(b);
    else {bookReveal={book:b,time:0,origin:{...camera}};keys.clear();justPressed.clear();player.jumpBuffer=0;updateBookReveal(0);}
    toast('风停了一瞬，一本风之书露了出来。靠近它，带它回家。',5);save();
  }
  function updateBookReveal(dt){
    const shot=bookReveal;shot.time+=dt;
    const target={x:clamp(shot.book.x-W/2,0,Math.max(0,WORLD.w-W)),y:clamp(shot.book.y-H/2,0,Math.max(0,WORLD.h-H))};
    const t=clamp((shot.time-1.3)/.35,0,1),ease=t*t*(3-2*t);
    camera.x=target.x+(clamp(shot.origin.x,0,Math.max(0,WORLD.w-W))-target.x)*ease;
    camera.y=target.y+(clamp(shot.origin.y,0,Math.max(0,WORLD.h-H))-target.y)*ease;
    if(shot.time>=1.3&&revealQueue.length){bookReveal={book:revealQueue.shift(),time:0,origin:shot.origin};updateBookReveal(0);}
    else if(t>=1){bookReveal=null;keys.clear();justPressed.clear();player.jumpBuffer=0;}
    renderDirty=true;
  }
  function kitePoint(){
    const q=questState,to=kiteStops[q.kite],from=kiteStops[Math.max(0,q.kite-1)],t=1-q.kiteTravel/.9;
    return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};
  }
  function openRaceDialog(){
    const idle=race.status==='idle',d=meadow.raceDialogue;
    openAdventure(d.title,d[idle?'idle':race.status==='lost'?'lost':race.status==='won'?'won':'running'],idle?[{label:d.accept,action:startRace}]:[],race.position);
  }
  function startRace(){if(!race||race.status!=='idle')return;race.status='countdown';race.countdown=3;race.leg=0;race.t=0;race.position={...meadow.raceNpc};setPaused(false);toast('3',1);}
  function updateRace(dt){
    if(!race)return false;
    if(race.status==='running'||race.status==='waiting'){
      const route=[meadow.raceNpc,...meadow.raceRoute,meadow.raceFinish];let remaining=dt;
      while(remaining>0&&race.leg<route.length-1){
        const a=route[race.leg],b=route[race.leg+1],jump=Math.abs(b.y-a.y)>2,duration=Math.max(jump?.85:.05,Math.abs(b.x-a.x)/meadow.raceSpeed,Math.abs(b.y-a.y)/220);
        const used=Math.min(remaining,duration-race.t);race.t+=used;remaining-=used;
        const t=clamp(race.t/duration,0,1),hop=jump?Math.sin(Math.PI*t)*Math.max(110,Math.abs(b.y-a.y)*.5+70):0;
        race.position={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t-hop};
        if(t>=1){race.leg++;race.t=0;}
      }
      if(race.status==='running'&&race.leg>=route.length-1){race.status='lost';toast('小孩先登顶了。下次进入这个世界再挑战吧。',5);}
      else if(race.status==='running'&&player.grounded&&near(meadow.raceFinish,55)){
        race.status='waiting';questState.raceWon=true;save();toast('你先到终点了！等小孩跑上来，把书交给你。',5);
      }
    }
    if(race.status==='waiting'&&race.leg>=meadow.raceRoute.length+1)race.status='arrived';
    if(race.status==='arrived'&&player.grounded&&near(race.position,85)){
      race.status='handing';race.giveTime=0;player.vx=0;player.vy=0;keys.clear();justPressed.clear();toast(meadow.raceDialogue.won,4);return true;
    }
    if(race.status==='handing'){
      race.giveTime+=dt;
      if(race.giveTime>=1.4){race.status='won';Object.assign(books[0],{x:meadow.raceFinish.x,y:meadow.raceFinish.y-14});revealBook(0);}
      return true;
    }
    if(player.grounded&&near(race.position,65)&&justPressed.has('ArrowUp')){openRaceDialog();return true;}
    return false;
  }
  function drawRace(){
    if(!race)return;const p=race.position;
    worldArt('race-child',p.x-22,p.y-36+(['running','waiting'].includes(race.status)?Math.sin(clock*16)*2:0),44,58);
    if(race.status==='handing'){
      const t=clamp((race.giveTime-.3)/1.1,0,1),ease=t*t*(3-2*t);
      const x=p.x+12*(1-ease),y=p.y+12-26*ease;
      line(p.x+13,p.y+3,x+10,y+12,'#efd4ab',6);
      if(t>0){ctx.save();ctx.globalAlpha=Math.min(1,t*4);ctx.translate(x,y);ctx.rotate((1-ease)*-.5);const scale=.35+.65*ease;art('book',-24*scale,-26*scale,50*scale,61*scale);ctx.restore();}
    }
    const finish=meadow.raceFinish;line(finish.x+25,finish.y+22,finish.x+25,finish.y-55,'#c4b58e',3);path([[finish.x+25,finish.y-55],[finish.x+70,finish.y-45],[finish.x+25,finish.y-31]],'#e7c888');
    if(race.status==='idle'&&near(p,85)){ellipse(p.x,p.y-53,17,12,'#fff2cf');ellipse(p.x-5,p.y-53,1.5,1.5,'#537774');ellipse(p.x,p.y-53,1.5,1.5,'#537774');ellipse(p.x+5,p.y-53,1.5,1.5,'#537774');}
  }
  function updateQuests(dt,action){
    const q=questState;let hint=near(meadow.exit,65)?'↑ 通过书洞，回到风之图书馆':'';
    millAngle+=dt*(q.ready[2] ? .85 : 0);
    if(updateRace(dt))return;
    if(!q.ready[1])for(let i=0;i<crystals.length;i++)if(near(crystals[i])){
      hint='X 敲响水晶 '+['①','②','③'][i];
      if(action){
        tone([440,554,659][i],.3);burst(crystals[i].x,crystals[i].y,'#b9efe4');
        q.echoInputs.push(i);q.echo=q.echoInputs.length;
        if(q.echo===echoOrder.length){
          const correct=q.echoInputs.every((value,index)=>value===echoOrder[index]);q.echoInputs=[];q.echo=0;
          if(correct)revealBook(1);else toast('六声回响渐渐消散了。',3);
        }else toast('灵石接住了这一声。',2);
        save();
      }
    }
    if(!q.ready[2]){
      for(let i=0;i<sails.length;i++)if(!q.sails[i]&&near(sails[i],34)){q.sails[i]=true;burst(sails[i].x,sails[i].y,'#f7e3b9');toast('找回一片帆布 · '+q.sails.filter(Boolean).length+' / 3，带去山顶风车。',3);tone(720,.12);save();}
      if(near(mill,95)){
        hint=q.sails.every(Boolean)?'X 装好帆布，让风车重新转动':'风车缺了帆布 · 沿山路寻找 '+q.sails.filter(Boolean).length+' / 3';
        if(action){if(q.sails.every(Boolean))revealBook(2);else toast('还缺 '+q.sails.filter(v=>!v).length+' 片帆布。沿上山的浮台找一找。',4);}
      }
    }
    q.kiteTravel=Math.max(0,q.kiteTravel-dt);
    if(!q.ready[3]&&near(kitePoint(),42)&&q.kiteTravel===0){
      if(q.kite<kiteStops.length-1){q.kite++;q.kiteTravel=.9;toast('纸鸢带着一本书！跟上它，前往下一块云台。',4);save();}
      else revealBook(3);
    }
    if(!q.ready[4]&&near(wishingTree,72)){
      if(!q.offered){
        hint=wallet()>=WISH_COST?'X 投入 20 枚金币，向听风台许愿':'听风台 · 需要 20 枚金币，目前 '+wallet()+' 枚';
        if(action){if(wallet()>=WISH_COST){q.offered=true;q.offerCost=WISH_COST;save();updateHud();toast('风铃收下了愿望。按住 ↓ 静坐两秒，听听风的回答。',5);}else toast('先去小岛上攒够 20 枚金币吧。',3);}
      }else{
        hint='按住 ↓ 静坐，等风送来回应 · '+Math.round(q.stillness/2*100)+'%';
        if(player.crouching&&player.grounded&&Math.abs(player.vx)<20){q.stillness=Math.min(2,q.stillness+dt);if(q.stillness>=2)revealBook(4);}else q.stillness=0;
      }
    }else if(!q.ready[4])q.stillness=0;
    if(!bookReveal)for(let i=0;i<books.length;i++)if(q.ready[i]&&!collectedBooks.has(books[i].id)&&near(books[i],38)){collectBook(i);break;}
    if(hint!==nearbyHint){nearbyHint=hint;$('interaction').textContent=hint;$('interaction').hidden=!hint;}
  }
  const artwork={}, patterns={};
  function art(name,x,y,w,h){const image=artwork[name];if(image?.complete&&image.naturalWidth)ctx.drawImage(image,x,y,w,h);}
  function inView(x,y,w,h,pad=4){return x+w>=camera.x-pad&&x<=camera.x+W+pad&&y+h>=camera.y-pad&&y<=camera.y+H+pad;}
  // World-space images only. Rotated sprites keep their own local transforms.
  function worldArt(name,x,y,w,h){
    const image=artwork[name];if(!image?.complete||!image.naturalWidth||!inView(x,y,w,h))return;
    const left=Math.max(x,camera.x),top=Math.max(y,camera.y),right=Math.min(x+w,camera.x+W),bottom=Math.min(y+h,camera.y+H);
    if(right<=left||bottom<=top)return;
    ctx.drawImage(image,(left-x)/w*image.naturalWidth,(top-y)/h*image.naturalHeight,(right-left)/w*image.naturalWidth,(bottom-top)/h*image.naturalHeight,left,top,right-left,bottom-top);
  }
  function tile(name,x,y,w,h){const image=artwork[name];if(!image?.complete||!image.naturalWidth)return;patterns[name]||=ctx.createPattern(image,'repeat');ctx.save();ctx.translate(x,y);ctx.fillStyle=patterns[name];ctx.fillRect(0,0,w,h);ctx.restore();}
  if(typeof Image!=='undefined')for(const name of ['curved-stairs','cloud-sky','cloud-base','sky','hall','tree','fern','cloud','book','facade','door','portal-open','portal-closed','shelf','mill','sails','soil','grass','wood','cave']){const image=new Image();image.onload=()=>{renderDirty=true;};image.src='godot/assets/storybook/'+name+'.png';artwork[name]=image;}
  if(typeof Image!=='undefined')for(let i=0;i<4;i++){const image=new Image();image.onload=()=>{renderDirty=true;};image.src='html-assets/hero-'+i+'.svg';artwork['hero-'+i]=image;}
  if(typeof Image!=='undefined'){const image=new Image();image.onload=()=>{renderDirty=true;};image.src='html-assets/cave-body.png';artwork['cave-body']=image;}
  if(typeof Image!=='undefined'){const image=new Image();image.onload=()=>{renderDirty=true;};image.src='html-assets/echo-chalk.svg';artwork['echo-chalk']=image;}
  if(typeof Image!=='undefined'){const image=new Image();image.onload=()=>{renderDirty=true;};image.src='html-assets/race-child.svg';artwork['race-child']=image;}
  function roundRect(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function path(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}
  function line(x1,y1,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function cloud(x,y,s=1){art('cloud',x-160*s,y-65*s,360*s,120*s);}

  function hill(x,y,w,h,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-w,y+600);ctx.lineTo(x-w,y);ctx.bezierCurveTo(x-w*.7,y-h*.12,x-w*.3,y-h,x,y-h);ctx.bezierCurveTo(x+w*.4,y-h,x+w*.5,y-h*.1,x+w,y);ctx.lineTo(x+w,y+600);ctx.closePath();ctx.fill();}
  function background(){art(scene==='courtyard'?'cloud-sky':'sky',0,0,W,H);if(scene==='meadow'&&meadow.caveTop-camera.y<H){ctx.fillStyle='#294d53';ctx.fillRect(0,meadow.caveTop-camera.y,W,H);}}

  function tree(x,y,s=1){worldArt('tree',x-110*s,y-242*s,220*s,244*s);}

  function flower(x,y,i){const sway=Math.sin(clock*1.7+i)*2;line(x,y,x+sway,y-11,'#5f9870',1.5);ellipse(x+sway,y-12,4,4,i%3===0?'#efac89':i%3===1?'#ffefa8':'#f9f6d9');ellipse(x+sway,y-12,1.3,1.3,'#dcb463');}
  function drawPlatform(p,topOnly=null){
    if(topOnly===null){drawPlatform(p,false);drawPlatform(p,true);return;}
    if(p.collision_only||p.disabled||p.loftFloor&&!loftVisible())return;
    const edge=p.surface||[[p.x,p.y],[p.x+p.w,p.y]],edgeTop=Math.min(...edge.map(v=>v[1]));
    if(p.artKind&&window.WindCityArt){if(inView(p.x-5,edgeTop-10,p.w+10,Math.max(...edge.map(v=>v[1]))-edgeTop+(p.artDepth||64)+20))window.WindCityArt.platform(ctx,p,topOnly);return;}
    if(topOnly){
      if(!inView(p.x-4,edgeTop-20,p.w+8,Math.max(...edge.map(v=>v[1]))-edgeTop+60))return;
      if(p.type==='grass'&&!p.surface){tile('grass',p.x-2,p.y-16,p.w+4,48);return;}
      if(['cloud','cloud_base'].includes(p.type))return;
      if(!p.surface&&!p.cityStyle){ctx.fillStyle=p.type==='cave'?'#94b99c':'#c3bd99';ctx.fillRect(p.x,p.y,p.w,6);return;}
      ctx.strokeStyle=p.cityStyle?'#e2cda0':p.type==='grass'?'#a4bb91':p.type==='cave'?'#94b99c':'#c3bd99';ctx.lineWidth=p.cityStyle?5:6;ctx.beginPath();ctx.moveTo(...edge[0]);for(const v of edge.slice(1))ctx.lineTo(...v);ctx.stroke();return;
    }
    if(p.cityStyle){
      if(!inView(p.x,edgeTop,p.w,p.h+80))return;
      ctx.fillStyle=p.cityStyle==='roof'?'#718d8d':'#52717b';ctx.beginPath();ctx.moveTo(...edge[0]);for(const v of edge.slice(1))ctx.lineTo(...v);for(const v of [...edge].reverse())ctx.lineTo(v[0],v[1]+(p.cityStyle==='roof'?24:14));ctx.closePath();ctx.fill();
      if(p.cityStyle!=='roof'){ctx.strokeStyle='#819c9b';ctx.lineWidth=3;for(let x=p.x+8;x<p.x+p.w-16;x+=65){const y=surfaceHeight(p,x);ctx.beginPath();ctx.moveTo(x,y+16);ctx.lineTo(x+28,y+40);ctx.lineTo(Math.min(p.x+p.w,x+56),y+16);ctx.stroke();}}
      return;
    }

    if(p.surface){const top=Math.min(...p.surface.map(v=>v[1])),bottom=Math.max(p.y+p.h,...p.surface.map(v=>v[1]+35));if(!inView(p.x,top,p.w,bottom-top))return;ctx.save();ctx.beginPath();ctx.moveTo(...p.surface[0]);for(const v of p.surface.slice(1))ctx.lineTo(...v);ctx.lineTo(p.x+p.w,bottom);ctx.lineTo(p.x,bottom);ctx.closePath();ctx.clip();tile(p.type==='wood'?'wood':p.type==='cave'?'cave-body':'soil',p.x,top,p.w,bottom-top);ctx.restore();return;}
    if(p.x+p.w<camera.x-60||p.x>camera.x+W+60||p.y>camera.y+H+60||p.y+p.h<camera.y-60)return;
    const {x,y,w,h}=p;
    if(p.type==='cloud_base'){for(let i=0;i<=w/320;i++)art('cloud-base',x+i*320-45,y-24,440,158);ctx.fillStyle='#e7e4c8';ctx.fillRect(x,y,w,7);return;}
    if(p.type==='wood'&&scene==='courtyard'){roundRect(x-5,y,w+10,5,2,'#e5ddba');roundRect(x,y+5,w,10,2,'#b8bc9e');for(const xx of [x+15,x+w-30])path([[xx,y+15],[xx+15,y+15],[xx,y+30]],'#93a58c');return;}
    if(p.type==='cloud'){roundRect(x,y,w,h,12,'#e5e8d0');art('cloud',x-12,y-20,w+24,44);return;}
    tile(p.type==='wood'?'wood':p.type==='cave'?'cave-body':'soil',x,y,w,h);

  }

  function sign(){}

  function windmill(x,y){if(!inView(x-205,y-385,410,410))return;worldArt('mill',x-75,y-245,150,245);ctx.save();ctx.translate(x,y-180);ctx.rotate(millAngle);art('sails',-142,-142,284,284);ctx.restore();}

  function decorations(minLayer=-Infinity,maxLayer=10){
    if(meadow.decorations){
      for(const p of [...meadow.decorations].sort((a,b)=>window.WindLevel.layer(a)-window.WindLevel.layer(b))){
        const layer=window.WindLevel.layer(p);if(layer<minLayer||layer>=maxLayer)continue;
        if(!inView(p.x,p.y,p.w,p.h))continue;
        if(p.kind==='image')worldArt(p.asset,p.x,p.y,p.w,p.h);
        else if(p.kind==='water'){
          roundRect(p.x,p.y,p.w,p.h,2,'#bcf5e777');
          for(let i=0;i<8;i++){const y=p.y+(clock*100+i*99)%p.h;roundRect(p.x+p.w*(.15+(i%3)*.25),y,3,Math.min(48,p.y+p.h-y),2,'#ecfff080');}
        }else path([[p.x,p.y+p.h],[p.x,p.y+p.h*.38],[p.x+p.w*.46,p.y],[p.x+p.w,p.y+p.h*.54],[p.x+p.w*.8,p.y+p.h]],'#78bdac');
      }
      if(minLayer<10)windmill(mill.x,mill.y+26);return;
    }
    if(minLayer>=10)return;
    tree(88,1245,1.6,'#6a9e79');tree(730,1245,1.1,'#77aa7c');tree(1540,1246,.88,'#659875');tree(2440,1176,1.35,'#649775');tree(3480,926,1.1,'#669e79');tree(4200,806,1.6,'#619777');tree(1120,860,.55,'#81ac7d');
    sign(530,1208,'风屿 · 出发','EXPLORE  →');sign(1228,1208,'↓ 水晶回廊','CRYSTAL HOLLOW');sign(1760,928,'风车山巅 ↗','UP, UP & AWAY');
    windmill(2950,461);
    // A little spring among the low islands.
    ctx.save();ctx.globalAlpha=.55;const water=ctx.createLinearGradient(1900,1240,1950,1890);water.addColorStop(0,'#bcf5e7');water.addColorStop(1,'#79c8c3');ctx.fillStyle=water;ctx.fillRect(1983,1202,48,738);for(let i=0;i<8;i++){const yy=1202+(clock*100+i*99)%738;roundRect(1990+(i%3)*12,yy,3,48,2,'#ecfff0');}ctx.restore();
    for(let i=0;i<18;i++){let x=660+i*79,y=1930-(i%3)*13;path([[x,y],[x-7,y-28],[x+4,y-45],[x+14,y-21],[x+10,y]],i%2?'#78bdac':'#8aafc9');}

  }
  function labelAt(){}

  function drawBook(x,y,scale=1){if(!inView(x-32*scale,y-32*scale,64*scale,74*scale))return;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock*2)*.08);ctx.scale(scale,scale);art('book',-24,-26,50,61);ctx.restore();}

  function drawPortal(x,y,title,active=true){worldArt(active?'portal-open':'portal-closed',x-82,y-219,164,219);}

  function wallBooks(x,y,w,h){roundRect(x,y,w,h,5,'#7e9680');roundRect(x+6,y+6,w-12,h-12,3,'#34565a');for(let i=1;i<=5;i++)roundRect(x+6,y+h*i/6,w-12,5,0,'#bdb893');}

  function drawLibraryDoor(x,y){worldArt('door',x-76,y-208,152,208);}

  function drawHub(){
    if(scene==='courtyard'){
      worldArt('facade',600,160,980,660);
      worldArt('curved-stairs',200,430,610,410);
      path([[608,450],[641,435],[641,560],[608,573]],'#b5bca0');path([[615,455],[636,446],[636,557],[615,565]],'#355b57');
      line(618,458,618,559,'#91a78a',2);line(630,450,630,558,'#789880');ellipse(629,518,1.7,2.2,'#d9c797');
      drawLibraryDoor(810,820);
      ctx.save();ctx.translate(1363,327);ctx.rotate(clock*.55);art('sails',-165,-165,330,330);ctx.restore();
    }else{
      // A cross-section of the library; the narrow roof space is revealed by climbing.
      worldArt('hall',0,0,WORLD.w,WORLD.h);
      for(let i=0;i<6;i++){
        const x=310+i*420;if(!inView(x,550,175,280))continue;roundRect(x,550,175,280,[85,85,5,5],'#b5c3a8');roundRect(x+13,566,149,250,[72,72,3,3],'#9cbdad');
        line(x+88,575,x+88,812,'#e4dbb9',7);line(x+14,700,x+161,700,'#e4dbb9',7);
      }
      for(const shelf of worldShelves()){const rows=Math.ceil(shelf.books.length/4),top=shelf.y-rows*110+34;roundRect(shelf.x-8,top,shelf.w+16,shelf.y-top+8,6,'#97a88b');roundRect(shelf.x,top+8,shelf.w,shelf.y-top-8,3,'#34565a');for(let row=0;row<rows;row++)roundRect(shelf.x,shelf.y-row*110,shelf.w,7,1,'#c5b88d');}
      for(const x of [183,2580]){roundRect(x,490,33,1140,7,'#c5b590');roundRect(x-12,1540,58,90,7,'#b7a17b');}
      line(210,485,2570,485,'#a78f68',12);
      for(const x of [960,1650]){line(x,488,x,613,'#948d70',2);ellipse(x,627,28,19,'#e3d497');ellipse(x,627,16,10,'#f7efc5');}
      drawLibraryDoor(205,1630,true);art('door',431,1044,68,116);
      for(const p of portals)drawPortal(p.x,p.y,p.title,!!p.target);
      labelAt(930,1508,'云间郊野 · '+countBooks(books)+' / '+books.length+' 本');

      // The roof conceals the room until the player is physically inside it.
      {const roof=platforms.find(p=>p.art_surface==='roof'),edge=roof.surface.slice(1,-1);if(!loftVisible()){path([...roof.surface,[roof.x+roof.w,roof.y+roof.h+30],[roof.x,roof.y+roof.h+30]],'#e5e4d1');}else path([...edge,...[...edge].reverse().map(([x,y])=>[x,y+22])],'#789382');}
      if(loftVisible()){
        const s=shared.loft.shelf;
        roundRect(s.x,s.y,s.w,s.h,8,'#d8cb9f');roundRect(s.x+12,s.y+12,s.w-24,s.h-24,6,'#817e60');
        for(let i=0;i<shared.loft.capacity;i++){
          const x=shared.loft.slotX+i*shared.loft.spacing;
          line(x-12,shared.loft.slotY+18,x+12,shared.loft.slotY+18,'#b5ae94',2);
        }
      }
      for(const slot of shelfSlots()){
        if(slot.area==='library'&&!loftVisible())continue;
        if(collectedBooks.has(slot.book.id))drawBook(slot.x,slot.y,slot.scale||.7);
        else if(slot.area==='world'){line(slot.x-16,slot.y+22,slot.x+16,slot.y+22,'#8ca18b',2);}
      }
      labelAt(2480,1530,'书梯往上 · 试试二段跳');
      for(let i=0;i<9;i++){const x=2450-i*115,y=1420-i*130;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock+i)*.2);roundRect(-7,-9,14,18,2,'#f7f0d0a0');ctx.restore();}
    }
    for(const b of libraryBooks())if(b.scene===scene&&!collectedBooks.has(b.id)){drawBook(b.x,b.y+Math.sin(clock*2)*4);}
  }
  function drawQuests(){
    const q=questState;
    drawRace();
    crystals.forEach((p,i)=>{
      const active=q.ready[1]||q.echoInputs.at(-1)===i;
      ctx.save();ctx.shadowBlur=active?24:0;ctx.shadowColor='#aaf9e2';
      path([[p.x-21,p.y+34],[p.x-18,p.y-7],[p.x,p.y-33],[p.x+19,p.y-10],[p.x+23,p.y+34]],active?'#a5dfca':'#78a9b1');
      line(p.x,p.y-29,p.x+3,p.y+30,'#d3f8df',2);ctx.restore();for(let d=0;d<=i;d++)ellipse(p.x+(d-i/2)*9,p.y+18,2,2,'#f4e8ba');
    });
    worldArt('echo-chalk',meadow.echoSign.x,meadow.echoSign.y,300,50);
    sails.forEach((p,i)=>{if(q.sails[i])return;ctx.save();ctx.translate(p.x,p.y+Math.sin(clock*2+i)*4);ctx.rotate(.12);path([[-14,-18],[15,-12],[11,18],[-16,12]],'#f5e3bb');line(-9,-12,8,11,'#c9ad85',1);line(-9,11,9,-10,'#c9ad85',1);ctx.restore();labelAt(p.x,p.y-38,'遗落的帆布');});
    labelAt(mill.x,mill.y+55,q.ready[2]?'风车重新转动了':'修好风车 · 帆布 '+q.sails.filter(Boolean).length+' / 3');
    if(!q.ready[3]){
      const p=kitePoint();ctx.save();ctx.translate(p.x,p.y);
      path([[0,-25],[20,0],[0,23],[-20,0]],'#dca586');path([[0,-25],[0,23],[-20,0]],'#f2dfb8');line(0,-25,0,23,'#9e9b79',1);line(-20,0,20,0,'#9e9b79',1);
      for(let i=0;i<5;i++)line(Math.sin(clock*3+i)*6,24+i*9,Math.sin(clock*3+i+1)*6,33+i*9,'#b9caab',1.5);
      ctx.restore();labelAt(p.x,p.y-47,'跟着纸鸢 · '+(q.kite+1)+' / 4');
    }
    ctx.save();ctx.translate(wishingTree.x-195,wishingTree.y-1215);
    roundRect(150,1240,90,10,5,'#acba92');line(156,1240,156,1171,'#9b9c78',4);line(234,1240,234,1171,'#9b9c78',4);line(155,1171,235,1171,'#9b9c78',4);
    ellipse(195,1194,12,14,q.offered?'#e7ce89':'#bec7a0');line(195,1171,195,1180,'#9b9c78',1);line(195,1208,195,1224,'#9b9c78',1);
    labelAt(195,1146,q.ready[4]?'风回应了你的愿望':q.offered?'↓ 坐下听风':'听风台 · 20 金币');ctx.restore();
    books.forEach((b,i)=>{if(!q.ready[i]||collectedBooks.has(b.id))return;const yy=b.y+Math.sin(clock*2)*5;
      if(bookReveal?.book.id===b.id){const r=43+Math.sin(bookReveal.time*6)*7;ellipse(b.x,yy,r,r,'#f7e9ac55');ctx.strokeStyle='#f4e4a8';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.x,yy,r+10,r+10,0,0,Math.PI*2);ctx.stroke();}
      ellipse(b.x,yy,32,32,'#e8fac625');drawBook(b.x,yy);});
  }
  function playerShadow(){
    const x=player.x+player.w/2,feet=player.y+player.h;let surface=null,y=Infinity;
    for(const p of platforms){if(p.disabled||x<p.x||x>p.x+p.w)continue;const top=surfaceHeight(p,x);if(top>=feet-.5&&top<y){surface=p;y=top;}}
    const height=Math.max(0,y-feet);if(!surface||height>=360)return null;
    const strength=1-height/360;
    return {x,y,height,surface,rx:20*(.45+.55*strength),ry:4*(.45+.55*strength),alpha:.22*strength};
  }
  function drawPlayerShadow(){
    const shadow=playerShadow();if(!shadow||!inView(shadow.x-20,shadow.y-5,40,10))return;
    ctx.save();ctx.beginPath();ctx.rect(shadow.surface.x,shadow.y-6,shadow.surface.w,12);ctx.clip();
    ctx.globalAlpha=shadow.alpha;ellipse(shadow.x,shadow.y+1,shadow.rx,shadow.ry,'#274d4d');ctx.restore();
  }
  function drawPlayer(){
    drawPlayerShadow();
    const p=player;if(p.invincible>0&&Math.floor(clock*14)%2===0)return;
    const walk=p.grounded&&!p.crouching?Math.sin(clock*17)*Math.min(1,Math.abs(p.vx)/130):0;
    ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h);ctx.scale(p.facing,1);
    if(p.flipTime>0){ctx.translate(0,-32);ctx.rotate(Math.PI*2*(1-p.flipTime/MOVE.flipDuration)*p.flipFacing/p.facing);ctx.translate(0,32);}
    if(p.spin>0){
      ctx.strokeStyle='#eaffee';ctx.lineWidth=3;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,-24+i*7,37-i*3,9,0,clock*22+i*2,clock*22+i*2+Math.PI*1.35);ctx.stroke();}
      ctx.scale(Math.cos((p.spinDuration-p.spin)*Math.PI*12)*.8,1);
    }

    const frame=p.grounded&&!p.crouching&&Math.abs(p.vx)>25?Math.floor(clock*10)%4:0;
    art('hero-'+frame,-32,-72+Math.abs(walk)*1.5,64,80);
    ctx.restore();
  }
  function render(){
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
    if(expedition)window.WindExpansionRender.draw(expansionWorld(),expedition,{ctx,camera,W,H,art,player,collected:id=>collectedBooks.has(id)},'background');
    else if(scene==='library'){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a7c8bb');g.addColorStop(1,'#e5dcc0');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}else background();
    ctx.save();ctx.translate(-camera.x,-camera.y);
    if(expedition)window.WindExpansionRender.draw(expansionWorld(),expedition,{ctx,camera,W,H,art,player,collected:id=>collectedBooks.has(id)},'decorations');else if(scene==='meadow')decorations();else drawHub();
    // Bodies first, upper to lower; then all walkable edges. Authoring order
    // must never allow an upper platform's body to erase a lower landing.
    const platformPaint=[...platforms].sort((a,b)=>a.y-b.y);
    for(const p of platformPaint)drawPlatform(p,false);
    for(const p of platformPaint)drawPlatform(p,true);
    if(scene==='meadow')decorations(10,30);
    if(expedition)window.WindExpansionRender.draw(expansionWorld(),expedition,{ctx,camera,W,H,art,player,collected:id=>collectedBooks.has(id)},'middle');
    // Foreground objects are redrawn above terrain, whose top sits below them.
    for(const c of coins){if(collectedCoins.has(c.id)||c.x<camera.x-30||c.x>camera.x+W+30)continue;const yy=c.y+Math.sin(clock*2.6+(typeof c.id==='number'?c.id:c.x))*3,ww=5+Math.abs(Math.cos(clock*2+(typeof c.id==='number'?c.id:c.x)*.2))*4;ellipse(c.x,yy,ww+2,12,'#f8db78');ellipse(c.x,yy,ww,10,'#edb84c');line(c.x,yy-5,c.x,yy+5,'#fff0a0',2);}
    if(scene==='meadow'){drawQuests();drawPortal(meadow.exit.x,meadow.exit.y+40,'↑ 返回风之图书馆');}
    if(expedition){window.WindExpansionRender.draw(expansionWorld(),expedition,{ctx,camera,W,H,art,player,collected:id=>collectedBooks.has(id)});drawPortal(expansionWorld().exit.x,expansionWorld().exit.y+40,'返回图书馆');}
    for(const e of enemies){if(!e.alive)continue;const bounce=Math.sin(clock*8)*1.5;ellipse(e.x+17,e.y+30,21,4,'#3057451c');roundRect(e.x+5,e.y+11+bounce,25,19,7,'#ecd6a6');ellipse(e.x+17,e.y+10+bounce,23,13,'#c57e67');ellipse(e.x+8,e.y+5+bounce,4,3,'#f3dbb2');ellipse(e.x+24,e.y+7+bounce,5,3,'#f3dbb2');ellipse(e.x+12,e.y+21+bounce,1.5,2,'#58614e');ellipse(e.x+23,e.y+21+bounce,1.5,2,'#58614e');}
    if(scene==='library'&&window.WindIntro){window.WindIntro.drawKeeper(ctx,clock);window.WindIntro.drawBooks(ctx,art,opening,storyComplete,shelfSlots().filter(s=>s.area==='world'));}
    if(scene==='library'&&expansionProgress.machine?.mechanics?.city?.visitor){roundRect(1167,1599,26,26,4,'#ba9b6d');ellipse(1180,1589,13,14,'#e6c49d');ellipse(1180,1578,16,5,'#486970');line(1173,1623,1172,1630,'#435e58',5);line(1187,1623,1188,1630,'#435e58',5);ellipse(1185,1588,1.5,2,'#344f51');}
    drawPlayer();for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);ellipse(p.x,p.y,p.r,p.r,p.color);}ctx.globalAlpha=1;
    if(scene==='meadow')decorations(30,Infinity);
    if(expedition)window.WindExpansionRender.draw(expansionWorld(),expedition,{ctx,camera,W,H,art,player,collected:id=>collectedBooks.has(id)},'foreground');
    // Drifting foreground motes.
    for(let i=0;i<18;i++){const xx=(i*257+clock*12)%WORLD.w,yy=600+(i*173)%850+Math.sin(clock+i)*20;ellipse(xx,yy,2,2,'#ffffe2aa');}
    if(scene==='library'&&window.WindIntro)window.WindIntro.drawWind(ctx,opening,camera,W,H);
    ctx.restore();mapCtx.save();mapCtx.scale(2,2);drawMap();mapCtx.restore();if(modalKind==='map')drawFullMap();
  }
  function drawMap(c=mapCtx,mapW=180,mapH=82){
    const sx=mapW/WORLD.w,sy=mapH/WORLD.h;c.clearRect(0,0,mapW,mapH);c.fillStyle='#cedcc1';
    for(const p of platforms){if(p.disabled||p.loftFloor&&!loftVisible()||p.art_surface==='roof')continue;c.fillStyle=p.type==='cloud'?'#b5ccc0':p.type==='cave'?'#9fb9a7':'#b1c89f';c.fillRect(p.x*sx,p.y*sy,Math.max(2,p.w*sx),Math.max(2,Math.min(p.h*sy,14)));}
    for(const s of (adventureScene()?areaBooks():libraryBooks().filter(b=>b.scene===scene))){if(expedition&&!collectedBooks.has(s.id)&&!expansionProgress[scene]?.tasks?.[s.id]?.ready)continue;c.fillStyle=collectedBooks.has(s.id)?'#a8bc91':'#d5b052';c.beginPath();c.arc(s.x*sx,s.y*sy,2.2,0,7);c.fill();}
    if(expedition){const robots=expedition.entities.filter(e=>e.kind==='robot'&&e.path);for(const e of robots){
      const x=e.x*sx,y=e.y*sy;c.save();
      if(e.repaired){c.fillStyle='#85d6ad';c.fillRect(x-2,y-2,4,4);c.restore();continue;}
      if(e.mapTrail?.length){c.strokeStyle='#ffda7299';c.lineWidth=1;c.beginPath();e.mapTrail.forEach((p,i)=>i?c.lineTo(p.x*sx,p.y*sy):c.moveTo(p.x*sx,p.y*sy));c.lineTo(x,y);c.stroke();}
      c.fillStyle='#253d50';c.fillRect(x-4.5,y-4.5,9,9);c.strokeStyle='#ffe18c';c.lineWidth=1.3;c.strokeRect(x-4.5,y-4.5,9,9);c.beginPath();c.moveTo(x,y-4.5);c.lineTo(x,y-7);c.stroke();c.fillStyle='#fff3be';c.fillRect(x-2.5,y-1,1.5,2);c.fillRect(x+1,y-1,1.5,2);c.restore();
    }}
    if(scene==='library')for(const p of portals){c.fillStyle=p.target?'#78a59c':'#bdb495';c.fillRect((p.x-30)*sx,(p.y-80)*sy,5,5);}
    c.strokeStyle='#8aa48e60';c.lineWidth=.6;c.strokeRect(camera.x*sx,camera.y*sy,W*sx,H*sy);
    c.fillStyle='#d97e69';c.beginPath();c.arc((player.x+15)*sx,(player.y+22)*sy,3,0,7);c.fill();c.strokeStyle='#fffdf0';c.lineWidth=1;c.stroke();
  }
  function drawFullMap(){
    const target=$('world-map'),box=target.getBoundingClientRect();if(box.width<=0||box.height<=0)return;
    const ratio=Math.min(devicePixelRatio||1,2),width=Math.round(box.width*ratio),height=Math.round(box.height*ratio);if(target.width!==width||target.height!==height){target.width=width;target.height=height;}
    const c=target.getContext('2d');c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,box.width,box.height);
    const fit=Math.min((box.width-24)/WORLD.w,(box.height-24)/WORLD.h),mw=WORLD.w*fit,mh=WORLD.h*fit;c.save();c.translate((box.width-mw)/2,(box.height-mh)/2);drawMap(c,mw,mh);c.restore();
  }
  function resize(){
    const box=canvas.getBoundingClientRect();if(box.width<=0||box.height<=0)return;
    const ratio=box.width/box.height;H=expansionWorld()?Math.min(800,1800/ratio):800/(scene==='courtyard'?.8:1);W=H*ratio;
    // Bound raster work independently of CSS size, camera scale and physics.
    const dpr=Math.min(devicePixelRatio||1,2,Math.sqrt(1920*1080/(box.width*box.height)));
    const width=Math.max(1,Math.floor(box.width*dpr)),height=Math.max(1,Math.floor(box.height*dpr));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    renderDirty=true;
  }
  let modalKind=null;
  const gameKeys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyZ','KeyX','KeyC'];
  const releasedKeys=new Set(),physicalKeys=new Map();
  const controls=window.WindControls?.create(localStorage);
  let bindingAction=null,lastPreset=controls?.basePreset||'arrows';
  function controlText(text){if(!controls)return text;const map={Z:'KeyZ',X:'KeyX',C:'KeyC','↑':'ArrowUp','↓':'ArrowDown','←':'ArrowLeft','→':'ArrowRight'};return String(text).replace(/[↑↓←→]|\b[ZXC]\b/g,k=>controls.label(controls.map[map[k]]));}
  function renderBindings(){if(!controls)return;const list=$('key-bindings');list.replaceChildren();
    for(const [action,title]of Object.entries(controls.labels)){const b=document.createElement('button');b.textContent=title+'　'+controls.label(controls.map[action]);b.onclick=()=>{bindingAction=action;$('key-binding-status').textContent='请为“'+title+'”按下新按键（Esc 取消）';keys.clear();justPressed.clear();};list.append(b);}
    $('keys-arrows').setAttribute('aria-pressed',String(controls.preset==='arrows'));$('keys-wasd').setAttribute('aria-pressed',String(controls.preset==='wasd'));
    const k=a=>controls.label(controls.map[a]);$('control-summary').textContent=k('ArrowLeft')+' / '+k('ArrowRight')+' 移动 · '+k('KeyZ')+' 跳跃／二段跳 · '+k('KeyX')+' 旋转／空中缓降 · '+k('KeyC')+' 专属动作。'+k('ArrowUp')+' 互动 · '+k('ArrowDown')+' 坐地 · '+k('ArrowDown')+'＋'+k('KeyZ')+' 下穿平台。反向后立即跳跃：后空翻。空格／回车确认和跳过，Esc／P 暂停。';
    $('expedition-journal').textContent=k('Journal')+' · 旅途札记 / '+k('KeyC')+' · 专属动作';
    document.querySelectorAll('[data-key]').forEach(b=>{if(['KeyZ','KeyX','KeyC'].includes(b.dataset.key))b.textContent=k(b.dataset.key);});
  }
  function chooseKeys(name){if(!controls)return;controls.choose(name);lastPreset=name;bindingAction=null;keys.clear();justPressed.clear();physicalKeys.clear();releasedKeys.clear();renderBindings();$('key-binding-status').textContent='已切换预设并保存。';}
  if(controls){$('keys-arrows').onclick=()=>chooseKeys('arrows');$('keys-wasd').onclick=()=>chooseKeys('wasd');$('keys-reset').onclick=()=>chooseKeys(lastPreset);renderBindings();}
  function activeModal(){return modalKind?$(modalKind+'-overlay'):null;}
  function menuButtons(){return [...activeModal().querySelectorAll('button:not(:disabled)')].filter(b=>!b.hidden&&b.getClientRects().length);}
  let journalNavX=null;
  function navigateJournal(code){
    const entries=[...$('journal-list').children].filter(b=>!b.hidden&&!b.disabled),back=$('journal-back');
    const buttons=[...entries,back],current=document.activeElement;
    if(!buttons.includes(current)){entries[0]?.focus();return;}
    const rect=current.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    if(current!==back)journalNavX=cx;
    const vertical=code==='ArrowUp'||code==='ArrowDown',sign=code==='ArrowUp'||code==='ArrowLeft'?-1:1;
    const candidates=buttons.filter(b=>b!==current).map(button=>{const r=button.getBoundingClientRect();return {button,x:r.left+r.width/2,y:r.top+r.height/2};}).filter(p=>vertical?(p.y-cy)*sign>4:Math.abs(p.y-cy)<4&&(p.x-cx)*sign>4);
    candidates.sort((a,b)=>vertical?Math.abs(a.y-cy)-Math.abs(b.y-cy)||Math.abs(a.x-(journalNavX??cx))-Math.abs(b.x-(journalNavX??cx)):Math.abs(a.x-cx)-Math.abs(b.x-cx));
    const next=candidates[0]?.button;next?.focus({preventScroll:true});next?.scrollIntoView({block:'nearest'});
  }
  window.addEventListener('keydown',e=>{
    soundscape?.unlock();
    if(bindingAction&&(!paused||modalKind!=='settings'))bindingAction=null;
    if(bindingAction){e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){bindingAction=null;$('key-binding-status').textContent='已取消。';return;}const error=controls.bind(bindingAction,e.code);if(error){$('key-binding-status').textContent=error;return;}bindingAction=null;keys.clear();justPressed.clear();physicalKeys.clear();releasedKeys.clear();renderBindings();$('key-binding-status').textContent='已保存按键。';return;}
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    const code=controls?controls.resolve(e.code):e.code==='Space'?'Enter':e.code==='KeyP'?'Escape':e.code;
    if(!code)return;physicalKeys.set(e.code,code);
    if(e.target.matches?.('input,textarea'))return;
    if(opening&&!paused&&code==='Enter'){e.preventDefault();if(!e.repeat){releasedKeys.add(code);finishOpening();}return;}
    if(opening?.locked&&!paused&&gameKeys.includes(code)){e.preventDefault();releasedKeys.add(code);return;}
    if(speech&&!paused&&['Enter','ArrowUp','ArrowDown','Tab'].includes(code)){
      e.preventDefault();if(e.repeat)return;
      if(code==='Enter')advanceSpeech();
      else if(speech.options.length&&speech.shown>=speech.characters.length){
        speech.index=(speech.index+(code==='ArrowUp'||e.shiftKey?-1:1)+speech.options.length)%speech.options.length;
        [...$('adventure-options').children].forEach((b,i)=>{b.textContent=(i===speech.index?'▸ ':'')+speech.options[i].label;if(i===speech.index)b.scrollIntoView({block:'nearest'});});
      }
      return;
    }
    if(!paused&&!opening&&code==='Journal'&&expedition){e.preventDefault();if(!e.repeat)openJournal();return;}
    if(paused&&['journal','journal-entry'].includes(modalKind)&&(code==='Escape'||code==='KeyX')){e.preventDefault();if(!e.repeat){releasedKeys.add(code);if(modalKind==='journal-entry')showJournal();else closeJournal();}return;}
    if(code==='Escape'||(paused&&code==='KeyX')){e.preventDefault();if(e.repeat)return;releasedKeys.add(code);if(!paused)setPaused(true);else if(['settings','hint','confirm','map'].includes(modalKind))setPaused(true);else setPaused(false);return;}
    if(paused){
      if(['KeyZ','Enter','Space'].includes(code)){e.preventDefault();if(!e.repeat){releasedKeys.add(code);document.activeElement?.click();}return;}
      const scrolling=['PageDown','PageUp','Home','End'].includes(code)||(modalKind==='reader'&&['ArrowUp','ArrowDown'].includes(code));
      if(scrolling){const panel=modalKind==='journal-entry'?$('journal-entry-text'):modalKind==='journal'?$('journal-list'):modalKind==='reader'?$('reader-content'):modalKind==='adventure'?activeModal().querySelector('.adventure-panel'):activeModal().querySelector('.reader-panel,.library-panel');if(panel){e.preventDefault();panel.scrollTop=code==='Home'?0:code==='End'?panel.scrollHeight:panel.scrollTop+(['PageDown','ArrowDown'].includes(code)?1:-1)*(code.startsWith('Page')?300:42);}return;}
      if(modalKind==='journal'&&code.startsWith('Arrow')){e.preventDefault();if(!e.repeat)navigateJournal(code);return;}
      if(code.startsWith('Arrow')||code==='Tab'){e.preventDefault();const buttons=menuButtons(),i=buttons.indexOf(document.activeElement),step=(code==='ArrowUp'||code==='ArrowLeft'||e.shiftKey)?-1:1;const next=buttons[(i+step+buttons.length)%buttons.length];next?.focus();next?.scrollIntoView({block:'nearest'});}return;
    }
    if((bookReveal||race?.status==='handing'&&scene==='meadow')&&gameKeys.includes(code)){e.preventDefault();releasedKeys.add(code);return;}
    if(!gameKeys.includes(code)||releasedKeys.has(code))return;e.preventDefault();if(!keys.has(code))justPressed.add(code);keys.add(code);
  });
  window.addEventListener('keyup',e=>{const code=physicalKeys.get(e.code)||(controls?controls.resolve(e.code):e.code);physicalKeys.delete(e.code);if(![...physicalKeys.values()].includes(code))keys.delete(code);releasedKeys.delete(code);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused)setPaused(true);});
  const touchReleases=[];
  document.querySelectorAll('[data-key]').forEach(b=>{
    const pointers=new Set();
    const clear=()=>{pointers.clear();keys.delete(b.dataset.key);b.classList.remove('is-held');};touchReleases.push(clear);
    b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(opening?.locked&&!paused)return;if(!paused&&!bookReveal){pointers.add(e.pointerId);b.classList.add('is-held');if(!keys.has(b.dataset.key))justPressed.add(b.dataset.key);keys.add(b.dataset.key);}});
    const release=e=>{pointers.delete(e.pointerId);if(!pointers.size)clear();};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
  });
  window.addEventListener('blur',()=>{touchReleases.forEach(release=>release());physicalKeys.clear();if(!paused)setPaused(true);});
  if(window.matchMedia?.('(pointer: coarse)').matches)document.querySelector('.touch-controls').classList.add('enabled');
  document.addEventListener('pointerdown',()=>soundscape?.unlock(),{capture:true});
  canvas.addEventListener('pointerdown',()=>canvas.focus({preventScroll:true}));
  $('opening-skip').onclick=()=>{if(opening&&!paused)finishOpening();};
  $('expedition-journal').onclick=openJournal;$('menu-journal').onclick=openJournal;$('journal-back').onclick=closeJournal;$('journal-entry-back').onclick=showJournal;
  $('pause').onclick=()=>setPaused(!paused);$('resume').onclick=()=>setPaused(false);
  $('restart').onclick=()=>{setPaused(true);$('pause-overlay').querySelector('h2').textContent='想再探索一次吗？';};
  $('confirm-restart').onclick=()=>setPaused(true,'confirm');$('reset-yes').onclick=()=>init(true);$('reset-no').onclick=()=>setPaused(true);
  $('library').onclick=openLibrary;$('library-close').onclick=finishReading;$('reader-close').onclick=finishReading;$('reader-shelf').onclick=openLibrary;
  $('export-godot-save').onclick=()=>exportGodotSave(false);$('export-full-save').onclick=()=>exportGodotSave(true);
  $('return-hub').onclick=()=>{changeScene('library',true);toast('回到机械迷城入口 · 收藏进度保留',4);};
  $('shelf').addEventListener('click',e=>{const button=e.target.closest('[data-book]');if(button)openBook(button.dataset.book);});
  $('continue').onclick=()=>setPaused(false);$('play-again').onclick=()=>setPaused(true,'confirm');
  $('sound').onclick=()=>{sound=!sound;soundscape?.setEnabled(sound);try{localStorage.setItem('wind-machine-playtest-audio',String(sound));}catch{}soundUi();$('sound').focus();};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.game-shell').requestFullscreen();}catch{toast('当前浏览器不支持全屏，可以使用浏览器的全屏功能。');}$('fullscreen').focus();};
  $('hint').onclick=()=>{if(expedition){openJournal();return;}const remaining=areaBooks().filter(b=>!collectedBooks.has(b.id));$('hint-body').textContent=scene==='courtyard'?'靠近大门按 ↑ 进馆。树冠与雨棚也能跳上去。':scene==='library'?'底层第一扇书洞通往云间郊野；右侧书梯通向屋顶深处。':remaining.length?remaining[0].hint:'云间郊野的书都找回来了。';setPaused(true,'hint');};
  $('race-start').onclick=startRace;$('race-later').onclick=()=>setPaused(false);
  $('view-map').onclick=()=>{$('world-map-title').textContent=(expedition?expansionWorld().name:scene==='meadow'?'云间郊野':scene==='courtyard'?'图书馆门口':'风之图书馆')+' · 地图';setPaused(true,'map');drawFullMap();};
  $('map-back').onclick=()=>setPaused(true);
  $('settings').onclick=()=>setPaused(true,'settings');
  $('settings-back').onclick=$('hint-back').onclick=()=>setPaused(true);
  $('touch-toggle').onclick=()=>{document.querySelector('.touch-controls').classList.toggle('enabled');touchReleases.forEach(release=>release());};
  $('import-save').onclick=()=>$('save-file').click();
  $('save-file').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(![3,4,5,6].includes(data.version)||!Array.isArray(data.books)||!Array.isArray(data.coins))throw Error();const raw=JSON.stringify(data);localStorage.setItem(SAVE_KEY,raw);init();toast('存档已导入，回到机械迷城入口。');}catch{toast('存档无法读取，收藏未更改。');}e.target.value='';};
  new ResizeObserver(resize).observe(canvas);
  function frame(time){
    const elapsed=Math.min((time-lastTime)/1000,.05);lastTime=time;
    soundscape?.tick(elapsed,player,expedition,platforms);
    if(!paused){accumulator+=elapsed;while(accumulator>=1/120){update(1/120,keys.has('KeyZ'));accumulator-=1/120;if(paused){accumulator=0;break;}}}else accumulator=0;
    if(time>toastUntil)$('toast').classList.remove('show');
    if(!paused||renderDirty){render();renderDirty=false;}requestAnimationFrame(frame);
  }
  resize();init();requestAnimationFrame(frame);
})();
