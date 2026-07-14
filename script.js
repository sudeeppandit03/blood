// ---------- theme toggle ----------
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('bdn-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(saved === 'dark' || (!saved && prefersDark)){ root.setAttribute('data-theme', 'dark'); }
  const btn = document.getElementById('themeToggle');
  btn.addEventListener('click', ()=>{
    const isDark = root.getAttribute('data-theme') === 'dark';
    if(isDark){ root.removeAttribute('data-theme'); localStorage.setItem('bdn-theme', 'light'); }
    else{ root.setAttribute('data-theme', 'dark'); localStorage.setItem('bdn-theme', 'dark'); }
  });
})();

// ---------- scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.15});
revealEls.forEach(el=>io.observe(el));

// ---------- side rail nav ----------
const sections = document.querySelectorAll('section[id]');
const rail = document.getElementById('rail');
sections.forEach(sec=>{
  const b = document.createElement('button');
  b.dataset.target = sec.id;
  b.setAttribute('aria-label', sec.id.replace('s-',''));
  b.addEventListener('click', ()=> sec.scrollIntoView({behavior:'smooth'}));
  rail.appendChild(b);
});
const railBtns = rail.querySelectorAll('button');
const railObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    const btn = rail.querySelector(`[data-target="${e.target.id}"]`);
    if(e.isIntersecting){ railBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
  });
}, {threshold:0.5});
sections.forEach(s=>railObs.observe(s));

// ================= NEPAL ADMINISTRATIVE DATA =================
const PROVINCES = [
  {name:'Koshi Province', districts:['Bhojpur','Dhankuta','Ilam','Jhapa','Khotang','Morang','Okhaldhunga','Panchthar','Sankhuwasabha','Solukhumbu','Sunsari','Taplejung','Terhathum','Udayapur']},
  {name:'Madhesh Province', districts:['Bara','Dhanusha','Mahottari','Parsa','Rautahat','Saptari','Sarlahi','Siraha']},
  {name:'Bagmati Province', districts:['Bhaktapur','Chitwan','Dhading','Dolakha','Kathmandu','Kavrepalanchok','Lalitpur','Makwanpur','Nuwakot','Ramechhap','Rasuwa','Sindhuli','Sindhupalchok']},
  {name:'Gandaki Province', districts:['Baglung','Gorkha','Kaski','Lamjung','Manang','Mustang','Myagdi','Nawalpur','Parbat','Syangja','Tanahun']},
  {name:'Lumbini Province', districts:['Arghakhanchi','Banke','Bardiya','Dang','Eastern Rukum','Gulmi','Kapilvastu','Nawalparasi West (Parasi)','Palpa','Pyuthan','Rolpa','Rupandehi']},
  {name:'Karnali Province', districts:['Dailekh','Dolpa','Humla','Jajarkot','Jumla','Kalikot','Mugu','Salyan','Surkhet','Western Rukum']},
  {name:'Sudurpashchim Province', districts:['Achham','Baitadi','Bajhang','Bajura','Dadeldhura','Darchula','Doti','Kailali','Kanchanpur']}
];

function populateProvinceSelect(sel, includeAll){
  PROVINCES.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.name; opt.textContent = p.name;
    sel.appendChild(opt);
  });
}
const donorProvince = document.getElementById('donorProvince');
const donorDistrict = document.getElementById('donorDistrict');
const filterProvince = document.getElementById('filterProvince');
populateProvinceSelect(donorProvince);
populateProvinceSelect(filterProvince);

donorProvince.addEventListener('change', ()=>{
  const prov = PROVINCES.find(p=>p.name === donorProvince.value);
  donorDistrict.innerHTML = '';
  if(!prov){
    donorDistrict.innerHTML = '<option value="">Select province first</option>';
    donorDistrict.disabled = true;
    return;
  }
  donorDistrict.disabled = false;
  const first = document.createElement('option');
  first.value = ''; first.textContent = 'Select district';
  donorDistrict.appendChild(first);
  prov.districts.forEach(d=>{
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = d;
    donorDistrict.appendChild(opt);
  });
});

