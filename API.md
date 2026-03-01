# CampusFlow API Reference

Base URL: `http://localhost:3001`

All requests (except `/health`) require authentication headers:
- `x-user-id`: User ID (e.g., "1" for student, "2" for staff)
- `x-user-role`: User role (`STUDENT` or `STAFF`)

## Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "campusflow-backend"
}
```

---

### Get Current User
```http
GET /me
```

**Response:**
```json
{
  "id": "1",
  "name": "John Student",
  "email": "student@gmu.edu",
  "role": "STUDENT",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Create Request (STUDENT only)
```http
POST /requests
Content-Type: application/json
x-user-id: 1
x-user-role: STUDENT

{
  "title": "Request to Override Prerequisite",
  "description": "I would like to request permission..."
}
```

**Response:** Request object with AI-generated category and summary

---

### List Requests
```http
GET /requests?status=SUBMITTED&category=COURSE_OVERRIDE
x-user-id: 1
x-user-role: STUDENT
```

**Query Parameters:**
- `status` (optional): Filter by status
- `category` (optional): Filter by category

**Response:** Array of request objects

**Note:** STUDENT sees only their own requests. STAFF sees all requests.

---

### Get Request Details
```http
GET /requests/:id
x-user-id: 1
x-user-role: STUDENT
```

**Response:** Request object with comments and audit logs

---

### Update Request Status (STAFF only)
```http
PATCH /requests/:id/status
Content-Type: application/json
x-user-id: 2
x-user-role: STAFF

{
  "status": "IN_REVIEW"
}
```

**Valid Status Values:**
- `SUBMITTED`
- `IN_REVIEW`
- `NEEDS_INFO`
- `APPROVED`
- `REJECTED`

---

### Add Comment
```http
POST /requests/:id/comments
Content-Type: application/json
x-user-id: 1
x-user-role: STUDENT

{
  "message": "Thank you for reviewing my request."
}
```

**Response:** Comment object

**Note:** STUDENT can only comment on their own requests. STAFF can comment on any request.

---

### Get Metrics (STAFF only)
```http
GET /metrics
x-user-id: 2
x-user-role: STAFF
```

**Response:**
```json
{
  "totalRequests": 10,
  "byStatus": {
    "SUBMITTED": 3,
    "IN_REVIEW": 2,
    "APPROVED": 5
  },
  "byCategory": {
    "COURSE_OVERRIDE": 4,
    "ADD_DROP": 3,
    "GENERAL": 3
  },
  "avgResolutionHours": 24.5,
  "slaRiskCount": 1
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Missing or invalid auth headers
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request body
- `REQUEST_NOT_FOUND`: Request ID not found
- `USER_NOT_FOUND`: User ID not found

---

## cURL Examples

### Create Request
```bash
curl -X POST http://localhost:3001/requests \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-user-role: STUDENT" \
  -d '{
    "title": "Late Add Request",
    "description": "I need to add MATH 101..."
  }'
```

### List Requests
```bash
curl http://localhost:3001/requests \
  -H "x-user-id: 2" \
  -H "x-user-role: STAFF"
```

### Update Status
```bash
curl -X PATCH http://localhost:3001/requests/req-1/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: 2" \
  -H "x-user-role: STAFF" \
  -d '{"status": "APPROVED"}'
```

### Add Comment
```bash
curl -X POST http://localhost:3001/requests/req-1/comments \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-user-role: STUDENT" \
  -d '{"message": "Thank you!"}'
```

### Get Metrics
```bash
curl http://localhost:3001/metrics \
  -H "x-user-id: 2" \
  -H "x-user-role: STAFF"
```
