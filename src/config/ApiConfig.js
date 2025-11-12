/**
 * Manages API keys and service configurations for VIB34D.
 */
export class ApiConfig {
    /**
     * Initializes the API configuration.
     */
    constructor() {
        this.keys = {
            gemini: null
        };
        
        this.endpoints = {
            gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
        };
        
        this.loadFromStorage();
    }
    
    /**
     * Loads API keys from localStorage.
     */
    loadFromStorage() {
        const storedKeys = localStorage.getItem('vib34d-api-keys');
        if (storedKeys) {
            try {
                const parsed = JSON.parse(storedKeys);
                Object.assign(this.keys, parsed);
                console.log('🔑 API keys loaded from storage');
            } catch (error) {
                console.error('Error loading API keys:', error);
            }
        }
    }
    
    /**
     * Saves API keys to localStorage.
     */
    saveToStorage() {
        localStorage.setItem('vib34d-api-keys', JSON.stringify(this.keys));
        console.log('💾 API keys saved to storage');
    }
    
    /**
     * Sets the Gemini API key.
     * @param {string} apiKey - The Gemini API key.
     */
    setGeminiKey(apiKey) {
        this.keys.gemini = apiKey;
        this.saveToStorage();
    }
    
    /**
     * Gets the Gemini API key.
     * @returns {string} The Gemini API key.
     */
    getGeminiKey() {
        return this.keys.gemini;
    }
    
    /**
     * Checks if Gemini is configured.
     * @returns {boolean} True if Gemini is configured, false otherwise.
     */
    isGeminiConfigured() {
        return !!this.keys.gemini;
    }
    
    /**
     * Clears all API keys.
     */
    clearKeys() {
        this.keys = {
            gemini: null
        };
        localStorage.removeItem('vib34d-api-keys');
        console.log('🗑️ API keys cleared');
    }
    
    /**
     * Gets the Gemini API endpoint URL with the API key.
     * @returns {string} The Gemini API endpoint URL.
     */
    getGeminiEndpoint() {
        if (!this.keys.gemini) {
            throw new Error('Gemini API key not configured');
        }
        return `${this.endpoints.gemini}?key=${this.keys.gemini}`;
    }
}

// Export singleton instance
export const apiConfig = new ApiConfig();