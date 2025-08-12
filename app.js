// Typing animation
const typingText = document.getElementById('typingText');
const texts = [
  "Private search that doesn't track you",
  "Get results without being followed",
  "Search anonymously"
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isEnd = false;

function type() {
  const currentText = texts[textIndex];
  
  if (isDeleting) {
    typingText.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingText.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
  }

  if (!isDeleting && charIndex === currentText.length) {
    isEnd = true;
    isDeleting = true;
    setTimeout(type, 1500);
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % texts.length;
    setTimeout(type, 500);
  } else {
    const speed = isDeleting ? 50 : 100;
    setTimeout(type, speed);
  }
}

// Start typing animation
setTimeout(type, 1000);

// Search functionality
const form = document.getElementById('searchForm');
const qInput = document.getElementById('q');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const statusDiv = document.getElementById('status');

function setStatus(txt, isLoading = false) {
  statusDiv.innerHTML = isLoading 
    ? `<span class="loading"></span>${txt}`
    : txt || '';
}

function clearResults() {
  resultsList.innerHTML = '';
}

function renderResult(r) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'result-card';
  a.href = r.link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  const title = document.createElement('div');
  title.className = 'result-title';
  title.textContent = r.title;

  const snippet = document.createElement('p');
  snippet.className = 'result-snippet';
  snippet.textContent = r.snippet;

  a.appendChild(title);
  a.appendChild(snippet);
  li.appendChild(a);
  resultsList.appendChild(li);
}

async function doSearch(q) {
  clearResults();
  resultsSection.classList.remove('hidden');
  setStatus('Searching...', true);
  
  try {
    // Direct DuckDuckGo API call
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch results');
    }
    
    const data = await response.json();
    const results = [];

    // 1. Add instant answer if available
    if (data.AbstractText) {
      results.push({
        title: data.Heading || 'Instant Answer',
        link: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        snippet: data.AbstractText
      });
    }

    // 2. Add related topics
    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.forEach(item => {
        if (item.Topics) {
          item.Topics.forEach(topic => {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: topic.Text,
                link: topic.FirstURL,
                snippet: topic.Text
              });
            }
          });
        } else if (item.Text && item.FirstURL) {
          results.push({
            title: item.Text,
            link: item.FirstURL,
            snippet: item.Text
          });
        }
      });
    }

    // 3. Always include a direct search link
    results.push({
      title: `View all results for "${q}"`,
      link: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      snippet: 'Click to see complete search results'
    });

    // Display results
    if (results.length > 0) {
      setStatus(`Found ${results.length} results`);
      results.forEach(renderResult);
      
      // Add animation to results
      const cards = document.querySelectorAll('.result-card');
      cards.forEach((card, index) => {
        card.style.animation = `fadeIn 0.3s ease ${index * 0.1}s forwards`;
        card.style.opacity = 0;
      });
    } else {
      setStatus('No results found');
      renderResult({
        title: 'No results found',
        link: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        snippet: 'Try searching directly on DuckDuckGo'
      });
    }
    
  } catch (err) {
    console.error('Search error:', err);
    setStatus('Error loading results');
    renderResult({
      title: 'Search Error',
      link: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      snippet: 'Click to search directly on DuckDuckGo'
    });
  }
}

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const q = qInput.value.trim();
  if (q) {
    doSearch(q);
  }
});

// Focus animation
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    qInput.focus();
    qInput.style.transform = 'translateZ(10px)';
    qInput.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2), 0 0 0 2px var(--accent)';
    
    setTimeout(() => {
      qInput.style.transform = 'translateZ(0)';
      qInput.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    }, 1000);
  }, 1500);
});
