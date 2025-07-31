// Configurazione amministratori Purple Club

// Account amministratori autorizzati
export const ADMIN_ACCOUNTS = {
    // Unico amministratore autorizzato
     'purple': {
         password: '6510',
         role: 'super_admin',
         name: 'Purple Club Admin',
         permissions: ['all'],
         lastLogin: null,
         createdAt: new Date('2024-01-01')
     }
 };

// Configurazione sistema di monitoraggio
export const MONITORING_CONFIG = {
    updateInterval: 5000, // 5 secondi
    maxVisitors: 1000,
    alertThresholds: {
        highTraffic: 100,
        serverLoad: 80,
        errorRate: 5
    },
    enableRealTimeStats: true,
    logRetention: 7 // giorni
};

// Sistema di autenticazione
export class AdminAuth {
    constructor() {
        this.currentAdmin = null;
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 ore
        this.init();
    }

    init() {
        // Verifica sessione esistente
        const savedSession = localStorage.getItem('purpleclub_admin_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (this.isValidSession(session)) {
                    this.currentAdmin = session;
                    console.log('✅ Sessione amministratore ripristinata');
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('❌ Errore nel ripristino sessione:', error);
                this.logout();
            }
        }
    }

    async login(email, password) {
        const admin = ADMIN_ACCOUNTS[email];
        
        if (!admin || admin.password !== password) {
            throw new Error('Credenziali non valide');
        }

        // Crea sessione
        const session = {
            email: email,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString()
        };

        // Salva sessione
        localStorage.setItem('purpleclub_admin_session', JSON.stringify(session));
        this.currentAdmin = session;

        // Aggiorna ultimo accesso
        ADMIN_ACCOUNTS[email].lastLogin = new Date();

        console.log('✅ Login amministratore effettuato:', admin.name);
        return session;
    }

    logout() {
        localStorage.removeItem('purpleclub_admin_session');
        this.currentAdmin = null;
        console.log('👋 Logout amministratore effettuato');
        window.location.href = 'login.html';
    }

    isValidSession(session) {
        if (!session || !session.expiresAt) return false;
        return new Date(session.expiresAt) > new Date();
    }

    isAuthenticated() {
        return this.currentAdmin && this.isValidSession(this.currentAdmin);
    }

    hasPermission(permission) {
        if (!this.isAuthenticated()) return false;
        return this.currentAdmin.permissions.includes('all') || 
               this.currentAdmin.permissions.includes(permission);
    }

    getCurrentAdmin() {
        return this.currentAdmin;
    }
}

// Sistema di monitoraggio in tempo reale
export class RealTimeMonitoring {
    constructor() {
        this.visitors = new Set();
        this.serverStats = {
            uptime: Date.now(),
            requests: 0,
            errors: 0,
            lastUpdate: new Date()
        };
        this.isActive = false;
        this.updateInterval = null;
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('🔄 Monitoraggio in tempo reale avviato');
        
        // Aggiorna statistiche ogni 5 secondi
        this.updateInterval = setInterval(() => {
            this.updateStats();
            this.broadcastStats();
        }, MONITORING_CONFIG.updateInterval);

        // Simula traffico visitatori
        this.simulateVisitors();
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('⏹️ Monitoraggio in tempo reale fermato');
    }

    addVisitor(visitorId = null) {
        const id = visitorId || this.generateVisitorId();
        this.visitors.add(id);
        this.serverStats.requests++;
        
        // Rimuovi visitatore dopo 30 minuti di inattività
        setTimeout(() => {
            this.visitors.delete(id);
        }, 30 * 60 * 1000);
        
        return id;
    }

    generateVisitorId() {
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateStats() {
        this.serverStats.lastUpdate = new Date();
        this.serverStats.uptime = Date.now() - this.serverStats.uptime;
        
        // Simula carico server
        const load = Math.random() * 100;
        this.serverStats.load = Math.round(load);
        
        // Simula errori occasionali
        if (Math.random() < 0.02) { // 2% probabilità di errore
            this.serverStats.errors++;
        }
    }

    simulateVisitors() {
        // Simula visitatori realistici
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% probabilità di nuovo visitatore
                this.addVisitor();
            }
            
            // Rimuovi visitatori casuali (simulazione uscita)
            if (this.visitors.size > 0 && Math.random() < 0.1) {
                const visitorsArray = Array.from(this.visitors);
                const randomVisitor = visitorsArray[Math.floor(Math.random() * visitorsArray.length)];
                this.visitors.delete(randomVisitor);
            }
        }, 3000);
    }

    getStats() {
        return {
            visitors: {
                current: this.visitors.size,
                total: this.serverStats.requests
            },
            server: {
                uptime: this.formatUptime(Date.now() - this.serverStats.uptime),
                load: this.serverStats.load || 0,
                requests: this.serverStats.requests,
                errors: this.serverStats.errors,
                status: this.getServerStatus()
            },
            lastUpdate: this.serverStats.lastUpdate
        };
    }

    getServerStatus() {
        const load = this.serverStats.load || 0;
        if (load < 30) return 'excellent';
        if (load < 60) return 'good';
        if (load < 80) return 'warning';
        return 'critical';
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    broadcastStats() {
        // Invia statistiche a tutti i pannelli admin aperti
        const stats = this.getStats();
        const event = new CustomEvent('adminStatsUpdate', { detail: stats });
        window.dispatchEvent(event);
    }
}

// Istanze globali
export const adminAuth = new AdminAuth();
export const monitoring = new RealTimeMonitoring();

// Avvia monitoraggio se amministratore autenticato
if (adminAuth.isAuthenticated()) {
    monitoring.start();
}