// Theme Toggle Functionality
(function () {
    'use strict';

    // Available themes
    const themes = [
        'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
        'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
        'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
        'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
        'night', 'coffee', 'winter'
    ];

    // Get current theme from localStorage or default to 'light'
    function getCurrentTheme() {
        return localStorage.getItem('whatsapp-api-theme') || 'light';
    }

    // Set theme
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('whatsapp-api-theme', theme);
    }

    // Toggle between light and dark theme
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        updateThemeToggleButton();
    }

    // Update theme toggle button
    function updateThemeToggleButton() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = getCurrentTheme();

        if (themeToggle) {
            if (currentTheme === 'dark') {
                themeToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                `;
            } else {
                themeToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                `;
            }
        }
    }

    // Initialize theme on page load
    function initializeTheme() {
        const currentTheme = getCurrentTheme();
        setTheme(currentTheme);
        updateThemeToggleButton();

        // Add event listener to theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Add event listener to theme selector dropdown
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', function (e) {
                setTheme(e.target.value);
                updateThemeToggleButton();
            });
            themeSelector.value = currentTheme;
        }
    }

    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
        initializeTheme();
    }

    // Expose functions globally if needed
    window.ThemeManager = {
        setTheme,
        getCurrentTheme,
        toggleTheme,
        themes
    };
})();
