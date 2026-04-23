import { api } from "@/lib/api";
import type { Channel } from "@/components/inbox/ChannelBadge";
import type { Conversation, ConversationStatus } from "@/components/inbox/ConversationItem";
import { AxiosError } from "axios";

type ApiError = {
  message: string;
};

function toApiError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    return {
      message: err.response?.data?.Message || err.message,
    };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Unknown error occurred" };
}

function serializeParams(record: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value as string | number | boolean;
  }
  return out;
}

/** GET /api/v1/conversation — paginated list */
export type GetConversationQuery = {
  channelType?: string;
  status?: string;
  priority?: string;
  assignedToUserId?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  includeStatistics?: boolean;
};

/** GET /api/v1/conversations — list (no pagination in contract) */
export type GetConversationsQuery = {
  channelType?: string;
  status?: string;
  priority?: string;
  assignedToUserId?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
};

export const getConversationPage = async (query: GetConversationQuery = {}) => {
  try {
    const params = serializeParams({
      channelType: query.channelType,
      status: query.status,
      priority: query.priority,
      assignedToUserId: query.assignedToUserId,
      searchTerm: query.searchTerm,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 20,
      sortBy: query.sortBy ?? "LastMessageTime",
      sortOrder: query.sortOrder ?? "desc",
      includeStatistics: query.includeStatistics ?? false,
    });
    const response = await api.get("/api/v1/conversations", { params });
    return { data: response.data as unknown, error: null as null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

export const getConversations = async (query: GetConversationsQuery = {}) => {
  try {
    const params = serializeParams({
      channelType: query.channelType,
      status: query.status,
      priority: query.priority,
      assignedToUserId: query.assignedToUserId,
      searchTerm: query.searchTerm,
      sortBy: query.sortBy ?? "LastMessageTime",
      sortOrder: query.sortOrder ?? "desc",
    });
    const response = await api.get("/api/v1/conversations", { params });
    return { data: response.data as unknown, error: null as null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

export const getConversationById = async (conversationId: string) => {
  try {
    const response = await api.get(`/api/v1/conversations/${conversationId}`);
    return { data: response.data as unknown, error: null as null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

export const markConversationAsClosed = async (conversationId: string) => {
  try {
    const response = await api.post(`/api/v1/conversations/MarkAsClosed/${conversationId}`);
    return { data: response.data as unknown, error: null as null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

function readString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function readNestedObject(obj: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const v = obj[key];
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return undefined;
}

function normalizeChannel(raw: unknown): Channel {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("email") || s === "1") return "email";
  if (s.includes("whatsapp") || s.includes("whats") || s === "0") return "whatsapp";
  return "whatsapp";
}

function normalizeStatus(raw: unknown): ConversationStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "closed" || s === "close") return "closed";
  return "open";
}

function normalizePriority(raw: unknown): Conversation["priority"] {
  const s = String(raw ?? "").toLowerCase();
  if (s === "high" || s === "urgent") return "high";
  if (s === "medium" || s === "normal") return "medium";
  if (s === "low") return "low";
  return undefined;
}

function formatRelativeTimestamp(raw: unknown): string {
  if (raw == null || raw === "") return "—";
  if (typeof raw === "string") {
    const d = Date.parse(raw);
    if (!Number.isNaN(d)) {
      return formatDistanceShort(d);
    }
    return raw;
  }
  if (typeof raw === "number") {
    return formatDistanceShort(raw);
  }
  return "—";
}

function formatDistanceShort(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

/** Pull an array of conversation DTOs from common paginated / envelope shapes. */
export function extractConversationsArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const keys = ["items", "data", "conversations", "results", "Conversations", "Items"];
  for (const k of keys) {
    const v = p[k];
    if (Array.isArray(v)) return v;
  }
  const data = p.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).items;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

/** Map one API conversation object into inbox `Conversation` (best-effort for typical .NET / REST shapes). */
export function mapConversationDto(raw: unknown): Conversation | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const customer = readNestedObject(o, "customer") ?? readNestedObject(o, "Customer");

  const id =
    readString(o, "id", "conversationId", "ConversationId") ??
    (customer ? readString(customer, "id", "customerId", "CustomerId") : undefined);
  if (!id) return null;

  const customerName =
    readString(o, "customerName", "displayName", "title", "subject") ??
    (customer
      ? readString(customer, "fullName", "name", "displayName", "email")
      : undefined) ??
    "Unknown";

  const lastMessage =
    readString(o, "lastMessage", "lastMessagePreview", "preview", "LastMessagePreview") ?? "";

  const lastAt =
    o.LastMessageTime ??
    o.LastMessageTime ??
    o.lastMessageTime ??
    o.LastMessageTime ??
    o.updatedAt ??
    o.UpdatedAt;

  const channelRaw = o.channelType ?? o.ChannelType ?? o.channel ?? o.Channel;
  const statusRaw = o.status ?? o.Status ?? o.conversationStatus ?? o.ConversationStatus;

  const unread =
    typeof o.unreadCount === "number"
      ? o.unreadCount
      : typeof o.UnreadCount === "number"
        ? o.UnreadCount
        : Number(o.unreadCount ?? o.UnreadCount ?? 0) || 0;

  const avatar =
    readString(o, "customerAvatar", "avatarUrl", "profileImageUrl") ??
    (customer ? readString(customer, "avatarUrl", "profileImageUrl", "photoUrl") : undefined);

  const online = o.isOnline ?? o.IsOnline;
  const isOnline = typeof online === "boolean" ? online : undefined;

  return {
    id,
    customerName,
    customerAvatar: avatar,
    lastMessage,
    timestamp: formatRelativeTimestamp(lastAt),
    channel: normalizeChannel(channelRaw),
    unreadCount: unread,
    isOnline,
    priority: normalizePriority(o.priority ?? o.Priority),
    status: normalizeStatus(statusRaw),
  };
}