// ================= DONOR DATA =================
const STORAGE_KEY = 'bdn_donors';

const SAMPLE_DONORS = [
  {name:'Sujata Rai', phone:'9800000001', blood:'O+', province:'Koshi Province', district:'Sunsari', localType:'Sub-Metropolitan City', localName:'Itahari Sub-Metropolitan City', ward:'5', sample:true},
  {name:'Bikash Thapa', phone:'9800000002', blood:'B+', province:'Bagmati Province', district:'Kathmandu', localType:'Metropolitan City', localName:'Kathmandu Metropolitan City', ward:'10', sample:true},
  {name:'Anita Gurung', phone:'9800000003', blood:'A−', province:'Gandaki Province', district:'Kaski', localType:'Metropolitan City', localName:'Pokhara Metropolitan City', ward:'8', sample:true},
  {name:'Rajendra Yadav', phone:'9800000004', blood:'AB+', province:'Madhesh Province', district:'Dhanusha', localType:'Sub-Metropolitan City', localName:'Janakpur Sub-Metropolitan City', ward:'3', sample:true},
  {name:'Manisha Chaudhary', phone:'9800000005', blood:'O−', province:'Sudurpashchim Province', district:'Kailali', localType:'Sub-Metropolitan City', localName:'Dhangadhi Sub-Metropolitan City', ward:'12', sample:true},
  {name:'Prakash B.K.', phone:'9800000006', blood:'B−', province:'Lumbini Province', district:'Rupandehi', localType:'Municipality', localName:'Siddharthanagar Municipality', ward:'6', sample:true},
  {name:'Sarita Oli', phone:'9800000007', blood:'A+', province:'Karnali Province', district:'Surkhet', localType:'Municipality', localName:'Birendranagar Municipality', ward:'2', sample:true},
  {name:'Deepak Karki', phone:'9800000008', blood:'AB−', province:'Bagmati Province', district:'Lalitpur', localType:'Metropolitan City', localName:'Lalitpur Metropolitan City', ward:'14', sample:true}
];

function getStoredDonors(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e){ return []; }
}
function saveStoredDonors(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function getAllDonors(){
  return [...getStoredDonors(), ...SAMPLE_DONORS];
}

function bloodFamilyColor(blood){
  if(blood.startsWith('A') && !blood.startsWith('AB')) return 'var(--rose)';
  if(blood.startsWith('B')) return 'var(--gold)';
  if(blood.startsWith('AB')) return 'var(--maroon)';
  return 'var(--slate)';
}

// ================= TAB SWITCHING =================
const demoTabs = document.getElementById('demoTabs');
const tabBtns = demoTabs.querySelectorAll('button');
const viewRegister = document.getElementById('viewRegister');
const viewBrowse = document.getElementById('viewBrowse');

tabBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const view = btn.dataset.view;
    tabBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    demoTabs.classList.toggle('browse', view === 'browse');
    viewRegister.classList.toggle('active', view === 'register');
    viewBrowse.classList.toggle('active', view === 'browse');
    if(view === 'browse') renderDonorList();
  });
});

// ================= REGISTER FORM =================
const registerBtn = document.getElementById('registerBtn');
const registerMsg = document.getElementById('registerMsg');

registerBtn.addEventListener('click', ()=>{
  const name = document.getElementById('donorName').value.trim();
  const phone = document.getElementById('donorPhone').value.trim();
  const blood = document.getElementById('donorBlood').value;
  const province = donorProvince.value;
  const district = donorDistrict.value;
  const localType = document.getElementById('donorLocalType').value;
  const localName = document.getElementById('donorLocalName').value.trim();
  const ward = document.getElementById('donorWard').value.trim();

  const phoneOk = /^9\d{9}$/.test(phone);

  if(!name || !phoneOk || !blood || !province || !district || !localType || !localName){
    registerMsg.textContent = !phoneOk && phone ? 'Please enter a valid 10-digit phone number starting with 9.' : 'Please fill in every field before registering.';
    registerMsg.classList.remove('success');
    registerMsg.classList.remove('show');
    requestAnimationFrame(()=> registerMsg.classList.add('show'));
    return;
  }

  const donors = getStoredDonors();
  donors.push({name, phone, blood, province, district, localType, localName, ward, sample:false, registeredAt:new Date().toISOString()});
  saveStoredDonors(donors);

  registerMsg.textContent = `Thank you, ${name} — you're registered as a ${blood} donor in ${district}.`;
  registerMsg.classList.add('success');
  registerMsg.classList.remove('show');
  requestAnimationFrame(()=> registerMsg.classList.add('show'));

  ['donorName','donorPhone','donorLocalName','donorWard'].forEach(id=> document.getElementById(id).value = '');
  document.getElementById('donorBlood').value = '';
  document.getElementById('donorLocalType').value = '';
});

