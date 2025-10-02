// ========== State Management ==========
const state = {
    currentSeries: null,
    currentArc: null,
    currentChapter: null,
    currentType: null, // 'manga' or 'novel'
    allChapters: [],
    isDarkMode: false
};

// ========== Theme Toggle ==========
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('dark-theme', state.isDarkMode);
    localStorage.setItem('darkMode', state.isDarkMode);
});

// Load saved theme
if (localStorage.getItem('darkMode') === 'true') {
    state.isDarkMode = true;
    document.body.classList.add('dark-theme');
}

// ========== Screen Management ==========
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0, 0);
}

// ========== Breadcrumb ==========
function updateBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    
    items.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-small';
        btn.textContent = item.text;
        btn.onclick = item.action;
        breadcrumb.appendChild(btn);
    });
}

// ========== Main Screen ==========
async function loadMainScreen() {
    showScreen('mainScreen');
    updateBreadcrumb([]);
    
    const grid = document.getElementById('seriesGrid');
    grid.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const response = await fetch('/api/series');
        const series = await response.json();
        
        if (series.length === 0) {
            grid.innerHTML = '<div class="loading">Chưa có truyện nào</div>';
            return;
        }
        
        grid.innerHTML = '';
        series.forEach(s => {
            const card = createSeriesCard(s);
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = '<div class="loading">Lỗi khi tải dữ liệu</div>';
        console.error(error);
    }
}

function createSeriesCard(series) {
    const card = document.createElement('div');
    card.className = 'series-card';
    
    const imageDiv = document.createElement('div');
    imageDiv.className = 'series-image';
    
    if (series.key_visual) {
        const img = document.createElement('img');
        img.src = series.key_visual;
        img.alt = series.name;
        imageDiv.appendChild(img);
    } else {
        imageDiv.textContent = '📖';
    }
    
    const name = document.createElement('div');
    name.className = 'series-name';
    name.textContent = series.name;
    
    const buttons = document.createElement('div');
    buttons.className = 'series-buttons';
    
    if (series.has_manga) {
        const mangaBtn = document.createElement('button');
        mangaBtn.className = 'btn';
        mangaBtn.textContent = '📚 Manga';
        mangaBtn.onclick = () => loadMangaScreen(series.name);
        buttons.appendChild(mangaBtn);
    }
    
    if (series.has_novel) {
        const novelBtn = document.createElement('button');
        novelBtn.className = 'btn btn-info';
        novelBtn.textContent = '📝 Novel';
        novelBtn.onclick = () => loadNovelScreen(series.name);
        buttons.appendChild(novelBtn);
    }
    
    card.appendChild(imageDiv);
    card.appendChild(name);
    card.appendChild(buttons);
    
    return card;
}

// ========== Manga Screen ==========
async function loadMangaScreen(seriesName) {
    state.currentSeries = seriesName;
    state.currentType = 'manga';
    
    showScreen('mangaScreen');
    updateBreadcrumb([
        { text: '← Quay lại', action: loadMainScreen }
    ]);
    
    const list = document.getElementById('chapterList');
    list.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const response = await fetch(`/api/manga/${encodeURIComponent(seriesName)}`);
        const chapters = await response.json();
        state.allChapters = chapters;
        
        if (chapters.length === 0) {
            list.innerHTML = '<div class="loading">Chưa có chapter nào</div>';
            return;
        }
        
        list.innerHTML = '';
        chapters.forEach(chapter => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary chapter-btn';
            btn.textContent = `📖 ${chapter}`;
            btn.onclick = () => loadMangaChapter(chapter);
            list.appendChild(btn);
        });
    } catch (error) {
        list.innerHTML = '<div class="loading">Lỗi khi tải dữ liệu</div>';
        console.error(error);
    }
}

async function loadMangaChapter(chapterName) {
    state.currentChapter = chapterName;
    
    showScreen('mangaChapterScreen');
    updateBreadcrumb([
        { text: '← Quay lại', action: () => loadMangaScreen(state.currentSeries) }
    ]);
    
    const content = document.getElementById('mangaContent');
    content.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const response = await fetch(`/api/manga/${encodeURIComponent(state.currentSeries)}/${encodeURIComponent(chapterName)}`);
        const data = await response.json();
        
        if (data.images.length === 0) {
            content.innerHTML = '<div class="loading">Không tìm thấy ảnh</div>';
            return;
        }
        
        content.innerHTML = '';
        data.images.forEach(imgBase64 => {
            const img = document.createElement('img');
            img.src = imgBase64;
            img.alt = 'Manga page';
            content.appendChild(img);
        });
        
        // Navigation
        updateMangaNavigation(chapterName);
    } catch (error) {
        content.innerHTML = '<div class="loading">Lỗi khi tải dữ liệu</div>';
        console.error(error);
    }
}

