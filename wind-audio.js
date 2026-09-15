/* Original score: "铜城的风 / Wind over Brass". Notes and events are engine independent. */
(function(root){'use strict';
 const BPM=96,BEAT=60/BPM;
 const melody=[[76,79,83,79,78,74,71,74],[72,76,79,83,81,79,76,74],[74,78,81,78,76,74,71,69],[71,74,78,81,83,81,78,74],[76,0,79,83,86,83,79,78],[72,76,81,79,76,74,72,71],[69,72,76,79,78,76,74,72],[71,74,78,0,76,74,71,0]];
 const roots=[40,48,43,47,40,48,45,47],score=[];
 for(let bar=0;bar<16;bar++){const row=melody[bar%8],base=roots[bar%8];for(let i=0;i<8;i++){const at=(bar*4+i*.5)*BEAT,n=row[i];if(n)score.push({at,n:n+(bar>=8&&i%4===0?12:0),duration:.3,gain:.052,voice:'sine'});if(i%2===0)score.push({at,n:base+(i===4?7:0),duration:.32,gain:.07,voice:'triangle'});score.push({at,noise:true,duration:.024,gain:i%2?.022:.035});}for(const off of [0,1.5,3])score.push({at:(bar*4+off)*BEAT,n:base+24,duration:.13,gain:.026,voice:'triangle'});}
 const LOOP=64*BEAT;score.sort((a,b)=>a.at-b.at);
 function create(){let ctx,bus,noise,enabled=true,scene='',paused=false,active=false,next=0,index=0,start=0,step=0,machine=0,wasGround=false,lastMagnet=false;const nodes=new Set(),limits=new Map();
 function unlock(){if(!enabled)return;try{if(!ctx){ctx=new(root.AudioContext||root.webkitAudioContext)();bus=ctx.createGain();bus.gain.value=.65;bus.connect(ctx.destination);noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate),ctx.sampleRate);const d=noise.getChannelData(0);let seed=73;for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}if(ctx.state==='suspended')ctx.resume().catch(()=>{});}catch{}}
 function note(freq,duration=.15,type='sine',gain=.06,delay=0,end=null,isNoise=false){if(!ctx||ctx.state!=='running'||!enabled||paused||nodes.size>=96)return;const t=ctx.currentTime+delay,amp=ctx.createGain(),src=isNoise?ctx.createBufferSource():ctx.createOscillator();if(isNoise)src.buffer=noise;else{src.type=type;src.frequency.setValueAtTime(freq,t);if(end)src.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);}amp.gain.setValueAtTime(.0001,t);amp.gain.linearRampToValueAtTime(gain,t+.006);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(amp);amp.connect(bus);nodes.add(src);src.onended=()=>{nodes.delete(src);src.disconnect();amp.disconnect();};src.start(t);src.stop(t+duration+.015);}
 function silence(){for(const n of nodes){try{n.stop();}catch{}}nodes.clear();active=false;}
 function setState(s,p){if(s!==scene||p!==paused){silence();step=machine=0;wasGround=false;lastMagnet=false;}scene=s;paused=p;}
 function setEnabled(v){enabled=v;if(!v)silence();else unlock();}
 function fx(name,gain=1){if(scene!=='machine'||!enabled||paused||!ctx)return;const now=ctx.currentTime;if(now<(limits.get(name)||0))return;limits.set(name,now+({step:.13,motor:.7,steam:.8,bossWarn:.6}[name]||.08));const n=(f,d,t,v,delay=0,end=null)=>note(f,d,t,v*gain,delay,end),h=(d,v,delay=0)=>note(0,d,'sine',v*gain,delay,null,true);
 switch(name){
 case 'jump':n(300,.16,'triangle',.09,0,610);break;
 case 'double':n(530,.2,'sine',.1,0,1000);break;
 case 'flip':n(260,.24,'triangle',.1,0,900);break;
 case 'spin':h(.2,.1);n(240,.22,'triangle',.055,0,90);break;
 case 'coin':n(1175,.09,'sine',.1);n(1760,.17,'sine',.07,.065);break;
 case 'hurt':h(.15,.13);n(190,.28,'triangle',.15,0,45);break;
 case 'land':h(.045,.07);n(135,.1,'triangle',.065,0,60);break;
 case 'step':h(.025,.035);n(440,.032,'sine',.028);break;
 case 'motor':n(82,.38,'triangle',.035);h(.09,.025);break;
 case 'pulley':n(350,.16,'triangle',.045,0,280);h(.04,.035);break;
 case 'robot':n(280,.12,'sine',.035,0,400);break;
 case 'belt':h(.065,.025);n(165,.05,'triangle',.03);break;
 case 'magnet':n(165,.32,'sine',.11,0,880);n(660,.25,'sine',.035,.1);break;
 case 'steam':h(.65,.12);n(520,.16,'triangle',.035,0,240);break;
 case 'repair':h(.05,.06);[659,831,988].forEach((f,i)=>n(f,.17,'sine',.09,i*.085));break;
 case 'lock':h(.055,.14);n(110,.15,'triangle',.13);n(880,.38,'sine',.07,.12);break;
 case 'bossWarn':n(220,.2,'triangle',.12);n(277,.2,'triangle',.1,.25);break;
 case 'bossAttack':h(.28,.16);n(95,.3,'triangle',.16,0,35);break;
 case 'bossHit':h(.13,.14);n(120,.22,'triangle',.15,0,45);n(1047,.3,'sine',.09,.1);break;
 case 'book':[659,784,988,1319].forEach((f,i)=>n(f,.4,'sine',.09,i*.12));break;
 }
 }
 function tick(dt,p,exp,platforms=[]){if(!enabled||paused||!ctx||ctx.state!=='running'||scene!=='machine')return;
 if(!active){start=ctx.currentTime+.04;index=0;active=true;}if(start+LOOP<ctx.currentTime){start=ctx.currentTime+.04;index=0;}while(start+score[index].at<ctx.currentTime+.12){const e=score[index];next=start+e.at;note(440*Math.pow(2,(e.n-69)/12),e.duration,e.voice||'sine',e.gain,Math.max(0,next-ctx.currentTime),null,e.noise);if(++index===score.length){index=0;start+=LOOP;}}
 if(!p)return;if(p.grounded&&!wasGround)fx('land');wasGround=p.grounded;step-=dt;if(p.grounded&&Math.abs(p.vx)>65&&step<=0){fx('step');step=.25;}const magnet=!!exp?.magnetTarget;if(magnet&&!lastMagnet)fx('magnet');lastMagnet=magnet;machine-=dt;if(machine<=0){machine=.85;const deck=p.ground||platforms.filter(d=>d.assembly||d.artKind==='conveyor'||Math.abs(d.dx||0)+Math.abs(d.dy||0)>.02).find(d=>Math.hypot(d.x+d.w/2-p.x,d.y-p.y)<240);if(exp?.entities?.some(e=>e.patrolFlight&&!e.repaired&&Math.hypot(e.x-p.x,e.y-p.y)<280))fx('robot');if(deck?.assembly)fx('pulley',.7);else if(deck?.artKind==='conveyor')fx('belt');else if(deck&&(Math.abs(deck.dx||0)+Math.abs(deck.dy||0)>.02))fx('motor');}
 }
 return {unlock,setEnabled,setState,tick,fx,tone:note,stop:silence};
 }
 root.WindAudio={create,score,bpm:BPM,loopSeconds:LOOP};
})(typeof window==='undefined'?globalThis:window);
