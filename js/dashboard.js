// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

function loadDashboardData() {
    const transactions = Storage.getTransactions();
    
    // Calculate summaries
    let pemasukan = 0;
    let pengeluaran = 0;
    
    transactions.forEach(t => {
        if(t.type === 'Pemasukan') pemasukan += parseFloat(t.amount);
        if(t.type === 'Pengeluaran') pengeluaran += parseFloat(t.amount);
    });
    
    const saldo = pemasukan - pengeluaran;
    
    // Update DOM
    document.getElementById('saldo-saat-ini').textContent = formatRupiah(saldo);
    document.getElementById('total-pemasukan').textContent = formatRupiah(pemasukan);
    document.getElementById('total-pengeluaran').textContent = formatRupiah(pengeluaran);
    document.getElementById('total-transaksi').textContent = transactions.length;

    renderRecentTransactions(transactions);
    renderCharts(transactions);
}

function renderRecentTransactions(transactions) {
    const tbody = document.getElementById('recent-transactions-tbody');
    tbody.innerHTML = '';
    
    // Sort transactions by date descending and take top 5
    const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Belum ada transaksi</td></tr>';
        return;
    }
    
    recent.forEach(t => {
        const tr = document.createElement('tr');
        const isIncome = t.type === 'Pemasukan';
        const badgeClass = isIncome ? 'badge-success' : 'badge-danger';
        
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td style="color: ${isIncome ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                ${isIncome ? '+' : '-'}${formatRupiah(t.amount)}
            </td>
            <td><span class="badge ${badgeClass}">${t.type}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCharts(transactions) {
    // Determine colors based on theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#F8FAFC' : '#1E293B';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    // Data for Main Chart (Income vs Expense by Month)
    const monthlyData = {};
    transactions.forEach(t => {
        const dateObj = new Date(t.date);
        const monthYear = dateObj.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
        
        if(!monthlyData[monthYear]) {
            monthlyData[monthYear] = { pemasukan: 0, pengeluaran: 0 };
        }
        
        if(t.type === 'Pemasukan') monthlyData[monthYear].pemasukan += parseFloat(t.amount);
        if(t.type === 'Pengeluaran') monthlyData[monthYear].pengeluaran += parseFloat(t.amount);
    });
    
    const labels = Object.keys(monthlyData);
    const incomeData = labels.map(l => monthlyData[l].pemasukan);
    const expenseData = labels.map(l => monthlyData[l].pengeluaran);

    // Main Chart
    const ctxMain = document.getElementById('mainChart').getContext('2d');
    new Chart(ctxMain, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['Belum ada data'],
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData.length ? incomeData : [0],
                    backgroundColor: '#10B981',
                    borderRadius: 4
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData.length ? expenseData : [0],
                    backgroundColor: '#EF4444',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            },
            plugins: {
                legend: { labels: { color: textColor } }
            }
        }
    });

    // Data for Pie Chart (Expense Categories)
    const expenseCategories = {};
    transactions.filter(t => t.type === 'Pengeluaran').forEach(t => {
        if(!expenseCategories[t.category]) expenseCategories[t.category] = 0;
        expenseCategories[t.category] += parseFloat(t.amount);
    });
    
    const pieLabels = Object.keys(expenseCategories);
    const pieData = Object.values(expenseCategories);
    
    const pieColors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#64748B'];

    const ctxPie = document.getElementById('pieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: pieLabels.length ? pieLabels : ['Belum ada data'],
            datasets: [{
                data: pieData.length ? pieData : [1],
                backgroundColor: pieData.length ? pieColors.slice(0, pieLabels.length) : ['#CBD5E1'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor } }
            }
        }
    });
}
