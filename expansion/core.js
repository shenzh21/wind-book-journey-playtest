/* Expansion data boundary: plain JSON, stable IDs, no engine-specific state. */
(function(root){
  const copy=v=>JSON.parse(JSON.stringify(v)),ids=['town','bay','machine','cave','rainforest'];
  const types=['talk','touch','spin','special','hold','sequence','chase','escort','race','carry','choice','hidden','redcoins','challenge'];
  function validate(input){
    const d=copy(input),number=(n,label)=>{if(!Number.isFinite(n))throw Error(label+' 必须是有限数字');},point=(p,label)=>{if(!p)throw Error(label+' 缺少坐标');number(p.x,label);number(p.y,label);};
    if(!ids.includes(d.id)||typeof d.name!=='string')throw Error('无效世界');
    if(!d.size||!Number.isFinite(d.size.w)||!Number.isFinite(d.size.h)||d.size.w<800||d.size.h<600||d.size.w>50000||d.size.h>30000)throw Error('世界范围无效');
    point(d.entry,'入口');point(d.exit,'出口');point(d.ability?.teacher,'能力导师');if(!['gust','swim','magnet','lantern','vine'].includes(d.ability.mode))throw Error('专属动作类型无效');if(!d.theme||!['sky','far','ground','accent'].every(k=>typeof d.theme[k]==='string'))throw Error('世界配色无效');
    for(const key of ['platforms','entities','tasks','coins','enemies','decorations','regions'])if(!Array.isArray(d[key]))throw Error(key+' 列表无效');
    const entityIds=new Set(),taskIds=new Set(),platformIds=new Set(),coinIds=new Set();
    for(const p of d.platforms){point(p,'平台');if(!p.id||platformIds.has(p.id))throw Error('平台 ID 重复');platformIds.add(p.id);number(p.w,'平台宽');number(p.h,'平台高');if(p.w<8||p.h<4)throw Error('平台过小');if(!['grass','wood','cave','cloud'].includes(p.type))throw Error('平台材质无效');p.baseX=p.x;p.baseY=p.y;
      if(p.surface){if(!Array.isArray(p.surface)||p.surface.length<2)throw Error('斜坡至少两个顶点');p.surface.forEach((v,i)=>{if(!Array.isArray(v)||v.length!==2||!v.every(Number.isFinite)||i&&v[0]<=p.surface[i-1][0])throw Error('斜坡顶点须按 X 递增');});if(p.surface[0][0]!==p.x||p.surface.at(-1)[0]!==p.x+p.w)throw Error('斜坡顶点须覆盖平台宽度');}}
    for(const a of d.water||[]){point(a,'水域');for(const k of ['w','h'])if(!(a[k]>0))throw Error('水域尺寸无效');for(const k of ['currentX','currentY'])if(a[k]!==undefined)number(a[k],'水流');}
    for(const a of d.climbs||[]){point(a,'攀爬藤蔓');if(!(a.h>0))throw Error('藤蔓高度无效');}
    for(const e of d.entities){point(e,e.name);if(!e.id||entityIds.has(e.id))throw Error('实体 ID 重复');entityIds.add(e.id);if(e.path){if(e.path.length<2)throw Error('路径至少两点');e.path.forEach(p=>point(p,e.name));}
      if(e.mechanic){if(!['spring','gust','conveyor','ferry','bubble'].includes(e.mechanic))throw Error('环境单位行为无效');for(const k of ['radius','power','height','speed'])if(e[k]!==undefined&&(!Number.isFinite(e[k])||e[k]<=0))throw Error('环境单位 '+k+' 必须为正数');if(e.direction!==undefined&&![-1,1].includes(e.direction))throw Error('输送方向必须为 -1 或 1');if(e.mechanic==='ferry')point(e.destination,'载具目的地');}
    }
    for(const c of d.coins){point(c,'金币');if(typeof c.id!=='string'||coinIds.has(c.id))throw Error('金币 ID 重复或无效');coinIds.add(c.id);}
    for(const e of d.enemies){point(e,'敌人');for(const k of ['w','h','left','right','v'])number(e[k],'敌人 '+k);}
    for(const m of d.machines||[]){if(!['crane','pulley'].includes(m.kind))throw Error('升降机械类型无效');if(!Array.isArray(m.decks)||m.decks.length!==(m.kind==='crane'?1:2)||new Set(m.decks).size!==m.decks.length||m.decks.some(id=>!d.platforms.some(p=>p.id===id&&p.assembly===m.id)))throw Error('吊篮平台引用无效');point(m.anchor,'滑轮支点');number(m.lowY,'最低位置');number(m.highY,'最高位置');if(m.lowY<=m.highY||!(m.speed>0)||!(m.pause>=0))throw Error('升降范围或速度无效');}
    for(const item of d.decorations){point(item,'装饰');number(item.w,'装饰宽');number(item.h,'装饰高');if(item.layer!==undefined)number(item.layer,'装饰层级');}
    for(const r of d.routes||[])if(!platformIds.has(r.from)||!platformIds.has(r.to))throw Error('路线引用失效');
    for(const t of d.tasks){if(!t.id||taskIds.has(t.id))throw Error('任务 ID 重复');taskIds.add(t.id);point(t.reward,t.title);if(typeof t.bookTitle!=='string'||!Array.isArray(t.content)||!t.content.every(v=>typeof v==='string'))throw Error('书籍文字无效');if(!Array.isArray(t.stages)||!t.stages.length)throw Error('任务没有阶段');
      for(const s of t.stages){if(!types.includes(s.type)||!Array.isArray(s.targets)||!s.targets.length||s.targets.some(id=>!entityIds.has(id)))throw Error(t.title+' 阶段引用无效');if(typeof s.text!=='string')throw Error('阶段缺少说明');for(const k of ['seconds','limit','radius','count'])if(s[k]!==undefined&&(!Number.isFinite(s[k])||s[k]<=0))throw Error('阶段 '+k+' 必须为正数');if(s.type==='sequence'&&(!s.pattern?.length||s.pattern.some(id=>!s.targets.includes(id))))throw Error('机关序列无效');if(s.type==='choice'&&(!s.choices?.length||!Number.isInteger(s.answer)||s.answer<0||s.answer>=s.choices.length))throw Error('对话选项无效');if(s.type==='race'){point(s.finish,t.title);if(!(s.seconds>0))throw Error('比赛时长无效');}if(s.type==='carry'&&s.targets.length!==2)throw Error('搬运需要起终点');if(s.type==='redcoins'&&(s.targets.length!==8||new Set(s.targets).size!==8||!entityIds.has(s.redeem)))throw Error('红币任务需要八枚不同红币与兑换NPC');if(s.type==='challenge'&&typeof s.challenge!=='string')throw Error('独立机制缺少类型');if(s.challenge==='machine-flywheel'){const f=t.challengeData;point(f?.center,'飞轮轴心');if(!(f.radius>0)||!Array.isArray(f.rim)||f.rim.length!==8||[...f.rim,f.bridge,f.from,f.to].some(id=>!platformIds.has(id)))throw Error('飞轮踏板或通路引用无效');for(const k of ['initialAngle','initialSpeed','targetAngle'])number(f[k],'飞轮 '+k);}}
    }
    for(const e of d.entities)if(e.platformId&&!platformIds.has(e.platformId))throw Error('运输带平台引用无效');
    for(const m of d.cityTransports||[]){if(!platformIds.has(m.id))throw Error('移动平台引用无效');point(m.a,'移动平台起点');point(m.b,'移动平台终点');if(!(m.seconds>0)||!(m.pause>=0)||!Number.isFinite(m.phase))throw Error('移动平台时间无效');}
    for(const s of d.shortcuts||[]){point(s.a,'捷径');point(s.b,'捷径');}
    return d;
  }
  function stored(id,suffix=''){const key='wind-machine-playtest-layout-'+id+suffix,raw=root.localStorage?.getItem(key);if(!raw)return null;const data=JSON.parse(raw),base=root.WIND_EXPANSIONS[id];if((data.revision||0)<(base.revision||0)){root.localStorage.setItem(key+'-backup',raw);root.localStorage.setItem(key,JSON.stringify(base));return copy(base);}return data;}
  function worlds(){const out={};for(const id of ids){if(!root.WIND_EXPANSIONS?.[id])continue;let data=root.WIND_EXPANSIONS[id];try{data=stored(id)||data;}catch(e){root.console?.warn(e.message);}try{out[id]=validate(data);}catch(e){root.console?.warn(e.message);out[id]=validate(root.WIND_EXPANSIONS[id]);}}
    if(root.WIND_EXPANSION_PREVIEW){const d=validate(root.WIND_EXPANSION_PREVIEW);out[d.id]=d;}return out;}
  function augment(base){const out=copy(base),all=worlds();out.expansions=all;
    ids.forEach((id,i)=>{const d=all[id];if(!d)return;out.worlds[id]={size:d.size,entry:{x:d.entry.x-15,y:d.entry.y-22},platforms:d.platforms,coins:d.coins,enemies:d.enemies};Object.assign(out.portals[i+1],{target:id,title:d.name});const portal=out.portals[i+1],floor=out.worlds.library?.platforms?.find(p=>portal.x>=p.x&&portal.x<=p.x+p.w&&Math.abs(portal.y-p.y)<2);if(floor)floor.w=Math.max(floor.w,portal.x+345-floor.x);
    for(const t of d.tasks)out.books.push({id:t.id,worldId:id,world:d.name,title:t.bookTitle,genre:'风之书 · '+d.name,content:t.content,challenge:t.title,hint:t.hint,x:t.reward.x,y:t.reward.y});
    });return out;}
  root.WindExpansion={ids,types,copy,validate,stored,worlds,augment};
})(typeof window==='undefined'?globalThis:window);
