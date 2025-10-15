/**
 * NEXA Health API Configuration
 * Defines API endpoints and authentication settings
 */

const API_CONFIG = {
    // Base API URL - change for production
    BASE_URL: 'http://localhost:5000/api',

    // API Endpoints
    ENDPOINTS: {
        // Authentication endpoints
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            VERIFY: '/auth/verify',
            LOGOUT: '/auth/logout'
        },

        // Patient management endpoints
        PATIENTS: {
            BASE: '/patients',
            SEARCH: '/patients/search',
            RECORDS: '/patients/:id/records',
            HISTORY: '/patients/:id/history'
        },

        // Appointment management endpoints
        APPOINTMENTS: {
            BASE: '/appointments',
            UPCOMING: '/appointments/upcoming',
            CANCEL: '/appointments/:id/cancel',
            RESCHEDULE: '/appointments/:id/reschedule'
        },

        // Reminder system endpoints
        REMINDERS: {
            BASE: '/reminders',
            SETTINGS: '/reminders/settings',
            NOTIFICATIONS: '/reminders/notifications'
        },

        // Hospital and doctor endpoints
        HOSPITALS: {
            BASE: '/hospitals',
            SEARCH: '/hospitals/search',
            DOCTORS: '/hospitals/:id/doctors'
        }
    },

    // Authentication settings
    AUTH: {
        TOKEN_KEY: 'nexa_auth_token',
        REFRESH_KEY: 'nexa_refresh_token',
        TOKEN_HEADER: 'Authorization',
        TOKEN_TYPE: 'Bearer'
    },

    // API request settings
    REQUEST: {
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    }
};

// Prevent modifications to configuration
Object.freeze(API_CONFIG);

// Export for ES modules
if (typeof exports !== 'undefined') {
    module.exports = API_CONFIG;
}