// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las funcionalidades
    initNavigation();
    initScrollEffects();
    initMobileMenu();
    initAnimations();
});

// Navegación suave
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Calcular posición considerando el header fijo
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Actualizar enlace activo
                    updateActiveNavLink(this);
                    
                    // Cerrar menú móvil si está abierto
                    closeMobileMenu();
                }
            }
        });
    });
}

// Actualizar enlace de navegación activo
function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    activeLink.classList.add('active');
}

// Efectos de scroll
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        // Header con efecto al hacer scroll
        if (window.scrollY > 100) {
            header.style.background = 'rgba(33, 33, 33, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, var(--primary-black), var(--dark-gray))';
            header.style.backdropFilter = 'none';
        }
        
        // Actualizar navegación activa según sección visible
        updateActiveNavOnScroll();
    });
}

// Actualizar navegación activa basado en scroll
function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = '#' + section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentSection) {
            link.classList.add('active');
        }
    });
}

// Menú móvil
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuBtn && navList) {
        mobileMenuBtn.addEventListener('click', function() {
            navList.classList.toggle('active');
            this.classList.toggle('active');
            
            // Animación del botón hamburguesa
            const spans = this.querySelectorAll('span');
            if (navList.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

// Cerrar menú móvil
function closeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    if (navList && navList.classList.contains('active')) {
        navList.classList.remove('active');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
}

// Animaciones al hacer scroll
function initAnimations() {
    const animatedElements = document.querySelectorAll('.match-card, .news-card, .stat-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// Efectos de hover mejorados para tarjetas
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.match-card, .news-card, .player-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
});

// Función para cargar y mostrar los próximos partidos
function cargarProximosPartidos() {
    const STORAGE_KEY = 'clubMatches';
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
        console.warn('No hay datos de partidos en localStorage');
        return;
    }

    try {
        const data = JSON.parse(stored);
        const matches = data.matches || [];
        const teams = data.teams || {};

        // Filtrar solo partidos publicados y con fecha futura
        const ahora = new Date();
        const partidosFuturos = matches
            .filter(match => match.status === 'published')
            .filter(match => {
                const fechaPartido = new Date(match.date + 'T' + (match.time || '00:00'));
                return fechaPartido > ahora;
            })
            .sort((a, b) => {
                const fechaA = new Date(a.date + 'T' + (a.time || '00:00'));
                const fechaB = new Date(b.date + 'T' + (b.time || '00:00'));
                return fechaA - fechaB;
            })
            .slice(0, 3); // Solo los 3 más próximos

        actualizarUIProximosPartidos(partidosFuturos, teams);
        
    } catch (e) {
        console.error('Error cargando próximos partidos:', e);
    }
}

// Función para actualizar la UI con los partidos
function actualizarUIProximosPartidos(partidos, teams) {
    const matchesGrid = document.querySelector('.matches-grid');
    
    if (!matchesGrid) return;

    if (partidos.length === 0) {
        matchesGrid.innerHTML = `
            <div class="no-matches" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--dark-gray);">
                No hay partidos próximos programados
            </div>
        `;
        return;
    }

    matchesGrid.innerHTML = partidos.map(match => {
        const teamName = teams[match.teamId]?.name || 'CB Dominicos';
        const fecha = new Date(match.date + 'T' + (match.time || '00:00'));
        const dia = fecha.getDate();
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
        const hora = match.time ? match.time.substring(0, 5) + 'h' : 'Por determinar';
        
        // Determinar si es local o visitante
        const esLocal = !match.opponent.includes('CB Dominicos') && 
                        !match.opponent.includes('Dominicos');
        
        const equipoLocal = esLocal ? teamName : match.opponent;
        const equipoVisitante = esLocal ? match.opponent : teamName;

        return `
            <div class="match-card">
                <div class="match-date">
                    <span class="day">${dia}</span>
                    <span class="month">${mes}</span>
                </div>
                <div class="match-info">
                    <div class="teams">
                        <span class="team ${esLocal ? 'home' : 'away'}">${equipoLocal}</span>
                        <span class="vs">VS</span>
                        <span class="team ${esLocal ? 'away' : 'home'}">${equipoVisitante}</span>
                    </div>
                    <div class="match-details">
                        <span class="category">${teamName}</span>
                        <span class="location">📍 ${match.address || 'Por determinar'}</span>
                        <span class="time">🕒 ${hora}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Función para formatear fecha en español
function formatearFecha(dateStr) {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const fecha = new Date(dateStr + 'T00:00:00');
    return {
        dia: fecha.getDate(),
        mes: meses[fecha.getMonth()]
    };
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarProximosPartidos();
    
    // También puedes recargar los partidos cada cierto tiempo si quieres
     setInterval(cargarProximosPartidos, 300000); // cada 5 minutos
});