// ================= BROWSE / FILTER =================
const donorList = document.getElementById('donorList');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const filterBlood = document.getElementById('filterBlood');
const resetFilters = document.getElementById('resetFilters');
const clearMyData = document.getElementById('clearMyData');

function renderDonorList(){
  const provFilter = filterProvince.value;
  const bloodFilter = filterBlood.value;
  const all = getAllDonors();
  const matched = all.filter(d=>{
    return (!provFilter || d.province === provFilter) && (!bloodFilter || d.blood === bloodFilter);
  });

  donorList.innerHTML = '';
  resultsCount.textContent = `Showing ${matched.length} of ${all.length} registered donors`;

  if(matched.length === 0){
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  matched.forEach((d, i)=>{
    const card = document.createElement('div');
    card.className = 'donor-card';
    card.style.animationDelay = `${Math.min(i * 0.05, 0.4)}s`;
    card.innerHTML = `
      <div class="donor-top">
        <span class="donor-name">${escapeHtml(d.name)}</span>
        <span class="blood-badge" style="color:${bloodFamilyColor(d.blood)}; border-color:${bloodFamilyColor(d.blood)};">${escapeHtml(d.blood)}</span>
      </div>
      <div class="donor-loc">${escapeHtml(d.localName)}${d.ward ? ', Ward ' + escapeHtml(d.ward) : ''}<br>${escapeHtml(d.district)}, ${escapeHtml(d.province)}</div>
      <div class="donor-bottom">
        <a class="donor-phone" href="tel:${escapeHtml(d.phone)}">${escapeHtml(d.phone)}</a>
        ${d.sample ? '<span class="sample-tag">Sample</span>' : ''}
      </div>
    `;
    donorList.appendChild(card);
  });
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

filterProvince.addEventListener('change', renderDonorList);
filterBlood.addEventListener('change', renderDonorList);
resetFilters.addEventListener('click', ()=>{
  filterProvince.value = '';
  filterBlood.value = '';
  renderDonorList();
});
clearMyData.addEventListener('click', ()=>{
  if(getStoredDonors().length === 0){
    registerMsg.textContent = '';
    renderDonorList();
    return;
  }
  const confirmed = confirm('This removes only the donors you registered on this device. Sample donors will remain. Continue?');
  if(confirmed){
    saveStoredDonors([]);
    renderDonorList();
  }
});

renderDonorList();

// Disable Right Click
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

// Disable Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    // Ctrl+U (View Source)
    if (e.ctrlKey && key === "u") {
        e.preventDefault();
    }

    // Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && key === "i") {
        e.preventDefault();
    }

    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && key === "j") {
        e.preventDefault();
    }

    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && key === "c") {
        e.preventDefault();
    }

    // Ctrl+S (Save Page)
    if (e.ctrlKey && key === "s") {
        e.preventDefault();
    }

    // Ctrl+P (Print)
    if (e.ctrlKey && key === "p") {
        e.preventDefault();
    }

    // F12 (Developer Tools)
    if (e.key === "F12") {
        e.preventDefault();
    }

    // Ctrl+Shift+K (Firefox Console)
    if (e.ctrlKey && e.shiftKey && key === "k") {
        e.preventDefault();
    }

    // Ctrl+Shift+E (Firefox Network Monitor)
    if (e.ctrlKey && e.shiftKey && key === "e") {
        e.preventDefault();
    }
});