const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const rm=p=>fs.rmSync(p,{recursive:true,force:true});const mkdir=p=>fs.mkdirSync(p,{recursive:true});
const copy=(src,dst)=>{if(!fs.existsSync(src))return;const st=fs.statSync(src);if(st.isDirectory()){mkdir(dst);for(const f of fs.readdirSync(src))copy(path.join(src,f),path.join(dst,f));}else{mkdir(path.dirname(dst));fs.copyFileSync(src,dst)}};
const readJson=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(e){console.warn('Skip invalid JSON',p,e.message);return null}};
const readDir=(name)=>{const dir=path.join(root,'content',name);if(!fs.existsSync(dir))return[];return fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>{const x=readJson(path.join(dir,f));if(!x)return null;return {...x,slug:path.basename(f,'.json')}}).filter(Boolean)};
rm(dist);mkdir(dist);copy(path.join(root,'site'),dist);copy(path.join(root,'assets'),path.join(dist,'assets'));copy(path.join(root,'admin'),path.join(dist,'admin'));
let news=readDir('news').sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
let documents=readDir('documents').sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
let announcements=readDir('announcements').sort((a,b)=>String(b.start||'').localeCompare(String(a.start||'')));
let gallery=readDir('gallery').sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
let sources=readDir('sources').filter(x=>x.active!==false);
let pages=Object.fromEntries(readDir('pages').map(x=>[x.slug,x]));
let settings=readJson(path.join(root,'content/settings/site.json'))||{};
fs.writeFileSync(path.join(dist,'site-content.json'),JSON.stringify({generated_at:new Date().toISOString(),news,documents,announcements,gallery,sources,settings,pages},null,2));
for(const f of fs.readdirSync(dist).filter(f=>f.endsWith('.html'))){const p=path.join(dist,f);let h=fs.readFileSync(p,'utf8');h=h.replace(/\s*<script src="news-data\.js"><\/script>/g,'').replace(/\s*<script src="content-data\.js"><\/script>/g,'');if(!h.includes('site-content.js'))h=h.replace('</body>','<script src="site-content.js"></script>\n</body>');if(f==='index.html'&&!h.includes('netlify-identity-widget.js'))h=h.replace('</head>','<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>\n</head>');fs.writeFileSync(p,h)}
fs.writeFileSync(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: /sitemap.xml\n');
const sitemapPages=['','about.html','missions.html','news.html','volunteer.html','donate.html','downloads.html','contact.html'];const base=(process.env.URL||'https://YOUR-SITE.netlify.app').replace(/\/$/,'')+'/';fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+sitemapPages.map(p=>`  <url><loc>${base}${p}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`Built ${dist}`);console.log(`News: ${news.length}, docs: ${documents.length}, announcements: ${announcements.length}, galleries: ${gallery.length}`);
