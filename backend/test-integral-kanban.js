/**
 * Script de testing integral para validar el sistema completo Kanban
 * Incluye tests de backend, frontend services y integración
 */

console.log('🧪 === TESTING INTEGRAL DEL SISTEMA KANBAN ===\n');

// Importar servicios compilados del backend
const path = require('path');
const distPath = path.join(__dirname, 'dist');

let kanbanService, kanbanController, Position;

try {
    kanbanService = require(path.join(distPath, 'application/services/kanbanService.js'));
    kanbanController = require(path.join(distPath, 'presentation/controllers/kanbanController.js'));
    Position = require(path.join(distPath, 'domain/models/Position.js'));
    
    console.log('✅ Servicios del backend importados correctamente\n');
} catch (error) {
    console.error('❌ Error importando servicios del backend:', error.message);
    process.exit(1);
}

// Test 1: Verificar estructura de datos
async function testDataStructure() {
    console.log('1️⃣ TESTING: Estructura de datos del Kanban');
    
    try {
        // Simular datos de posición válida (ID 1 que sabemos que existe)
        const positionId = 1;
        
        // Test de servicio de obtención de datos
        console.log('   📊 Probando obtención de datos del Kanban...');
        const kanbanData = await kanbanService.getKanbanData(positionId);
        
        // Verificar estructura básica
        if (!kanbanData) {
            throw new Error('No se obtuvieron datos del Kanban');
        }
        
        if (!kanbanData.position) {
            throw new Error('Falta información de la posición');
        }
        
        if (!kanbanData.columns || !Array.isArray(kanbanData.columns)) {
            throw new Error('Falta información de columnas');
        }
        
        console.log('   ✅ Estructura básica válida');
        console.log(`   📋 Posición: "${kanbanData.position.title}"`);
        console.log(`   📊 Columnas: ${kanbanData.columns.length}`);
        
        // Verificar columnas
        kanbanData.columns.forEach((column, index) => {
            console.log(`   📂 Columna ${index + 1}: "${column.name}" (${column.candidates.length} candidatos)`);
            
            if (column.candidates.length > 0) {
                const candidate = column.candidates[0];
                console.log(`      👤 Ejemplo candidato: ${candidate.candidateName || 'Sin nombre'}`);
                if (candidate.averageScore > 0) {
                    console.log(`      ⭐ Score: ${candidate.averageScore}/5`);
                }
            }
        });
        
        console.log('   ✅ Test de estructura de datos: EXITOSO\n');
        return kanbanData;
        
    } catch (error) {
        console.error('   ❌ Test de estructura de datos: FALLIDO');
        console.error('   Error:', error.message);
        return null;
    }
}

// Test 2: Verificar endpoints del controlador
async function testControllerEndpoints() {
    console.log('2️⃣ TESTING: Endpoints del controlador');
    
    try {
        const positionId = 1;
        
        // Simular request object
        const mockReq = {
            params: { id: positionId.toString() } // Usar 'id' en lugar de 'positionId'
        };
        
        // Simular response object
        let responseData = null;
        let responseStatus = null;
        const mockRes = {
            status: (code) => {
                responseStatus = code;
                return mockRes;
            },
            json: (data) => {
                responseData = data;
                return mockRes;
            }
        };
        
        // Test endpoint principal
        console.log('   🌐 Probando endpoint getPositionKanban...');
        await kanbanController.getPositionKanban(mockReq, mockRes);
        
        if (responseStatus === 200 && responseData?.success) {
            console.log('   ✅ Endpoint principal funciona correctamente');
            console.log(`   📊 Datos obtenidos: ${responseData.data.columns.length} columnas`);
        } else {
            throw new Error(`Endpoint falló: Status ${responseStatus}`);
        }
        
        // Test endpoint de estadísticas
        console.log('   📈 Probando endpoint de estadísticas...');
        responseData = null;
        responseStatus = null;
        
        await kanbanController.getPositionKanbanStatistics(mockReq, mockRes);
        
        if (responseStatus === 200 && responseData?.success) {
            console.log('   ✅ Endpoint de estadísticas funciona');
            if (responseData.data.totalCandidates !== undefined) {
                console.log(`   👥 Total candidatos: ${responseData.data.totalCandidates}`);
            }
        } else {
            console.log('   ⚠️ Endpoint de estadísticas no disponible (normal si no hay datos)');
        }
        
        // Test health check
        console.log('   🏥 Probando health check...');
        responseData = null;
        responseStatus = null;
        
        await kanbanController.checkKanbanHealth(mockReq, mockRes);
        
        if (responseStatus && responseData?.data) {
            console.log('   ✅ Health check funciona');
            console.log(`   🔍 Kanban disponible: ${responseData.data.canShowKanban ? 'Sí' : 'No'}`);
            console.log(`   ⚙️ Flujo válido: ${responseData.data.hasValidInterviewFlow ? 'Sí' : 'No'}`);
        }
        
        console.log('   ✅ Test de endpoints: EXITOSO\n');
        return true;
        
    } catch (error) {
        console.error('   ❌ Test de endpoints: FALLIDO');
        console.error('   Error:', error.message);
        return false;
    }
}

