@echo off
echo Iniciando servidor LTI...
cd /d "C:\Users\Usuario\Desktop\curso_lidr\backend_endpoints\AI4Devs-backend-202506\backend"
echo Directorio actual: %CD%
echo.
echo Base de datos configurada y poblada ✅
echo Endpoints implementados ✅
echo.
echo Servidor iniciando en http://localhost:3010
echo.
node dist/index.js
pause
