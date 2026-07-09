document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 0. Prevent Scroll Restoration on Reload
    // ----------------------------------------------------
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ----------------------------------------------------
    // 1. Google Sheets Configuration (Centralized Database)
    // ----------------------------------------------------
    // To sync links for all visitors, create a Google Sheet with 4 columns:
    // Column A: Title | Column B: Subtitle | Column C: URL | Column D: Icon
    // Share the Sheet: File -> Share -> Publish to web (Choose Entire Document and CSV)
    // Paste your Google Sheet ID here (the long string between /d/ and /edit in the URL)
    const SPREADSHEET_ID = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSO4BS_4rHY2EAn69ryepTtLP4VPei-BazLiiezATCyGzs2yyEqKwhiuoiPxhJiEGZToFnL-u5SogQg/pub?output=csv';

    // ----------------------------------------------------
    // 2. Default Data Config (Local Fallback)
    // ----------------------------------------------------
    const STORAGE_KEY = 'aria_linkinbio_data';
    
    const defaultData = {
        profile: {
            name: "Heyahaana",
            handle: "@heyahaana",
            bio: "Digital Creator & Tech Evangelist.<br>Exploring the intersection of human creativity & machine learning.",
            avatar: "public/profilepic/ChatGPT Image Jul 9, 2026, 02_39_33 PM.png"
        },
        links: [
            {
                title: "Custom LoRAs & AI Models",
                subtitle: "Download my stable diffusion models & Llama weights",
                url: "https://example.com/ai-models",
                icon: "model"
            },
            {
                title: "The Synthetic Edge Newsletter",
                subtitle: "Weekly insights on generative AI, art & technology",
                url: "https://example.com/newsletter",
                icon: "newsletter"
            },
            {
                title: "ArtStation Portfolio",
                subtitle: "Browse synthetic environments & cyber-fashion renders",
                url: "https://example.com/digital-art",
                icon: "portfolio"
            },
            {
                title: "Book a Virtual Keynote",
                subtitle: "Schedule an AI synthesized speech or panel presentation",
                url: "https://example.com/keynotes",
                icon: "keynote"
            }
        ]
    };

    // Load local data from LocalStorage or seed with defaults
    let appData = localStorage.getItem(STORAGE_KEY);
    if (!appData || appData.includes('"name":"Aria Thorne"') || appData.includes('"name":"Aria Thorne V2"')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        appData = defaultData;
    } else {
        try {
            appData = JSON.parse(appData);
        } catch (e) {
            console.error("Error parsing saved bio data", e);
            appData = defaultData;
        }
    }

    // ----------------------------------------------------
    // 3. Dynamic Page Renderer & Google Sheets Fetch
    // ----------------------------------------------------
    if (SPREADSHEET_ID) {
        // Fetch published Google Sheet as CSV
        let csvUrl = SPREADSHEET_ID;
        if (!csvUrl.startsWith('http')) {
            csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/pub?output=csv`;
        }
        fetch(csvUrl)
            .then(res => {
                if (!res.ok) throw new Error("Spreadsheet response was not ok");
                return res.text();
            })
            .then(csvText => {
                const parsedRows = parseCSV(csvText);
                const googleLinks = [];

                parsedRows.forEach(row => {
                    // Expect columns: Title, Subtitle, URL, Icon
                    // Skip header row if it contains 'title' or 'url'
                    if (row[0] && row[2] && 
                        row[0].toLowerCase() !== 'title' && 
                        row[2].toLowerCase() !== 'url') {
                        googleLinks.push({
                            title: row[0].replace(/^"|"$/g, ''),
                            subtitle: (row[1] || '').replace(/^"|"$/g, ''),
                            url: row[2].replace(/^"|"$/g, ''),
                            icon: (row[3] || 'generic').toLowerCase().replace(/^"|"$/g, '').trim()
                        });
                    }
                });

                if (googleLinks.length > 0) {
                    appData.links = googleLinks;
                    // Cache the synced links in localStorage as a backup
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                }
                renderPage(appData);
            })
            .catch(err => {
                console.warn("Failed to load links from Google Sheets, falling back to local cache.", err);
                renderPage(appData);
            });
    } else {
        renderPage(appData);
    }

    function renderPage(data) {
        // Render Profile
        if (data.profile) {
            document.getElementById('profile-avatar').src = data.profile.avatar || 'assets/avatar.png';
            document.getElementById('profile-name-text').textContent = data.profile.name || '';
            document.getElementById('profile-handle').textContent = data.profile.handle || '';
            document.getElementById('profile-bio').innerHTML = data.profile.bio || '';
        }

        // Render Links List
        const linksContainer = document.getElementById('links-container');
        linksContainer.innerHTML = '';

        if (data.links && data.links.length > 0) {
            data.links.forEach(link => {
                const linkCard = document.createElement('a');
                linkCard.href = link.url;
                linkCard.target = '_blank';
                linkCard.rel = 'noopener noreferrer';
                linkCard.classList.add('link-card');

                const iconSVG = getIconSVG(link.icon);

                linkCard.innerHTML = `
                    <div class="link-icon">
                        ${iconSVG}
                    </div>
                    <div class="link-info">
                        <span class="link-title">${link.title}</span>
                        <span class="link-sub">${link.subtitle || ''}</span>
                    </div>
                    <div class="link-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                `;
                linksContainer.appendChild(linkCard);
            });
        }
    }

    // Helper: Simple CSV Parser
    function parseCSV(text) {
        const lines = text.split('\n');
        const rows = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const row = [];
            let insideQuote = false;
            let entry = '';
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    insideQuote = !insideQuote;
                } else if (char === ',' && !insideQuote) {
                    row.push(entry.trim());
                    entry = '';
                } else {
                    entry += char;
                }
            }
            row.push(entry.trim());
            rows.push(row);
        }
        return rows;
    }

    function getIconSVG(iconKey) {
        switch (iconKey) {
            case 'model':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`;
            case 'newsletter':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
            case 'portfolio':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
            case 'keynote':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            case 'generic':
            default:
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
        }
    }

    // ----------------------------------------------------
    // 4. Mouse Follower Glow (Desktop only)
    // ----------------------------------------------------
    const cursorGlow = document.getElementById('cursor-glow');
    
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            window.requestAnimationFrame(() => {
                cursorGlow.style.left = `${e.clientX}px`;
                cursorGlow.style.top = `${e.clientY}px`;
            });
        });
    }

    // ----------------------------------------------------
    // 5. Share Button & Toast Notification
    // ----------------------------------------------------
    const shareBtn = document.getElementById('share-btn');
    const toast = document.getElementById('toast');

    if (shareBtn && toast) {
        shareBtn.addEventListener('click', async () => {
            fallbackCopy();

            const shareData = {
                title: 'Heyahaana | Digital Creator',
                text: 'Explore custom AI models, tech collaborations, and digital art projects by Heyahaana.',
                url: window.location.href
            };

            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    // Fail silently
                }
            }
        });

        function fallbackCopy() {
            const url = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url)
                    .then(() => showToast())
                    .catch(() => manualCopyFallback(url));
            } else {
                manualCopyFallback(url);
            }
        }

        function manualCopyFallback(text) {
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            showToast();
        }

        function showToast() {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }
});
