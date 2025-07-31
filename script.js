// Purple Club - Cyberpunk Futuristic JavaScript

// Cyberpunk Particle System
class CyberpunkParticles {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        this.canvas.className = 'particles';
        document.body.appendChild(this.canvas);
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        // Ottimizzazione: riduce il numero di particelle su dispositivi mobili
        const isMobile = window.innerWidth < 768;
        const baseCount = isMobile ? 30000 : 15000;
        const maxParticles = isMobile ? 50 : 100;
        
        const particleCount = Math.min(
            Math.floor((window.innerWidth * window.innerHeight) / baseCount),
            maxParticles
        );
        
        this.particles = []; // Reset array
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                pulse: Math.random() * 0.02 + 0.01
            });
        }
    }

    animate() {
        // Throttling per performance su dispositivi lenti
        if (!this.lastFrame) this.lastFrame = 0;
        const now = performance.now();
        const deltaTime = now - this.lastFrame;
        
        if (deltaTime < 16.67) { // ~60fps
            requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.lastFrame = now;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Pulse effect
            particle.opacity += particle.pulse;
            if (particle.opacity >= 0.8 || particle.opacity <= 0.1) {
                particle.pulse *= -1;
            }
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
            
            // Draw connections
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Glitch Effect System
class GlitchEffect {
    constructor() {
        this.glitchElements = document.querySelectorAll('.glitch');
        this.init();
    }

    init() {
        this.glitchElements.forEach(element => {
            this.addGlitchEffect(element);
        });
    }

    addGlitchEffect(element) {
        setInterval(() => {
            if (Math.random() < 0.1) {
                element.style.animation = 'none';
                element.offsetHeight; // Trigger reflow
                element.style.animation = 'glitch-1 0.3s ease-out';
            }
        }, 3000);
    }


}

// Cyberpunk Navigation
class CyberpunkNavigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.handleScroll();
        this.handleNavigation();
        this.handleMobileMenu();
        this.setupSmoothScrolling();
        
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        
        if (scrolled > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
        
        // Chiudi il menu mobile quando si scrolla
        if (this.isMenuOpen && window.innerWidth <= 768) {
            this.toggleMobileMenu();
        }
    }

    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        
                        // Chiudi il menu mobile se aperto
                        if (this.isMenuOpen) {
                            this.toggleMobileMenu();
                        }
                        
                        // Aggiorna link attivo
                        this.updateActiveLink(link);
                    }
                }
            });
        });
    }

    updateActiveLink(activeLink) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('mobile-active');
        
        // Previeni lo scroll del body quando il menu è aperto
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navToggle.classList.remove('active');
        this.navMenu.classList.remove('mobile-active');
        document.body.style.overflow = '';
    }

    handleNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Update active link
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    handleMobileMenu() {
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Chiudi il menu cliccando fuori
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }
}

