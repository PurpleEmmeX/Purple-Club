// Sistema di autenticazione fallback per Purple Club
// Gestisce l'autenticazione locale quando Firebase non è disponibile

export class LocalAuth {
    constructor() {
        this.isFirebaseAvailable = false;
        this.checkFirebaseStatus();
    }

    async checkFirebaseStatus() {
        try {
            // Tenta di importare Firebase
            const { auth } = await import('./firebase-config.js');
            if (auth) {
                this.isFirebaseAvailable = true;
                console.log('✅ Firebase disponibile');
            }
        } catch (error) {
            console.warn('⚠️ Firebase non disponibile, usando autenticazione locale:', error.message);
            this.isFirebaseAvailable = false;
        }
    }

    async authenticateUser(email, password) {
        if (this.isFirebaseAvailable) {
            return await this.firebaseAuth(email, password);
        } else {
            return await this.localAuth(email, password);
        }
    }

    async firebaseAuth(email, password) {
        try {
            const { auth } = await import('./firebase-config.js');
            const { signInAnonymously } = await import('firebase/auth');
            
            // Usa autenticazione anonima per Firebase
            const userCredential = await signInAnonymously(auth);
            console.log('✅ Autenticazione Firebase riuscita');
            return {
                success: true,
                method: 'firebase',
                user: userCredential.user
            };
        } catch (error) {
            console.error('❌ Errore autenticazione Firebase:', error);
            // Fallback a autenticazione locale
            return await this.localAuth(email, password);
        }
    }

    async localAuth(email, password) {
        console.log('🔐 Tentativo di autenticazione locale per:', email);
        
        // Prima controlla i profili salvati in localStorage
        const savedProfiles = this.getSavedProfiles();
        let user = savedProfiles.find(account => 
            account.email === email && account.password === password
        );
        
        // Se non trovato, controlla gli account di default
        if (!user) {
            const { ADMIN_ACCOUNTS } = await import('./admin-config.js');
            const account = ADMIN_ACCOUNTS[email] || ADMIN_ACCOUNTS[password]; // Supporta anche username come password
            
            if (account && (account.password === password || email === password)) {
                user = {
                    email: email,
                    name: account.name,
                    role: account.role,
                    permissions: account.permissions
                };
            }
        }
        
        if (user) {
            console.log('✅ Autenticazione locale riuscita per:', user.name);
            return {
                success: true,
                method: 'local',
                user: user
            };
        }
        
        console.error('❌ Credenziali non valide');
        return {
            success: false,
            method: 'local',
            error: 'Credenziali non valide'
        };
    }

    // Funzione per ottenere i profili salvati
    getSavedProfiles() {
        try {
            const stored = localStorage.getItem('admin_profiles');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Errore nel caricamento profili:', error);
            return [];
        }
    }

    async initializeForEvents() {
        if (this.isFirebaseAvailable) {
            try {
                const { auth } = await import('./firebase-config.js');
                const { signInAnonymously } = await import('firebase/auth');
                
                // Autenticazione anonima per gestione eventi
                await signInAnonymously(auth);
                console.log('✅ Autenticazione anonima per eventi inizializzata');
                return true;
            } catch (error) {
                console.warn('⚠️ Impossibile inizializzare autenticazione Firebase per eventi:', error);
                return false;
            }
        }
        return false;
    }
}

// Istanza globale
export const localAuth = new LocalAuth();

// Funzione di utilità per inizializzare l'autenticazione
export async function initializeAuth() {
    try {
        await localAuth.checkFirebaseStatus();
        
        // Se Firebase è disponibile, inizializza per eventi
        if (localAuth.isFirebaseAvailable) {
            await localAuth.initializeForEvents();
        }
        
        console.log('🔐 Sistema di autenticazione inizializzato');
        return localAuth;
    } catch (error) {
        console.error('❌ Errore inizializzazione autenticazione:', error);
        return localAuth;
    }
}

// Auto-inizializzazione
initializeAuth();