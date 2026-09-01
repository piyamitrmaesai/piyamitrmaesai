const net = require('node:net');

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local')) return true;
  if (net.isIP(h)) {
    if (h.startsWith('10.') || h.startsWith('127.') || h.startsWith('169.254.') || h.startsWith('192.168.')) return true;
    const m = h.match(/^172\.(\d+)\./); if (m && +m[1] >= 16 && +m[1] <= 31) return true;
    if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80:')) return true;
  }
  return false;
}
function pick(html, property) {
  const esc = property.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${esc}["'][^>]*>`, 'i')
  ];
  for (const re of patterns) { const m=html.match(re); if(m) return decode(m[1]); }
  return '';
}
function decode(s=''){return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();}
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return {statusCode:405,body:JSON.stringify({error:'Method not allowed'})};
  try {
    const {url}=JSON.parse(event.body||'{}');
    const u=new URL(url);
    if (!['http:','https:'].includes(u.protocol) || isBlockedHost(u.hostname)) throw new Error('URL นี้ไม่อนุญาต');
    const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),8000);
    const res=await fetch(u.toString(),{redirect:'follow',signal:ctl.signal,headers:{'user-agent':'PCRC-Website-Metadata-Importer/1.0'}}); clearTimeout(t);
    if(!res.ok) throw new Error('ต้นทางตอบกลับ '+res.status);
    const type=res.headers.get('content-type')||''; if(!type.includes('text/html')) throw new Error('รองรับเฉพาะหน้าเว็บ HTML');
    const len=Number(res.headers.get('content-length')||0); if(len>2000000) throw new Error('หน้าเว็บมีขนาดใหญ่เกินไป');
    const html=(await res.text()).slice(0,2000000);
    const title=pick(html,'og:title') || decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'');
    const description=pick(html,'og:description') || pick(html,'description');
    let image=pick(html,'og:image'); try{if(image) image=new URL(image,u).toString()}catch{}
    return {statusCode:200,headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify({title,description,image,url:u.toString()})};
  } catch(e) { return {statusCode:400,headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify({error:e.message||'ไม่สามารถดึงข้อมูลได้'})}; }
};