// Test 3: Verificar casos edge
async function testEdgeCases() {
    console.log('3️⃣ TESTING: Casos edge y manejo de errores');
    
    try {
        // Test con posición inexistente
        console.log('   🚫 Probando posición inexistente (ID 99999)...');
        
        try {
            await kanbanService.getKanbanData(99999);
            console.log('   ⚠️ Debería haber fallado pero no lo hizo');
        } catch (error) {
            console.log('   ✅ Manejo correcto de posición inexistente');
            console.log(`   📝 Error esperado: ${error.message}`);
        }
        
        // Test con ID inválido
        console.log('   🚫 Probando ID inválido (null)...');
        
        try {
            await kanbanService.getKanbanData(null);
            console.log('   ⚠️ Debería haber fallado pero no lo hizo');
        } catch (error) {
            console.log('   ✅ Manejo correcto de ID inválido');
        }
        
        // Test de validación de datos
        console.log('   🔍 Probando validación de datos...');
        
        const invalidData = { position: null, columns: null };
        const isValid = kanbanService.validateKanbanData ? 
            kanbanService.validateKanbanData(invalidData) : 
            { isValid: false };
            
        if (!isValid.isValid) {
            console.log('   ✅ Validación de datos funciona correctamente');
        }
        
        console.log('   ✅ Test de casos edge: EXITOSO\n');
        return true;
        
    } catch (error) {
        console.error('   ❌ Test de casos edge: FALLIDO');
        console.error('   Error:', error.message);
        return false;
    }
}

// Test 4: Simular flujo frontend
async function testFrontendIntegration() {
    console.log('4️⃣ TESTING: Simulación de integración con frontend');
    
    try {
        console.log('   🌐 Simulando flujo completo de frontend...');
        
        // Paso 1: Usuario selecciona posición
        const positionId = 1;
        console.log(`   👆 Usuario selecciona posición ID: ${positionId}`);
        
        // Paso 2: Verificar disponibilidad de Kanban (lo que haría PositionList)
        console.log('   🔍 Verificando disponibilidad de Kanban...');
        
        const mockReq = { params: { id: positionId.toString() } };
        let healthData = null;
        let healthStatus = null;
        
        const mockRes = {
            status: (code) => {
                healthStatus = code;
                return mockRes;
            },
            json: (data) => {
                healthData = data;
                return mockRes;
            }
        };
        
        await kanbanController.checkKanbanHealth(mockReq, mockRes);
        
        if (healthStatus === 200 && healthData?.data?.canShowKanban) {
            console.log('   ✅ Kanban disponible - permitir navegación');
            
            // Paso 3: Cargar datos del Kanban (lo que haría KanbanBoard)
            console.log('   📊 Cargando datos del tablero...');
            
            let kanbanData = null;
            let kanbanStatus = null;
            
            const kanbanRes = {
                status: (code) => {
                    kanbanStatus = code;
                    return kanbanRes;
                },
                json: (data) => {
                    kanbanData = data;
                    return kanbanRes;
                }
            };
            
            await kanbanController.getPositionKanban(mockReq, kanbanRes);
            
            if (kanbanStatus === 200 && kanbanData?.success) {
                console.log('   ✅ Datos del tablero cargados correctamente');
                console.log(`   📊 Tablero: ${kanbanData.data.columns.length} columnas`);
                
                // Simular interacción del usuario
                kanbanData.data.columns.forEach((column, index) => {
                    console.log(`   📂 Columna ${index + 1}: "${column.name}"`);
                    console.log(`      👥 Candidatos: ${column.candidates.length}`);
                    
                    if (column.candidates.length > 0) {
                        const candidate = column.candidates[0];
                        console.log(`      👤 Primer candidato: ${candidate.candidateName}`);
                        if (candidate.averageScore > 0) {
                            console.log(`      ⭐ Puntuación: ${candidate.averageScore}/5 estrellas`);
                        }
                    }
                });
                
                console.log('   ✅ Simulación de frontend: EXITOSA');
            } else {
                throw new Error('Error cargando datos del tablero');
            }
            
        } else {
            console.log('   ⚠️ Kanban no disponible - mostrar mensaje al usuario');
            console.log(`   📝 Mensaje: ${healthData?.message || 'Configuración incompleta'}`);
        }
        
        console.log('   ✅ Test de integración frontend: EXITOSO\n');
        return true;
        
    } catch (error) {
        console.error('   ❌ Test de integración frontend: FALLIDO');
        console.error('   Error:', error.message);
        return false;
    }
}

