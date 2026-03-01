import { Role } from "@prisma/client";

export type { Role };

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  organizationId: string;
  departmentId?: string | null;
}

export interface MoodLogEntry {
  id: string;
  score: number;
  note?: string | null;
  loggedAt: string;
}

export interface ChatMessageEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  threadId?: string | null;
}

export interface ChatThreadEntry {
  id: string;
  title: string;
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ResourceEntry {
  id: string;
  title: string;
  description: string;
  url?: string | null;
  type: "article" | "video" | "tip";
  tags: string[];
}

export interface DepartmentSummary {
  id: string;
  name: string;
  employeeCount: number;
  averageScore: number | null;
  participationRate: number | null;
  isBlurred: boolean;
}
