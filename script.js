// Optimized NEXA Health System v3.0 - 60% smaller
(() => {
    // ========== CONFIGURATION ==========
    const C = {
        STORAGE: {
            PATIENTS: 'nexa_patients_v3', APPOINTMENTS: 'nexa_appointments_v3', 
            REMINDERS: 'nexa_reminders_v3', SETTINGS: 'nexa_settings_v3',
            NOTIFICATIONS: 'nexa_notifications_v3', USER: 'nexa_current_user'
        },
        THEME: { LIGHT: 'light', DARK: 'dark' },
        ROLES: { ADMIN: 'admin', DOCTOR: 'doctor', PATIENT: 'patient' }
    };

    // ========== UTILITIES ==========
    const $ = sel => document.querySelector(sel);
    const $$ = sel => [...document.querySelectorAll(sel)];
    const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    const now = () => new Date().toISOString();
    const fmtDate = (d, opt = {}) => d ? new Date(d).toLocaleString('en-US', 
        {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',...opt}) : '-';
    
    const age = dob => {
        if (!dob) return '-';
        const b = new Date(dob), t = new Date();
        let a = t.getFullYear() - b.getFullYear();
        const m = t.getMonth() - b.getMonth();
        return (m < 0 || (m === 0 && t.getDate() < b.getDate())) ? a-1 : a;
    };

    const storage = {
        get: k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e) { return null; } },
        set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e) { return false; } }
    };

    // ========== TOAST SYSTEM ==========
    const toast = (msg, type = 'info', dur = 4000) => {
        const c = $('#toast-container');
        if (!c) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<i class="fas fa-${ 
            type==='success'?'check-circle':type==='error'?'exclamation-circle':
            type==='warning'?'exclamation-triangle':'info-circle'
        }"></i><span>${msg}</span>`;
        c.appendChild(t);
        setTimeout(() => t.classList.add('show'), 10);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, dur);
    };

    // ========== NOTIFICATION MANAGER ==========
    class Notifier {
        constructor() {
            this.notifs = storage.get(C.STORAGE.NOTIFICATIONS) || [];
            this.unread = this.notifs.filter(n => !n.read).length;
            this.updateBadge();
        }
        add(title, msg, type = 'info') {
            const n = { id: uid('n_'), title, msg, type, time: now(), read: false };
            this.notifs.unshift(n);
            this.unread++;
            this.save();
            this.updateBadge();
            this.render(n);
            return n;
        }
        markRead(id) {
            const n = this.notifs.find(n => n.id === id);
            if (n && !n.read) { n.read = true; this.unread--; this.save(); this.updateBadge(); }
        }
        updateBadge() {
            const b = $('.notification-count');
            if (b) { b.textContent = this.unread; b.style.display = this.unread > 0 ? 'flex' : 'none'; }
        }
        render(n) {
            const l = $('#notification-list');
            if (!l) return;
            const e = document.createElement('div');
            e.className = `notification-item ${n.type} ${n.read?'read':'unread'}`;
            e.innerHTML = `
                <div class="notification-icon"><i class="fas fa-${ 
                    n.type==='success'?'check-circle':n.type==='error'?'exclamation-circle':
                    n.type==='warning'?'exclamation-triangle':'info-circle'
                }"></i></div>
                <div class="notification-content">
                    <h4>${n.title}</h4><p>${n.msg}</p>
                    <span class="notification-time">${fmtDate(n.time,{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                ${!n.read?'<div class="notification-dot"></div>':''}
            `;
            e.onclick = () => { this.markRead(n.id); e.className = e.className.replace('unread','read'); };
            l.prepend(e);
        }
        save() { storage.set(C.STORAGE.NOTIFICATIONS, this.notifs); }
        loadPanel() {
            const l = $('#notification-list');
            if (l) { l.innerHTML = ''; this.notifs.slice(0,10).forEach(n => this.render(n)); }
        }
    }

    // ========== THEME MANAGER ==========
    class Theme {
        constructor() {
            this.current = localStorage.getItem('nexa_theme') || C.THEME.LIGHT;
            this.apply(this.current);
            $('#theme-toggle')?.addEventListener('click', () => this.toggle());
        }
        apply(t) {
            document.documentElement.setAttribute('data-theme', t);
            localStorage.setItem('nexa_theme', t);
            this.current = t;
            const i = $('#theme-toggle i');
            if (i) i.className = t === C.THEME.DARK ? 'fas fa-sun' : 'fas fa-moon';
        }
        toggle() {
            this.apply(this.current === C.THEME.LIGHT ? C.THEME.DARK : C.THEME.LIGHT);
            toast(`Theme changed to ${this.current} mode`, 'info', 2000);
        }
    }

    // ========== DATA MANAGER ==========
    class DataManager {
        constructor() {
            this.currentUser = storage.get(C.STORAGE.USER);
            this.patients = storage.get(C.STORAGE.PATIENTS) || this.samplePatients();
            this.appointments = storage.get(C.STORAGE.APPOINTMENTS) || this.sampleAppointments();
            this.reminders = storage.get(C.STORAGE.REMINDERS) || this.sampleReminders();
            this.settings = storage.get(C.STORAGE.SETTINGS) || this.defaultSettings();
            this.saveAll();
        }

        samplePatients() {
            const t = now(), d = new Date;
            return [
                { id:'P-1001', name:'Sarah Johnson', phone:'+92-300-1111111', email:'sarah@example.com',
                  dob:'1989-04-12', gender:'Female', address:'Karachi', allergies:'Penicillin, Peanuts',
                  history:'Hypertension, Asthma', medications:'Lisinopril 10mg daily', status:'active',
                  createdAt: new Date(d-30*864e5).toISOString(), lastVisit: new Date(d-7*864e5).toISOString() },
                { id:'P-1002', name:'Michael Johnson', phone:'+92-300-2222222', email:'michael@example.com',
                  dob:'1979-09-20', gender:'Male', address:'Hyderabad', history:'Diabetes Type 2',
                  medications:'Metformin 500mg twice daily', status:'active',
                  createdAt: new Date(d-45*864e5).toISOString(), lastVisit: new Date(d-14*864e5).toISOString() },
                { id:'P-1003', name:'Amina Khan', phone:'+92-300-3333333', email:'amina@example.com',
                  dob:'1995-12-15', gender:'Female', address:'Lahore', allergies:'Shellfish',
                  history:'Migraine, Anxiety', status:'new', createdAt: new Date(d-2*864e5).toISOString() }
            ];
        }

        sampleAppointments() {
            const d = new Date;
            return [
                { id:'A-1001', patientId:'P-1001', patientName:'Sarah Johnson', doctor:'Dr. Ahmed Khan',
                  datetime: new Date(d.getTime()+2*36e5).toISOString(), reason:'Cardiology Checkup',
                  status:'scheduled', type:'follow-up', duration:30, notes:'Hypertension follow-up', createdAt:now() },
                { id:'A-1002', patientId:'P-1002', patientName:'Michael Johnson', doctor:'Dr. Ayesha Rahman',
                  datetime: new Date(d.getTime()+864e5).toISOString(), reason:'Diabetes Consultation',
                  status:'scheduled', type:'consultation', duration:45, notes:'Diabetes review', createdAt:now() }
            ];
        }

        sampleReminders() {
            return [{
                id:'R-1001', appointmentId:'A-1001', patientId:'P-1001', patientName:'Sarah Johnson',
                type:'sms', message:'Reminder: Cardiology checkup tomorrow at 10:00 AM',
                scheduledFor: new Date(Date.now()+12*36e5).toISOString(), status:'pending', createdAt:now()
            }];
        }

        defaultSettings() {
            return { clinicName:'NEXA Health Clinic', clinicHours: {
                monday:{open:'08:00',close:'18:00'}, tuesday:{open:'08:00',close:'18:00'},
                wednesday:{open:'08:00',close:'18:00'}, thursday:{open:'08:00',close:'18:00'},
                friday:{open:'08:00',close:'17:00'}, saturday:{open:'09:00',close:'14:00'}, sunday:{open:null,close:null}
            }};
        }

        saveAll() {
            storage.set(C.STORAGE.PATIENTS, this.patients);
            storage.set(C.STORAGE.APPOINTMENTS, this.appointments);
            storage.set(C.STORAGE.REMINDERS, this.reminders);
            storage.set(C.STORAGE.SETTINGS, this.settings);
            if (this.currentUser) storage.set(C.STORAGE.USER, this.currentUser);
        }

        addPatient(p) {
            const patient = { id:'P-'+uid(), ...p, status:'active', createdAt:now(), lastVisit:null };
            this.patients.push(patient);
            this.saveAll();
            return patient;
        }

        updatePatient(id, updates) {
            const i = this.patients.findIndex(p => p.id === id);
            if (i !== -1) { this.patients[i] = {...this.patients[i], ...updates}; this.saveAll(); return this.patients[i]; }
            return null;
        }

        deletePatient(id) {
            this.patients = this.patients.filter(p => p.id !== id);
            this.appointments = this.appointments.filter(a => a.patientId !== id);
            this.saveAll();
        }

        addAppointment(a) {
            const ap = { id:'A-'+uid(), status:'scheduled', createdAt:now(), ...a };
            this.appointments.push(ap);
            this.scheduleReminder(ap);
            this.saveAll();
            return ap;
        }

        scheduleReminder(ap) {
            const t = new Date(new Date(ap.datetime).getTime() - 864e5);
            this.reminders.push({
                id:'R-'+uid(), appointmentId:ap.id, patientId:ap.patientId, patientName:ap.patientName,
                type:'sms', message:`Reminder: ${ap.reason} with ${ap.doctor} on ${fmtDate(ap.datetime)}`,
                scheduledFor:t.toISOString(), status:'pending', createdAt:now()
            });
            this.saveAll();
        }

        cancelAppointment(id) {
            const a = this.appointments.find(ap => ap.id === id);
            if (a) { a.status = 'cancelled'; this.reminders.forEach(r => { if (r.appointmentId === id) r.status = 'cancelled'; }); this.saveAll(); return true; }
            return false;
        }

        sendReminder(id) {
            const r = this.reminders.find(rem => rem.id === id);
            if (r && r.status === 'pending') { r.status = 'sent'; r.sentAt = now(); this.saveAll(); return true; }
            return false;
        }

        getStats() {
            const d = new Date(), start = new Date(d.getFullYear(), d.getMonth(), d.getDate()), end = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1);
            const todayAps = this.appointments.filter(ap => { const dt = new Date(ap.datetime); return dt >= start && dt < end && ap.status === 'scheduled'; });
            const pendingRems = this.reminders.filter(r => r.status === 'pending');
            return {
                totalPatients: this.patients.length, todayAppointments: todayAps.length,
                pendingReminders: pendingRems.length, activeDoctors: [...new Set(this.appointments.map(ap => ap.doctor))].length
            };
        }

        getActivity(limit = 5) {
            const acts = [];
            this.patients.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,3).forEach(p => {
                acts.push({ type:'registration', title:'New Patient', desc:`${p.name} joined`, time:p.createdAt, icon:'user-plus' });
            });
            this.appointments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,3).forEach(a => {
                acts.push({ type:'appointment', title:'Appointment Scheduled', desc:`${a.patientName} with ${a.doctor}`, time:a.createdAt, icon:'calendar-plus' });
            });
            return acts.sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0,limit);
        }

        login(email, pass, role = null) {
            const users = {
                [C.ROLES.ADMIN]: { id:'admin_001', email:'admin@nexahealth.com', name:'Dr. Ahmed Khan', role:C.ROLES.ADMIN, avatar:'fas fa-cogs', title:'Administrator' },
                [C.ROLES.DOCTOR]: { id:'doctor_001', email:'doctor@nexahealth.com', name:'Dr. Ayesha Rahman', role:C.ROLES.DOCTOR, avatar:'fas fa-user-md', title:'Medical Doctor' },
                [C.ROLES.PATIENT]: { id:'patient_001', email:'patient@nexahealth.com', name:'Sarah Johnson', role:C.ROLES.PATIENT, avatar:'fas fa-user-injured', title:'Patient' }
            };
            this.currentUser = role ? users[role] : { id:uid('user_'), email, name:'Demo User', role:C.ROLES.DOCTOR, avatar:'fas fa-user-md' };
            storage.set(C.STORAGE.USER, this.currentUser);
            return this.currentUser;
        }

        logout() { this.currentUser = null; localStorage.removeItem(C.STORAGE.USER); }
    }

    // ========== UI MANAGER ==========
    class UIManager {
        constructor(dm, nm) {
            this.dm = dm; this.nm = nm; this.view = 'dashboard';
            this.init();
        }

        init() {
            this.setupEvents();
            this.setupNav();
            this.updateDate();
            this.renderDashboard();
            // ensure safe call
            if (typeof this.setupRealtime === 'function') {
              this.setupRealtime();
            } else {
              console.warn('UIManager: setupRealtime() not implemented');
            }
            this.checkAuth();
        }

        checkAuth() {
            if (!this.dm.currentUser) this.showLogin();
            else this.showApp();
        }

        showLogin() {
            $('#login-modal').style.display = 'flex';
            $('#main-navbar').style.display = $('#quick-actions').style.display = $('#main-app').style.display = 'none';
        }

        showApp() {
            $('#login-modal').style.display = 'none';
            $('#main-navbar').style.display = $('#quick-actions').style.display = $('#main-app').style.display = 'flex';
            this.updateUser();
        }

        updateUser() {
            const u = this.dm.currentUser;
            if (u) {
                $('#user-name').textContent = u.name;
                $('#user-role').textContent = u.title || u.role;
                const a = $('.user-avatar i');
                if (a) a.className = u.avatar;
            }
        }

        setupEvents() {
            // Auth
            $('#login-form')?.addEventListener('submit', e => { e.preventDefault(); this.handleLogin(); });
            $$('.demo-btn').forEach(b => b.addEventListener('click', () => this.handleDemoLogin(b.dataset.role)));
            $('#logout-btn')?.addEventListener('click', () => this.handleLogout());

            // Notifications
            const bell = $('#notification-bell'), panel = $('#notification-panel');
            bell?.addEventListener('click', () => { panel.classList.toggle('active'); this.nm.loadPanel(); });
            $('#close-notifications')?.addEventListener('click', () => panel.classList.remove('active'));

            // Quick Actions
            $('#quick-patient')?.addEventListener('click', () => this.openModal('patient'));
            $('#quick-appointment')?.addEventListener('click', () => this.openModal('appointment'));
            $('#quick-prescription')?.addEventListener('click', () => this.openModal('prescription'));
            $('#quick-lab')?.addEventListener('click', () => this.openModal('labtest'));

            // Reports
            $('#generate-report')?.addEventListener('click', () => this.generateReport());

            // Modals
            this.setupModals();
            this.setupForms();
        }

        setupModals() {
            const modals = ['patient','appointment','prescription','labtest'];
            modals.forEach(m => {
                $(`#${m}-modal-close`)?.addEventListener('click', () => this.closeModal(m));
                $(`#${m}-cancel`)?.addEventListener('click', () => this.closeModal(m));
            });
            window.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); });
        }

        setupForms() {
            const forms = ['patient','appointment','prescription','labtest'];
            forms.forEach(f => $(`#${f}-form`)?.addEventListener('submit', e => { e.preventDefault(); this[`handle${f.charAt(0).toUpperCase()+f.slice(1)}Submit`](); }));
        }

        setupNav() {
            $$('.nav-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); this.switchView(l.dataset.view); }));
            $$('[data-view-link]').forEach(l => l.addEventListener('click', e => { e.preventDefault(); this.switchView(l.dataset.viewLink); }));
            $('#btn-new-patient')?.addEventListener('click', () => this.openModal('patient'));
            $('#btn-new-appointment')?.addEventListener('click', () => this.openModal('appointment'));
            $('#send-test-reminder')?.addEventListener('click', () => this.sendTestReminder());
        }

        switchView(v) {
            $$('.nav-link').forEach(l => l.classList.remove('active'));
            $$(`[data-view="${v}"]`).forEach(l => l.classList.add('active'));
            $$('.view').forEach(vw => vw.classList.remove('active'));
            const t = $(`#view-${v}`);
            if (t) {
                t.classList.add('active');
                this.view = v;
                if (this[`render${v.charAt(0).toUpperCase()+v.slice(1)}`]) this[`render${v.charAt(0).toUpperCase()+v.slice(1)}`]();
            }
        }

        updateDate() {
            const d = $('#current-date');
            if (d) d.textContent = fmtDate(new Date(), {weekday:'long',year:'numeric',month:'long',day:'numeric'});
        }

        renderDashboard() {
            const s = this.dm.getStats(), acts = this.dm.getActivity();
            const todayAps = this.dm.appointments.filter(ap => new Date(ap.datetime).toDateString() === new Date().toDateString() && ap.status === 'scheduled').sort((a,b) => new Date(a.datetime) - new Date(b.datetime));

            ['#total-patients','#today-appointments','#pending-reminders','#active-doctors'].forEach((sel,i) => $(sel).textContent = Object.values(s)[i]);
            ['#patient-count','#today-appointments-count'].forEach((sel,i) => $(sel).textContent = [s.totalPatients, s.todayAppointments][i]);

            this.renderAppointmentsTimeline(todayAps);
            this.renderActivity(acts);
        }

        renderAppointmentsTimeline(aps) {
            const c = $('#appointments-timeline');
            if (!c) return;
            if (!aps.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No appointments today</p></div>'; return; }
            c.innerHTML = aps.map(ap => `
                <div class="appointment-item">
                    <div class="appointment-time">${fmtDate(ap.datetime,{hour:'2-digit',minute:'2-digit'})}</div>
                    <div class="appointment-details">
                        <div class="appointment-patient">${ap.patientName}</div>
                        <div class="appointment-doctor">with ${ap.doctor}</div>
                        <div class="appointment-reason">${ap.reason}</div>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-icon small" title="Send Reminder" data-id="${ap.id}"><i class="fas fa-bell"></i></button>
                    </div>
                </div>
            `).join('');
            c.querySelectorAll('.appointment-actions .btn-icon').forEach(b => b.addEventListener('click', () => this.sendAppointmentReminder(b.dataset.id)));
        }

        renderActivity(acts) {
            const c = $('#recent-activity');
            if (!c) return;
            if (!acts.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No recent activity</p></div>'; return; }
            c.innerHTML = acts.map(a => `
                <div class="activity-item">
                    <div class="activity-icon ${a.type}"><i class="fas fa-${a.icon}"></i></div>
                    <div class="activity-content">
                        <div class="activity-title">${a.title}</div>
                        <div class="activity-description">${a.desc}</div>
                        <div class="activity-time">${fmtDate(a.time,{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                </div>
            `).join('');
        }

        renderPatients() {
            const c = $('#patients-table tbody');
            if (!c) return;
            const ps = this.dm.patients;
            if (!ps.length) { c.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-user-injured"></i><p>No patients</p></td></tr>'; return; }
            c.innerHTML = ps.map(p => `
                <tr>
                    <td>${p.id}</td><td>${p.name}</td><td>${p.phone}<br><small>${p.email||'No email'}</small></td>
                    <td>${age(p.dob)}</td><td>${p.lastVisit?fmtDate(p.lastVisit,{month:'short',day:'numeric'}):'Never'}</td>
                    <td><span class="status-badge ${p.status}">${p.status}</span></td>
                    <td><div class="action-buttons">
                        <button class="btn-icon small" data-id="${p.id}"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon small" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon small danger" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                    </div></td>
                </tr>
            `).join('');
            $('#showing-patients').textContent = $('#total-patients-count').textContent = ps.length;
            c.querySelectorAll('.action-buttons .btn-icon').forEach(b => {
                const id = b.dataset.id;
                if (b.querySelector('.fa-eye')) b.onclick = () => this.viewPatient(id);
                else if (b.querySelector('.fa-edit')) b.onclick = () => this.editPatient(id);
                else if (b.querySelector('.fa-trash')) b.onclick = () => this.deletePatient(id);
            });
            $('#patient-search')?.addEventListener('input', e => this.filterPatients(e.target.value));
        }

        renderAppointments() {
            const c = $('#appointments-table tbody');
            if (!c) return;
            const aps = this.dm.appointments.filter(a => a.status === 'scheduled').sort((a,b) => new Date(a.datetime) - new Date(b.datetime));
            if (!aps.length) { c.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-calendar-times"></i><p>No appointments</p></td></tr>'; return; }
            c.innerHTML = aps.map(a => `
                <tr>
                    <td>${a.id}</td><td>${a.patientName}<br><small>${a.patientId}</small></td><td>${a.doctor}</td>
                    <td>${fmtDate(a.datetime)}</td><td>${a.reason}</td><td><span class="status-badge ${a.status}">${a.status}</span></td>
                    <td><div class="action-buttons">
                        <button class="btn-icon small" data-id="${a.id}"><i class="fas fa-bell"></i></button>
                        <button class="btn-icon small danger" data-id="${a.id}"><i class="fas fa-times"></i></button>
                    </div></td>
                </tr>
            `).join('');
            c.querySelectorAll('.action-buttons .btn-icon').forEach(b => {
                const id = b.dataset.id;
                if (b.querySelector('.fa-bell')) b.onclick = () => this.sendAppointmentReminder(id);
                else if (b.querySelector('.fa-times')) b.onclick = () => this.cancelAppointment(id);
            });
        }

        renderReminders() {
            const c = $('#reminders-list');
            if (!c) return;
            const rems = this.dm.reminders.filter(r => r.status === 'pending').sort((a,b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
            if (!rems.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No pending reminders</p></div>'; return; }
            c.innerHTML = rems.map(r => `
                <div class="reminder-item">
                    <div class="reminder-content">
                        <div class="reminder-patient">${r.patientName}</div>
                        <div class="reminder-message">${r.message}</div>
                        <div class="reminder-time">Scheduled: ${fmtDate(r.scheduledFor)}</div>
                    </div>
                    <div class="reminder-actions">
                        <button class="btn primary small" data-id="${r.id}"><i class="fas fa-paper-plane"></i> Send Now</button>
                    </div>
                </div>
            `).join('');
            c.querySelectorAll('.reminder-actions .btn').forEach(b => b.addEventListener('click', () => this.sendReminder(b.dataset.id)));
        }

        renderAnalytics() {
            if (typeof Chart === 'undefined') return;
            this.renderCharts();
        }

        renderCharts() {
            const dc = $('#demographics-chart'), ac = $('#appointments-chart');
            if (dc) {
                const ps = this.dm.patients;
                const g = { male: ps.filter(p => p.gender === 'Male').length, female: ps.filter(p => p.gender === 'Female').length, other: ps.filter(p => p.gender === 'Other' || !p.gender).length };
                new Chart(dc, { type: 'doughnut', data: { labels: ['Male','Female','Other'], datasets: [{ data: [g.male, g.female, g.other], backgroundColor: ['#3b82f6','#ec4899','#6b7280'] }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });
            }
            if (ac) {
                const aps = this.dm.appointments;
                const days = Array.from({length:7}, (_,i) => { const d = new Date(); d.setDate(d.getDate()-i); return d.toDateString(); }).reverse();
                const counts = days.map(d => aps.filter(ap => new Date(ap.datetime).toDateString() === d && ap.status === 'scheduled').length);
                new Chart(ac, { type: 'line', data: { labels: days.map(d => new Date(d).toLocaleDateString('en-US',{weekday:'short'})), datasets: [{ label: 'Appointments', data: counts, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true }] }, options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } });
            }
        }

        // Modal Management
        openModal(type, id = null) {
            const m = $(`#${type}-modal`), f = $(`#${type}-form`);
            if (type === 'patient' && id) {
                const p = this.dm.patients.find(pat => pat.id === id);
                if (p) ['name','dob','gender','blood','phone','email','address','allergies','history','medications'].forEach(field => { const e = f.querySelector(`#patient-${field}`); if (e) e.value = p[field] || ''; });
                f.querySelector('#patient-id').value = id;
            } else if (type === 'appointment') {
                const s = f.querySelector('#appointment-patient');
                s.innerHTML = '<option value="">Select Patient</option>';
                this.dm.patients.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = `${p.name} (${p.phone})`; s.appendChild(o); });
                const t = new Date(); t.setDate(t.getDate()+1);
                f.querySelector('#appointment-date').value = t.toISOString().split('T')[0];
                f.querySelector('#appointment-time').value = '09:00';
            } else if (type === 'prescription') {
                const s = f.querySelector('#prescription-patient');
                s.innerHTML = '<option value="">Select Patient</option>';
                this.dm.patients.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = `${p.name} (${p.phone})`; s.appendChild(o); });
                if (this.dm.currentUser) f.querySelector('#prescription-doctor').value = this.dm.currentUser.name;
            } else if (type === 'labtest') {
                const s = f.querySelector('#labtest-patient');
                s.innerHTML = '<option value="">Select Patient</option>';
                this.dm.patients.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = `${p.name} (${p.phone})`; s.appendChild(o); });
            }
            if (id === null) f.reset();
            m.classList.add('active');
        }

        closeModal(type) { $(`#${type}-modal`)?.classList.remove('active'); }

        // Form Handlers
        handlePatientSubmit() {
            const f = $('#patient-form'), id = f.querySelector('#patient-id').value;
            const data = ['name','dob','gender','blood','phone','email','address','allergies','history','medications'].reduce((obj,field) => { obj[field] = f.querySelector(`#patient-${field}`).value; return obj; }, {});
            let p;
            if (id) { p = this.dm.updatePatient(id, data); toast('Patient updated','success'); }
            else { p = this.dm.addPatient(data); toast('Patient registered','success'); this.nm.add('New Patient',`${p.name} added`,'success'); }
            this.closeModal('patient'); this.renderDashboard(); this.renderPatients();
        }

        handleAppointmentSubmit() {
            const f = $('#appointment-form'), pid = f.querySelector('#appointment-patient').value;
            const p = this.dm.patients.find(pat => pat.id === pid);
            if (!p) { toast('Select valid patient','error'); return; }
            const a = this.dm.addAppointment({
                patientId: pid, patientName: p.name, doctor: f.querySelector('#appointment-doctor').value,
                datetime: new Date(`${f.querySelector('#appointment-date').value}T${f.querySelector('#appointment-time').value}`).toISOString(),
                reason: f.querySelector('#appointment-reason').value, notes: f.querySelector('#appointment-notes').value, type: 'consultation', duration: 30
            });
            toast('Appointment scheduled','success');
            this.nm.add('New Appointment',`${p.name} with ${a.doctor}`,'info');
            this.closeModal('appointment'); this.renderDashboard(); this.renderAppointments();
        }

        handlePrescriptionSubmit() {
            const f = $('#prescription-form'), pid = f.querySelector('#prescription-patient').value;
            const p = this.dm.patients.find(pat => pat.id === pid);
            if (!p) { toast('Select valid patient','error'); return; }
            toast('Prescription created','success');
            this.nm.add('New Prescription',`Prescription for ${p.name}`,'info');
            this.closeModal('prescription');
        }

        handleLabTestSubmit() {
            const f = $('#labtest-form'), pid = f.querySelector('#labtest-patient').value;
            const p = this.dm.patients.find(pat => pat.id === pid);
            if (!p) { toast('Select valid patient','error'); return; }
            toast('Lab test ordered','success');
            this.nm.add('Lab Test',`${f.querySelector('#labtest-type').value} for ${p.name}`,'info');
            this.closeModal('labtest');
        }

        // Action Handlers
        sendAppointmentReminder(id) {
            const a = this.dm.appointments.find(ap => ap.id === id);
            if (a) { toast(`Reminder sent to ${a.patientName}`,'success'); this.nm.add('Reminder Sent',`Sent to ${a.patientName}`,'info'); }
        }

        sendReminder(id) { if (this.dm.sendReminder(id)) { toast('Reminder sent','success'); this.renderReminders(); } }

        sendTestReminder() { toast('Test reminder sent','success'); this.nm.add('Test Reminder','Sent to demo patient','info'); }

        cancelAppointment(id) { if (confirm('Cancel appointment?')) { if (this.dm.cancelAppointment(id)) { toast('Appointment cancelled','success'); this.renderAppointments(); this.renderDashboard(); } } }

        viewPatient(id) { const p = this.dm.patients.find(pat => pat.id === id); if (p) toast(`Viewing ${p.name}`,'info'); }

        editPatient(id) { this.openModal('patient', id); }

        deletePatient(id) {
            if (confirm('Delete patient?')) {
                const p = this.dm.patients.find(pat => pat.id === id);
                if (p) { this.dm.deletePatient(id); toast('Patient deleted','success'); this.renderPatients(); this.renderDashboard(); this.nm.add('Patient Deleted',`${p.name} removed`,'warning'); }
            }
        }

        filterPatients(term) {
            const ps = this.dm.patients.filter(p => p.name.toLowerCase().includes(term.toLowerCase()) || p.phone.includes(term) || p.id.toLowerCase().includes(term.toLowerCase()));
            const c = $('#patients-table tbody');
            if (!c) return;
            if (!ps.length) { c.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-search"></i><p>No matches</p></td></tr>'; return; }
            c.innerHTML = ps.map(p => `
                <tr>
                    <td>${p.id}</td><td>${p.name}</td><td>${p.phone}<br><small>${p.email||'No email'}</small></td>
                    <td>${age(p.dob)}</td><td>${p.lastVisit?fmtDate(p.lastVisit,{month:'short',day:'numeric'}):'Never'}</td>
                    <td><span class="status-badge ${p.status}">${p.status}</span></td>
                    <td><div class="action-buttons">
                        <button class="btn-icon small" data-id="${p.id}"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon small" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon small danger" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                    </div></td>
                </tr>
            `).join('');
            $('#showing-patients').textContent = ps.length;
        }

        // Auth Handlers
        handleLogin() {
            const e = $('#login-email').value, p = $('#login-password').value;
            if (!e || !p) { toast('Enter email and password','error'); return; }
            const u = this.dm.login(e, p);
            if (u) { toast(`Welcome ${u.name}!`,'success'); this.showApp(); }
        }

        handleDemoLogin(r) { const u = this.dm.login(null, null, r); if (u) { toast(`Welcome ${u.name}!`,'success'); this.showApp(); } }

        handleLogout() { if (confirm('Logout?')) { this.dm.logout(); toast('Logged out','info'); this.showLogin(); } }

        // Utilities
        updateText(sel, txt) { const e = $(sel); if (e) e.textContent = txt; }

        generateReport(type = 'comprehensive') {
            toast('Generating report...', 'info');
            
            setTimeout(() => {
                let csvContent = '';
                let filename = '';
                
                switch(type) {
                    case 'patients':
                        csvContent = this.generatePatientsReport();
                        filename = `nexa_patients_report_${new Date().toISOString().split('T')[0]}.csv`;
                        break;
                    case 'appointments':
                        csvContent = this.generateAppointmentsReport();
                        filename = `nexa_appointments_report_${new Date().toISOString().split('T')[0]}.csv`;
                        break;
                    case 'financial':
                        csvContent = this.generateFinancialReport();
                        filename = `nexa_financial_report_${new Date().toISOString().split('T')[0]}.csv`;
                        break;
                    default:
                        csvContent = this.generateComprehensiveReport();
                        filename = `nexa_comprehensive_report_${new Date().toISOString().split('T')[0]}.csv`;
                }
                
                this.downloadCSV(csvContent, filename);
                toast('Report generated and downloaded!', 'success');
                this.nm.add('Report Generated', `${type} report downloaded`, 'success');
            }, 1000);
        }

        generatePatientsReport() {
            const headers = ['Patient ID', 'Name', 'Phone', 'Email', 'Age', 'Gender', 'Blood Group', 'Status', 'Last Visit', 'Registration Date'];
            let csv = headers.join(',') + '\n';
            
            this.dm.patients.forEach(patient => {
                const row = [
                    patient.id,
                    `"${patient.name}"`,
                    patient.phone,
                    patient.email || 'N/A',
                    age(patient.dob),
                    patient.gender || 'N/A',
                    patient.blood || 'N/A',
                    patient.status,
                    patient.lastVisit ? fmtDate(patient.lastVisit, {year: 'numeric', month: '2-digit', day: '2-digit'}) : 'Never',
                    fmtDate(patient.createdAt, {year: 'numeric', month: '2-digit', day: '2-digit'})
                ];
                csv += row.join(',') + '\n';
            });
            
            return csv;
        }

        generateAppointmentsReport() {
            const headers = ['Appointment ID', 'Patient Name', 'Patient ID', 'Doctor', 'Date', 'Time', 'Reason', 'Status', 'Type', 'Created Date'];
            let csv = headers.join(',') + '\n';
            
            this.dm.appointments.forEach(appointment => {
                const appointmentDate = new Date(appointment.datetime);
                const row = [
                    appointment.id,
                    `"${appointment.patientName}"`,
                    appointment.patientId,
                    `"${appointment.doctor}"`,
                    fmtDate(appointmentDate, {year: 'numeric', month: '2-digit', day: '2-digit'}),
                    fmtDate(appointmentDate, {hour: '2-digit', minute: '2-digit'}),
                    `"${appointment.reason}"`,
                    appointment.status,
                    appointment.type || 'consultation',
                    fmtDate(appointment.createdAt, {year: 'numeric', month: '2-digit', day: '2-digit'})
                ];
                csv += row.join(',') + '\n';
            });
            
            return csv;
        }

        generateFinancialReport() {
            // Mock financial data - in real app, this would come from your database
            const headers = ['Month', 'Total Appointments', 'Completed Appointments', 'Revenue', 'Expenses', 'Profit'];
            let csv = headers.join(',') + '\n';
            
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            months.forEach(month => {
                const appointments = Math.floor(Math.random() * 50) + 20;
                const completed = Math.floor(appointments * 0.85);
                const revenue = completed * 150; // $150 per appointment
                const expenses = revenue * 0.6; // 60% expenses
                const profit = revenue - expenses;
                
                const row = [
                    month,
                    appointments,
                    completed,
                    `$${revenue}`,
                    `$${expenses}`,
                    `$${profit}`
                ];
                csv += row.join(',') + '\n';
            });
            
            return csv;
        }

        generateComprehensiveReport() {
            const stats = this.dm.getStats();
            const currentDate = new Date();
            
            let csv = 'NEXA HEALTH - COMPREHENSIVE REPORT\n';
            csv += `Generated on: ${fmtDate(currentDate)}\n\n`;
            
            // Practice Statistics
            csv += 'PRACTICE STATISTICS\n';
            csv += `Total Patients,${stats.totalPatients}\n`;
            csv += `Today's Appointments,${stats.todayAppointments}\n`;
            csv += `Pending Reminders,${stats.pendingReminders}\n`;
            csv += `Active Doctors,${stats.activeDoctors}\n\n`;
            
            // Patient Demographics
            csv += 'PATIENT DEMOGRAPHICS\n';
            const genderCount = { male: 0, female: 0, other: 0 };
            this.dm.patients.forEach(p => {
                if (p.gender === 'Male') genderCount.male++;
                else if (p.gender === 'Female') genderCount.female++;
                else genderCount.other++;
            });
            csv += `Male Patients,${genderCount.male}\n`;
            csv += `Female Patients,${genderCount.female}\n`;
            csv += `Other/Unspecified,${genderCount.other}\n\n`;
            
            // Recent Activity Summary
            csv += 'RECENT ACTIVITY (Last 7 days)\n';
            const recentPatients = this.dm.patients.filter(p => 
                new Date(p.createdAt) > new Date(currentDate - 7 * 24 * 60 * 60 * 1000)
            ).length;
            const recentAppointments = this.dm.appointments.filter(a => 
                new Date(a.createdAt) > new Date(currentDate - 7 * 24 * 60 * 60 * 1000)
            ).length;
            csv += `New Patients,${recentPatients}\n`;
            csv += `New Appointments,${recentAppointments}\n\n`;
            
            // Detailed Patient Data
            csv += 'DETAILED PATIENT DATA\n';
            const patientHeaders = ['ID', 'Name', 'Phone', 'Status', 'Last Visit'];
            csv += patientHeaders.join(',') + '\n';
            this.dm.patients.slice(0, 10).forEach(patient => {
                const row = [
                    patient.id,
                    `"${patient.name}"`,
                    patient.phone,
                    patient.status,
                    patient.lastVisit ? fmtDate(patient.lastVisit, {year: 'numeric', month: '2-digit', day: '2-digit'}) : 'Never'
                ];
                csv += row.join(',') + '\n';
            });
            
            return csv;
        }

        downloadCSV(csvContent, filename) {
            // Create blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                // Create URL for the blob
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

 // ========== ENHANCED CHATBOT WITH HOSPITAL FINDER ==========
class Chatbot {
    constructor(dm, um, hf) { 
        this.dm = dm; 
        this.um = um; 
        this.hf = hf;
        this.state = {}; 
        this.conversationContext = [];
        this.init(); 
    }

    init() {
        this.setupEvents();
        this.setupQuickActions();
        setTimeout(() => this.addMessage("Hello! I'm NEXA assistant. I can help with appointments, registration, medical guidance, hospital finding, and clinic info. How can I help you today?", 'bot', 'cw-messages'), 1000);
    }

    setupEvents() {
        $('#cw-open')?.addEventListener('click', () => this.toggle());
        $('#cw-close')?.addEventListener('click', () => this.close());
        $('#cw-minimize')?.addEventListener('click', () => this.close());
        
        const send = (inp, con) => { 
            const m = inp.value.trim(); 
            if (m) { 
                this.addMessage(m, 'user', con); 
                inp.value = ''; 
                this.process(m, con); 
            } 
        };
        
        $('#cw-send')?.addEventListener('click', () => send($('#cw-input'), 'cw-messages'));
        $('#cw-input')?.addEventListener('keypress', e => { 
            if (e.key === 'Enter') send($('#cw-input'), 'cw-messages'); 
        });
        $('#chat-send-full')?.addEventListener('click', () => send($('#chat-input-full'), 'chat-messages-full'));
        $('#chat-input-full')?.addEventListener('keypress', e => { 
            if (e.key === 'Enter') send($('#chat-input-full'), 'chat-messages-full'); 
        });
    }

    setupQuickActions() {
        const quickActions = [
            { action: 'appointment', text: 'Check Appointment', icon: 'calendar-check' },
            { action: 'register', text: 'Register Patient', icon: 'user-plus' },
            { action: 'hours', text: 'Clinic Hours', icon: 'clock' },
            { action: 'emergency', text: 'Emergency Help', icon: 'ambulance' },
            { action: 'prescription', text: 'Prescription Refill', icon: 'prescription' },
            { action: 'results', text: 'Lab Results', icon: 'file-medical' },
            { action: 'hospital', text: 'Find Hospital', icon: 'hospital' },
            { action: 'documents', text: 'Visit Preparation', icon: 'folder-open' }
        ];

        const quickActionsContainer = $('.cw-quick-actions');
        if (quickActionsContainer) {
            quickActionsContainer.innerHTML = quickActions.map(action => `
                <button class="quick-chip" data-action="${action.action}">
                    <i class="fas fa-${action.icon}"></i>
                    ${action.text}
                </button>
            `).join('');
        }

        $$('.quick-chip').forEach(chip => {
            chip.addEventListener('click', () => this.handleQuickAction(chip.dataset.action));
        });
    }

    // Enhanced intent recognition with pattern matching
    recognizeIntent(message) {
        const msg = message.toLowerCase().trim();
        
        const intents = {
            appointment: [
                /appointment|schedule|booking|meeting|consultation/,
                /when.*(available|free)/,
                /book.*(slot|time)/
            ],
            registration: [
                /register|sign up|new patient|create account/,
                /join.*clinic/,
                /become.*patient/
            ],
            medical: [
                /symptom|pain|hurt|fever|cough|headache|nausea/,
                /emergency|urgent|help.*now/,
                /medicine|prescription|drug|pill/
            ],
            information: [
                /hours|open|close|time|schedule/,
                /contact|phone|email|address|location/,
                /doctor|physician|specialist|dr\./,
                /service|treatment|facility|clinic/
            ],
            results: [
                /lab.*result|test.*report|blood.*test/,
                /report.*ready|get.*results/
            ],
            prescription: [
                /prescription|refill|medicine|medication/,
                /need.*refill|out.*of.*medicine/
            ],
            hospital: [
                /hospital|find.*doctor|specialist|emergency.*center/,
                /where.*go|which.*hospital/,
                /cardiology|diabetes|pediatric|obstetric/
            ],
            documents: [
                /document|test.*report|bring|prepare|what.*to.*bring/,
                /requirement|needed|paperwork|medical.*record/,
                /before.*appointment|visit.*preparation/
            ]
        };

        for (const [intent, patterns] of Object.entries(intents)) {
            if (patterns.some(pattern => pattern.test(msg))) {
                return intent;
            }
        }
        
        return 'general';
    }

    // Context-aware response generation
    process(message, container) {
        const intent = this.recognizeIntent(message);
        this.conversationContext.push({ role: 'user', message, intent, timestamp: new Date() });
        
        // Keep only last 10 messages for context
        if (this.conversationContext.length > 10) {
            this.conversationContext = this.conversationContext.slice(-10);
        }

        // Show typing indicator
        this.showTypingIndicator(container);
        
        setTimeout(() => {
            this.hideTypingIndicator(container);
            this.generateResponse(intent, message, container);
        }, 1000 + Math.random() * 500);
    }

    generateResponse(intent, message, container) {
        switch(intent) {
            case 'appointment':
                this.handleAppointmentIntent(message, container);
                break;
            case 'registration':
                this.handleRegistrationIntent(message, container);
                break;
            case 'medical':
                this.handleMedicalIntent(message, container);
                break;
            case 'information':
                this.handleInformationIntent(message, container);
                break;
            case 'results':
                this.handleResultsIntent(message, container);
                break;
            case 'prescription':
                this.handlePrescriptionIntent(message, container);
                break;
            case 'hospital':
                this.handleHospitalIntent(message, container);
                break;
            case 'documents':
                this.handleDocumentsIntent(message, container);
                break;
            default:
                this.handleGeneralQuery(message, container);
        }
    }

    // Enhanced Hospital Finder Integration
    handleHospitalIntent(message, container) {
        const msg = message.toLowerCase();
        
        if (msg.includes('cardiac') || msg.includes('heart')) {
            this.findSpecializedHospitals('cardiology', container);
        } else if (msg.includes('diabet') || msg.includes('sugar')) {
            this.findSpecializedHospitals('diabetes', container);
        } else if (msg.includes('child') || msg.includes('pediatric') || msg.includes('baby')) {
            this.findSpecializedHospitals('pediatrics', container);
        } else if (msg.includes('pregnant') || msg.includes('maternity') || msg.includes('obstetric')) {
            this.findSpecializedHospitals('obstetrics', container);
        } else if (msg.includes('emergency') || msg.includes('trauma')) {
            this.findSpecializedHospitals('emergency', container);
        } else if (msg.includes('infectious') || msg.includes('fever') || msg.includes('covid')) {
            this.findSpecializedHospitals('infectious', container);
        } else {
            this.startHospitalSearch(message, container);
        }
    }

    findSpecializedHospitals(specialty, container) {
        const hospitals = this.hf.hospitals.filter(hospital => 
            hospital.specialties[specialty] && hospital.specialties[specialty].length > 0
        );

        if (hospitals.length > 0) {
            let response = `🏥 **Specialized Hospitals for ${this.getSpecialtyName(specialty)}:**\n\n`;
            
            hospitals.forEach((hospital, index) => {
                response += `${index + 1}. **${hospital.name}**\n`;
                response += `   📍 ${hospital.location}\n`;
                response += `   🏥 ${hospital.type.toUpperCase()} Hospital\n`;
                
                const availableDoctors = hospital.specialties[specialty].filter(doc => doc.status === 'available');
                if (availableDoctors.length > 0) {
                    response += `   👨‍⚕️ Available Doctors: ${availableDoctors.map(doc => doc.name).join(', ')}\n`;
                }
                
                response += `   📞 Emergency: ${this.getHospitalEmergencyContact(hospital.id)}\n\n`;
            });

            response += "Would you like:\n• More details about any hospital\n• Directions to a specific hospital\n• Pre-visit preparation guide";
            this.addMessage(response, 'bot', container);
            
            // Store context for follow-up
            this.state.lastHospitalSearch = { specialty, hospitals };
        } else {
            this.addMessage(`I couldn't find specialized ${this.getSpecialtyName(specialty)} hospitals in our database. Please try a different specialty or contact our main helpline for assistance.`, 'bot', container);
        }
    }

    startHospitalSearch(message, container) {
        this.state.awaiting = 'hospital_specialty';
        this.addMessage("I can help you find the right hospital! Please tell me:\n\n" +
            "• What specialty do you need? (e.g., cardiology, diabetes, pediatrics)\n" +
            "• Or describe your medical condition\n" +
            "• Preferred location/city", 'bot', container);
    }

    // Pre-Visit Document and Preparation Guide
    handleDocumentsIntent(message, container) {
        const msg = message.toLowerCase();
        
        if (msg.includes('general') || msg.includes('routine') || msg.includes('checkup')) {
            this.provideGeneralVisitPreparation(container);
        } else if (msg.includes('cardiac') || msg.includes('heart')) {
            this.provideCardiacVisitPreparation(container);
        } else if (msg.includes('diabet') || msg.includes('sugar')) {
            this.provideDiabetesVisitPreparation(container);
        } else if (msg.includes('surgery') || msg.includes('operation')) {
            this.provideSurgicalVisitPreparation(container);
        } else if (msg.includes('test') || msg.includes('lab') || msg.includes('report')) {
            this.provideTestVisitPreparation(container);
        } else {
            this.startVisitPreparationGuide(message, container);
        }
    }

    provideGeneralVisitPreparation(container) {
        const response = `📋 **General Doctor Visit Preparation:**\n\n` +
            `**Essential Documents to Bring:**\n` +
            `• National ID Card/Passport\n` +
            `• Health Insurance Card (if applicable)\n` +
            `• Previous medical records\n` +
            `• Current medication list with dosages\n` +
            `• Allergy information\n\n` +
            
            `**Medical History to Prepare:**\n` +
            `• List of current symptoms\n` +
            `• Past surgeries/hospitalizations\n` +
            `• Family medical history\n` +
            `• Lifestyle information (diet, exercise, smoking)\n\n` +
            
            `**What to Expect:**\n` +
            `• Vital signs check (BP, temperature, pulse)\n` +
            `• Physical examination\n` +
            `• Discussion of symptoms\n` +
            `• Possible basic blood tests\n\n` +
            
            `⏰ **Arrive 15 minutes early for paperwork**`;

        this.addMessage(response, 'bot', container);
    }

    provideCardiacVisitPreparation(container) {
        const response = `❤️ **Cardiology Visit Preparation:**\n\n` +
            `**Essential Documents & Tests:**\n` +
            `• All previous ECG/EKG reports\n` +
            `• Echocardiogram results\n` +
            `• Stress test reports\n` +
            `• Cardiac catheterization records\n` +
            `• Blood test results (cholesterol, triglycerides)\n\n` +
            
            `**Pre-Visit Instructions:**\n` +
            `• Avoid caffeine 12 hours before appointment\n` +
            `• Wear comfortable, loose-fitting clothing\n` +
            `• Bring all current heart medications\n` +
            `• Note down any chest pain episodes\n` +
            `• Record blood pressure readings if available\n\n` +
            
            `**Questions to Prepare:**\n` +
            `• Frequency of symptoms\n` +
            `• Triggers for chest pain\n` +
            `• Exercise tolerance levels\n` +
            `• Family history of heart disease`;

        this.addMessage(response, 'bot', container);
    }

    provideDiabetesVisitPreparation(container) {
        const response = `🩸 **Diabetes Specialist Visit Preparation:**\n\n` +
            `**Essential Documents & Records:**\n` +
            `• Blood sugar monitoring log (2 weeks minimum)\n` +
            `• HbA1c test results\n` +
            `• Lipid profile reports\n` +
            `• Kidney function tests\n` +
            `• Current insulin/medication details\n\n` +
            
            `**Pre-Visit Instructions:**\n` +
            `• Fast for 8-12 hours if blood tests needed\n` +
            `• Bring glucose meter and strips\n` +
            `• Record recent hypoglycemia episodes\n` +
            `• Note any vision changes or numbness\n` +
            `• List all medications including supplements\n\n` +
            
            `**Diet & Lifestyle Records:**\n` +
            `• 3-day food diary\n` +
            `• Exercise routine\n` +
            `• Alcohol consumption details\n` +
            `• Smoking history`;

        this.addMessage(response, 'bot', container);
    }

    provideSurgicalVisitPreparation(container) {
        const response = `🔪 **Surgical Consultation Preparation:**\n\n` +
            `**Essential Medical Documents:**\n` +
            `• All imaging reports (X-ray, MRI, CT scans)\n` +
            `• Previous surgical reports\n` +
            `• Pathology reports if available\n` +
            `• Current medication list\n` +
            `• Allergy information\n\n` +
            
            `**Pre-Consultation Instructions:**\n` +
            `• List all current symptoms\n` +
            `• Note duration of condition\n` +
            `• Record previous treatments tried\n` +
            `• Bring insurance/pre-authorization documents\n` +
            `• Prepare questions about procedure risks\n\n` +
            
            `**For Surgery Day (if scheduled):**\n` +
            `• Fast as instructed (usually 8-12 hours)\n` +
            `• Arrange transportation home\n` +
            `• Bring comfortable clothing\n` +
            `• Remove jewelry and makeup\n` +
            `• Follow specific medication instructions`;

        this.addMessage(response, 'bot', container);
    }

    provideTestVisitPreparation(container) {
        const response = `🧪 **Lab Test/Diagnostic Visit Preparation:**\n\n` +
            `**Common Test Preparations:**\n\n` +
            `**Blood Tests:**\n` +
            `• Fasting required: 8-12 hours for most tests\n` +
            `• Water is usually allowed\n` +
            `• Avoid alcohol 24 hours before\n` +
            `• Inform about medications\n\n` +
            
            `**Ultrasound:**\n` +
            `• Abdomen: Fast for 6-8 hours\n` +
            `• Pelvic: Drink water, don't empty bladder\n` +
            `• No special prep for other areas\n\n` +
            
            `**MRI/CT Scan:**\n` +
            `• Remove all metal objects\n` +
            `• Inform about implants/pregnancy\n` +
            `• Contrast dye may require fasting\n\n` +
            
            `**Endoscopy:**\n` +
            `• Complete fasting 8 hours before\n` +
            `• Arrange transportation home\n` +
            `• Stop blood thinners if advised`;

        this.addMessage(response, 'bot', container);
    }

    startVisitPreparationGuide(message, container) {
        this.state.awaiting = 'visit_type';
        this.addMessage("I can help you prepare for your medical visit! Please tell me:\n\n" +
            "• Type of visit (general checkup, specialist, surgery, tests)\n" +
            "• Medical specialty (cardiology, diabetes, etc.)\n" +
            "• Or describe what you're visiting for", 'bot', container);
    }

    // Enhanced Quick Actions Handler
    handleQuickAction(action) {
        const actions = {
            appointment: () => this.addMessage("To check appointments, please provide your patient ID or phone number.", 'bot', 'cw-messages'),
            register: () => { 
                this.state.registration = {}; 
                this.state.awaiting = 'full_name'; 
                this.addMessage("I'll help you register! What's your full name?", 'bot', 'cw-messages'); 
            },
            hours: () => this.addMessage("🕒 **Clinic Hours:**\n\n• Mon-Thu: 8:00 AM - 6:00 PM\n• Friday: 8:00 AM - 5:00 PM\n• Saturday: 9:00 AM - 2:00 PM\n• Sunday: Closed\n\nEmergency services available 24/7", 'bot', 'cw-messages'),
            emergency: () => this.addMessage("🚨 **Emergency Assistance**\n\nFor immediate medical help:\n• Call: 1122 (Emergency Services)\n• Our Emergency Dept: +92-300-1234567\n• Location: Main Hospital Building\n\nPlease describe your emergency:", 'bot', 'cw-messages'),
            prescription: () => this.addMessage("For prescription refills, I'll need:\n\n1. Your patient ID\n2. Medication name\n3. Pharmacy preference\n\nPlease provide your patient ID to continue.", 'bot', 'cw-messages'),
            results: () => this.addMessage("To check lab results:\n\n1. Provide your patient ID\n2. Specify the test type (if known)\n3. Date of test (if known)\n\nPlease start with your patient ID:", 'bot', 'cw-messages'),
            hospital: () => this.addMessage("🏥 **Hospital Finder**\n\nI can help you find specialized hospitals. Please tell me:\n• Medical specialty needed\n• Preferred location\n• Or describe your condition", 'bot', 'cw-messages'),
            documents: () => this.addMessage("📋 **Visit Preparation Guide**\n\nI'll help you prepare for your medical visit. Please specify:\n• Type of visit (checkup, specialist, tests)\n• Medical specialty\n• Or describe what you need", 'bot', 'cw-messages')
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    // Utility Methods for Hospital Finder
    getSpecialtyName(specialty) {
        const specialtyNames = {
            'diabetes': 'Diabetes/Endocrinology',
            'cardiology': 'Cardiology',
            'emergency': 'Emergency/Trauma',
            'pediatrics': 'Pediatrics',
            'obstetrics': 'Obstetrics & Gynecology',
            'infectious': 'Infectious Diseases'
        };
        return specialtyNames[specialty] || specialty;
    }

    getHospitalEmergencyContact(hospitalId) {
        const contacts = {
            1: '+92-21-99215700',
            2: '+92-21-99261300', 
            3: '+92-22-9201771'
        };
        return contacts[hospitalId] || '+92-300-1234567';
    }

    // Enhanced process method to handle follow-up questions
    process(message, container) {
        const intent = this.recognizeIntent(message);
        this.conversationContext.push({ role: 'user', message, intent, timestamp: new Date() });
        
        // Keep only last 10 messages for context
        if (this.conversationContext.length > 10) {
            this.conversationContext = this.conversationContext.slice(-10);
        }

        // Show typing indicator
        this.showTypingIndicator(container);
        
        setTimeout(() => {
            this.hideTypingIndicator(container);
            
            // Handle follow-up questions based on state
            if (this.state.awaiting === 'hospital_specialty') {
                this.handleHospitalSpecialtyResponse(message, container);
            } else if (this.state.awaiting === 'visit_type') {
                this.handleVisitTypeResponse(message, container);
            } else {
                this.generateResponse(intent, message, container);
            }
        }, 1000 + Math.random() * 500);
    }

    handleHospitalSpecialtyResponse(message, container) {
        this.state.awaiting = null;
        this.handleHospitalIntent(message, container);
    }

    handleVisitTypeResponse(message, container) {
        this.state.awaiting = null;
        this.handleDocumentsIntent(message, container);
    }

    // ... (Keep all previous utility methods from the enhanced chatbot)

    // UI Methods (same as before)
    toggle() { 
        const w = $('#chatbot-widget'); 
        if (w) { 
            w.classList.toggle('active'); 
            if (w.classList.contains('active')) $('#cw-input')?.focus(); 
        } 
    }
    
    close() { 
        $('#chatbot-widget')?.classList.remove('active'); 
    }

    addMessage(text, sender = 'bot', container) { 
        const messagesContainer = $(`#${container}`); 
        if (!messagesContainer) return; 
        
        const messageDiv = document.createElement('div'); 
        messageDiv.className = `msg ${sender}`; 
        messageDiv.textContent = text; 
        messagesContainer.appendChild(messageDiv); 
        messagesContainer.scrollTop = messagesContainer.scrollHeight; 
    }

    showTypingIndicator(container) {
        const messagesContainer = $(`#${container}`);
        if (!messagesContainer) return;
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator(container) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

   // Enhanced Utility Methods
validatePhone(phone) {
    // Enhanced phone validation for Pakistan numbers
    const phoneRegex = /^[\+]?(92)?[-\s]?[3][0-9]{2}[-\s]?[0-9]{7}$/;
    const cleanedPhone = phone.replace(/[-\s]/g, '');
    
    // Check if it's a valid Pakistani mobile number
    if (cleanedPhone.startsWith('92') && cleanedPhone.length === 12) {
        return phoneRegex.test(phone);
    }
    // Check if it's without country code
    else if (cleanedPhone.startsWith('3') && cleanedPhone.length === 10) {
        return true;
    }
    // Check international format
    else if (cleanedPhone.startsWith('+92') && cleanedPhone.length === 13) {
        return true;
    }
    
    return false;
}

validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

validateDateOfBirth(dob) {
    // Support multiple formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const dateRegex = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})$/;
    if (!dateRegex.test(dob)) return false;
    
    let day, month, year;
    
    if (dob.includes('/')) {
        const parts = dob.split('/');
        if (parts[0].length === 4) {
            // YYYY/MM/DD format
            [year, month, day] = parts.map(Number);
        } else {
            // DD/MM/YYYY format
            [day, month, year] = parts.map(Number);
        }
    } else if (dob.includes('-')) {
        const parts = dob.split('-');
        if (parts[0].length === 4) {
            // YYYY-MM-DD format
            [year, month, day] = parts.map(Number);
        } else {
            // DD-MM-YYYY format
            [day, month, year] = parts.map(Number);
        }
    }
    
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // 120 years max
    
    return date instanceof Date && 
           !isNaN(date) && 
           date < today && 
           date > minDate &&
           date.getDate() === day &&
           date.getMonth() === month - 1 &&
           date.getFullYear() === year;
}

formatDateOfBirth(dob) {
    let day, month, year;
    
    if (dob.includes('/')) {
        const parts = dob.split('/');
        if (parts[0].length === 4) {
            [year, month, day] = parts.map(Number);
        } else {
            [day, month, year] = parts.map(Number);
        }
    } else if (dob.includes('-')) {
        const parts = dob.split('-');
        if (parts[0].length === 4) {
            [year, month, day] = parts.map(Number);
        } else {
            [day, month, year] = parts.map(Number);
        }
    }
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

extractPatientInfo(message) {
    // Enhanced phone pattern matching
    const phonePatterns = [
        /(\+92[\-\s]?[3][0-9]{2}[\-\s]?[0-9]{7})/, // +92-300-1234567
        /(92[\-\s]?[3][0-9]{2}[\-\s]?[0-9]{7})/,   // 92-300-1234567
        /([3][0-9]{2}[\-\s]?[0-9]{7})/,            // 300-1234567
        /(\+?[\d\-\s\(\)]{10,})/                   // Fallback pattern
    ];
    
    let phone = null;
    for (const pattern of phonePatterns) {
        const match = message.match(pattern);
        if (match) {
            phone = match[0].replace(/[-\s\(\)]/g, '');
            // Ensure it starts with country code if needed
            if (phone.startsWith('3') && phone.length === 10) {
                phone = '92' + phone;
            }
            break;
        }
    }
    
    // Enhanced patient ID pattern
    const idMatch = message.match(/\b(P-\w{4,8})\b/i);
    
    return {
        phone: phone,
        id: idMatch ? idMatch[1].toUpperCase() : null,
        email: message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)?.[0] || null
    };
}

findPatient(patientInfo) {
    if (patientInfo.id) {
        return this.dm.patients.find(p => p.id === patientInfo.id);
    } else if (patientInfo.phone) {
        // Clean phone for comparison
        const cleanPhone = patientInfo.phone.replace(/[-\s]/g, '');
        return this.dm.patients.find(p => {
            const patientPhone = p.phone.replace(/[-\s]/g, '');
            return patientPhone.includes(cleanPhone) || cleanPhone.includes(patientPhone);
        });
    } else if (patientInfo.email) {
        return this.dm.patients.find(p => p.email && p.email.toLowerCase() === patientInfo.email.toLowerCase());
    }
    return null;
}

extractSymptoms(message) {
    const symptomKeywords = {
        fever: { 
            patterns: [/fever/, /temperature/, /hot/, /chills/, /sweating/],
            severity: 2
        },
        cough: { 
            patterns: [/cough/, /coughing/, /phlegm/, /sputum/],
            severity: 1
        },
        headache: { 
            patterns: [/headache/, /head pain/, /migraine/],
            severity: 2
        },
        nausea: { 
            patterns: [/nausea/, /sick to stomach/, /vomit/, /throwing up/],
            severity: 2
        },
        pain: { 
            patterns: [/pain/, /hurt/, /aching/, /sore/],
            severity: 3
        },
        dizziness: { 
            patterns: [/dizzy/, /lightheaded/, /vertigo/, /spinning/],
            severity: 2
        },
        fatigue: { 
            patterns: [/tired/, /fatigue/, /weak/, /exhausted/],
            severity: 1
        },
        breathing: {
            patterns: [/breath/, /wheeze/, /shortness of breath/, /can't breathe/],
            severity: 3
        },
        chest: {
            patterns: [/chest pain/, /chest tightness/, /heart pain/],
            severity: 3
        }
    };
    
    const foundSymptoms = [];
    const msg = message.toLowerCase();
    
    for (const [symptom, data] of Object.entries(symptomKeywords)) {
        if (data.patterns.some(pattern => pattern.test(msg))) {
            foundSymptoms.push({
                name: symptom,
                severity: data.severity,
                emergency: data.severity >= 3
            });
        }
    }
    
    return foundSymptoms;
}

generateAvailableSlots() {
    const slots = [];
    const doctors = ['Dr. Ahmed Khan', 'Dr. Ayesha Rahman', 'Dr. Muhammad Ali', 'Dr. Fatima Noor'];
    const startTime = new Date();
    
    // Generate slots for next 7 days
    for (let i = 1; i <= 7; i++) {
        const date = new Date(startTime);
        date.setDate(date.getDate() + i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        doctors.forEach(doctor => {
            // Generate 3-4 slots per doctor per day
            const slotCount = 3 + Math.floor(Math.random() * 2);
            
            for (let j = 0; j < slotCount; j++) {
                const slotTime = new Date(date);
                const hour = 9 + j * 2; // 9 AM, 11 AM, 1 PM, 3 PM
                slotTime.setHours(hour, 0, 0, 0);
                
                // Only add slots during clinic hours (9 AM - 5 PM)
                if (slotTime.getHours() >= 9 && slotTime.getHours() <= 17) {
                    // Randomly mark some slots as unavailable
                    const available = Math.random() > 0.3; // 70% available
                    
                    slots.push({
                        doctor,
                        datetime: slotTime.toISOString(),
                        available: available,
                        duration: 30, // 30-minute slots
                        type: available ? 'available' : 'booked'
                    });
                }
            }
        });
    }
    
    // Sort by datetime
    return slots.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

// Enhanced UI Methods with better user experience
toggle() { 
    const w = $('#chatbot-widget'); 
    if (w) { 
        w.classList.toggle('active'); 
        if (w.classList.contains('active')) {
            $('#cw-input')?.focus();
            // Auto-scroll to latest message
            setTimeout(() => {
                const messages = $('#cw-messages');
                if (messages) messages.scrollTop = messages.scrollHeight;
            }, 100);
        }
    } 
}

close() { 
    $('#chatbot-widget')?.classList.remove('active'); 
    // Reset any ongoing conversations
    this.state = {};
    this.conversationContext = [];
}

addMessage(text, sender = 'bot', container) { 
    const messagesContainer = $(`#${container}`); 
    if (!messagesContainer) return; 
    
    const messageDiv = document.createElement('div'); 
    messageDiv.className = `msg ${sender}`;
    
    // Format bot messages with better readability
    if (sender === 'bot') {
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedText;
    } else {
        messageDiv.textContent = text;
    }
    
    messagesContainer.appendChild(messageDiv); 
    
    // Smooth scroll to bottom
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

showTypingIndicator(container) {
    const messagesContainer = $(`#${container}`);
    if (!messagesContainer) return;
    
    // Remove existing typing indicator if any
    this.hideTypingIndicator(container);
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <span class="typing-text">NEXA is typing...</span>
    `;
    
    messagesContainer.appendChild(typingIndicator);
    
    // Smooth scroll to show typing indicator
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

hideTypingIndicator(container) {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Enhanced appointment booking with step-by-step process
startAppointmentBooking(message, container) {
    const patientInfo = this.extractPatientInfo(message);
    
    if (patientInfo.phone || patientInfo.id) {
        const patient = this.findPatient(patientInfo);
        if (patient) {
            this.state.booking = { patientId: patient.id, patientName: patient.name };
            this.state.awaiting = 'appointment_reason';
            this.addMessage(`Great! I found your record ${patient.name}. What is the reason for your appointment?`, 'bot', container);
        } else {
            this.addMessage("I couldn't find your patient record. Please make sure your patient ID or phone number is correct, or type 'register' to create a new account.", 'bot', container);
        }
    } else {
        this.state.awaiting = 'patient_info_booking';
        this.addMessage("To book an appointment, I'll need your patient information. Please provide your patient ID or phone number.", 'bot', container);
    }
}

handleAppointmentModification(message, container) {
    const patientInfo = this.extractPatientInfo(message);
    
    if (patientInfo.phone || patientInfo.id) {
        const patient = this.findPatient(patientInfo);
        if (patient) {
            const appointments = this.dm.appointments.filter(ap => 
                ap.patientId === patient.id && 
                ap.status === 'scheduled' &&
                new Date(ap.datetime) >= new Date()
            );
            
            if (appointments.length > 0) {
                let response = `Found ${appointments.length} upcoming appointment(s):\n\n`;
                appointments.forEach((apt, index) => {
                    response += `${index + 1}. ${fmtDate(apt.datetime)} with ${apt.doctor}\n`;
                    response += `   Reason: ${apt.reason}\n\n`;
                });
                response += "Which appointment would you like to modify? Please specify the number.";
                
                this.addMessage(response, 'bot', container);
                this.state.modifying = { patientId: patient.id, appointments };
                this.state.awaiting = 'appointment_selection';
            } else {
                this.addMessage("No upcoming appointments found to modify.", 'bot', container);
            }
        } else {
            this.addMessage("I couldn't find your patient record. Please check your patient ID or phone number.", 'bot', container);
        }
    } else {
        this.state.awaiting = 'patient_info_modify';
        this.addMessage("To modify an appointment, I'll need your patient information. Please provide your patient ID or phone number.", 'bot', container);
    }
}

// Additional utility methods for better chatbot functionality
calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

formatPhoneNumber(phone) {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
        return `+92-${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('92')) {
        return `+${cleaned.substring(0, 2)}-${cleaned.substring(2, 5)}-${cleaned.substring(5)}`;
    }
    
    return phone;
}

// Emergency symptom detection
detectEmergencySymptoms(symptoms) {
    const emergencySymptoms = symptoms.filter(symptom => symptom.emergency);
    return emergencySymptoms.length > 0;
}

// Generate patient summary for quick reference
generatePatientSummary(patient) {
    return {
        name: patient.name,
        age: this.calculateAge(patient.dob),
        gender: patient.gender || 'Not specified',
        bloodGroup: patient.blood || 'Not specified',
        lastVisit: patient.lastVisit ? fmtDate(patient.lastVisit) : 'Never',
        status: patient.status
    };
}
}

    // ========== HOSPITAL FINDER ==========
    class HospitalFinder {
        constructor() {
            this.hospitals = [
                { id:1, name:"Civil Hospital Karachi", city:"karachi", type:"public", location:"Karachi, Sindh",
                  specialties: { diabetes:[{name:"Dr. Amir Khan",status:"available"},{name:"Dr. Sana Riaz",status:"available"}],
                  cardiology:[{name:"Dr. Tariq Aziz",status:"available"},{name:"Dr. Rahimullah Shah",status:"busy"}],
                  emergency:[{name:"Dr. Asif Mir",status:"available"},{name:"Dr. Sofia Rauf",status:"available"}],
                  pediatrics:[{name:"Dr. Rabia Khan",status:"available"},{name:"Dr. Usman Farooq",status:"busy"}],
                  obstetrics:[{name:"Dr. Naila Hussain",status:"available"},{name:"Dr. Farzana Mir",status:"available"}],
                  infectious:[{name:"Dr. Khalid Jamal",status:"available"},{name:"Dr. Maria Abbas",status:"available"}] }},
                { id:2, name:"Jinnah Hospital Karachi", city:"karachi", type:"public", location:"Karachi, Sindh",
                  specialties: { diabetes:[{name:"Dr. Salman Khan",status:"available"},{name:"Dr. Rida Farooq",status:"available"}],
                  cardiology:[{name:"Dr. Nadeem Aziz",status:"available"},{name:"Dr. Samreen Bukhari",status:"busy"}],
                  emergency:[{name:"Dr. Naveed Akhtar",status:"available"},{name:"Dr. Tahira Khalid",status:"available"}],
                  pediatrics:[{name:"Dr. Kausar Javed",status:"available"},{name:"Dr. Zubair Hashmi",status:"busy"}],
                  obstetrics:[{name:"Dr. Samina Rafiq",status:"available"},{name:"Dr. Noreen Akbar",status:"available"}],
                  infectious:[{name:"Dr. Farooq Ahmed",status:"available"},{name:"Dr. Maliha Riaz",status:"busy"}] }},
                { id:3, name:"Civil Hospital Hyderabad", city:"hyderabad", type:"public", location:"Hyderabad, Sindh",
                  specialties: { diabetes:[{name:"Dr. Arif Memon",status:"available"},{name:"Dr. Huma Qureshi",status:"busy"}],
                  cardiology:[{name:"Dr. Saeed Khan",status:"available"},{name:"Dr. Nida Jamali",status:"available"}],
                  emergency:[{name:"Dr. Faisal Khawaja",status:"available"},{name:"Dr. Rihana Gohar",status:"busy"}],
                  pediatrics:[{name:"Dr. Kashif Ansari",status:"available"},{name:"Dr. Shabana Laghari",status:"available"}],
                  obstetrics:[{name:"Dr. Saima Ghulam",status:"available"},{name:"Dr. Farah Memon",status:"busy"}],
                  infectious:[{name:"Dr. Altaf Khan",status:"available"},{name:"Dr. Shazia Memon",status:"available"}] }}
            ];
            this.filtered = [...this.hospitals];
            this.setup();
        }

        setup() {
            this.render();
            $('#hospital-search')?.addEventListener('input', () => this.filter());
            ['#city-filter','#specialty-filter','#type-filter'].forEach(s => $(s)?.addEventListener('change', () => this.filter()));
            $$('.emergency-btn').forEach(b => b.addEventListener('click', () => this.emergency(b.dataset.specialty)));
            $('#emergency-assistance')?.addEventListener('click', () => this.emergencyCall());
        }

        filter() {
            const f = {
                city: $('#city-filter').value, specialty: $('#specialty-filter').value,
                type: $('#type-filter').value, search: $('#hospital-search')?.value.toLowerCase() || ''
            };
            this.filtered = this.hospitals.filter(h => 
                (f.city === 'all' || h.city === f.city) &&
                (f.type === 'all' || h.type === f.type) &&
                (f.specialty === 'all' || h.specialties[f.specialty]) &&
                (!f.search || h.name.toLowerCase().includes(f.search) || h.location.toLowerCase().includes(f.search) ||
                 Object.values(h.specialties).some(ds => ds.some(d => d.name.toLowerCase().includes(f.search))))
            );
            this.render();
        }

        render() {
            const c = $('#hospital-grid');
            if (!c) return;
            $('#results-count').textContent = this.filtered.length;
            if (!this.filtered.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-hospital"></i><p>No hospitals found</p><button class="btn primary" onclick="hospitalFinder.clear()">Clear Filters</button></div>'; return; }
            c.innerHTML = this.filtered.map(h => `
                <div class="hospital-card">
                    <div class="hospital-header"><div class="hospital-name">${h.name}</div><div class="hospital-type">${h.type.toUpperCase()}</div></div>
                    <div class="hospital-info"><div class="hospital-location"><i class="fas fa-map-marker-alt"></i><span>${h.location}</span></div></div>
                    <div class="hospital-specialties">${
                        Object.entries(h.specialties).map(([s,ds]) => `
                            <div class="specialty-section">
                                <div class="specialty-title">${this.specName(s)}</div>
                                <div class="doctors-list">${
                                    ds.slice(0,3).map(d => `<div class="doctor-item"><div class="doctor-status ${d.status}"></div><span>${d.name}</span></div>`).join('')
                                }${ds.length>3?`<div class="doctor-item"><span>+${ds.length-3} more</span></div>`:''}</div>
                            </div>
                        `).join('')
                    }</div>
                    <div class="hospital-actions">
                        <button class="btn primary small" onclick="hospitalFinder.view(${h.id})"><i class="fas fa-eye"></i> View</button>
                        <button class="btn secondary small" onclick="hospitalFinder.directions(${h.id})"><i class="fas fa-directions"></i> Directions</button>
                        <button class="btn success small" onclick="hospitalFinder.contact(${h.id})"><i class="fas fa-phone"></i> Contact</button>
                    </div>
                </div>
            `).join('');
        }

        specName(s) {
            const names = { diabetes:'Diabetes/Endocrinology', cardiology:'Cardiology', emergency:'Emergency/Trauma', pediatrics:'Pediatrics', obstetrics:'Obstetrics/Gynecology', infectious:'Infectious Diseases' };
            return names[s] || s;
        }

        emergency(s) {
            $('#specialty-filter').value = s;
            this.filter();
            toast(`Showing ${this.specName(s)} specialists`,'info');
        }

        emergencyCall() {
            if (confirm('Call emergency services?')) {
                toast('Connecting...','warning');
                setTimeout(() => toast('Help dispatched!','success'), 2000);
            }
        }

        view(id) { const h = this.hospitals.find(x => x.id === id); if (h) toast(`Viewing ${h.name}`,'info'); }
        directions(id) { const h = this.hospitals.find(x => x.id === id); if (h) toast(`Directions to ${h.name}`,'info'); }
        contact(id) { const h = this.hospitals.find(x => x.id === id); if (h) toast(`Contacting ${h.name}`,'info'); }
        clear() { $('#city-filter').value = $('#specialty-filter').value = $('#type-filter').value = 'all'; $('#hospital-search').value = ''; this.filter(); }
    }

    // ========== INITIALIZATION ==========
    function init() {
        const dm = new DataManager(), nm = new Notifier(), tm = new Theme(), um = new UIManager(dm, nm), cb = new Chatbot(dm, um), hf = new HospitalFinder();
        
        // Add hospital finder to nav
        const nav = $('.sidebar-nav');
        if (nav) {
            const hfNav = `<div class="nav-group"><div class="nav-group-header"><i class="fas fa-hospital"></i><span>Hospital Finder</span></div><ul><li><a href="#" data-view="hospital-finder" class="nav-link"><i class="fas fa-search-location"></i><span>Find Hospitals</span></a></li></ul></div>`;
            const last = nav.querySelector('.nav-group:last-child');
            if (last) last.insertAdjacentHTML('beforebegin', hfNav);
        }

        setTimeout(() => {
            nm.add('System Update','NEXA Health v3.0 deployed','info');
            nm.add('High Priority','3 reminders pending','warning');
        }, 2000);

        setTimeout(() => {
            const ls = $('#loading-screen');
            if (ls) { ls.classList.add('fade-out'); setTimeout(() => ls.style.display = 'none', 500); }
        }, 1500);

        window.nexaApp = { dm, nm, tm, um, cb, hf };
        window.hospitalFinder = hf;
        console.log('🚀 NEXA Health v3.0 optimized initialized!');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    // --- Chart lifecycle helper (prevents "Canvas is already in use") ---
    window._charts = window._charts || {};

    /**
     * Safely create or update a Chart.js chart on a canvas.
     * Destroys existing instance for the same canvasId before creating if forceCreate=true.
     */
    function safeChart(canvasId, config, { forceCreate = false } = {}) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.warn('safeChart: canvas not found:', canvasId);
        return null;
      }

      const existing = window._charts[canvasId];

      if (existing && forceCreate) {
        try { existing.destroy(); } catch (e) { console.warn('safeChart: destroy failed', e); }
        delete window._charts[canvasId];
      }

      if (existing && !forceCreate) {
        // prefer update to reusing canvas
        existing.config.data = config.data ?? existing.config.data;
        existing.config.options = config.options ?? existing.config.options;
        existing.update();
        return existing;
      }

      // create new chart instance
      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, config);
      window._charts[canvasId] = chart;
      return chart;
    }

    // Example replacement for direct Chart creation:
    // replace any `new Chart(ctx, config)` with:
    // safeChart('demographics-chart', config, { forceCreate: false });

    // Example usage:
    function renderDemographicsChart(data = [50,40,10]) {
      const config = {
        type: 'doughnut',
        data: {
          labels: ['Male','Female','Other'],
          datasets: [{ data, backgroundColor: ['#4e73df','#1cc88a','#36b9cc'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      };
      safeChart('demographics-chart', config, { forceCreate: false });
    }

})();