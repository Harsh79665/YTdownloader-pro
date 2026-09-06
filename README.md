# MediaSnap - Frontend YouTube Preview

MediaSnap is a static frontend for previewing public YouTube videos and Shorts. It runs without Flask, Python, yt-dlp, FFmpeg, or a server-side downloader.

---

## ✨ Features

- **🚀 Instant Link Detection**: Automatically parses standard YouTube videos and Shorts.
- **🔎 Video Preview**: Loads public video metadata directly in the browser.
- **↗️ Source Actions**: Opens the original YouTube video in a new tab.
- **🌓 Adaptive Theme**: Stylish Light and Dark mode toggle with persistent preferences.
- **📱 Ultra Responsive**: Carefully designed and styled for mobile, tablet, and desktop viewing.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Tailwind CSS |

---

## 🚀 Getting Started

### Running the Application

Open `index.html` in a browser or deploy the repository as a static Vercel site.

---

## 📖 How to Use

1. **Paste Link**: Copy a favorite YouTube video or Shorts URL.
2. **Fetch Audio Data**: Paste the link into the input field and click **"Get Audio"**.
3. **Choose Quality**: Select your preferred available audio quality and format (e.g., best quality MP3/M4A).
4. **Open source**: Use the action buttons to open the original YouTube source.

This frontend intentionally does not convert or download YouTube media. Browser-only JavaScript cannot run yt-dlp or bypass YouTube's protected media delivery without a server-side service.

---

## 📁 Project Structure

```text
YTdownloader pro/
├── index.html          # Main Frontend Interface UI
├── style.css           # Premium Custom Styles & Animations
├── script.js           # Interactive UI Logic & API hooking
└── vercel.json         # Static hosting headers
```

---

## ⚖️ License & Disclaimer

This tool is for **educational purposes and personal use only**. Please respect YouTube's Terms of Service and only download content that you have the right to access.

**Copyright © 2026 | Made by Harsh Patel**