// Cyberpunk Animations
class CyberpunkAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.animateHeroElements();
        this.setupCounters();
        this.setupHoverEffects();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    
                    // Trigger counter animation for stats
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, this.observerOptions);

        // Observe elements
        document.querySelectorAll('.event-card, .feature, .stat-item, .contact-item').forEach(el => {
            observer.observe(el);
        });
    }

    animateHeroElements() {
        setTimeout(() => {
            const heroEventsPreview = document.querySelector('.hero-events-preview');
            const heroStats = document.querySelector('.hero-stats');
            
            if (heroEventsPreview) {
                heroEventsPreview.style.opacity = '1';
                heroEventsPreview.style.transform = 'translateY(0)';
            }
            
            if (heroStats) {
                heroStats.style.opacity = '1';
                heroStats.style.transform = 'translateY(0)';
            }
        }, 1000);
    }

    setupCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            counter.dataset.target = counter.textContent;
            counter.textContent = '0';
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target + (element.dataset.target.includes('+') ? '+' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    setupHoverEffects() {
        // Magnetic button effect
        document.querySelectorAll('.btn, .event-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
        
        // Card tilt effect
        document.querySelectorAll('.event-card, .feature, .hero-event-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }
}

// Cyberpunk Form Handler
class CyberpunkForm {
    constructor() {
        this.form = document.querySelector('.form');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupFormValidation();
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Simulate form submission
        this.showNotification('MESSAGGIO INVIATO CON SUCCESSO', 'success');
        this.form.reset();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('focus', () => {
                input.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                input.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.2)';
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
        }
        
        if (isValid) {
            field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            field.style.boxShadow = 'none';
        } else {
            field.style.borderColor = 'rgba(255, 0, 0, 0.5)';
            field.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.2)';
        }
        
        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }



    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
            border: 1px solid ${type === 'success' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
            color: #ffffff;
            padding: 1rem 2rem;
            border-radius: 5px;
            backdrop-filter: blur(10px);
            z-index: 10000;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Event Interaction System
class EventInteraction {
    constructor() {
        this.events = [];
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.generateEvents();
        this.setupEventCards();
        this.setupHeroEventCards();
    }
    
    // Carica gli eventi dal localStorage
    async loadEvents() {
        console.log('🔄 Iniziando caricamento eventi...');
        console.log('🔍 window.dbManager disponibile:', !!window.dbManager);
        console.log('🔍 window.firebaseDb disponibile:', !!window.firebaseDb);
        
        try {
            // Prova a caricare da Firebase se disponibile
            if (window.dbManager) {
                console.log('🔥 Tentativo caricamento da Firebase...');
                this.events = await window.dbManager.loadEvents();
                console.log('✅ Eventi caricati da Firebase:', this.events.length);
                console.log('📊 Eventi Firebase:', this.events);
                
                // Configura listener per aggiornamenti in tempo reale
                console.log('🔄 Configurazione listener real-time...');
                window.dbManager.listenToEvents((events) => {
                    console.log('🔔 Aggiornamento real-time ricevuto:', events.length, 'eventi');
                    this.events = events;
                    this.generateEvents();
                });
                console.log('✅ Listener real-time configurato');
            } else {
                console.log('⚠️ Firebase non disponibile, usando localStorage');
                // Fallback al localStorage
                const savedEvents = localStorage.getItem('purpleClubEvents');
                if (savedEvents) {
                    this.events = JSON.parse(savedEvents);
                    console.log('📱 Eventi caricati da localStorage:', this.events.length);
                } else {
                    // Inizia con una lista vuota
                    this.events = [];
                    console.log('📱 Nessun evento in localStorage, lista vuota');
                }
            }
        } catch (error) {
            console.error('❌ Errore nel caricamento eventi da Firebase:', error);
            console.log('🔄 Fallback a localStorage...');
            // Fallback al localStorage in caso di errore
            const savedEvents = localStorage.getItem('purpleClubEvents');
            if (savedEvents) {
                this.events = JSON.parse(savedEvents);
                console.log('📱 Eventi caricati da localStorage (fallback):', this.events.length);
            } else {
                this.events = [];
                console.log('📱 Nessun evento disponibile (fallback)');
            }
        }
        
        console.log('🏁 Caricamento eventi completato. Totale eventi:', this.events.length);
    }

    // Genera gli eventi nella pagina principale
    generateEvents() {
        const eventsGrid = document.querySelector('.events-grid');
        if (!eventsGrid) return;
        
        // Svuota il contenitore degli eventi
        eventsGrid.innerHTML = '';
        
        // Se non ci sono eventi, mostra un messaggio
        if (this.events.length === 0) {
            eventsGrid.innerHTML = `
                <div class="empty-events">
                    <p>Nessun evento disponibile al momento.</p>
                </div>
            `;
            return;
        }
        
        // Genera gli eventi
        this.events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = `event-card ${event.featured ? 'featured' : ''} ${event.soldOut ? 'sold-out' : ''}`;
            eventCard.dataset.eventId = event.id;
            
            eventCard.innerHTML = `
                <div class="event-image">
                    <div class="event-date">
                        <span class="day">${event.day}</span>
                        <span class="month">${event.month}</span>
                        <span class="year">${event.year || new Date().getFullYear()}</span>
                    </div>
                    ${event.soldOut ? '<div class="event-status">SOLD OUT</div>' : ''}
                </div>
                <div class="event-content">
                    <div class="event-genre">${event.genre}</div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-artist">${event.artist}</p>
                    <div class="event-details">
                        <div class="event-venue">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M21 10C21 17L12 23L3 10C3 6.13401 6.13401 3 10 3H14C17.866 3 21 6.13401 21 10Z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span>${event.venue}</span>
                        </div>
                        <div class="event-time">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>${event.time}</span>
                        </div>
                    </div>
                    <button class="event-btn" ${event.soldOut ? 'disabled' : ''}>
                        ${event.soldOut ? '<span>Sold Out</span>' : '<span>ACQUISTA</span>'}
                    </button>
                    ${!event.soldOut ? `<div class="event-price">€${event.price}</div>` : ''}
                </div>
            `;
            
            eventsGrid.appendChild(eventCard);
        });
    }
    
    setupEventCards() {
        // Prima genera gli eventi
        this.generateEvents();
        
        // Poi configura gli event listener
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const eventCards = document.querySelectorAll('.event-card');
        
        // Aggiungi click listener alle card per mostrare dettagli
        eventCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Se il click è sul pulsante, non fare nulla (gestito separatamente)
                if (e.target.closest('.event-btn')) return;
                
                const eventTitle = card.querySelector('h3').textContent;
                const eventArtist = card.querySelector('.event-artist').textContent;
                this.showNotification(`DETTAGLI: ${eventTitle} - ${eventArtist}`, 'info');
            });
        });
        
        // Aggiungi event listener per i pulsanti
        document.querySelectorAll('.event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita che si propaghi al click della card
                const card = e.target.closest('.event-card');
                const eventTitle = card.querySelector('h3').textContent;
                
                if (btn.textContent.includes('SOLD OUT')) {
                    this.showNotification('EVENTO SOLD OUT', 'error');
                } else {
                    this.showNotification(`PRENOTAZIONE PER ${eventTitle} CONFERMATA`, 'success');
                }
            });
        });
    }

    setupHeroEventCards() {
        document.querySelectorAll('.hero-event-card').forEach(card => {
            card.addEventListener('click', () => {
                const eventTitle = card.querySelector('h4').textContent;
                this.showNotification(`DETTAGLI ${eventTitle}`, 'info');
                
                // Scroll to events section
                const eventsSection = document.querySelector('#events');
                if (eventsSection) {
                    eventsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }



    showNotification(message, type = 'info') {
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
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Matrix Rain Effect (Easter Egg)
class MatrixRain {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
        this.drops = [];
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.8);
        `;
        
        document.body.appendChild(this.canvas);
        this.resize();
        this.setupDrops();
        this.animate();
        
        // Auto-stop after 10 seconds
        setTimeout(() => this.stop(), 10000);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupDrops() {
        const columns = Math.floor(this.canvas.width / 20);
        this.drops = new Array(columns).fill(0);
    }

    animate() {
        if (!this.isActive) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '15px monospace';
        
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(text, i * 20, this.drops[i] * 20);
            
            if (this.drops[i] * 20 > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        
        requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isActive) {
            this.isActive = true;
            this.init();
        }
    }

    stop() {
        this.isActive = false;
        if (this.canvas) {
            document.body.removeChild(this.canvas);
            this.canvas = null;
        }
    }
}

// Konami Code Easter Egg
class KonamiCode {
    constructor() {
        this.sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        this.userInput = [];
        this.matrixRain = new MatrixRain();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            this.userInput.push(e.code);
            
            if (this.userInput.length > this.sequence.length) {
                this.userInput.shift();
            }
            
            if (this.userInput.join(',') === this.sequence.join(',')) {
                this.activateEasterEgg();
                this.userInput = [];
            }
        });
    }

    activateEasterEgg() {
        this.matrixRain.start();
        
        // Show special message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00ff00;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
            font-size: 2rem;
            font-weight: 900;
            text-align: center;
            z-index: 10000;
            text-shadow: 0 0 20px #00ff00;
            animation: pulse 1s infinite;
        `;
        message.innerHTML = 'WELCOME TO THE MATRIX<br>PURPLE CLUB ACTIVATED';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 5000);
    }
}

// Typewriter Effect Class
class TypewriterEffect {
    constructor(elementId, text, speed = 150, loopDelay = 3000) {
        this.element = document.getElementById(elementId);
        this.text = text;
        this.speed = speed;
        this.loopDelay = loopDelay;
        this.currentIndex = 0;
        this.isRunning = false;
    }

    start() {
        if (!this.element || this.isRunning) return;
        
        this.isRunning = true;
        this.typeText();
    }

    typeText() {
        this.element.textContent = '';
        this.currentIndex = 0;
        this.typeNextCharacter();
    }

    typeNextCharacter() {
        if (this.currentIndex < this.text.length) {
            this.element.textContent += this.text[this.currentIndex];
            this.currentIndex++;
            setTimeout(() => this.typeNextCharacter(), this.speed);
        } else {
            // Restart after delay
            setTimeout(() => this.typeText(), this.loopDelay);
        }
    }

    stop() {
        this.isRunning = false;
    }
}

// Loading Overlay Functions
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; color: #ffffff;">
            <div style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="font-family: 'Monaco', monospace; text-transform: uppercase; letter-spacing: 2px;">LOADING PURPLE CLUB...</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 500);
    }
}

