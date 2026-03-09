# 🎵 StreamVault - Premium YouTube Audio & MP3 Converter

StreamVault is a modern, high-performance web application designed for extracting high-quality audio and MP3s directly from YouTube videos and Shorts. It features a sleek, responsive UI with dark mode support and efficient media processing using `yt-dlp` and `FFmpeg`. Download audio seamlessly to your device without taking up permanent server storage.

---

## ✨ Features

- **🚀 Instant Link Detection**: Automatically parses standard YouTube videos and Shorts.
- **💎 Pristine Audio Extraction**: Extracts the highest available bitrate format directly from the source video natively.
- **🎵 Direct MP3 Conversion**: One-click pristine MP3/M4A audio downloads delivered straight to your mobile or PC device storage.
- **🌓 Adaptive Theme**: Stylish Light and Dark mode toggle with persistent preferences.
- **📱 Ultra Responsive**: Carefully designed and styled for mobile, tablet, and desktop viewing.
- **🧹 Auto-Cleanup**: Smart server-side management strictly ensures that temporary processing files are immediately securely wiped.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python 3, Flask, Flask-CORS |
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Tailwind CSS |
| **Download Engine**| `yt-dlp` |
| **Media Processing**| FFmpeg |

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

Ensure you have **Python 3.x** and **FFmpeg** installed on your system.

- **Python**: [Download here](https://www.python.org/downloads/)
- **FFmpeg**: [Download here](https://ffmpeg.org/download.html) (Ensure it's added to your system PATH for MP3 post-processing).

### 2️⃣ Installation

Clone the repository or navigate to your project folder:

```bash
cd "c:\Users\harsh\.ssh\YTdownloader pro"
```

Install the required Python packages based on `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 3️⃣ Running the Application

Start the simple Flask backend server:

```bash
python app.py
```

Open your browser and navigate to:
**[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 📖 How to Use

1. **Paste Link**: Copy a favorite YouTube video or Shorts URL.
2. **Fetch Audio Data**: Paste the link into the input field and click **"Get Audio"**.
3. **Choose Quality**: Select your preferred available audio quality and format (e.g., best quality MP3/M4A).
4. **Download**: Click the button—StreamVault rapidly processes it and drops the file directly into your device!

---

## 📁 Project Structure

```text
YTdownloader pro/
├── app.py              # Flask Backend Logic & Download Auto-Cleanup
├── index.html          # Main Frontend Interface UI
├── style.css           # Premium Custom Styles & Animations
├── script.js           # Interactive UI Logic & API hooking
├── requirements.txt    # Python Dependency List
└── downloads/          # Temporary Buffer Processing Directory
```

---

## ⚖️ License & Disclaimer

This tool is for **educational purposes and personal use only**. Please respect YouTube's Terms of Service and only download content that you have the right to access.

**Copyright © 2026 | Made by Harsh Patel**
