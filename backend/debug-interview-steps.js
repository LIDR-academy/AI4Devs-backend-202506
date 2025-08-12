const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugInterviewSteps() {
    try {
        console.log('=== DEBUG: Interview Steps ===');
        
        // Obtener todas las interview steps
        const interviewSteps = await prisma.interviewStep.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                interviewFlow: true,
                interviewType: true
            }
        });
        
        console.log('Total Interview Steps:', interviewSteps.length);
        console.log('\nDetalle de cada step:');
        
        interviewSteps.forEach((step, index) => {
            console.log(`${index + 1}. ID: ${step.id}, Name: "${step.name}", OrderIndex: ${step.orderIndex}, FlowId: ${step.interviewFlowId}`);
        });
        
        console.log('\n=== DEBUG: Position with InterviewFlow ===');
        
        // Obtener la posición 1 con sus interview steps
        const position = await prisma.position.findUnique({
            where: { id: 1 },
            include: {
                interviewFlow: {
                    include: {
                        interviewSteps: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                }
            }
        });
        
        if (position) {
            console.log(`Position: "${position.title}" (ID: ${position.id})`);
            console.log(`InterviewFlow ID: ${position.interviewFlowId}`);
            console.log('Interview Steps for this position:');
            
            position.interviewFlow?.interviewSteps.forEach((step, index) => {
                console.log(`  ${index + 1}. ID: ${step.id}, Name: "${step.name}", OrderIndex: ${step.orderIndex}`);
            });
        } else {
            console.log('Position with ID 1 not found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugInterviewSteps();
