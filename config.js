/**
 * NEXA Health System Configuration
 * Matches backend schema and routes from d:\newproject\backend
 */

const API_CONFIG = {
    // Base API URL - matches backend server.js
    BASE_URL: 'http://localhost:5000/api',

    // API Endpoints - aligned with backend routes
    ENDPOINTS: {
        // Maps to authRoutes.js
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            PROFILE: '/auth/profile'
        },

        // Maps to patientRoutes.js and Patient.js schema
        PATIENTS: {
            BASE: '/patients',
            SEARCH: '/patients/search',
            MEDICAL_HISTORY: '/patients/:id/medical-history',
            APPOINTMENTS: '/patients/:id/appointments'
        },

        // Maps to appointmentRoutes.js and Appointment.js schema
        APPOINTMENTS: {
            BASE: '/appointments',
            UPCOMING: '/appointments/upcoming',
            CANCEL: '/appointments/:id/cancel',
            STATUS: '/appointments/:id/status'
        },

        // Maps to reminderRoutes.js and Reminder.js schema
        REMINDERS: {
            BASE: '/reminders',
            SETTINGS: '/reminders/settings',
            NOTIFICATIONS: '/reminders/notifications'
        }
    },

    // Auth configuration - matches authMiddleware.js
    AUTH: {
        TOKEN_KEY: 'nexa_token',
        TOKEN_HEADER: 'Authorization',
        TOKEN_PREFIX: 'Bearer'
    },

    // Request configuration
    REQUEST: {
        TIMEOUT: 30000,
        RETRIES: 3
    },

    // Feature flags based on backend capabilities
    FEATURES: {
        SMS_NOTIFICATIONS: true, // Based on twilio.js presence
        MEDICAL_HISTORY: true,
        APPOINTMENT_TRACKING: true
    }
};

// Prevent runtime modifications
Object.freeze(API_CONFIG);
Object.freeze(API_CONFIG.ENDPOINTS);
Object.freeze(API_CONFIG.AUTH);
Object.freeze(API_CONFIG.REQUEST);
Object.freeze(API_CONFIG.FEATURES);

// Export configuration
if (typeof exports !== 'undefined') {
    module.exports = API_CONFIG;
}