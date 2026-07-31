/* ---------------- Terminal boot typing ---------------- */
const lines = [
  {p:'sifeddine@noc:~$ ', c:'whoami'},
  {p:'', c:'> Technicien Spécialisé Systèmes & Réseaux'},
  {p:'sifeddine@noc:~$ ', c:'systemctl status security-focus'},
  {p:'', c:'> SIEM · Zabbix · FortiGate · VMware ● active'},
];
const el = document.getElementById('typeline');
let li=0, ci=0, buffer='';
function typeStep(){
  if(li>=lines.length){ return; }
  const line = lines[li];
  const full = line.p+line.c;
  if(ci<=full.length){
    buffer += (ci===0? '\n':'') ;
    let html='';
    for(let i=0;i<=li;i++){
      const L=lines[i];
      const fullL=L.p+L.c;
      if(i<li){
        html += `<span class="prompt">${L.p}</span><span class="cmd">${L.c}</span>\n`;
      } else {
        const shown=fullL.slice(0,ci);
        const pShown = shown.slice(0,L.p.length);
        const cShown = shown.slice(L.p.length);
        html += `<span class="prompt">${pShown}</span><span class="cmd">${cShown}</span>`;
      }
    }
    el.innerHTML = html + '<span class="cursor"></span>';
    ci++;
    setTimeout(typeStep, 22+Math.random()*35);
  } else {
    li++; ci=0;
    setTimeout(typeStep, 260);
  }
}
setTimeout(typeStep, 400);

/* ---------------- scroll reveal ---------------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* language bars fill on reveal */
const langFills = document.querySelectorAll('.lang-fill');
const io2 = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll('.lang-fill').forEach(f=>{ f.style.width = f.dataset.w+'%'; });
      io2.disconnect();
    }
  });
},{threshold:0.3});
if(langFills.length) io2.observe(langFills[0]);

/* ---------------- network background canvas ---------------- */
const canvas = document.getElementById('netCanvas');
const ctx = canvas.getContext('2d');
let W,H,nodes=[];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = document.body.scrollHeight;
}
window.addEventListener('resize', resize);
resize();

const NODE_COUNT = Math.min(70, Math.floor(W*H/26000));
function initNodes(){
  nodes = [];
  for(let i=0;i<NODE_COUNT;i++){
    nodes.push({
      x: Math.random()*W,
      y: Math.random()*H,
      vx: (Math.random()-0.5)*0.18,
      vy: (Math.random()-0.5)*0.18,
      r: Math.random()*1.6+0.8,
      pulse: Math.random()*Math.PI*2
    });
  }
}
initNodes();

const LINK_DIST = 150;
let mouse = {x:-9999,y:-9999};
window.addEventListener('mousemove', e=>{
  mouse.x = e.clientX; mouse.y = e.clientY + window.scrollY;
});

function step(){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(37,224,190,0.14)';

  for(let i=0;i<nodes.length;i++){
    const n = nodes[i];
    n.x += n.vx; n.y += n.vy;
    if(n.x<0||n.x>W) n.vx*=-1;
    if(n.y<0||n.y>H) n.vy*=-1;
    n.pulse += 0.02;

    for(let j=i+1;j<nodes.length;j++){
      const m = nodes[j];
      const dx=n.x-m.x, dy=n.y-m.y;
      const d = Math.sqrt(dx*dx+dy*dy);
      if(d<LINK_DIST){
        const alpha = (1-d/LINK_DIST)*0.5;
        ctx.strokeStyle = `rgba(37,224,190,${alpha*0.35})`;
        ctx.beginPath();
        ctx.moveTo(n.x,n.y);
        ctx.lineTo(m.x,m.y);
        ctx.stroke();
      }
    }
    // node glow
    const glow = 0.5+0.5*Math.sin(n.pulse);
    ctx.beginPath();
    ctx.fillStyle = `rgba(37,224,190,${0.35+glow*0.35})`;
    ctx.arc(n.x,n.y,n.r+glow*0.8,0,Math.PI*2);
    ctx.fill();
  }

  if(!reduceMotion) requestAnimationFrame(step);
}
step();
if(reduceMotion){ ctx.clearRect(0,0,W,H); nodes.forEach(n=>{ ctx.beginPath(); ctx.fillStyle='rgba(37,224,190,0.4)'; ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill(); }); }

setTimeout(()=>{ resize(); initNodes(); }, 800); // recalc after layout settles