// Datos de los equipos actualizados
const teamsData = {
    'escuela': {
        name: 'Escuela de Baloncesto',
        category: 'Iniciación',
        level: 'Principiante',
        coach: 'Varios monitores',
        image: 'assets/img/escuela.jpg',
        players: [
            { dorsal: 5, name: 'Lucía Martínez' },
            { dorsal: 7, name: 'Carlos Ruiz' },
            { dorsal: 10, name: 'Sofía García' },
            { dorsal: 12, name: 'Daniel López' },
            { dorsal: 14, name: 'María González' },
            { dorsal: 15, name: 'Pablo Sánchez' }
        ]
    },
    'benjamin-mixto': {
        name: 'Benjamín Mixto',
        category: 'Benjamín',
        level: 'Mixto',
        coach: 'Miguel Ángel Fraca',
        image: 'assets/img/benjaminmx.jpg',
        players: [
            { dorsal: 4, name: 'Martín Sánchez' },
            { dorsal: 6, name: 'Claudia Torres' },
            { dorsal: 8, name: 'Javier Molina' },
            { dorsal: 10, name: 'Elena Castro' },
            { dorsal: 12, name: 'David López' },
            { dorsal: 14, name: 'Ana Ruiz' }
        ]
    },
    'benjamin-femenino': {
        name: 'Benjamín Femenino',
        category: 'Benjamín',
        level: 'Femenino',
        coach: 'Miguel Ángel Franco',
        image: 'assets/img/benjaminf.jpg',
        players: [
            { dorsal: 5, name: 'Ana Rodríguez' },
            { dorsal: 7, name: 'Marta López' },
            { dorsal: 9, name: 'Carla García' },
            { dorsal: 11, name: 'Sara Martínez' },
            { dorsal: 13, name: 'Laura Hernández' },
            { dorsal: 15, name: 'Patricia Díaz' }
        ]
    },
    'alevin-f1': {
        name: 'Alevín F1',
        category: 'Alevín',
        level: 'Femenino',
        coach: 'Carmen',
        image: 'assets/img/alevinf1.jpg',
        players: [
            { dorsal: 4, name: 'Laura Hernández' },
            { dorsal: 6, name: 'Patricia Díaz' },
            { dorsal: 8, name: 'Nuria Sánchez' },
            { dorsal: 10, name: 'Eva Romero' },
            { dorsal: 12, name: 'Cristina Navarro' },
            { dorsal: 14, name: 'Alba Jiménez' }
        ]
    },
    'alevin-f2': {
        name: 'Alevín F2',
        category: 'Alevín',
        level: 'Femenino',
        coach: 'María',
        image: 'assets/img/alevinf2.jpg',
        players: [
            { dorsal: 5, name: 'Cristina Navarro' },
            { dorsal: 7, name: 'Alba Jiménez' },
            { dorsal: 9, name: 'Lidia Ortega' },
            { dorsal: 11, name: 'Raquel Vega' },
            { dorsal: 13, name: 'Sandra Morales' },
            { dorsal: 15, name: 'Natalia Ruiz' }
        ]
    },
    'preinfantil-femenino': {
        name: 'Preinfantil Femenino',
        category: 'Preinfantil',
        level: 'Femenino',
        coach: 'Jorge',
        image: 'assets/img/preinfantilf.jpg',
        players: [
            { dorsal: 4, name: 'Sandra Morales' },
            { dorsal: 6, name: 'Natalia Ruiz' },
            { dorsal: 8, name: 'Verónica Castro' },
            { dorsal: 10, name: 'Miriam Santos' },
            { dorsal: 12, name: 'Elena Mendoza' },
            { dorsal: 14, name: 'Clara Ortega' }
        ]
    },
    'infantil-femenino': {
        name: 'Infantil Femenino',
        category: 'Infantil',
        level: 'Femenino',
        coach: 'Rubén',
        image: 'assets/img/infantilf.jpg',
        players: [
            { dorsal: 1, name: 'Carolina Guillen' },
            { dorsal: 6, name: 'Martina Herreros' },
            { dorsal: 8, name: 'María Galvez' },
            { dorsal: 9, name: 'Valeria Notario' },
            { dorsal: 18, name: 'Alma Sánchez' },
            { dorsal: 19, name: 'Noa Sánchez' },
            { dorsal: 28, name: 'Daniela Sánchez' },
            { dorsal: 31, name: 'María Ilarri' },
            { dorsal: 32, name: 'Iosune Lucas' },
            { dorsal: 33, name: 'Carla Peña' },
            { dorsal: 35, name: 'Blanca Artieda' }
        ]
    },
    'cadete-f1': {
        name: 'Cadete F1',
        category: 'Cadete',
        level: 'Femenino',
        coach: 'Pablo',
        image: 'assets/img/cadetef1.jpg',
        players: [
            { dorsal: 4, name: 'Marina López' },
            { dorsal: 6, name: 'Celia Martínez' },
            { dorsal: 8, name: 'Alicia Sánchez' },
            { dorsal: 10, name: 'Daniela Ruiz' },
            { dorsal: 12, name: 'Sonia García' },
            { dorsal: 14, name: 'Lorena Díaz' }
        ]
    },
    'cadete-f2': {
        name: 'Cadete F2',
        category: 'Cadete',
        level: 'Femenino',
        coach: 'Claudia',
        image: 'assets/img/cadetef2.jpg',
        players: [
            { dorsal: 5, name: 'Sonia García' },
            { dorsal: 7, name: 'Lorena Díaz' },
            { dorsal: 9, name: 'Mónica Hernández' },
            { dorsal: 11, name: 'Teresa Vargas' },
            { dorsal: 13, name: 'Paula Romero' },
            { dorsal: 15, name: 'Cristina Navarro' }
        ]
    },
    'junior-f1': {
        name: 'Junior F1',
        category: 'Junior',
        level: 'Femenino',
        coach: 'Inés',
        image: 'assets/img/juniorf1.jpg',
        players: [
            { dorsal: 4, name: 'Paula Romero' },
            { dorsal: 6, name: 'Cristina Navarro' },
            { dorsal: 8, name: 'Eva Torres' },
            { dorsal: 10, name: 'Sara Jiménez' },
            { dorsal: 12, name: 'Natalia Castro' },
            { dorsal: 14, name: 'Laura Morales' }
        ]
    },
    'junior-f2': {
        name: 'Junior F2',
        category: 'Junior',
        level: 'Femenino',
        coach: 'Miguel Ángel Franco',
        image: 'assets/img/juniorf2.jpg',
        players: [
            { dorsal: 5, name: 'Natalia Castro' },
            { dorsal: 7, name: 'Laura Morales' },
            { dorsal: 9, name: 'Ana Santos' },
            { dorsal: 11, name: 'Miriam Ortega' },
            { dorsal: 13, name: 'Elena Martínez' },
            { dorsal: 15, name: 'Carla Sánchez' }
        ]
    },
    'senior': {
        name: 'Senior 2da Aragonesa',
        category: 'Senior',
        level: 'Femenino',
        coach: 'Miguel Ángel Fraca',
        image: 'assets/img/senior.jpg',
        players: [
            { dorsal: 4, name: 'Elena Martínez' },
            { dorsal: 6, name: 'Carla Sánchez' },
            { dorsal: 8, name: 'Patricia López' },
            { dorsal: 10, name: 'Sonia García' },
            { dorsal: 12, name: 'Marta Rodríguez' },
            { dorsal: 14, name: 'Laura Castro' }
        ]
    }
};

