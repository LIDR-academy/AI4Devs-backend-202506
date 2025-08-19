@echo off
echo.
echo ===========================================
echo 🧪 PROBANDO ENDPOINTS KANBAN DE CANDIDATOS
echo ===========================================
echo.

echo 1. Verificando servidor...
curl -X GET "http://localhost:3010/"
echo.
echo.

echo 2. Obteniendo candidatos de la posición 1...
curl -X GET "http://localhost:3010/positions/1/candidates"
echo.
echo.

echo 3. Obteniendo candidatos de la posición 2...
curl -X GET "http://localhost:3010/positions/2/candidates"
echo.
echo.

echo 4. Moviendo candidato 1 a etapa 3 (Manager Interview)...
curl -X PUT "http://localhost:3010/candidates/1/stage" -H "Content-Type: application/json" -d "{\"currentInterviewStep\": 3}"
echo.
echo.

echo 5. Verificando cambio - candidatos de posición 1...
curl -X GET "http://localhost:3010/positions/1/candidates"
echo.
echo.

echo ✅ Pruebas completadas!
echo.
pause
