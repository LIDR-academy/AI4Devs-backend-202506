const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testActivePositions() {
  try {
    console.log('🧪 Probando la función findActivePositions...\n');

    // Simulamos la función findActivePositions del modelo Position
    const activePositions = await prisma.position.findMany({
      where: {
        status: 'Open',
        isVisible: true
      },
      include: {
        company: true
      }
    });

    console.log(`📊 Posiciones activas encontradas: ${activePositions.length}\n`);

    if (activePositions.length > 0) {
      console.log('✅ Posiciones activas:');
      activePositions.forEach(position => {
        console.log(`  - ID: ${position.id}, Título: ${position.title}, Company: ${position.company?.name || 'N/A'}`);
      });
    } else {
      console.log('❌ No se encontraron posiciones activas');
    }

    // También vamos a probar con diferentes valores para ver qué está pasando
    console.log('\n🔍 Verificando datos exactos...');
    
    const allPositions = await prisma.position.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        isVisible: true
      }
    });

    console.log('📋 Todos los registros:');
    allPositions.forEach(pos => {
      console.log(`  - ID: ${pos.id}, Status: "${pos.status}", isVisible: ${pos.isVisible}, Título: ${pos.title}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActivePositions();
