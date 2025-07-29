// Datos mock para posiciones en tests
export const mockPositions = [
  {
    id: 1,
    companyId: 1,
    interviewFlowId: 1,
    title: 'Desarrollador Full Stack',
    description: 'Desarrollador con experiencia en React y Node.js',
    status: 'Active',
    isVisible: true,
    location: 'Barcelona',
    jobDescription: 'Desarrollar aplicaciones web modernas',
    requirements: 'React, Node.js, TypeScript',
    responsibilities: 'Desarrollo frontend y backend',
    salaryMin: 40000,
    salaryMax: 60000,
    employmentType: 'Full-time',
    benefits: 'Seguro médico, flexibilidad horaria',
    companyDescription: 'Empresa tecnológica innovadora',
    applicationDeadline: new Date('2024-12-31'),
    contactInfo: 'hr@empresa.com'
  },
  {
    id: 2,
    companyId: 1,
    interviewFlowId: 1,
    title: 'Product Manager',
    description: 'Gestión de productos digitales',
    status: 'Active',
    isVisible: true,
    location: 'Madrid',
    jobDescription: 'Gestionar el desarrollo de productos',
    requirements: 'Experiencia en gestión de productos',
    responsibilities: 'Definir roadmap y prioridades',
    salaryMin: 50000,
    salaryMax: 70000,
    employmentType: 'Full-time',
    benefits: 'Seguro médico, stock options',
    companyDescription: 'Empresa tecnológica innovadora',
    applicationDeadline: new Date('2024-12-31'),
    contactInfo: 'hr@empresa.com'
  }
];

export const mockPosition = mockPositions[0]; 