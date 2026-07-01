// js/laporan.js

let currentReportData = [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-generate').addEventListener('click', generateReport);
    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.getElementById('btn-csv').addEventListener('click', exportCSV);
    document.getElementById('btn-json').addEventListener('click', exportJSON);
    
    // Auto generate on load
    generateReport();
});

function generateReport() {
    const type = document.getElementById('report-type').value;
    const transactions = Storage.getTransactions();
    const today = new Date();
    
    currentReportData = transactions.filter(t => {
        const d = new Date(t.date);
        if(type === 'hari_ini') return d.toDateString() === today.toDateString();
        if(type === 'minggu_ini') return Math.ceil(Math.abs(today - d) / (1000*60*60*24)) <= 7;
        if(type === 'bulan_ini') return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        if(type === 'tahun_ini') return d.getFullYear() === today.getFullYear();
        return true;
    });
    
    // Sort Date Descending
    currentReportData.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    let pemasukan = 0;
    let pengeluaran = 0;
    
    const tbody = document.getElementById('report-tbody');
    tbody.innerHTML = '';
    
    if(currentReportData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Data tidak ditemukan</td></tr>';
    } else {
        currentReportData.forEach(t => {
            if(t.type === 'Pemasukan') pemasukan += parseFloat(t.amount);
            else pengeluaran += parseFloat(t.amount);
            
            tbody.innerHTML += `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.category}</td>
                    <td>${t.description}</td>
                    <td>${t.type}</td>
                    <td>${formatRupiah(t.amount)}</td>
                </tr>
            `;
        });
    }
    
    document.getElementById('rep-pemasukan').textContent = formatRupiah(pemasukan);
    document.getElementById('rep-pengeluaran').textContent = formatRupiah(pengeluaran);
    
    const surplusEl = document.getElementById('rep-surplus');
    const surplus = pemasukan - pengeluaran;
    surplusEl.textContent = formatRupiah(surplus);
    surplusEl.style.color = surplus >= 0 ? 'var(--success)' : 'var(--danger)';
    
    document.getElementById('rep-count').textContent = currentReportData.length;
    
    const titleSelect = document.getElementById('report-type');
    document.getElementById('report-title').textContent = `Laporan Keuangan - ${titleSelect.options[titleSelect.selectedIndex].text}`;
}

function exportCSV() {
    if(currentReportData.length === 0) return showToast('Tidak ada data untuk diexport', 'warning');
    
    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Jenis,Kategori,Deskripsi,Nominal\n";
    currentReportData.forEach(t => {
        let row = `"${t.date}","${t.type}","${t.category}","${t.description}","${t.amount}"`;
        csvContent += row + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportJSON() {
    if(currentReportData.length === 0) return showToast('Tidak ada data untuk diexport', 'warning');
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentReportData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Laporan_Keuangan_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
