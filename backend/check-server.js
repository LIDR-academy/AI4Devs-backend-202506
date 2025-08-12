// Script simple para verificar si el backend está corriendo
const fetch = require('node-fetch');

async function checkServer() {
    try {
        console.log('🔍 Verificando si el backend está corriendo en localhost:3010...');
        
        const response = await fetch('http://localhost:3010/', {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            const text = await response.text();
            console.log('✅ Backend está corriendo!');
            console.log(`📝 Respuesta: "${text}"`);
            return true;
        } else {
            console.log(`❌ Backend responde con error: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Backend no está corriendo o no es accesible');
        console.log(`📝 Error: ${error.message}`);
        return false;
    }
}

checkServer();
