from fastapi import FastAPI, Query
import subprocess
import threading
import uvicorn
import os

app = FastAPI()

# Визначаємо шлях до папки завантажень поточного користувача
# os.path.expanduser('~') -> повертає домашню директорію користувача (наприклад, C:\Users\ВашеІм'я)
# 'Downloads' -> стандартна назва папки завантажень
# 'Youtube_downloads' -> підпапка для впорядкування ваших завантажень з YouTube
DOWNLOAD_DIR = os.path.join(os.path.expanduser('~'), 'Downloads', 'Youtube_downloads')

# Створюємо цю директорію, якщо вона ще не існує
# exist_ok=True означає, що помилка не виникне, якщо папка вже існує
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def run_download(video_id: str, quality: str):
    fmt = f"bestvideo[height<={quality}]+bestaudio/best"
    cmd = [
        "yt-dlp",
        "-f", fmt,
        "--merge-output-format", "mp4",
        "-o", os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s"),
        f"https://www.youtube.com/watch?v={video_id}" # Виправлений формат URL YouTube
    ]
    subprocess.run(cmd)

@app.get("/download")
def download(v: str = Query(...), quality: str = Query("1080")):
    thread = threading.Thread(target=run_download, args=(v, quality))
    thread.start()
    return {"status": "started", "videoId": v, "quality": quality}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)