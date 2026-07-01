// js/budget.js

document.addEventListener('DOMContentLoaded', () => {
    loadBudgets();
    
    // Modal Tambah
    const modal = document.getElementById('budget-modal');
    document.getElementById('btn-tambah').addEventListener('click', () => {
        document.getElementById('budget-id').value = '';
        document.getElementById('budget-form').reset();
        document.getElementById('modal-title').textContent = 'Tambah Budget';
        modal.classList.add('active');
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('btn-batal').addEventListener('click', () => modal.classList.remove('active'));

    // Format Nominal
    const formNominal = document.getElementById('form-nominal');
    formNominal.addEventListener('keyup', function(e) {
        let val = this.value.replace(/[^,\d]/g, '').toString();
        if(val) {
            val = parseInt(val).toLocaleString('id-ID');
            this.value = val;
        }
    });

    // Form Submit
    document.getElementById('budget-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('budget-id').value;
        const category = document.getElementById('form-kategori').value;
        const amount = parseFloat(document.getElementById('form-nominal').value.replace(/\./g, ''));
        
        Storage.saveBudget({ id: id || null, category, limit: amount });
        showToast('Budget berhasil disimpan');
        modal.classList.remove('active');
        loadBudgets();
    });
});

window.editBudget = function(id) {
    const budgets = Storage.getBudgets();
    const b = budgets.find(x => x.id === id);
    if(b) {
        document.getElementById('budget-id').value = b.id;
        document.getElementById('form-kategori').value = b.category;
        document.getElementById('form-nominal').value = parseInt(b.limit).toLocaleString('id-ID');
        document.getElementById('modal-title').textContent = 'Edit Budget';
        document.getElementById('budget-modal').classList.add('active');
    }
}

window.deleteBudget = function(id) {
    if(confirm('Apakah Anda yakin ingin menghapus budget ini?')) {
        Storage.deleteBudget(id);
        showToast('Budget berhasil dihapus');
        loadBudgets();
    }
}

function loadBudgets() {
    const budgets = Storage.getBudgets();
    const transactions = Storage.getTransactions();
    const container = document.getElementById('budget-container');
    container.innerHTML = '';
    
    if(budgets.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Belum ada budget yang dibuat.</div>';
        return;
    }
    
    const today = new Date();
    
    // Calculate current month expenses per category
    const categoryExpenses = {};
    transactions.filter(t => t.type === 'Pengeluaran').forEach(t => {
        const d = new Date(t.date);
        if(d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
            categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + parseFloat(t.amount);
        }
    });
    
    budgets.forEach(b => {
        const spent = categoryExpenses[b.category] || 0;
        const percent = Math.min((spent / b.limit) * 100, 100);
        
        let color = 'var(--success)';
        if(percent >= 90) color = 'var(--danger)';
        else if(percent >= 70) color = 'var(--warning)';
        
        if (percent >= 100) {
            // Optional: You could trigger a toast here if newly exceeded, but careful not to spam on load
        }

        const card = document.createElement('div');
        card.className = 'glass-card budget-card';
        card.innerHTML = `
            <div class="budget-header">
                <h3>${b.category}</h3>
                <span style="font-weight:600;">${formatRupiah(b.limit)}</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${percent}%; background-color: ${color};"></div>
            </div>
            <div class="budget-details">
                <span>Terpakai: ${formatRupiah(spent)}</span>
                <span>Sisa: ${formatRupiah(b.limit - spent)}</span>
            </div>
            <div class="budget-actions">
                <button class="btn btn-primary" onclick="editBudget('${b.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" onclick="deleteBudget('${b.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}
