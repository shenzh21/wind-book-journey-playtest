/* Simple storybook shapes for expansion scenery, culled to the camera. */
(function(root){
  function draw(world,runtime,api,layer='objects'){
    const {ctx:c,camera,W,H,art}=api,theme=world.theme,time=runtime?.time||0;
    const visible=(x,y,w=80,h=80)=>x+w>camera.x&&x<camera.x+W&&y+h>camera.y&&y<camera.y+H;
    function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
    function oval(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}
    function line(x,y,x2,y2,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
    function unit(e,x=e.x,y=e.y){
      const r=e.radius||65,accent=theme.accent,dark=theme.ground;
      if(e.mechanic==='spring'){
        const squash=e.pulse?Math.sin(e.pulse*18)*5:0;
        if(world.id==='rainforest'&&e.name.includes('蛙')){oval(x,y+7,39,15,'#96ae68');oval(x-20,y-5,12,13,'#96ae68');oval(x+20,y-5,12,13,'#96ae68');oval(x-20,y-8,4,5,'#f4e6b4');oval(x+20,y-8,4,5,'#f4e6b4');oval(x-19,y-8,2,3,dark);oval(x+19,y-8,2,3,dark);}
        else if(world.id==='bay'){oval(x,y+14,42,10,'#d8bca1');for(let i=-3;i<=3;i++)line(x,y+15,x+i*10,y-13+Math.abs(i)*3,'#aa7d79',4);}
        else if(world.id==='cave'||world.id==='rainforest'){rect(x-8,y-5,16,26,'#d7c9a5');oval(x,y-5+squash,45,17,world.id==='cave'?'#bd93a1':'#cda278');for(const d of [-23,0,23])oval(x+d,y-7+squash,5,3,'#f4e5bd');}
        else {for(let i=0;i<4;i++)line(x-20,y+i*5,x+20,y+i*5-7,accent,3);rect(x-38,y-8+squash,76,9,world.id==='town'?'#bd9675':'#a2bab0');}
      }else if(e.mechanic==='gust'){
        oval(x,y+17,r,9,dark);for(let i=0;i<5;i++){const yy=y-((time*125+i*83)%(e.height||440));line(x+Math.sin(i*2+time)*r*.65,yy,x+Math.sin(i*2+time+.4)*r*.65,yy-32,'#deeee299',3);}
        if(world.id==='machine'){c.save();c.translate(x,y);c.rotate(time*5);for(let i=0;i<4;i++){c.rotate(Math.PI/2);oval(15,0,20,8,accent);}c.restore();}
        else if(world.id==='town'){rect(x-27,y-12,54,30,'#ac8062');for(let i=0;i<4;i++)line(x-22+i*14,y-10,x-22+i*14,y+16,'#e3c49a',3);}
        else {oval(x,y+7,29,13,accent);oval(x,y+4,15,6,dark);}
      }else if(e.mechanic==='conveyor'){
        if(e.platformId){
          const top=y+22,left=x-r,width=r*2;
          rect(left,top,width,24,'#344e57');rect(left,top-5,width,8,'#678785');
          c.save();c.beginPath();c.rect(left,top+3,width,20);c.clip();
          for(let i=0;i<Math.ceil(width/26)+1;i++){const xx=left+(i*26+time*(e.power||160)*(e.direction||1)+width*100)%width;oval(xx,top+12,8,8,'#bda571');line(xx-5,top+12,xx+5,top+12,'#617b79',2);}c.restore();
          for(let xx=left+45;xx<left+width-20;xx+=110){const dir=e.direction||1;line(xx-10*dir,top-2,xx+10*dir,top-2,'#e3ce91',3);line(xx+3*dir,top-8,xx+10*dir,top-2,'#e3ce91',3);}
          line(left,top+25,left+width,top+25,'#c7b682',3);return;
        }

        if(world.id==='rainforest'){for(let i=0;i<6;i++){const xx=x-r+(i*r/3+time*40*(e.direction||1)+r*8)%(r*2);oval(xx,y+17,7,4,'#8c6754');line(xx-3,y+18,xx-7,y+23,dark,1);line(xx+3,y+18,xx+7,y+23,dark,1);oval(xx,y+7,15,6,'#a8b787');}return;}
        rect(x-r,y+10,r*2,12,dark);for(let i=0;i<Math.ceil(r/13);i++){const xx=x-r+(i*26+time*45*(e.direction||1)+r*8)%(r*2);oval(xx,y+15,6,6,accent);}
        for(let i=-1;i<=1;i++){const xx=x+i*r*.55,dir=e.direction||1;line(xx-7*dir,y,xx+7*dir,y,accent,3);line(xx,y-6,xx+7*dir,y,accent,3);}
      }else if(e.mechanic==='bubble'){
        for(let i=0;i<7;i++){const yy=y+r-((time*70+i*r*.31)%(r*2)),xx=x+Math.sin(i*2)*r*.6;c.strokeStyle='#d8eee7aa';c.lineWidth=2;c.beginPath();c.arc(xx,yy,8+i%3*4,0,7);c.stroke();}
        oval(x,y+15,34,9,accent);if(world.id==='bay'){for(let i=-2;i<=2;i++)line(x+i*10,y+12,x+i*12,y-12-Math.abs(i)*4,'#c19a8b',5);}
      }else if(e.mechanic==='ferry'){
        if(world.id==='bay'){oval(x,y+10,53,17,'#91a984');oval(x+53,y+7,15,10,'#b8caa0');for(let i=-1;i<=1;i++)line(x+i*24,y,x+i*24,y+20,'#6f8e7c',3);}
        else if(world.id==='cave'){oval(x,y+8,47,14,'#bcb699');oval(x-8,y-9,28,27,'#c4a084');for(let i=1;i<=3;i++){c.strokeStyle=dark;c.beginPath();c.arc(x-8,y-9,i*7,0,6);c.stroke();}line(x+33,y,x+43,y-18,dark);}
        else if(world.id==='rainforest'){oval(x,y+15,60,10,'#a7bc83');line(x-55,y+15,x+55,y+15,'#64866d',2);for(let i=-2;i<=2;i++){line(x+i*18,y+15,x+i*18-8,y+7,'#789775',2);}line(x+55,y+15,x+67,y+7,'#64866d',3);}
        else if(world.id==='town'){rect(x-30,y-6,60,28,'#b6976f');for(let i=-2;i<=2;i++)line(x+i*11,y-6,x+i*10,y+22,'#7b7159',2);c.strokeStyle='#c6b58b';c.lineWidth=4;c.beginPath();c.arc(x,y-7,28,Math.PI,Math.PI*2);c.stroke();line(x,y-35,x,y-80,'#c6b58b',3);}
        else {rect(x-43,y-7,86,27,accent);for(const xx of [-30,30])oval(x+xx,y+21,9,9,dark);line(x-32,y-7,x-32,y-47,dark);line(x+32,y-7,x+32,y-47,dark);line(x-32,y-47,x+32,y-47,dark);}
      }
    }
    if(layer==='background'){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,theme.sky);g.addColorStop(1,theme.far);c.fillStyle=g;c.fillRect(0,0,W,H);
      for(let i=0;i<9;i++){const x=((i*367-camera.x*.15)%(W+400)+W+400)%(W+400)-200,y=H*.35+(i%4)*90-camera.y*.025;
        if(world.id==='town'){rect(x,y,160,220,theme.far);c.fillStyle=theme.far;c.beginPath();c.moveTo(x-20,y);c.lineTo(x+80,y-70-(i%3)*30);c.lineTo(x+180,y);c.fill();}
        else if(world.id==='bay'){oval(x,H*.72+Math.sin(i)*45,210,30+(i%3)*25,theme.far);line(x-150,H*.83+(i%3)*25,x+170,H*.83+(i%3)*25,'#c3dcd555',2);}
        else if(world.id==='machine'){rect(x,y,80+(i%3)*35,H,theme.far);line(x+25,y,x+25,y-95,theme.far,15);line(x+30,y+120,x+240,y+120,theme.far,18);}
        else if(world.id==='cave'){c.fillStyle=theme.far;c.beginPath();c.moveTo(x-110,0);c.lineTo(x+35,H*(.3+(i%3)*.12));c.lineTo(x+145,0);c.fill();oval(x,H+40,180,130+(i%3)*35,theme.far);}
        else {rect(x-24,y,48,H,theme.far);oval(x,y,160,80,theme.far);oval(x-95,y+50,110,55,theme.far);}
      }
      return;
    }
    if(['decorations','middle','foreground'].includes(layer)){
      if(layer==='middle')for(const d of world.water||[]){if(!visible(d.x,d.y,d.w,d.h))continue;rect(d.x,d.y,d.w,d.h,'#518f9d44');for(let i=0;i<5;i++){const yy=d.y+((time*30+i*d.h/5)%d.h);line(d.x,yy,d.x+d.w,yy,'#d2e9da44',2);}line(d.x,d.y,d.x+d.w,d.y,'#d4f0df88',4);}
      for(const d of [...world.decorations].sort((a,b)=>(a.layer??0)-(b.layer??0))){const depth=d.layer??0;if(layer==='decorations'&&depth>=10||layer==='middle'&&(depth<10||depth>=30)||layer==='foreground'&&depth<30)continue;if(!visible(d.x,d.y,d.w,d.h))continue;const {x,y,w,h}=d;
        if(d.kind==='city-building'&&d.archStyle&&root.WindCityArt){root.WindCityArt.building(c,d,camera,W,H);continue;}
        if(d.kind==='city-building'){
          const colors=['#456773','#637d7d','#736f69'],base=colors[d.variant||0];rect(x,y,w,h,base);rect(x+w*.83,y,w*.17,h,'#304f5d');rect(x+12,y,9,h,'#a4ae9b');rect(x+w*.8,y,7,h,'#90a79c');
          const start=Math.max(0,Math.floor((camera.y-y)/90));for(let row=start;row<Math.ceil(h/90)&&y+row*90<camera.y+H;row++){
            const yy=y+row*90+24;if(yy+46>y+h)continue;
            for(let col=0;col<5;col++){const xx=x+35+col*(w*.7/5);rect(xx,yy,w*.085,43,'#284955');rect(xx+4,yy+4,w*.085-8,32,(row+col+(d.variant||0))%4===0?'#dab87a':'#789b9e');line(xx+w*.042,yy,xx+w*.042,yy+43,base,3);}
            line(x+23,yy+58,x+w*.8,yy+58,'#82958b',3);
          }
          if(d.variant===1){rect(x+w*.88,y+35,10,Math.max(0,h-70),'#c4a776');for(let yy=Math.max(y+60,camera.y-30);yy<Math.min(y+h,camera.y+H);yy+=70)line(x+w*.88-7,yy,x+w*.88+17,yy,'#b5baa0',4);}
        }
        else if(d.kind==='city-rooftop'&&d.fixture&&root.WindCityArt){root.WindCityArt.fixture(c,d,time);}
        else if(d.kind==='city-rooftop'){
          if(d.variant===0){rect(x+12,y+35,w-24,h-60,'#85978c');oval(x+w/2,y+35,(w-24)/2,14,'#bec2a5');line(x+18,y+h-25,x+10,y+h,'#49616a',6);line(x+w-18,y+h-25,x+w-10,y+h,'#49616a',6);}
          else if(d.variant===1){line(x+w/2,y,x+w/2,y+h,'#c7b589',5);for(let i=1;i<4;i++)line(x+w/2-40+i*6,y+i*25,x+w/2+40-i*6,y+i*25,'#a7b6a5',4);oval(x+w/2,y,6,6,'#e9c982');}
          else{rect(x,y+h-60,w,60,'#97a699');rect(x+10,y+h-48,w-20,28,'#425f6b');for(let i=0;i<6;i++)line(x+18+i*13,y+h-45,x+18+i*13,y+h-23,'#c2c3a1',3);}
        }
        else if(d.kind==='house'){rect(x,y+h*.25,w,h*.75,'#c2b38f');c.fillStyle=theme.ground;c.beginPath();c.moveTo(x-12,y+h*.27);c.lineTo(x+w*.5,y);c.lineTo(x+w+12,y+h*.27);c.fill();rect(x+w*.38,y+h*.65,w*.22,h*.35,'#45655d');for(const xx of [.13,.67]){rect(x+w*xx,y+h*.4,w*.17,h*.16,'#efd89c');}}
        else if(d.kind==='arch'){rect(x,y,w*.16,h,'#ae9c79');rect(x+w*.84,y,w*.16,h,'#ae9c79');c.strokeStyle='#bbaa81';c.lineWidth=h*.16;c.beginPath();c.ellipse(x+w*.5,y+h*.4,w*.42,h*.35,0,Math.PI,Math.PI*2);c.stroke();rect(x-w*.03,y+h*.08,w*1.06,h*.1,'#d6c398');}
        else if(d.kind==='awning'){for(let i=0;i<8;i++)rect(x+i*w/8,y,w/8,h*.3,i%2?'#d2b47e':'#a86e57');line(x,y+h*.25,x,y+h,'#887457',6);line(x+w,y+h*.25,x+w,y+h,'#887457',6);rect(x,y+h*.8,w,h*.2,'#b79a72');}
        else if(d.kind==='well'){rect(x+w*.15,y,w*.7,h,'#557371');for(let i=0;i<8;i++){line(x+w*.16,y+i*h/8,x+w*.84,y+i*h/8,'#708b7d',8);}oval(x+w*.5,y,w*.43,h*.05,'#c2b38b');oval(x+w*.5,y,w*.3,h*.028,'#385a5c');line(x+w*.48,y,x+w*.48,y+h*.85,'#c0af80',4);}
        else if(d.kind==='clocktower'||d.kind==='lighthouse'){const light=d.kind==='lighthouse';rect(x+w*.18,y+h*.15,w*.64,h*.85,light?'#d2c4a0':'#b39f7e');for(let i=1;i<5;i++)rect(x+w*.18,y+h*(.15+i*.16),w*.64,h*.045,light?'#ac7e6a':'#988b70');oval(x+w*.5,y+h*.19,w*.35,h*.1,theme.ground);if(light){rect(x+w*.31,y+h*.1,w*.38,h*.13,'#f0da9d');line(x+w*.5,y+h*.18,x+w*1.4,y+h*.13,'#efdaa955',12);}else{oval(x+w*.5,y+h*.19,w*.25,w*.25,'#e1d1a4');line(x+w*.5,y+h*.19,x+w*.5,y+h*.12,theme.ground,5);line(x+w*.5,y+h*.19,x+w*.65,y+h*.21,theme.ground,5);}rect(x+w*.37,y+h*.8,w*.26,h*.2,'#496660');}
        else if(d.kind==='hull'){c.fillStyle='#897762';c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.lineTo(x+w*.85,y+h);c.lineTo(x+w*.13,y+h*.85);c.closePath();c.fill();for(let i=1;i<5;i++)line(x+w*.15,y+i*h/5,x+w*.87,y+i*h/5,'#b09c78',4);for(let i=1;i<12;i++)oval(x+i*w/13,y+h*.23,Math.min(35,w/50),Math.min(35,w/50),'#3e6266');}
        else if(d.kind==='reef'){c.fillStyle='#789a91';c.beginPath();c.moveTo(x,y+h);for(let i=0;i<=6;i++)c.lineTo(x+i*w/6,y+h*(i%2?.12:.55));c.lineTo(x+w,y+h);c.closePath();c.fill();for(let i=0;i<5;i++)oval(x+w*(.15+i*.16),y+h*.73,24,35,'#a1b6a1');}
        else if(d.kind==='jetty'){for(let i=0;i<7;i++)line(x+i*w/6,y+h*.2,x+i*w/6,y+h,'#877d63',12);rect(x,y+h*.13,w,h*.1,'#c2aa7f');line(x,y,x+w,y,'#c2b48b',4);}
        else if(d.kind==='tree'){art('tree',x,y,w,h);}
        else if(d.kind==='water'){rect(x,y,w,h,'#7dc8c555');for(let i=0;i<6;i++)line(x,y+(time*40+i*h/6)%h,x+w,y+(time*40+i*h/6)%h,'#c2e9de55',2);}
        else if(d.kind==='gear'){const radius=Math.min(w,h)/2;c.save();c.translate(x+w/2,y+h/2);c.rotate(time*.4);for(let i=0;i<10;i++){c.rotate(Math.PI/5);rect(radius*.6,-radius*.15,radius*.5,radius*.3,'#bda779');}oval(0,0,radius*.72,radius*.72,'#688e86');oval(0,0,radius*.25,radius*.25,'#c9d0b5');c.strokeStyle='#d5bd90';c.lineWidth=4;c.beginPath();c.arc(0,0,radius*.67,0,Math.PI*2);c.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;line(Math.cos(a)*radius*.3,Math.sin(a)*radius*.3,Math.cos(a)*radius*.6,Math.sin(a)*radius*.6,'#c0b78d',5);oval(Math.cos(a)*radius*.42,Math.sin(a)*radius*.42,2,2,'#304f59');}oval(0,0,radius*.12,radius*.12,'#365c65');line(-radius*.07,0,radius*.07,0,'#e4c795',2);c.restore();}
        else if(d.kind==='vine'){line(x+w/2,y,x+w*.4,y+h,'#85a77b',7);for(let i=0;i<8;i++)oval(x+w*.5+(i%2?12:-12),y+i*h/8,18,8,'#a7bb84');}
        else if(d.kind==='mushroom'){rect(x+w*.43,y+h*.4,w*.14,h*.6,'#d7c9a5');oval(x+w/2,y+h*.37,w/2,h*.27,'#ad989f');oval(x+w*.3,y+h*.3,w*.1,h*.08,'#e8dcae');}
        else if(d.kind==='shell'){oval(x+w/2,y+h*.6,w*.46,h*.4,theme.accent);for(let i=0;i<4;i++){c.strokeStyle=theme.ground;c.beginPath();c.ellipse(x+w*.5,y+h*.6,w*(.1+i*.08),h*(.08+i*.07),0,0,7);c.stroke();}}
        else if(d.kind==='lamp'){line(x+w/2,y+h,x+w/2,y,'#aaa482',5);oval(x+w/2,y,16,20,'#efdba4');oval(x+w/2,y,37,40,'#f2e5a522');}
        else {rect(x,y,w,h,theme.ground);for(let i=0;i<4;i++)line(x,y+i*h/4,x+w,y+i*h/4,theme.far,2);}
      }return;
    }
    for(const v of world.climbs||[]){if(!visible(v.x-35,v.y,70,v.h))continue;line(v.x,v.y,v.x,v.y+v.h,'#6f946d',8);for(let i=0;i<v.h/48;i++){const yy=v.y+i*48;line(v.x,yy,v.x+(i%2?20:-20),yy-10,'#b4c494',4);oval(v.x+(i%2?23:-23),yy-10,13,6,'#a7bc85');}}
    for(const e of runtime.entities.filter(e=>e.mechanic==='ferry')){
      const d=e.destination;if(visible(d.x-80,d.y-80,160,160))unit(e,d.x,d.y);
      if(runtime.ride?.id===e.id){const p=api.player;unit(e,p.x+15,p.y+p.h-22);}
    }
    const closest=runtime.entities.filter(e=>e.kind!=='secret').map(e=>({e,d:Math.hypot(e.x-api.player.x-15,e.y-api.player.y-22)})).filter(v=>v.d<95).sort((a,b)=>a.d-b.d)[0]?.e;
    for(const e of runtime.entities){if(e.patrolFlight||e.hiddenVisual)continue;const reach=e.mechanic==='gust'?(e.height||440):e.mechanic==='bubble'?(e.radius||65):60;if(!visible(e.x-(e.radius||80),e.y-reach,(e.radius||80)*2,reach+90))continue;
      if(e.kind==='redcoin'){const t=world.tasks.find(t=>t.stages.some(s=>s.type==='redcoins'&&s.targets.includes(e.id)));if(t&&!runtime.getState(t).seen.includes(e.id)&&!runtime.getState(t).ready){oval(e.x,e.y,11,15,'#d56353');c.strokeStyle='#f3b89b';c.lineWidth=2;c.beginPath();c.ellipse(e.x,e.y,8,12,0,0,7);c.stroke();line(e.x,e.y-6,e.x,e.y+6,'#f5d0ac',3);}continue;}
      const related=world.tasks.filter(t=>t.stages.some(s=>s.targets.includes(e.id))),completed=related.length>0&&related.every(t=>runtime.getState(t).ready);
      if(e.kind==='secret'&&!(runtime.learned&&world.ability.mode==='lantern'&&runtime.effect>0))continue;
      c.save();if(completed)c.globalAlpha=.5;
      if(e.mechanic)unit(e);
      else if(e.kind==='npc'&&world.id==='machine'&&root.WindCityArt){root.WindCityArt.npc(c,e);}
      else if(e.kind==='npc'){rect(e.x-13,e.y,26,23,e.color||theme.accent);oval(e.x,e.y-13,13,14,'#e6c49d');oval(e.x,e.y-24,15,6,e.color||theme.ground);line(e.x-7,e.y+22,e.x-8,e.y+27,'#435e58',5);line(e.x+7,e.y+22,e.x+8,e.y+27,'#435e58',5);oval(e.x+5,e.y-14,1.5,2,'#344f51');}
      else if(e.kind==='robot'){rect(e.x-17,e.y-22,34,32,e.color||'#9eb7a8');rect(e.x-12,e.y-15,24,9,'#37565b');oval(e.x+6,e.y-11,3,3,'#e8d89a');line(e.x,e.y-22,e.x,e.y-31,theme.accent,3);oval(e.x,e.y-33,4,4,theme.accent);}
      else if(e.kind==='animal'){oval(e.x,e.y+10,21,10,e.color||theme.accent);oval(e.x-4,e.y-2,14,15,theme.ground);oval(e.x+18,e.y+2,8,8,'#d8cca4');}
      else if(e.kind==='sign'){rect(e.x-24,e.y-24,48,34,'#d4c49d');line(e.x,e.y+10,e.x,e.y+26,'#947e64',5);line(e.x-13,e.y-14,e.x+13,e.y-14,'#6c816e',2);line(e.x-13,e.y-5,e.x+8,e.y-5,'#6c816e',2);}
      else if(e.kind==='device'){oval(e.x,e.y+13,24,8,theme.ground);rect(e.x-14,e.y-18,28,33,e.color||theme.accent);oval(e.x,e.y-3,8,8,theme.sky);}
      else {oval(e.x,e.y+Math.sin(time*2+e.x)*3,10,13,e.color||'#e4ce91');line(e.x-4,e.y-4,e.x+4,e.y+3,'#fff3c6',2);}
      const p=api.player;if(e===closest){c.fillStyle='#fff0cb';c.font='14px "Microsoft YaHei", sans-serif';c.textAlign='center';c.fillText(e.name,e.x,e.y-42);}
      c.restore();
    }
    for(const t of world.tasks){const session=runtime.getSession(t),s=t.stages[runtime.getState(t).stage];if(s?.type==='race'&&session.give>0){const p=runtime.entities.find(e=>e.id===s.targets[0]),v=Math.min(1,session.give/1.4);if(p&&visible(p.x-30,p.y-50)){art('book',p.x-24,p.y+12-38*v,50*v,61*v);}}}
    const teacher=world.ability.teacher;if(visible(teacher.x-30,teacher.y-45)){art('race-child',teacher.x-22,teacher.y-36,44,58);oval(teacher.x,teacher.y-46,10,10,theme.accent);}
    for(const s of world.shortcuts||[])for(const p of [s.a,s.b])if(visible(p.x-40,p.y-65,80,100)){rect(p.x-27,p.y-43,54,62,theme.ground);line(p.x-25,p.y-45,p.x+25,p.y-45,theme.accent,5);line(p.x,p.y-32,p.x,p.y+10,theme.accent,3);}
    for(const t of world.tasks){if((!runtime.getState(t).ready&&!(['summit','transfer'].includes(t.challengeData?.mode)&&t.stages[0].challenge==='machine-city'))||api.collected(t.id)||!visible(t.reward.x-30,t.reward.y-30))continue;oval(t.reward.x,t.reward.y,33,33,'#f5e9b533');art('book',t.reward.x-24,t.reward.y-26+Math.sin(time*2)*4,50,61);}
    if(runtime.magnetTarget){const a=runtime.magnetTarget,p=api.player;c.save();c.strokeStyle='#b6e3d599';c.lineWidth=2;c.setLineDash([8,9]);c.beginPath();c.moveTo(p.x+15,p.y+p.h/2);c.lineTo(a.x,a.y);c.stroke();c.restore();}
    if(runtime.effect>0){const p=api.player;oval(p.x+15,p.y+20,48,48,'#e8edb533');}
    runtime.specialized?.draw?.(api,'objects');
    if(runtime.climbing){const p=api.player;line(p.x+1,p.y+12,p.x+15,p.y+4,'#e6c49d',4);line(p.x+28,p.y+16,p.x+15,p.y+22,'#e6c49d',4);}
  }
  root.WindExpansionRender={draw};
})(typeof window==='undefined'?globalThis:window);
(function(root){
  function brushes(c){return {
    rect:(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);},
    line:(x,y,xx,yy,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();},
    oval:(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();},
    ring:(x,y,r,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
  };}
  function platform(c,p,top){const {rect,line,oval,ring}=brushes(c),{x,y,w}=p,h=p.artDepth||64,k=p.artKind,edge=p.surface||[[x,y],[x+w,y]],gold='#d2b887',dark='#304e59',copper='#ac8066',light='#edd8a7';
    c.save();c.lineJoin='round';
    if(top){c.strokeStyle=['pipe','boiler','copper'].includes(k)?'#d5b58c':'#dac69e';c.lineWidth=k==='tread'?4:5;c.beginPath();c.moveTo(...edge[0]);for(const v of edge.slice(1))c.lineTo(...v);c.stroke();c.restore();return;}
    c.beginPath();c.moveTo(...edge[0]);for(const v of edge.slice(1))c.lineTo(...v);for(const v of [...edge].reverse())c.lineTo(v[0],v[1]+h);c.closePath();c.clip();
    const bottom=Math.max(...edge.map(v=>v[1]))+h;
    if(k==='spire'){
      rect(x+w*.35,y,w*.3,h,'#778d83');rect(x+w*.36,y,w*.04,h,'#c2b18d');rect(x,y,w,13,gold);
      oval(x+w/2,y+58,49,49,dark);oval(x+w/2,y+58,42,42,'#d6c398');ring(x+w/2,y+58,35,'#8b8067',2);line(x+w/2,y+58,x+w/2-14,y+48,dark,4);line(x+w/2,y+58,x+w/2+5,y+30,dark,3);
      for(let yy=y+122;yy<y+h-8;yy+=51){rect(x+w*.44,yy,w*.12,26,dark);rect(x+w*.46,yy+3,w*.04,19,'#cbb987');}
    }else if(k==='dome'){
      oval(x+w/2,y+20,w*.48,h*.82,'#5b8786');for(const frac of [.25,.5,.75]){c.strokeStyle='#b4b899';c.lineWidth=4;c.beginPath();c.ellipse(x+w/2,y+20,w*frac*.6,h*.8,0,0,Math.PI);c.stroke();}rect(x,y,w,15,gold);oval(x+w/2,y+65,29,29,dark);ring(x+w/2,y+65,24,'#d5bd86',3);line(x+w/2-13,y+65,x+w/2+13,y+65,'#e5cea0',2);line(x+w/2,y+52,x+w/2,y+78,'#e5cea0',2);
    }else if(k==='pipe'){
      rect(x,y,w,bottom-y,'#6c8b88');rect(x,y+7,w,13,'#a2b3a0');rect(x,y+36,w,20,'#3f646c');
      for(let xx=x+12;xx<x+w;xx+=110){rect(xx,y+3,15,h-6,'#ba9b76');line(xx+4,y+8,xx+4,y+h-7,light,2);for(const yy of [y+12,y+38])oval(xx+8,yy,2,2,dark);}
      oval(x+7,y+25,6,18,dark);oval(x+w-7,y+25,6,18,dark);
    }else if(k==='boiler'){
      rect(x+10,y,w-20,h-15,'#8ba69b');rect(x+w*.72,y,w*.22,h-15,'#537a7d');oval(x+w/2,y+h-18,w/2-10,14,'#537a7d');
      for(const yy of [y+12,y+h-35]){rect(x+6,yy,w-12,9,gold);line(x+14,yy+2,x+w-14,yy+2,light,2);}
      for(let xx=x+40;xx<x+w-25;xx+=95){rect(xx,y+31,18,38,'#3b6169');rect(xx+4,y+35,10,25,'#b4d0ba');line(xx+2,y+54,xx+17,y+54,'#ddc58b',2);}
      oval(x+w*.5,y+52,23,23,dark);oval(x+w*.5,y+52,18,18,'#e0c99a');line(x+w*.5,y+52,x+w*.5+9,y+42,'#806c58',3);
    }else if(k==='clock'){
      rect(x+8,y,w-16,h,'#9c8d79');rect(x+18,y+14,w-36,h-14,'#6e7e77');rect(x,y+6,w,9,gold);
      const r=Math.min(43,w*.24);oval(x+w/2,y+65,r+7,r+7,dark);oval(x+w/2,y+65,r,r,'#dfcca4');ring(x+w/2,y+65,r-6,'#a18c69',2);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;line(x+w/2+Math.sin(a)*(r-9),y+65-Math.cos(a)*(r-9),x+w/2+Math.sin(a)*(r-13),y+65-Math.cos(a)*(r-13),dark,2);}
      line(x+w/2,y+65,x+w/2-14,y+56,dark,4);line(x+w/2,y+65,x+w/2+5,y+39,dark,3);oval(x+w/2,y+65,4,4,copper);
      for(const xx of [x+22,x+w-32])rect(xx,y+25,10,h-25,gold);
    }else if(k==='glass'){
      rect(x,y,w,h,'#476975');
      for(let xx=x+8;xx<x+w-10;xx+=76){rect(xx,y+10,65,h-18,'#88aaa8');c.fillStyle='#c4d0b044';c.beginPath();c.moveTo(xx+8,y+12);c.lineTo(xx+32,y+12);c.lineTo(xx+58,y+h-10);c.lineTo(xx+34,y+h-10);c.fill();line(xx+64,y+4,xx+64,y+h,gold,5);}
      line(x,y+h-7,x+w,y+h-7,gold,5);line(x,y+14,x+w,y+14,'#b7c6af',3);
    }else if(k==='awning'||k==='copper'){
      rect(x,y,w,h,k==='awning'?'#a97967':'#698d87');
      for(let xx=x;xx<x+w;xx+=48){rect(xx,y+7,22,h,k==='awning'?'#d2b184':'#8caaa0');line(xx,y+8,xx+14,y+h,'#31596166',2);}
      line(x,y+h-14,x+w,y+h-14,k==='awning'?'#785d52':'#476970',7);
      for(const xx of [x+15,x+w-15])line(xx,y+h-12,xx,y+h,gold,5);
    }else if(k==='crate'){
      rect(x,y,w,h,'#92795e');
      for(let xx=x;xx<x+w;xx+=125){rect(xx+5,y+11,113,h-18,'#b49c75');for(let q=0;q<5;q++)line(xx+13,y+20+q*12,xx+110,y+20+q*12,'#806f58',2);line(xx+11,y+16,xx+109,y+h-13,'#d4bc89',8);line(xx+12,y+h-14,xx+108,y+16,'#c4a778',7);rect(xx+1,y,7,h,dark);}
    }else if(k==='quay'){
      rect(x,y,w,h,'#9a9f89');rect(x,y+12,w,9,'#b7b89c');rect(x,y+h-15,w,15,'#687e77');
      for(let xx=x+30;xx<x+w;xx+=90){line(xx,y+23,xx,y+h-17,'#747f70',2);line(xx+15,y+32,xx+43,y+31,'#bcc0a044',2);}
      for(let xx=x+25;xx<x+w-20;xx+=145){rect(xx,y+30,34,15,dark);for(let q=0;q<4;q++)line(xx+5+q*8,y+32,xx+5+q*8,y+43,'#a0ae98',2);}
    }else{
      const moving=['carriage','basket','tread'].includes(k);
      rect(x,y,w,15,moving?'#ae9371':'#64838a');line(x+2,y+13,x+w-2,y+13,dark,4);
      for(let xx=x+8;xx<x+w-16;xx+=48){line(xx,y+18,Math.min(x+w-8,xx+23),y+h-7,'#8aa49d',4);line(Math.min(x+w-8,xx+23),y+h-7,Math.min(x+w-8,xx+46),y+18,'#8aa49d',4);}
      if(k==='balcony'){for(const xx of [x+16,x+w-16])line(xx,y+12,xx,y+h,gold,6);}
      if(moving){line(x,y+h-7,x+w,y+h-7,gold,5);for(const xx of [x+15,x+w-15]){oval(xx,y+8,4,4,dark);oval(xx-1,y+7,1.5,1.5,light);}if(k==='carriage'){for(const xx of [x+28,x+w-28]){oval(xx,y+h-11,10,10,dark);oval(xx,y+h-11,5,5,gold);}}}
    }
    // Sparse hand-drawn scuffs, stable in local coordinates; no random per-frame texture.
    for(let i=0;i<Math.min(12,w/40);i++)line(x+17+i*43,y+7+(i%3)*4,x+28+i*43,y+6+(i%3)*4,'#f5e7b622',1);
    c.restore();
  }
  function building(c,d,camera,W,H){const {rect,line,oval,ring}=brushes(c),{x,y,w,h}=d,k=d.archStyle;
    const glass=k==='glass',factory=k==='factory',clock=k==='clock',base=glass?'#4e737c':factory?'#746e64':clock?'#857b6b':'#617a77';
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();rect(x,y,w,h,base);rect(x+w*.83,y,w*.17,h,'#2e505b');rect(x+9,y,9,h,'#b5ae90');rect(x+w*.8,y,7,h,'#9aab94');
    const step=factory?115:glass?100:90,cols=Math.max(2,Math.floor(w/95)),cell=w*.72/cols;
    for(let row=Math.max(0,Math.floor((camera.y-y)/step));y+row*step<Math.min(y+h,camera.y+H);row++){
      const yy=y+row*step+24;line(x+18,yy+59,x+w*.8,yy+59,'#9aa18a',3);
      for(let col=0;col<cols;col++){const xx=x+28+col*cell,ww=cell-18;rect(xx-3,yy-3,ww+6,48,'#2d505b');rect(xx,yy,ww,39,(row+col)%5===0?'#d8b67e':glass?'#96b9b4':'#7d9d9c');line(xx+ww/2,yy,xx+ww/2,yy+42,base,3);if(glass){line(xx+4,yy+3,xx+ww*.5,yy+35,'#c4d2b866',6);}else line(xx,yy+20,xx+ww,yy+20,base,2);}
      if(factory){rect(x+w*.86,yy-18,13,step,'#ac8b66');line(x+w*.86+3,yy-18,x+w*.86+3,yy+step-18,'#d1b78a',2);}
      else if(!glass){for(let xx=x+26;xx<x+w*.79;xx+=53)line(xx+(row%2)*17,yy+70,xx+22+(row%2)*17,yy+70,'#b0a28633',2);}
    }
    if(clock||k==='observatory'){const r=Math.min(w*.26,130),cx=x+w*.43,cy=y+150;oval(cx,cy,r+12,r+12,'#344f58');oval(cx,cy,r,r,'#cbbb93');ring(cx,cy,r-10,'#8c8066',4);for(let i=0;i<12;i++){const a=i*Math.PI/6;line(cx+Math.sin(a)*(r-17),cy-Math.cos(a)*(r-17),cx+Math.sin(a)*(r-26),cy-Math.cos(a)*(r-26),'#607470',4);}line(cx,cy,cx-r*.4,cy-r*.3,'#496368',7);line(cx,cy,cx+r*.1,cy-r*.7,'#496368',5);oval(cx,cy,8,8,'#a78064');}
    c.restore();
  }
  function fixture(c,d,time){const {rect,line,oval,ring}=brushes(c),{x,y,w,h}=d,cx=x+w/2,base=y+h;
    if(d.fixture==='chimney'){rect(x+30,y+23,w-60,h-23,'#866f5c');rect(x+24,y+22,w-48,13,'#c3a47d');rect(x+24,base-14,w-48,14,'#baa485');for(let yy=y+47;yy<base-15;yy+=22)line(x+31,yy,x+w-31,yy,'#b19170',3);for(let i=0;i<3;i++){const t=(time*.2+i/3)%1;oval(cx+Math.sin(t*4)*10,y+10-t*52,13+t*12,8+t*8,'#bdc5ad22');}}
    else if(d.fixture==='tank'){for(const xx of [x+23,x+w-23])line(xx,base-35,xx,base,'#41626c',6);rect(x+12,y+22,w-24,h-58,'#8ca69a');oval(cx,y+22,w/2-12,14,'#b8c6aa');oval(cx,base-36,w/2-12,12,'#668b87');for(const yy of [y+40,base-50])line(x+12,yy,x+w-12,yy,'#c4b284',6);}
    else if(d.fixture==='clock'){line(cx,y+34,cx,base,'#7e998a',8);oval(cx,y+38,31,31,'#36535e');oval(cx,y+38,25,25,'#e0c798');line(cx,y+38,cx+4,y+19,'#536c6a',3);line(cx,y+38,cx-12,y+33,'#536c6a',3);}
    else if(d.fixture==='skylight'){rect(x,base-48,w,48,'#587c82');for(let xx=x+9;xx<x+w-8;xx+=24){rect(xx,base-41,18,31,'#a2bfb3');line(xx,base-43,xx+14,base-10,'#d7d9b3',2);}line(x,base-49,x+w,base-49,'#d3bd90',5);}
    else {rect(x,base-58,w,58,'#97a795');rect(x+9,base-48,w-18,37,'#3c606b');for(let xx=x+17;xx<x+w-10;xx+=12)line(xx,base-45,xx,base-16,'#a7b9a3',4);rect(x+14,base-66,w-28,9,'#bfc4a3');}
  }
  function npc(c,e){const {rect,line,oval}=brushes(c),{x,y}=e,worker=e.id==='machine-reader',coat=worker?'#b89670':'#7b9c9c';
    oval(x,y+26,20,4,'#243f4922');line(x-7,y+13,x-8,y+24,'#49646b',8);line(x+7,y+13,x+9,y+24,'#49646b',8);line(x-13,y+25,x-5,y+25,'#3c5259',5);line(x+6,y+25,x+14,y+25,'#3c5259',5);
    c.fillStyle=coat;c.beginPath();c.moveTo(x-11,y-1);c.lineTo(x+11,y-1);c.lineTo(x+16,y+18);c.lineTo(x-15,y+18);c.closePath();c.fill();line(x-13,y+1,x-18,y+12,coat,7);line(x+13,y+1,x+17,y+11,coat,7);oval(x-18,y+14,4,5,'#e8c7a0');oval(x+17,y+13,4,5,'#e8c7a0');
    oval(x,y-13,12,14,'#e6c79f');oval(x,y-24,16,6,worker?'#b98867':'#577b80');line(x-15,y-21,x+15,y-21,'#c8b48b',3);oval(x+5,y-14,1.5,2,'#334f58');rect(x-7,y,14,4,'#bf8b70');rect(x+3,y+8,7,5,'#d8c092');line(x,y+5,x,y+17,'#d5c8a4',1);
  }
  root.WindCityArt={platform,building,fixture,npc};

})(typeof window==='undefined'?globalThis:window);