// Breadcrumbs System
class BreadcrumbsSystem {
    constructor() {
        this.breadcrumbsContainer = document.querySelector('.breadcrumbs');
        this.init();
    }

    init() {
        if (this.breadcrumbsContainer) {
            this.updateBreadcrumbs();
            this.setupNavigation();
        }
    }

    updateBreadcrumbs() {
        const path = window.location.pathname;
        const breadcrumbs = this.generateBreadcrumbs(path);
        
        if (breadcrumbs.length > 1) {
            this.breadcrumbsContainer.innerHTML = breadcrumbs.map((crumb, index) => {
                if (index === breadcrumbs.length - 1) {
                    return `<span class="breadcrumb-current">${crumb.name}</span>`;
                } else {
                    return `<a href="${crumb.url}" class="breadcrumb-link">${crumb.name}</a>`;
                }
            }).join(' <span class="breadcrumb-separator">/</span> ');
        }
    }

    generateBreadcrumbs(path) {
        const breadcrumbs = [{ name: 'Home', url: '/' }];
        
        if (path.includes('events')) {
            breadcrumbs.push({ name: 'Eventi', url: '/events' });
        }
        if (path.includes('gallery')) {
            breadcrumbs.push({ name: 'Gallery', url: '/gallery' });
        }
        if (path.includes('contact')) {
            breadcrumbs.push({ name: 'Contatti', url: '/contact' });
        }
        
        return breadcrumbs;
    }

