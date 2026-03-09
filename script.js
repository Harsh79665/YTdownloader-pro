document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loader = document.getElementById('loader');
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const fetchForm = document.getElementById('fetchForm');
    const videoUrl = document.getElementById('videoUrl');
    const fetchLoader = document.getElementById('fetchLoader');
    const errorMessage = document.getElementById('errorMessage');
    const videoCard = document.getElementById('videoCard');

    // Video Card Elements
    const vidThumbnail = document.getElementById('vidThumbnail');
    const vidDuration = document.getElementById('vidDuration');
    const shortsBadge = document.getElementById('shortsBadge');
    const vidTitle = document.getElementById('vidTitle');
    const vidChannel = document.getElementById('vidChannel').querySelector('span');
    const vidViews = document.getElementById('vidViews').querySelector('span');
    const vidDate = document.getElementById('vidDate');
    const audioOptions = document.getElementById('audioOptions');

    // Theme Logic
    const initTheme = () => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    };

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.theme = isDark ? 'dark' : 'light';
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    });

    initTheme();

    // Initial Loader Removal
    const removeLoader = () => {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    };

    // Remove loader after a short delay to ensure initial styles are applied
    setTimeout(removeLoader, 1000);

    // Fail-safe: ensure loader is removed when everything is loaded
    window.addEventListener('load', removeLoader);

    // Tab Switching removed

    // FAQ Toggle
    // FAQ Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all items
            faqItems.forEach(otherItem => otherItem.classList.remove('active'));
            // If it wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Fetch Video Info
    fetchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = videoUrl.value.trim();
        if (!url) return;

        // Reset UI
        errorMessage.classList.add('hidden');
        fetchLoader.classList.remove('hidden');
        videoCard.classList.add('hidden');

        try {
            const response = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Populate Video Card
            vidThumbnail.src = data.thumbnail;
            vidTitle.textContent = data.title;
            vidChannel.textContent = data.channel;
            vidDuration.textContent = data.duration;
            vidViews.textContent = `${data.views?.toLocaleString() || '0'} views`;
            vidDate.textContent = data.upload_date ? formatDate(data.upload_date) : '';

            if (data.is_shorts) {
                shortsBadge.classList.remove('hidden');
            } else {
                shortsBadge.classList.add('hidden');
            }

            // Populate Formats
            renderFormats(data.formats, data.original_url);

            // Show Card
            videoCard.classList.remove('hidden');
            videoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (err) {
            errorMessage.textContent = err.message || 'Something went wrong. Please try again.';
            errorMessage.classList.remove('hidden');
        } finally {
            fetchLoader.classList.add('hidden');
        }
    });

    function formatDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function renderFormats(formats, originalUrl) {
        audioOptions.innerHTML = '';

        formats.forEach(f => {
            const btn = createFormatButton(f, originalUrl);
            audioOptions.appendChild(btn);
        });

        if (audioOptions.innerHTML === '') {
            audioOptions.innerHTML = '<p class="col-span-2 text-center text-slate-500 py-4">No formats found.</p>';
        }
    }

    function createFormatButton(format, originalUrl) {
        const div = document.createElement('div');
        div.className = 'quality-btn group cursor-pointer relative';

        const label = `${format.note || 'Audio Quality'} (${format.extension})`;

        div.innerHTML = `
            <div class="flex flex-col text-left">
                <span class="font-bold group-hover:text-primary-600 transition-colors">${label}</span>
                <span class="text-xs text-slate-400">${format.filesize} • ${format.extension.toUpperCase()}</span>
            </div>
            <svg class="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
        `;

        div.onclick = () => {
            handleDownload(originalUrl, format.format_id, label);
        };
        return div;
    }

    async function handleDownload(url, format_id, label) {
        try {
            // Show alert or progress
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-fade-in-up';
            toast.innerHTML = `
                <svg class="animate-spin h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Processing <b>${label}</b>... Please wait.</span>
            `;
            document.body.appendChild(toast);

            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, format_id })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            toast.innerHTML = `
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>Success! <b>${label}</b> is ready. Downloading to your device...</span>
            `;

            // Trigger actual browser download
            const downloadUrl = `/api/download-file/${encodeURIComponent(data.filename)}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                toast.classList.add('opacity-0');
                setTimeout(() => toast.remove(), 500);
            }, 5000);

        } catch (err) {
            alert('Download failed: ' + err.message);
        }
    }
});
