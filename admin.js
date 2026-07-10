document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Passcode Authentication Simulation
    // ----------------------------------------------------
    const lockScreen = document.getElementById('lock-screen');
    const passcodeField = document.getElementById('passcode-field');
    const passcodeSubmit = document.getElementById('passcode-submit-btn');
    const lockErrorMsg = document.getElementById('lock-error-msg');
    const adminDashboard = document.getElementById('admin-dashboard');

    const DEFAULT_PASSCODE = 'admin123';
    
    // Check if already authenticated during this browser session
    if (sessionStorage.getItem('aria_admin_authenticated') === 'true') {
        unlockDashboard();
    }

    if (passcodeSubmit && passcodeField) {
        passcodeSubmit.addEventListener('click', attemptUnlock);
        passcodeField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptUnlock();
            }
        });
    }

    function attemptUnlock() {
        const passwordInput = passcodeField.value;
        if (passwordInput === DEFAULT_PASSCODE) {
            sessionStorage.setItem('aria_admin_authenticated', 'true');
            unlockDashboard();
        } else {
            lockErrorMsg.textContent = 'Invalid authorization passcode. Access denied.';
            passcodeField.value = '';
            passcodeField.focus();
        }
    }

    function unlockDashboard() {
        lockScreen.style.opacity = '0';
        setTimeout(() => {
            lockScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            initializeDashboardData();
        }, 300);
    }

    // ----------------------------------------------------
    // 2. Data persistence controller
    // ----------------------------------------------------
    const STORAGE_KEY = 'aria_linkinbio_data';
    let appData = {};

    // Inputs selectors
    const profileNameInput = document.getElementById('admin-profile-name');
    const profileHandleInput = document.getElementById('admin-profile-handle');
    const profileAvatarInput = document.getElementById('admin-profile-avatar');
    const profileBioInput = document.getElementById('admin-profile-bio');



    const linkTitleInput = document.getElementById('admin-link-title');
    const linkSubInput = document.getElementById('admin-link-subtitle');
    const linkUrlInput = document.getElementById('admin-link-url');
    const linkIconSelect = document.getElementById('admin-link-icon');
    const editLinkIndexInput = document.getElementById('edit-link-index');

    const btnSaveLink = document.getElementById('btn-save-link');
    const btnCancelLink = document.getElementById('btn-cancel-link');
    const btnSaveDashboard = document.getElementById('btn-save-dashboard');
    const adminLinksList = document.getElementById('admin-links-list');
    const toast = document.getElementById('toast');

    // Default configuration to pull if localStorage is wiped
    const defaultData = {
        profile: {
            name: "Heyahaana",
            handle: "@heyahaana",
            bio: "Digital Creator & Tech Evangelist.<br>Exploring the intersection of human creativity & machine learning.",
            avatar: "public/profilepic/ChatGPT Image Jul 9, 2026, 02_39_33 PM.png"
        },
        links: [] // Deleted all default link presets
    };

    function initializeDashboardData() {
        let stored = localStorage.getItem(STORAGE_KEY);
        if (stored && !stored.includes('"name":"Aria Thorne"') && !stored.includes('"name":"Aria Thorne V2"') && !stored.includes('Custom LoRAs & AI Models')) {
            try {
                appData = JSON.parse(stored);
                // Clean old presets if they are still inside appData links array
                if (appData.links && appData.links.some(l => l.title === 'Custom LoRAs & AI Models')) {
                    appData.links = [];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                }
            } catch (e) {
                appData = defaultData;
            }
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
            appData = defaultData;
        }

        // 1. Populate Profile details
        if (appData.profile) {
            profileNameInput.value = appData.profile.name || '';
            profileHandleInput.value = appData.profile.handle || '';
            profileAvatarInput.value = appData.profile.avatar || '';
            profileBioInput.value = appData.profile.bio.replace(/<br\s*\/?>/gi, '\n') || '';
        }

        renderLinksList();
        renderVisitorLog();
    }    // ----------------------------------------------------
    // 3. Links CRUD Manager
    // ----------------------------------------------------
    function renderLinksList() {
        adminLinksList.innerHTML = '';

        if (!appData.links || appData.links.length === 0) {
            adminLinksList.innerHTML = '<div class="no-links-msg">No active links on show. Create one below.</div>';
            return;
        }

        appData.links.forEach((link, index) => {
            const linkRow = document.createElement('div');
            linkRow.classList.add('admin-link-row');
            
            // Get text label for icons
            const iconLabel = getIconLabel(link.icon);

            linkRow.innerHTML = `
                <div class="row-info">
                    <span class="row-title">${link.title}</span>
                    <span class="row-sub">[${iconLabel}] &bull; ${link.url}</span>
                </div>
                <div class="row-actions">
                    <button type="button" class="btn-edit-row" data-index="${index}" title="Edit Link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button type="button" class="btn-delete-row" data-index="${index}" title="Delete Link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
            adminLinksList.appendChild(linkRow);
        });

        // Add Event Listeners for buttons
        document.querySelectorAll('.btn-edit-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                loadLinkForEditing(index);
            });
        });

        document.querySelectorAll('.btn-delete-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                deleteLinkRow(index);
            });
        });
    }

    function getIconLabel(key) {
        const labels = {
            'model': 'Neural / Database',
            'newsletter': 'Envelope / Mail',
            'portfolio': 'Globe / Planet',
            'keynote': 'Play Arrow',
            'generic': 'External Chain'
        };
        return labels[key] || 'Generic Link';
    }

    // Save or Add link card
    if (btnSaveLink) {
        btnSaveLink.addEventListener('click', () => {
            const title = linkTitleInput.value.trim();
            const subtitle = linkSubInput.value.trim();
            const url = linkUrlInput.value.trim();
            const icon = linkIconSelect.value;
            const editIndex = parseInt(editLinkIndexInput.value);

            if (!title || !url) {
                alert('Please provide at least a Link Title and target URL.');
                return;
            }

            const linkObject = { title, subtitle, url, icon };

            if (!appData.links) appData.links = [];

            if (editIndex >= 0) {
                // Update
                appData.links[editIndex] = linkObject;
            } else {
                // Insert
                appData.links.push(linkObject);
            }

            renderLinksList();
            resetLinkForm();
        });
    }

    // Load details into edit form
    function loadLinkForEditing(index) {
        const link = appData.links[index];
        if (!link) return;

        linkTitleInput.value = link.title || '';
        linkSubInput.value = link.subtitle || '';
        linkUrlInput.value = link.url || '';
        linkIconSelect.value = link.icon || 'generic';
        editLinkIndexInput.value = index;

        document.getElementById('link-form-title').textContent = `Editing Link: ${link.title}`;
        btnCancelLink.classList.remove('hidden');
        linkTitleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function deleteLinkRow(index) {
        if (confirm(`Remove link "${appData.links[index].title}"?`)) {
            appData.links.splice(index, 1);
            renderLinksList();
            // If deleting the active edit row, reset form
            const editIndex = parseInt(editLinkIndexInput.value);
            if (editIndex === index) {
                resetLinkForm();
            }
        }
    }

    // Reset Link form details
    if (btnCancelLink) {
        btnCancelLink.addEventListener('click', resetLinkForm);
    }

    function resetLinkForm() {
        linkTitleInput.value = '';
        linkSubInput.value = '';
        linkUrlInput.value = '';
        linkIconSelect.value = 'generic';
        editLinkIndexInput.value = '-1';
        
        document.getElementById('link-form-title').textContent = 'Add New Link Card';
        btnCancelLink.classList.add('hidden');
    }

    // ----------------------------------------------------
    // 4. Global Settings Save Action
    // ----------------------------------------------------
    if (btnSaveDashboard) {
        btnSaveDashboard.addEventListener('click', () => {
            // Read profile values
            appData.profile = {
                name: profileNameInput.value.trim(),
                handle: profileHandleInput.value.trim(),
                avatar: profileAvatarInput.value.trim(),
                bio: profileBioInput.value.trim().replace(/\n/g, '<br>')
            };



            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));

            // Display success feedback
            showToast();

            // Redirect back to landing page after small delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }

    function showToast() {
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // ----------------------------------------------------
    // 5. Visitor Log Controller & Analytics
    // ----------------------------------------------------
    const VISIT_STORAGE_KEY = 'aria_visitors_log';

    function getVisits() {
        let stored = localStorage.getItem(VISIT_STORAGE_KEY);
        let visits = [];
        try {
            visits = stored ? JSON.parse(stored) : [];
        } catch (e) {
            visits = [];
        }

        // Seed with high quality mock data if not already done
        if (localStorage.getItem('aria_visitors_seeded') !== 'true') {
            const now = new Date();
            const mockVisits = [
                {
                    timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
                    instagramId: '@alex_creative'
                },
                {
                    timestamp: new Date(now.getTime() - 52 * 60 * 1000).toISOString(),
                    instagramId: '@sophie_dev'
                },
                {
                    timestamp: new Date(now.getTime() - 150 * 60 * 1000).toISOString(),
                    instagramId: '@cyber_designer'
                },
                {
                    timestamp: new Date(now.getTime() - 360 * 60 * 1000).toISOString(),
                    instagramId: '@neon_pulse'
                },
                {
                    timestamp: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
                    instagramId: '@digital_nomad'
                }
            ];

            // Append mock visits to existing tracked visits
            visits = visits.concat(mockVisits);
            localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visits));
            localStorage.setItem('aria_visitors_seeded', 'true');
        }

        return visits;
    }

    function renderVisitorLog() {
        const visits = getVisits();
        const visitorListEl = document.getElementById('admin-visitor-list');
        const totalVisitsEl = document.getElementById('total-bio-visits');

        if (!visitorListEl) return;

        // Render stats
        if (totalVisitsEl) {
            totalVisitsEl.textContent = visits.length;
        }

        // Render list
        visitorListEl.innerHTML = '';

        if (visits.length === 0) {
            visitorListEl.innerHTML = '<div class="no-links-msg">No visitor logs recorded.</div>';
            return;
        }

        visits.forEach(visit => {
            const row = document.createElement('div');
            row.classList.add('admin-visitor-row');

            // Format relative/short time
            const timeStr = formatRelativeTime(new Date(visit.timestamp));

            row.innerHTML = `
                <div class="visitor-info">
                    <span class="visitor-source" style="font-family: var(--font-heading); color: var(--color-accent-blue); font-weight: 600;">
                        ${visit.instagramId || '@guest'}
                    </span>
                </div>
                <div class="visitor-time">
                    ${timeStr}
                </div>
            `;
            visitorListEl.appendChild(row);
        });
    }

    function formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // Set up clear log event listener
    const btnClearVisits = document.getElementById('btn-clear-visits');
    if (btnClearVisits) {
        btnClearVisits.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the entire visitor log?')) {
                localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify([]));
                renderVisitorLog();
            }
        });
    }
});
