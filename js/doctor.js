// doctor.js
const db = firebase.database();
const queueBody = document.getElementById('queueBody');
const noRecords = document.getElementById('noRecords');
const filterStatus = document.getElementById('filterStatus');
const searchBox = document.getElementById('searchBox');

const detailPanel = document.getElementById('patientDetails');
const noSelection = document.getElementById('noSelection');
const d_token = document.getElementById('d_token');
const d_name = document.getElementById('d_name');
const d_age = document.getElementById('d_age');
const d_contact = document.getElementById('d_contact');
const d_reason = document.getElementById('d_reason');
const historyList = document.getElementById('historyList');

const medicineInput = document.getElementById('medicine');
const notesInput = document.getElementById('notes');
const saveBtn = document.getElementById('savePrescription');
const markCheckedBtn = document.getElementById('markChecked');

let currentSelectionKey = null;
let latestEntries = [];

/* helper to format token */
function formatToken(n){
  return `T-${String(n).padStart(3,'0')}`;
}

/* render a single table row */
function renderRow(key, item){
  const tr = document.createElement('tr');
  tr.dataset.key = key;

  const tokenTd = document.createElement('td');
  tokenTd.textContent = item.tokenLabel || formatToken(item.tokenNumber || 0);

  const nameTd = document.createElement('td');
  nameTd.textContent = item.name || '';

  const ageTd = document.createElement('td');
  ageTd.textContent = item.age || '';

  const contactTd = document.createElement('td');
  contactTd.textContent = item.contact || '';

  const reasonTd = document.createElement('td');
  reasonTd.textContent = item.reason || '';

  const statusTd = document.createElement('td');
  const span = document.createElement('span');
  span.className = `tag ${item.status || 'waiting'}`;
  span.textContent = item.status || 'waiting';
  statusTd.appendChild(span);

  const actionTd = document.createElement('td');
  const openBtn = document.createElement('button');
  openBtn.className = 'action-btn call-btn';
  openBtn.textContent = 'Open';
  openBtn.onclick = () => openPatient(key, item);

  actionTd.appendChild(openBtn);

  tr.appendChild(tokenTd);
  tr.appendChild(nameTd);
  tr.appendChild(ageTd);
  tr.appendChild(contactTd);
  tr.appendChild(reasonTd);
  tr.appendChild(statusTd);
  tr.appendChild(actionTd);

  return tr;
}

/* open a patient details in right panel */
function openPatient(key, item){
  currentSelectionKey = key;
  noSelection.style.display = 'none';
  detailPanel.style.display = 'block';

  d_token.textContent = item.tokenLabel || formatToken(item.tokenNumber || 0);
  d_name.textContent = item.name || '';
  d_age.textContent = item.age || '';
  d_contact.textContent = item.contact || '';
  d_reason.textContent = item.reason || '';

  // clear prescription inputs
  medicineInput.value = (item.prescription && item.prescription.medicine) || '';
  notesInput.value = (item.prescription && item.prescription.notes) || '';

  // load history for this push-key
  loadHistoryForPatient(key);
}

/* save prescription: write to patients/{key}/prescription and to records/{key}/timestamp */
function savePrescription(){
  if (!currentSelectionKey){
    alert('Select a patient first.');
    return;
  }
  const medicine = medicineInput.value.trim();
  const notes = notesInput.value.trim();

  const payload = {
    medicine,
    notes,
    prescribedBy: firebase.auth().currentUser ? firebase.auth().currentUser.email : 'doctor',
    ts: firebase.database.ServerValue.TIMESTAMP
  };

  const updates = {};
  updates[`patients/${currentSelectionKey}/prescription`] = payload;
  updates[`patients/${currentSelectionKey}/lastUpdated`] = firebase.database.ServerValue.TIMESTAMP;
  // also append to records (history)
  const recKey = db.ref(`records/${currentSelectionKey}`).push().key;
  updates[`records/${currentSelectionKey}/${recKey}`] = {
    prescription: payload,
    patientSnapshotAt: null
  };

  db.ref().update(updates).then(()=>{
    alert('Prescription saved.');
    // refresh history
    loadHistoryForPatient(currentSelectionKey);
  }).catch(err=>{
    console.error(err);
    alert('Failed to save prescription.');
  });
}

/* mark checked (completed) */
function markChecked(){
  if (!currentSelectionKey) return;
  db.ref(`patients/${currentSelectionKey}`).update({ status: 'checked' });
  alert('Marked as checked.');
}

/* load history */
function loadHistoryForPatient(key){
  historyList.innerHTML = '<small class="muted">Loading history...</small>';
  db.ref(`records/${key}`).orderByChild('prescription/ts').once('value').then(snap=>{
    const v = snap.val() || {};
    const entries = Object.entries(v).sort((a,b)=>{
      const at = a[1].prescription && a[1].prescription.ts || 0;
      const bt = b[1].prescription && b[1].prescription.ts || 0;
      return bt - at;
    });
    if (!entries.length){
      historyList.innerHTML = '<div class="muted">No history available.</div>';
      return;
    }
    historyList.innerHTML = '';
    for (const [k, rec] of entries){
      const d = document.createElement('div');
      d.style.padding = '8px';
      d.style.borderBottom = '1px dashed #eef4fb';
      const date = rec.prescription && rec.prescription.ts ? new Date(rec.prescription.ts) : null;
      d.innerHTML = `<div style="font-weight:600">${rec.prescription.medicine || '(no medicines)'}</div>
                     <div style="font-size:13px;color:var(--muted)">${rec.prescription.notes || ''}</div>
                     <div style="font-size:12px;color:var(--muted);margin-top:6px">${rec.prescription.prescribedBy || ''} — ${date ? date.toLocaleString() : ''}</div>`;
      historyList.appendChild(d);
    }
  }).catch(err=>{
    console.error(err);
    historyList.innerHTML = '<div class="muted">Failed to load history.</div>';
  });
}

/* attach live listener to patients */
function attachListener(){
  const patientsRef = db.ref('patients').orderByChild('createdAt');
  patientsRef.on('value', snapshot => {
    const data = snapshot.val() || {};
    const entries = Object.entries(data);
    entries.sort((a,b) => (a[1].tokenNumber || 0) - (b[1].tokenNumber || 0));
    latestEntries = entries;
    renderQueue(entries);
  });
}

/* render queue with filters/search */
function renderQueue(entries){
  queueBody.innerHTML = '';
  const filter = filterStatus.value;
  const q = (searchBox.value || '').trim().toLowerCase();

  let count = 0;
  for (const [key, item] of entries){
    if (filter !== 'all' && item.status !== filter) continue;
    if (q){
      const matches = (item.name || '').toLowerCase().includes(q) ||
                      (item.tokenLabel || '').toLowerCase().includes(q) ||
                      String(item.tokenNumber || '').includes(q);
      if (!matches) continue;
    }
    const tr = renderRow(key, item);
    queueBody.appendChild(tr);
    count++;
  }
  noRecords.style.display = count ? 'none' : 'block';
}

/* simple debounce for search */
searchBox.addEventListener('input', () => {
  if (window.__searchTimer) clearTimeout(window.__searchTimer);
  window.__searchTimer = setTimeout(()=> {
    renderQueue(latestEntries);
  }, 200);
});

filterStatus.addEventListener('change', ()=> renderQueue(latestEntries));

saveBtn.addEventListener('click', savePrescription);
markCheckedBtn.addEventListener('click', markChecked);

/* init */
attachListener();
