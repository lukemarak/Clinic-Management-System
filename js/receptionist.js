// receptionist.js
// Assumes firebase-config.js was loaded and firebase initialized (compat version used in index.html)

const db = firebase.database();
const patientForm = document.getElementById('patientForm');
const queueBody = document.getElementById('queueBody');
const noRecords = document.getElementById('noRecords');
const filterStatus = document.getElementById('filterStatus');
const searchBox = document.getElementById('searchBox');

function formatToken(n){
  return `T-${String(n).padStart(3,'0')}`;
}

/**
 * obtainNextToken - increments a persistent counter in /meta/lastToken using transaction
 * returns Promise<number>
 */
function obtainNextToken(){
  const ref = db.ref('meta/lastToken');
  return ref.transaction(current => {
    return (current || 0) + 1;
  }).then(result => {
    if (result.committed){
      return result.snapshot.val();
    } else {
      throw new Error('Failed to obtain token');
    }
  });
}

/**
 * addPatient - creates a patient record in /patients with token and timestamp
 */
async function addPatient(data){
  try {
    const tokenNumber = await obtainNextToken();
    const tokenLabel = formatToken(tokenNumber);
    const patientRef = db.ref('patients').push();
    const payload = {
      tokenNumber,
      tokenLabel,
      name: data.name,
      age: data.age || null,
      gender: data.gender || null,
      contact: data.contact || '',
      reason: data.reason || '',
      status: 'waiting', // waiting | called | checked
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    await patientRef.set(payload);
    return payload;
  } catch (err){
    console.error(err);
    throw err;
  }
}

/* render single row */
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

  // Call button (mark as called)
  const callBtn = document.createElement('button');
  callBtn.className = 'action-btn call-btn';
  callBtn.textContent = 'Call';
  callBtn.onclick = () => updateStatus(key, 'called');

  // Complete button (mark as checked)
  const completeBtn = document.createElement('button');
  completeBtn.className = 'action-btn complete-btn';
  completeBtn.textContent = 'Checked';
  completeBtn.onclick = () => updateStatus(key, 'checked');

  // Remove (archive) button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'action-btn remove-btn';
  removeBtn.textContent = 'Archive';
  removeBtn.onclick = () => archivePatient(key);

  actionTd.appendChild(callBtn);
  actionTd.appendChild(completeBtn);
  actionTd.appendChild(removeBtn);

  tr.appendChild(tokenTd);
  tr.appendChild(nameTd);
  tr.appendChild(ageTd);
  tr.appendChild(contactTd);
  tr.appendChild(reasonTd);
  tr.appendChild(statusTd);
  tr.appendChild(actionTd);

  return tr;
}

/* update patient status */
function updateStatus(key, newStatus){
  db.ref(`patients/${key}`).update({ status: newStatus });
}

/* archive patient - move to /archive or delete (we'll move) */
function archivePatient(key){
  const ref = db.ref(`patients/${key}`);
  ref.once('value').then(snap => {
    const val = snap.val();
    if (!val) return;
    const updates = {};
    updates[`archive/patients/${key}`] = val;
    updates[`patients/${key}`] = null;
    updates[`archive/patients/${key}/archivedAt`] = firebase.database.ServerValue.TIMESTAMP;
    return db.ref().update(updates);
  });
}

/* live listener for patients */
function attachListener(){
  const patientsRef = db.ref('patients').orderByChild('createdAt');
  patientsRef.on('value', snapshot => {
    const data = snapshot.val() || {};
    const entries = Object.entries(data);
    // sort by tokenNumber ascending if tokens exist
    entries.sort((a,b) => (a[1].tokenNumber || 0) - (b[1].tokenNumber || 0));
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

/* form handlers */
patientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: patientForm.name.value.trim(),
    age: patientForm.age.value,
    gender: patientForm.gender.value,
    contact: patientForm.contact.value.trim(),
    reason: patientForm.reason.value.trim()
  };

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Registering...';

  try {
    await addPatient(data);
    patientForm.reset();
    patientForm.name.focus();
  } catch (err){
    alert('Error saving patient. See console for details.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Assign Token & Register';
  }
});

document.getElementById('clearBtn').addEventListener('click', () => patientForm.reset());

filterStatus.addEventListener('change', () => {
  // re-render will be triggered by DB listener as data not changed; but call attachListener once initially
});

searchBox.addEventListener('input', () => {
  // simple debounce
  if (window.__searchTimer) clearTimeout(window.__searchTimer);
  window.__searchTimer = setTimeout(() => {
    // fetch snapshot and render based on latest in-memory DOM (we have live listener attached)
    db.ref('patients').once('value').then(snap => {
      const data = snap.val() || {};
      const entries = Object.entries(data);
      entries.sort((a,b) => (a[1].tokenNumber || 0) - (b[1].tokenNumber || 0));
      renderQueue(entries);
    });
  }, 220);
});

// start live listening
attachListener();
