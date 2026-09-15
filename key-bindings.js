(function(root){'use strict';
 const labels={ArrowLeft:'左移',ArrowRight:'右移',ArrowUp:'向上／互动',ArrowDown:'向下／坐地',KeyZ:'跳跃',KeyX:'旋转攻击',KeyC:'专属动作',Enter:'确认／跳过对话',Escape:'暂停／返回',Journal:'旅途札记'};
 const presets={arrows:{ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',ArrowUp:'ArrowUp',ArrowDown:'ArrowDown',KeyZ:'KeyZ',KeyX:'KeyX',KeyC:'KeyC',Enter:'Enter',Escape:'Escape',Journal:'KeyM'},wasd:{ArrowLeft:'KeyA',ArrowRight:'KeyD',ArrowUp:'KeyW',ArrowDown:'KeyS',KeyZ:'KeyJ',KeyX:'KeyK',KeyC:'KeyL',Enter:'Enter',Escape:'Escape',Journal:'KeyM'}};
 const fixed={Enter:'Enter',NumpadEnter:'Enter',Space:'Enter',Escape:'Escape',KeyP:'Escape'};
 const label=k=>({ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Escape:'Esc',Enter:'Enter',Space:'空格',ShiftLeft:'左 Shift',ShiftRight:'右 Shift'}[k]||k.replace(/^Key|^Digit/,''));
 function create(storage,key='wind-controls-v1'){let map={...presets.arrows},preset='arrows',basePreset='arrows';const valid=k=>typeof k==='string'&&/^(Key[A-Z]|Digit[0-9]|Arrow(Left|Right|Up|Down)|Shift(Left|Right)|Enter|Escape|Space)$/.test(k);
 function persist(){try{storage?.setItem(key,JSON.stringify({version:1,preset,basePreset,map}));}catch{}}
 function check(m){const used=new Set();for(const action of Object.keys(labels)){const code=m?.[action];if(!valid(code)||used.has(code)||(fixed[code]&&fixed[code]!==action))return false;used.add(code);}return true;}
 try{const saved=JSON.parse(storage?.getItem(key)||'null');if(saved?.version===1&&check(saved.map)){map={...saved.map};preset=saved.preset in presets?saved.preset:'custom';basePreset=saved.basePreset in presets?saved.basePreset:(preset==='wasd'?'wasd':'arrows');}}catch{}
 function choose(name){map={...presets[name]};preset=name;basePreset=name;persist();}
 function bind(action,code){if(!labels[action]||!valid(code))return '请选择字母、数字、方向键或 Shift。';if(fixed[code]&&fixed[code]!==action)return label(code)+' 保留用于'+labels[fixed[code]]+'。';const conflict=Object.keys(map).find(a=>a!==action&&map[a]===code);if(conflict)return label(code)+' 已用于'+labels[conflict]+'，请换一个键。';map[action]=code;preset='custom';persist();return '';}
 function resolve(code){return fixed[code]||Object.keys(map).find(a=>map[a]===code)||(['Tab','PageUp','PageDown','Home','End'].includes(code)?code:null);}
 return {resolve,choose,bind,label,labels,get preset(){return preset;},get basePreset(){return basePreset;},get map(){return {...map};}};
 }
 root.WindControls={create};
})(typeof window==='undefined'?globalThis:window);
