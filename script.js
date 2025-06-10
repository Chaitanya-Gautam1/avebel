// Game data storage
let games = [];
let filteredGames = [];

// DOM elements
const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadGames();
    setupEventListeners();
    setupNavigation();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

// Setup navigation highlighting
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

// Handle navigation clicks
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

// Scroll to games section
function scrollToGames() {
    const gamesSection = document.getElementById('games');
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = gamesSection.offsetTop - headerHeight;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Load games from the Games directory
async function loadGames() {
    try {
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to fetch the games directory structure
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

// Discover games in the Games directory
async function discoverGames() {
    const discoveredGames = [];
    
    // List of common game directory names to check
    const commonGameNames = [
        'snake', 'tetris', 'pong', 'breakout', 'pacman', 'flappy-bird',
        'space-invaders', 'asteroid', 'platformer', 'puzzle', 'racing',
        'shooter', 'adventure', 'rpg', 'strategy', 'arcade', 'action',
        'memory-game', 'tic-tac-toe', 'chess', 'checkers', 'sudoku',
        'minesweeper', 'solitaire', 'poker', 'blackjack', 'slots'
    ];
    
    // Try to discover actual games by checking for index.html files
    for (const gameName of commonGameNames) {
        try {
            const response = await fetch(`Games/${gameName}/index.html`, { method: 'HEAD' });
            if (response.ok) {
                const game = {
                    name: formatGameName(gameName),
                    path: `Games/${gameName}/`,
                    directory: gameName,
                    hasLogo: await checkForLogo(gameName)
                };
                discoveredGames.push(game);
            }
        } catch (error) {
            // Game directory doesn't exist or isn't accessible
            continue;
        }
    }
    
    // If no games found, create some example games for demonstration
    if (discoveredGames.length === 0) {
        return createExampleGames();
    }
    
    return discoveredGames;
}

// Check if a game has a logo.png file
async function checkForLogo(gameName) {
    try {
        const response = await fetch(`Games/${gameName}/logo.png`, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Format game name for display
function formatGameName(name) {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Create example games for demonstration
function createExampleGames() {
    return [
        {
            name: 'Snake Game',
            path: 'Games/snake/',
            directory: 'snake',
            hasLogo: false,
            description: 'Classic snake game where you eat food and grow longer!'
        },
        {
            name: 'Tetris',
            path: 'Games/tetris/',
            directory: 'tetris',
            hasLogo: false,
            description: 'Arrange falling blocks to create complete lines!'
        },
        {
            name: 'Space Invaders',
            path: 'Games/space-invaders/',
            directory: 'space-invaders',
            hasLogo: false,
            description: 'Defend Earth from alien invasion!'
        },
        {
            name: 'Pac-Man',
            path: 'Games/pacman/',
            directory: 'pacman',
            hasLogo: false,
            description: 'Navigate mazes and collect dots while avoiding ghosts!'
        },
        {
            name: 'Breakout',
            path: 'Games/breakout/',
            directory: 'breakout',
            hasLogo: false,
            description: 'Break all the bricks with your paddle and ball!'
        },
        {
            name: 'Memory Game',
            path: 'Games/memory-game/',
            directory: 'memory-game',
            hasLogo: false,
            description: 'Test your memory by matching pairs of cards!'
        }
    ];
}

// Display games in the grid
function displayGames(gamesToDisplay) {
    gamesGrid.innerHTML = '';
    
    gamesToDisplay.forEach(game => {
        const gameCard = createGameCard(game);
        gamesGrid.appendChild(gameCard);
    });
}

// Create a game card element
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

// Handle search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredGames = [...games];
    } else {
        filteredGames = games.filter(game => 
            game.name.toLowerCase().includes(searchTerm) ||
            (game.description && game.description.toLowerCase().includes(searchTerm))
        );
    }
    
    displayGames(filteredGames);
    
    if (filteredGames.length === 0) {
        displayNoResults(searchTerm);
    }
}

// Display no results message
function displayNoResults(searchTerm) {
    gamesGrid.innerHTML = `
        <div class="no-games">
            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; color: #4ecdc4;"></i>
            <h3>No games found for "${searchTerm}"</h3>
            <p>Try searching with different keywords or browse all games.</p>
        </div>
    `;
}

// Display no games message
function displayNoGames() {
    gamesGrid.innerHTML = `
        <div class="no-games">
            <i class="fas fa-gamepad" style="font-size: 3rem; margin-bottom: 20px; color: #4ecdc4;"></i>
            <h3>No games found</h3>
            <p>Add your games to the "Games" folder with the structure: Games/gamename/index.html</p>
            <p>Each game folder can optionally include a logo.png file for a custom thumbnail.</p>
        </div>
    `;
}

// Play a game
function playGame(game) {
    // Add click animation
    const card = event.currentTarget;
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
    
    // Check if the game exists
    checkGameExists(game).then(exists => {
        if (exists) {
            // Open game in new tab/window
            window.open(game.path, '_blank');
        } else {
            showGameNotFoundMessage(game);
        }
    });
}

// Check if game exists
async function checkGameExists(game) {
    try {
        const response = await fetch(`${game.path}index.html`, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Show game not found message
function showGameNotFoundMessage(game) {
    // Create modal overlay
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
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    // Close modal with Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    document.body.appendChild(modal);
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect to navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add scroll reveal animation
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
    
    // Observe sections for scroll animations
    document.querySelectorAll('.games-section, .about-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Add particle effects on button hover
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
        
        // Animate particle
        const animation = particle.animate([
            { 
                opacity: 1, 
                transform: 'translate(0, 0) scale(1)' 
            },
            { 
                opacity: 0, 
                transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0)` 
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => {
            particle.remove();
        };
    }
}

// Add particle effect to CTA button
document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', function() {
            addParticleEffect(this);
        });
    }
});


// Performance optimization: Lazy load images
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
