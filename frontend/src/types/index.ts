export enum UserRole {
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
}

export enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  NEEDS_INFO = 'NEEDS_INFO',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  category: string | null;
  aiSummary: string | null;
  createdById: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  createdBy: User;
  assignedTo: User | null;
  comments?: Comment[];
  auditLogs?: AuditLog[];
}

export interface Comment {
  id: string;
  requestId: string;
  authorId: string;
  message: string;
  createdAt: string;
  author: User;
}

export interface AuditLog {
  id: string;
  requestId: string;
  actorId: string;
  action: string;
  meta: any;
  createdAt: string;
  actor: User;
}

export interface Metrics {
  totalRequests: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  avgResolutionHours: number;
  slaRiskCount: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  meta: Record<string, unknown>;
  createdAt: string;
  actor: User;
  request: { id: string; title: string; status: string } | null;
}
