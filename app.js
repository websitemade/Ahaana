document.addEventListener('DOMContentLoaded', () => {
        if ('scrollRestoration' in history) {
                    history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

                              const STORAGE_KEY = 'aria_linkinbio_data';

                              const defaultData = {
                                          profile: {
                                                          name: "Heyahaana",
                                                          handle: "@heyahaana",
                                                          bio: "Digital Creator & Tech Evangelist.<br>Exploring the intersection of human creativity & machine learning.",
                                                          avatar: "public/profilepic/ChatGPT Image Jul 9, 2026, 02_39_33 PM.png"
                                          },
                                          links: []
                              };

                              const DATA_URL = './data.json?cb=' + Date.now();

          async function loadData() {
                      let localData = null;
                      try {
                                    const stored = localStorage.getItem(STORAGE_KEY);
                                    if (stored) localData = JSON.parse(stored);
                      } catch(e) {}
                  
                      try {
                                    const response = await fetch(DATA_URL);
                                    if (response.ok) {
                                                    const serverData = await response.json();
                                                    if (serverData && serverData.links && serverData.links.length > 0) {
                                                                      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData)); } catch(e) {}
                                                                      return serverData;
                                                    }
                                    }
                      } catch (error) {
                                    console.warn('Could not load data.json', error);
                      }
                  
                      if (localData) {
                                    return localData;
                      }
                      return defaultData;
          }
        
          (async () => {
                      const data = await loadData();
                      renderPage(data);
          })();
        
        function renderPage(data) {
                    if (data.profile) {
                                    document.getElementById('profile-avatar').src = data.profile.avatar || 'assets/avatar.png';
                                    document.getElementById('profile-name-text').textContent = data.profile.name || '';
                                    document.getElementById('profile-handle').textContent = data.profile.handle || '';
                                    document.getElementById('profile-bio').innerHTML = data.profile.bio || '';
                    }

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
                                                                  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path></svg>`;
                                              case 'keynote':
                                                                  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                                              case 'generic':
                                              default:
                                                                  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
                                          }
                              }
        const cursorGlow = document.getElementById('cursor-glow');
        if (cursorGlow) {
                    document.addEventListener('mousemove', (e) => {
                                    window.requestAnimationFrame(() => {
                                                        cursorGlow.style.left = `${e.clientX}px`;
                                                        cursorGlow.style.top = `${e.clientY}px`;
                                    });
                    });
        }

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
                                                                              try { await navigator.share(shareData); } catch (err) {}
                                                          }
                                          });

            function fallbackCopy() {
                            const url = window.location.href;
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                                navigator.clipboard.writeText(url).then(() => showToast()).catch(() => manualCopyFallback(url));
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
                            setTimeout(() => { toast.classList.remove('show'); }, 3000);
            }
                              }

                              function trackVisit() {
                                          const urlParams = new URLSearchParams(window.location.search);
                                          const igParam = urlParams.get('ig') || urlParams.get('ig_id') || urlParams.get('instagram') || urlParams.get('username') || urlParams.get('user');
                                          const ref = urlParams.get('ref') || urlParams.get('utm_source') || urlParams.get('source') || urlParams.get('utm_medium');
                                          const referrer = document.referrer || '';

            let isBioVisit = false;
                                          let instagramId = '';

            if (igParam) {
                            isBioVisit = true;
                            instagramId = `@${igParam.replace(/^@/, '')}`;
            } else if (ref) {
                            const rLower = ref.toLowerCase();
                            if (rLower === 'bio' || rLower === 'profile' || /ig|instagram|tiktok|twitter|x|linkedin/i.test(rLower)) {
                                                isBioVisit = true;
                                                instagramId = '@ig_bio_guest';
                            }
            } else if (referrer) {
                            const refLower = referrer.toLowerCase();
                            if (/instagram\.com|instagram\.co/i.test(refLower)) {
                                                isBioVisit = true;
                                                instagramId = '@ig_bio_visitor';
                            } else if (/t\.co|twitter\.com|x\.com|tiktok\.com|linkedin\.com|lnkd\.in|facebook\.com/i.test(refLower)) {
                                                isBioVisit = true;
                                                instagramId = '@social_bio_visitor';
                            }
            }

            if (isBioVisit) {
                            if (!instagramId) instagramId = '@guest';
                            const visitRecord = {
                                                timestamp: new Date().toISOString(),
                                                instagramId: instagramId
                            };

                                              const VISIT_STORAGE_KEY = 'aria_visitors_log';
                            let visits = [];
                            try {
                                                visits = JSON.parse(localStorage.getItem(VISIT_STORAGE_KEY)) || [];
                            } catch(e) {
                                                visits = [];
                            }

                                              const now = Date.now();
                            const isDuplicate = visits.some(v => {
                                                const diff = now - new Date(v.timestamp).getTime();
                                                return diff < 5000 && v.instagramId === visitRecord.instagramId;
                            });

                                              if (!isDuplicate) {
                                                                  visits.unshift(visitRecord);
                                                                  if (visits.length > 100) visits.pop();
                                                                  localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visits));
                                              }
            }
                              }

                              trackVisit();
});
