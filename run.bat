@echo off
echo =======================================================
echo Menjalankan Live Server untuk Aplikasi Manajemen Keuangan
echo =======================================================
echo Pastikan Python sudah terinstal di komputer Anda.
echo Server akan berjalan di http://localhost:8000
echo.
echo Tekan CTRL+C untuk menghentikan server.
echo.
python -m http.server 8000
pause
