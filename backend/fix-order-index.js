const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOrderIndex() {
    try {
        console.log('=== FIXING ORDER INDEX ===');
        
        // Actualizar Manager Interview para que tenga orderIndex 3
        const result = await prisma.interviewStep.update({
            where: { 
                id: 3  // ID del Manager Interview según el debug
            },
            data: {
                orderIndex: 3
            }
        });
        
        console.log('Updated Manager Interview orderIndex to 3:', result);
        
        // Verificar el cambio
        const updatedSteps = await prisma.interviewStep.findMany({
            where: { interviewFlowId: 1 },
            orderBy: { orderIndex: 'asc' }
        });
        
        console.log('\nUpdated Interview Steps:');
        updatedSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ID: ${step.id}, Name: "${step.name}", OrderIndex: ${step.orderIndex}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixOrderIndex();
