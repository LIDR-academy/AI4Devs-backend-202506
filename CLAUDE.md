# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Express/TypeScript with Prisma)
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server with auto-reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm test             # Run Jest tests
```

### Frontend (React/TypeScript)
```bash
cd frontend
npm install          # Install dependencies
npm start            # Start development server (port 3000)
npm run build        # Create production build
npm test             # Run tests
```

### Database (PostgreSQL with Docker)
```bash
docker compose up -d     # Start PostgreSQL container
docker compose down      # Stop PostgreSQL container
cd backend
npx prisma generate      # Generate Prisma client
npx prisma migrate deploy # Apply existing database migrations
npx tsx prisma/seed.ts  # Seed database with sample data (using tsx for compatibility)
npx prisma studio       # Open database GUI in browser (http://localhost:5555)
```

## Architecture Overview

This is a full-stack talent tracking system with clean architecture:

### Backend Structure (`backend/src/`)
- **Domain Layer** (`domain/models/`): Business entities (Candidate, Company, Position, etc.)
- **Application Layer** (`application/`): Services and validation logic
- **Presentation Layer** (`presentation/controllers/`): HTTP controllers
- **Routes** (`routes/`): Express route definitions
- **Infrastructure**: Prisma ORM for PostgreSQL database

### Key Models
- **Candidate**: Core entity with education, work experience, and resumes
- **Company/Employee**: Organizations and their staff members
- **Position**: Job openings with interview flows
- **Interview System**: Multi-step interview process management

### API Endpoints
- Backend runs on port 3010
- **Candidates**: 
  - `POST /candidates` - Register new candidate
  - `GET /candidates/:id` - Get candidate by ID
  - `PUT /candidates/:id/stage` - Update candidate interview stage
- **Positions**:
  - `GET /positions/:id/candidates` - Get all candidates for a position
- **File Management**: `POST /upload` - File upload endpoint
- CORS enabled for frontend at localhost:3000

#### Position Endpoints Details

**GET /positions/:id/candidates**
- Retrieves all candidates that have applied to a specific position
- Returns candidate details with application date, current interview step, and average score
- Response includes position info and candidate list ordered by application date (newest first)

Example usage:
```bash
curl -X GET http://localhost:3010/positions/1/candidates
```

Response format:
```json
{
  "message": "Candidates retrieved successfully",
  "data": {
    "positionId": 1,
    "positionTitle": "Software Engineer",
    "totalCandidates": 3,
    "candidates": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe", 
        "email": "john.doe@gmail.com",
        "phone": "1234567890",
        "applicationDate": "2025-08-13T19:56:41.665Z",
        "currentStep": "Technical Interview",
        "averageScore": 5
      }
    ]
  }
}
```

Error responses:
- `400` - Invalid position ID format or negative/zero ID
- `404` - Position not found
- `500` - Internal server error

#### Candidate Stage Management

**PUT /candidates/:id/stage**
- Updates the current interview stage for a specific candidate
- Implements strict business rules for stage transitions
- Only allows sequential progression (no skipping or going backward)
- Updates both the interview step and optional notes

**Business Rules:**
- **Sequential Only**: Can only advance from orderIndex N to orderIndex N+1
- **No Backward Transitions**: Cannot move to previous stages (409 error)
- **No Stage Skipping**: Cannot jump multiple stages ahead (409 error)
- **Flow Validation**: New stage must belong to position's interview flow (422 error)
- **Atomic Updates**: Uses database transactions for data integrity

Example usage:
```bash
curl -X PUT http://localhost:3010/candidates/3/stage \
  -H "Content-Type: application/json" \
  -d '{
    "newInterviewStepId": 3,
    "positionId": 1,
    "notes": "Candidate passed technical interview successfully"
  }'
```

Request body:
```json
{
  "newInterviewStepId": 3,    // Required: ID of next interview step
  "positionId": 1,            // Required: Position ID for validation
  "notes": "Optional notes"   // Optional: Update notes (max 500 chars)
}
```

Success response (200):
```json
{
  "success": true,
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": 3,
    "fullName": "Carlos García",
    "previousStep": {
      "stepId": 2,
      "stepName": "Technical Interview", 
      "orderIndex": 2
    },
    "currentStep": {
      "stepId": 3,
      "stepName": "Manager Interview",
      "orderIndex": 3
    },
    "positionId": 1,
    "positionTitle": "Software Engineer",
    "updatedAt": "2025-08-13T21:58:36.363Z"
  }
}
```

Error responses:
- `400` - Invalid input data, malformed request, or validation errors
- `404` - Candidate not found or no application for specified position
- `409` - Stage transition not allowed (backward move or stage skip)
- `422` - New interview step does not belong to position's interview flow  
- `500` - Internal server error

### Database
- PostgreSQL with hardcoded connection in schema.prisma
- Connection: `postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb`
- Managed via Docker Compose with environment variables

### Frontend
- React with TypeScript and Bootstrap
- Components for candidate forms and recruiter dashboard
- Communicates with backend API

## Project Setup Sequence
1. Start PostgreSQL: `docker compose up -d`
2. Setup database: `cd backend && npx prisma generate && npx prisma migrate deploy && npx tsx prisma/seed.ts`
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm start`
5. Optional: Open Prisma Studio: `npx prisma studio` (opens at http://localhost:5555)