# Quick Start Guide - Promotion Parser API

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm run start:dev
```

The server will start on `http://localhost:3000`

### 2. Test the API

#### Option A: Using the Test Script
```bash
node scripts/test-promotion-parser.js
```

#### Option B: Using cURL
```bash
curl -X POST http://localhost:3000/api/promotion-parser \
  -F "file=@src/data/sample-employees.csv"
```

#### Option C: Using Postman
1. Create a new POST request
2. URL: `http://localhost:3000/api/promotion-parser`
3. Go to Body → form-data
4. Add key: `file` (type: File)
5. Select `backend/src/data/sample-employees.csv`
6. Click Send

## 📄 CSV Format

Your CSV file should have these columns:

```csv
Employee_ID,name,Current_Role,Level,Tenure_Months,Unassigned_Tasks_Picked,Help_Request_Replies,Cross_Team_Collaborations,Critical_Incident_Ownership,Peer_Review_Score,Architectural_Changes,Avg_Task_Complexity,Tasks_Completed_Count,Late_Night_Commits,Weekend_Activity_Log,Vacation_Days_Unused,Sentiment_Trend,Raw_Achievement_Log,skills
```

See `backend/src/data/sample-employees.csv` for a complete example.

## ✅ Expected Response

The API returns a JSON object with two main parts:

1. **employees**: Array of simplified employee objects
2. **employeeDetails**: Object with detailed stats for each employee

Example:
```json
{
  "employees": [...],
  "employeeDetails": {...}
}
```

## 📦 What Gets Calculated?

The API automatically calculates:

- ✨ **Impact Score** (0-100): Based on leadership signals and contributions
- 🔥 **Burnout Risk** (0-100): Based on work-life balance indicators  
- 📊 **Six Stats Dimensions**: Technical, Leadership, Empathy, Velocity, Creativity, Reliability
- 🤝 **Collaborator Networks**: Auto-generated based on cross-team work
- 👤 **Manager Relationships**: Determined from employee levels
- 📧 **Email Addresses**: Generated from names
- 📍 **Location Assignment**: From a pool of cities
- 🏢 **Department/Team**: Based on role analysis

## 🎯 Use Cases

- Import employee data for promotion analysis
- Bulk process performance reviews
- Generate employee insights from CSV exports
- Transform HR data into structured format
- Create employee dashboards from CSV files

## 📚 Documentation

- Full API docs: `backend/PROMOTION_PARSER_API.md`
- Implementation details: `backend/IMPLEMENTATION_SUMMARY.md`

## ❓ Troubleshooting

### "Cannot connect to server"
Make sure the backend is running: `npm run start:dev`

### "CSV file is required"
Ensure you're sending the file with field name `file`

### "File must be a CSV"
Check that your file has a `.csv` extension

### "Failed to parse CSV"
Verify your CSV has all required columns and proper formatting

## 🔧 Development

The implementation uses:
- **NestJS** - Backend framework
- **csv-parser** - CSV parsing
- **multer** - File upload handling
- **TypeScript** - Type safety

All files are in `backend/src/employees/`:
- `employees.controller.ts` - API endpoint
- `promotion-parser.service.ts` - CSV parsing logic
- `domain/entities/promotion.interface.ts` - Type definitions
