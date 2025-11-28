document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'clubMatches';

    const teamFilterButtons = document.querySelector('.team-filter-buttons');
    const calendarMatches = document.getElementById('calendar-matches');

    // Definir los equipos aquí para asegurar que siempre estén disponibles
    const TEAMS = {
        benjaminMX: { id: 'benjaminMX', name: 'Benjamín Mixto' },
        benjaminF: { id: 'benjaminF', name: 'Benjamín Femenino' },
        alevin: { id: 'alevin', name: 'Alevín Femenino 1' },
        alevin2: { id: 'alevin2', name: 'Alevín Femenino 2' },
        infantil: { id: 'infantil', name: 'PreInfantil Femenino' },
        preinfantil: { id: 'preinfantil', name: 'Infantil Femenino' },
        cadete: { id: 'cadete', name: 'Cadete Femenino 1' },
        cadete2: { id: 'cadete2', name: 'Cadete Femenino 2' },
        junior: { id: 'junior', name: 'Junior Femenino 1' },
        junior2: { id: 'junior2', name: 'Junior Femenino 2' },
        senior: { id: 'senior', name: 'Senior Femenino' }
    };

    let data = {
        teams: TEAMS, // Inicializar con los equipos por defecto
        matches: []
    };

    let currentTeamFilter = 'all';

    init();

    function init() {
        loadFromStorage();
        initTeamButtons();
        renderMatches();
    }

    function loadFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        
        if (!stored) {
            console.log('No hay datos en localStorage, usando equipos por defecto');
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            
            // Combinar equipos: priorizar los guardados, pero mantener nuestros por defecto
            data.teams = { ...TEAMS, ...(parsed.teams || {}) };
            data.matches = Array.isArray(parsed.matches) ? parsed.matches : [];
            
            console.log('Equipos cargados:', Object.keys(data.teams).length);
            console.log('Partidos cargados:', data.matches.length);
            
        } catch (e) {
            console.warn('Error cargando datos de calendario, usando datos por defecto', e);
            data.teams = TEAMS;
            data.matches = [];
        }
    }

    function initTeamButtons() {
        // Orden específico de los equipos
        const equipoOrden = [
            'benjaminMX', 'benjaminF', 'alevin', 'alevin2', 
            'infantil', 'preinfantil', 'cadete', 'cadete2', 
            'junior', 'junior2', 'senior'
        ];

        // Limpiar botones existentes
        teamFilterButtons.innerHTML = '';
        
        // Crear botón "Todos"
        const allButton = document.createElement('button');
        allButton.className = 'team-filter-btn active';
        allButton.textContent = 'Todos los equipos';
        allButton.setAttribute('data-team', 'all');
        allButton.addEventListener('click', handleTeamFilter);
        teamFilterButtons.appendChild(allButton);

        console.log('Inicializando botones con equipos:', data.teams);

        // Crear botones en el orden específico
        equipoOrden.forEach(teamId => {
            const team = data.teams[teamId];
            if (team) {
                const button = document.createElement('button');
                button.className = 'team-filter-btn';
                button.textContent = team.name;
                button.setAttribute('data-team', team.id);
                
                button.addEventListener('click', handleTeamFilter);
                teamFilterButtons.appendChild(button);
                console.log('✅ Botón creado para:', team.name);
            } else {
                console.warn('❌ Equipo no encontrado:', teamId);
                // Crear botón de respaldo para equipos faltantes
                const fallbackButton = document.createElement('button');
                fallbackButton.className = 'team-filter-btn';
                fallbackButton.textContent = `Equipo ${teamId}`;
                fallbackButton.setAttribute('data-team', teamId);
                fallbackButton.addEventListener('click', handleTeamFilter);
                teamFilterButtons.appendChild(fallbackButton);
                console.log('🔄 Botón de respaldo creado para:', teamId);
            }
        });

        console.log('Total de botones creados:', teamFilterButtons.children.length);
    }

    function handleTeamFilter(event) {
        const teamId = event.currentTarget.getAttribute('data-team');
        
        // Remover clase active de todos los botones
        document.querySelectorAll('.team-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Agregar clase active al botón clickeado
        event.currentTarget.classList.add('active');
        
        // Actualizar filtro y renderizar
        currentTeamFilter = teamId;
        console.log('Filtrando por equipo:', teamId);
        renderMatches();
    }

    function renderMatches() {
        calendarMatches.innerHTML = '';

        let matches = data.matches.filter(m => m.status === 'published');
        console.log('Partidos publicados encontrados:', matches.length);

        if (currentTeamFilter !== 'all') {
            matches = matches.filter(m => m.teamId === currentTeamFilter);
            console.log(`Partidos para equipo ${currentTeamFilter}:`, matches.length);
        }

        // Orden por fecha+hora
        matches.sort((a, b) => {
            const aKey = `${a.date} ${a.time}`;
            const bKey = `${b.date} ${b.time}`;
            return aKey.localeCompare(bKey);
        });

        if (matches.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'calendar-empty';
            
            if (currentTeamFilter === 'all') {
                empty.textContent = 'No hay partidos publicados.';
            } else {
                const teamName = data.teams[currentTeamFilter]?.name || 'este equipo';
                empty.innerHTML = `
                    No hay partidos publicados para ${escapeHtml(teamName)}.
                    <br><button class="reset-filter-btn">Ver todos los equipos</button>
                `;
                
                const resetBtn = empty.querySelector('.reset-filter-btn');
                resetBtn.addEventListener('click', resetToAllTeams);
            }
            
            calendarMatches.appendChild(empty);
            return;
        }

        // Agrupamos por fecha
        const groups = groupByDate(matches);
        console.log('Grupos de partidos por fecha:', Object.keys(groups).length);

        Object.keys(groups).forEach(dateStr => {
            const group = document.createElement('article');
            group.className = 'calendar-day-group';

            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = formatDateLong(dateStr);

            const body = document.createElement('div');
            body.className = 'calendar-day-body';

            groups[dateStr].forEach(match => {
                const card = createMatchCard(match);
                body.appendChild(card);
            });

            group.appendChild(header);
            group.appendChild(body);
            calendarMatches.appendChild(group);
        });
    }

    function groupByDate(matches) {
        const map = {};
        matches.forEach(m => {
            if (!map[m.date]) map[m.date] = [];
            map[m.date].push(m);
        });
        return map;
    }

    function createMatchCard(match) {
        const card = document.createElement('div');
        card.className = 'calendar-match-card';

        const teamName = data.teams[match.teamId]?.name || 'Equipo';
        const time = match.time || '';

        card.innerHTML = `
            <div class="calendar-match-time">${escapeHtml(time)}</div>
            <div class="calendar-match-main">
                <div class="calendar-match-teams">
                    ${escapeHtml(teamName)} vs ${escapeHtml(match.opponent)}
                </div>
                <div class="calendar-match-address">
                    📍 ${escapeHtml(match.address)}
                </div>
            </div>
            <div class="calendar-match-meta">
                <!-- Espacio para info extra futura -->
            </div>
        `;

        return card;
    }

    function resetToAllTeams() {
        currentTeamFilter = 'all';
        
        document.querySelectorAll('.team-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const allBtn = teamFilterButtons.querySelector('[data-team="all"]');
        if (allBtn) {
            allBtn.classList.add('active');
        }
        
        renderMatches();
    }

    /* ============ HELPERS ============ */

    function formatDateLong(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        if (Number.isNaN(d.getTime())) return dateStr;

        const dia = d.getDate();
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                       'agosto','septiembre','octubre','noviembre','diciembre'];
        const mes = meses[d.getMonth()];
        const año = d.getFullYear();
        return `${dia} de ${mes} de ${año}`;
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.resetToAllTeams = resetToAllTeams;
});