// login.js
const auth = firebase.auth();
const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;

  if (!role) {
    errorMsg.textContent = "Please select a role.";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      if (role === 'doctor') {
        window.location.href = 'doctor.html';
      } else if (role === 'receptionist') {
        window.location.href = 'receptionist.html';
      }
    })
    .catch(err => {
      errorMsg.textContent = err.message;
    });
});
