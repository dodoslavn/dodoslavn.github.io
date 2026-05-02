// Simple client-side search without external dependencies
(function() {
  let searchIndex = [];
  let searchInput = document.getElementById('search-input');
  let searchResults = document.getElementById('search-results');
  let searchOverlay = document.getElementById('search-overlay');

  // Load search index
  fetch('/index.json')
    .then(response => response.json())
    .then(data => {
      searchIndex = data;
    })
    .catch(error => console.error('Error loading search index:', error));

  // Search function
  function performSearch(query) {
    if (!query || query.length < 2) {
      hideResults();
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = searchIndex.filter(item => {
      return item.title.toLowerCase().includes(lowerQuery) ||
             (item.desc && item.desc.toLowerCase().includes(lowerQuery)) ||
             (item.content && item.content.toLowerCase().includes(lowerQuery)) ||
             (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }).slice(0, 10); // Limit to 10 results

    displayResults(results, query);
  }

  // Display search results
  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">Žiadne výsledky pre "' + escapeHtml(query) + '"</div>';
      showResults();
      return;
    }

    let html = '<div class="search-results-header">Nájdených ' + results.length + ' výsledkov:</div>';
    results.forEach(item => {
      const title = highlightText(item.title, query);
      const desc = item.desc ? highlightText(truncate(item.desc, 100), query) : '';

      html += '<div class="search-result-item">';
      html += '  <a href="' + item.permalink + '">';
      html += '    <div class="search-result-title">' + title + '</div>';
      if (desc) {
        html += '    <div class="search-result-desc">' + desc + '</div>';
      }
      if (item.tags && item.tags.length > 0) {
        html += '    <div class="search-result-tags">';
        item.tags.forEach(tag => {
          html += '<span class="search-tag">' + escapeHtml(tag) + '</span>';
        });
        html += '    </div>';
      }
      html += '  </a>';
      html += '</div>';
    });

    searchResults.innerHTML = html;
    showResults();
  }

  // Show results
  function showResults() {
    searchResults.style.display = 'block';
    searchOverlay.style.display = 'block';
  }

  // Hide results
  function hideResults() {
    searchResults.style.display = 'none';
    searchOverlay.style.display = 'none';
  }

  // Highlight matching text
  function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    const regex = new RegExp('(' + escapeRegex(query) + ')', 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  // Truncate text
  function truncate(text, length) {
    if (text.length <= length) return text;
    return text.substr(0, length) + '...';
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Escape regex special characters
  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Event listeners
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      performSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        hideResults();
      }
    });
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', function() {
      searchInput.value = '';
      hideResults();
    });
  }

  // Close search on clicking outside
  document.addEventListener('click', function(e) {
    if (searchInput && searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      hideResults();
    }
  });
})();
