/**
 * StreamVault Pro - Production Client Script
 * Features: True Liquid Hover Reactions, 0-100% Music Download Visualizer,
 * Soundwave Equalizer, Clipboard Integration, Skeleton Placeholders, and System Themes
 */

document.addEventListener('DOMContentLoaded', () => {
    // Utilities & Navigation Elements
    const loader = document.getElementById('loader');
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const mobileSunIcon = document.getElementById('mobileSunIcon');
    const mobileMoonIcon = document.getElementById('mobileMoonIcon');
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Input & Form Elements
    const fetchForm = document.getElementById('fetchForm');
    const videoUrl = document.getElementById('videoUrl');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearBtn = document.getElementById('clearBtn');
    const fetchLoader = document.getElementById('fetchLoader');
    const fetchBtnText = document.getElementById('fetchBtnText');
    const fetchArrowIcon = document.getElementById('fetchArrowIcon');
    const errorMessage = document.getElementById('errorMessage');

    // Content Display Cards
    const skeletonCard = document.getElementById('skeletonCard');
    const videoCard = document.getElementById('videoCard');
    const vidThumbnail = document.getElementById('vidThumbnail');
    const vidDuration = document.getElementById('vidDuration');
    const shortsBadge = document.getElementById('shortsBadge');
    const vidTitle = document.getElementById('vidTitle');
    const vidChannel = document.getElementById('vidChannel');
    const vidViews = document.getElementById('vidViews');
    const vidDate = document.getElementById('vidDate');
    const audioOptions = document.getElementById('audioOptions');
    const formatTabs = document.querySelectorAll('.format-tab');
    const quickMp3Btn = document.getElementById('quickMp3Btn');
    const quickMp4Btn = document.getElementById('quickMp4Btn');

    // Dedicated 0 to 100% Music Download Modal Elements
    const musicDownloadModal = document.getElementById('musicDownloadModal');
    const closeDownloadModal = document.getElementById('closeDownloadModal');
    const modalMediaTypeLabel = document.getElementById('modalMediaTypeLabel');
    const liquidWaveFluid = document.getElementById('liquidWaveFluid');
    const musicProgressPercent = document.getElementById('musicProgressPercent');
    const musicProgressStatus = document.getElementById('musicProgressStatus');
    const musicProgressFilename = document.getElementById('musicProgressFilename');
    const musicProgressBar = document.getElementById('musicProgressBar');
    const soundwaveBars = document.querySelectorAll('.soundwave-bar');

    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    const phase3 = document.getElementById('phase3');
    const phase4 = document.getElementById('phase4');

    // State Variables
    let selectedFormatType = 'all';
    let currentFormats = [];
    let currentOriginalUrl = '';
    let currentVideoTitle = '';
    let progressTimer = null;
    let activeDownloadAbort = false;

    // ==========================================
    // 1. Theme Management (System + LocalStorage)
    // ==========================================
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (sunIcon) sunIcon.classList.remove('hidden');
            if (moonIcon) moonIcon.classList.add('hidden');
            if (mobileSunIcon) mobileSunIcon.classList.remove('hidden');
            if (mobileMoonIcon) mobileMoonIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            if (sunIcon) sunIcon.classList.add('hidden');
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (mobileSunIcon) mobileSunIcon.classList.add('hidden');
            if (mobileMoonIcon) mobileMoonIcon.classList.remove('hidden');
        }
    };

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    };

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        const nextTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
    };

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
    initTheme();

    // ==========================================
    // 2. Preloader Removal
    // ==========================================
    const hideInitialLoader = () => {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 400);
        }
    };
    setTimeout(hideInitialLoader, 600);
    window.addEventListener('load', hideInitialLoader);

    // ==========================================
    // 3. Sticky Navbar Elevation on Scroll
    // ==========================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            mainNav?.classList.add('scrolled');
        } else {
            mainNav?.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 4. Mobile Navigation Drawer
    // ==========================================
    const toggleMobileMenu = (open) => {
        if (!mobileMenu) return;
        if (open) {
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(true));
    }
    if (closeMobileMenu) {
        closeMobileMenu.addEventListener('click', () => toggleMobileMenu(false));
    }
    mobileNavLinks.forEach((link) => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    // ==========================================
    // 5. Input Utilities (Clipboard Paste & Clear)
    // ==========================================
    if (pasteBtn && videoUrl) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                    videoUrl.value = text.trim();
                    videoUrl.focus();
                    clearBtn?.classList.remove('hidden');
                }
            } catch (err) {
                videoUrl.focus();
            }
        });
    }

    if (videoUrl && clearBtn) {
        videoUrl.addEventListener('input', () => {
            if (videoUrl.value.trim().length > 0) {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }
        });

        clearBtn.addEventListener('click', () => {
            videoUrl.value = '';
            clearBtn.classList.add('hidden');
            videoUrl.focus();
        });
    }

    // ==========================================
    // 6. Intersection Observer for Scroll Reveals
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });
    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 7. Interactive FAQ Accordion
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => otherItem.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ==========================================
    // 8. Segmented Format Filter Tabs
    // ==========================================
    formatTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            formatTabs.forEach((btn) => btn.classList.remove('active'));
            tab.classList.add('active');
            selectedFormatType = tab.dataset.type || 'all';
            renderFormats(currentFormats, currentOriginalUrl);
        });
    });

    // ==========================================
    // 9. Quick Actions (Best MP3 / Best MP4)
    // ==========================================
    if (quickMp3Btn) {
        quickMp3Btn.addEventListener('click', () => {
            const bestAudio = pickBestAudioFormat(currentFormats);
            if (!bestAudio || !currentOriginalUrl) {
                showUserError('No direct MP3 audio stream found for this video.');
                return;
            }
            triggerVisualDownload(currentOriginalUrl, bestAudio.format_id, 'audio', 'Studio MP3 (320kbps)');
        });
    }

    if (quickMp4Btn) {
        quickMp4Btn.addEventListener('click', () => {
            const bestVideo = pickBestVideoFormat(currentFormats);
            if (!bestVideo || !currentOriginalUrl) {
                showUserError('No video streams found for this URL.');
                return;
            }
            const quality = bestVideo.resolution || bestVideo.note || 'Best';
            triggerVisualDownload(currentOriginalUrl, bestVideo.format_id, 'video', `MP4 Video (${quality})`);
        });
    }

    // ==========================================
    // 10. Fetch Video Metadata Form Submission
    // ==========================================
    fetchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = videoUrl.value.trim();
        if (!url) return;

        hideUserError();
        if (fetchLoader) fetchLoader.classList.remove('hidden');
        if (fetchArrowIcon) fetchArrowIcon.classList.add('hidden');
        if (fetchBtnText) fetchBtnText.textContent = 'Extracting...';
        if (videoCard) videoCard.classList.add('hidden');
        if (skeletonCard) {
            skeletonCard.classList.remove('hidden');
            skeletonCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        try {
            const response = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || 'Failed to fetch video stream. Please check the link.');
            }

            // Populate Metadata
            currentVideoTitle = data.title || 'YouTube Media';
            if (vidThumbnail) vidThumbnail.src = data.thumbnail || '';
            if (vidTitle) vidTitle.textContent = currentVideoTitle;
            if (vidChannel) vidChannel.textContent = data.channel || 'Verified Channel';
            if (vidDuration) vidDuration.textContent = data.duration || '--:--';
            if (vidViews) vidViews.textContent = `${(data.views || 0).toLocaleString()} views`;
            if (vidDate) vidDate.textContent = data.upload_date ? formatUploadDate(data.upload_date) : '';

            if (shortsBadge) {
                if (data.is_shorts) {
                    shortsBadge.classList.remove('hidden');
                } else {
                    shortsBadge.classList.add('hidden');
                }
            }

            currentFormats = Array.isArray(data.formats) ? data.formats : [];
            currentOriginalUrl = data.original_url || url;

            renderFormats(currentFormats, currentOriginalUrl);

            if (skeletonCard) skeletonCard.classList.add('hidden');
            if (videoCard) {
                videoCard.classList.remove('hidden');
                videoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

        } catch (err) {
            if (skeletonCard) skeletonCard.classList.add('hidden');
            showUserError(err.message || 'Unable to retrieve video information. Please ensure the video is public.');
        } finally {
            if (fetchLoader) fetchLoader.classList.add('hidden');
            if (fetchArrowIcon) fetchArrowIcon.classList.remove('hidden');
            if (fetchBtnText) fetchBtnText.textContent = 'Extract Media';
        }
    });

    function showUserError(msg) {
        if (!errorMessage) return;
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideUserError() {
        if (!errorMessage) return;
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }

    function formatUploadDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function pickBestAudioFormat(formats) {
        const audios = formats.filter((f) => (f.type || 'audio') === 'audio');
        return audios[0] || null;
    }

    function pickBestVideoFormat(formats) {
        const videos = formats.filter((f) => f.type === 'video');
        if (!videos.length) return null;
        return videos.slice().sort((a, b) => getResolutionValue(b) - getResolutionValue(a))[0];
    }

    function getResolutionValue(item) {
        const text = String(item?.resolution || item?.note || '0p');
        const num = parseInt(text.replace('p', ''), 10);
        return Number.isFinite(num) ? num : 0;
    }

    // ==========================================
    // 11. Render Formats Grid
    // ==========================================
    function renderFormats(formats, originalUrl) {
        if (!audioOptions) return;
        audioOptions.innerHTML = '';

        const filtered = formats.filter((f) => {
            if (selectedFormatType === 'all') return true;
            return f.type === selectedFormatType;
        });

        if (filtered.length === 0) {
            audioOptions.innerHTML = `
                <div class="col-span-full py-8 text-center text-slate-400">
                    <p class="text-sm">No streams available for this category.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(f => {
            const btn = createFormatButton(f, originalUrl);
            audioOptions.appendChild(btn);
        });
    }

    function createFormatButton(format, originalUrl) {
        const div = document.createElement('div');
        div.className = 'quality-btn group';

        const isVideo = (format.type || 'audio') === 'video';
        const typeLabel = isVideo ? 'MP4 Video' : 'MP3 Audio';
        const qualityLabel = format.resolution && format.resolution !== 'Audio' ? format.resolution : (format.note || 'Standard');
        const label = `${typeLabel} - ${qualityLabel}`;
        const pillBadgeColor = isVideo 
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' 
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';

        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/50 group-hover:text-rose-600 transition-colors">
                    ${isVideo ? `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    ` : `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                        </svg>
                    `}
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">${label}</span>
                        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${pillBadgeColor}">${(format.extension || 'media').toUpperCase()}</span>
                    </div>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${format.filesize || 'Direct stream'}</span>
                </div>
            </div>
            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
            </div>
        `;

        div.onclick = () => {
            triggerVisualDownload(originalUrl, format.format_id, format.type || 'audio', label);
        };
        return div;
    }

    // ==========================================================================
    // 12. DEDICATED 0 TO 100% MUSIC DOWNLOAD VISUALIZER ENGINE
    // ==========================================================================

    const setPhaseActive = (phaseEl, isActive, isComplete) => {
        if (!phaseEl) return;
        const icon = phaseEl.querySelector('.phase-icon');
        if (isComplete) {
            phaseEl.className = 'flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold transition-all';
            if (icon) {
                icon.className = 'phase-icon w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]';
                icon.innerHTML = '✓';
            }
        } else if (isActive) {
            phaseEl.className = 'flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold transition-all animate-pulse';
            if (icon) {
                icon.className = 'phase-icon w-5 h-5 rounded-full border-2 border-rose-600 flex items-center justify-center text-[10px] text-rose-600';
            }
        } else {
            phaseEl.className = 'flex items-center gap-3 text-slate-400 dark:text-slate-600 transition-all';
            if (icon) {
                icon.className = 'phase-icon w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px]';
            }
        }
    };

    const resetPhases = () => {
        setPhaseActive(phase1, false, false);
        setPhaseActive(phase2, false, false);
        setPhaseActive(phase3, false, false);
        setPhaseActive(phase4, false, false);
    };

    if (closeDownloadModal) {
        closeDownloadModal.addEventListener('click', () => {
            activeDownloadAbort = true;
            if (progressTimer) clearInterval(progressTimer);
            musicDownloadModal?.classList.add('hidden');
        });
    }

    async function triggerVisualDownload(url, format_id, media_type, label) {
        if (!musicDownloadModal) return;

        activeDownloadAbort = false;
        if (progressTimer) clearInterval(progressTimer);

        // Show Modal
        musicDownloadModal.classList.remove('hidden');
        resetPhases();

        // Update Labels
        if (modalMediaTypeLabel) {
            modalMediaTypeLabel.textContent = media_type === 'video' ? 'High-Definition Video Stream' : 'Master Audio Stream (320kbps)';
        }
        if (musicProgressFilename) {
            musicProgressFilename.textContent = currentVideoTitle || label;
        }
        if (musicProgressStatus) {
            musicProgressStatus.textContent = 'Connecting to high-speed stream...';
        }

        // Initialize 0%
        let currentPercent = 0;
        updateProgressVisuals(0);
        setPhaseActive(phase1, true, false);

        // Simulate continuous realistic progress until 92%
        progressTimer = setInterval(() => {
            if (activeDownloadAbort) return;

            let step = 1;
            if (currentPercent < 25) {
                step = Math.floor(Math.random() * 3) + 2; // 2-4%
            } else if (currentPercent < 60) {
                step = Math.floor(Math.random() * 2) + 1; // 1-2%
            } else if (currentPercent < 88) {
                step = 1;
            } else {
                step = currentPercent < 94 ? 1 : 0;
            }

            currentPercent = Math.min(currentPercent + step, 94);
            updateProgressVisuals(currentPercent);

            // Phase milestones
            if (currentPercent >= 25 && currentPercent < 55) {
                setPhaseActive(phase1, false, true);
                setPhaseActive(phase2, true, false);
                if (musicProgressStatus) musicProgressStatus.textContent = 'Buffering raw stream tracks...';
            } else if (currentPercent >= 55 && currentPercent < 85) {
                setPhaseActive(phase2, false, true);
                setPhaseActive(phase3, true, false);
                if (musicProgressStatus) musicProgressStatus.textContent = 'Transcoding to 320kbps master quality...';
            } else if (currentPercent >= 85) {
                setPhaseActive(phase3, false, true);
                setPhaseActive(phase4, true, false);
                if (musicProgressStatus) musicProgressStatus.textContent = 'Finalizing packaging & ID3 metadata...';
            }
        }, 220);

        // Concurrently execute actual backend download via streaming endpoint
        try {
            const streamUrl = `/api/stream-download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(format_id)}&media_type=${encodeURIComponent(media_type)}`;
            const response = await fetch(streamUrl);
            if (activeDownloadAbort) return;

            if (!response.ok) {
                let errorMsg = 'Download failed.';
                try {
                    const errData = await response.json();
                    errorMsg = errData.error || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            if (activeDownloadAbort) return;

            // Extract filename from Content-Disposition header if available
            let filename = currentVideoTitle 
                ? `${currentVideoTitle.replace(/[\\/:*?"<>|]/g, '_')}.${media_type === 'audio' ? 'mp3' : 'mp4'}`
                : `media_download.${media_type === 'audio' ? 'mp3' : 'mp4'}`;
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '').trim();
                }
            }

            // Rapidly finish from currentPercent to 100%
            if (progressTimer) clearInterval(progressTimer);

            let finishStep = currentPercent;
            const finishInterval = setInterval(() => {
                finishStep += 4;
                if (finishStep >= 100) {
                    finishStep = 100;
                    clearInterval(finishInterval);
                    updateProgressVisuals(100);

                    // Mark all phases complete
                    setPhaseActive(phase1, false, true);
                    setPhaseActive(phase2, false, true);
                    setPhaseActive(phase3, false, true);
                    setPhaseActive(phase4, false, true);

                    if (musicProgressStatus) musicProgressStatus.textContent = 'Download Ready! Transferring file...';

                    // Trigger browser file download via Blob URL
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);

                    // Auto-hide modal after celebration
                    setTimeout(() => {
                        if (!activeDownloadAbort) {
                            musicDownloadModal.classList.add('hidden');
                        }
                    }, 2800);
                } else {
                    updateProgressVisuals(finishStep);
                }
            }, 25);

        } catch (err) {
            if (progressTimer) clearInterval(progressTimer);
            if (musicProgressStatus) musicProgressStatus.textContent = 'Download Failed';
            if (musicProgressPercent) musicProgressPercent.textContent = 'Error';
            if (liquidWaveFluid) liquidWaveFluid.style.background = '#ef4444';
            showUserError('Download error: ' + err.message);

            setTimeout(() => {
                musicDownloadModal.classList.add('hidden');
            }, 3000);
        }
    }

    function updateProgressVisuals(percent) {
        if (musicProgressPercent) {
            musicProgressPercent.textContent = `${percent}%`;
        }
        if (musicProgressBar) {
            musicProgressBar.style.width = `${percent}%`;
        }
        if (liquidWaveFluid) {
            // As percent goes from 0 to 100, bottom goes from -150% to -20%
            const bottomVal = -150 + (percent * 1.3);
            liquidWaveFluid.style.bottom = `${bottomVal}%`;
        }
    }
});