function updateMangaNavigation(currentChapter) {
    const nav = document.getElementById('mangaNav');
    nav.innerHTML = '';
    
    const currentIdx = state.allChapters.indexOf(currentChapter);
    
    if (currentIdx > 0) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn';
        prevBtn.textContent = '← Chapter trước';
        prevBtn.onclick = () => loadMangaChapter(state.allChapters[currentIdx - 1]);
        nav.appendChild(prevBtn);
    } else {
        nav.appendChild(document.createElement('div'));
    }
    
    if (currentIdx < state.allChapters.length - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn';
        nextBtn.textContent = 'Chapter tiếp →';
        nextBtn.onclick = () => loadMangaChapter(state.allChapters[currentIdx + 1]);
        nav.appendChild(nextBtn);
    } else {
        nav.appendChild(document.createElement('div'));
    }
}

// ========== Novel Screen ==========
async function loadNovelScreen(seriesName) {
    state.currentSeries = seriesName;
    state.currentType = 'novel';
    
    showScreen('novelScreen');
    updateBreadcrumb([
        { text: '← Quay lại', action: loadMainScreen }
    ]);
    
    const list = document.getElementById('arcList');
    list.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const response = await fetch(`/api/novel/${encodeURIComponent(seriesName)}`);
        const arcs = await response.json();
        
        if (arcs.length === 0) {
            list.innerHTML = '<div class="loading">Chưa có arc nào</div>';
            return;
        }
        
        list.innerHTML = '';
        arcs.forEach(arc => {
            const arcItem = createArcItem(arc);
            list.appendChild(arcItem);
        });
    } catch (error) {
        list.innerHTML = '<div class="loading">Lỗi khi tải dữ liệu</div>';
        console.error(error);
    }
}

function createArcItem(arc) {
    const item = document.createElement('div');
    item.className = 'arc-item';
    
    const header = document.createElement('button');
    header.className = 'arc-header';
    header.textContent = `▶ ${arc.name}`;
    
    const chaptersDiv = document.createElement('div');
    chaptersDiv.className = 'arc-chapters';
    
    arc.chapters.forEach(chapter => {
        const btn = document.createElement('button');
        btn.className = 'btn chapter-btn';
        btn.textContent = `📄 ${chapter}`;
        btn.onclick = () => loadNovelChapter(arc.name, chapter, arc.chapters);
        chaptersDiv.appendChild(btn);
    });
    
    header.onclick = () => {
        const isActive = chaptersDiv.classList.toggle('active');
        header.textContent = isActive ? `▼ ${arc.name}` : `▶ ${arc.name}`;
    };
    
    item.appendChild(header);
    item.appendChild(chaptersDiv);
    
    return item;
}

async function loadNovelChapter(arcName, chapterName, allChapters) {
    state.currentArc = arcName;
    state.currentChapter = chapterName;
    state.allChapters = allChapters;
    
    showScreen('novelChapterScreen');
    updateBreadcrumb([
        { text: '← Quay lại', action: () => loadNovelScreen(state.currentSeries) }
    ]);
    
    const content = document.getElementById('novelContent');
    content.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const response = await fetch(`/api/novel/${encodeURIComponent(state.currentSeries)}/${encodeURIComponent(arcName)}/${encodeURIComponent(chapterName)}`);
        const data = await response.json();
        
        content.innerHTML = '';
        
        // Header
        const header = document.createElement('div');
        header.className = 'novel-header';
        header.innerHTML = `
            <h2>📚 ${data.series}</h2>
            <h3>📖 ${data.arc} - ${data.chapter}</h3>
        `;
        content.appendChild(header);
        
        // Text content
        if (data.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'novel-text';
            textDiv.textContent = data.text;
            content.appendChild(textDiv);
        }
        
        // Images
        if (data.images.length > 0) {
            const imagesDiv = document.createElement('div');
            imagesDiv.className = 'novel-images';
            
            data.images.forEach(imgBase64 => {
                const img = document.createElement('img');
                img.src = imgBase64;
                img.alt = 'Illustration';
                imagesDiv.appendChild(img);
            });
            
            content.appendChild(imagesDiv);
        }
        
        // Navigation
        updateNovelNavigation(chapterName);
    } catch (error) {
        content.innerHTML = '<div class="loading">Lỗi khi tải dữ liệu</div>';
        console.error(error);
    }
}

function updateNovelNavigation(currentChapter) {
    const nav = document.getElementById('novelNav');
    nav.innerHTML = '';
    
    const currentIdx = state.allChapters.indexOf(currentChapter);
    
    if (currentIdx > 0) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn';
        prevBtn.textContent = '← Chapter trước';
        prevBtn.onclick = () => loadNovelChapter(state.currentArc, state.allChapters[currentIdx - 1], state.allChapters);
        nav.appendChild(prevBtn);
    } else {
        nav.appendChild(document.createElement('div'));
    }
    
    if (currentIdx < state.allChapters.length - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn';
        nextBtn.textContent = 'Chapter tiếp →';
        nextBtn.onclick = () => loadNovelChapter(state.currentArc, state.allChapters[currentIdx + 1], state.allChapters);
        nav.appendChild(nextBtn);
    } else {
        nav.appendChild(document.createElement('div'));
    }
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
    loadMainScreen();
});
