let gamesData = [];
async function loadGamesData() {
    try {
        const response = await fetch('/games.json');
        gamesData = await response.json();
    } catch (error) {
        console.error('Failed to load games data:', error);
        gamesData = [];
    }
}
function searchGames(query, maxResults = 10) {
    if (!query || query.length < 2) return [];

    query = query.toLowerCase();
    return gamesData.filter(game =>
        game.name.toLowerCase().includes(query) ||
        game.category.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
    ).slice(0, maxResults);
}
function displaySearchResults(results, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No games found</div>';
        container.classList.add('show');
        return;
    }

    const html = results.map(game => `
				<div class="search-result-item" onclick="navigateToGame('${game.slug}')">
					<img src="${game.image}" alt="${game.name}" class="search-result-image" 
						 onerror="this.src='/themes/snowrider3dd/rs/imgs/default-game.png'">
					<div class="search-result-info">
						<div class="search-result-title">${game.name}</div>
						<div class="search-result-category">${game.category}</div>
						<div class="search-result-description">${game.description}</div>
					</div>
				</div>
			`).join('');

    container.innerHTML = html;
    container.classList.add('show');
}
function navigateToGame(slug) {
    window.location.href = '/games/' + slug;
}
function hideSearchResults(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('show');
    }
}
function setupSearchBox(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);

    if (!input || !results) return;

    let searchTimeout;

    input.addEventListener('input', function () {
        const query = this.value.trim();

        clearTimeout(searchTimeout);

        if (query.length < 2) {
            hideSearchResults(resultsId);
            return;
        }
        results.innerHTML = '<div class="search-loading">Loading...</div>';
        results.classList.add('show');
        searchTimeout = setTimeout(() => {
            const searchResults = searchGames(query);
            displaySearchResults(searchResults, resultsId);
        }, 300);
    });
    document.addEventListener('click', function (e) {
        if (!input.contains(e.target) && !results.contains(e.target)) {
            hideSearchResults(resultsId);
        }
    });
    input.addEventListener('focus', function () {
        const query = this.value.trim();
        if (query.length >= 2) {
            const searchResults = searchGames(query);
            displaySearchResults(searchResults, resultsId);
        }
    });
    const form = input.closest('form');
    if (form) {
        form.addEventListener('submit', function (e) {
            const query = input.value.trim();
            if (query) {
                return true;
            }
            e.preventDefault();
        });
    }
}
document.addEventListener('DOMContentLoaded', async function () {
    await loadGamesData();
    setupSearchBox('txt-search1', 'search-results-desktop');
    setupSearchBox('txt-search2', 'search-results-mobile');
});