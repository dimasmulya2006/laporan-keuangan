// js/transaksi.js

const KATEGORI_PEMASUKAN = ['Gaji', 'Bonus', 'Freelance', 'Investasi', 'Penjualan', 'Hadiah', 'Lainnya'];
const KATEGORI_PENGELUARAN = ['Makan & Minum', 'Transportasi', 'Belanja', 'Tagihan', 'Listrik', 'Air', 'Internet', 'Pulsa', 'Pendidikan', 'Kesehatan', 'Hiburan', 'Cicilan', 'Pajak', 'Donasi', 'Hadiah', 'Lainnya'];

let transactions = [];
let currentPage = 1;
const itemsPerPage = 10;
let deleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    transactions = Storage.getTransactions();
    
    setupEventListeners();
    updateKategoriOptions();
    renderTable();
});

function setupEventListeners() {
    // Modal Tambah/Edit
    const modal = document.getElementById('transaksi-modal');
    document.getElementById('btn-tambah').addEventListener('click', () => {
        document.getElementById('transaksi-id').value = '';
        document.getElementById('transaksi-form').reset();
        document.getElementById('form-tanggal').valueAsDate = new Date();
        document.getElementById('modal-title').textContent = 'Tambah Transaksi';
        updateKategoriOptions();
        modal.classList.add('active');
    });
    
    document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('btn-batal').addEventListener('click', () => modal.classList.remove('active'));
    
    // Dynamic Kategori
    document.getElementById('form-jenis').addEventListener('change', updateKategoriOptions);
    
    // Format Nominal Input
    const formNominal = document.getElementById('form-nominal');
    formNominal.addEventListener('keyup', function(e) {
        let val = this.value.replace(/[^,\d]/g, '').toString();
        if(val) {
            val = parseInt(val).toLocaleString('id-ID');
            this.value = val;
        }
    });

    // Form Submit
    document.getElementById('transaksi-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('transaksi-id').value;
        const type = document.getElementById('form-jenis').value;
        const date = document.getElementById('form-tanggal').value;
        const rawNominal = document.getElementById('form-nominal').value.replace(/\./g, '');
        const amount = parseFloat(rawNominal);
        const category = document.getElementById('form-kategori').value;
        const description = document.getElementById('form-deskripsi').value;
        
        if(amount <= 0 || isNaN(amount)) {
            showToast('Nominal harus lebih dari 0', 'danger');
            return;
        }
        
        const data = {
            id: id || null,
            type,
            date,
            amount,
            category,
            description
        };
        
        Storage.saveTransaction(data);
        transactions = Storage.getTransactions();
        
        showToast(id ? 'Transaksi berhasil diubah' : 'Transaksi berhasil ditambahkan');
        modal.classList.remove('active');
        renderTable();
    });

    // Delete Modal
    const confirmModal = document.getElementById('confirm-modal');
    document.getElementById('btn-cancel-delete').addEventListener('click', () => {
        deleteId = null;
        confirmModal.classList.remove('active');
    });
    document.getElementById('btn-confirm-delete').addEventListener('click', () => {
        if(deleteId) {
            Storage.deleteTransaction(deleteId);
            transactions = Storage.getTransactions();
            showToast('Transaksi berhasil dihapus');
            confirmModal.classList.remove('active');
            renderTable();
        }
    });

    // Filters and Sorts
    document.getElementById('search-input').addEventListener('input', () => { currentPage = 1; renderTable(); });
    document.getElementById('filter-waktu').addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.getElementById('filter-jenis').addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.getElementById('sort-data').addEventListener('change', () => { currentPage = 1; renderTable(); });
}

function updateKategoriOptions() {
    const jenis = document.getElementById('form-jenis').value;
    const kategoriSelect = document.getElementById('form-kategori');
    kategoriSelect.innerHTML = '';
    
    const options = jenis === 'Pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        kategoriSelect.appendChild(option);
    });
}

window.editTransaction = function(id) {
    const trx = transactions.find(t => t.id === id);
    if(trx) {
        document.getElementById('transaksi-id').value = trx.id;
        document.getElementById('form-jenis').value = trx.type;
        updateKategoriOptions();
        
        document.getElementById('form-tanggal').value = trx.date;
        document.getElementById('form-nominal').value = parseInt(trx.amount).toLocaleString('id-ID');
        document.getElementById('form-kategori').value = trx.category;
        document.getElementById('form-deskripsi').value = trx.description;
        
        document.getElementById('modal-title').textContent = 'Edit Transaksi';
        document.getElementById('transaksi-modal').classList.add('active');
    }
};

window.confirmDelete = function(id) {
    deleteId = id;
    document.getElementById('confirm-modal').classList.add('active');
};

function renderTable() {
    const tbody = document.getElementById('transaksi-tbody');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterWaktu = document.getElementById('filter-waktu').value;
    const filterJenis = document.getElementById('filter-jenis').value;
    const sortData = document.getElementById('sort-data').value;
    
    let filtered = [...transactions];
    
    // Search
    if(searchTerm) {
        filtered = filtered.filter(t => 
            t.description.toLowerCase().includes(searchTerm) || 
            t.category.toLowerCase().includes(searchTerm) ||
            t.amount.toString().includes(searchTerm) ||
            t.date.includes(searchTerm)
        );
    }
    
    // Filter Jenis
    if(filterJenis !== 'Semua') {
        filtered = filtered.filter(t => t.type === filterJenis);
    }
    
    // Filter Waktu
    if(filterWaktu !== 'Semua') {
        const today = new Date();
        filtered = filtered.filter(t => {
            const dateObj = new Date(t.date);
            if(filterWaktu === 'Hari Ini') {
                return dateObj.toDateString() === today.toDateString();
            } else if (filterWaktu === 'Minggu Ini') {
                // simple check for last 7 days
                const diffTime = Math.abs(today - dateObj);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                return diffDays <= 7;
            } else if (filterWaktu === 'Bulan Ini') {
                return dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
            } else if (filterWaktu === 'Tahun Ini') {
                return dateObj.getFullYear() === today.getFullYear();
            }
            return true;
        });
    }
    
    // Sorting
    filtered.sort((a, b) => {
        if(sortData === 'Tanggal Terbaru') return new Date(b.date) - new Date(a.date);
        if(sortData === 'Tanggal Terlama') return new Date(a.date) - new Date(b.date);
        if(sortData === 'Nominal Terbesar') return b.amount - a.amount;
        if(sortData === 'Nominal Terkecil') return a.amount - b.amount;
        return 0;
    });
    
    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    tbody.innerHTML = '';
    
    if (paginatedItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Data tidak ditemukan</td></tr>';
    } else {
        paginatedItems.forEach(t => {
            const tr = document.createElement('tr');
            const isIncome = t.type === 'Pemasukan';
            
            tr.innerHTML = `
                <td>${t.date}</td>
                <td><span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">${t.type}</span></td>
                <td>${t.category}</td>
                <td>${t.description}</td>
                <td style="color: ${isIncome ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                    ${isIncome ? '+' : '-'}${formatRupiah(t.amount)}
                </td>
                <td class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editTransaction('${t.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" onclick="confirmDelete('${t.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if(totalPages <= 1) return;
    
    for(let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        pagination.appendChild(btn);
    }
}
