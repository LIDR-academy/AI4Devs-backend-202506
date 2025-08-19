const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEndpoints() {
  try {
    console.log('=== TESTING DATABASE QUERIES ===\n');
    
    // 1. Test getting positions
    const positions = await prisma.position.findMany();
    console.log('1. Positions in database:', positions.length);
    if (positions.length > 0) {
      console.log('   First position ID:', positions[0].id);
      console.log('   Position title:', positions[0].title);
    }

    // 2. Test getting candidates for position 1
    if (positions.length > 0) {
      const positionId = positions[0].id;
      
      const applications = await prisma.application.findMany({
        where: { positionId: positionId },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          interviewStep: {
            select: {
              id: true,
              name: true,
              orderIndex: true
            }
          },
          interviews: {
            select: {
              score: true
            },
            where: {
              score: { not: null }
            }
          }
        }
      });

      console.log('\n2. Applications for position', positionId + ':', applications.length);
      
      applications.forEach((app, index) => {
        const scores = app.interviews.map(i => i.score).filter(s => s !== null);
        const avgScore = scores.length > 0 
          ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
          : null;
          
        console.log(`   Candidate ${index + 1}:`, {
          id: app.candidate.id,
          name: `${app.candidate.firstName} ${app.candidate.lastName}`,
          currentStep: app.interviewStep.name,
          averageScore: avgScore
        });
      });
    }

    // 3. Test getting interview steps
    const steps = await prisma.interviewStep.findMany({
      orderBy: { orderIndex: 'asc' }
    });
    
    console.log('\n3. Available interview steps:', steps.length);
    steps.forEach((step, index) => {
      console.log(`   Step ${index + 1}: ${step.name} (ID: ${step.id})`);
    });

    console.log('\n=== DATABASE READY FOR API TESTING ===');
    console.log('You can now test:');
    if (positions.length > 0) {
      console.log(`GET http://localhost:3010/positions/${positions[0].id}/candidates`);
    }
    console.log('PUT http://localhost:3010/candidates/{candidateId}/stage');
    
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpoints();
