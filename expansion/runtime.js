/* Quest and local ability simulation; time is seconds, coordinates are world units. */
(function(root){
  function create(world,progress,api){
    progress.tasks ||= {};progress.ability=progress.ability===true;
    const entities=world.entities.map(e=>({...e,path:e.path?.map(p=>({...p})),leg:0,travel:0})),byId=Object.fromEntries(entities.map(e=>[e.id,e]));
    const sessions={},get=t=>{const s=progress.tasks[t.id] ||= {stage:0,seen:[],inputs:[],ready:false};if(!Number.isInteger(s.stage)||s.stage<0||s.stage>t.stages.length)s.stage=0;if(!Array.isArray(s.seen))s.seen=[];if(!Array.isArray(s.inputs))s.inputs=[];if(api.collected(t.id))s.ready=true;return s;};
    let cooldown=0,effect=0,specialUsed=false,focused=null,time=0,ride=null,climbing=null,wet=false,magnetPull=null;
    const units=entities.filter(e=>e.mechanic);
    function syncConveyors(){for(const e of units.filter(e=>e.mechanic==='conveyor'&&e.platformId)){const deck=api.platforms().find(p=>p.id===e.platformId);if(deck){e.x=deck.x+deck.w/2;e.y=deck.y-22;e.radius=deck.w/2;}}}syncConveyors();
    const specialized=root.WindWorldMechanics?.[world.id]?.create(world,progress.mechanics ||= {},{...api,entities,
      // Specialized mechanisms see C only when the shared ability actually activated.
      pressed:()=>{const input=api.pressed();return input.has('KeyC')&&!specialUsed?new Set([...input].filter(k=>k!=='KeyC')):input;},
      complete:id=>{const t=world.tasks.find(t=>t.id===id);if(t&&!get(t).ready)next(t);},
      isComplete:id=>{const t=world.tasks.find(t=>t.id===id);return !!t&&get(t).ready;}});
    const near=(e,r=65)=>e&&Math.hypot(e.x-api.player().x-15,e.y-api.player().y-api.player().h/2)<r;
    const live=t=>{if(sessions[t.id])return sessions[t.id];const won=get(t).raceWon===true,s=t.stages[get(t).stage];return sessions[t.id]={hold:0,elapsed:won?(s?.seconds||0):0,started:won,winner:won,lost:false,carrying:false,give:0,origin:won?s?.finish:undefined};};
    const stage=t=>t.stages[get(t).stage];
    function next(t){const s=get(t);s.stage++;s.seen=[];s.inputs=[];delete s.raceWon;sessions[t.id]={hold:0,elapsed:0,started:false,lost:false,carrying:false,give:0};
      if(s.stage>=t.stages.length){s.ready=true;api.reveal(t.id);}else api.toast(t.title+'：'+t.stages[s.stage].text,6);api.save();}
    function move(e,dt,loop){if(!e.path?.length)return true;const path=e.path;let remaining=dt;
      while(remaining>0){const goal=path[(e.leg+1)%path.length],dx=goal.x-e.x,dy=goal.y-e.y,d=Math.hypot(dx,dy),speed=e.speed||110;
        if(d<.01){e.leg++;if(e.leg>=path.length-1){if(!loop)return true;e.leg=0;e.x=path[0].x;e.y=path[0].y;}continue;}
        const seconds=Math.min(remaining,d/speed);e.x+=dx/d*speed*seconds;e.y+=dy/d*speed*seconds;remaining-=seconds;
        if(seconds<d/speed)break;
      }return !loop&&e.leg>=path.length-1;
    }
    function racePath(origin,finish){
      const floor=p=>world.platforms.find(f=>p.x>=f.x&&p.x<=f.x+f.w&&Math.abs(f.y-p.y-22)<8),start=floor(origin),end=floor(finish);
      if(!start||!end)return [{...origin},{...finish,jump:Math.abs(origin.y-finish.y)>2}];
      const graph=new Map(world.platforms.map(p=>[p.id,[]]));for(const r of world.routes||[]){graph.get(r.from)?.push(r.to);graph.get(r.to)?.push(r.from);}
      const queue=[start.id],parent=new Map([[start.id,null]]);for(let i=0;i<queue.length&&!parent.has(end.id);i++)for(const id of graph.get(queue[i])||[])if(!parent.has(id)){parent.set(id,queue[i]);queue.push(id);}
      if(!parent.has(end.id))return [{...origin},{...finish,jump:true}];
      const chain=[];for(let id=end.id;id!==null;id=parent.get(id))chain.unshift(world.platforms.find(p=>p.id===id));
      const points=[{...origin}];for(let i=1;i<chain.length;i++){const a=chain[i-1],b=chain[i],right=b.x+b.w/2>a.x+a.w/2;
        points.push({x:right?a.x+a.w-30:a.x+30,y:a.y-22});points.push({x:right?b.x+30:b.x+b.w-30,y:b.y-22,jump:true});}
      points.push({...finish});return points;
    }
    function racePosition(path,fraction){
      const lengths=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y));let remaining=lengths.reduce((a,b)=>a+b,0)*fraction;
      for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const t=lengths[i]?Math.min(1,remaining/lengths[i]):1,a=path[i],b=path[i+1];return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t-(b.jump?Math.sin(t*Math.PI)*90:0)};}remaining-=lengths[i];}return path.at(-1);
    }
    function dialogue(t,s,onConfirm){api.dialogue(t.title,s.text,[{label:'明白了',action:onConfirm},{label:'稍后再来',action:()=>{}}],s.targets?.map(id=>byId[id]).filter(Boolean).sort((a,b)=>Math.hypot(a.x-api.player().x,a.y-api.player().y)-Math.hypot(b.x-api.player().x,b.y-api.player().y))[0]);}
    function physics(dt){specialized?.environmentPhysics?.(dt);cooldown=Math.max(0,cooldown-dt);effect=Math.max(0,effect-dt);specialUsed=false;const p=api.player(),keys=api.keys();
      if(ride){
        ride.elapsed=Math.min(ride.duration,ride.elapsed+dt);const t=ride.elapsed/ride.duration;
        p.x=ride.from.x+(ride.to.x-ride.from.x)*t-15;p.y=ride.from.y+(ride.to.y-ride.from.y)*t+22-p.h;
        p.vx=0;p.vy=-.001;p.grounded=false;p.ground=null;p.jumpCut=false;p.spin=0;p.jumps=0;
        if(t===1){ride=null;p.vy=0;}return;
      }
      syncConveyors();for(const e of units){
        const dx=p.x+15-e.x,feet=p.y+p.h,ground= e.y+22,r=e.radius||65;
        if(e.mechanic==='spring'&&Math.abs(dx)<r&&Math.abs(feet-ground)<12&&p.grounded&&!keys.has('ArrowDown')){
          p.vy=-(e.power||950);p.grounded=false;p.ground=null;p.jumps=1;p.jumpCut=false;p.airSpinUsed=false;e.pulse=.35;
        }else if(e.mechanic==='conveyor'&&p.grounded&&(!e.platformId||p.ground?.id===e.platformId)&&Math.abs(dx)<r&&Math.abs(feet-ground)<12){p.x+=(e.direction||1)*(e.power||160)*dt;}
        else if(e.mechanic==='gust'&&Math.abs(dx)<r&&feet<=ground+12&&feet>ground-(e.height||440)){
          p.vy=Math.max(-(e.power||460),p.vy-3000*dt);p.grounded=false;p.jumpCut=false;p.airSpinUsed=false;
        }else if(e.mechanic==='bubble'&&near(e,r)){
          p.vy=keys.has('ArrowDown')?180:Math.min(p.vy,-(e.power||220));p.airSpinUsed=false;p.jumpCut=false;
        }
        e.pulse=Math.max(0,(e.pulse||0)-dt);
      }
      const waters=world.water||world.decorations.filter(d=>d.kind==='water'),water=[...waters].reverse().find(d=>p.x+15>d.x&&p.x+15<d.x+d.w&&p.y+p.h>d.y&&p.y<d.y+d.h);wet=!!water;
      if(wet){p.vy=Math.min(p.vy,105);p.vx*=Math.exp(-1.8*dt);if(keys.has('ArrowUp'))p.vy=-205;if(keys.has('ArrowDown'))p.vy=230;if(api.pressed().has('KeyZ')&&!keys.has('ArrowDown'))p.vy=-320;p.x+=(water.currentX||0)*dt;p.y+=(water.currentY||0)*dt;p.airSpinUsed=false;}
      if(api.pressed().has('KeyZ')||api.pressed().has('KeyC')||keys.has('ArrowLeft')||keys.has('ArrowRight'))climbing=null;
      else if(keys.has('ArrowUp')||keys.has('ArrowDown'))climbing=(world.climbs||[]).find(v=>Math.abs(p.x+15-v.x)<(v.width||50)/2&&p.y+p.h>v.y&&p.y<v.y+v.h)||null;
      if(climbing&&(p.y+p.h<climbing.y||p.y>climbing.y+climbing.h))climbing=null;
      if(climbing){p.x=climbing.x-15;p.vx=0;p.vy=keys.has('ArrowUp')?-200:keys.has('ArrowDown')?200:0;p.grounded=false;p.ground=null;p.jumps=0;p.coyote=.1;p.jumpCut=false;}
      if(api.pressed().has('KeyC')&&cooldown===0){if(!progress.ability){api.toast('先寻找'+world.ability.name+'的导师，按 ↑ 学习。',4);return;}cooldown=.8;effect=.65;specialUsed=true;
        const mode=world.ability.mode;
        if(mode==='gust'){p.vx=p.facing*680;p.vy=Math.min(p.vy,-90);}
        else if(mode==='swim'){if(!wet){specialUsed=false;effect=0;api.toast('进入水域后再按 C 冲游。',3);return;}p.vy=keys.has('ArrowDown')?450:-480;p.vx=p.facing*460;}
        else if(mode==='magnet'){
          const pc={x:p.x+15,y:p.y+p.h/2},anchors=world.decorations.filter(d=>d.kind==='gear').map(d=>({x:d.x+d.w/2,y:d.y+d.h/2,kind:'gear',stop:Math.max(d.w,d.h)/2+24})).filter(a=>Math.hypot(a.x-pc.x,a.y-pc.y)<600);
          // An exposed boss core is the closest magnetic target during a counter.
          for(const t of world.tasks.filter(t=>t.stages[0].challenge==='machine-boss')){const s=specialized?.inspect(t.id);if(s?.active&&s.phase==='core'){const a={x:s.x,y:t.challengeData.arena.y+t.challengeData.arena.h-85,stop:95};if(Math.hypot(a.x-pc.x,a.y-pc.y)<170)anchors.unshift(a);}}
          anchors.sort((a,b)=>Math.hypot(a.x-pc.x,a.y-pc.y)-Math.hypot(b.x-pc.x,b.y-pc.y));
          magnetPull=anchors.length?{...anchors[0],remaining:anchors[0].kind==='gear'?Infinity:1.2}:null;
        }else if(mode==='vine'){
          const anchors=world.decorations.filter(d=>d.kind==='vine'&&Math.hypot(d.x+d.w/2-p.x-15,d.y-p.y)<600).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
          if(anchors.length){const a=anchors[0];p.vy=-850;p.vx=Math.max(-480,Math.min(480,(a.x+a.w/2-p.x-15)*2));p.jumps=1;p.jumpCut=false;}
          else {p.vy=Math.min(p.vy,-180);api.toast('靠近藤蔓，C 可借力荡起。',3);}
        }else if(mode==='lantern'){p.vy=Math.min(p.vy,40);effect=2;}
      }
      if(magnetPull){
        magnetPull.remaining-=dt;const dx=magnetPull.x-p.x-15,dy=magnetPull.y-p.y-p.h/2,distance=Math.hypot(dx,dy),gap=distance-magnetPull.stop;
        if(api.pressed().has('KeyZ')||magnetPull.remaining<=0){magnetPull=null;}
        else if(gap<=5){if(magnetPull.kind!=='gear')magnetPull=null;else {p.jumps=1;p.coyote=.1;p.grounded=false;p.ground=null;}p.vx=0;p.vy=0;}
        else {const speed=Math.min(620,gap*8,gap/dt);p.vx=dx/distance*speed;p.vy=dy/distance*speed;p.grounded=false;p.ground=null;p.jumpCut=false;p.jumps=Math.max(1,p.jumps);}
      }
      if(effect>0&&world.ability.mode==='gust')p.vx=p.facing*600;
      if(effect>0&&world.ability.mode==='lantern'&&p.vy>70)p.vy=70;
      if(Object.values(sessions).some(s=>s.carrying))p.vx=Math.max(-230,Math.min(230,p.vx));
      specialized?.physics?.(dt);
    }
    function interact(t,s,state,session){
      if(s.type==='choice'){api.dialogue(t.title,s.text,s.choices.map((label,i)=>({label,action:()=>{if(i===s.answer)next(t);else api.toast('再看看附近的线索。'+s.text,6);}})));return;}
      if(s.type==='talk'){dialogue(t,s,()=>next(t));return;}
      if(['race','escort'].includes(s.type)){if(session.lost){api.toast('这次挑战结束了，回到图书馆再进来可以重新开始。',4);return;}if(session.started){api.toast(s.text,4);return;}dialogue(t,s,()=>{session.started=true;session.elapsed=0;session.winner=false;const e=byId[s.targets[0]];session.origin={x:e.x,y:e.y};if(s.type==='race')session.path=racePath(session.origin,s.finish);if(e.path?.length){e.leg=0;e.x=e.path[0].x;e.y=e.path[0].y;}});return;}
      if(s.type==='carry'){if(!session.carrying&&near(byId[s.targets[0]])){dialogue(t,s,()=>{session.carrying=true;session.elapsed=0;api.toast('已拿好，送到 '+byId[s.targets[1]].name+' 再按 ↑。X 会放下。',5);});}else if(session.carrying&&near(byId[s.targets[1]]))dialogue(t,s,()=>next(t));return;}
      api.dialogue(t.title,s.text,[{label:'继续探索',action:()=>{}}]);
    }
    function update(dt,spin){time+=dt;const p=api.player(),pressed=api.pressed(),keys=api.keys();focused=null;
      if(ride){specialized?.background?.(dt);return;}
      const teacher=world.ability.teacher;
      if(near(teacher,70)&&pressed.has('ArrowUp')){api.dialogue(world.ability.name,world.ability.description+'\n按 C 使用。',[{label:progress.ability?'再试试看':'学习这个动作',action:()=>{progress.ability=true;api.save();api.toast('学会 '+world.ability.name+' · C 使用',5);}}]);return;}
      if(specialized?.update?.(dt,spin))return;
      for(const e of entities)if(e.path&&world.tasks.some(t=>stage(t)?.type==='chase'&&stage(t).targets.includes(e.id)))move(e,dt,true);
      for(const t of world.tasks){const state=get(t);if(state.ready){if(!api.collected(t.id)&&near(t.reward,38)){api.collect(t.id);return;}continue;}const s=stage(t);if(!s)continue;const session=live(t),targets=s.targets.map(id=>byId[id]);
        if(s.type==='challenge')continue;
        if(s.type==='redcoins'){
          for(const e of targets)if(!state.seen.includes(e.id)&&near(e,32)){state.seen.push(e.id);api.save();api.toast('红币 '+state.seen.length+' / 8'+(state.seen.length===8?' · 回起点兑换风之书。':''),3);}
          if(pressed.has('ArrowUp')&&near(byId[s.redeem],75)){api.dialogue(t.title,state.seen.length===8?'八枚红币找齐了，把这本风之书带回图书馆吧。':'还差 '+(8-state.seen.length)+' 枚红币，散落在这个世界不同的支路上。',[{label:state.seen.length===8?'兑换风之书':'继续寻找',action:()=>{if(state.seen.length===8)next(t);}}]);return;}continue;
        }
        if(session.started||session.carrying)session.elapsed+=dt;
        if(s.limit&&session.elapsed>s.limit){session.started=false;session.carrying=false;session.elapsed=0;state.seen=[];state.inputs=[];api.save();api.toast('时间到了，这组机关已复原，可以重新开始。',3);}
        if(s.type==='carry'&&session.carrying&&pressed.has('KeyX')){session.carrying=false;api.toast('物品放回原处了。',3);}
        if(s.type==='escort'&&session.started&&near(targets[0],180)){if(move(targets[0],dt,false)){next(t);return;}}
        if(s.type==='race'&&session.started){
          const npc=targets[0],fraction=Math.min(1,session.elapsed/s.seconds),origin=session.origin||npc;
          Object.assign(npc,racePosition(session.path||[origin,s.finish],fraction));
          if(!session.winner&&session.elapsed>=s.seconds){session.started=false;session.lost=true;api.toast('对手先到了，下次进入世界再比赛。',4);}
          else if(!session.winner&&near(s.finish,60)&&p.grounded){session.winner=true;state.raceWon=true;api.save();api.toast('你先到了，等对手赶来把书交给你。',4);}
          if(session.winner&&session.elapsed>=s.seconds&&near(s.finish,85)&&p.grounded){session.give+=dt;if(session.give>=1.4){next(t);return;}}
        }
        if(['hold','hidden'].includes(s.type)){if(targets.some(e=>near(e,s.radius||70))&&keys.has('ArrowDown')&&Math.abs(p.vx)<25){session.hold+=dt;if(session.hold>=(s.seconds||2)){next(t);return;}}else session.hold=0;}
        if(['touch','spin','special','chase','sequence'].includes(s.type))for(const e of targets){const hit=near(e,s.radius||(s.type==='chase'?72:62));if(!hit)continue;
          const valid=s.type==='touch'||s.type==='special'&&specialUsed||['spin','sequence','chase'].includes(s.type)&&spin;
          if(!valid)continue;
          if(s.limit&&!session.started){session.started=true;session.elapsed=0;}
          if(s.type==='sequence'){state.inputs.push(e.id);if(state.inputs.length===s.pattern.length){if(state.inputs.every((id,i)=>id===s.pattern[i])){next(t);return;}state.inputs=[];api.toast('回声没有合上，再听听完整的提示。',3);}else api.toast('机关响了 '+state.inputs.length+' 声。',2);api.save();break;}
          if(!state.seen.includes(e.id)){state.seen.push(e.id);api.save();if(state.seen.length>=(s.count||targets.length)){next(t);return;}api.toast(t.title+' · '+state.seen.length+' / '+(s.count||targets.length),3);}
        }
        const candidates=s.type==='carry'?[targets[session.carrying?1:0]]:targets;
        if(candidates.some(e=>near(e,78))){focused ||= {task:t,stage:s,state,session};}
      }
      if(pressed.has('ArrowUp')&&focused){interact(focused.task,focused.stage,focused.state,focused.session);return;}
      if(pressed.has('ArrowUp'))for(const e of units){
        if(e.mechanic==='ferry'&&(near(e,70)||near(e.destination,70))){
          const to=near(e,70)?e.destination:e,from={x:p.x+15,y:p.y+p.h-22};
          ride={id:e.id,from,to:{x:to.x,y:to.y},elapsed:0,duration:Math.max(.8,Math.hypot(to.x-from.x,to.y-from.y)/(e.speed||520))};
          api.toast(e.name+'载你前往另一端。',3);return;
        }
        if(near(e,75)){api.dialogue(e.name,e.description||'观察它的动作，借它的力量继续前进。',[],e);return;}
      }
      if(pressed.has('ArrowUp'))for(const e of entities)if((e.kind==='sign'||e.kind==='npc')&&near(e)){api.dialogue(e.name,e.description||'风把字迹吹淡了。',[],e);return;}
    }
    function journal(){return world.tasks.map(t=>{const s=get(t),session=live(t);return {id:t.id,title:t.title,ready:s.ready,collected:api.collected(t.id),text:s.ready?'风之书已经出现，循着地图找到它。':stage(t)?.type==='redcoins'?'红币 '+s.seen.length+' / 8 · 集齐后回到起点按 ↑ 兑换。':(stage(t)?.type==='challenge'?(stage(t)?.text||t.hint)+'\n'+(specialized?.status?.(t.id)||''):null)|| (session.lost?'本次比赛落败；重新进入世界再挑战。':stage(t)?.text||t.hint),progress:s.stage+'/'+t.stages.length};});}
    return {update,physics,entities,getState:get,getSession:live,journal,specialized,get climbing(){return climbing},get wet(){return wet},get ride(){return ride},get magnetTarget(){return magnetPull?{x:magnetPull.x,y:magnetPull.y}:null},get effect(){return effect},get focused(){return focused},get learned(){return progress.ability},get time(){return time}};
  }
  root.WindQuestRuntime={create};
})(typeof window==='undefined'?globalThis:window);
