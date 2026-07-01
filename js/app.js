// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Check Theme
    const settings = Storage.getSettings();
    if(settings.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Check Auth - if not on index.html and not logged in, redirect to index.html
    const user = Storage.getUser();
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('\\');

    if (!user && !isLoginPage) {
        window.location.href = 'index.html';
    } else if (user && isLoginPage) {
        window.location.href = 'dashboard.html';
    }

    // Setup Theme Toggle if exists
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        // Update icon based on theme
        themeToggleBtn.innerHTML = settings.theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            Storage.updateSettings({ theme: newTheme });
            themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });
    }

    // Setup Sidebar Toggle if exists
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Setup Logout if exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Storage.logout();
            window.location.href = 'index.html';
        });
    }

    // Display user name if element exists
    const displayUserName = document.getElementById('display-user-name');
    if(displayUserName && user) {
        displayUserName.textContent = user.username;
    }
    
    // setActiveSidebar menu
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach(link => {
        if(link.getAttribute('href') && currentPath.endsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
});

// Global Toast function
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-check-circle';
    if(type === 'danger') icon = 'fa-times-circle';
    if(type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Global Currency Formatter
window.formatRupiah = function(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};
