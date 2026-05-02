// ===== SEVABRIDGE APP LOGIC =====

let currentScreen = 'dashboard';
let currentFilter = 'all';
let mapFilter = 'all';
let loginRole = 'admin';
let navHistory = [];

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  // Splash → Login
  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('splash').classList.add('hidden');
      document.getElementById('login').classList.remove('hidden');
    }, 500);
  }, 2000);

  // Role chips
  document.querySelectorAll('.role-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loginRole = chip.dataset.role;
    });
  });

  // Set today's date
  const now = new Date();
  const opts = {weekday:'long',year:'numeric',month:'long',day:'numeric'};
  const ds = now.toLocaleDateString('en-IN', opts);
  document.getElementById('heroDate').textContent = ds;

  const hr = now.getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('heroGreeting').textContent = `${greet}, Ananya`;
});

// ===== LOGIN =====
function doLogin() {
  const e = document.getElementById('loginEmail').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  if (!e || !p) { showToast('Please enter email and password', 'error'); return; }
  document.getElementById('login').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  renderDashboard();
  navigateTo('dashboard');
  showToast('Welcome back, Ananya! 🎉', 'success');
}

function doLogout() {
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');
  toggleProfile();
  showToast('Signed out successfully');
}

// ===== NAVIGATION =====
function navigateTo(screen) {
  if (currentScreen === screen) return;
  navHistory.push(currentScreen);
  currentScreen = screen;

  // Hide all screens
  document.querySelectorAll('.screen-page').forEach(s => s.classList.add('hidden'));
  document.getElementById(`screen-${screen}`).classList.remove('hidden');

  // Update bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });

  // Update topbar
  const titles = {
    dashboard: ['SevaBridge', 'Bengaluru Operations'],
    map: ['Aid Map', 'Bengaluru · 8 locations'],
    donors: ['Donors', '14 contributors this month'],
    staff: ['Field Staff', '18 active members'],
    alerts: ['Alerts', '3 unread notifications'],
    reports: ['Reports', 'Operations analytics'],
  };
  document.getElementById('pageTitle').textContent = titles[screen][0];
  document.getElementById('pageSubtitle').textContent = titles[screen][1];

  // Show/hide back button
  const backBtn = document.getElementById('backBtn');
  if (navHistory.length > 0 && screen !== 'dashboard') {
    backBtn.classList.remove('hidden');
  } else {
    backBtn.classList.add('hidden');
    navHistory = [];
  }

  // Render screen
  const renderers = {
    dashboard: renderDashboard,
    map: renderMap,
    donors: renderDonors,
    staff: renderStaff,
    alerts: renderAlerts,
    reports: renderReports,
  };
  if (renderers[screen]) renderers[screen]();
}

function goBack() {
  if (navHistory.length > 0) {
    const prev = navHistory.pop();
    currentScreen = 'x'; // Force re-render
    navigateTo(prev);
    navHistory.pop(); // Remove the one navigateTo just added
  }
}

// ===== DASHBOARD =====
function renderDashboard() {
  // Urgent list
  const urgent = DB.locations.filter(l => l.urgency === 'urgent').slice(0, 3);
  const ul = document.getElementById('urgentList');
  ul.innerHTML = urgent.map(loc => `
    <div class="card loc-card" onclick="navigateTo('map')">
      <div class="loc-icon" style="background:${loc.urgency==='urgent'?'#FDEAEB':'#FDF0E4'}">${loc.icon}</div>
      <div class="loc-info">
        <div class="loc-name">${loc.name}</div>
        <div class="loc-meta">${loc.area} · ${loc.needs.join(', ')}</div>
      </div>
      <div style="text-align:right">
        <span class="badge badge-urgent">Urgent</span>
        <div style="font-size:10px;color:var(--muted);margin-top:3px">${loc.people} people</div>
      </div>
    </div>`).join('');

  // Activity
  const af = document.getElementById('activityFeed');
  af.innerHTML = `<div class="card" style="padding:0 14px">` +
    DB.alerts.slice(0,4).map(a => {
      const colors = {urgent:'var(--red)',donation:'#C97C35',info:'var(--blue)',success:'var(--green)'};
      return `<div class="act-item">
        <div class="act-dot" style="background:${colors[a.type]||'var(--muted)'}"></div>
        <div class="act-msg">${a.msg}</div>
        <div class="act-time">${a.time}</div>
      </div>`;
    }).join('') + `</div>`;

  // Animate KPIs
  animateCount('kpiAided', 247);
  animateCount('kpiUrgent', 63);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = target / 30;
  const t = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start);
    if (start >= target) clearInterval(t);
  }, 30);
}

