# LTI Kanban Endpoints - Example Usage

## 🚀 Quick Start Guide

This guide demonstrates how to use the new Kanban-style endpoints for managing candidate pipelines.

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and the database is migrated
2. **Server Running**: Start the backend server on `http://localhost:3010`
3. **Sample Data**: Have some positions, candidates, and applications in the database

## 📋 Example Workflow

### Step 1: Get Available Interview Steps for a Position

First, let's see what interview steps are available for a position:

```bash
curl -X GET "http://localhost:3010/positions/1/interview-steps" \
  -H "Content-Type: application/json"
```

**Expected Response**:
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

### Step 2: View Candidates in Pipeline

Get all candidates currently in the recruitment pipeline for position 1:

```bash
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "currentInterviewStep": 1,
      "averageScore": 0,
      "applicationDate": "2024-01-15T10:30:00Z",
      "totalInterviews": 0
    },
    {
      "id": 2,
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "currentInterviewStep": 2,
      "averageScore": 85.5,
      "applicationDate": "2024-01-14T09:15:00Z",
      "totalInterviews": 2
    },
    {
      "id": 3,
      "fullName": "Bob Johnson",
      "email": "bob.johnson@example.com",
      "currentInterviewStep": 3,
      "averageScore": 92.0,
      "applicationDate": "2024-01-13T14:20:00Z",
      "totalInterviews": 3
    }
  ],
  "message": "Found 3 candidates for position 1"
}
```

### Step 3: Move Candidate to Next Stage

Move John Doe from Phone Screen (step 1) to Technical Interview (step 2):

```bash
curl -X PUT "http://localhost:3010/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "currentInterviewStep": 2,
    "notes": "Passed phone screen, moving to technical interview"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "currentInterviewStep": 2,
    "averageScore": 0,
    "applicationDate": "2024-01-15T10:30:00Z",
    "totalInterviews": 0,
    "positionTitle": "Software Engineer"
  },
  "message": "Candidate John Doe stage updated successfully"
}
```

### Step 4: Verify the Change

Check the updated pipeline to see the change:

```bash
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json"
```

John Doe should now appear in step 2 (Technical Interview).

