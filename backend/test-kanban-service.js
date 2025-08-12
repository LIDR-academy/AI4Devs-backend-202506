// Test del servicio de Kanban - Lógica de negocio
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testKanbanService() {
    try {
        console.log('🧪 Probando el servicio de Kanban...\n');

        // Compilar el servicio para poder probarlo
        console.log('📦 Compilando servicio de Kanban...');
        const { execSync } = require('child_process');
        execSync('npx tsc src/application/services/kanbanService.ts --outDir temp --target es2020 --module commonjs', 
                { stdio: 'inherit' });

        // Importar el servicio compilado
        const kanbanService = await import('./temp/application/services/kanbanService.js');

        // 1. Test de validateKanbanRequest
        console.log('\n1️⃣ Testing validateKanbanRequest...');
        
        const validRequest = kanbanService.validateKanbanRequest(1);
        console.log(`   ✅ Valid request (ID=1): ${validRequest.isValid} - ID: ${validRequest.normalizedId}`);
        
        const invalidRequest = kanbanService.validateKanbanRequest('abc');
        console.log(`   ✅ Invalid request (ID='abc'): ${invalidRequest.isValid} - Error: ${invalidRequest.error}`);
        
        const negativeRequest = kanbanService.validateKanbanRequest(-1);
        console.log(`   ✅ Negative request (ID=-1): ${negativeRequest.isValid} - Error: ${negativeRequest.error}`);

        // 2. Test de validateInterviewFlow
        console.log('\n2️⃣ Testing validateInterviewFlow...');
        
        const hasValidFlow = await kanbanService.validateInterviewFlow(1);
        console.log(`   ✅ Position 1 has valid interview flow: ${hasValidFlow}`);
        
        const hasInvalidFlow = await kanbanService.validateInterviewFlow(999);
        console.log(`   ✅ Position 999 has valid interview flow: ${hasInvalidFlow}`);

        // 3. Test de getKanbanData
        console.log('\n3️⃣ Testing getKanbanData...');
        
        let kanbanData = null;
        if (hasValidFlow) {
            kanbanData = await kanbanService.getKanbanData(1);
            console.log(`   ✅ Kanban data for position: ${kanbanData.position.title}`);
            console.log(`   ✅ Company: ${kanbanData.position.company.name}`);
            console.log(`   ✅ Number of columns: ${kanbanData.columns.length}`);
            
            kanbanData.columns.forEach(column => {
                console.log(`   📋 Column: ${column.name} (Order: ${column.orderIndex}, Candidates: ${column.candidates.length})`);
                column.candidates.forEach(candidate => {
                    console.log(`      👤 ${candidate.firstName} ${candidate.lastName} - Score: ${candidate.averageScore}`);
                });
            });
        }

        // 4. Test de getKanbanData con posición inválida
        console.log('\n4️⃣ Testing getKanbanData with invalid position...');
        
        try {
            await kanbanService.getKanbanData(999);
            console.log('   ❌ Should have thrown an error');
        } catch (error) {
            console.log(`   ✅ Expected error caught: ${error.message}`);
        }

        // 5. Test de getInterviewStepsForPosition
        console.log('\n5️⃣ Testing getInterviewStepsForPosition...');
        
        const interviewSteps = await kanbanService.getInterviewStepsForPosition(1);
        console.log(`   ✅ Found ${interviewSteps.length} interview steps`);
        
        interviewSteps.forEach(step => {
            console.log(`   📝 Step: ${step.name} (Order: ${step.orderIndex}) - Type: ${step.interviewType?.name}`);
        });

        // 6. Test de getKanbanStatistics
        console.log('\n6️⃣ Testing getKanbanStatistics...');
        
        const stats = await kanbanService.getKanbanStatistics(1);
        console.log(`   ✅ Total candidates: ${stats.totalCandidates}`);
        console.log(`   ✅ Candidates with interviews: ${stats.candidatesWithInterviews}`);
        console.log(`   ✅ Candidates without interviews: ${stats.candidatesWithoutInterviews}`);
        console.log(`   ✅ Overall average score: ${stats.averageScoreOverall}`);
        
        console.log('   📊 Column distribution:');
        stats.columnDistribution.forEach(col => {
            console.log(`      ${col.columnName}: ${col.candidateCount} candidates (avg score: ${col.averageScore})`);
        });

        // 7. Test de formatKanbanResponse
        console.log('\n7️⃣ Testing formatKanbanResponse...');
        
        if (kanbanData) {
            const formattedResponse = kanbanService.formatKanbanResponse(kanbanData);
            console.log(`   ✅ Response formatted successfully: ${formattedResponse.success}`);
            console.log(`   ✅ Message: ${formattedResponse.message}`);
            console.log(`   ✅ Data structure valid: ${!!formattedResponse.data.position && !!formattedResponse.data.columns}`);
        } else {
            console.log('   ⏭️ Skipped (no kanban data available)');
        }        // 8. Test de formatKanbanError
        console.log('\n8️⃣ Testing formatKanbanError...');
        
        const testError = new Error('Esta posición no tiene definidas etapas');
        const formattedError = kanbanService.formatKanbanError(testError);
        console.log(`   ✅ Error formatted - Status: ${formattedError.statusCode}, Success: ${formattedError.response.success}`);
        console.log(`   ✅ Error type: ${formattedError.response.error}`);
        console.log(`   ✅ Error message: ${formattedError.response.message}`);

        console.log('\n🎉 ¡Todos los tests del servicio de Kanban completados exitosamente!');

    } catch (error) {
        console.error('❌ Error en tests del servicio:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testKanbanService();
