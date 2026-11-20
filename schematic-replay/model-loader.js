/* RTC 78D fixed-width model and history loader. All data stays in the browser. */
"use strict";
(() => {
  const required=['NODE','LINK','HISTORY','ROUTE'];
  function selectFiles(files) {
    const groups=new Map();
    for(const file of files){const match=file.name.match(/^(.*)\.(NODE|LINK|HISTORY|ROUTE)$/i);if(!match)continue;const key=match[1].toUpperCase(),ext=match[2].toUpperCase();if(!groups.has(key))groups.set(key,new Map());const group=groups.get(key);if(group.has(ext))throw Error('More than one '+ext+' file has the model name '+match[1]+'. Choose the four files for one model.');group.set(ext,file);}
    const complete=[...groups].filter(([,g])=>required.every(x=>g.has(x)));
    if(complete.length!==1)throw Error(complete.length?'More than one complete model was found. Choose the four files for one model.':'No matching set found. Select NODE, LINK, HISTORY and ROUTE files with the same base filename.');
    return {name:complete[0][0],files:complete[0][1]};
  }
  function parseNodes(text){
    const list=[],byId=new Map();
    for(const line of text.split(/\r?\n/)){
      const id=line.slice(2,14).trim();if(!/^[A-Z0-9]+\d/.test(id))continue;
      if(byId.has(id))throw Error('Duplicate NODE identifier: '+id);
      const a=line.slice(241,251).trim(),b=line.slice(252,262).trim(),x=Number(a),y=-Number(b);
      if(!a||!b||!Number.isFinite(x)||!Number.isFinite(y))throw Error('Missing or invalid schematic coordinates for node '+id+'.');
      const n={id,name:line.slice(16,32).trim(),subdivision:line.slice(674,694).trim(),x,y};list.push(n);byId.set(id,n);
    }
    if(!list.length)throw Error('No NODE records found. This prototype expects the RTC fixed-width NODE format.');return {list,byId};
  }
  function parseLinks(text,byId){
    const links=[],graph=new Map();let invalid=0;
    for(const line of text.split(/\r?\n/)){const a=line.slice(2,14).trim(),b=line.slice(17,29).trim();if(!/^[A-Z0-9]+\d/.test(a)||!/^[A-Z0-9]+\d/.test(b))continue;
      if(!byId.has(a)||!byId.has(b)){invalid++;continue;}if(line[32]!=='Y')continue;
      const raw=line.slice(70,80).trim(),distance=Number(raw);if(!raw||!Number.isFinite(distance)||distance<0)throw Error('Invalid LINK distance between '+a+' and '+b+'.');
      const link={a,b,d:distance,type:line.slice(48,68).trim()};links.push(link);if(!graph.has(a))graph.set(a,new Map());graph.get(a).set(b,link);
    }
    if(invalid)throw Error(invalid+' LINK records reference nodes missing from the NODE file. Check that the files belong together.');if(!links.length)throw Error('No enabled LINK records found.');return {links,graph};
  }
  function csv(line){let fields=[],v='',quoted=false;for(let i=0;i<line.length;i++){let c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){v+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){fields.push(v);v=''}else v+=c}fields.push(v);return fields;}
  function parseRoute(text){
    const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/);let pos=lines.findIndex(l=>/^\s*Route index\s*,/i.test(l));if(pos<0)throw Error('ROUTE column header was not found.');
    const h=csv(lines[pos]).map(s=>s.trim().toLowerCase()),col=s=>h.indexOf(s),ix=col('route index'),symbol=col('train symbol'),node=col('node number'),arr=col('head-end arrival'),dep=col('head-end departure');
    if([ix,symbol,node,arr,dep].some(i=>i<0))throw Error('ROUTE is missing required train, node, index or time columns.');
    const lookup=new Map();for(const line of lines.slice(pos+1)){const a=csv(line);if(a.length<=Math.max(ix,symbol,node,arr,dep))continue;const train=a[symbol].trim().toUpperCase(),index=Number(a[ix]),id=a[node].trim(),arrival=Number(a[arr]),departure=Number(a[dep]);if(!train||!id||!Number.isInteger(index)||!Number.isFinite(arrival)||!Number.isFinite(departure))continue;let key=train+'|'+index;if(lookup.has(key)){const prior=lookup.get(key);if(prior.id!==id||prior.arrival!==arrival||prior.departure!==departure)throw Error('Conflicting ROUTE rows for '+key+'.');}lookup.set(key,{id,arrival,departure});}
    if(!lookup.size)throw Error('No valid ROUTE records found.');return lookup;
  }
  async function forEachLine(file,callback){
    if(typeof file.stream!=='function'){for(const l of (await file.text()).split(/\r?\n/))callback(l);return;}
    const reader=file.stream().getReader(),decoder=new TextDecoder();let pending='';for(;;){const part=await reader.read();if(part.done)break;pending+=decoder.decode(part.value,{stream:true});const last=pending.lastIndexOf('\n');if(last>=0){for(const line of pending.slice(0,last).split('\n'))callback(line.replace(/\r$/,''));pending=pending.slice(last+1);}}pending+=decoder.decode();if(pending)callback(pending.replace(/\r$/,''));
  }
  async function parseHistory(file,nodeList,route,graph){
    const trains=[],seen=new Set();let current=null,rows=0,checked=0,mismatches=[],missingLinks=0;
    await forEachLine(file,line=>{
      const header=line.match(/^\s*Run-time train:\s*(\S+)/i);if(header){const symbol=header[1].toUpperCase();if(seen.has(symbol))throw Error('Duplicate HISTORY run-time train symbol: '+symbol);seen.add(symbol);current={symbol,via:/^VIA-/i.test(symbol),events:[]};trains.push(current);return;}
      if(!current)return;const a=line.trim().split(/\s+/);if(a.length<=15||!/^\d+$/.test(a[0])||!/^\d+$/.test(a[1])||!/^[YN]$/.test(a[2]))return;
      const index=Number(a[0]),nodeNumber=Number(a[1]),node=nodeList[nodeNumber-1],arrival=Number(a[8]),departure=Number(a[10]),tailDeparture=Number(a[11]);
      if(!node)throw Error('HISTORY node index '+nodeNumber+' is outside the supplied NODE file.');if(!Number.isFinite(arrival)||!Number.isFinite(departure)||departure<arrival)throw Error('Invalid HISTORY time for '+current.symbol+' at route index '+index+'.');
      const last=current.events[current.events.length-1];if(last){if(arrival<last.departure)throw Error('Out-of-order HISTORY event time for '+current.symbol+' at route index '+index+'.');if(!graph.get(last.id)?.has(node.id))missingLinks++;}
      const expected=route.get(current.symbol+'|'+index);if(expected){checked++;if(expected.id!==node.id||expected.arrival!==arrival||expected.departure!==departure){if(mismatches.length<5)mismatches.push(current.symbol+' #'+index+': NODE '+node.id+' / ROUTE '+expected.id+', HISTORY '+arrival+'/'+departure+' / ROUTE '+expected.arrival+'/'+expected.departure);}}
      current.events.push({id:node.id,nodeNumber,index,arrival,departure,tailDeparture});rows++;
    });
    const usable=trains.filter(t=>t.events.length);if(!rows)throw Error('No run-time train records found in HISTORY.');if(!checked)throw Error('No HISTORY records could be checked against ROUTE. Check that both files belong to the same run.');if(mismatches.length)throw Error('HISTORY/NODE/ROUTE validation failed: '+mismatches.join('; '));return {trains:usable,rows,checked,missingLinks};
  }
  async function load(files,progress=()=>{}){
    const chosen=selectFiles(files),f=chosen.files;progress('Reading NODE…');const nodes=parseNodes(await f.get('NODE').text());progress('Reading LINK…');const links=parseLinks(await f.get('LINK').text(),nodes.byId);progress('Reading ROUTE…');const route=parseRoute(await f.get('ROUTE').text());progress('Reading and validating HISTORY…');const history=await parseHistory(f.get('HISTORY'),nodes.list,route,links.graph);return {name:chosen.name,nodes,links,history};
  }
  window.RTCModelLoader={selectFiles,parseNodes,parseLinks,parseRoute,parseHistory,load};
})();
