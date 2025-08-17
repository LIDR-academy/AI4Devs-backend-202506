# LTI Kanban Pipeline Endpoints Documentation

## Overview
This document describes the implementation of Kanban-style endpoints for managing candidate pipelines in the LTI Talent Tracking System. These endpoints allow recruiters to view candidates in different stages of the recruitment process and move them between stages.

## 🎯 Implemented Endpoints

### 1. GET /positions/:id/candidates
**Purpose**: Retrieve all candidates currently in the recruitment pipeline for a specific position.

**URL**: `GET /positions/{positionId}/candidates`

**Parameters**:
- `positionId` (path parameter, required): The ID of the position

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "currentInterviewStep": 2,
      "averageScore": 87.5,
      "applicationDate": "2024-01-15T10:30:00Z",
      "totalInterviews": 3
    }
  ],
  "message": "Found 5 candidates for position 1"
}
```

**Response Fields**:
- `id`: Candidate's unique identifier
- `fullName`: Candidate's full name (firstName + lastName)
- `email`: Candidate's email address
- `currentInterviewStep`: Current stage ID in the interview process
- `averageScore`: Average score from all interviews (rounded to 2 decimal places)
- `applicationDate`: When the candidate applied for the position
- `totalInterviews`: Number of interviews conducted so far

**Status Codes**:
- `200`: Success - Candidates retrieved
- `400`: Bad Request - Invalid position ID format
- `404`: Not Found - Position doesn't exist
- `500`: Internal Server Error

**Example Usage**:
```bash
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json"
```

### 2. PUT /candidates/:id/stage
**Purpose**: Update the current stage of a candidate in the recruitment pipeline.

**URL**: `PUT /candidates/{candidateId}/stage`

**Parameters**:
- `candidateId` (path parameter, required): The ID of the candidate

**Request Body**:
```json
{
  "positionId": 1,
  "currentInterviewStep": 3,
  "notes": "Moved to technical interview stage"
}
```

**Request Fields**:
- `positionId` (required): Position ID for validation
- `currentInterviewStep` (required): New interview step ID
- `notes` (optional): Notes about the stage change

**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "currentInterviewStep": 3,
    "averageScore": 87.5,
    "applicationDate": "2024-01-15T10:30:00Z",
    "totalInterviews": 3,
    "positionTitle": "Software Engineer"
  },
  "message": "Candidate John Doe stage updated successfully"
}
```

**Status Codes**:
- `200`: Success - Stage updated
- `400`: Bad Request - Invalid input data
- `404`: Not Found - Candidate or position not found
- `500`: Internal Server Error

**Example Usage**:
```bash
curl -X PUT "http://localhost:3010/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "currentInterviewStep": 3,
    "notes": "Advanced to technical interview"
  }'
```

### 3. GET /positions/:id/interview-steps
**Purpose**: Get all available interview steps for a position (helper endpoint for frontend).

**URL**: `GET /positions/{positionId}/interview-steps`

