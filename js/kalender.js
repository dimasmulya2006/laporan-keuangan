// js/kalender.js

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let transactions = [];

document.addEventListener('DOMContentLoaded', () => {
    transactions = Storage.getTransactions();
    renderCalendar();
    
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if(currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if(currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });
    
    document.getElementById('btn-close-day').addEventListener('click', () => {
        document.getElementById('day-modal').classList.remove('active');
    });
});

function renderCalendar() {
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    document.getElementById('month-year-display').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Group transactions by date string YYYY-MM-DD
    const trxByDate = {};
    transactions.forEach(t => {
        const d = new Date(t.date);
        if(d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const dateKey = `${currentYear}-${String(currentMonth+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if(!trxByDate[dateKey]) trxByDate[dateKey] = [];
            trxByDate[dateKey].push(t);
        }
    });

    // Padding empty cells
    for(let i=0; i<firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarDays.appendChild(emptyCell);
    }
    
    // Fill days
    for(let i=1; i<=daysInMonth; i++) {
        const cell = document.createElement('div');
        const dateKey = `${currentYear}-${String(currentMonth+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTrx = trxByDate[dateKey] || [];
        
        cell.className = 'calendar-day' + (dayTrx.length > 0 ? ' has-trx' : '');
        
        let indicatorsHtml = '';
        // limit to max 2 indicators to fit cell
        dayTrx.slice(0, 2).forEach(t => {
            const cls = t.type === 'Pemasukan' ? 'pemasukan' : 'pengeluaran';
            const sign = t.type === 'Pemasukan' ? '+' : '-';
            indicatorsHtml += `<div class="day-indicator ${cls}">${sign}${formatRupiah(t.amount)}</div>`;
        });
        if(dayTrx.length > 2) {
            indicatorsHtml += `<div class="day-indicator" style="color:var(--text-muted);">+ ${dayTrx.length - 2} lagi</div>`;
        }
        
        cell.innerHTML = `<span class="day-num">${i}</span>${indicatorsHtml}`;
        
        cell.addEventListener('click', () => openDayModal(dateKey, i, monthNames[currentMonth], currentYear, dayTrx));
        calendarDays.appendChild(cell);
    }
}

function openDayModal(dateKey, day, month, year, dayTrx) {
    document.getElementById('day-modal-title').textContent = `Transaksi - ${day} ${month} ${year}`;
    const listContainer = document.getElementById('day-transactions-list');
    
    if(dayTrx.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Tidak ada transaksi pada tanggal ini.</p>';
    } else {
        listContainer.innerHTML = dayTrx.map(t => `
            <div class="transaction-item">
                <div>
                    <strong style="color:var(--text-main); display:block;">${t.category}</strong>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${t.description}</span>
                </div>
                <div style="color: ${t.type === 'Pemasukan' ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                    ${t.type === 'Pemasukan' ? '+' : '-'}${formatRupiah(t.amount)}
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('day-modal').classList.add('active');
}