## 🎯 Frontend Integration Example

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const KanbanBoard = ({ positionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [interviewSteps, setInterviewSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [positionId]);

  const loadData = async () => {
    try {
      // Load interview steps
      const stepsResponse = await fetch(`/positions/${positionId}/interview-steps`);
      const stepsData = await stepsResponse.json();
      setInterviewSteps(stepsData.data);

      // Load candidates
      const candidatesResponse = await fetch(`/positions/${positionId}/candidates`);
      const candidatesData = await candidatesResponse.json();
      setCandidates(candidatesData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveCandidate = async (candidateId, newStepId, notes = '') => {
    try {
      const response = await fetch(`/candidates/${candidateId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId,
          currentInterviewStep: newStepId,
          notes
        })
      });

      if (response.ok) {
        // Reload data to reflect changes
        await loadData();
      }
    } catch (error) {
      console.error('Error moving candidate:', error);
    }
  };

  const groupCandidatesByStage = () => {
    return candidates.reduce((groups, candidate) => {
      const stage = candidate.currentInterviewStep;
      if (!groups[stage]) groups[stage] = [];
      groups[stage].push(candidate);
      return groups;
    }, {});
  };

  if (loading) return <div>Loading...</div>;

  const groupedCandidates = groupCandidatesByStage();

  return (
    <div className="kanban-board">
      <h2>Recruitment Pipeline</h2>
      <div className="kanban-columns">
        {interviewSteps.map(step => (
          <div key={step.id} className="kanban-column">
            <h3>{step.name}</h3>
            <div className="candidates-list">
              {groupedCandidates[step.id]?.map(candidate => (
                <div key={candidate.id} className="candidate-card">
                  <h4>{candidate.fullName}</h4>
                  <p>{candidate.email}</p>
                  <p>Score: {candidate.averageScore}</p>
                  <p>Interviews: {candidate.totalInterviews}</p>
                  <div className="actions">
                    {step.orderIndex > 1 && (
                      <button onClick={() => moveCandidate(candidate.id, step.id - 1)}>
                        ← Previous
                      </button>
                    )}
                    {step.orderIndex < interviewSteps.length && (
                      <button onClick={() => moveCandidate(candidate.id, step.id + 1)}>
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
```

### JavaScript/HTML Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>LTI Kanban Board</title>
    <style>
        .kanban-board {
            display: flex;
            gap: 20px;
            padding: 20px;
        }
        .kanban-column {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            min-width: 250px;
        }
        .candidate-card {
            background: white;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .actions {
            margin-top: 10px;
        }
        button {
            margin: 2px;
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
            cursor: pointer;
        }
        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <h1>LTI Recruitment Pipeline</h1>
    <div id="kanban-board"></div>

    <script>
        const positionId = 1; // Change this to your position ID

        async function loadKanbanBoard() {
            try {
                // Load interview steps
                const stepsResponse = await fetch(`/positions/${positionId}/interview-steps`);
                const stepsData = await stepsResponse.json();
                const interviewSteps = stepsData.data;

                // Load candidates
                const candidatesResponse = await fetch(`/positions/${positionId}/candidates`);
                const candidatesData = await candidatesResponse.json();
                const candidates = candidatesData.data;

                // Group candidates by stage
                const groupedCandidates = candidates.reduce((groups, candidate) => {
                    const stage = candidate.currentInterviewStep;
                    if (!groups[stage]) groups[stage] = [];
                    groups[stage].push(candidate);
                    return groups;
                }, {});

                // Render the board
                renderKanbanBoard(interviewSteps, groupedCandidates);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function renderKanbanBoard(interviewSteps, groupedCandidates) {
            const board = document.getElementById('kanban-board');
            board.innerHTML = '';

            interviewSteps.forEach(step => {
                const column = document.createElement('div');
                column.className = 'kanban-column';
                
                column.innerHTML = `
                    <h3>${step.name}</h3>
                    <div class="candidates-list">
                        ${(groupedCandidates[step.id] || []).map(candidate => `
                            <div class="candidate-card">
                                <h4>${candidate.fullName}</h4>
                                <p>${candidate.email}</p>
                                <p>Score: ${candidate.averageScore}</p>
                                <p>Interviews: ${candidate.totalInterviews}</p>
                                <div class="actions">
                                    ${step.orderIndex > 1 ? 
                                        `<button onclick="moveCandidate(${candidate.id}, ${step.id - 1})">← Previous</button>` : ''
                                    }
                                    ${step.orderIndex < interviewSteps.length ? 
                                        `<button onclick="moveCandidate(${candidate.id}, ${step.id + 1})">Next →</button>` : ''
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                board.appendChild(column);
            });
        }

        async function moveCandidate(candidateId, newStepId) {
            try {
                const response = await fetch(`/candidates/${candidateId}/stage`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        positionId,
                        currentInterviewStep: newStepId,
                        notes: `Moved to step ${newStepId}`
                    })
                });

                if (response.ok) {
                    // Reload the board
                    await loadKanbanBoard();
                } else {
                    console.error('Failed to move candidate');
                }
            } catch (error) {
                console.error('Error moving candidate:', error);
            }
        }

        // Load the board when page loads
        loadKanbanBoard();
    </script>
</body>
</html>
```

## 🔧 Error Handling Examples

### Handling Validation Errors

```javascript
async function updateCandidateStage(candidateId, positionId, newStepId) {
    try {
        const response = await fetch(`/candidates/${candidateId}/stage`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                positionId,
                currentInterviewStep: newStepId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 400) {
                console.error('Validation error:', data.errors);
                // Handle validation errors
                return { success: false, errors: data.errors };
            } else if (response.status === 404) {
                console.error('Not found:', data.message);
                // Handle not found errors
                return { success: false, error: data.message };
            }
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error('Network error:', error);
        return { success: false, error: 'Network error occurred' };
    }
}
```

## 📊 Data Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│                 │    │                  │    │                 │
│ 1. Load Steps   │───▶│ GET /positions/  │───▶│ InterviewSteps  │
│                 │    │ {id}/interview-  │    │                 │
│                 │    │ steps            │    │                 │
│                 │    │                  │    │                 │
│ 2. Load         │───▶│ GET /positions/  │───▶│ Applications    │
│ Candidates      │    │ {id}/candidates  │    │ + Candidates    │
│                 │    │                  │    │ + Interviews    │
│                 │    │                  │    │                 │
│ 3. Move         │───▶│ PUT /candidates/ │───▶│ Update          │
│ Candidate       │    │ {id}/stage       │    │ Application     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show loading indicators during API calls
3. **Validation**: Validate data before sending to API
4. **Optimistic Updates**: Update UI immediately, then sync with server
5. **Caching**: Cache interview steps as they rarely change
6. **Real-time Updates**: Consider WebSocket for real-time collaboration

## 🚀 Next Steps

1. **Test the endpoints** with your existing data
2. **Integrate with your frontend** using the provided examples
3. **Customize the UI** to match your design requirements
4. **Add additional features** like filtering and sorting
5. **Implement real-time updates** for team collaboration
