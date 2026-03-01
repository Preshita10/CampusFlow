# CampusFlow Production Upgrade Plan

## Implementation Phases

### Phase 1: Auth + RBAC + Roles + Departments ✅
- JWT authentication with refresh tokens
- Role-based access control (7 roles)
- Department/program membership
- User management

### Phase 2: Workflow Engine + Multi-step Approvals
- State machine for workflows
- Approval chains per request type
- Conditional routing
- Workflow rules in DB

### Phase 3: File Uploads + Document Verification
- MinIO integration
- Presigned URLs
- Document verification workflow

### Phase 4: Notifications + BullMQ + MailHog
- In-app notifications
- Email notifications
- Background job queue
- Daily digest emails

### Phase 5: SLA Policies + Escalation Worker
- SLA configuration
- Automated escalation
- SLA risk badges
- Metrics

### Phase 6: Event-Driven Architecture
- Event table
- Redis Streams
- Event consumer

### Phase 7: Analytics Warehouse + dbt
- Star schema
- dbt models
- Great Expectations
- Admin dashboard

### Phase 8: AI Extraction + Draft Reply
- Field extraction
- Reply drafting
- Template management

### Phase 9: RAG Similar Cases
- pgvector setup
- Embeddings service
- Similarity search

### Phase 10: Tamper-proof Audit Chain
- Hash chaining
- Verification endpoint

### Phase 11: Observability Stack
- Structured logging
- OpenTelemetry
- Prometheus + Grafana

### Phase 12: CI/CD + Terraform
- GitHub Actions
- Terraform for AWS