// ===== MAP =====
function renderMap() {
  renderPins();
  renderLocationCards();
}

function renderPins() {
  const layer = document.getElementById('pinLayer');
  layer.innerHTML = '';
  const filtered = DB.locations.filter(l => mapFilter === 'all' || l.urgency === mapFilter ||
    l.needs.map(n=>n.toLowerCase()).includes(mapFilter));

  const urgencyColors = {urgent:'#E05C5C', moderate:'#D4894A', assisted:'#5BA877'};

  filtered.forEach(loc => {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('style','cursor:pointer');

    const outer = document.createElementNS('http://www.w3.org/2000/svg','circle');
    outer.setAttribute('cx', loc.x); outer.setAttribute('cy', loc.y);
    outer.setAttribute('r','10'); outer.setAttribute('fill', urgencyColors[loc.urgency] || '#888');
    outer.setAttribute('stroke','white'); outer.setAttribute('stroke-width','2.5');

    const inner = document.createElementNS('http://www.w3.org/2000/svg','circle');
    inner.setAttribute('cx', loc.x); inner.setAttribute('cy', loc.y);
    inner.setAttribute('r','4'); inner.setAttribute('fill','white');

    const pulse = document.createElementNS('http://www.w3.org/2000/svg','circle');
    pulse.setAttribute('cx', loc.x); pulse.setAttribute('cy', loc.y);
    pulse.setAttribute('r','10'); pulse.setAttribute('fill', urgencyColors[loc.urgency]);
    pulse.setAttribute('opacity','0.3');
    if (loc.urgency === 'urgent') {
      pulse.innerHTML = `<animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>`;
    }

    g.appendChild(pulse);
    g.appendChild(outer);
    g.appendChild(inner);

    g.addEventListener('click', (e) => showMapTooltip(loc, e));
    layer.appendChild(g);
  });
}

function showMapTooltip(loc, e) {
  const tt = document.getElementById('mapTooltip');
  const needBadge = `<span class="badge badge-${loc.urgency}">${loc.urgency.charAt(0).toUpperCase()+loc.urgency.slice(1)}</span>`;
  tt.innerHTML = `
    <div class="tt-name">${loc.name}</div>
    <div class="tt-row">${loc.area} · ${loc.people} people</div>
    <div class="tt-row" style="margin-top:3px">${loc.needs.join(', ')}</div>
    <div style="margin-top:6px;display:flex;align-items:center;gap:6px">${needBadge}
      <button onclick="closeTooltip()" style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:11px;color:var(--muted)">✕</button>
    </div>`;
  const mapW = document.getElementById('map-canvas') || document.querySelector('.map-wrap');
  let left = loc.x + 14;
  let top = loc.y + 14;
  if (left + 160 > 370) left = loc.x - 165;
  if (top + 100 > 250) top = loc.y - 105;
  tt.style.left = left + 'px';
  tt.style.top = top + 'px';
  tt.classList.remove('hidden');
  e.stopPropagation();
  document.querySelector('.map-wrap').addEventListener('click', closeTooltip, {once:true});
}
function closeTooltip() { document.getElementById('mapTooltip').classList.add('hidden'); }

