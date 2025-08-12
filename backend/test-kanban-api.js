const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testKanbanAPI() {
    try {
        console.log('=== TESTING KANBAN API RESPONSE ===');
        
        // Simular la misma consulta que hace el método getKanbanData
        const positionId = 1;
        
        // 1. Obtener información básica de la posición
        const positionData = await prisma.position.findUnique({
            where: { id: positionId },
            include: {
                company: {
                    select: { name: true }
                },
                interviewFlow: {
                    include: {
                        interviewSteps: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                }
            }
        });

        console.log('Position Data:');
        console.log('- Title:', positionData.title);
        console.log('- InterviewFlow ID:', positionData.interviewFlowId);
        console.log('- Interview Steps:');
        
        positionData.interviewFlow?.interviewSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ID: ${step.id}, Name: "${step.name}", OrderIndex: ${step.orderIndex}`);
        });

        // 3. Crear columna "Revisión" (siempre primera)
        const applicationColumn = {
            id: 'application',
            name: 'Revisión',
            orderIndex: 0,
            candidates: []
        };

        // 4. Crear columnas dinámicas basadas en InterviewSteps
        const interviewColumns = positionData.interviewFlow?.interviewSteps.map(step => ({
            id: step.id,
            name: step.name,
            orderIndex: step.orderIndex + 1, // +1 porque "Revisión" es orden 0
            candidates: []
        })) || [];

        const allColumns = [applicationColumn, ...interviewColumns];

        console.log('\n=== FINAL COLUMNS STRUCTURE ===');
        allColumns.forEach((col, index) => {
            console.log(`${index + 1}. ID: ${col.id}, Name: "${col.name}", OrderIndex: ${col.orderIndex}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testKanbanAPI();
