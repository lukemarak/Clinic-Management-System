# 🏥 Clinic Management System (Doctor–Receptionist Communication)

### 🔸 Unified Mentor Internship Project  
**Tech Stack:** HTML | CSS | JavaScript | Firebase (Realtime Database / Firestore)

---

## 🌐 Live Demo
[Visit Clinic Management System](https://trinityss.in)
-> This domain will expire on Feb-2026
---

## 🔑 Login Credentials (Demo Accounts)

**👨‍⚕️ Doctor Login**  
///Email: doctor@cms.com  
///Password: 123456 

**👩‍💼 Receptionist Login**  
///Email: receptionist@cms.com  
///Password: 7654321  

> ⚠️ These demo credentials are for testing purposes only.


## 🩺 Problem Statement

The **Work Assistance Program “Direction”** is a web-based system designed to simplify communication between a **doctor** and a **receptionist** in a clinic.  

Traditionally, doctors and receptionists manually manage patient data, tokens, and prescriptions — leading to confusion, data loss, and delays.  

This project automates that process with a simple, cloud-connected system.

---


## 🎯 Objective

To build a **two-user web application** (Doctor & Receptionist) that:
- Helps the receptionist register patients and assign **token numbers**.
- Allows the doctor to view patient details and add **prescriptions**.
- Stores all data securely in **Firebase** for real-time access.
- Keeps a **patient history** accessible to both doctor and receptionist.

---

## 👥 User Roles

### 🧾 Receptionist
- Registers new patients with name, age, gender, contact number, and reason for visit.  
- Assigns **token numbers** automatically.  
- Sends patient data to Firebase.  
- Receives doctor’s prescriptions after consultation.

### 👨‍⚕️ Doctor
- Views the live queue of patients with tokens and details.  
- Enters **prescriptions and notes** for each patient.  
- Updates the patient’s record in Firebase.  
- Reviews **previous visit history** for returning patients.

---

## 🧰 Tech Stack Details

| Layer | Technology |
|--------|-------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Database** | Firebase Realtime Database or Cloud Firestore |
| **Auth (optional)** | Firebase Authentication (for Doctor/Receptionist login) |
| **Hosting** | Firebase Hosting / GitHub Pages |
| **Version Control** | Git + GitHub |

---

## ⚙️ How It Works

1. **Receptionist** enters new patient data → stored in Firebase under `/patients` collection.  
2. **Doctor**’s page listens to Firebase updates → displays all active patients with tokens.  
3. Doctor selects a patient → enters **diagnosis + prescription**.  
4. Prescription data is saved to Firebase and reflected instantly on the **Receptionist’s page**.  
5. Both users can view **patient history** anytime.

---

## 🧪 Core Modules

| Module | Description |
|---------|-------------|
| **Patient Registration** | Receptionist form to register new patients and assign token numbers. |
| **Patient Queue** | Displays patients waiting to be checked by the doctor. |
| **Doctor Dashboard** | Shows patient details and form to enter prescriptions. |
| **Prescription Record** | Stores diagnosis, medicine, and date in Firebase. |
| **Patient History** | Fetches past visits for a specific patient. |

---

## 🗂 Folder Structure

clinic-management/
│
├── index.html # Receptionist dashboard
├── doctor.html # Doctor dashboard
├── history.html # Patient history view
├── /css
│ └── style.css
├── /js
│ ├── firebase-config.js
│ ├── receptionist.js
│ ├── doctor.js
│ └── history.js
└── README.md


---

## 🔧 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)  
2. Create a new project: **Clinic Management System**
3. Go to **Project Settings → General → Your Apps → Web App**
4. Copy the Firebase config and paste it into `firebase-config.js`:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  databaseURL: "https://YOUR_APP.firebaseio.com",
  projectId: "YOUR_APP",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
firebase.initializeApp(firebaseConfig);

5. Enable Realtime Database or Firestore.

6. (Optional) Enable Authentication for doctor/receptionist login.


🧾 Example Data Structure (Firebase)
{
  "patients": {
    "token_1": {
      "name": "John Doe",
      "age": 32,
      "gender": "Male",
      "contact": "9876543210",
      "reason": "Fever and headache",
      "status": "Checked",
      "prescription": {
        "medicine": "Paracetamol 500mg",
        "notes": "Take twice daily after meals"
      },
      "timestamp": "2025-10-31T12:00:00Z"
    }
  }
}



🧑‍💻 How to Run

Download or clone this repository.

Open index.html for the Receptionist view.

Open doctor.html for the Doctor view.

Ensure you have added your Firebase config in /js/firebase-config.js.

Test adding and updating patients — data will sync live between both pages.

📊 Future Improvements

Add Firebase Authentication (Login for doctor/receptionist).

Add search bar for patient name or token.

Add export to PDF for prescriptions.

Add delete/archive option for old records.

Add dark mode UI.

💡 Learning Outcomes

Hands-on experience using Firebase Realtime Database with JavaScript.

Building real-time apps with data synchronization.

Designing user roles and permissions in a small-scale clinic system.

Understanding CRUD operations in Firebase.

✨ Developed By

👤 Luke R Marak
Role: Developer 
Program: Unified Mentor Internship 2025