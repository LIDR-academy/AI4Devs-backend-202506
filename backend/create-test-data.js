const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Creating test data...');
    
    // Get existing data
    const company = await prisma.company.findFirst();
    const flow = await prisma.interviewFlow.findFirst();
    const steps = await prisma.interviewStep.findMany({ orderBy: { orderIndex: 'asc' } });
    
    if (!company || !flow || steps.length < 2) {
      throw new Error('Basic data not found. Run seed first.');
    }

    console.log('Found company:', company.name);
    console.log('Found flow:', flow.description);
    console.log('Found steps:', steps.length);

    // Create Position
    const position = await prisma.position.create({
      data: {
        companyId: company.id,
        interviewFlowId: flow.id,
        title: 'Senior Full Stack Developer',
        description: 'Senior software developer position',
        location: 'Remote',
        jobDescription: 'We are looking for a senior developer with React and Node.js experience...',
        status: 'Open',
        isVisible: true
      }
    });

    console.log('Created position:', position.id);

    // Create Candidates
    const candidate1 = await prisma.candidate.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@testcandidate.com',
        phone: '123456789',
        address: '123 Main St'
      }
    });

    const candidate2 = await prisma.candidate.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@testcandidate.com',
        phone: '987654321',
        address: '456 Oak Ave'
      }
    });

    const candidate3 = await prisma.candidate.create({
      data: {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@testcandidate.com',
        phone: '555123456',
        address: '789 Pine St'
      }
    });

    console.log('Created candidates:', [candidate1.id, candidate2.id, candidate3.id]);

    // Create Applications
    const app1 = await prisma.application.create({
      data: {
        positionId: position.id,
        candidateId: candidate1.id,
        applicationDate: new Date(),
        currentInterviewStep: steps[0].id
      }
    });

    const app2 = await prisma.application.create({
      data: {
        positionId: position.id,
        candidateId: candidate2.id,
        applicationDate: new Date(),
        currentInterviewStep: steps[1].id
      }
    });

    const app3 = await prisma.application.create({
      data: {
        positionId: position.id,
        candidateId: candidate3.id,
        applicationDate: new Date(),
        currentInterviewStep: steps[0].id
      }
    });

    console.log('Created applications:', [app1.id, app2.id, app3.id]);

    // Create Employee for interviews
    const employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        name: 'Alice HR Manager',
        email: 'alice.hr@techcorp.com',
        role: 'Interviewer'
      }
    });

    console.log('Created employee:', employee.id);

    // Create some interviews with scores
    const interviews = await prisma.interview.createMany({
      data: [
        {
          applicationId: app1.id,
          interviewStepId: steps[0].id,
          employeeId: employee.id,
          interviewDate: new Date(),
          result: 'Passed',
          score: 8,
          notes: 'Good technical skills, solid understanding of React'
        },
        {
          applicationId: app2.id,
          interviewStepId: steps[0].id,
          employeeId: employee.id,
          interviewDate: new Date(),
          result: 'Passed',
          score: 9,
          notes: 'Excellent problem solving and communication'
        },
        {
          applicationId: app2.id,
          interviewStepId: steps[1].id,
          employeeId: employee.id,
          interviewDate: new Date(),
          result: 'Passed',
          score: 7,
          notes: 'Good cultural fit, needs some guidance on processes'
        },
        {
          applicationId: app3.id,
          interviewStepId: steps[0].id,
          employeeId: employee.id,
          interviewDate: new Date(),
          result: 'Pending',
          score: 6,
          notes: 'Average performance, needs improvement in Node.js'
        }
      ]
    });

    console.log('Created interviews with scores');

    console.log('\n=== TEST DATA SUMMARY ===');
    console.log('Position ID:', position.id);
    console.log('Candidates:');
    console.log(`- John Doe (ID: ${candidate1.id}) - Step: ${steps[0].name}`);
    console.log(`- Jane Smith (ID: ${candidate2.id}) - Step: ${steps[1].name}`);
    console.log(`- Bob Johnson (ID: ${candidate3.id}) - Step: ${steps[0].name}`);
    console.log('\nInterview Steps:');
    steps.forEach(step => {
      console.log(`- ${step.name} (ID: ${step.id})`);
    });
    console.log('\n=== READY TO TEST ENDPOINTS ===');
    console.log(`GET /positions/${position.id}/candidates`);
    console.log(`PUT /candidates/{candidateId}/stage`);
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
