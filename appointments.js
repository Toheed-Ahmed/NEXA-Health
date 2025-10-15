class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.retryCount = 0;
    }

    /**
     * Generic request handler with authentication and error handling
     */
    async request(endpoint, options = {}) {
        const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
        
        const requestOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { [API_CONFIG.AUTH.TOKEN_HEADER]: `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}` }),
                ...options.headers
            }
        };

        try {
            const response = await this._fetchWithTimeout(
                `${this.baseUrl}${endpoint}`, 
                requestOptions
            );

            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
                window.location.href = '/login';
                throw new Error('Authentication required');
            }

            // Handle other error responses
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();

        } catch (error) {
            // Retry failed requests
            if (this.retryCount < API_CONFIG.REQUEST.RETRIES && this._shouldRetry(error)) {
                this.retryCount++;
                await this._delay(API_CONFIG.REQUEST.TIMEOUT * this.retryCount);
                return this.request(endpoint, options);
            }

            this.retryCount = 0;
            throw error;
        }
    }

    /**
     * Fetch with timeout wrapper
     */
    async _fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_CONFIG.REQUEST.TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeout);
            return response;
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    /**
     * Helper to determine if request should be retried
     */
    _shouldRetry(error) {
        return error.name === 'AbortError' || 
               error.message.includes('network') ||
               error.message.includes('timeout');
    }

    /**
     * Delay helper for retry mechanism
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Error response handler
     */
    _handleError(error) {
        console.error('API Error:', error);
        // You can add custom error tracking here
        throw error;
    }

    // Generic CRUD methods that other services will inherit

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Form data helper for file uploads
     */
    async postFormData(endpoint, formData) {
        const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
        
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                ...(token && { [API_CONFIG.AUTH.TOKEN_HEADER]: `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}` })
            },
            body: formData
        });
    }
}

// Export for ES modules
if (typeof exports !== 'undefined') {
    module.exports = ApiService;
}