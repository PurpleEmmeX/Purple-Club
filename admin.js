document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticazione
    if (!sessionStorage.getItem('adminAuthenticated')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostra messaggio di benvenuto
    showWelcomeMessage();
    
    // Inizializza la navigazione del pannello
    initAdminNavigation();
    
    const AdminPanel = {
        // Elementi DOM
        elements: {
            eventsList: document.getElementById('admin-events-list'),
            eventForm: document.getElementById('event-form'),
            eventFormContainer: document.getElementById('event-form-container'),
            eventPreview: document.getElementById('event-preview'),
            previewContainer: document.querySelector('.preview-container'),
            addEventBtn: document.getElementById('add-event-btn'),
            cancelBtn: document.getElementById('cancel-btn'),
            formTitle: document.getElementById('form-title'),
            eventIdInput: document.getElementById('event-id'),
            eventTitleInput: document.getElementById('event-title'),
            eventDayInput: document.getElementById('event-day'),
            eventMonthInput: document.getElementById('event-month'),
            eventYearInput: document.getElementById('event-year'),
            eventGenreInput: document.getElementById('event-genre'),
            eventArtistInput: document.getElementById('event-artist'),
            eventVenueInput: document.getElementById('event-venue'),
            eventTimeInput: document.getElementById('event-time'),
            eventPriceInput: document.getElementById('event-price'),
            eventFeaturedInput: document.getElementById('event-featured'),
            eventSoldOutInput: document.getElementById('event-sold-out')
        },
        
        // Dati degli eventi
        events: [],
        currentEventId: null,
        isEditing: false,
        
        // Inizializzazione
        async init() {
            await this.loadEvents();
            this.renderEventsList();
            this.setupEventListeners();
            
            // Configura listener per aggiornamenti in tempo reale
            if (window.dbManager) {
                window.dbManager.listenToEvents((events) => {
                    this.events = events;
                    this.renderEventsList();
                    this.updateMainSite();
                });
            }
        },
        
        // Carica gli eventi dal database (Firebase + localStorage fallback)
        async loadEvents() {
            try {
                // Prova a caricare da Firebase se disponibile
                if (window.dbManager) {
                    this.events = await window.dbManager.loadEvents();
                    console.log('Eventi caricati da Firebase:', this.events.length);
                } else {
                    // Fallback al localStorage
                    this.loadEventsFromLocalStorage();
                }
            } catch (error) {
                console.error('Errore nel caricamento eventi:', error);
                // Fallback al localStorage in caso di errore
                this.loadEventsFromLocalStorage();
            }
        },
        
        // Carica eventi dal localStorage (fallback)
        loadEventsFromLocalStorage() {
            const savedEvents = localStorage.getItem('purpleClubEvents');
            if (savedEvents) {
                this.events = JSON.parse(savedEvents);
            } else {
                this.events = [];
                this.saveEventsToLocalStorage();
            }
        },
        
        // Salva gli eventi (Firebase + localStorage)
        async saveEvents() {
            // Salva sempre nel localStorage come backup
            this.saveEventsToLocalStorage();
        },
        
        // Salva nel localStorage
        saveEventsToLocalStorage() {
            localStorage.setItem('purpleClubEvents', JSON.stringify(this.events));
        },
        
        // Configura gli event listener
        setupEventListeners() {
            // Aggiungi evento
            this.elements.addEventBtn.addEventListener('click', () => this.showEventForm());
            
            // Annulla
            this.elements.cancelBtn.addEventListener('click', () => this.hideEventForm());
            
            // Submit form
            this.elements.eventForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Live preview
            this.elements.eventTitleInput.addEventListener('input', () => this.updatePreview());
            this.elements.eventDayInput.addEventListener('input', () => this.updatePreview());
            this.elements.eventMonthInput.addEventListener('change', () => this.updatePreview());
            this.elements.eventGenreInput.addEventListener('input', () => this.updatePreview());
            this.elements.eventArtistInput.addEventListener('input', () => this.updatePreview());
            this.elements.eventVenueInput.addEventListener('input', () => this.updatePreview());
            this.elements.eventTimeInput.addEventListener('input', () => this.updatePreview());
            this.elements.eventPriceInput.addEventListener('input', () => this.updatePreview());
            this.elements.eventFeaturedInput.addEventListener('change', () => this.updatePreview());
            this.elements.eventSoldOutInput.addEventListener('change', () => this.updatePreview());
        },
        
        // Mostra il form per aggiungere/modificare un evento
        showEventForm(eventId = null) {
            this.elements.eventFormContainer.style.display = 'block';
            
            if (eventId) {
                // Modifica evento esistente
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    this.isEditing = true;
                    this.currentEventId = eventId;
                    this.elements.formTitle.textContent = 'Modifica Evento';
                    this.elements.eventIdInput.value = event.id;
                    this.elements.eventTitleInput.value = event.title;
                    this.elements.eventDayInput.value = event.day;
                    this.elements.eventMonthInput.value = event.month;
                    this.elements.eventYearInput.value = event.year || new Date().getFullYear();
                    this.elements.eventGenreInput.value = event.genre;
                    this.elements.eventArtistInput.value = event.artist;
                    this.elements.eventVenueInput.value = event.venue;
                    this.elements.eventTimeInput.value = event.time;
                    this.elements.eventPriceInput.value = event.price;
                    this.elements.eventFeaturedInput.checked = event.featured;
                    this.elements.eventSoldOutInput.checked = event.soldOut;
                }
            } else {
                // Nuovo evento
                this.isEditing = false;
                this.currentEventId = null;
                this.elements.formTitle.textContent = 'Aggiungi Nuovo Evento';
                this.elements.eventForm.reset();
                this.elements.eventIdInput.value = '';
            }
            
            this.updatePreview();
        },
        
        // Nasconde il form
        hideEventForm() {
            this.elements.eventFormContainer.style.display = 'none';
            this.elements.eventForm.reset();
            this.isEditing = false;
            this.currentEventId = null;
        },
        
        // Gestisce l'invio del form
        async handleFormSubmit(e) {
            e.preventDefault();
            
            // Validazione dei campi obbligatori
            if (!this.elements.eventTitleInput.value.trim()) {
                this.showNotification('Il titolo dell\'evento è obbligatorio!', 'error');
                return;
            }
            
            if (!this.elements.eventArtistInput.value.trim()) {
                this.showNotification('L\'artista è obbligatorio!', 'error');
                return;
            }
            
            const eventData = {
                title: this.elements.eventTitleInput.value.trim(),
                day: parseInt(this.elements.eventDayInput.value) || 1,
                month: this.elements.eventMonthInput.value || 'GEN',
                year: parseInt(this.elements.eventYearInput.value) || new Date().getFullYear(),
                genre: this.elements.eventGenreInput.value.trim() || 'Genere',
                artist: this.elements.eventArtistInput.value.trim(),
                venue: this.elements.eventVenueInput.value.trim() || 'Location',
                time: this.elements.eventTimeInput.value.trim() || '00:00 - 00:00',
                price: parseInt(this.elements.eventPriceInput.value) || 0,
                featured: this.elements.eventFeaturedInput.checked,
                soldOut: this.elements.eventSoldOutInput.checked,
                description: `Evento ${this.elements.eventGenreInput.value.trim() || 'musicale'} con ${this.elements.eventArtistInput.value.trim()}`
            };
            
            try {
                if (this.isEditing && this.currentEventId) {
                    // Aggiorna evento esistente
                    if (window.dbManager) {
                        await window.dbManager.updateEvent(this.currentEventId, eventData);
                    }
                    
                    const index = this.events.findIndex(e => e.id === this.currentEventId);
                    if (index !== -1) {
                        eventData.id = this.currentEventId;
                        this.events[index] = eventData;
                        this.showNotification(`Evento "${eventData.title}" aggiornato con successo!`, 'success');
                        this.addToActivityLog(`Evento modificato: ${eventData.title}`);
                    } else {
                        this.showNotification('Errore: Evento non trovato per la modifica!', 'error');
                        return;
                    }
                } else {
                    // Aggiungi nuovo evento
                    let newEventId;
                    
                    if (window.dbManager) {
                        newEventId = await window.dbManager.saveEvent(eventData);
                        eventData.id = newEventId;
                    } else {
                        eventData.id = this.generateEventId();
                    }
                    
                    this.events.push(eventData);
                    this.showNotification(`Nuovo evento "${eventData.title}" aggiunto!`, 'success');
                    this.addToActivityLog(`Nuovo evento aggiunto: ${eventData.title}`);
                }
                
                await this.saveEvents();
                this.renderEventsList();
                this.hideEventForm();
                this.updateMainSite();
                
            } catch (error) {
                console.error('Errore nel salvataggio evento:', error);
                this.showNotification('Errore nel salvataggio. Riprova.', 'error');
            }
        },
        
        // Genera un ID univoco per un nuovo evento
        generateEventId() {
            return this.events.length > 0 ? Math.max(...this.events.map(e => e.id)) + 1 : 1;
        },
        
        // Renderizza la lista degli eventi nella sidebar
        renderEventsList() {
            this.elements.eventsList.innerHTML = '';
            
            if (this.events.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.textContent = 'Nessun evento disponibile';
                emptyMessage.style.padding = '10px';
                emptyMessage.style.opacity = '0.7';
                this.elements.eventsList.appendChild(emptyMessage);
                return;
            }
            
            this.events.forEach(event => {
                const li = document.createElement('li');
                li.dataset.id = event.id;
                
                const eventInfo = document.createElement('div');
                
                const title = document.createElement('div');
                title.className = 'event-list-title';
                title.textContent = event.title;
                
                const date = document.createElement('div');
                date.className = 'event-list-date';
                date.textContent = `${event.day} ${event.month} - ${event.artist}`;
                
                eventInfo.appendChild(title);
                eventInfo.appendChild(date);
                
                const actions = document.createElement('div');
                actions.className = 'event-actions';
                
                const editBtn = document.createElement('button');
                editBtn.className = 'event-action-btn edit';
                editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEventForm(parseInt(li.dataset.id));
                });
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'event-action-btn delete';
                deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteEvent(parseInt(li.dataset.id));
                });
                
                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
                
                li.appendChild(eventInfo);
                li.appendChild(actions);
                
                li.addEventListener('click', () => {
                    this.showEventForm(parseInt(li.dataset.id));
                });
                
                this.elements.eventsList.appendChild(li);
            });
        },
        
        // Elimina un evento
        async deleteEvent(eventId) {
            if (confirm('Sei sicuro di voler eliminare questo evento?')) {
                try {
                    const index = this.events.findIndex(e => e.id === eventId);
                    if (index !== -1) {
                        const deletedEvent = this.events[index];
                        
                        // Elimina da Firebase se disponibile
                        if (window.dbManager) {
                            await window.dbManager.deleteEvent(eventId);
                        }
                        
                        // Rimuovi dall'array locale
                        this.events.splice(index, 1);
                        await this.saveEvents();
                        this.renderEventsList();
                        this.showNotification(`Evento "${deletedEvent.title}" eliminato con successo!`, 'success');
                        this.updateMainSite();
                        
                        // Aggiorna il log delle attività
                        this.addToActivityLog(`Evento eliminato: ${deletedEvent.title}`);
                    } else {
                        this.showNotification('Errore: Evento non trovato!', 'error');
                    }
                } catch (error) {
                    console.error('Errore nell\'eliminazione evento:', error);
                    this.showNotification('Errore nell\'eliminazione. Riprova.', 'error');
                }
            }
        },
        
        // Aggiorna l'anteprima dell'evento
        updatePreview() {
            const title = this.elements.eventTitleInput.value || 'Titolo Evento';
            const day = this.elements.eventDayInput.value || '01';
            const month = this.elements.eventMonthInput.value || 'GEN';
            const year = this.elements.eventYearInput.value || new Date().getFullYear();
            const genre = this.elements.eventGenreInput.value || 'Genere';
            const artist = this.elements.eventArtistInput.value || 'Artista';
            const venue = this.elements.eventVenueInput.value || 'Location';
            const time = this.elements.eventTimeInput.value || '00:00 - 00:00';
            const price = this.elements.eventPriceInput.value || '0';
            const featured = this.elements.eventFeaturedInput.checked;
            const soldOut = this.elements.eventSoldOutInput.checked;
            
            const previewHTML = `
                <div class="event-card ${featured ? 'featured' : ''} ${soldOut ? 'sold-out' : ''}">
                    <div class="event-image">
                        <div class="event-date">
                            <span class="day">${day}</span>
                            <span class="month">${month}</span>
                            <span class="year">${year}</span>
                        </div>
                        ${soldOut ? '<div class="event-status">SOLD OUT</div>' : ''}
                    </div>
                    <div class="event-content">
                        <div class="event-genre">${genre}</div>
                        <h3 class="event-title">${title}</h3>
                        <p class="event-artist">${artist}</p>
                        <div class="event-details">
                            <div class="event-venue">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 10C21 17L12 23L3 10C3 6.13401 6.13401 3 10 3H14C17.866 3 21 6.13401 21 10Z" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                <span>${venue}</span>
                            </div>
                            <div class="event-time">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span>${time}</span>
                            </div>
                        </div>
                        <button class="event-btn" ${soldOut ? 'disabled' : ''}>
                            ${soldOut ? '<span>Sold Out</span>' : '<span>ACQUISTA</span>'}
                        </button>
                        ${!soldOut ? `<div class="event-price">€${price}</div>` : ''}
                    </div>
                </div>
            `;
            
            this.elements.previewContainer.innerHTML = previewHTML;
        },
        
        // Aggiorna il sito principale con i nuovi eventi
        updateMainSite() {
            // Forza il refresh degli eventi nel sito principale
            // rimuovendo temporaneamente gli eventi dal localStorage
            // così il sistema principale ricaricherà gli eventi aggiornati
            const currentEvents = localStorage.getItem('purpleClubEvents');
            if (currentEvents) {
                // Rimuovi temporaneamente
                localStorage.removeItem('purpleClubEvents');
                // Risalva immediatamente con i nuovi dati
                localStorage.setItem('purpleClubEvents', JSON.stringify(this.events));
            }
            
            console.log('Eventi aggiornati:', this.events);
            this.showNotification('Eventi aggiornati! Le modifiche sono ora visibili nel sito principale.', 'success', 3000);
        },
        
        // Mostra una notifica
        showNotification(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? 'rgba(0, 255, 0, 0.1)' : type === 'error' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
                border: 1px solid ${type === 'success' ? 'rgba(0, 255, 0, 0.3)' : type === 'error' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
                color: #ffffff;
                padding: 1rem 2rem;
                border-radius: 5px;
                backdrop-filter: blur(10px);
                z-index: 10000;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
                font-size: 0.9rem;
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                notification.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }, duration);
        },
        
        // Aggiunge un'attività al log
        addToActivityLog(action) {
            if (typeof addToActivityLog === 'function') {
                addToActivityLog(action);
            } else {
                // Fallback se la funzione globale non è disponibile
                console.log('Activity Log:', action);
            }
        }
    };
    
    // Gestione logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('adminAuthenticated');
        window.location.href = 'login.html';
    });
    
    // Inizializza il pannello di amministrazione
    AdminPanel.init().catch(error => {
        console.error('Errore nell\'inizializzazione del pannello admin:', error);
    });
    
    // Inizializza il database manager se disponibile
    if (window.dbManager) {
        window.dbManager.testConnection().then(connected => {
            if (connected) {
                console.log('✅ Connessione Firebase attiva');
                // Mostra notifica di connessione
                setTimeout(() => {
                    AdminPanel.showNotification('Database cloud connesso! 🔥', 'success');
                }, 1000);
            } else {
                console.log('⚠️ Firebase non disponibile, usando localStorage');
                AdminPanel.showNotification('Modalità offline - usando localStorage', 'warning');
            }
        });
    } else {
        console.log('📱 Modalità localStorage');
        AdminPanel.showNotification('Modalità locale - configura Firebase per il cloud', 'info');
    }
    
    // Inizializza gestione server
    initializeServerManagement();
    
    // Aggiorna stato server ogni 10 secondi
    setInterval(updateServerStatus, 10000);
});

