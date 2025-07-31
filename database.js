// Database Manager for Purple Club
// Gestione Database per Purple Club

// Importa le funzioni Firestore direttamente dal CDN
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy,
    onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Funzione per ottenere il database Firebase con retry
function getFirebaseDb() {
    if (window.firebaseDb) {
        return window.firebaseDb;
    }
    throw new Error('Firebase non inizializzato. Assicurati che Firebase sia caricato correttamente.');
}

// Utility per retry automatico
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.warn(`⚠️ Tentativo ${i + 1} fallito, riprovo in ${delay}ms:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
}

class DatabaseManager {
    constructor() {
        this.eventsCollection = 'events';
        this.listeners = [];
    }

    // Carica tutti gli eventi dal database (solo approvati)
    async loadEvents() {
        try {
            return await retryOperation(async () => {
                const db = getFirebaseDb();
                const q = query(collection(db, this.eventsCollection), orderBy('date', 'asc'));
                const querySnapshot = await getDocs(q);
                const events = [];
                
                querySnapshot.forEach((doc) => {
                    const eventData = { id: doc.id, ...doc.data() };
                    // Mostra solo eventi approvati o senza stato (compatibilità)
                    if (!eventData.status || eventData.status === 'approved') {
                        events.push(eventData);
                    }
                });
                
                console.log(`✅ Caricati ${events.length} eventi approvati da Firebase`);
                return events;
            });
        } catch (error) {
            console.error('❌ Errore critico nel caricamento eventi da Firebase:', error);
            // Fallback al localStorage se Firebase non è disponibile
            return this.loadEventsFromLocalStorage();
        }
    }

    // Salva un nuovo evento nel database
    async saveEvent(eventData) {
        try {
            const db = getFirebaseDb();
            const docRef = await addDoc(collection(db, this.eventsCollection), {
                ...eventData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log('Evento salvato con ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Errore nel salvataggio evento:', error);
            // Fallback al localStorage
            this.saveEventToLocalStorage(eventData);
            throw error;
        }
    }

    // Aggiorna un evento esistente
    async updateEvent(eventId, eventData) {
        try {
            const db = getFirebaseDb();
            const eventRef = doc(db, this.eventsCollection, eventId);
            await updateDoc(eventRef, {
                ...eventData,
                updatedAt: new Date()
            });
            
            console.log('Evento aggiornato:', eventId);
            return true;
        } catch (error) {
            console.error('Errore nell\'aggiornamento evento:', error);
            throw error;
        }
    }

    // Elimina un evento dal database
    async deleteEvent(eventId) {
        try {
            const db = getFirebaseDb();
            await deleteDoc(doc(db, this.eventsCollection, eventId));
            console.log('Evento eliminato:', eventId);
            return true;
        } catch (error) {
            console.error('Errore nell\'eliminazione evento:', error);
            throw error;
        }
    }

    // Ascolta i cambiamenti in tempo reale
    listenToEvents(callback) {
        try {
            const db = getFirebaseDb();
            const q = query(collection(db, this.eventsCollection));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const events = [];
                querySnapshot.forEach((doc) => {
                    events.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(events);
            });
            
            this.listeners.push(unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('Errore nell\'ascolto eventi:', error);
            // Fallback: carica una volta dal localStorage
            const events = this.loadEventsFromLocalStorage();
            callback(events);
        }
    }

    // Metodi di fallback per localStorage
    loadEventsFromLocalStorage() {
        const savedEvents = localStorage.getItem('purpleClubEvents');
        return savedEvents ? JSON.parse(savedEvents) : [];
    }

    saveEventToLocalStorage(eventData) {
        const events = this.loadEventsFromLocalStorage();
        const newEvent = {
            ...eventData,
            id: Date.now().toString() // ID temporaneo
        };
        events.push(newEvent);
        localStorage.setItem('purpleClubEvents', JSON.stringify(events));
        return newEvent.id;
    }

    // Sincronizza localStorage con Firebase (per la migrazione)
    async syncLocalStorageToFirebase() {
        try {
            const localEvents = this.loadEventsFromLocalStorage();
            if (localEvents.length === 0) return;

            console.log('Sincronizzazione eventi da localStorage a Firebase...');
            
            for (const event of localEvents) {
                // Rimuovi l'ID locale prima di salvare su Firebase
                const { id, ...eventData } = event;
                await this.saveEvent(eventData);
            }
            
            console.log('Sincronizzazione completata!');
            // Opzionale: pulisci localStorage dopo la sincronizzazione
            // localStorage.removeItem('purpleClubEvents');
        } catch (error) {
            console.error('Errore nella sincronizzazione:', error);
        }
    }

    // Pulisci tutti i listener
    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }

    // Verifica la connessione a Firebase
    async testConnection() {
        try {
            const db = getFirebaseDb();
            await getDocs(collection(db, this.eventsCollection));
            return true;
        } catch (error) {
            console.error('Connessione Firebase fallita:', error);
            return false;
        }
    }

    // Carica eventi in attesa di moderazione
    async loadPendingEvents() {
        try {
            const db = getFirebaseDb();
            const q = query(collection(db, this.eventsCollection));
            const querySnapshot = await getDocs(q);
            const pendingEvents = [];
            
            querySnapshot.forEach((doc) => {
                const eventData = { id: doc.id, ...doc.data() };
                if (eventData.status === 'pending') {
                    pendingEvents.push(eventData);
                }
            });
            
            console.log(`📋 Trovati ${pendingEvents.length} eventi in attesa di moderazione`);
            return pendingEvents;
        } catch (error) {
            console.warn('⚠️ Errore nel caricamento eventi in attesa:', error);
            return [];
        }
    }

    // Approva un evento
    async approveEvent(eventId) {
        try {
            const db = getFirebaseDb();
            const eventRef = doc(db, this.eventsCollection, eventId);
            await updateDoc(eventRef, {
                status: 'approved',
                approvedAt: new Date().toISOString(),
                approvedBy: 'admin'
            });
            console.log(`✅ Evento ${eventId} approvato`);
            return true;
        } catch (error) {
            console.error('❌ Errore nell\'approvazione evento:', error);
            return false;
        }
    }

    // Rifiuta un evento
    async rejectEvent(eventId, reason = '') {
        try {
            const db = getFirebaseDb();
            const eventRef = doc(db, this.eventsCollection, eventId);
            await updateDoc(eventRef, {
                status: 'rejected',
                rejectedAt: new Date().toISOString(),
                rejectedBy: 'admin',
                rejectionReason: reason
            });
            console.log(`❌ Evento ${eventId} rifiutato`);
            return true;
        } catch (error) {
            console.error('❌ Errore nel rifiuto evento:', error);
            return false;
        }
    }
}

// Esporta un'istanza singleton
export const dbManager = new DatabaseManager();
export default DatabaseManager;