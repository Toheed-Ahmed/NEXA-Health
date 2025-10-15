<p align="center">
  <img src="https://img.shields.io/badge/Project-Smart%20Patient%20System-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tech-React%20Node%20MongoDB-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<h1 align="center">🏥 Smart Patient Record & Reminder System</h1>
<p align="center">
<strong>Digitizing Healthcare for Rural Pakistan</strong><br>
A comprehensive patient management platform with AI assistance, automated reminders, and hospital discovery.
</p>


---

## 👥 Team NEXA
**OpenHack'25 @ MUET SZAB Campus**

<table>
  <tr>
    <th>Member</th>
    <th>Role</th>
    <th>GitHub</th>
  </tr>
  <tr>
    <td>Toheed Ahmed</td>
    <td>Full-Stack Developer</td>
    <td>@Toheed-Ahmed</td>
  </tr>
  <tr>
    <td>Naveed Ahmed</td>
    <td>Backend Developer</td>
    <td>@naveed-kalvvar-cloud</td>
  </tr>
  <tr>
    <td>Zeeshan</td>
    <td>Frontend Developer</td>
    <td>@zeeshan</td>
  </tr>
</table>

---

## 🎯 Problem Statement
Healthcare in rural Pakistan faces:

- 📋 **Fragmented Records** – Paper-based systems  
- ⏰ **Missed Appointments** – No reminders  
- 🔍 **Poor Discoverability** – Patients can’t find specialists  
- 🔗 **Disconnected Care** – Clinics & doctors not linked  
- 📉 **Treatment Gaps** – Delayed follow-ups  

**Impact:** Ineffective healthcare, increased costs, poor outcomes.

---

## 💡 Our Solution
AI-powered **digital patient management** for rural clinics:

- 🗂️ Centralized Digital Records  
- ⏰ Multi-channel Automated Reminders  
- 🏥 Hospital & Doctor Finder  
- 📊 Analytics Dashboard  
- 🤖 AI Chatbot Assistant  
- 🔐 Secure Role-Based Access  

<details>
<summary>✨ Features</summary>

1. **Patient Record Management** – Full profiles, X-rays, lab reports, AES encryption  
2. **Smart Appointments** – Scheduler, multi-channel reminders, status tracking  
3. **Hospital & Doctor Finder** – Specialty filters, location-based search  
4. **AI Chatbot Assistant** – 24/7 patient guidance & FAQs  
5. **Analytics Dashboard** – Charts, trends, statistics  
6. **Security** – Role-based JWT authentication, audit logs  

</details>

---


## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Node.js-lightgrey?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Notifications-Twilio-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-OpenAI%20API-purple?style=for-the-badge" />
</p>

---



## 📖 Usage Guide

<details>
<summary>🔐 Authentication</summary>

- Login (Admin / Doctor / Patient)  
- Two-factor OTP  

</details>

<details>
<summary>📊 Dashboard</summary>

- Patients → Add / Edit / View  
- Appointments → Schedule / Track  
- Reminders → View notifications  
- Analytics → Visual charts  
- Hospital Finder → Search specialists  
- AI Assistant → Chatbot guidance  

</details>

<details>
<summary>🏥 Hospital & Doctor Finder</summary>

- Search by specialty & location  
- Doctor availability & clinic info  

</details>

<details>
<summary>🤖 AI Chatbot</summary>

- FAQs, registration guidance, appointment slots  
- Navigation help  

</details>

---
## 🏥 Category
**Healthcare**  

Our project focuses on digitizing patient records, automating reminders, and providing AI-assisted healthcare guidance for rural areas, improving accessibility and efficiency in healthcare delivery.

---

## ⚠️ Challenges Faced
- **Multi-Channel Notifications:** Integrating Email, SMS, and WhatsApp reminders was complex due to different APIs.  
  **Solution:** Built a unified notification service to send reminders reliably.

- **Secure Patient Data:** Storing sensitive medical records safely was critical.  
  **Solution:** Implemented AES encryption and JWT-based role authentication.

---

## 📚 Learnings
- Hands-on experience with **full-stack development** using React, Node.js, and MongoDB.  
- Integrating **third-party APIs** like Twilio, WhatsApp, and OpenAI.  
- Understanding the importance of **data security and privacy** in healthcare systems.  
- Designing **scalable and modular architectures** for multi-role applications.

## 🎯 Impact & Future Roadmap

**Stakeholders & Benefits:**
- **Patients:** Easy access, timely reminders, specialist discovery  
- **Doctors:** Centralized data, reduced no-shows  
- **Clinics:** Streamlined operations  
- **Healthcare System:** Efficient & cost-effective  

**Future Roadmap:**
- Mobile apps (Android/iOS + PWA)  
- Predictive AI for patient risk assessment  
- Multi-language support (English, Urdu, Sindhi)  
- Telemedicine & video consultations  
- Blockchain for immutable medical records  
- IoT device integration (wearable health monitors)

---


## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)  
3. Commit changes (`git commit -m 'Add AmazingFeature'`)  
4. Push to branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request  

---

## 📄 License

MIT License – Educational & demonstration purposes only.

---


<div align="center">
Made with ❤️ by Team NEXA – Transforming Healthcare, One Digital Record at a Time  
⭐ Star this repo if you find it helpful!
</div>

## ⚙️ Setup Instructions

1. **Clone your fork:**
```bash
git clone https://github.com/YourGitHubUsername/TEAM_NEXA.git
2. Clone your fork:
cd TEAM_NEXA/backend
Install dependencies:
npm install
Setup environment variables:
cp .env.example .env
# Edit the .env file with your configuration (MongoDB URI, API keys, etc.)
Start the backend server:
npm start
Open the frontend:
cd ../frontend
# Open index.html in your browser OR use the Live Server extension in VS Code