# Promotion Parser API

## Endpoint

`POST /api/promotion-parser`

## Description

This endpoint accepts CSV files containing employee data and transforms them into a structured format suitable for promotion analysis and employee management systems.

## Request

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: CSV file uploaded with field name `file`

### CSV Format

The CSV file should contain the following columns:

| Column Name | Type | Description |
|------------|------|-------------|
| Employee_ID | string | Unique employee identifier (e.g., EMP-001) |
| name | string | Full name of the employee |
| Current_Role | string | Job title/role |
| Level | string | Career level (e.g., L3, L4, L5, L6) |
| Tenure_Months | number | Number of months with the company |
| Unassigned_Tasks_Picked | number | Count of unassigned tasks the employee volunteered for |
| Help_Request_Replies | number | Number of times employee helped colleagues |
| Cross_Team_Collaborations | number | Cross-team collaboration count |
| Critical_Incident_Ownership | number | Critical incidents owned |
| Peer_Review_Score | number | Average peer review score (0-5) |
| Architectural_Changes | number | Number of architectural contributions |
| Avg_Task_Complexity | number | Average task complexity (0-5) |
| Tasks_Completed_Count | number | Total tasks completed |
| Late_Night_Commits | number | Commits made after hours |
| Weekend_Activity_Log | number | Weekend work instances |
| Vacation_Days_Unused | number | Unused vacation days |
| Sentiment_Trend | number | Sentiment trend score (-1 to 1) |
| Raw_Achievement_Log | string | Pipe-separated list of achievements |
| skills | string | Pipe-separated list of skills (optional) |

### Example CSV

See `backend/src/data/sample-employees.csv` for a complete example.

## Response

### Success (200 OK)

```json
{
  "employees": [
    {
      "id": "1",
      "employeeCode": "EMP-001",
      "name": "Sarah Chen",
      "email": "sarah.c@luminus.ai",
      "role": "Tech Lead",
      "department": "Engineering",
      "team": "Platform",
      "managerId": null,
      "joinDate": "2021-03-15",
      "location": "San Francisco",
      "impactScore": 92,
      "burnoutRisk": 75,
      "collaborators": ["2", "3", "5", "7"]
    }
  ],
  "employeeDetails": {
    "1": {
      "id": "1",
      "employeeCode": "EMP-001",
      "name": "Sarah Chen",
      "email": "sarah.c@luminus.ai",
      "role": "Tech Lead",
      "department": "Engineering",
      "team": "Platform",
      "managerId": null,
      "managerName": null,
      "joinDate": "2021-03-15",
      "location": "San Francisco",
      "impactScore": 92,
      "burnoutRisk": 75,
      "stats": {
        "technical": 95,
        "leadership": 88,
        "empathy": 82,
        "velocity": 90,
        "creativity": 78,
        "reliability": 92
      },
      "projects": 12,
      "collaborators": 24,
      "tenure": "3.5 yrs",
      "recentAchievement": "Led successful migration to microservices architecture"
    }
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "CSV file is required"
}
```

```json
{
  "statusCode": 400,
  "message": "File must be a CSV"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to parse CSV: <error details>"
}
```

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/promotion-parser \
  -F "file=@sample-employees.csv"
```

### JavaScript (fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/promotion-parser', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data);
```

### Postman

1. Set method to POST
2. URL: `http://localhost:3000/api/promotion-parser`
3. Go to Body tab
4. Select "form-data"
5. Add key "file" with type "File"
6. Choose your CSV file
7. Send request

## Calculated Metrics

### Impact Score
The impact score (0-100) is calculated based on:
- Unassigned tasks picked (weight: 2)
- Help request replies (weight: 1.5)
- Cross-team collaborations (weight: 3)
- Critical incident ownership (weight: 5)
- Peer review score (weight: 10)
- Architectural changes (weight: 2.5)
- Task complexity (weight: 3)
- Tasks completed (weight: 1)

### Burnout Risk
The burnout risk (0-100) is calculated based on:
- Late night commits (weight: 4)
- Weekend activity (weight: 5)
- Unused vacation days (weight: 3)
- Negative sentiment trend (weight: 50)

### Stats Breakdown
- **Technical**: Based on task complexity and architectural changes
- **Leadership**: Based on cross-team collaboration and help replies
- **Empathy**: Based on sentiment trend and peer review scores
- **Velocity**: Based on tasks completed
- **Creativity**: Based on architectural changes and task complexity
- **Reliability**: Based on peer review scores

## Notes

- Employee IDs are auto-generated sequentially (1, 2, 3, ...)
- Email addresses are generated from names if not provided
- Locations are assigned from a pool: San Francisco, New York, Austin, Seattle, Boston
- Manager relationships are determined based on employee levels
- Collaborator lists are generated based on cross-team collaboration counts
