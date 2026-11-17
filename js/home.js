/* Yeni ana səhifə: statistika, xəritə, elanlar, kalkulyator, qrafik, donut */
(function(){
const q=s=>document.querySelector(s),en=n=>Math.round(n).toLocaleString("en-US");
const IC=["assets/images/ikon-ehali.png","assets/images/ikon-erazi.png","assets/images/ikon-torpaq.png","assets/images/ikon-elan.png"];
const sp=(c,pts)=>`<svg viewBox="0 0 96 34"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ST=[[0,18200,v=>en(v),"Ümumi əhali","+12%","#2e9e6b","0,30 20,22 40,26 60,14 80,18 96,6"],[1,1020000,v=>(v/1e6).toFixed(2)+"M m²","Boş ərazi","+8%","#2e9e6b","0,28 20,24 40,26 60,16 80,14 96,8"],[2,96,v=>en(v),"Torpaq sahəsi","+15%","#2a6fd6","0,30 20,26 40,20 60,22 80,12 96,6"],[3,11,v=>en(v),"Ev elanı","+20%","#ffb403","0,28 20,30 40,18 60,22 80,10 96,8"]];
q("#h2st").innerHTML=ST.map((x,i)=>`<div class="glass"><img class="ic" src="${IC[x[0]]}" alt=""><div><b data-i="${i}">0</b><small>${x[3]}</small></div><div class="tr" style="color:${x[5]}">↑ ${x[4]}${sp(x[5],x[6])}</div></div>`).join("");
q("#h2st").querySelectorAll("b[data-i]").forEach(b=>{const x=ST[+b.dataset.i],t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1300);b.textContent=x[2](x[1]*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)});
// elanlar
const LS=[["assets/images/elan-1.jpg","250,000 AZN","Xankəndi mərkəzi","180 m²","4 otaq"],["assets/images/elan-2.jpg","95,000 AZN","Ağdərə yolu","1.2 ha",""],["assets/images/elan-3.jpg","120,000 AZN","Şuşa küçəsi","90 m²","3 otaq"]];
q("#h2ls").innerHTML=LS.map(x=>`<div class="h2-l"><img src="${x[0]}" alt=""><div><b>${x[1]}</b><p class="lc">📍 ${x[2]}</p><p>⌂ ${x[3]}${x[4]?" &nbsp; ▭ "+x[4]:""}</p></div><button aria-label="Seç">♡</button></div>`).join("");
q("#h2ls").addEventListener("click",e=>{const b=e.target.closest("button");if(b){b.classList.toggle("on");b.textContent=b.classList.contains("on")?"♥":"♡"}});
// kalkulyator
const cc=()=>{const P0=+q("#hcA").value||0,n=+q("#hcY").value*12,i=+q("#hcR").value/1200;q("#hcO").textContent=en(i?P0*i/(1-Math.pow(1+i,-n)):P0/n)+" AZN"};["#hcA","#hcY","#hcR"].forEach(s=>q(s).oninput=cc);cc();
// qiymət qrafiki
const S={1:[1310,1325,1340,1362,1380,1395,1410,1428,1445,1462,1478,1490],3:[1180,1210,1250,1275,1300,1340,1365,1395,1420,1440,1465,1490],5:[1200,1215,1230,1250,1270,1330,1360,1340,1400,1425,1455,1488]};
function ch(y){const a=S[y],W=420,Ht=190,lo=Math.min(...a)-30,hi=Math.max(...a)+30,X=i=>8+i*(W-16)/11,Y=v=>Ht-20-(v-lo)/(hi-lo)*(Ht-50),pts=a.map((v,i)=>X(i).toFixed(1)+","+Y(v).toFixed(1)).join(" "),pc=(a[11]/a[0]-1)*100;
q("#h2ch").innerHTML=`<svg viewBox="0 0 ${W} ${Ht}" style="width:100%;display:block"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb403" stop-opacity=".4"/><stop offset="1" stop-color="#ffb403" stop-opacity=".04"/></linearGradient></defs>${[0,1,2,3].map(k=>`<line x1="0" x2="${W}" y1="${20+k*45}" y2="${20+k*45}" stroke="#e6ebf3"/>`).join("")}<polygon points="${X(0)},${Ht-20} ${pts} ${X(11)},${Ht-20}" fill="url(#cg)"/><polyline points="${pts}" fill="none" stroke="#ffb403" stroke-width="3" stroke-linejoin="round"/>${a.map((v,i)=>i%3==1||i==11?`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="#fff" stroke="#122848" stroke-width="2.5"/>`:"").join("")}<g transform="translate(${X(11)-52},${Y(a[11])-34})"><rect width="58" height="24" rx="8" fill="#122848"/><text x="29" y="16.5" font-size="13" font-weight="600" fill="#ffb403" text-anchor="middle">+${pc.toFixed(0)}%</text></g></svg>`;
q("#h2tb").querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.y==y))}
q("#h2tb").onclick=e=>{const b=e.target.closest("button");if(b)ch(b.dataset.y)};ch(5);
// donut
const tot=[42,34,24],sum=100,C=["#3b7dd8","#ffb403","#8cc4f3"],NM=["Mərkəz","Qarabağ","Ağdərə"],R=54,L=2*Math.PI*R;let o=0;
q("#h2dn").innerHTML=`<svg viewBox="0 0 140 140" width="150" height="150"><g transform="rotate(-90 70 70)" fill="none" stroke-width="26">${tot.map((t,i)=>{const l=t/sum*L,c=`<circle cx="70" cy="70" r="${R}" stroke="${C[i]}" stroke-dasharray="${l-1} ${L-l+1}" stroke-dashoffset="${-o}"/>`;o+=l;return c}).join("")}</g></svg><ul>${NM.map((n,i)=>`<li><i style="background:${C[i]}"></i>${n} – ${tot[i]}%</li>`).join("")}</ul>`;
try{if(localStorage.getItem("xq_dark")==="1")document.documentElement.classList.add("dark")}catch(e){}
q("#h2dk").onclick=()=>{const d=document.documentElement.classList.toggle("dark");try{localStorage.setItem("xq_dark",d?"1":"0")}catch(e){}};
// axtarış
q("#h2go").onclick=()=>{location.hash="#/panel/"+(q("#h2t").value||"home")};
})();