// Server Management Functions
function initializeServerManagement() {
    // Event listeners per i pulsanti server
    document.getElementById('publish-site')?.addEventListener('click', publishSite);
    document.getElementById('backup-before-deploy')?.addEventListener('click', backupAndDeploy);
    document.getElementById('rollback-deploy')?.addEventListener('click', rollbackDeploy);
    document.getElementById('save-server-config')?.addEventListener('click', saveServerConfig);
    document.getElementById('test-config')?.addEventListener('click', testServerConfig);
    
    // Carica configurazione server
    loadServerConfig();
    
    // Carica log deployment
    loadDeploymentLogs();
    
    // Aggiorna statistiche
    updateServerStats();
    
    // Primo aggiornamento stato server
    updateServerStatus();
}

function updateServerStatus() {
    const statusIndicator = document.getElementById('server-status-indicator');
    const statusText = document.getElementById('server-status-text');
    const serverUrl = document.getElementById('server-url');
    const serverUptime = document.getElementById('server-uptime');
    const lastUpdate = document.getElementById('last-update');
    
    // Simula controllo stato server
    const isOnline = true; // In un'implementazione reale, questo sarebbe un controllo HTTP
    
    if (statusIndicator && statusText) {
        const statusDot = statusIndicator.querySelector('.status-dot');
        if (isOnline) {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'Online';
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'Offline';
        }
    }
    
    if (serverUrl) {
        serverUrl.textContent = window.location.origin;
    }
    
    if (serverUptime) {
        const uptime = calculateUptime();
        serverUptime.textContent = uptime;
    }
    
    if (lastUpdate) {
        lastUpdate.textContent = new Date().toLocaleString('it-IT');
    }
}