    setupNavigation() {
        document.querySelectorAll('.breadcrumb-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigateToSection(href);
            });
        });
    }

    navigateToSection(href) {
        if (href === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const sectionId = href.replace('/', '');
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
}

// Search System
class SearchSystem {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.searchResults = document.querySelector('.search-results');
        this.events = [];
        this.init();
    }

    init() {
        if (this.searchInput) {
            this.loadEvents();
            this.setupSearch();
        }
    }

    loadEvents() {
        // Load events from EventInteraction class or localStorage
        const savedEvents = localStorage.getItem('purpleClubEvents');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents);
        } else {
            // Inizia con una lista vuota
            this.events = [];
        }
    }

    setupSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length > 2) {
                this.performSearch(query);
            } else {
                this.hideResults();
            }
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim().length > 2) {
                this.showResults();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });
    }

    performSearch(query) {
        const results = this.events.filter(event => 
            event.title.toLowerCase().includes(query) ||
            event.artist.toLowerCase().includes(query) ||
            event.genre.toLowerCase().includes(query) ||
            event.venue.toLowerCase().includes(query)
        );

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    <p>Nessun evento trovato per "${query}"</p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results.map(event => `
                <div class="search-result-item" data-event-id="${event.id}">
                    <div class="search-result-date">
                        <span class="day">${event.day}</span>
                        <span class="month">${event.month}</span>
                    </div>
                    <div class="search-result-content">
                        <h4>${event.title}</h4>
                        <p>${event.artist}</p>
                        <span class="search-result-genre">${event.genre}</span>
                    </div>
                    <div class="search-result-price">${event.price}</div>
                </div>
            `).join('');

            // Add click handlers to results
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const eventId = item.dataset.eventId;
                    this.selectEvent(eventId);
                });
            });
        }

        this.showResults();
    }

    selectEvent(eventId) {
        this.hideResults();
        this.searchInput.value = '';
        
        // Scroll to events section and highlight the event
        const eventsSection = document.getElementById('events');
        if (eventsSection) {
            eventsSection.scrollIntoView({ behavior: 'smooth' });
            
            setTimeout(() => {
                const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
                if (eventCard) {
                    eventCard.style.animation = 'highlight 2s ease-out';
                }
            }, 1000);
        }
    }

    showResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
    }

    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }
}

