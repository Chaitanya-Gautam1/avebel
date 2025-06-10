let games = [];
let filteredGames = [];

const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');

document.addEventListener('DOMContentLoaded', function() {
    loadGames();
    setupEventListeners();
    setupNavigation();
});

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

function setupNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function scrollToGames() {
    const gamesSection = document.getElementById('games');
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = gamesSection.offsetTop - headerHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

async function loadGames() {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        games = await discoverGames();
        filteredGames = [...games];

        if (games.length === 0) {
            displayNoGames();
        } else {
            displayGames(filteredGames);
        }
    } catch (error) {
        console.error('Error loading games:', error);
        displayNoGames();
    }
}

async function discoverGames() {
    const gameDirectories = [
        'Money Tycoon'
    ];

    const discoveredGames = [];

    for (const gameName of gameDirectories) {
        try {
            const response = await fetch(`Games/${encodeURIComponent(gameName)}/index.html`, { method: 'HEAD' });
            if (response.ok) {
                const game = {
                    name: gameName,
                    path: `Games/${encodeURIComponent(gameName)}/`,
                    directory: gameName,
                    hasLogo: await checkForLogo(gameName)
                };
                discoveredGames.push(game);
            }
        } catch (error) {
            console.log(`Game "${gameName}" not found or not accessible`);
        }
    }

    return discoveredGames;
}

async function checkForLogo(gameName) {
    try {
        const response = await fetch(`Games/${encodeURIComponent(gameName)}/logo.png`, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

function formatGameName(name) {
    return name;
}

function displayGames(gamesToDisplay) {
    gamesGrid.innerHTML = '';

    gamesToDisplay.forEach(game => {
        const gameCard = createGameCard(game);
        gamesGrid.appendChild(gameCard);
    });
}

function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.onclick = () => playGame(game);

    const imageSection = game.hasLogo
        ? `<img src="${game.path}logo.png" alt="${game.name}" class="game-image" onerror="this.parentElement.innerHTML='<div class=\\"game-title-card\\">${game.name}</div>'">`
        : `<div class="game-title-card">${game.name}</div>`;

    const description = game.description || `Play ${game.name} - An exciting web game!`;

    card.innerHTML = `
        ${imageSection}
        <div class="game-info">
            <h3 class="game-title">${game.name}</h3>
            <p class="game-description">${description}</p>
        </div>
        <button class="play-button">
            <i class="fas fa-play"></i>
        </button>
    `;

    return card;
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();

    filteredGames = searchTerm === ''
        ? [...games]
        : games.filter(game =>
            game.name.toLowerCase().includes(searchTerm) ||
            (game.description && game.description.toLowerCase().includes(searchTerm))
        );

    displayGames(filteredGames);

    if (filteredGames.length === 0) {
        displayNoResults(searchTerm);
    }
}

function displayNoResults(searchTerm) {
    gamesGrid.innerHTML = `
        <div class="no-games">
            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; color: #4ecdc4;"></i>
            <h3>No games found for "${searchTerm}"</h3>
            <p>Try searching with different keywords or browse all games.</p>
        </div>
    `;
}

function displayNoGames() {
    gamesGrid.innerHTML = `
        <div class="no-games">
            <i class="fas fa-gamepad" style="font-size: 3rem; margin-bottom: 20px; color: #4ecdc4;"></i>
            <h3>No games available</h3>
            <p>Check back later for new games!</p>
        </div>
    `;
}

function playGame(game) {
    const card = event.currentTarget;
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);

    checkGameExists(game).then(exists => {
        if (exists) {
            window.open(game.path, '_blank');
        } else {
            showGameNotFoundMessage(game);
        }
    });
}

async function checkGameExists(game) {
    try {
        const response = await fetch(`${game.path}index.html`, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

function showGameNotFoundMessage(game) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 20px;"></i>
            <h3 style="color: #ffffff; margin-bottom: 15px;">Game Not Found</h3>
            <p style="color: #b8b8b8; margin-bottom: 25px; line-height: 1.5;">
                The game "${game.name}" could not be found. Make sure the game files are in the correct location:
                <br><br>
                <code style="background: rgba(255, 255, 255, 0.1); padding: 5px 10px; border-radius: 5px; font-family: monospace;">
                    ${game.path}index.html
                </code>
            </p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                border: none;
                color: white;
                padding: 12px 30px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                OK
            </button>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });

    document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.games-section, .about-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

function addParticleEffect(element) {
    const particles = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #4ecdc4;
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
        `;

        const rect = element.getBoundingClientRect();
        particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        particle.style.top = (rect.top + Math.random() * rect.height) + 'px';

        document.body.appendChild(particle);
        particles.push(particle);

        const animation = particle.animate([
            { opacity: 1, transform: 'translate(0, 0) scale(1)' },
            { opacity: 0, transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0)` }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });

        animation.onfinish = () => {
            particle.remove();
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', function() {
            addParticleEffect(this);
        });
    }
});

function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}
    
