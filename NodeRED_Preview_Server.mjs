// Local preview harness: evaluates the exact Function node code in the supplied
// flow JSON. This is NOT a running Node-RED editor or deployment.
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const dir=dirname(fileURLToPath(import.meta.url));
const flow=JSON.parse(readFileSync(resolve(dir,'SmartCampus_NodeRED_Flow.json'),'utf8'));
const fn=flow.find(n=>n.type==='function').func;
const html=flow.find(n=>n.type==='template').template;
export function check(input){const context={msg:{payload:input}};vm.runInNewContext(`(function(){${fn}\n})()`,context,{timeout:200});return JSON.parse(JSON.stringify(context.msg.payload));}
export const server=createServer(async(req,res)=>{
  if(req.method==='GET' && req.url==='/campus') {res.writeHead(200,{'content-type':'text/html;charset=utf-8','cache-control':'no-store'});return res.end(html);}
  if(req.method==='POST' && req.url==='/campus/check') {
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>16384){res.writeHead(413);return res.end();}}
    try{const body=JSON.parse(raw);res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});return res.end(JSON.stringify(check(body)));}
    catch(e){res.writeHead(400,{'content-type':'application/json'});return res.end(JSON.stringify({error:'Invalid JSON payload'}));}
  }
  res.writeHead(404);res.end('Not found');
});
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||8765);server.listen(port,'127.0.0.1',()=>console.log('Node-RED flow local preview: http://127.0.0.1:'+port+'/campus'));
}