// Inicializar funcionalidades de equipos
document.addEventListener('DOMContentLoaded', function() {
    initTeamNavigation();
    initTeamFilter();
    loadTeamData('escuela'); // Cargar equipo por defecto
});

// Navegación entre equipos
function initTeamNavigation() {
    const teamLinks = document.querySelectorAll('.team-nav-link');
    
    teamLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const teamId = this.getAttribute('data-team');
            
            // Actualizar enlace activo
            teamLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Cargar datos del equipo
            loadTeamData(teamId);
            
            // Scroll suave hacia la sección
            document.querySelector('.teams-content').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// Filtrado de equipos
function initTeamFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Actualizar botón activo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Aplicar filtro
            filterTeams(filter);
        });
    });
}

// Filtrar equipos por categoría
function filterTeams(filter) {
    const teamLinks = document.querySelectorAll('.team-nav-link');
    
    teamLinks.forEach(link => {
        const teamId = link.getAttribute('data-team');
        const teamData = teamsData[teamId];
        
        if (filter === 'all' || 
            (filter === 'femenino' && teamData.level === 'Femenino') ||
            (filter === 'masculino' && teamData.level === 'Masculino') ||
            (filter === 'mixto' && teamData.level === 'Mixto')) {
            link.parentElement.style.display = 'block';
        } else {
            link.parentElement.style.display = 'none';
        }
    });
}

// Cargar datos del equipo seleccionado
function loadTeamData(teamId) {
    const teamData = teamsData[teamId];
    
    if (!teamData) return;
    
    // Obtener o crear contenedor del equipo
    let teamDetail = document.getElementById(teamId);
    
    if (!teamDetail) {
        teamDetail = document.createElement('section');
        teamDetail.id = teamId;
        teamDetail.className = 'team-detail';
        document.querySelector('.teams-content').appendChild(teamDetail);
    }
    
    // Ocultar todos los equipos
    document.querySelectorAll('.team-detail').forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Crear HTML de la imagen con fallback
    const imageHtml = `
        <div class="team-image ${teamData.image ? 'has-image' : ''}">
            ${teamData.image ? 
                `<img src="${teamData.image}" alt="${teamData.name}" class="team-photo" onerror="this.style.display='none'; this.parentElement.classList.remove('has-image');" />` : 
                ''
            }
            <div class="image-fallback">${teamData.name}</div>
        </div>
    `;
    
    // Actualizar contenido del equipo
    teamDetail.innerHTML = `
        <div class="team-header">
            ${imageHtml}
            <div class="team-info">
                <h2>${teamData.name}</h2>
                <div class="team-meta">
                    <div class="meta-item">
                        <span class="meta-label">CATEGORÍA</span>
                        <span class="meta-value">${teamData.category}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">NIVEL</span>
                        <span class="meta-value">${teamData.level}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">ENTRENADOR</span>
                        <span class="meta-value">${teamData.coach}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="players-section">
            <h3>Jugadoras</h3>
            <div class="players-grid">
                ${teamData.players.map(player => `
                    <div class="player-card">
                        <div class="player-dorsal">${player.dorsal}</div>
                        <div class="player-name">${player.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Mostrar equipo
    teamDetail.classList.add('active');
    
    // Aplicar animaciones a las nuevas tarjetas de jugadoras
    const playerCards = teamDetail.querySelectorAll('.player-card');
    playerCards.forEach(card => {
        card.style.opacity = '0';
        card.style.animation = 'fadeInUp 0.6s ease forwards';
    });
}