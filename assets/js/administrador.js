document.addEventListener('DOMContentLoaded', () => {
    // Claves de almacenamiento
    const MATCHES_STORAGE_KEY = 'clubMatches';
    const NEWS_STORAGE_KEY = 'clubNews';

    // Referencias DOM para tabs
    const adminTabs = document.querySelectorAll('.admin-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Inicializar pestañas
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Actualizar tabs activos
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Mostrar panel correspondiente
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `tab-${targetTab}`) {
                    panel.classList.add('active');
                }
            });

            // Cargar datos si es necesario
            if (targetTab === 'noticias') {
                initNewsSection();
            }
        });
    });

    /* ===================== SECCIÓN PARTIDOS ===================== */
    
    // Referencias DOM
    const teamSelect = document.getElementById('team-select');
    const statusFilterSelect = document.getElementById('status-filter');

    const formCard = document.getElementById('match-form-card');
    const form = document.getElementById('match-form');
    const matchIdField = document.getElementById('match-id');
    const matchDateField = document.getElementById('match-date');
    const matchTimeField = document.getElementById('match-time');
    const matchOpponentField = document.getElementById('match-opponent');
    const matchAddressField = document.getElementById('match-address');
    const matchStatusField = document.getElementById('match-status');

    const formModeLabel = document.getElementById('form-mode-label');
    const formTeamLabel = document.getElementById('form-team-label');
    const btnSave = document.getElementById('btn-save');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    const matchesList = document.getElementById('matches-list');
    const matchesSubtitle = document.getElementById('matches-subtitle');

    const statTotal = document.getElementById('stat-total');
    const statPublished = document.getElementById('stat-published');
    const statDraft = document.getElementById('stat-draft');

    const TEAMS = {
        benjaminMX: { id: 'benjaminMX', name: 'Benjamín Mixto' },
        benjaminF: { id: 'benjaminF', name: 'Benjamín Femenino' },
        alevin:   { id: 'alevin',   name: 'Alevín Femenino 1' },
        alevin2:   { id: 'alevin2',   name: 'Alevín Femenino 2' },
        infantil: { id: 'infantil', name: 'PreInfantil Femenino' },
        preinfantil: { id: 'preinfantil', name: 'Infantil Femenino' }, 
        cadete:   { id: 'cadete',   name: 'Cadete Femenino 1' },
        cadete2:   { id: 'cadete2',   name: 'Cadete Femenino 2' },
        junior:   { id: 'junior',   name: 'Junior Femenino 1' },
        junior2:   { id: 'junior2',   name: 'Junior Femenino 2' },
        senior:   { id: 'senior',   name: 'Senior Femenino' }
    };

    // Estado en memoria
    let data = {
        teams: TEAMS,
        matches: [] // { id, teamId, date, time, opponent, address, status, createdAt, updatedAt }
    };

    let currentTeamId = '';
    let currentStatusFilter = 'all';
    let isEditMode = false;

    /* ===================== INIT PARTIDOS ===================== */

    init();

    function init() {
        loadFromStorage();
        initTeamSelect();
        initFilters();
        initForm();
        renderStats();
    }

    /* ===================== STORAGE PARTIDOS ===================== */

    function loadFromStorage() {
        const stored = localStorage.getItem(MATCHES_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Asegurar que siempre tengamos los equipos actualizados
                data.teams = { ...TEAMS, ...(parsed.teams || {}) };
                data.matches = Array.isArray(parsed.matches) ? parsed.matches : [];
            } catch (e) {
                console.warn('Error parseando localStorage, se reinicia estructura.', e);
                data = { teams: TEAMS, matches: [] };
                saveToStorage();
            }
        } else {
            // Primera vez - guardar con los equipos definidos
            data = { teams: TEAMS, matches: [] };
            saveToStorage();
        }
    }

    function saveToStorage() {
        localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(data));
    }

    /* ===================== EQUIPOS ===================== */

    function initTeamSelect() {
        // Rellenar select con equipos
        Object.values(TEAMS).forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });

        teamSelect.addEventListener('change', () => {
            currentTeamId = teamSelect.value;
            handleTeamChange();
        });
    }

    function handleTeamChange() {
        if (!currentTeamId) {
            formCard.classList.add('hidden');
            matchesList.innerHTML = '';
            matchesSubtitle.textContent = 'Selecciona un equipo para ver sus partidos.';
            resetStats();
            return;
        }

        const teamName = TEAMS[currentTeamId]?.name || 'Equipo';
        formCard.classList.remove('hidden');
        formTeamLabel.textContent = `(${teamName})`;

        exitEditMode();
        renderMatches();
    }

    /* ===================== FILTROS ===================== */

    function initFilters() {
        statusFilterSelect.addEventListener('change', () => {
            currentStatusFilter = statusFilterSelect.value;
            renderMatches();
        });
    }

    /* ===================== FORMULARIO ===================== */

    function initForm() {
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!currentTeamId) return;

            if (isEditMode) {
                updateMatch();
            } else {
                createMatch();
            }
        });

        btnCancelEdit.addEventListener('click', () => {
            exitEditMode();
        });
    }

    function createMatch() {
        const newMatch = {
            id: generateId(),
            teamId: currentTeamId,
            date: matchDateField.value,
            time: matchTimeField.value,
            opponent: matchOpponentField.value.trim(),
            address: matchAddressField.value.trim(),
            status: matchStatusField.value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data.matches.push(newMatch);
        saveToStorage();
        form.reset();
        renderMatches();
    }

    function updateMatch() {
        const id = matchIdField.value;
        const match = data.matches.find(m => m.id === id);
        if (!match) {
            exitEditMode();
            return;
        }

        match.date = matchDateField.value;
        match.time = matchTimeField.value;
        match.opponent = matchOpponentField.value.trim();
        match.address = matchAddressField.value.trim();
        match.status = matchStatusField.value;
        match.updatedAt = new Date().toISOString();

        saveToStorage();
        exitEditMode();
        renderMatches();
    }

    function enterEditMode(match) {
        isEditMode = true;
        matchIdField.value = match.id;
        matchDateField.value = match.date;
        matchTimeField.value = match.time;
        matchOpponentField.value = match.opponent;
        matchAddressField.value = match.address;
        matchStatusField.value = match.status;

        formModeLabel.textContent = 'Editar partido';
        btnSave.textContent = 'Actualizar partido';
        btnCancelEdit.classList.remove('hidden');
    }

    function exitEditMode() {
        isEditMode = false;
        matchIdField.value = '';
        form.reset();
        formModeLabel.textContent = 'Nuevo partido';
        btnSave.textContent = 'Guardar partido';
        btnCancelEdit.classList.add('hidden');
    }

    /* ===================== RENDER PARTIDOS ===================== */

    function renderMatches() {
        matchesList.innerHTML = '';

        if (!currentTeamId) {
            matchesSubtitle.textContent = 'Selecciona un equipo para ver sus partidos.';
            return;
        }

        const teamName = TEAMS[currentTeamId]?.name || 'Equipo';
        matchesSubtitle.textContent = `Gestionando partidos de: ${teamName}`;

        let teamMatches = data.matches.filter(m => m.teamId === currentTeamId);

        // Filtro estado
        if (currentStatusFilter === 'published') {
            teamMatches = teamMatches.filter(m => m.status === 'published');
        } else if (currentStatusFilter === 'draft') {
            teamMatches = teamMatches.filter(m => m.status === 'draft');
        }

        // Orden por fecha + hora
        teamMatches.sort((a, b) => {
            const aKey = `${a.date} ${a.time}`;
            const bKey = `${b.date} ${b.time}`;
            return aKey.localeCompare(bKey);
        });

        if (teamMatches.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'No hay partidos para este equipo con el filtro actual.';
            matchesList.appendChild(empty);
        } else {
            teamMatches.forEach(match => {
                const card = createMatchCard(match);
                matchesList.appendChild(card);
            });
        }

        // Actualizar estadísticas para el equipo (sin filtrar)
        updateStatsForTeam(currentTeamId);
    }

    function createMatchCard(match) {
        const card = document.createElement('article');
        card.className = 'match-card';
        if (match.status === 'draft') {
            card.classList.add('draft');
        }

        const dateObj = match.date ? new Date(match.date) : null;
        const day = dateObj ? dateObj.getDate() : '--';
        const month = dateObj ? getMonthShortName(dateObj.getMonth()) : '';

        card.innerHTML = `
            <div class="match-status-pill ${match.status === 'published' ? 'status-published' : 'status-draft'}">
                ${match.status === 'published' ? 'Publicado' : 'No publicado'}
            </div>

            <div class="match-header">
                <div class="match-date">
                    <span class="match-day">${pad(day)}</span>
                    <span class="match-month">${month}</span>
                </div>
                <div class="match-opponent">
                    ${escapeHtml(match.opponent)}
                </div>
                <div class="match-meta">
                    <div>${escapeHtml(match.time || '')}</div>
                    <div class="match-meta-team">
                        ${escapeHtml(TEAMS[match.teamId]?.name || '')}
                    </div>
                </div>
            </div>

            <div class="match-info">
                <div class="match-info-row">
                    <span class="icon">📍</span>
                    <span title="${escapeHtml(match.address)}">${truncateText(match.address, 40)}</span>
                </div>
                <div class="match-info-row">
                    <span class="icon">📅</span>
                    <span>${formatDateLong(match.date)}</span>
                </div>
            </div>

            <div class="match-actions">
                <button class="btn btn-secondary btn-sm btn-toggle-status" data-id="${match.id}">
                    ${match.status === 'published' ? 'Pasar a no publicado' : 'Publicar'}
                </button>
                <button class="btn btn-secondary btn-sm btn-edit" data-id="${match.id}">
                    ✏️ Editar
                </button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${match.id}">
                    🗑️ Eliminar
                </button>
            </div>
        `;

        // Eventos
        card.querySelector('.btn-edit').addEventListener('click', () => {
            enterEditMode(match);
        });

        card.querySelector('.btn-delete').addEventListener('click', () => {
            handleDeleteMatch(match.id);
        });

        card.querySelector('.btn-toggle-status').addEventListener('click', () => {
            toggleMatchStatus(match.id);
        });

        return card;
    }

    /* ===================== ACCIONES PARTIDO ===================== */

    function handleDeleteMatch(id) {
        const confirmed = window.confirm('¿Seguro que quieres eliminar este partido?');
        if (!confirmed) return;

        data.matches = data.matches.filter(m => m.id !== id);
        saveToStorage();

        if (isEditMode && matchIdField.value === id) {
            exitEditMode();
        }

        renderMatches();
    }

    function toggleMatchStatus(id) {
        const match = data.matches.find(m => m.id === id);
        if (!match) return;

        match.status = match.status === 'published' ? 'draft' : 'published';
        match.updatedAt = new Date().toISOString();
        saveToStorage();
        renderMatches();
    }

    /* ===================== STATS PARTIDOS ===================== */

    function resetStats() {
        statTotal.textContent = '0';
        statPublished.textContent = '0';
        statDraft.textContent = '0';
    }

    function updateStatsForTeam(teamId) {
        const teamMatches = data.matches.filter(m => m.teamId === teamId);
        const total = teamMatches.length;
        const published = teamMatches.filter(m => m.status === 'published').length;
        const draft = total - published;

        statTotal.textContent = total.toString();
        statPublished.textContent = published.toString();
        statDraft.textContent = draft.toString();
    }

    function renderStats() {
        if (currentTeamId) {
            updateStatsForTeam(currentTeamId);
        } else {
            resetStats();
        }
    }

    /* ===================== SECCIÓN NOTICIAS ===================== */

    let newsData = {
        news: [] // { id, title, content, date, image, status, createdAt, updatedAt }
    };

    let currentNewsFilter = 'all';
    let isNewsEditMode = false;

    function initNewsSection() {
        loadNewsFromStorage();
        initNewsFilters();
        initNewsForm();
        renderNewsStats();
        renderNews();
    }

    function loadNewsFromStorage() {
        const stored = localStorage.getItem(NEWS_STORAGE_KEY);
        if (stored) {
            try {
                newsData = JSON.parse(stored);
                if (!Array.isArray(newsData.news)) {
                    newsData.news = [];
                }
            } catch (e) {
                console.warn('Error parseando noticias, se reinicia estructura.', e);
                newsData = { news: [] };
                saveNewsToStorage();
            }
        } else {
            newsData = { news: [] };
            saveNewsToStorage();
        }
    }

    function saveNewsToStorage() {
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(newsData));
    }

    function initNewsFilters() {
        const statusFilter = document.getElementById('status-filter-news');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                currentNewsFilter = statusFilter.value;
                renderNews();
            });
        }
    }

    function initNewsForm() {
        const form = document.getElementById('news-form');
        if (form) {
            form.addEventListener('submit', e => {
                e.preventDefault();
                if (isNewsEditMode) {
                    updateNews();
                } else {
                    createNews();
                }
            });

            const btnCancel = document.getElementById('btn-cancel-edit-news');
            if (btnCancel) {
                btnCancel.addEventListener('click', exitNewsEditMode);
            }

            // Establecer fecha por defecto a hoy
            const dateField = document.getElementById('news-date');
            if (dateField) {
                const today = new Date().toISOString().split('T')[0];
                dateField.value = today;
            }
        }
    }

    function createNews() {
        const title = document.getElementById('news-title').value.trim();
        const content = document.getElementById('news-content').value.trim();
        const date = document.getElementById('news-date').value;
        const image = document.getElementById('news-image').value.trim();
        const status = document.getElementById('news-status').value;

        // Validar límite de noticias publicadas
        if (status === 'published') {
            const publishedCount = newsData.news.filter(n => n.status === 'published').length;
            if (publishedCount >= 5) {
                alert('Ya hay 5 noticias publicadas. Cambia el estado a "No publicada" o despublica alguna noticia existente.');
                return;
            }
        }

        const newNews = {
            id: generateId(),
            title,
            content,
            date,
            image: image || null,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        newsData.news.push(newNews);
        saveNewsToStorage();
        document.getElementById('news-form').reset();
        
        // Restablecer fecha a hoy
        document.getElementById('news-date').value = new Date().toISOString().split('T')[0];
        
        renderNews();
    }

    function updateNews() {
        const id = document.getElementById('news-id').value;
        const news = newsData.news.find(n => n.id === id);
        if (!news) {
            exitNewsEditMode();
            return;
        }

        const newStatus = document.getElementById('news-status').value;
        
        // Validar límite al cambiar estado a publicado
        if (newStatus === 'published' && news.status !== 'published') {
            const publishedCount = newsData.news.filter(n => n.status === 'published' && n.id !== id).length;
            if (publishedCount >= 5) {
                alert('Ya hay 5 noticias publicadas. No puedes publicar esta noticia sin despublicar otra primero.');
                return;
            }
        }

        news.title = document.getElementById('news-title').value.trim();
        news.content = document.getElementById('news-content').value.trim();
        news.date = document.getElementById('news-date').value;
        news.image = document.getElementById('news-image').value.trim() || null;
        news.status = newStatus;
        news.updatedAt = new Date().toISOString();

        saveNewsToStorage();
        exitNewsEditMode();
        renderNews();
    }

    function enterNewsEditMode(newsItem) {
        isNewsEditMode = true;
        document.getElementById('news-id').value = newsItem.id;
        document.getElementById('news-title').value = newsItem.title;
        document.getElementById('news-content').value = newsItem.content;
        document.getElementById('news-date').value = newsItem.date;
        document.getElementById('news-image').value = newsItem.image || '';
        document.getElementById('news-status').value = newsItem.status;

        document.getElementById('form-mode-label-news').textContent = 'Editar noticia';
        document.getElementById('btn-save-news').textContent = 'Actualizar noticia';
        document.getElementById('btn-cancel-edit-news').classList.remove('hidden');
    }

    function exitNewsEditMode() {
        isNewsEditMode = false;
        document.getElementById('news-id').value = '';
        document.getElementById('news-form').reset();
        
        // Restablecer fecha a hoy
        document.getElementById('news-date').value = new Date().toISOString().split('T')[0];
        
        document.getElementById('form-mode-label-news').textContent = 'Nueva noticia';
        document.getElementById('btn-save-news').textContent = 'Guardar noticia';
        document.getElementById('btn-cancel-edit-news').classList.add('hidden');
    }

    function renderNews() {
        const newsList = document.getElementById('news-list');
        if (!newsList) return;

        newsList.innerHTML = '';

        let filteredNews = [...newsData.news];

        // Filtro estado
        if (currentNewsFilter === 'published') {
            filteredNews = filteredNews.filter(n => n.status === 'published');
        } else if (currentNewsFilter === 'draft') {
            filteredNews = filteredNews.filter(n => n.status === 'draft');
        }

        // Orden por fecha (más reciente primero)
        filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredNews.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'No hay noticias con el filtro actual.';
            newsList.appendChild(empty);
        } else {
            filteredNews.forEach(news => {
                const card = createNewsCard(news);
                newsList.appendChild(card);
            });
        }

        renderNewsStats();
    }

    function createNewsCard(news) {
        const card = document.createElement('article');
        card.className = 'news-card';
        if (news.status === 'draft') {
            card.classList.add('draft');
        }

        const dateObj = news.date ? new Date(news.date) : null;
        const day = dateObj ? dateObj.getDate() : '--';
        const month = dateObj ? getMonthShortName(dateObj.getMonth()) : '';

        // Limitar contenido a 150 caracteres
        const shortContent = news.content.length > 150 
            ? news.content.substring(0, 150) + '...' 
            : news.content;

        card.innerHTML = `
            <div class="news-status-pill ${news.status === 'published' ? 'status-published' : 'status-draft'}">
                ${news.status === 'published' ? 'Publicada' : 'No publicada'}
            </div>

            <div class="news-header">
                <div class="news-date">
                    <span class="news-day">${pad(day)}</span>
                    <span class="news-month">${month}</span>
                </div>
                <div class="news-title" title="${escapeHtml(news.title)}">
                    ${escapeHtml(news.title)}
                </div>
            </div>

            <div class="news-content">
                <p>${escapeHtml(shortContent)}</p>
            </div>

            <div class="news-image-preview">
                ${news.image ? `<img src="${escapeHtml(news.image)}" alt="Imagen de noticia" onerror="this.style.display='none'">` : ''}
            </div>

            <div class="news-meta">
                <span class="news-full-date">${formatDateLong(news.date)}</span>
            </div>

            <div class="news-actions">
                <button class="btn btn-secondary btn-sm btn-toggle-status-news" data-id="${news.id}">
                    ${news.status === 'published' ? 'Despublicar' : 'Publicar'}
                </button>
                <button class="btn btn-secondary btn-sm btn-edit-news" data-id="${news.id}">
                    ✏️ Editar
                </button>
                <button class="btn btn-danger btn-sm btn-delete-news" data-id="${news.id}">
                    🗑️ Eliminar
                </button>
            </div>
        `;

        // Eventos
        card.querySelector('.btn-edit-news').addEventListener('click', () => {
            enterNewsEditMode(news);
        });

        card.querySelector('.btn-delete-news').addEventListener('click', () => {
            handleDeleteNews(news.id);
        });

        card.querySelector('.btn-toggle-status-news').addEventListener('click', () => {
            toggleNewsStatus(news.id);
        });

        return card;
    }

    function handleDeleteNews(id) {
        const confirmed = window.confirm('¿Seguro que quieres eliminar esta noticia?');
        if (!confirmed) return;

        newsData.news = newsData.news.filter(n => n.id !== id);
        saveNewsToStorage();

        if (isNewsEditMode && document.getElementById('news-id').value === id) {
            exitNewsEditMode();
        }

        renderNews();
    }

    function toggleNewsStatus(id) {
        const news = newsData.news.find(n => n.id === id);
        if (!news) return;

        const newStatus = news.status === 'published' ? 'draft' : 'published';
        
        // Validar límite al publicar
        if (newStatus === 'published') {
            const publishedCount = newsData.news.filter(n => n.status === 'published' && n.id !== id).length;
            if (publishedCount >= 5) {
                alert('Ya hay 5 noticias publicadas. No puedes publicar esta noticia sin despublicar otra primero.');
                return;
            }
        }

        news.status = newStatus;
        news.updatedAt = new Date().toISOString();
        saveNewsToStorage();
        renderNews();
    }

    function renderNewsStats() {
        const total = newsData.news.length;
        const published = newsData.news.filter(n => n.status === 'published').length;
        const draft = total - published;

        document.getElementById('stat-total-news').textContent = total.toString();
        document.getElementById('stat-published-news').textContent = published.toString();
        document.getElementById('stat-draft-news').textContent = draft.toString();

        // Actualizar badge de límite
        const limitBadge = document.querySelector('.stat-blue .stat-value');
        if (limitBadge) {
            limitBadge.textContent = `${published}/5`;
        }
    }

    /* ===================== FUNCIONES AUXILIARES ===================== */

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    }

    function getMonthShortName(index) {
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
                        'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        return months[index] || '';
    }

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

    function truncateText(text, max) {
        if (!text) return '';
        if (text.length <= max) return text;
        return text.substring(0, max - 3) + '...';
    }

    function pad(num) {
        if (typeof num !== 'number') return '–';
        return num < 10 ? `0${num}` : `${num}`;
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
});

