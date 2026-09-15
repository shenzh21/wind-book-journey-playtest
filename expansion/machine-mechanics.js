(function(root){'use strict';
  function create(world,state,api){
    const city=createCity(world,state,api),wheel=createFlywheel(world,state,api),hoists=createHoists(world,api),patrol=createPatrol(world,state,api),tasks=world.tasks.filter(t=>t.stages[0].type==='challenge'&&!['machine-patrol','machine-flywheel','machine-city'].includes(t.stages[0].challenge)),runs=new Map();state.attempts ||= {};
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),p=()=>api.player(),center=()=>({x:p().x+p().w/2,y:p().y+p().h/2}),near=(a,r=75)=>Math.hypot(center().x-a.x,center().y-a.y)<r;
    function init(t){const key=t.stages[0].challenge.slice(8),o=t.challengeData.origin,s={active:true,key,time:0,health:3,phase:'warn',timer:0,hits:0,attack:0,gears:[0,0,0],mirrors:[1,1],charge:0,x:o.x,v:0,polarity:-1,flips:0,hook:false,released:false,gate:0,items:[],spawn:0,sent:0,sorted:0,mistakes:0,pressure:20,heat:false,stable:0,angle:1,speed:320,cool:0,relay:0,repairs:0};if(key==='boss')Object.assign(s,{phase:'approach',x:o.x,waves:[],facing:1,hurtCooldown:0,health:p().hp??3});runs.set(t.id,s);state.attempts[t.id]=(state.attempts[t.id]||0)+1;api.save();api.toast(t.stages[0].text,8);return s;}
    function win(t,s){if(!api.isComplete(t.id)){s.active=false;s.result='won';api.complete(t.id);}}
    function lose(t,s,message){s.active=false;s.result='lost';s.hook=false;api.toast(message+' 回到装置按 ↑ 可以重试。',6);}
    function damage(t,s){const actor=p();if(actor.invincible>0)return;api.damage();s.health=actor.hp;if(actor.hp<=0){s.active=false;s.result='lost';s.waves=[];}}
    function update(dt,spin){if(city.update(dt,spin))return true;if(wheel.update())return true;if(patrol.update(dt,spin))return true;const keys=api.keys(),pressed=api.pressed();let handled=false;
      for(const t of tasks){if(api.isComplete(t.id))continue;const o=t.challengeData.origin,e=api.entities.find(e=>e.id===t.stages[0].targets[0]);let s=runs.get(t.id);
        if(!s?.active){if(e&&near(e)&&pressed.has('ArrowUp')){init(t);return true;}continue;}
        if(s.key==='boss'&&(center().x<t.challengeData.arena.x-80||center().x>t.challengeData.arena.x+t.challengeData.arena.w+80||center().y>t.challengeData.arena.y+t.challengeData.arena.h+120||center().y<t.challengeData.arena.y-100)){s.active=false;s.result='retreated';s.waves=[];continue;}if(Math.abs(center().x-o.x)>850||Math.abs(center().y-o.y)>650){s.hook=false;continue;}s.time+=dt;s.cool=Math.max(0,s.cool-dt);
        const x=center().x-o.x,y=center().y-o.y,C=pressed.has('KeyC'),U=pressed.has('ArrowUp');
        switch(s.key){
          case 'boss':{updateBoss(t,s,dt,C);break;}
          case 'gears':{
            if(spin){const i=t.challengeData.points.findIndex(q=>near(q,65));if(i>=0)s.gears[i]=(s.gears[i]+1)%4;}
            s.engaged=C&&Math.abs(x)<95;if(s.engaged){const [a,b,c]=s.gears;if(a===1&&a+b===4&&b+c===5)win(t,s);else api.toast('齿轮咬住了：左=1，左+中=4，中+右=5。',4);}break;
          }
          case 'laser':{
            const ms=t.challengeData.mirrors,receiver=t.challengeData.receiver;if(spin){const i=ms.findIndex(m=>near(m,65));if(i>=0)s.mirrors[i]=1-s.mirrors[i];}
            // Each / mirror maps (dx,dy) to (-dy,-dx); \ maps to (dy,dx).
            let ray={...t.challengeData.emitter,dx:1,dy:0};s.beam=[{x:ray.x,y:ray.y}];let used=new Set();s.lit=false;
            for(let n=0;n<3;n++){let hit=-1,best=1e9;ms.forEach((m,i)=>{const along=(m.x-ray.x)*ray.dx+(m.y-ray.y)*ray.dy,cross=Math.abs((m.x-ray.x)*ray.dy-(m.y-ray.y)*ray.dx);if(!used.has(i)&&along>0&&cross<2&&along<best){best=along;hit=i;}});if(hit<0){s.beam.push({x:ray.x+ray.dx*320,y:ray.y+ray.dy*320});s.lit=ray.dx===1&&receiver.x>ray.x&&receiver.x<ray.x+320&&Math.abs(ray.y-receiver.y)<2;break;}const m=ms[hit];used.add(hit);s.beam.push({...m});const [dx,dy]=s.mirrors[hit]?[ray.dy,ray.dx]:[-ray.dy,-ray.dx];ray={...m,dx,dy};}
            s.charge=s.lit?s.charge+dt:0;if(s.charge>.8)win(t,s);break;
          }
          case 'polarity':{
            if(C){s.polarity*=-1;s.flips++;}const distance=center().x-s.x;if(Math.abs(distance)<260)s.v+=Math.sign(distance)*s.polarity*240*dt;s.v*=Math.exp(-2.6*dt);s.x=clamp(s.x+s.v*dt,o.x-255,o.x+250);
            s.stable=Math.abs(s.x-t.challengeData.dock.x)<32&&Math.abs(s.v)<28&&s.flips>0?s.stable+dt:0;if(s.stable>1.2)win(t,s);break;
          }
          case 'grapple':{
            s.hookX=o.x+Math.sin(s.time*1.1)*235;s.hookY=o.y-90;
            if(C&&Math.hypot(center().x-s.hookX,center().y-s.hookY)<150){s.hook=true;s.released=false;}
            if(spin&&s.hook){s.hook=false;s.released=true;p().vx=100;p().vy=-120;}
            if(s.released&&p().grounded&&x>170&&x<285)win(t,s);break;
          }
          case 'sorter':{
            if(U){s.gate=(s.gate+1)%3;handled=true;}s.spawn-=dt;if(s.sorted<6&&s.spawn<=0){s.items.push({x:-270,color:[0,2,1,2,0,1][s.sent++%6]});s.spawn=2.5;}
            for(const item of s.items){item.x+=105*dt;if(item.x>=0&&!item.checked){item.checked=true;if(item.color===s.gate)s.sorted++;else s.mistakes++;}}s.items=s.items.filter(i=>i.x<270);
            if(s.mistakes>=3)lose(t,s,'三个邮袋进错了槽。');else if(s.sorted===6)win(t,s);break;
          }
          case 'steam':{
            if(spin)s.heat=!s.heat;if(C&&s.cool===0){s.pressure=Math.max(0,s.pressure-18);s.cool=.5;}s.pressure=clamp(s.pressure+(s.heat?24:-6)*dt,0,110);s.stable=s.pressure>=45&&s.pressure<=65?s.stable+dt:0;if(s.pressure>90)lose(t,s,'压力过高，安全阀自动泄爆。');else if(s.stable>=4)win(t,s);break;
          }
          case 'brake':{
            if(spin&&s.cool===0){s.speed*=.55;s.cool=.25;}if(C)s.speed=Math.min(360,s.speed+30);s.angle=(s.angle+s.speed*dt*Math.PI/180)%(Math.PI*2);if(U){handled=true;if(s.speed<25&&(s.angle<.24||s.angle>Math.PI*2-.24))win(t,s);else api.toast('还没进入绿色锁止扇区，或转速仍高于25。',3);}break;
          }
          case 'relay':{
            s.timer+=dt;if(spin){const at=t.challengeData.points.findIndex(q=>near(q,65));if(at===s.relay){s.repairs++;s.relay=[2,1,0,2,0,1][s.repairs%6];s.timer=0;}else if(at>=0)s.mistakes++;}
            if(s.timer>2.2){s.timer=0;s.mistakes++;s.relay=(s.relay+1)%3;}if(s.repairs>=6)win(t,s);else if(s.mistakes>=3)lose(t,s,'继电器熔断保护。');break;
          }
        }
      }return handled;
    }
    function updateBoss(t,s,dt,C){
      const a=t.challengeData.arena,floor=a.y+a.h,pc=center(),rage=s.hits>=3;
      s.timer+=dt;s.hurtCooldown=Math.max(0,s.hurtCooldown-dt);
      const hit=()=>{if(s.hurtCooldown>0||p().invincible>0)return;s.hurtCooldown=1;damage(t,s);};
      const change=phase=>{s.phase=phase;s.timer=0;if(phase==='warn')api.sfx?.('bossWarn');if(phase==='attack')api.sfx?.('bossAttack');};
      for(const wave of s.waves){wave.x+=wave.v*dt;wave.life-=dt;if(Math.abs(pc.x-wave.x)<30&&p().y+p().h>floor-28&&p().y<floor)hit();}
      s.waves=s.waves.filter(w=>w.life>0&&w.x>a.x&&w.x<a.x+a.w);
      if(!s.active)return;
      if(s.phase==='approach'){
        s.facing=pc.x<s.x?-1:1;const distance=Math.abs(pc.x-s.x);
        if(distance>145)s.x=clamp(s.x+s.facing*(rage?145:105)*dt,a.x+100,a.x+a.w-100);
        if(s.timer>(rage?.85:1.25)){s.move=['charge','sweep','slam'][s.attack%3];s.aim=pc.x;change('warn');}
      }else if(s.phase==='warn'){
        if(s.timer>(rage?.8:1.05)){s.struck=false;change('attack');}
      }else if(s.phase==='attack'){
        if(s.move==='charge'){
          s.x=clamp(s.x+s.facing*(rage?500:400)*dt,a.x+90,a.x+a.w-90);
          if(Math.abs(pc.x-s.x)<72&&p().y+p().h>floor-145&&p().y<floor)hit();
          if(s.timer>.85)change('core');
        }else if(s.move==='sweep'){
          if(s.timer>.16&&s.timer<.5&&(pc.x-s.x)*s.facing>-55&&(pc.x-s.x)*s.facing<230&&p().y<floor-42&&p().y+p().h>floor-90)hit();
          if(s.timer>.6)change('core');
        }else{
          if(!s.struck&&s.timer>.24){s.struck=true;if(Math.abs(pc.x-s.x)<120&&p().y+p().h>floor-40)hit();for(const v of [-1,1])s.waves.push({x:s.x+v*95,v:v*(rage?350:280),life:3});}
          if(rage&&!s.secondWave&&s.timer>.65){s.secondWave=true;for(const v of [-1,1])s.waves.push({x:s.x+v*95,v:v*280,life:3});}
          if(s.timer>(rage?1:.65)){s.secondWave=false;change('core');}
        }
      }else if(s.phase==='core'){
        if(C&&Math.hypot(pc.x-s.x,pc.y-(floor-85))<170){s.hits++;api.sfx?.('bossHit');s.waves=[];if(s.hits>=6){win(t,s);return;}change('stagger');}
        else if(s.timer>(rage?1.65:2)){s.attack++;change('approach');}
      }else if(s.phase==='stagger'&&s.timer>.65){s.attack++;change('approach');}
    }
    function physics(){patrol.physics();for(const t of tasks){const s=runs.get(t.id);if(s?.active&&s.hook){p().x=s.hookX-p().w/2;p().y=s.hookY-p().h/2;p().vx=0;p().vy=0;p().grounded=false;}}}
    function draw(apiDraw,layer){city.draw(apiDraw,layer);wheel.draw(apiDraw,layer);hoists.draw(apiDraw,layer);patrol.draw(apiDraw,layer);if(layer!=='objects')return;const {ctx:c,camera,W,H}=apiDraw;const colors=['#db8c72','#80b6c2','#e4c878'];
      function line(a,b,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}function disk(x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
      for(const t of tasks){const o=t.challengeData.origin;if(o.x+700<camera.x||o.x-700>camera.x+W||o.y+80<camera.y||o.y-360>camera.y+H)continue;const s=runs.get(t.id)||{key:t.stages[0].challenge.slice(8),gears:[0,0,0],mirrors:[1,1],x:o.x,gate:0,items:[],pressure:20,speed:320,angle:1,relay:0};c.save();c.font='16px "Microsoft YaHei",sans-serif';c.textAlign='center';c.fillStyle='#f4ddb0';c.fillText(t.title,o.x,o.y-290);
        if(s.key==='boss'){
          const a=t.challengeData.arena,floor=a.y+a.h,x=s.x??o.x,y=floor-105,walk=s.active&&['approach','attack'].includes(s.phase)?Math.sin((s.time||0)*12)*12:0;
          // Open pavement, edge lamps and the machine itself; no overlay arena.
          for(const edge of [a.x+18,a.x+a.w-18]){line({x:edge,y:floor},{x:edge,y:floor-60},'#b49d78',8);disk(edge,floor-64,7,s.active?'#ebbc68':'#8ebbaa');}
          for(let i=0;i<6;i++)disk(o.x-55+i*22,floor-250,6,i<(s.hits||0)?'#537578':'#dfc68e');
          c.fillStyle=s.result==='won'||api.isComplete(t.id)?'#527575':s.phase==='core'?'#72b4bf':s.hits>=3?'#aa806a':'#83938b';c.fillRect(x-52,y-80,104,135);
          c.strokeStyle='#344f59';c.lineWidth=5;c.strokeRect(x-52,y-80,104,135);c.fillStyle='#3e5960';c.fillRect(x-43,y-69,86,29);c.fillRect(x-34,y+26,68,19);
          for(const xx of [x-43,x+43])for(const yy of [y-73,y+45]){disk(xx,yy,4,'#d8bb86');line({x:xx-2,y:yy},{x:xx+2,y:yy},'#526b6b',1);}
          for(let i=0;i<5;i++)line({x:x-25+i*12,y:y+31},{x:x-25+i*12,y:y+40},'#a8b49e',3);
          line({x:x-35,y:y-81},{x:x-35,y:y-98},'#c3ab80',8);disk(x-35,y-101,6,'#d4bc85');
          for(const side of [-1,1]){const foot=side*walk;line({x:x+side*32,y:y+45},{x:x+side*44+foot,y:floor-12},'#b29d79',22);line({x:x+side*44+foot-14,y:floor-8},{x:x+side*44+foot+14,y:floor-8},'#526b70',13);disk(x+side*67,y-5,24,'#344f59');disk(x+side*67,y-5,18,'#b9a073');disk(x+side*67,y-5,7,'#66807c');line({x:x+side*60,y:y+12},{x:x+side*75,y:y+38},'#87978a',15);}
          disk(x,y-5,31,'#2f505a');disk(x,y-5,26,'#d0b383');disk(x,y-5,20,s.phase==='core'?'#b9f4ed':'#6b8e8e');for(let i=0;i<6;i++){const a=i*Math.PI/3;disk(x+Math.cos(a)*27,y-5+Math.sin(a)*27,2,'#405e63');}for(const side of [-1,1])disk(x+side*20,y-54,6,s.phase==='warn'?'#ffda69':'#e9dbab');
          if(s.phase==='warn'||s.phase==='attack'){
            const color=s.phase==='warn'?'#edce78':'#e78b6c',dir=s.facing||1;
            if(s.move==='charge')line({x,y:floor-8},{x:clamp(x+dir*400,a.x,a.x+a.w),y:floor-8},color,s.phase==='warn'?3:8);
            else if(s.move==='sweep')line({x,y:floor-65},{x:x+dir*225,y:floor-65},color,s.phase==='warn'?3:13);
            else {c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.ellipse(x,floor-6,120,13,0,0,Math.PI*2);c.stroke();}
          }
          for(const wave of s.waves||[]){disk(wave.x,floor-14,14,'#e5b276');line({x:wave.x-20,y:floor-3},{x:wave.x+20,y:floor-3},'#f5d59c',4);}
        }
        else if(s.key==='gears'){t.challengeData.points.forEach((q,i)=>{const dx=q.x-o.x;disk(o.x+dx,q.y-15,47,'#aa9471');disk(o.x+dx,o.y-15,28,'#547a7b');c.fillStyle='#fff0bf';c.fillText(String(s.gears[i]),o.x+dx,o.y-9);});c.fillText('左=1 · 左+中=4 · 中+右=5',o.x,o.y-100);}
        else if(s.key==='laser'){if(s.beam)for(let i=1;i<s.beam.length;i++)line(s.beam[i-1],s.beam[i],s.lit?'#c5fbba':'#f0b471',4);t.challengeData.mirrors.forEach((q,i)=>line({x:q.x-21,y:q.y+(s.mirrors[i]? -21:21)},{x:q.x+21,y:q.y+(s.mirrors[i]?21:-21)},'#c0e8e2',7));disk(t.challengeData.receiver.x,t.challengeData.receiver.y,21,s.lit?'#b8eca7':'#527278');}
        else if(s.key==='polarity'){c.strokeStyle='#a1d4ba';c.strokeRect(o.x+178,o.y-31,65,55);c.fillStyle='#afbec0';c.fillRect(s.x-23,o.y-28,46,46);c.fillStyle='#f2dca8';c.fillText((s.polarity===1?'吸引':'排斥')+' · C 切换',o.x,o.y-100);}
        else if(s.key==='grapple'){line({x:o.x-270,y:o.y-170},{x:o.x+270,y:o.y-170},'#c2b184',7);const hx=s.hookX||o.x;line({x:hx,y:o.y-170},{x:hx,y:o.y-90},'#decd9d',4);disk(hx,o.y-90,17,'#d9bf7b');line({x:o.x+170,y:o.y+20},{x:o.x+285,y:o.y+20},'#a5d4a6',9);}
        else if(s.key==='sorter'){line({x:o.x-280,y:o.y-35},{x:o.x+280,y:o.y-35},'#7b8e88',14);for(const item of s.items){c.fillStyle=colors[item.color];c.fillRect(o.x+item.x-14,o.y-58,28,24);}disk(o.x,o.y-90,20,colors[s.gate]);c.fillStyle='#f2dca8';c.fillText('↑ 换色 · '+(s.sorted||0)+'/6',o.x,o.y-135);}
        else if(s.key==='steam'){c.fillStyle='#48656b';c.fillRect(o.x-140,o.y-160,280,40);c.fillStyle='#c4b87d';c.fillRect(o.x-140,o.y-160,clamp(s.pressure/100,0,1)*280,40);c.strokeStyle='#9be6b6';c.strokeRect(o.x-14,o.y-165,56,50);c.fillStyle='#f5e4bc';c.fillText('压力 '+Math.round(s.pressure)+' · 稳定 '+(s.stable||0).toFixed(1)+'/4秒',o.x,o.y-185);}
        else if(s.key==='brake'){disk(o.x,o.y-85,75,'#7d8c80');line({x:o.x,y:o.y-85},{x:o.x+Math.sin(s.angle)*65,y:o.y-85-Math.cos(s.angle)*65},'#ebd196',6);line({x:o.x-18,y:o.y-163},{x:o.x+18,y:o.y-163},'#98e0ac',9);c.fillStyle='#f5e4bc';c.fillText('速度 '+Math.round(s.speed)+' · X 制动 / ↑ 锁止',o.x,o.y-195);}
        else if(s.key==='relay'){t.challengeData.points.forEach((q,i)=>{disk(q.x,q.y-25,34,i===s.relay?'#f29572':'#759596');});c.fillStyle='#f5e4bc';c.fillText('修复 '+(s.repairs||0)+'/6 · 红灯即将熔断',o.x,o.y-100);}
        if(s.result==='lost'){c.fillStyle='#f3bb8a';c.fillText('挑战结束 · 回启动装置按 ↑ 重试',o.x,o.y-245);}c.restore();
      }
    }
    function status(id){if(city.matches(id))return city.status(id);if(wheel.matches(id))return wheel.status();if(patrol.matches(id))return patrol.status();if(api.isComplete(id))return '挑战完成，风之书已出现。';const s=runs.get(id);if(!s)return '在对应启动装置旁按 ↑ 开始。';if(s.result==='lost')return '挑战失败，回启动装置按 ↑ 可立即重试。';const details={boss:'破防 '+s.hits+'/6 · 剩余承受 '+s.health+' 次 · '+({warn:'黄色预警',sweep:'扫臂攻击',core:'蓝芯暴露：C'}[s.phase]||''),gears:'齿轮相位 '+s.gears.join('/')+' · 中央 C 啮合',laser:s.lit?'光路接通，保持照射。':'X 旋转两片反光镜，让光线先上再右。',polarity:(s.polarity===1?'吸引':'排斥')+'极性 · 箱速 '+Math.round(Math.abs(s.v)),grapple:s.hook?'已挂住吊钩，在右侧 X 放手。':'靠近移动吊钩 C 挂上，再落入右侧接收台。',sorter:'送对 '+s.sorted+'/6 · 送错 '+s.mistakes+'/3',steam:'压力 '+Math.round(s.pressure)+' · 稳定 '+s.stable.toFixed(1)+'/4 秒',brake:'转速 '+Math.round(s.speed)+' · 进入顶部绿色扇区后 ↑',relay:'抢修 '+s.repairs+'/6 · 失误 '+s.mistakes+'/3'};return details[s.key]||'挑战进行中。';}
    return {update,physics,draw,status,environmentPhysics:dt=>{hoists.physics(dt);wheel.physics(dt);city.physics(dt);},inspectHoists:hoists.inspect,background:dt=>patrol.update(dt,false,false),inspect:id=>{if(city.matches(id))return city.inspect();if(wheel.matches(id))return wheel.inspect();if(patrol.matches(id))return patrol.inspect();const s=runs.get(id);return s?JSON.parse(JSON.stringify(s)):{active:false,result:'idle'};}};
  }
  function createCity(world,state,api){
    const tasks=world.tasks.filter(t=>t.stages[0].challenge==='machine-city');
    const saved=state.city ||= {valves:[],letter:false};saved.valves ||= [];
    if(saved.visitor){const npc=api.entities.find(e=>e.id==='machine-reader');if(npc){npc.hiddenVisual=true;npc.kind='departed';}}
    const player=()=>api.player(),near=(e,r=75)=>e&&Math.hypot(e.x-player().x-15,e.y-player().y-22)<r;
    let time=0;const transports=(world.cityTransports||[]).map(d=>({d,p:api.platforms().find(p=>p.id===d.id)})).filter(v=>v.p);
    function physics(dt){time+=dt;for(const {d,p} of transports){
      if(d.requires&&saved.valves.length<3)continue;
      const period=2*(d.seconds+d.pause),t=(time+d.phase)%period;
      const u=t<d.pause?0:t<d.pause+d.seconds?(t-d.pause)/d.seconds:t<2*d.pause+d.seconds?1:1-(t-2*d.pause-d.seconds)/d.seconds;
      const x=d.a.x+(d.b.x-d.a.x)*u,y=d.a.y+(d.b.y-d.a.y)*u;
      p.dx=x-p.x;p.dy=y-p.y;p.x=x;p.y=y;
      if(player().grounded&&player().ground===p){player().x+=p.dx;player().y+=p.dy;player().vy=0;}
    }}
    function update(dt,spin){
      const up=api.pressed().has('ArrowUp');
      for(const t of tasks){if(api.isComplete(t.id))continue;const d=t.challengeData,targets=t.stages[0].targets.map(id=>api.entities.find(e=>e.id===id));
        if(['summit','transfer'].includes(d.mode)&&player().grounded&&player().ground?.id===d.platform){api.complete(t.id);return true;}
        if(d.mode==='pipes'){
          for(const e of targets)if(spin&&near(e)&&!saved.valves.includes(e.id)){saved.valves.push(e.id);api.sfx?.('steam');api.save();api.toast('管道接通 '+saved.valves.length+'/3'+(saved.valves.length===3?'，锅炉升降台开始运行。':''),4);}
          if(saved.valves.length===3){api.complete(t.id);return true;}
        }
        if(!up)continue;
        if(d.mode==='coins'&&near(targets[0])){const count=api.coinCount?.()||0;api.dialogue(targets[0].name,count>=d.count?'你走过了这么多街巷。这本书请带回图书馆。':'你已在城里找到'+count+'枚金币，收集到'+d.count+'枚再来找我。',count>=d.count?[{label:'带回风之书',action:()=>api.complete(t.id)}]:[],targets[0]);return true;}
        if(d.mode==='reader'&&near(targets[0])){api.dialogue(targets[0].name,t.stages[0].text,[{label:'将书带回图书馆',action:()=>{api.complete(t.id);saved.visitor=true;api.save();}}],targets[0]);return true;}
        if(d.mode==='letter'&&near(targets[0])){api.dialogue(targets[0].name,saved.letter?'守夜人在西边老钟楼等着这封信。':d.startText,saved.letter?[]:[{label:'替你送信',action:()=>{saved.letter=true;api.save();}}],targets[0]);return true;}
        if(d.mode==='letter'&&near(targets[1])){api.dialogue(targets[1].name,saved.letter?d.endText:'今天会有我的信吗？',saved.letter?[{label:'交出回信',action:()=>api.complete(t.id)}]:[],targets[1]);return true;}
      }return false;
    }
    function draw({ctx:c,camera,W,H},layer){if(layer!=='objects')return;c.save();
      for(const {d,p} of transports){if(Math.max(d.a.x,d.b.x)+200<camera.x||Math.min(d.a.x,d.b.x)>camera.x+W||Math.max(d.a.y,d.b.y)<camera.y||Math.min(d.a.y,d.b.y)>camera.y+H)continue;
        c.strokeStyle='#ac9b71';c.lineWidth=3;c.beginPath();c.moveTo(d.a.x+85,d.a.y-65);c.lineTo(d.b.x+85,d.b.y-65);c.stroke();c.beginPath();c.moveTo(p.x+85,p.y-65);c.lineTo(p.x+85,p.y);c.stroke();c.fillStyle='#dec994';c.fillRect(p.x,p.y+5,p.w,6);
      }
      for(const id of ['machine-valve-west','machine-valve-boiler','machine-valve-east']){const e=api.entities.find(e=>e.id===id);if(!e)continue;c.strokeStyle=saved.valves.includes(id)?'#b2dfac':'#d39c76';c.lineWidth=5;c.beginPath();c.arc(e.x,e.y-5,23,0,Math.PI*2);c.moveTo(e.x-23,e.y-5);c.lineTo(e.x+23,e.y-5);c.moveTo(e.x,e.y-28);c.lineTo(e.x,e.y+18);c.stroke();}
      c.restore();
    }
    return {physics,update,draw,matches:id=>tasks.some(t=>t.id===id),inspect:()=>({...saved,time,transports:transports.map(({p})=>({id:p.id,x:p.x,y:p.y}))}),status:id=>{const t=tasks.find(t=>t.id===id);return t?.challengeData.mode==='pipes'?'已接通 '+saved.valves.length+'/3 处管道':t?.challengeData.mode==='coins'?'本城金币 '+(api.coinCount?.()||0)+'/30':t?.challengeData.mode==='letter'&&saved.letter?'回信已拿好，送往西侧老钟楼。':t?.hint||'';}};
  }
  function createFlywheel(world,state,api){
    const task=world.tasks.find(t=>t.stages[0].challenge==='machine-flywheel');if(!task)return{physics(){},update:()=>false,draw(){},matches:()=>false};
    const d=task.challengeData,pads=d.rim.map(id=>api.platforms().find(p=>p.id===id)),bridge=api.platforms().find(p=>p.id===d.bridge),tau=Math.PI*2;
    const s=state.flywheel ||= {angle:d.initialAngle,omega:d.initialSpeed,locked:false};if(api.isComplete(task.id))s.locked=true;
    let stable=0,pending=false,lastGround=null,lastVy=0,contacts=new Set(),torque=0,impulse=0;
    const inertia=d.inertia||650000,mass=d.playerMass||1,drag=d.angularDrag||.1;
    function position(carry){const p=api.player();pads.forEach((deck,i)=>{const a=s.angle+i*tau/pads.length,x=d.center.x+Math.sin(a)*d.radius-deck.w/2,y=d.center.y-Math.cos(a)*d.radius,dx=x-deck.x,dy=y-deck.y;if(carry&&p.grounded&&p.ground===deck){p.x+=dx;p.y+=dy;p.vy=0;}deck.x=x;deck.y=y;deck.dx=dx;deck.dy=dy;});bridge.disabled=!s.locked;}
    if(s.locked){s.angle=d.targetAngle;s.omega=0;}position(false);
    function physics(dt){const p=api.player(),rx=p.x+p.w/2-d.center.x,ry=p.y+p.h-d.center.y;
      torque=0;impulse=0;const rider=p.grounded&&pads.includes(p.ground),touching=new Set();
      if(!s.locked){
        if(rider){
          // Screen y points down: weight to the right produces clockwise torque.
          torque=rx*mass*1700;
          // Feet push backwards against the tread when running, like a treadmill.
          torque+=ry*mass*p.vx*5;
          if(p.ground!==lastGround){
            const relativeFall=Math.max(0,lastVy-s.omega*rx);
            impulse+=rx*mass*relativeFall;
            impulse-=ry*mass*p.vx*.35;
          }
          s.engaged=true;
        }
        // Contact with a rim tread transfers tangential momentum at its actual lever arm.
        for(const deck of pads){
          if(deck===p.ground)continue;
          const overlap=p.x+p.w>deck.x&&p.x<deck.x+deck.w&&p.y+p.h>deck.y&&p.y<deck.y+deck.h;
          if(!overlap)continue;touching.add(deck.id);
          if(!contacts.has(deck.id)){
            const cx=Math.max(deck.x,Math.min(deck.x+deck.w,p.x+p.w/2))-d.center.x,cy=deck.y-d.center.y;
            const jx=mass*(p.vx+s.omega*cy)*.55,jy=mass*(p.vy-s.omega*cx)*.55;
            impulse+=cx*jy-cy*jx;p.vx-=jx/mass*.35;s.engaged=true;
          }
        }
        s.omega=(s.omega+impulse/inertia+torque/inertia*dt)*Math.exp(-(drag+(rider?.65:0))*dt);
        const axleBrake=p.grounded&&p.ground?.id===d.from&&Math.abs(p.x+p.w/2-d.center.x)<35;
        if(axleBrake)s.engaged=true;
        s.omega=Math.sign(s.omega)*Math.max(0,Math.abs(s.omega)-(.06+(axleBrake?.9:0))*dt);
        if(Math.abs(s.omega)<(d.stopSpeed||.008)&&Math.abs(torque)<1500&&Math.abs(impulse)<1)s.omega=0;
        s.omega=Math.max(-1.6,Math.min(1.6,s.omega));s.angle=(s.angle+s.omega*dt+tau)%tau;
        const error=Math.atan2(Math.sin(s.angle-d.targetAngle),Math.cos(s.angle-d.targetAngle));
        stable=s.engaged&&Math.abs(error)<(d.stopAngle||.055)&&s.omega===0?stable+dt:0;
        if(stable>.3){s.locked=true;api.sfx?.('lock');s.angle=d.targetAngle;s.omega=0;pending=true;api.save();api.toast('锁销扣住了，上层连桥已接通。',5);}
      }
      contacts=touching;lastGround=rider?p.ground:null;lastVy=p.vy;position(true);
    }
    function update(){if((pending||s.locked)&&!api.isComplete(task.id)){pending=false;api.complete(task.id);return true;}return false;}
    function draw({ctx:c,camera,W,H},layer){if(layer!=='objects')return;const {x,y}=d.center,r=d.radius;if(x+r+50<camera.x||x-r-50>camera.x+W||y+r+50<camera.y||y-r-50>camera.y+H)return;
      const line=(a,b,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();};c.save();c.strokeStyle='#b99b70';c.lineWidth=19;c.beginPath();c.arc(x,y,r-22,0,tau);c.stroke();c.strokeStyle='#54737a';c.lineWidth=5;c.beginPath();c.arc(x,y,r-39,0,tau);c.stroke();
      for(let i=0;i<8;i++){const a=s.angle+i*tau/8;line([x,y],[x+Math.sin(a)*(r-25),y-Math.cos(a)*(r-25)],'#b29b78',11);}
      c.fillStyle=s.locked?'#a9c59b':'#657e80';c.beginPath();c.arc(x,y,35,0,tau);c.fill();c.strokeStyle='#d2bd8c';c.lineWidth=6;c.stroke();line([x-14,y],[x+14,y],'#d9c69a',5);
      c.fillStyle='#cdb582';c.fillRect(x-34,y+14,68,8);c.strokeStyle='#52736c';c.lineWidth=3;c.strokeRect(x-34,y+14,68,8);
      for(let i=0;i<24;i++){const a=s.angle+i*tau/24;c.fillStyle='#e1c697';c.beginPath();c.arc(x+Math.sin(a)*(r-22),y-Math.cos(a)*(r-22),3,0,tau);c.fill();}for(let i=0;i<6;i++){const a=i*tau/6;c.fillStyle='#35575f';c.beginPath();c.arc(x+Math.cos(a)*26,y+Math.sin(a)*26,3,0,tau);c.fill();}
      const a=s.angle,mx=x+Math.sin(a)*(r-22),my=y-Math.cos(a)*(r-22);c.fillStyle='#f1c779';c.beginPath();c.arc(mx,my,13,0,tau);c.fill();const target=d.targetAngle;c.strokeStyle='#abd7ad';c.lineWidth=9;c.beginPath();c.arc(x,y,r+8,target-Math.PI/2-.12,target-Math.PI/2+.12);c.stroke();
      if(!s.locked){line([bridge.x,bridge.y],[bridge.x,bridge.y-110],'#8caa9e',9);}c.restore();
    }
    return{physics,update,draw,matches:id=>id===task.id,status:()=>s.locked?'飞轮已锁定，上层连桥接通。':'踩上轮缘，左右站位的重量会改变转速；跑动和撞击也能带动它。让黄点对准绿色缺口并完全停稳，仍在摆动时不会开锁。',inspect:()=>({...s,active:true,result:s.locked?'won':'turning',bridgeOpen:!bridge.disabled,stable,torque,impulse,inertia})};
  }
  function createHoists(world,api){
    const assemblies=(world.machines||[]).map(config=>({config,decks:config.decks.map(id=>api.platforms().find(p=>p.id===id)),offset:config.kind==='pulley'?0:(config.lowY-config.highY)/2,velocity:0,direction:-1,wait:config.pause})).filter(s=>s.decks.every(Boolean));
    function physics(dt){const p=api.player();for(const s of assemblies){const d=s.config,old=s.decks.map(p=>p.y),rider=s.decks.findIndex(deck=>p.grounded&&p.ground===deck),mid=(d.lowY+d.highY)/2,range=(d.lowY-d.highY)/2;
      if(d.kind==='crane'){
        if(s.wait>0)s.wait=Math.max(0,s.wait-dt);else{s.offset+=s.direction*d.speed*dt;if(s.offset<=-range||s.offset>=range){s.offset=Math.max(-range,Math.min(range,s.offset));s.direction*=-1;s.wait=d.pause;}}
      }else{
        s.leftMass=1+(rider===0?1:0);s.rightMass=1+(rider===1?1:0);
        const acceleration=(s.leftMass-s.rightMass)*220/(s.leftMass+s.rightMass);s.velocity=(s.velocity+acceleration*dt)*Math.exp(-1.6*dt);s.velocity=Math.max(-130,Math.min(130,s.velocity));s.offset+=s.velocity*dt;
        if(s.offset<=-range||s.offset>=range){s.offset=Math.max(-range,Math.min(range,s.offset));s.velocity=0;}
      }
      s.decks[0].y=mid+s.offset;if(s.decks[1])s.decks[1].y=mid-s.offset;
      s.decks.forEach((deck,i)=>{deck.dy=deck.y-old[i];});
      if(rider>=0){p.y+=s.decks[rider].dy;p.vy=0;}
    }}
    function draw({ctx:c,camera,W,H},layer){if(layer!=='objects')return;for(const s of assemblies){const d=s.config,a=s.decks[0],b=s.decks.at(-1),left=a.x+90,right=b.x+90,top=d.anchor.y;
      if(right+130<camera.x||left-130>camera.x+W||d.lowY+80<camera.y||top>camera.y+H)continue;
      const line=(x,y,xx,yy,color,width=4)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
      line(left-120,top,left-120,d.lowY,'#647d81',12);line(left-130,top,right+110,top,'#c7aa73',12);for(let x=left-100;x<right+80;x+=50){line(x,top+5,x+25,top+32,'#6f8987',3);line(x+25,top+32,x+50,top+5,'#6f8987',3);}
      for(const deck of s.decks){const x=deck.x+deck.w/2;c.fillStyle='#344e5c';c.beginPath();c.arc(x,top,22,0,Math.PI*2);c.fill();c.strokeStyle='#dcc08a';c.lineWidth=4;c.stroke();c.beginPath();c.arc(x,top,12,0,Math.PI*2);c.stroke();for(let spoke=0;spoke<4;spoke++){const angle=deck.y/35+spoke*Math.PI/2;line(x+Math.cos(angle)*7,top+Math.sin(angle)*7,x+Math.cos(angle)*19,top+Math.sin(angle)*19,'#abbdab',3);}line(x,top+22,x,deck.y-44,'#d8c599',3);line(x,deck.y-44,deck.x+12,deck.y,'#c7b38b',3);line(x,deck.y-44,deck.x+deck.w-12,deck.y,'#c7b38b',3);line(deck.x,deck.y+8,deck.x+deck.w,deck.y+8,'#c7a76d',8);for(let xx=deck.x+8;xx<deck.x+deck.w-8;xx+=24)line(xx,deck.y+5,xx+10,deck.y+12,'#485965',4);}
      if(d.kind==='pulley')line(left,top-22,right,top-22,'#d8c599',3);
    }}
    return{physics,draw,inspect:()=>assemblies.map(s=>({id:s.config.id,kind:s.config.kind,offset:s.offset,velocity:s.velocity,leftMass:s.leftMass,rightMass:s.rightMass,decks:s.decks.map(p=>({id:p.id,x:p.x,y:p.y,w:p.w}))}))};
  }
  // Autonomous patrols are updated independently of local arena activation/culling.
  function createPatrol(world,state,api){
    const task=world.tasks.find(t=>t.stages[0].challenge==='machine-patrol');
    if(!task)return{update:()=>false,physics(){},draw(){},matches:()=>false};
    const ids=task.stages[0].targets,robots=api.entities.filter(e=>ids.includes(e.id)&&e.patrolFlight),dispatcher=api.entities.find(e=>e.id===ids[0]);
    const saved=state.patrol ||= {repaired:[]};if(!Array.isArray(saved.repaired))saved.repaired=[];
    saved.repaired=saved.repaired.filter(id=>robots.some(e=>e.id===id));
    const fixed=e=>saved.repaired.includes(e.id),dock=(e)=>({x:task.challengeData.dock.x+(robots.indexOf(e)-1)*72,y:task.challengeData.dock.y});
    function random(e){e.rng=(Math.imul(e.rng,1664525)+1013904223)>>>0;return e.rng/4294967296;}
    function chooseStop(e){if(!e.bag.length){e.bag=Array.from({length:e.path.length},(_,i)=>i).filter(i=>i!==e.leg);for(let i=e.bag.length-1;i>0;i--){const j=Math.floor(random(e)*(i+1));[e.bag[i],e.bag[j]]=[e.bag[j],e.bag[i]];}}e.target=e.bag.pop();}
    for(const e of robots){e.leg=0;e.rng=1234567+robots.indexOf(e)*9187;e.bag=[];chooseStop(e);e.vx=0;e.vy=0;e.erratic=0;e.mode='swoop';e.mapTrail=[];e.trailClock=0;e.repaired=fixed(e);e.wait=e.path[0].pause||0;e.spark=0;if(fixed(e)){Object.assign(e,dock(e));e.home=true;}}
    let oldFeet=0,oldVy=0,oldGrounded=false,clock=0,captured=false;
    function physics(){const p=api.player();oldFeet=p.y+p.h;oldVy=p.vy;oldGrounded=p.grounded;captured=true;}
    function advance(e,dt){
      if(fixed(e)){const d=dock(e),distance=Math.hypot(d.x-e.x,d.y-e.y),step=Math.min(distance,dt*600);if(distance>.01){e.x+=(d.x-e.x)/distance*step;e.y+=(d.y-e.y)/distance*step;}e.home=distance<3;return;}
      e.trailClock+=dt;if(e.trailClock>=.35){e.trailClock=0;e.mapTrail.push({x:e.x,y:e.y});if(e.mapTrail.length>12)e.mapTrail.shift();}
      if(e.wait>0){e.wait=Math.max(0,e.wait-dt);e.vx=0;e.vy=0;e.mode='hover';return;}
      const target=e.path[e.target],dx=target.x-e.x,dy=target.y-e.y,d=Math.hypot(dx,dy);
      if(d<180){const step=Math.min(d,135*dt);if(d>0){e.x+=dx/d*step;e.y+=dy/d*step;}e.mode='approach';e.vx=0;e.vy=0;if(d<=step+.001){e.leg=e.target;e.wait=target.pause||2.4;chooseStop(e);}return;}
      e.erratic-=dt;if(e.erratic<=0){e.erratic=1.2+random(e)*2.1;e.mode=random(e)<.3?'swerve':'swoop';e.turn=random(e)<.5?-1:1;e.flutter=1.2+random(e)*1.8;}
      const nx=dx/d,ny=dy/d,side=Math.sin(clock*e.flutter+robots.indexOf(e)*2)*1.35;
      const backwards=e.mode==='swerve'&&e.erratic>.9?-0.35:1,tx=nx*backwards-ny*side,ty=ny*backwards+nx*side,length=Math.hypot(tx,ty)||1,speed=Math.min(550,(e.speed||380)*(1.1+.25*Math.sin(clock*3)));
      const blend=1-Math.exp(-5*dt);e.vx+=(tx/length*speed-e.vx)*blend;e.vy+=(ty/length*speed-e.vy)*blend;
      e.x=Math.max(45,Math.min(world.size.w-45,e.x+e.vx*dt));e.y=Math.max(60,Math.min(world.size.h-85,e.y+e.vy*dt));
    }

    function update(dt,spin,interactive=true){
      clock+=dt;const p=api.player();
      for(const e of robots){const top=e.y-22;advance(e,dt);e.spark=Math.max(0,e.spark-dt);if(fixed(e)||!interactive)continue;
        const stomp=captured&&!oldGrounded&&oldVy>0&&p.vy>=0&&oldFeet<=top+3&&p.y+p.h>=e.y-22&&Math.abs(p.x+p.w/2-e.x)<p.w/2+22;
        const attack=(spin||p.spin>0)&&Math.hypot(p.x+p.w/2-e.x,p.y+p.h/2-e.y)<78;
        if(!stomp&&!attack){
          const touching=p.x+p.w>e.x-23&&p.x<e.x+23&&p.y+p.h>e.y-22&&p.y<e.y+17;
          if(touching&&!(p.invincible>0)){captured=false;api.damage();return true;}
          continue;
        }
        saved.repaired.push(e.id);api.sfx?.('repair');e.repaired=true;e.mapTrail=[];e.spark=.8;e.wait=0;
        if(stomp){p.y=e.y-22-p.h;p.vy=-570;p.grounded=false;p.ground=null;p.jumps=1;p.jumpCut=false;p.airSpinUsed=false;}
        api.save();api.toast(e.name+'恢复正常 · '+saved.repaired.length+'/3'+(saved.repaired.length===3?' · 邮轨总站有一本风之书。':' · 它正飞回邮轨总站。'),5);
      }
      captured=false;
      if(saved.repaired.length===robots.length&&robots.length&&!api.isComplete(task.id)){api.complete(task.id);return true;}
      if(interactive&&dispatcher&&api.pressed().has('ArrowUp')&&Math.hypot(p.x+p.w/2-dispatcher.x,p.y+p.h/2-dispatcher.y)<70){api.dialogue(task.title,task.stages[0].text+'\n'+status(),[{label:'去城里看看',action:()=>{}}]);return true;}
      return false;
    }
    function status(){return robots.map(e=>e.name+'：'+(fixed(e)?'已修复':(e.wait>0?'停靠':'飞往')+(e.path[e.wait>0?e.leg:e.target].region||'下一处站台'))).join('；')+'。修复 '+saved.repaired.length+'/3';}
    function draw({ctx:c,camera,W,H},layer){if(layer!=='objects')return;for(const e of robots){if(e.x+65<camera.x||e.x-65>camera.x+W||e.y+60<camera.y||e.y-60>camera.y+H)continue;
      c.save();c.translate(e.x,e.y);const okay=fixed(e);if(!okay)c.rotate(Math.max(-.28,Math.min(.28,(e.vx||0)/1700))); c.strokeStyle=okay?'#a8d6ad':'#ebad69';c.lineWidth=3;
      c.beginPath();c.moveTo(-39,-23);c.lineTo(39,-23);c.moveTo(0,-23);c.lineTo(0,-35);c.stroke();c.fillStyle='#d3b98c';c.beginPath();c.ellipse(0,-35,25,4,0,0,Math.PI*2);c.fill();c.fillStyle='#42626a';c.fillRect(-5,-39,10,8);
      c.fillStyle=e.color;c.fillRect(-23,-20,46,35);c.fillStyle='#2e5058';c.fillRect(-17,-13,34,12);c.fillStyle=okay?'#b9e7bd':'#f7bc77';c.fillRect(-10,-9,6,5);c.fillRect(5,-9,6,5);c.strokeStyle='#344f5a';c.lineWidth=3;c.strokeRect(-23,-20,46,35);c.fillStyle='#d5c398';c.fillRect(-12,3,24,8);c.strokeStyle='#756e5e';c.lineWidth=1;c.beginPath();c.moveTo(-12,3);c.lineTo(0,9);c.lineTo(12,3);c.stroke();
      c.strokeStyle=okay?'#abcab1':'#f6ca8b';c.beginPath();c.moveTo(-13,17);c.lineTo(-18,24+Math.sin(clock*15)*5);c.moveTo(13,17);c.lineTo(18,24+Math.cos(clock*15)*5);c.stroke();
      if(!okay){c.beginPath();c.moveTo(30,-10);c.lineTo(37,-18);c.lineTo(32,-23);c.lineTo(42,-33);c.stroke();}else{c.beginPath();c.moveTo(-6,5);c.lineTo(-1,10);c.lineTo(9,1);c.stroke();}
      if(e.spark>0){c.globalAlpha=e.spark/.8;c.beginPath();c.arc(0,0,30+(1-e.spark/.8)*45,0,Math.PI*2);c.stroke();}c.restore();
    }}
    return{update,physics,draw,status,matches:id=>id===task.id,inspect:()=>({active:true,result:api.isComplete(task.id)?'won':'patrolling',repaired:[...saved.repaired],robots:robots.map(e=>({id:e.id,x:e.x,y:e.y,leg:e.leg,target:e.target,mode:e.mode,vx:e.vx,vy:e.vy,wait:e.wait,repaired:fixed(e),home:!!e.home}))})};
  }
  (root.WindWorldMechanics ||= {}).machine={create};
})(typeof window==='undefined'?globalThis:window);
