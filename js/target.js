// js/target.js

document.addEventListener('DOMContentLoaded', () => {
    loadTargets();
    
    // Modal Tambah
    const modal = document.getElementById('target-modal');
    document.getElementById('btn-tambah').addEventListener('click', () => {
        document.getElementById('target-id').value = '';
        document.getElementById('target-form').reset();
        document.getElementById('modal-title').textContent = 'Tambah Target';
        modal.classList.add('active');
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.remove('active'));
    document.getElementById('btn-batal').addEventListener('click', () => modal.classList.remove('active'));

    // Modal Update
    const updateModal = document.getElementById('update-modal');
    document.getElementById('btn-close-update').addEventListener('click', () => updateModal.classList.remove('active'));
    document.getElementById('btn-batal-update').addEventListener('click', () => updateModal.classList.remove('active'));

    // Formatting format nominal
    const formatNumberInput = function(e) {
        let val = this.value.replace(/[^,\d]/g, '').toString();
        if(val) {
            val = parseInt(val).toLocaleString('id-ID');
            this.value = val;
        }
    };
    document.getElementById('form-target').addEventListener('keyup', formatNumberInput);
    document.getElementById('form-terkumpul').addEventListener('keyup', formatNumberInput);
    document.getElementById('form-tambah-dana').addEventListener('keyup', formatNumberInput);

    // Form Submit (Tambah/Edit)
    document.getElementById('target-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('target-id').value;
        const name = document.getElementById('form-nama').value;
        const targetAmount = parseFloat(document.getElementById('form-target').value.replace(/\./g, ''));
        const collected = parseFloat(document.getElementById('form-terkumpul').value.replace(/\./g, '')) || 0;
        const deadline = document.getElementById('form-deadline').value;
        
        Storage.saveTarget({ id: id || null, name, targetAmount, collected, deadline });
        showToast('Target berhasil disimpan');
        modal.classList.remove('active');
        loadTargets();
    });

    // Form Submit (Update Dana)
    document.getElementById('update-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('update-id').value;
        const addedAmount = parseFloat(document.getElementById('form-tambah-dana').value.replace(/\./g, ''));
        
        const targets = Storage.getTargets();
        const index = targets.findIndex(t => t.id === id);
        if(index > -1) {
            targets[index].collected += addedAmount;
            if(targets[index].collected > targets[index].targetAmount) {
                targets[index].collected = targets[index].targetAmount; // Cap at max
            }
            Storage.saveTarget(targets[index]);
            showToast('Dana berhasil ditambahkan!');
            updateModal.classList.remove('active');
            loadTargets();
        }
    });
});

window.editTarget = function(id) {
    const targets = Storage.getTargets();
    const t = targets.find(x => x.id === id);
    if(t) {
        document.getElementById('target-id').value = t.id;
        document.getElementById('form-nama').value = t.name;
        document.getElementById('form-target').value = parseInt(t.targetAmount).toLocaleString('id-ID');
        document.getElementById('form-terkumpul').value = parseInt(t.collected).toLocaleString('id-ID');
        document.getElementById('form-deadline').value = t.deadline;
        
        document.getElementById('modal-title').textContent = 'Edit Target';
        document.getElementById('target-modal').classList.add('active');
    }
}

window.openUpdateDana = function(id) {
    document.getElementById('update-id').value = id;
    document.getElementById('update-form').reset();
    document.getElementById('update-modal').classList.add('active');
}

window.deleteTarget = function(id) {
    if(confirm('Apakah Anda yakin ingin menghapus target ini?')) {
        Storage.deleteTarget(id);
        showToast('Target berhasil dihapus');
        loadTargets();
    }
}

function loadTargets() {
    const targets = Storage.getTargets();
    const container = document.getElementById('target-container');
    container.innerHTML = '';
    
    if(targets.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Belum ada target yang dibuat.</div>';
        return;
    }
    
    targets.forEach(t => {
        const percent = Math.min((t.collected / t.targetAmount) * 100, 100);
        const isComplete = percent >= 100;
        
        const card = document.createElement('div');
        card.className = 'glass-card target-card';
        if(isComplete) {
            card.style.border = '1px solid var(--success)';
            card.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.2)';
        }
        
        card.innerHTML = `
            <div class="target-header">
                <h3>${t.name} ${isComplete ? '<i class="fa-solid fa-check-circle" style="color:var(--success)"></i>' : ''}</h3>
            </div>
            <div class="target-details" style="font-weight:600; color:var(--text-main);">
                <span>${formatRupiah(t.collected)}</span>
                <span>${formatRupiah(t.targetAmount)}</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${percent}%; ${isComplete ? 'background: var(--success);' : ''}"></div>
            </div>
            <div class="target-details">
                <span>${percent.toFixed(1)}% Terkumpul</span>
                <span class="deadline"><i class="fa-regular fa-clock"></i> ${t.deadline}</span>
            </div>
            <div class="target-actions">
                <button class="btn btn-success" style="font-size:0.8rem; padding: 6px 12px;" onclick="openUpdateDana('${t.id}')" ${isComplete ? 'disabled style="opacity:0.5"' : ''}><i class="fa-solid fa-plus"></i> Dana</button>
                <button class="btn" style="background:var(--warning); color:white; font-size:0.8rem; padding: 6px 12px;" onclick="editTarget('${t.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" style="font-size:0.8rem; padding: 6px 12px;" onclick="deleteTarget('${t.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}
