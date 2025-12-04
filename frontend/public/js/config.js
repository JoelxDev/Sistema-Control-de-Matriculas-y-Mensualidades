// Configuración de API
const API_CONFIG = {
    baseURL: '/api',
    
    // Fetch PÚBLICO (sin autenticación) - para login y matrícula
    async fetchPublic(endpoint, options = {}) {
        const url = endpoint.startsWith('/api') ? endpoint : `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, finalOptions);
            return response;
        } catch (error) {
            console.error('Error en la petición:', error);
            throw error;
        }
    },
    
    // Fetch PROTEGIDO (con autenticación) - para rutas admin/secretario
    async fetch(endpoint, options = {}) {
        // Si fetchAuth está disponible, úsalo
        if (typeof fetchAuth === 'function') {
            const url = endpoint.startsWith('/api') ? endpoint : `${this.baseURL}${endpoint}`;
            return fetchAuth(url, options);
        }
        
        // Fallback a fetch normal
        return this.fetchPublic(endpoint, options);
    },

    // Métodos de conveniencia PÚBLICOS
    async publicPost(endpoint, data) {
        return this.fetchPublic(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // Métodos de conveniencia PROTEGIDOS
    async get(endpoint) {
        return this.fetch(endpoint, { method: 'GET' });
    },

    async post(endpoint, data) {
        return this.fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data) {
        return this.fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return this.fetch(endpoint, { method: 'DELETE' });
    }
};

// Exportar para uso global
window.API_CONFIG = API_CONFIG;