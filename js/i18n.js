/**
 * Zodya i18n Module
 * Handles language detection, switching, and DOM updates
 */

const I18n = (function() {
    // Configuration
    const CONFIG = {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'ar'],
        localStorageKey: 'zodya-language',
        translationsPath: './locales/',
        rtlLanguages: ['ar']
    };

    // State
    let currentLanguage = CONFIG.defaultLanguage;
    let translations = {};
    let isInitialized = false;

    /**
     * Initialize the i18n module
     */
    async function init() {
        if (isInitialized) return;

        // Determine initial language (priority order)
        currentLanguage = getUrlLanguage()
            || getStoredLanguage()
            || detectBrowserLanguage()
            || CONFIG.defaultLanguage;

        // Load translations
        await loadTranslations(currentLanguage);

        // Apply translations to DOM
        applyTranslations();

        // Update document direction and language
        updateDocumentAttributes();

        // Setup language selector
        setupLanguageSelector();

        isInitialized = true;

        // Add ready class to body
        document.body.classList.add('i18n-ready');

        // Dispatch custom event for other scripts
        document.dispatchEvent(new CustomEvent('i18n:ready', {
            detail: { language: currentLanguage }
        }));

        console.log('i18n initialized with language:', currentLanguage);
    }

    /**
     * Get language from URL parameter
     */
    function getUrlLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang');
        if (lang && CONFIG.supportedLanguages.includes(lang)) {
            return lang;
        }
        return null;
    }

    /**
     * Get language from localStorage
     */
    function getStoredLanguage() {
        try {
            const stored = localStorage.getItem(CONFIG.localStorageKey);
            if (stored && CONFIG.supportedLanguages.includes(stored)) {
                return stored;
            }
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
        return null;
    }

    /**
     * Detect browser language
     */
    function detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;

        // Check for exact match (e.g., 'ar-SA')
        if (browserLang) {
            const langCode = browserLang.split('-')[0].toLowerCase();
            if (CONFIG.supportedLanguages.includes(langCode)) {
                return langCode;
            }
        }

        // Check navigator.languages array
        if (navigator.languages) {
            for (const lang of navigator.languages) {
                const langCode = lang.split('-')[0].toLowerCase();
                if (CONFIG.supportedLanguages.includes(langCode)) {
                    return langCode;
                }
            }
        }

        return null;
    }

    /**
     * Load translations from JSON file
     */
    async function loadTranslations(lang) {
        try {
            // Determine the base path based on current page location
            let basePath = './locales/';

            const response = await fetch(`${basePath}${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to default language
            if (lang !== CONFIG.defaultLanguage) {
                return loadTranslations(CONFIG.defaultLanguage);
            }
        }
    }

    /**
     * Get nested translation by key path
     * @param {string} keyPath - Dot-notation path (e.g., 'nav.home')
     * @returns {string} - Translated text or key if not found
     */
    function t(keyPath) {
        const keys = keyPath.split('.');
        let value = translations;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                console.warn(`Translation missing: ${keyPath}`);
                return keyPath;
            }
        }

        return value;
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    function applyTranslations() {
        // Text content translations
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = t(key);

            // Check if translation contains HTML
            if (typeof translation === 'string' && translation.includes('<')) {
                element.innerHTML = translation;
            } else if (typeof translation === 'string') {
                element.textContent = translation;
            }
        });

        // Attribute translations (placeholder, title, aria-label, alt, etc.)
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrData = element.getAttribute('data-i18n-attr');
            // Format: "attr1:key1,attr2:key2"
            attrData.split(',').forEach(pair => {
                const [attr, key] = pair.split(':').map(s => s.trim());
                const translation = t(key);
                if (typeof translation === 'string') {
                    element.setAttribute(attr, translation);
                }
            });
        });

        // Update page title
        if (translations.meta && translations.meta.title) {
            document.title = translations.meta.title;
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && translations.meta && translations.meta.description) {
            metaDesc.setAttribute('content', translations.meta.description);
        }
    }

    /**
     * Update document-level attributes for RTL/LTR
     */
    function updateDocumentAttributes() {
        const isRTL = CONFIG.rtlLanguages.includes(currentLanguage);

        // Update html element
        document.documentElement.setAttribute('lang', currentLanguage);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

        // Toggle RTL class on body for CSS targeting
        document.body.classList.toggle('rtl', isRTL);
        document.body.classList.toggle('ltr', !isRTL);
    }

    /**
     * Switch to a different language
     */
    async function setLanguage(lang) {
        if (!CONFIG.supportedLanguages.includes(lang)) {
            console.error(`Unsupported language: ${lang}`);
            return;
        }

        if (lang === currentLanguage) return;

        currentLanguage = lang;

        // Store preference
        try {
            localStorage.setItem(CONFIG.localStorageKey, lang);
        } catch (e) {
            console.warn('Could not save language preference:', e);
        }

        // Load new translations
        await loadTranslations(lang);

        // Update DOM
        applyTranslations();
        updateDocumentAttributes();

        // Update selector UI
        updateLanguageSelectorUI();

        // Dispatch language change event
        document.dispatchEvent(new CustomEvent('i18n:languageChanged', {
            detail: { language: lang }
        }));

        console.log('Language changed to:', lang);
    }

    /**
     * Setup language selector component
     */
    function setupLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (!selector) return;

        // Handle button clicks
        selector.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang');
                setLanguage(lang);
            });
        });

        updateLanguageSelectorUI();
    }

    /**
     * Update language selector UI to reflect current language
     */
    function updateLanguageSelectorUI() {
        const selector = document.getElementById('language-selector');
        if (!selector) return;

        selector.querySelectorAll('[data-lang]').forEach(btn => {
            const isActive = btn.getAttribute('data-lang') === currentLanguage;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    /**
     * Get current language
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Check if current language is RTL
     */
    function isRTL() {
        return CONFIG.rtlLanguages.includes(currentLanguage);
    }

    // Public API
    return {
        init,
        t,
        setLanguage,
        getCurrentLanguage,
        isRTL
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}

// Export for use in other modules
window.I18n = I18n;