// Error Handling System
class ErrorHandlingSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupImageErrorHandling();
        this.setupNetworkErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showErrorNotification('Si è verificato un errore. Ricarica la pagina.');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showErrorNotification('Errore di connessione. Controlla la tua connessione internet.');
        });
    }

    setupImageErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=';
                e.target.alt = 'Immagine non disponibile';
            }
        }, true);
    }

    setupNetworkErrorHandling() {
        // Monitor network status
        window.addEventListener('online', () => {
            this.showSuccessNotification('Connessione ripristinata!');
        });

        window.addEventListener('offline', () => {
            this.showErrorNotification('Connessione persa. Alcune funzionalità potrebbero non essere disponibili.');
        });
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
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
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize Breadcrumbs
function initializeBreadcrumbs() {
    new BreadcrumbsSystem();
}

// Initialize Search
function initializeSearch() {
    new SearchSystem();
}

// Initialize Error Handling
function initializeErrorHandling() {
    new ErrorHandlingSystem();
}

// Funzione per mostrare avviso regole di sicurezza Firebase
function showFirebaseSecurityWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'firebase-security-warning';
    warningDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 350px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    warningDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 20px; margin-right: 8px;">🔒</span>
            <strong>Problema Sincronizzazione Eventi</strong>
        </div>
        <p style="margin: 8px 0;">Le regole di sicurezza Firestore bloccano l'accesso. Gli eventi non si sincronizzano tra browser.</p>
        <div style="margin-top: 12px;">
            <a href="test-firebase.html" target="_blank" style="background: white; color: #ff4444; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">🛠️ Risolvi Problema</a>
            <button onclick="document.getElementById('firebase-security-warning').remove()" style="background: transparent; color: white; border: 1px solid white; padding: 8px 12px; margin-left: 8px; border-radius: 4px; cursor: pointer;">✕ Chiudi</button>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (document.getElementById('firebase-security-warning')) {
            warningDiv.remove();
        }
    }, 30000);
}

// Initialize all systems when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    showLoadingOverlay();
    
    // Simulate loading time
    setTimeout(() => {
        hideLoadingOverlay();
        
        // Initialize all cyberpunk systems
        new CyberpunkParticles();
        new GlitchEffect();
        new CyberpunkNavigation();
        new CyberpunkAnimations();
        new CyberpunkForm();
        
        // Initialize event system (async)
        const eventSystem = new EventInteraction();
        
        new KonamiCode();
        initializeBreadcrumbs();
        initializeSearch();
        initializeErrorHandling();
        
        // Initialize database manager if Firebase is available
        if (typeof dbManager !== 'undefined') {
            window.dbManager = dbManager;
            console.log('🔥 Firebase Database Manager caricato');
            
            // Test Firebase connectivity and show warning if needed
            setTimeout(async () => {
                try {
                    await window.dbManager.testConnection();
                    console.log('✅ Firebase connection test passed');
                } catch (error) {
                    console.error('❌ Firebase connection failed:', error);
                    if (error.code === 'permission-denied') {
                        showFirebaseSecurityWarning();
                    }
                }
            }, 2000);
        } else {
            console.log('📱 Modalità localStorage - Firebase non configurato');
        }
        
        // Start typewriter effect after a short delay
        setTimeout(() => {
            const typewriter = new TypewriterEffect('typewriter-text', 'Purple Club', 200);
            typewriter.start();
        }, 500);
    }, 1500);

    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('%c🚀 PURPLE CLUB CYBERPUNK SYSTEM ONLINE', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    console.log('%c💾 Try the Konami Code: ↑↑↓↓←→←→BA', 'color: #ffffff; font-size: 12px;');
});