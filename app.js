const $=id=>document.getElementById(id);
const state={apiUrl:localStorage.getItem('ekossta_model_b_api_url')||'',dark:localStorage.getItem('ekossta_model_b_dark')==='1'};
function init(){
 $('apiUrl').value=state.apiUrl;
 if(state.dark){document.documentElement.classList.add('dark');$('themeBtn').textContent='☀️';}
 $('saveUrlBtn').onclick=saveUrl;$('healthBtn').onclick=health;$('loadBtn').onclick=loadMurid;$('refreshBtn').onclick=loadMurid;$('addBtn').onclick=addMurid;$('themeBtn').onclick=toggleTheme;
 if('serviceWorker' in navigator)navigator.serviceWorker.register('service-worker.js').catch(console.warn);
 if(state.apiUrl)health();
}
function saveUrl(){const u=$('apiUrl').value.trim();if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(u))return toast('URL Apps Script /exec tidak sah.');state.apiUrl=u;localStorage.setItem('ekossta_model_b_api_url',u);toast('URL disimpan.');}
function getUrl(){const u=$('apiUrl').value.trim()||state.apiUrl;if(!u)throw Error('Masukkan URL Apps Script Web App dahulu.');return u;}
function apiGet(action,params={}){
 return new Promise((resolve,reject)=>{
  let u;try{u=new URL(getUrl())}catch(e){reject(Error('URL backend tidak sah.'));return}
  const cb='__ekossta_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  const q=new URLSearchParams({action,callback:cb,...params}),s=document.createElement('script');
  s.src=u.origin+u.pathname+'?'+q;s.async=true;
  let timer;
  window[cb]=data=>{clearTimeout(timer);delete window[cb];s.remove();data&&data.ok===false?reject(Error(data.error||'Backend error.')):resolve(data)};
  s.onerror=()=>{clearTimeout(timer);delete window[cb];s.remove();reject(Error('Gagal menghubungi Apps Script. Semak deployment.'))};
  timer=setTimeout(()=>{delete window[cb];s.remove();reject(Error('Backend timeout.'))},15000);
  document.head.appendChild(s);
 });
}
async function health(){setStatus('loading','Menguji...');$('healthResult').textContent='Menghubungi Apps Script...';try{const d=await apiGet('health');setStatus('ok','ONLINE');$('apiState').textContent='ON';$('healthResult').textContent=d.app+' • Backend aktif • '+new Date(d.time).toLocaleString('ms-MY');toast('Sambungan berjaya.')}catch(e){setStatus('error','RALAT');$('apiState').textContent='OFF';$('healthResult').textContent=e.message;toast(e.message)}}
async function loadMurid(){try{const d=await apiGet('getMurid');const rows=d.data||[];render(rows);$('muridCount').textContent=rows.length;toast('Data dimuat: '+rows.length)}catch(e){toast(e.message)}}
function render(rows){const wrap=$('tableWrap');if(!rows.length){wrap.innerHTML='<div class="empty">Tiada data.</div>';return}const cols=['ID','NO_KP','NAMA','TINGKATAN','KELAS','STATUS'],t=document.createElement('table'),thead=document.createElement('thead'),hr=document.createElement('tr');cols.forEach(c=>{const th=document.createElement('th');th.textContent=c;hr.appendChild(th)});thead.appendChild(hr);t.appendChild(thead);const tb=document.createElement('tbody');rows.forEach(r=>{const tr=document.createElement('tr');cols.forEach(c=>{const td=document.createElement('td');td.textContent=r[c]??'';tr.appendChild(td)});tb.appendChild(tr)});t.appendChild(tb);wrap.replaceChildren(t)}
async function addMurid(){const b=$('addBtn'),p={nama:$('nama').value.trim(),noKp:$('noKp').value.trim(),tingkatan:$('tingkatan').value.trim(),kelas:$('kelas').value.trim()};if(Object.values(p).some(x=>!x))return toast('Lengkapkan semua medan.');b.disabled=true;b.textContent='⏳ Menyimpan...';try{const d=await apiGet('addMurid',p);$('addResult').textContent=d.message||'Berjaya.';['nama','noKp','tingkatan','kelas'].forEach(id=>$(id).value='');await loadMurid();toast('Murid ditambah.')}catch(e){$('addResult').textContent=e.message;toast(e.message)}finally{b.disabled=false;b.textContent='Tambah ke Google Sheet'}}
function setStatus(type,text){const e=$('statusBadge');e.className='status '+type;e.textContent=text}
function toggleTheme(){state.dark=!state.dark;document.documentElement.classList.toggle('dark',state.dark);localStorage.setItem('ekossta_model_b_dark',state.dark?'1':'0');$('themeBtn').textContent=state.dark?'☀️':'🌙'}
function toast(m){const e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),3200)}
document.addEventListener('DOMContentLoaded',init);