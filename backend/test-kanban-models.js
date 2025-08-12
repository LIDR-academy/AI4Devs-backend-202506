// Test de los nuevos métodos agregados a los modelos de dominio
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testKanbanModels() {
    try {
        console.log('🧪 Probando los nuevos métodos de los modelos para Kanban...\n');

        // 1. Test de Position.validateInterviewFlow
        console.log('1️⃣ Testing Position.validateInterviewFlow...');
        
        // Importar Position dinámicamente (desde archivos compilados)
        const { Position } = await import('./temp/Position.js');
        
        const hasValidFlow = await Position.validateInterviewFlow(1);
        console.log(`   ✅ Position 1 has valid interview flow: ${hasValidFlow}`);

        // 2. Test de Position.getKanbanData
        console.log('\n2️⃣ Testing Position.getKanbanData...');
        
        if (hasValidFlow) {
            const kanbanData = await Position.getKanbanData(1);
            console.log(`   ✅ Kanban data retrieved for position: ${kanbanData.position.title}`);
            console.log(`   ✅ Number of columns: ${kanbanData.columns.length}`);
            
            kanbanData.columns.forEach(column => {
                console.log(`   📋 Column: ${column.name} (${column.candidates.length} candidates)`);
                column.candidates.forEach(candidate => {
                    console.log(`      👤 ${candidate.firstName} ${candidate.lastName} - Score: ${candidate.averageScore}`);
                });
            });
        }

        // 3. Test de InterviewStep.findByInterviewFlow
        console.log('\n3️⃣ Testing InterviewStep.findByInterviewFlow...');
        
        const { InterviewStep } = await import('./temp/InterviewStep.js');
        
        // Primero obtener el InterviewFlowId de la posición 1
        const positionWithFlow = await prisma.position.findUnique({
            where: { id: 1 },
            select: { interviewFlowId: true }
        });

        if (positionWithFlow?.interviewFlowId) {
            const steps = await InterviewStep.findByInterviewFlow(positionWithFlow.interviewFlowId);
            console.log(`   ✅ Found ${steps.length} interview steps for flow ${positionWithFlow.interviewFlowId}`);
            
            steps.forEach(step => {
                console.log(`   📝 Step: ${step.name} (order: ${step.orderIndex})`);
            });
        }

        // 4. Test de Application.getApplicationsWithCandidates
        console.log('\n4️⃣ Testing Application.getApplicationsWithCandidates...');
        
        const { Application } = await import('./temp/Application.js');
        
        const applicationsWithCandidates = await Application.getApplicationsWithCandidates(1);
        console.log(`   ✅ Found ${applicationsWithCandidates.length} applications for position 1`);
        
        applicationsWithCandidates.forEach(app => {
            console.log(`   👤 ${app.candidate.firstName} ${app.candidate.lastName} - Avg Score: ${app.averageScore} - Last Step: ${app.lastInterviewStepId || 'None'}`);
        });

        console.log('\n🎉 ¡Todos los tests de modelos completados exitosamente!');

    } catch (error) {
        console.error('❌ Error en tests de modelos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testKanbanModels();
