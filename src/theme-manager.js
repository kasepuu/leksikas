class ThemeManager {
    static themes = {
        ocean: {
            primary: '#7fdbff',
            secondary: '#2d2d2d',
            accent: '#00a8ff',
            text: '#e0e0e0',
            background: '#1a1a1a',
            border: '#3d3d3d',
            hover: '#4d4d4d',
            completed: '#ff4444'
        },
        forest: {
            primary: '#2ecc71',
            secondary: '#1a1a1a',
            accent: '#27ae60',
            text: '#e0e0e0',
            background: '#0a0a0a',
            border: '#2d2d2d',
            hover: '#3d3d3d',
            completed: '#e74c3c'
        },
        sunset: {
            primary: '#e74c3c',
            secondary: '#2d2d2d',
            accent: '#f39c12',
            text: '#e0e0e0',
            background: '#1a1a1a',
            border: '#3d3d3d',
            hover: '#4d4d4d',
            completed: '#3498db'
        },
        lavender: {
            primary: '#9b59b6',
            secondary: '#2d2d2d',
            accent: '#8e44ad',
            text: '#e0e0e0',
            background: '#1a1a1a',
            border: '#3d3d3d',
            hover: '#4d4d4d',
            completed: '#e67e22'
        },
        midnight: {
            primary: '#34495e',
            secondary: '#1a1a1a',
            accent: '#2c3e50',
            text: '#e0e0e0',
            background: '#0a0a0a',
            border: '#2d2d2d',
            hover: '#3d3d3d',
            completed: '#e74c3c'
        }
    };

    static init() {
        this.createThemePicker();
        this.applyTheme(this.getCurrentTheme());
    }

    static createThemePicker() {
        const themeBtn = document.querySelector('.theme-picker-btn');
        const themeDropdown = document.querySelector('.theme-dropdown');
        const themeItems = document.querySelectorAll('.theme-item');

        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!themeDropdown.contains(e.target) && !themeBtn.contains(e.target)) {
                themeDropdown.classList.remove('show');
            }
        });

        themeItems.forEach(item => {
            item.addEventListener('click', () => {
                const theme = item.dataset.theme;
                this.setTheme(theme);
                themeDropdown.classList.remove('show');
            });
        });
    }

    static getCurrentTheme() {
        // Try to get from leksikasSettings first
        const settingsRaw = localStorage.getItem('leksikasSettings');
        if (settingsRaw) {
            try {
                const settings = JSON.parse(settingsRaw);
                if (settings.theme) return settings.theme;
            } catch {}
        }
        return localStorage.getItem('theme') || 'ocean';
    }

    static setTheme(theme) {
        if (this.themes[theme]) {
            localStorage.setItem('theme', theme);
            // Also update leksikasSettings
            let settings = {};
            try {
                settings = JSON.parse(localStorage.getItem('leksikasSettings')) || {};
            } catch { settings = {}; }
            settings.theme = theme;
            localStorage.setItem('leksikasSettings', JSON.stringify(settings));
            this.applyTheme(theme);
            document.dispatchEvent(new Event('themeChanged'));
        }
    }

    static applyTheme(theme) {
        const themeColors = this.themes[theme];
        const root = document.documentElement;

        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}-color`, value);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
}); 