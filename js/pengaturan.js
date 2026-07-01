// js/pengaturan.js

document.addEventListener('DOMContentLoaded', () => {
    // Load Profil
    const user = Storage.getUser();
    if(user) document.getElementById('set-username').value = user.username;

    // Profil Save
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('set-username').value.trim();
        if(newUsername && user) {
            user.username = newUsername;
            Storage.set(STORAGE_KEYS.USER, user);
            const dName = document.getElementById('display-user-name');
            if(dName) dName.textContent = newUsername;
            showToast('Profil berhasil disimpan');
        }
    });

    // Backup
    document.getElementById('btn-backup').addEventListener('click', () => {
        const data = {
            transactions: Storage.getTransactions(),
            budgets: Storage.getBudgets(),
            targets: Storage.getTargets(),
            settings: Storage.getSettings()
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `MK_Backup_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Restore
    const fileInput = document.getElementById('file-restore');
    document.getElementById('btn-trigger-restore').addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if(data.transactions) Storage.set(STORAGE_KEYS.TRANSACTIONS, data.transactions);
                if(data.budgets) Storage.set(STORAGE_KEYS.BUDGETS, data.budgets);
                if(data.targets) Storage.set(STORAGE_KEYS.TARGETS, data.targets);
                if(data.settings) Storage.set(STORAGE_KEYS.SETTINGS, data.settings);
                
                showToast('Data berhasil direstore. Memuat ulang...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch(err) {
                showToast('File backup tidak valid!', 'danger');
            }
        };
        reader.readAsText(file);
    });

    // Reset
    document.getElementById('btn-reset-all').addEventListener('click', () => {
        if(confirm('Peringatan: Seluruh data transaksi, budget, target, dan profil akan dihapus permanen. Apakah Anda yakin?')) {
            localStorage.clear();
            alert('Semua data berhasil direset. Anda akan dialihkan ke halaman login.');
            window.location.href = 'index.html';
        }
    });
});
