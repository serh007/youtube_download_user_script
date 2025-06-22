# start_yuotube_server.ps1

Set-Location "C:\youtube_download_user_script"  # перейти в папку зі скриптом

python -m uvicorn youtube_download_server:app --host 127.0.0.1 --port 5000
