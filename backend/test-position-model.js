const { Position } = require('./src/domain/models/Position');

async function testPositionModel() {
    try {
        console.log('🧪 Probando el modelo Position directamente...\n');
        
        // 1. Probar el método findActivePositions
        console.log('📋 Probando Position.findActivePositions(1, 10)...');
        const result = await Position.findActivePositions(1, 10);
        
        console.log('✅ Resultado obtenido:');
        console.log(`  - Total de posiciones: ${result.positions.length}`);
        console.log(`  - Paginación: ${result.pagination.total} total, ${result.pagination.totalPages} páginas`);
        
        if (result.positions.length > 0) {
            console.log('\n📋 Posiciones encontradas:');
            result.positions.forEach((pos, index) => {
                console.log(`  ${index + 1}. ID: ${pos.id}, Título: ${pos.title}, Status: ${pos.status}, Visible: ${pos.isVisible}`);
            });
        } else {
            console.log('\n❌ No se encontraron posiciones');
        }
        
    } catch (error) {
        console.error('❌ Error al probar el modelo Position:', error);
        console.error('Stack trace:', error.stack);
    }
}

testPositionModel();
