const STORAGE_KEYS = {
    USER: 'mk_user',
    TRANSACTIONS: 'mk_transactions',
    SETTINGS: 'mk_settings',
    BUDGETS: 'mk_budgets',
    TARGETS: 'mk_targets'
};

const Storage = {
    // Basic Storage
    get(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    },

    // User / Auth
    getUser() {
        return this.get(STORAGE_KEYS.USER);
    },
    login(username) {
        const user = { username, isLoggedIn: true, loginAt: new Date().toISOString() };
        this.set(STORAGE_KEYS.USER, user);
        return user;
    },
    logout() {
        this.remove(STORAGE_KEYS.USER);
    },

    // Settings
    getSettings() {
        return this.get(STORAGE_KEYS.SETTINGS, {
            theme: 'light',
            currency: 'IDR',
            dateFormat: 'DD/MM/YYYY'
        });
    },
    updateSettings(newSettings) {
        const current = this.getSettings();
        this.set(STORAGE_KEYS.SETTINGS, { ...current, ...newSettings });
    },

    // Transactions
    getTransactions() {
        return this.get(STORAGE_KEYS.TRANSACTIONS, []);
    },
    saveTransaction(transaction) {
        const transactions = this.getTransactions();
        if(transaction.id) {
            // update
            const index = transactions.findIndex(t => t.id === transaction.id);
            if(index > -1) {
                transactions[index] = transaction;
            } else {
                transactions.push(transaction);
            }
        } else {
            // add new
            transaction.id = 'TRX-' + Date.now();
            transactions.push(transaction);
        }
        this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
        return transaction;
    },
    deleteTransaction(id) {
        let transactions = this.getTransactions();
        transactions = transactions.filter(t => t.id !== id);
        this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    },

    // Budgets
    getBudgets() {
        return this.get(STORAGE_KEYS.BUDGETS, []);
    },
    saveBudget(budget) {
        let budgets = this.getBudgets();
        if(budget.id) {
            const index = budgets.findIndex(b => b.id === budget.id);
            if(index > -1) budgets[index] = budget;
            else budgets.push(budget);
        } else {
            budget.id = 'BDG-' + Date.now();
            budgets.push(budget);
        }
        this.set(STORAGE_KEYS.BUDGETS, budgets);
    },
    deleteBudget(id) {
        let budgets = this.getBudgets();
        budgets = budgets.filter(b => b.id !== id);
        this.set(STORAGE_KEYS.BUDGETS, budgets);
    },

    // Targets
    getTargets() {
        return this.get(STORAGE_KEYS.TARGETS, []);
    },
    saveTarget(target) {
        let targets = this.getTargets();
        if(target.id) {
            const index = targets.findIndex(t => t.id === target.id);
            if(index > -1) targets[index] = target;
            else targets.push(target);
        } else {
            target.id = 'TGT-' + Date.now();
            targets.push(target);
        }
        this.set(STORAGE_KEYS.TARGETS, targets);
    },
    deleteTarget(id) {
        let targets = this.getTargets();
        targets = targets.filter(t => t.id !== id);
        this.set(STORAGE_KEYS.TARGETS, targets);
    },

    // Default Initialization
    initDefaults() {
        if (!this.get(STORAGE_KEYS.SETTINGS)) {
            this.set(STORAGE_KEYS.SETTINGS, {
                theme: 'light',
                currency: 'IDR',
                dateFormat: 'DD/MM/YYYY'
            });
        }
        if (!this.get(STORAGE_KEYS.TRANSACTIONS)) {
            this.set(STORAGE_KEYS.TRANSACTIONS, []);
        }
    }
};

Storage.initDefaults();