**Parameters**:
- `positionId` (path parameter, required): The ID of the position

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Phone Screen",
      "orderIndex": 1,
      "interviewType": "Phone Interview"
    },
    {
      "id": 2,
      "name": "Technical Interview",
      "orderIndex": 2,
      "interviewType": "Technical Assessment"
    },
    {
      "id": 3,
      "name": "Final Interview",
      "orderIndex": 3,
      "interviewType": "Behavioral Interview"
    }
  ],
  "message": "Found 3 interview steps for position 1"
}
```

**Status Codes**:
- `200`: Success - Interview steps retrieved
- `400`: Bad Request - Invalid position ID format
- `404`: Not Found - Position doesn't exist
- `500`: Internal Server Error

## 🏗️ Architecture Implementation

### Domain Layer
The implementation follows Domain-Driven Design principles:

1. **DTOs** (`CandidatePipelineDTO.ts`):
   - `CandidatePipelineDTO`: Data transfer object for candidate pipeline information
   - `UpdateCandidateStageDTO`: DTO for stage update requests
   - `CandidatePipelineResponse`: Standardized API response format

2. **Service Layer** (`pipelineService.ts`):
   - `PipelineService`: Business logic for pipeline operations
   - Handles data validation, transformation, and database operations
   - Implements error handling and logging

3. **Controller Layer** (`pipelineController.ts`):
   - `PipelineController`: HTTP request/response handling
   - Input validation and error response formatting
   - Follows RESTful conventions

### Database Queries
The service uses optimized Prisma queries:

```typescript
// Get candidates with related data
const applications = await prisma.application.findMany({
  where: { positionId },
  include: {
    candidate: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    },
    interviews: {
      select: { score: true }
    }
  },
  orderBy: { applicationDate: 'desc' }
});
```

### Error Handling
Comprehensive error handling implemented:

1. **Validation Errors**: Invalid input parameters
2. **Not Found Errors**: Missing positions, candidates, or applications
3. **Database Errors**: Connection issues or constraint violations
4. **Standardized Error Responses**: Consistent error format across all endpoints

## 🧪 Testing

### Unit Tests
Tests are implemented in `pipelineService.test.ts`:

- **Service Layer Testing**: Mocked Prisma client for isolated testing
- **Success Scenarios**: Valid data processing and transformation
- **Error Scenarios**: Proper error handling and validation
- **Edge Cases**: Null values, empty arrays, etc.

### Test Coverage
- ✅ `getCandidatesForPosition`: Valid position and non-existent position
- ✅ `updateCandidateStage`: Successful update and validation errors
- ✅ Average score calculation
- ✅ Data transformation and formatting

## 🔧 Integration with Existing System

### Database Schema
The endpoints leverage the existing Prisma schema:

- **Application**: Links candidates to positions and tracks current stage
- **Interview**: Stores interview scores for average calculation
- **InterviewStep**: Defines available stages in the recruitment process
- **Position**: Validates position existence

### API Consistency
- Follows existing API patterns and response formats
- Uses same error handling approach as other endpoints
- Maintains backward compatibility

## 🚀 Usage Examples

### Frontend Integration
```javascript
// Get candidates for a position
const getCandidates = async (positionId) => {
  const response = await fetch(`/positions/${positionId}/candidates`);
  const data = await response.json();
  return data.data; // Array of candidates
};

// Update candidate stage
const updateStage = async (candidateId, positionId, newStage, notes) => {
  const response = await fetch(`/candidates/${candidateId}/stage`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      positionId,
      currentInterviewStep: newStage,
      notes
    })
  });
  return await response.json();
};
```

### Kanban Board Implementation
```javascript
// Group candidates by stage
const groupCandidatesByStage = (candidates) => {
  return candidates.reduce((groups, candidate) => {
    const stage = candidate.currentInterviewStep;
    if (!groups[stage]) groups[stage] = [];
    groups[stage].push(candidate);
    return groups;
  }, {});
};
```

## 📊 Performance Considerations

### Database Optimization
- **Selective Queries**: Only fetch required fields
- **Efficient Joins**: Use Prisma's include for related data
- **Indexing**: Leverage existing database indexes

### Caching Strategy
- **Response Caching**: Consider caching for frequently accessed data
- **Database Connection Pooling**: Reuse Prisma client connections

### Scalability
- **Pagination**: Ready for large candidate lists
- **Async Processing**: Non-blocking operations
- **Error Recovery**: Graceful handling of failures

## 🔒 Security Considerations

### Input Validation
- **Parameter Validation**: All inputs are validated
- **SQL Injection Prevention**: Using Prisma ORM
- **Type Safety**: TypeScript ensures type safety

### Access Control
- **Position Validation**: Ensures candidates belong to the position
- **Data Isolation**: Position-specific data access

## 🎯 Future Enhancements

### Planned Features
1. **Bulk Operations**: Move multiple candidates at once
2. **Stage History**: Track stage change history
3. **Automated Notifications**: Email alerts for stage changes
4. **Performance Metrics**: Stage transition analytics
5. **Custom Workflows**: Configurable interview processes

### API Extensions
- **Filtering**: Filter candidates by score, date, etc.
- **Sorting**: Sort by various criteria
- **Search**: Full-text search capabilities
- **Export**: Export pipeline data

## 📝 Conclusion

The Kanban pipeline endpoints provide a robust foundation for managing candidate recruitment workflows. The implementation follows best practices in terms of:

- **Clean Architecture**: Separation of concerns
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized database queries
- **Testing**: Thorough test coverage
- **Documentation**: Clear API documentation

These endpoints enable recruiters to efficiently manage candidate pipelines through a Kanban-style interface, improving the overall recruitment process efficiency.
