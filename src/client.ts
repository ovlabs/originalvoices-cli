import { getApiKey, getBaseUrl } from "./config.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  requestId: string;
  data: T;
  error: string | null;
}

export interface ApiErrorResponse {
  requestId?: string;
  error: string;
  message: string;
  statusCode?: number;
}

// Ask
export interface AskOpenParams {
  audienceId?: string;
  audiencePrompt?: string;
  question?: string;
  questions?: string[];
  sampleSize?: "low" | "medium" | "high" | "very_high";
}

export interface AskOpenAnswer {
  answer: string;
  confidence: number;
}

export interface AskOpenData {
  answers: AskOpenAnswer[][];
}

export interface AskChoicesParams {
  audienceId?: string;
  audiencePrompt?: string;
  question: string;
  choices: string[];
  isMultipleChoice?: boolean;
  sampleSize?: "low" | "medium" | "high" | "very_high";
}

export interface AskChoicesData {
  choices: { choice: string; percentage: number }[];
}

export interface AskProjectParams {
  filter?: string;
  questions: string[];
}

export interface AskProjectData {
  answers: AskOpenAnswer[][];
  matchedTwins: number;
  totalTwins: number;
}

// Audiences
export interface Audience {
  id: string;
  title: string;
  prompt: string;
}

export interface CreateAudienceParams {
  title: string;
  prompt: string;
  projectId?: string;
}

// Projects
export interface Project {
  id: string;
  title: string;
  description: string | null;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class OVApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "OVApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function requireApiKey(): string {
  const key = getApiKey();
  if (!key) {
    throw new OVApiError(
      "missing_api_key",
      "No API key configured. Run `ov auth login` or set OV_API_KEY.",
      401
    );
  }
  return key;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const apiKey = requireApiKey();
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/v1${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    const err = json as ApiErrorResponse;
    throw new OVApiError(
      err.error || "unknown_error",
      err.message || `Request failed with status ${res.status}`,
      res.status
    );
  }

  return json as ApiResponse<T>;
}

// ─── API Methods ─────────────────────────────────────────────────────────────

// Ask
export function askOpen(params: AskOpenParams) {
  return request<AskOpenData>("POST", "/ask/open", params);
}

export function askChoices(params: AskChoicesParams) {
  return request<AskChoicesData>("POST", "/ask/choices", params);
}

export function askProject(projectId: string, params: AskProjectParams) {
  return request<AskProjectData>(
    "POST",
    `/ask/project/${projectId}`,
    params
  );
}

// Audiences
export function listAudiences() {
  return request<{ audiences: Audience[] }>("GET", "/audiences");
}

export function createAudience(params: CreateAudienceParams) {
  return request<{ id: string; title: string }>("POST", "/audiences", params);
}

export function updateAudienceTitle(id: string, title: string) {
  return request<{ id: string; title: string }>("PATCH", `/audiences/${id}`, {
    title,
  });
}

export function deleteAudience(id: string) {
  return request<{ success: boolean }>("DELETE", `/audiences/${id}`);
}

// Projects
export function listProjects() {
  return request<Project[]>("GET", "/projects");
}

// Health
export async function healthcheck(): Promise<boolean> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/v1/healthcheck`);
    return res.ok;
  } catch {
    return false;
  }
}
