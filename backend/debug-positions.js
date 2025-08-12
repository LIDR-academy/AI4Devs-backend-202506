const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPositions() {
    try {
        console.log('🔍 Verificando posiciones en la base de datos...\n');
        
        // 1. Contar todas las posiciones
        const totalPositions = await prisma.position.count();
        console.log(`📊 Total de posiciones: ${totalPositions}`);
        
        // 2. Ver todas las posiciones
        const allPositions = await prisma.position.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                isVisible: true,
                location: true
            }
        });
        
        console.log('\n📋 Todas las posiciones:');
        allPositions.forEach(pos => {
            console.log(`  - ID: ${pos.id}, Título: ${pos.title}, Status: ${pos.status}, Visible: ${pos.isVisible}, Location: ${pos.location}`);
        });
        
        // 3. Contar posiciones con status 'Open'
        const openPositionsCount = await prisma.position.count({
            where: {
                status: 'Open'
            }
        });
        console.log(`\n🟢 Posiciones con status 'Open': ${openPositionsCount}`);
        
        // 4. Contar posiciones visibles
        const visiblePositionsCount = await prisma.position.count({
            where: {
                isVisible: true
            }
        });
        console.log(`👁️ Posiciones visibles: ${visiblePositionsCount}`);
        
        // 5. Contar posiciones Open Y visibles
        const openAndVisibleCount = await prisma.position.count({
            where: {
                status: 'Open',
                isVisible: true
            }
        });
        console.log(`✅ Posiciones Open Y visibles: ${openAndVisibleCount}`);
        
        // 6. Ver posiciones Open Y visibles
        const openAndVisiblePositions = await prisma.position.findMany({
            where: {
                status: 'Open',
                isVisible: true
            },
            include: {
                company: {
                    select: {
                        name: true
                    }
                }
            }
        });
        
        console.log('\n🎯 Posiciones Open Y visibles (con company):');
        openAndVisiblePositions.forEach(pos => {
            console.log(`  - ID: ${pos.id}, Título: ${pos.title}, Company: ${pos.company?.name || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('❌ Error al verificar posiciones:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugPositions();