function calculateUptime() {
    // Simula calcolo uptime
    const startTime = localStorage.getItem('server-start-time') || Date.now();
    const currentTime = Date.now();
    const uptimeMs = currentTime - startTime;
    
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function publishSite() {
    const deploymentStatus = document.getElementById('deployment-status');
    const statusText = deploymentStatus.querySelector('.status-text');
    
    // Simula processo di pubblicazione
    deploymentStatus.className = 'deployment-status deploying';
    statusText.textContent = 'Pubblicazione in corso...';
    
    addDeploymentLog('Avvio pubblicazione sito');
    
    setTimeout(() => {
        deploymentStatus.className = 'deployment-status';
        statusText.textContent = 'Sito pubblicato con successo';
        addDeploymentLog('Pubblicazione completata con successo');
        
        // Aggiorna statistiche
        updateServerStats();
        
        showNotification('Sito pubblicato con successo!', 'success');
    }, 3000);
}

function backupAndDeploy() {
    const deploymentStatus = document.getElementById('deployment-status');
    const statusText = deploymentStatus.querySelector('.status-text');
    
    deploymentStatus.className = 'deployment-status deploying';
    statusText.textContent = 'Backup e deployment in corso...';
    
    addDeploymentLog('Avvio backup automatico');
    
    setTimeout(() => {
        addDeploymentLog('Backup completato');
        addDeploymentLog('Avvio deployment');
        
        setTimeout(() => {
            deploymentStatus.className = 'deployment-status';
            statusText.textContent = 'Backup e deployment completati';
            addDeploymentLog('Deployment completato con successo');
            
            updateServerStats();
            showNotification('Backup e deployment completati!', 'success');
        }, 2000);
    }, 2000);
}

function rollbackDeploy() {
    const deploymentStatus = document.getElementById('deployment-status');
    const statusText = deploymentStatus.querySelector('.status-text');
    
    deploymentStatus.className = 'deployment-status deploying';
    statusText.textContent = 'Rollback in corso...';
    
    addDeploymentLog('Avvio rollback alla versione precedente');
    
    setTimeout(() => {
        deploymentStatus.className = 'deployment-status';
        statusText.textContent = 'Rollback completato';
        addDeploymentLog('Rollback completato con successo');
        
        showNotification('Rollback completato!', 'info');
    }, 2000);
}

function saveServerConfig() {
    const config = {
        domainName: document.getElementById('domain-name')?.value || '',
        sslEnabled: document.getElementById('ssl-enabled')?.checked || false,
        cdnEnabled: document.getElementById('cdn-enabled')?.checked || false,
        cacheDuration: document.getElementById('cache-duration')?.value || '24'
    };
    
    localStorage.setItem('server-config', JSON.stringify(config));
    addDeploymentLog('Configurazione server salvata');
    showNotification('Configurazione salvata!', 'success');
}

function loadServerConfig() {
    const savedConfig = localStorage.getItem('server-config');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        if (document.getElementById('domain-name')) {
            document.getElementById('domain-name').value = config.domainName || '';
        }
        if (document.getElementById('ssl-enabled')) {
            document.getElementById('ssl-enabled').checked = config.sslEnabled || false;
        }
        if (document.getElementById('cdn-enabled')) {
            document.getElementById('cdn-enabled').checked = config.cdnEnabled || false;
        }
        if (document.getElementById('cache-duration')) {
            document.getElementById('cache-duration').value = config.cacheDuration || '24';
        }
    }
}