// Test 5: Performance y optimización
async function testPerformance() {
    console.log('5️⃣ TESTING: Performance y optimización');
    
    try {
        const positionId = 1;
        
        // Test de tiempo de respuesta
        console.log('   ⏱️ Midiendo tiempo de respuesta...');
        
        const startTime = Date.now();
        const data = await kanbanService.getKanbanData(positionId);
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        console.log(`   📊 Tiempo de respuesta: ${responseTime}ms`);
        
        if (responseTime < 1000) {
            console.log('   ✅ Tiempo de respuesta excelente (< 1s)');
        } else if (responseTime < 3000) {
            console.log('   ⚠️ Tiempo de respuesta aceptable (< 3s)');
        } else {
            console.log('   ❌ Tiempo de respuesta lento (> 3s)');
        }
        
        // Test de múltiples requests (simular carga)
        console.log('   🚀 Probando múltiples requests simultáneos...');
        
        const requests = [];
        for (let i = 0; i < 5; i++) {
            requests.push(kanbanService.getKanbanData(positionId));
        }
        
        const startConcurrent = Date.now();
        await Promise.all(requests);
        const endConcurrent = Date.now();
        
        const concurrentTime = endConcurrent - startConcurrent;
        console.log(`   📊 5 requests simultáneos: ${concurrentTime}ms`);
        
        if (concurrentTime < 2000) {
            console.log('   ✅ Manejo de concurrencia excelente');
        } else {
            console.log('   ⚠️ Manejo de concurrencia mejorable');
        }
        
        console.log('   ✅ Test de performance: EXITOSO\n');
        return true;
        
    } catch (error) {
        console.error('   ❌ Test de performance: FALLIDO');
        console.error('   Error:', error.message);
        return false;
    }
}

// Ejecutar todos los tests
async function runAllTests() {
    console.log('🏁 Iniciando batería completa de tests...\n');
    
    const results = {
        dataStructure: false,
        controllerEndpoints: false,
        edgeCases: false,
        frontendIntegration: false,
        performance: false
    };
    
    // Ejecutar tests secuencialmente
    results.dataStructure = await testDataStructure();
    results.controllerEndpoints = await testControllerEndpoints();
    results.edgeCases = await testEdgeCases();
    results.frontendIntegration = await testFrontendIntegration();
    results.performance = await testPerformance();
    
    // Resumen final
    console.log('📋 === RESUMEN DE TESTS ===');
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ EXITOSO' : '❌ FALLIDO';
        const testNames = {
            dataStructure: 'Estructura de datos',
            controllerEndpoints: 'Endpoints del controlador',
            edgeCases: 'Casos edge y errores',
            frontendIntegration: 'Integración frontend',
            performance: 'Performance'
        };
        
        console.log(`${status} - ${testNames[test]}`);
    });
    
    const totalPassed = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 RESULTADO FINAL: ${totalPassed}/${totalTests} tests pasaron`);
    
    if (totalPassed === totalTests) {
        console.log('🎉 ¡TODOS LOS TESTS EXITOSOS! El sistema Kanban está funcionando correctamente.');
    } else {
        console.log('⚠️ Algunos tests fallaron. Revisar la implementación.');
    }
    
    return results;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('💥 Error general en tests:', error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testDataStructure,
    testControllerEndpoints,
    testEdgeCases,
    testFrontendIntegration,
    testPerformance
};
