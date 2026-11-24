import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const flowText=readFileSync(new URL('./SmartCampus_NodeRED_Flow.json',import.meta.url),'utf8');
const flow=JSON.parse(flowText), fn=flow.find(n=>n.type==='function').func;
const code=vm.createContext({});
vm.runInContext(html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1],code);
const copy=x=>JSON.parse(JSON.stringify(x));
const local=x=>copy(vm.runInContext('checkRequest(input)',Object.assign(code,{input:x})));
const simulated=x=>{const c={msg:{payload:x}};vm.runInNewContext('(function(){'+fn+'\n})()',c,{timeout:200});return copy(c.msg.payload);};
const deployed=process.argv.includes('--node-red');
const remote=deployed ? async x=>{const r=await fetch('http://127.0.0.1:1880/campus/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)});assert.equal(r.status,200);return r.json();}:async x=>simulated(x);
const base={now:'09:00',blocked:false};
const cases=[['T1','11:00',60,false,true,'AVAILABLE'],['T2','10:30',60,false,false,'OVERLAP'],['T3','12:00',60,true,false,'ROOM_BLOCKED'],['T4','12:00',0,false,false,'INVALID_DURATION'],['T5','12:00',121,false,false,'DURATION_LIMIT'],['T6','08:30',60,false,false,'PAST_START'],['T7','14:00',60,false,true,'AVAILABLE']];
const security=[['S1',{start:'<b>invalid</b>',duration:60},'INVALID_TIME'],['S2',{start:"09:00' OR '1'='1",duration:60},'INVALID_TIME'],['S3',{start:'12:00',duration:'<b>60</b>'},'INVALID_DURATION'],['S4',{start:'12:00',duration:60,blocked:'false'},'INVALID_STATUS'],['S5',{start:'12:00',duration:1.5},'INVALID_DURATION'],['S6',{start:'23:30',duration:60},'INVALID_RANGE'],['S7',{start:'09:00',duration:60},'PAST_START'],['S8',{start:'12:00',duration:120},'AVAILABLE']];
const start=performance.now(), results=[];
const before=vm.runInContext('JSON.stringify(bookings)',code);
const bookingPage=deployed?await (await fetch('http://127.0.0.1:1880/campus')).text():flow.find(n=>n.type==='template').template;
for(const [id,s,d,b,a,r] of cases){const x={...base,start:s,duration:d,blocked:b};const c=local(x),l=await remote(x);const pass=z=>z.available===a&&z.reasonCode===r&&typeof z.message==='string'&&z.message.length>0;results.push({id,input:x,expected:r,code:c,low:l,codePass:pass(c),lowPass:pass(l)});}
const repeat={...base,start:'11:00',duration:60};
for(let i=0;i<3;i++){local(repeat);await remote(repeat);}
const afterPage=deployed?await (await fetch('http://127.0.0.1:1880/campus')).text():flow.find(n=>n.type==='template').template;
const codePass=before===vm.runInContext('JSON.stringify(bookings)',code),lowPass=bookingPage===afterPage&&flowText===readFileSync(new URL('./SmartCampus_NodeRED_Flow.json',import.meta.url),'utf8')&&bookingPage.includes('10:00')&&bookingPage.includes('15:00');
results.push({id:'T8',input:'Repeated checks',expected:'Bookings unchanged',code:{unchanged:codePass},low:{unchanged:lowPass},codePass,lowPass});
const checks=[];
for(const [id,x,r] of security){const a=local({...base,...x}),b=await remote({...base,...x});checks.push({id,expected:r,code:a.reasonCode,low:b.reasonCode,pass:a.reasonCode===r&&b.reasonCode===r});}
const report={environment:deployed?'Real Node-RED HTTP endpoints on localhost:1880':'Local execution of exact exported Function node (not a deployed Node-RED instance)',timestamp:new Date().toISOString(),results,security:checks,counts:{code:results.filter(r=>r.codePass).length,low:results.filter(r=>r.lowPass).length,security:checks.filter(r=>r.pass).length},elapsedMs:Math.round(performance.now()-start)};
console.log(report.environment);console.table(results.map(r=>({test:r.id,expected:r.expected,code:r.codePass?'PASS':'FAIL',low:r.lowPass?'PASS':'FAIL'})));console.table(checks);console.log(`Code ${report.counts.code}/8 | Low-code ${report.counts.low}/8 | Additional checks ${report.counts.security}/8`);console.log('Elapsed:',report.elapsedMs,'ms');writeFileSync(new URL(deployed?'./node-red-results.json':'./local-results.json',import.meta.url),JSON.stringify(report,null,2));if(report.counts.code!==8||report.counts.low!==8||report.counts.security!==8)process.exitCode=1;