function testServerConfig() {
    addDeploymentLog('Test configurazione server avviato');
    
    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% di successo
        
        if (success) {
            addDeploymentLog('Test configurazione: SUCCESSO');
            showNotification('Configurazione testata con successo!', 'success');
        } else {
            addDeploymentLog('Test configurazione: ERRORE - Verificare impostazioni');
            showNotification('Errore nella configurazione!', 'error');
        }
    }, 1500);
}

function updateServerStats() {
    // Simula aggiornamento statistiche
    const stats = {
        totalVisits: Math.floor(Math.random() * 10000) + 1000,
        todayVisits: Math.floor(Math.random() * 500) + 50,
        activeEvents: Math.floor(Math.random() * 10) + 1,
        totalRegistrations: Math.floor(Math.random() * 200) + 20
    };
    
    document.getElementById('total-visits').textContent = stats.totalVisits.toLocaleString();
    document.getElementById('today-visits').textContent = stats.todayVisits.toLocaleString();
    document.getElementById('active-events').textContent = stats.activeEvents;
    document.getElementById('total-registrations').textContent = stats.totalRegistrations.toLocaleString();
}

function addDeploymentLog(message) {
    const logContainer = document.getElementById('deployment-log-container');
    if (!logContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const timestamp = new Date().toLocaleString('it-IT');
    logEntry.innerHTML = `
        <span class="log-time">${timestamp}</span>
        <span class="log-message">${message}</span>
    `;
    
    // Rimuovi il messaggio "Nessun deployment effettuato" se presente
    const noDeployMsg = logContainer.querySelector('.log-entry .log-message');
    if (noDeployMsg && noDeployMsg.textContent === 'Nessun deployment effettuato') {
        logContainer.innerHTML = '';
    }
    
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // Mantieni solo gli ultimi 50 log
    const entries = logContainer.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        entries[entries.length - 1].remove();
    }
    
    // Salva i log nel localStorage
    saveDeploymentLogs();
}

