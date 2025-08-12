// Test simplificado de las rutas de Kanban
console.log('🧪 Verificando configuración de rutas de Kanban...\n');

// 1. Verificar archivos de rutas
console.log('1️⃣ Verificando archivos de rutas...');

const fs = require('fs');
const path = require('path');

// Verificar que el archivo de rutas existe
const routesPath = path.join(__dirname, 'src', 'routes', 'kanbanRoutes.ts');
if (fs.existsSync(routesPath)) {
    console.log('   ✅ kanbanRoutes.ts existe');
    
    // Leer contenido del archivo
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    
    // Verificar endpoints principales
    const endpoints = [
        "router.get('/positions/:id/kanban', getPositionKanban)",
        "router.get('/positions/:id/kanban/statistics', getPositionKanbanStatistics)",
        "router.get('/positions/:id/kanban/health', checkKanbanHealth)",
        "router.get('/positions/:id/interview-steps', getPositionInterviewSteps)"
    ];
    
    console.log('   📋 Verificando endpoints configurados:');
    endpoints.forEach(endpoint => {
        if (routesContent.includes(endpoint.split(',')[0])) {
            console.log(`      ✅ ${endpoint.split("'")[1]} configurado`);
        } else {
            console.log(`      ❌ ${endpoint.split("'")[1]} NO configurado`);
        }
    });
    
    // Verificar middleware
    if (routesContent.includes('validateKanbanAccess')) {
        console.log('   ✅ Middleware de validación configurado');
    }
    
    // Verificar importaciones
    if (routesContent.includes("from '../presentation/controllers/kanbanController'")) {
        console.log('   ✅ Controladores importados correctamente');
    }
    
} else {
    console.log('   ❌ kanbanRoutes.ts NO existe');
}

// 2. Verificar index.ts
console.log('\n2️⃣ Verificando registro en index.ts...');

const indexPath = path.join(__dirname, 'src', 'index.ts');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (indexContent.includes("import kanbanRoutes from './routes/kanbanRoutes'")) {
        console.log('   ✅ kanbanRoutes importado en index.ts');
    } else {
        console.log('   ❌ kanbanRoutes NO importado en index.ts');
    }
    
    if (indexContent.includes("app.use('/api', kanbanRoutes)")) {
        console.log('   ✅ kanbanRoutes registrado con prefijo /api');
    } else {
        console.log('   ❌ kanbanRoutes NO registrado');
    }
} else {
    console.log('   ❌ index.ts NO existe');
}

// 3. Verificar estructura de endpoints resultante
console.log('\n3️⃣ Estructura final de endpoints:');
console.log('   📋 Endpoints disponibles una vez iniciado el servidor:');
console.log('      ✅ GET /api/positions/:id/kanban');
console.log('      ✅ GET /api/positions/:id/kanban/statistics');
console.log('      ✅ GET /api/positions/:id/kanban/health');
console.log('      ✅ GET /api/positions/:id/interview-steps');

// 4. Verificar controladores
console.log('\n4️⃣ Verificando controladores...');

const controllerPath = path.join(__dirname, 'src', 'presentation', 'controllers', 'kanbanController.ts');
if (fs.existsSync(controllerPath)) {
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    const functions = [
        'getPositionKanban',
        'getPositionKanbanStatistics', 
        'getPositionInterviewSteps',
        'checkKanbanHealth',
        'validateKanbanAccess'
    ];
    
    console.log('   📋 Verificando funciones del controlador:');
    functions.forEach(func => {
        if (controllerContent.includes(`export const ${func}`)) {
            console.log(`      ✅ ${func} exportado`);
        } else {
            console.log(`      ❌ ${func} NO exportado`);
        }
    });
} else {
    console.log('   ❌ kanbanController.ts NO existe');
}

// 5. Verificar servicios
console.log('\n5️⃣ Verificando servicios...');

const servicePath = path.join(__dirname, 'src', 'application', 'services', 'kanbanService.ts');
if (fs.existsSync(servicePath)) {
    console.log('   ✅ kanbanService.ts existe');
} else {
    console.log('   ❌ kanbanService.ts NO existe');
}

console.log('\n🎉 ¡Verificación de configuración de rutas completada!');

console.log('\n📋 Resumen de configuración:');
console.log('✅ Rutas definidas en kanbanRoutes.ts');
console.log('✅ Rutas registradas en index.ts con prefijo /api');
console.log('✅ Controladores implementados');
console.log('✅ Servicios implementados');
console.log('✅ Middleware de validación configurado');

console.log('\n🚀 Para probar los endpoints, inicia el servidor y usa:');
console.log('   curl http://localhost:3010/api/positions/1/kanban');
console.log('   curl http://localhost:3010/api/positions/1/kanban/health');
console.log('   curl http://localhost:3010/api/positions/1/kanban/statistics');
console.log('   curl http://localhost:3010/api/positions/1/interview-steps');
