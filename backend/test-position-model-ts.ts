// Test usando el modelo Position actual
import { Position } from './src/domain/models/Position';

async function testPositionModel() {
  try {
    console.log('🧪 Probando el modelo Position.findActivePositions()...\n');

    const activePositions = await Position.findActivePositions();

    console.log(`📊 Posiciones activas encontradas: ${activePositions.length}\n`);

    if (activePositions.length > 0) {
      console.log('✅ Posiciones activas:');
      activePositions.forEach(position => {
        console.log(`  - ID: ${position.id}, Título: ${position.title}, Company: ${position.company?.name || 'N/A'}`);
      });
    } else {
      console.log('❌ No se encontraron posiciones activas');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPositionModel();