function saveDeploymentLogs() {
    const logContainer = document.getElementById('deployment-log-container');
    if (!logContainer) return;
    
    const entries = Array.from(logContainer.querySelectorAll('.log-entry')).map(entry => ({
        time: entry.querySelector('.log-time').textContent,
        message: entry.querySelector('.log-message').textContent
    }));
    
    localStorage.setItem('deployment-logs', JSON.stringify(entries));
}

function loadDeploymentLogs() {
    const savedLogs = localStorage.getItem('deployment-logs');
    if (!savedLogs) return;
    
    const logs = JSON.parse(savedLogs);
    const logContainer = document.getElementById('deployment-log-container');
    
    if (logContainer && logs.length > 0) {
        logContainer.innerHTML = '';
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <span class="log-time">${log.time}</span>
                <span class="log-message">${log.message}</span>
            `;
            logContainer.appendChild(logEntry);
        });
    }
}

// Inizializza server start time se non esiste
if (!localStorage.getItem('server-start-time')) {
    localStorage.setItem('server-start-time', Date.now());
}

// Funzione per mostrare il messaggio di benvenuto
function showWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-welcome');
    
    // Controlla se l'utente ha appena fatto login
    const showWelcomeBoss = sessionStorage.getItem('showWelcomeBoss');
    
    if (welcomeMessage && showWelcomeBoss === 'true') {
        // Personalizza il messaggio per il "Boss"
        const welcomeContent = welcomeMessage.querySelector('.welcome-content');
        if (welcomeContent) {
            welcomeContent.innerHTML = `
                <h3>🎉 Benvenuto Boss! 🎉</h3>
                <p>Accesso effettuato con successo. Pronto a dominare il Purple Club?</p>
            `;
        }
        
        // Rimuovi il flag per evitare che si mostri di nuovo
        sessionStorage.removeItem('showWelcomeBoss');
        
        // Mostra il messaggio con un piccolo ritardo per l'effetto
        setTimeout(() => {
            welcomeMessage.style.display = 'block';
        }, 300);
        
        // Gestisce la chiusura del messaggio
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                welcomeMessage.style.display = 'none';
            });
        }
        
        // Chiude automaticamente dopo 7 secondi (più tempo per leggere)
        setTimeout(() => {
            if (welcomeMessage.style.display !== 'none') {
                welcomeMessage.style.display = 'none';
            }
        }, 7000);
    }
}

// Funzione per inizializzare la navigazione del pannello admin
function initAdminNavigation() {
    const settingsBtn = document.getElementById('settings-btn');
    const notificationsBtn = document.getElementById('notifications-btn');
    const addEventBtn = document.getElementById('add-event-btn');
    
    const settingsContainer = document.getElementById('settings-container');
    const notificationsContainer = document.getElementById('notifications-container');
    const eventFormContainer = document.getElementById('event-form-container');
    
    // Funzione per nascondere tutte le sezioni
    function hideAllSections() {
        settingsContainer.style.display = 'none';
        notificationsContainer.style.display = 'none';
        eventFormContainer.style.display = 'none';
    }
    
    // Funzione per rimuovere classe attiva da tutti i pulsanti
    function removeActiveClass() {
        document.querySelectorAll('.admin-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Gestione click pulsante impostazioni
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            hideAllSections();
            removeActiveClass();
            settingsContainer.style.display = 'block';
            settingsBtn.classList.add('active');
        });
    }
    
    // Gestione click pulsante notifiche
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            hideAllSections();
            removeActiveClass();
            notificationsContainer.style.display = 'block';
            notificationsBtn.classList.add('active');
        });
    }
    
    // Gestione click pulsante server
    const serverBtn = document.getElementById('server-btn');
    const serverContainer = document.getElementById('server-container');
    if (serverBtn) {
        serverBtn.addEventListener('click', () => {
            hideAllSections();
            removeActiveClass();
            serverContainer.style.display = 'block';
            serverBtn.classList.add('active');
        });
    }
    
    // Gestione click pulsante nuovo evento
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            hideAllSections();
            removeActiveClass();
            eventFormContainer.style.display = 'block';
            addEventBtn.classList.add('active');
        });
    }
    
    // Mostra la sezione eventi per default
    eventFormContainer.style.display = 'block';
    addEventBtn.classList.add('active');
    
    // Inizializza le funzionalità delle impostazioni
    initSettingsFeatures();
    
    // Inizializza le funzionalità delle notifiche
    initNotificationsFeatures();
}

// Funzioni per le impostazioni avanzate
function initSettingsFeatures() {
    // Backup manuale
    const manualBackupBtn = document.getElementById('manual-backup');
    if (manualBackupBtn) {
        manualBackupBtn.addEventListener('click', () => {
            performBackup();
        });
    }
    
    // Salva impostazioni
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveSettings();
        });
    }
    
    // Reset impostazioni
    const resetSettingsBtn = document.getElementById('reset-settings');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Sei sicuro di voler resettare tutte le impostazioni?')) {
                resetSettings();
            }
        });
    }
    
    // Carica impostazioni salvate
    loadSettings();
}

// Funzioni per le notifiche
function initNotificationsFeatures() {
    // Salva configurazione notifiche
    const saveNotificationsBtn = document.getElementById('save-notifications');
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', () => {
            saveNotificationSettings();
        });
    }
    
    // Test notifiche
    const testNotificationsBtn = document.getElementById('test-notifications');
    if (testNotificationsBtn) {
        testNotificationsBtn.addEventListener('click', () => {
            testNotifications();
        });
    }
    
    // Carica configurazione notifiche
    loadNotificationSettings();
    
    // Aggiorna log attività
    updateActivityLog();
}

// Funzione per eseguire backup
function performBackup() {
    const events = localStorage.getItem('purpleClubEvents') || '[]';
    const settings = localStorage.getItem('purpleClubSettings') || '{}';
    const notifications = localStorage.getItem('purpleClubNotifications') || '{}';
    
    const backupData = {
        timestamp: new Date().toISOString(),
        events: JSON.parse(events),
        settings: JSON.parse(settings),
        notifications: JSON.parse(notifications)
    };
    
    // Simula il backup (in un'app reale, questo invierebbe i dati al server)
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purple-club-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    // Aggiorna timestamp ultimo backup
    document.getElementById('last-backup').textContent = new Date().toLocaleString('it-IT');
    localStorage.setItem('lastBackup', new Date().toISOString());
    
    // Aggiungi al log
    addToActivityLog('Backup manuale completato');
    
    alert('Backup completato con successo!');
}

// Funzione per salvare le impostazioni
function saveSettings() {
    const settings = {
        backupFrequency: document.getElementById('backup-frequency').value,
        adminLevel: document.getElementById('admin-level').value,
        sessionTimeout: document.getElementById('session-timeout').value,
        smtpServer: document.getElementById('smtp-server').value,
        adminEmail: document.getElementById('admin-email').value,
        emailNotifications: document.getElementById('email-notifications').checked,
        paymentProvider: document.getElementById('payment-provider').value,
        paymentApiKey: document.getElementById('payment-api-key').value,
        testMode: document.getElementById('test-mode').checked
    };
    
    localStorage.setItem('purpleClubSettings', JSON.stringify(settings));
    addToActivityLog('Impostazioni salvate');
    alert('Impostazioni salvate con successo!');
}

// Funzione per caricare le impostazioni
function loadSettings() {
    const savedSettings = localStorage.getItem('purpleClubSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        document.getElementById('backup-frequency').value = settings.backupFrequency || 'weekly';
        document.getElementById('admin-level').value = settings.adminLevel || 'admin';
        document.getElementById('session-timeout').value = settings.sessionTimeout || '8';
        document.getElementById('smtp-server').value = settings.smtpServer || '';
        document.getElementById('admin-email').value = settings.adminEmail || '';
        document.getElementById('email-notifications').checked = settings.emailNotifications !== false;
        document.getElementById('payment-provider').value = settings.paymentProvider || 'stripe';
        document.getElementById('payment-api-key').value = settings.paymentApiKey || '';
        document.getElementById('test-mode').checked = settings.testMode !== false;
    }
    
    // Carica timestamp ultimo backup
    const lastBackup = localStorage.getItem('lastBackup');
    if (lastBackup) {
        document.getElementById('last-backup').textContent = new Date(lastBackup).toLocaleString('it-IT');
    }
}

// Funzione per resettare le impostazioni
function resetSettings() {
    localStorage.removeItem('purpleClubSettings');
    localStorage.removeItem('lastBackup');
    loadSettings();
    addToActivityLog('Impostazioni resettate');
    alert('Impostazioni resettate!');
}

// Funzione per salvare configurazione notifiche
function saveNotificationSettings() {
    const notifications = {
        soldoutAlerts: document.getElementById('soldout-alerts').checked,
        soldoutThreshold: document.getElementById('soldout-threshold').value,
        deadlineReminders: document.getElementById('deadline-reminders').checked,
        reminderDays: document.getElementById('reminder-days').value,
        signupNotifications: document.getElementById('signup-notifications').checked,
        dailySummary: document.getElementById('daily-summary').checked,
        activityLogging: document.getElementById('activity-logging').checked,
        logRetention: document.getElementById('log-retention').value
    };
    
    localStorage.setItem('purpleClubNotifications', JSON.stringify(notifications));
    addToActivityLog('Configurazione notifiche salvata');
    alert('Configurazione notifiche salvata!');
}

// Funzione per caricare configurazione notifiche
function loadNotificationSettings() {
    const savedNotifications = localStorage.getItem('purpleClubNotifications');
    if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications);
        
        document.getElementById('soldout-alerts').checked = notifications.soldoutAlerts !== false;
        document.getElementById('soldout-threshold').value = notifications.soldoutThreshold || '90';
        document.getElementById('deadline-reminders').checked = notifications.deadlineReminders !== false;
        document.getElementById('reminder-days').value = notifications.reminderDays || '7';
        document.getElementById('signup-notifications').checked = notifications.signupNotifications !== false;
        document.getElementById('daily-summary').checked = notifications.dailySummary !== false;
        document.getElementById('activity-logging').checked = notifications.activityLogging !== false;
        document.getElementById('log-retention').value = notifications.logRetention || '30';
    }
}

// Funzione per testare le notifiche
function testNotifications() {
    addToActivityLog('Test notifiche eseguito');
    alert('Test notifiche completato! Controlla il log attività.');
}

// Funzione per aggiungere al log attività
function addToActivityLog(action) {
    const logList = document.getElementById('activity-log-list');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const timestamp = new Date().toLocaleString('it-IT');
    logEntry.innerHTML = `
        <span class="log-time">${timestamp}</span>
        <span class="log-action">${action}</span>
    `;
    
    logList.insertBefore(logEntry, logList.firstChild);
    
    // Mantieni solo gli ultimi 10 log visibili
    while (logList.children.length > 10) {
        logList.removeChild(logList.lastChild);
    }
    
    // Salva nel localStorage
    const logs = JSON.parse(localStorage.getItem('purpleClubLogs') || '[]');
    logs.unshift({ timestamp, action });
    logs.splice(50); // Mantieni solo gli ultimi 50 log
    localStorage.setItem('purpleClubLogs', JSON.stringify(logs));
}

// Funzione per aggiornare il log attività
function updateActivityLog() {
    const logs = JSON.parse(localStorage.getItem('purpleClubLogs') || '[]');
    const logList = document.getElementById('activity-log-list');
    
    logList.innerHTML = '';
    
    logs.slice(0, 10).forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${new Date(log.timestamp).toLocaleString('it-IT')}</span>
            <span class="log-action">${log.action}</span>
        `;
        logList.appendChild(logEntry);
    });
}