function filterMap(type, el) {
  document.querySelectorAll('.filter-scroll .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  mapFilter = type;
  renderPins();
  renderLocationCards();
}

function renderLocationCards() {
  const filtered = DB.locations.filter(l => mapFilter === 'all' || l.urgency === mapFilter ||
    l.needs.map(n=>n.toLowerCase()).includes(mapFilter));
  document.getElementById('locCount').textContent = filtered.length;

  const urgencyOrder = {urgent:0, moderate:1, assisted:2};
  const sorted = [...filtered].sort((a,b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  document.getElementById('locationCards').innerHTML = sorted.map(loc => `
    <div class="card loc-card" onclick="openLocationDetail(${loc.id})">
      <div class="loc-icon" style="background:${loc.urgency==='urgent'?'#FDEAEB':loc.urgency==='moderate'?'#FDF0E4':'#EAF3EE'}">${loc.icon}</div>
      <div class="loc-info">
        <div class="loc-name">${loc.name}</div>
        <div class="loc-meta">${loc.area} · ${loc.needs.join(' + ')}</div>
        <div style="font-size:11px;color:var(--blue);margin-top:2px">👤 ${loc.assigned}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <span class="badge badge-${loc.urgency}">${loc.urgency.charAt(0).toUpperCase()+loc.urgency.slice(1)}</span>
        <div style="font-size:10px;color:var(--muted);margin-top:4px">${loc.people} people</div>
      </div>
    </div>`).join('');
}

function openLocationDetail(id) {
  const loc = DB.locations.find(l => l.id === id);
  if (!loc) return;
  const needBadge = `<span class="badge badge-${loc.urgency}" style="font-size:11px;padding:4px 11px">${loc.urgency.toUpperCase()}</span>`;
  openModal(`
    <div class="modal-title">${loc.icon} ${loc.name}</div>
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
      ${needBadge}
      ${loc.needs.map(n=>`<span class="badge" style="background:var(--blue-l);color:var(--blue)">${n}</span>`).join('')}
    </div>
    <div class="card" style="margin-bottom:12px;background:var(--bg)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">Area</div><div style="font-size:13px;font-weight:600;margin-top:2px">${loc.area}</div></div>
        <div><div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">People</div><div style="font-size:13px;font-weight:600;margin-top:2px">${loc.people} beneficiaries</div></div>
        <div><div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">Assigned</div><div style="font-size:13px;font-weight:600;margin-top:2px;color:var(--blue)">${loc.assigned}</div></div>
        <div><div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">Contact</div><div style="font-size:13px;font-weight:600;margin-top:2px">${loc.contact}</div></div>
      </div>
    </div>
    <p style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px">${loc.desc}</p>
    <div style="display:flex;gap:8px">
      <button class="btn-primary" style="flex:1" onclick="closeModal();showToast('Staff dispatch request sent ✓','success')">Dispatch Staff</button>
      <button class="btn-outline" onclick="closeModal();showToast('Aid request logged ✓','success')">Log Aid</button>
    </div>`);
}

// ===== DONORS =====
function renderDonors() {
  filterDonors('all', document.querySelector('#screen-donors .chip.active') || document.querySelector('#screen-donors .chip'));
}

function filterDonors(type, el) {
  if(el){document.querySelectorAll('#screen-donors .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');}
  const filtered = type === 'all' ? DB.donors : DB.donors.filter(d=>d.type===type);
  const container = document.getElementById('donorCards');
  container.innerHTML = filtered.map(d => {
    const pct = Math.round(d.donated/d.goal*100);
    return `<div class="card donor-card" onclick="openDonorDetail(${d.id})">
      <div class="donor-header">
        <div class="donor-avatar" style="background:${d.color}22;color:${d.color}">${d.avatar}</div>
        <div>
          <div class="donor-name">${d.name}</div>
          <div class="donor-type">${d.type.charAt(0).toUpperCase()+d.type.slice(1)} · Since ${d.since}</div>
        </div>
      </div>
      <div class="donor-stats-row">
        <div class="d-s"><div class="d-s-val">₹${(d.donated/1000).toFixed(0)}K</div><div class="d-s-lbl">Donated</div></div>
        <div class="d-s"><div class="d-s-val">${pct}%</div><div class="d-s-lbl">of Goal</div></div>
        <div class="d-s"><div class="d-s-val">${d.lastDonation}</div><div class="d-s-lbl">Last Gift</div></div>
      </div>
      <div class="prog-track"><div class="prog-fill" style="width:${pct}%;background:${d.color}"></div></div>
    </div>`;
  }).join('');
}

function openDonorDetail(id){
  const d = DB.donors.find(x=>x.id===id);
  if(!d) return;
  openModal(`
    <div style="display:flex;align-items:center;gap:13px;margin-bottom:18px">
      <div class="donor-avatar" style="background:${d.color}22;color:${d.color};width:56px;height:56px;font-size:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">${d.avatar}</div>
      <div><div class="modal-title" style="margin-bottom:2px">${d.name}</div><div style="font-size:12px;color:var(--muted)">${d.type} · Since ${d.since}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="d-s card"><div class="d-s-val" style="font-size:18px">₹${(d.donated/1000).toFixed(0)}K</div><div class="d-s-lbl">Total Donated</div></div>
      <div class="d-s card"><div class="d-s-val" style="font-size:18px">₹${(d.goal/1000).toFixed(0)}K</div><div class="d-s-lbl">Annual Goal</div></div>
    </div>
    <div class="card" style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:8px">Contact Details</div>
      <div style="font-size:13px;margin-bottom:5px">📞 ${d.phone}</div>
      <div style="font-size:13px">✉️ ${d.email}</div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:8px">Donated Items</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${d.items.map(i=>`<span style="background:var(--green-l);color:var(--green-d);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500">${i}</span>`).join('')}</div>
    </div>
    <button class="btn-primary" onclick="closeModal();showToast('Donation request sent to ${d.short} ✓','success')">Request Donation</button>`);
}

// ===== STAFF =====
function renderStaff() {
  filterStaff('all', null);
}

function filterStaff(type, el) {
  if(el){document.querySelectorAll('#screen-staff .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');}
  let filtered = DB.staff;
  if(type==='active') filtered = DB.staff.filter(s=>s.active);
  else if(type==='coordinator') filtered = DB.staff.filter(s=>s.role.toLowerCase().includes('coordinator'));
  else if(type==='medical') filtered = DB.staff.filter(s=>s.role.toLowerCase().includes('medical')||s.role.toLowerCase().includes('health'));
  else if(type==='volunteer') filtered = DB.staff.filter(s=>s.role.toLowerCase().includes('volunteer'));

  document.getElementById('staffCards').innerHTML = filtered.map(s=>`
    <div class="card" onclick="openStaffDetail(${s.id})" style="cursor:pointer;transition:border-color .2s" onmouseover="this.style.borderColor='var(--green)'" onmouseout="this.style.borderColor='var(--border)'">
      <div class="staff-card-inner">
        <div class="staff-avatar ${s.active?'online-ring':'offline-ring'}" style="background:${s.color}22;color:${s.color}">${s.avatar}</div>
        <div class="staff-info">
          <div class="staff-name">${s.name}</div>
          <div class="staff-role">${s.role}</div>
          <div class="staff-zone">📍 ${s.zone}</div>
        </div>
        <span class="staff-task-pill">${s.task}</span>
      </div>
    </div>`).join('');
}

function openStaffDetail(id){
  const s = DB.staff.find(x=>x.id===id);
  if(!s) return;
  openModal(`
    <div style="display:flex;align-items:center;gap:13px;margin-bottom:18px">
      <div style="position:relative">
        <div style="width:56px;height:56px;border-radius:50%;background:${s.color}22;color:${s.color};font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;${s.active?'outline:2.5px solid #5AB86C;outline-offset:3px':'outline:2.5px solid #B0BCC4;outline-offset:3px'}">${s.avatar}</div>
      </div>
      <div>
        <div class="modal-title" style="margin-bottom:2px">${s.name}</div>
        <div style="font-size:12px;color:var(--muted)">${s.role}</div>
        <div style="font-size:12px;margin-top:3px"><span style="background:${s.active?'var(--green-l)':'var(--bg)'};color:${s.active?'var(--green-d)':'var(--muted)'};padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700">${s.active?'● ACTIVE':'○ OFF DUTY'}</span></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
      <div class="d-s card"><div class="d-s-val">${s.cases}</div><div class="d-s-lbl">Cases</div></div>
      <div class="d-s card"><div class="d-s-val">${s.since.split(' ')[1]||s.since}</div><div class="d-s-lbl">Joined</div></div>
      <div class="d-s card"><div class="d-s-val">${s.active?'Field':'Office'}</div><div class="d-s-lbl">Status</div></div>
    </div>
    <div class="card" style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;margin-bottom:8px">Current Assignment</div>
      <div style="font-size:13px;font-weight:600">📍 ${s.zone}</div>
      <div style="font-size:13px;margin-top:5px;color:var(--green-d)">✅ ${s.task}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn-primary" style="flex:1" onclick="closeModal();showToast('Message sent to ${s.name} ✓','success')">Message</button>
      <button class="btn-outline" onclick="closeModal();openAssignModal(${s.id})">Assign Task</button>
    </div>`);
}

function openAssignModal(staffId) {
  const s = DB.staff.find(x=>x.id===staffId);
  openModal(`
    <div class="modal-title">Assign Task</div>
    <p style="font-size:13px;color:var(--muted);margin-bottom:14px">Assigning to: <strong>${s.name}</strong></p>
    <div class="form-field"><label>Task Description</label><input type="text" id="taskDesc" placeholder="e.g. Food distribution at BTM Layout"/></div>
    <div class="form-field"><label>Location</label>
      <select id="taskLoc">${DB.locations.map(l=>`<option>${l.name} (${l.area})</option>`).join('')}</select>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Date</label><input type="date" id="taskDate"/></div>
      <div class="form-field"><label>Time</label><input type="time" id="taskTime" value="09:00"/></div>
    </div>
    <button class="btn-primary mt12" onclick="submitTask(${staffId})">Assign Task</button>`);
}

function submitTask(staffId) {
  const desc = document.getElementById('taskDesc').value;
  if(!desc){showToast('Please enter a task description','error');return;}
  const s = DB.staff.find(x=>x.id===staffId);
  s.task = desc;
  saveDB();
  closeModal();
  showToast(`Task assigned to ${s.name} ✓`,'success');
  renderStaff();
}

// ===== ALERTS =====
function renderAlerts() {
  filterAlerts('all', null);
}

function filterAlerts(type, el) {
  if(el){document.querySelectorAll('#screen-alerts .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');}
  const filtered = type==='all'?DB.alerts:DB.alerts.filter(a=>a.type===type||a.type===type.replace('donation','donation'));
  const bgMap = {urgent:'alert-urgent',donation:'alert-donation',info:'alert-info',success:'alert-success'};
  const colorMap = {urgent:'var(--red)',donation:'var(--amber)',info:'var(--blue)',success:'var(--green-d)'};
  const iconMap = {urgent:'🚨',donation:'💛',info:'ℹ️',success:'✅'};

  document.getElementById('alertCards').innerHTML = filtered.map(a=>`
    <div class="alert-card ${bgMap[a.type]||'alert-info'}">
      <div class="al-top">
        <span class="al-type" style="color:${colorMap[a.type]}">${iconMap[a.type]} ${a.type}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="al-time">${a.time}</span>
          ${!a.read?'<div class="al-unread"></div>':''}
        </div>
      </div>
      <div class="al-msg">${a.msg}</div>
      ${a.type==='urgent'?`<div class="al-actions"><button class="btn-primary btn-sm" onclick="closeAlert(${a.id})">Acknowledge</button><button class="btn-outline btn-sm" onclick="navigateTo('map')">View on Map</button></div>`:''}
    </div>`).join('');

  document.getElementById('notifBadge').textContent = DB.alerts.filter(a=>!a.read).length;
}

function closeAlert(id) {
  const a = DB.alerts.find(x=>x.id===id);
  if(a) a.read = true;
  saveDB();
  renderAlerts();
  showToast('Alert acknowledged ✓','success');
}

function markAllRead() {
  DB.alerts.forEach(a=>a.read=true);
  saveDB();
  renderAlerts();
  showToast('All alerts marked as read ✓','success');
}

// ===== REPORTS =====
function renderReports() {
  renderBarChart();
  renderPieChart();
}

function renderBarChart() {
  const max = Math.max(...DB.weeklyStats.map(d=>d.count));
  const container = document.getElementById('barChart');
  container.innerHTML = DB.weeklyStats.map(d=>`
    <div class="bar-col">
      <div class="bar-val">${d.count}</div>
      <div class="bar" style="height:${Math.round(d.count/max*80)}px"></div>
      <div class="bar-lbl">${d.day}</div>
    </div>`).join('');
}

function renderPieChart() {
  const svg = document.getElementById('pieSvg');
  svg.innerHTML = '';
  const cx=70, cy=60, r=50;
  let angle = -Math.PI/2;
  const total = DB.donationCategories.reduce((s,d)=>s+d.pct,0);
  const legend = [];

  DB.donationCategories.forEach((cat,i) => {
    const slice = (cat.pct/total)*2*Math.PI;
    const x1 = cx + r*Math.cos(angle);
    const y1 = cy + r*Math.sin(angle);
    const x2 = cx + r*Math.cos(angle+slice);
    const y2 = cy + r*Math.sin(angle+slice);
    const large = slice>Math.PI?1:0;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`);
    path.setAttribute('fill',cat.color);
    path.setAttribute('stroke','white');
    path.setAttribute('stroke-width','2');
    svg.appendChild(path);
    // Mid angle label
    const mid = angle + slice/2;
    const lx = cx + (r*0.65)*Math.cos(mid);
    const ly = cy + (r*0.65)*Math.sin(mid);
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x',lx); txt.setAttribute('y',ly+4);
    txt.setAttribute('text-anchor','middle');
    txt.setAttribute('font-size','9'); txt.setAttribute('fill','white');
    txt.setAttribute('font-weight','700');
    txt.textContent = cat.pct+'%';
    svg.appendChild(txt);
    angle += slice;
    // Legend
    legend.push(`<div style="display:flex;align-items:center;gap:6px;font-size:11px"><div style="width:10px;height:10px;border-radius:50%;background:${cat.color};flex-shrink:0"></div>${cat.label} (${cat.pct}%)</div>`);
  });

  // Legend group on the right
  const fO = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
  fO.setAttribute('x','140'); fO.setAttribute('y','20');
  fO.setAttribute('width','60'); fO.setAttribute('height','90');
  fO.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;flex-direction:column;gap:8px">${legend.join('')}</div>`;
  svg.appendChild(fO);
}

function showReport(type) {
  const titles = {weekly:'Weekly Summary',zone:'Zone Coverage Report',donor:'Donor Contributions',staff:'Staff Performance'};
  showToast(`Opening ${titles[type]}...`,'info');
}

// ===== MODALS =====
function openModal(content) {
  document.getElementById('modalContent').innerHTML = content;
  document.getElementById('modalBackdrop').classList.remove('hidden');
  document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if(e.target===document.getElementById('modalBackdrop')) closeModal();
  }, {once:true});
}
function closeModal() {
  document.getElementById('modalBackdrop').classList.add('hidden');
}

// ===== ADD MODALS =====
function openAddModal() {
  openModal(`
    <div class="modal-title">Quick Add</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="report-card" onclick="closeModal();openAddLocationModal()"><div class="rc-icon">📍</div><div class="rc-title">Aid Location</div></div>
      <div class="report-card" onclick="closeModal();openAddDonorModal()"><div class="rc-icon">💛</div><div class="rc-title">Donor</div></div>
      <div class="report-card" onclick="closeModal();openAddStaffModal()"><div class="rc-icon">👤</div><div class="rc-title">Staff</div></div>
      <div class="report-card" onclick="closeModal();navigateTo('alerts')"><div class="rc-icon">🚨</div><div class="rc-title">Report Need</div></div>
    </div>`);
}

function openAddLocationModal() {
  openModal(`
    <div class="modal-title">📍 Add Aid Location</div>
    <div class="form-field"><label>Location Name</label><input type="text" id="locName" placeholder="e.g. Bannerghatta Road Camp"/></div>
    <div class="form-row">
      <div class="form-field"><label>Area / Zone</label><input type="text" id="locArea" placeholder="Bannerghatta"/></div>
      <div class="form-field"><label>People Count</label><input type="number" id="locPeople" placeholder="25"/></div>
    </div>
    <div class="form-field"><label>Aid Needed</label>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:4px">
        ${['Food','Medical','Shelter','Education','Clothing'].map(n=>`<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" value="${n}"/> ${n}</label>`).join('')}
      </div>
    </div>
    <div class="form-field"><label>Urgency</label>
      <select id="locUrgency"><option value="urgent">Urgent</option><option value="moderate">Moderate</option><option value="assisted">Being Assisted</option></select>
    </div>
    <div class="form-field"><label>Contact Number</label><input type="tel" id="locContact" placeholder="9XXXXXXXXX"/></div>
    <div class="form-field"><label>Notes</label><textarea id="locNotes" placeholder="Additional details about the location..."></textarea></div>
    <button class="btn-primary mt12" onclick="submitLocation()">Add Location</button>`);
}

function submitLocation() {
  const name = document.getElementById('locName').value.trim();
  const area = document.getElementById('locArea').value.trim();
  if(!name||!area){showToast('Please fill location name and area','error');return;}
  const needs = [...document.querySelectorAll('#modalContent input[type=checkbox]:checked')].map(c=>c.value);
  const newLoc = {
    id: DB.locations.length+1, name, area,
    needs: needs.length?needs:['Food'],
    urgency: document.getElementById('locUrgency').value,
    people: parseInt(document.getElementById('locPeople').value)||0,
    x: Math.round(Math.random()*280+50), y: Math.round(Math.random()*180+40),
    icon:'📍', assigned:'Unassigned',
    desc: document.getElementById('locNotes').value,
    contact: document.getElementById('locContact').value
  };
  DB.locations.push(newLoc);
  saveDB();
  closeModal();
  showToast(`${name} added to aid map ✓`,'success');
  if(currentScreen==='map') renderMap();
}

function openAddDonorModal() {
  openModal(`
    <div class="modal-title">💛 Add Donor</div>
    <div class="form-field"><label>Full Name / Organisation</label><input type="text" id="dName" placeholder="e.g. Sunita Rao"/></div>
    <div class="form-field"><label>Type</label>
      <select id="dType"><option value="individual">Individual</option><option value="corporate">Corporate</option><option value="trust">Trust / NGO</option></select>
    </div>
    <div class="form-row">
      <div class="form-field"><label>Phone</label><input type="tel" id="dPhone" placeholder="9XXXXXXXXX"/></div>
      <div class="form-field"><label>Email</label><input type="email" id="dEmail" placeholder="donor@email.com"/></div>
    </div>
    <div class="form-field"><label>Annual Donation Goal (₹)</label><input type="number" id="dGoal" placeholder="10000"/></div>
    <button class="btn-primary mt12" onclick="submitDonor()">Add Donor</button>`);
}

function submitDonor() {
  const name = document.getElementById('dName').value.trim();
  if(!name){showToast('Please enter donor name','error');return;}
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const colors=['#3A6FA8','#3E7B52','#C97C35','#8A5BA8','#3B8C7A'];
  const newDonor = {
    id:DB.donors.length+1, name, short:name.split(' ').slice(0,2).join(' '),
    type:document.getElementById('dType').value,
    avatar:initials, color:colors[DB.donors.length%colors.length],
    donated:0, goal:parseInt(document.getElementById('dGoal').value)||10000,
    phone:document.getElementById('dPhone').value,
    email:document.getElementById('dEmail').value,
    since:new Date().toLocaleString('en-IN',{month:'short',year:'numeric'}),
    items:[], lastDonation:'—'
  };
  DB.donors.push(newDonor);
  saveDB();
  closeModal();
  showToast(`${name} added as donor ✓`,'success');
  if(currentScreen==='donors') renderDonors();
}

function openAddStaffModal() {
  openModal(`
    <div class="modal-title">👤 Add Staff</div>
    <div class="form-row">
      <div class="form-field"><label>First Name</label><input type="text" id="sFirst" placeholder="Rohit"/></div>
      <div class="form-field"><label>Last Name</label><input type="text" id="sLast" placeholder="Sharma"/></div>
    </div>
    <div class="form-field"><label>Role</label>
      <select id="sRole">
        <option>Field Coordinator</option><option>Medical Officer</option><option>Social Worker</option>
        <option>Community Outreach</option><option>Education Officer</option><option>Volunteer Lead</option><option>Driver / Logistics</option>
      </select>
    </div>
    <div class="form-field"><label>Assigned Zone</label><input type="text" id="sZone" placeholder="e.g. Jayanagar"/></div>
    <div class="form-field"><label>Phone</label><input type="tel" id="sPhone" placeholder="9XXXXXXXXX"/></div>
    <button class="btn-primary mt12" onclick="submitStaff()">Add Staff Member</button>`);
}

function submitStaff(){
  const first = document.getElementById('sFirst').value.trim();
  const last = document.getElementById('sLast').value.trim();
  if(!first){showToast('Please enter first name','error');return;}
  const name = `${first} ${last}`.trim();
  const colors=['#3A6FA8','#3E7B52','#C97C35','#8A5BA8','#3B8C7A','#A8355B'];
  const newStaff = {
    id:DB.staff.length+1, name,
    role:document.getElementById('sRole').value,
    zone:document.getElementById('sZone').value||'Unassigned',
    active:true, avatar:name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
    color:colors[DB.staff.length%colors.length],
    phone:document.getElementById('sPhone').value,
    task:'Onboarding',
    since:new Date().toLocaleString('en-IN',{month:'short',year:'numeric'}),
    cases:0
  };
  DB.staff.push(newStaff);
  saveDB();
  closeModal();
  showToast(`${name} added to the team ✓`,'success');
  if(currentScreen==='staff') renderStaff();
}

// ===== TOAST =====
function showToast(msg, type='info') {
  const existing = document.getElementById('toast');
  if(existing) existing.remove();
  const colors = {success:'var(--green-d)',error:'var(--red)',info:'var(--blue)',warning:'var(--amber)'};
  const t = document.createElement('div');
  t.id = 'toast';
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:85px;left:50%;transform:translateX(-50%);background:${colors[type]||'var(--txt)'};color:white;padding:10px 18px;border-radius:25px;font-size:13px;font-weight:500;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,.2);white-space:nowrap;animation:toastIn .3s ease;max-width:90vw;text-align:center`;
  document.head.insertAdjacentHTML('beforeend','<style>@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%)}}</style>');
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300)},3000);
}

// ===== PROFILE =====
function toggleProfile() {
  const drop = document.getElementById('profileDrop');
  const overlay = document.getElementById('profileOverlay');
  drop.classList.toggle('hidden');
  overlay.classList.toggle('hidden');
}
