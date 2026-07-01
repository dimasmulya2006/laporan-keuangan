// js/statistik.js

document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
});

function loadStatistics() {
    const transactions = Storage.getTransactions();
    
    // 1. Pengeluaran Terbesar
    let maxExpense = null;
    transactions.filter(t => t.type === 'Pengeluaran').forEach(t => {
        if(!maxExpense || parseFloat(t.amount) > parseFloat(maxExpense.amount)) {
            maxExpense = t;
        }
    });
    if(maxExpense) {
        document.getElementById('stat-max-pengeluaran').textContent = formatRupiah(maxExpense.amount);
        document.getElementById('stat-max-desc').textContent = `${maxExpense.category} - ${maxExpense.date}`;
    }

    // 2. Kategori Paling Sering
    const categoryCounts = {};
    transactions.forEach(t => {
        if(t.type === 'Pengeluaran') {
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        }
    });
    const mostFreqCat = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
    if(mostFreqCat) {
        document.getElementById('stat-freq-cat').textContent = mostFreqCat;
    }

    // 3. Rata-rata Harian & Total Bulan Ini
    const today = new Date();
    let monthExpense = 0;
    let monthIncome = 0;
    let monthCount = 0;
    
    transactions.forEach(t => {
        const d = new Date(t.date);
        if(d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
            monthCount++;
            if(t.type === 'Pengeluaran') monthExpense += parseFloat(t.amount);
            if(t.type === 'Pemasukan') monthIncome += parseFloat(t.amount);
        }
    });
    
    document.getElementById('stat-month-count').textContent = monthCount;
    // Rata-rata harian (dibagi jumlah hari sampai hari ini)
    const currentDay = today.getDate();
    const avgDaily = monthExpense / currentDay;
    document.getElementById('stat-avg-daily').textContent = formatRupiah(avgDaily);

    renderCharts(transactions, today, monthIncome, monthExpense);
}

function renderCharts(transactions, today, monthIncome, monthExpense) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#F8FAFC' : '#1E293B';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    // Daily Chart Data
    const dailyExpenses = {};
    // Initialize days of month
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for(let i=1; i<=daysInMonth; i++) {
        dailyExpenses[i] = 0;
    }
    
    transactions.filter(t => t.type === 'Pengeluaran').forEach(t => {
        const d = new Date(t.date);
        if(d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
            dailyExpenses[d.getDate()] += parseFloat(t.amount);
        }
    });
    
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dailyExpenses),
            datasets: [{
                label: 'Pengeluaran Harian',
                data: Object.values(dailyExpenses),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            },
            plugins: { legend: { labels: { color: textColor } } }
        }
    });

    // Ratio Chart
    const ratioCtx = document.getElementById('ratioChart').getContext('2d');
    new Chart(ratioCtx, {
        type: 'pie',
        data: {
            labels: ['Pemasukan', 'Pengeluaran'],
            datasets: [{
                data: [monthIncome, monthExpense],
                backgroundColor: ['#10B981', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
        }
    });
}