/* ===================== FUNCIONES GLOBALES PARA EL SITIO WEB ===================== */

// Función global para cargar noticias en la página principal
function loadNewsForHomepage() {
    const newsGrid = document.getElementById('dynamic-news-grid');
    if (!newsGrid) return;

    try {
        const storedNews = localStorage.getItem('clubNews');
        
        if (!storedNews) {
            showNoNewsMessage(newsGrid);
            return;
        }

        const newsData = JSON.parse(storedNews);
        const publishedNews = newsData.news
            .filter(news => news.status === 'published')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3); // Mostrar solo las 3 más recientes

        if (publishedNews.length === 0) {
            showNoNewsMessage(newsGrid);
        } else {
            renderNewsInHomepage(publishedNews, newsGrid);
        }

    } catch (e) {
        console.error('Error cargando noticias:', e);
        showNoNewsMessage(newsGrid);
    }
}

function renderNewsInHomepage(news, newsGrid) {
    newsGrid.innerHTML = '';

    news.forEach(newsItem => {
        const newsCard = createNewsCardForHomepage(newsItem);
        newsGrid.appendChild(newsCard);
    });
}

function createNewsCardForHomepage(news) {
    const article = document.createElement('article');
    article.className = 'news-card';
    
    // Limitar contenido a 120 caracteres
    const shortContent = news.content.length > 120 
        ? news.content.substring(0, 120) + '...' 
        : news.content;

    article.innerHTML = `
        <div class="news-image">
            ${news.image ? 
                `<img src="${escapeHtml(news.image)}" alt="${escapeHtml(news.title)}" 
                      onerror="this.parentElement.innerHTML='<div class=\"image-placeholder\"></div>'">` : 
                '<div class="image-placeholder"></div>'
            }
        </div>
        <div class="news-content">
            <span class="news-date">${formatNewsDate(news.date)}</span>
            <h3>${escapeHtml(news.title)}</h3>
            <p>${escapeHtml(shortContent)}</p>
            <a href="detalle.html?id=${news.id}" class="news-link">Leer más</a>
        </div>
    `;

    return article;
}

function showNoNewsMessage(newsGrid) {
    // Mostrar mensaje cuando no hay noticias
    newsGrid.innerHTML = `
        <div class="no-news-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📰</div>
            <h3 style="color: #666; margin-bottom: 1rem;">No hay noticias publicadas</h3>
            <p style="color: #888; margin-bottom: 2rem;">Las noticias aparecerán aquí cuando sean publicadas por el administrador.</p>
            <a href="noticias.html" class="btn btn-primary">Ver Todas las Noticias</a>
        </div>
    `;
}

function formatNewsDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
    }
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Función global para escapar HTML
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Cargar noticias automáticamente cuando esté disponible el elemento
if (document.getElementById('dynamic-news-grid')) {
    document.addEventListener('DOMContentLoaded', loadNewsForHomepage);
}