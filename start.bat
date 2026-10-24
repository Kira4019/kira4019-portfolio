@echo off
setlocal
cd /d "%~dp0"
title kira4019 - localhost

where php >nul 2>nul
if %errorlevel%==0 goto :php

where python >nul 2>nul
if %errorlevel%==0 goto :python

where py >nul 2>nul
if %errorlevel%==0 goto :py

echo.
echo Python ou PHP nao encontrados.
echo Instale Python em https://python.org ou PHP 8.1+ para rodar o site.
echo.
pause
exit /b

:php
echo.
echo Iniciando com PHP em http://localhost:8000
echo Painel: http://localhost:8000/admin
echo.
start "kira4019 server (PHP)" cmd /k "php -S localhost:8000 -t ."
timeout /t 2 >nul
start "" "http://localhost:8000"
exit /b

:python
echo.
echo Iniciando com Python em http://localhost:8000
echo (Para usar o painel /admin, instale PHP 8.1+.)
echo.
start "kira4019 server (Python)" cmd /k "python -m http.server 8000"
timeout /t 2 >nul
start "" "http://localhost:8000"
exit /b

:py
echo.
echo Iniciando com Python em http://localhost:8000
echo (Para usar o painel /admin, instale PHP 8.1+.)
echo.
start "kira4019 server (Python)" cmd /k "py -m http.server 8000"
timeout /t 2 >nul
start "" "http://localhost:8000"
exit /b
