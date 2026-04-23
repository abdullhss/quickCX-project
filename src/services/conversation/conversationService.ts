import { api } from "@/lib/api";
import type { Channel } from "@/components/inbox/ChannelBadge";
import type { Conversation, ConversationStatus } from "@/components/inbox/ConversationItem";
import type { Message } from "@/components/inbox/MessageBubble";
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

function buildFormData(record: Record<string, unknown>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === "") continue;
    formData.append(key, String(value));
  }
  return formData;
}

function formDataToParams(formData: FormData): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      params.append(key, value);
    }
  }
  return params;
}

/** GET /api/v2/conversations — list */
export type GetConversationsQuery = {
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

export const getConversations = async (query: GetConversationsQuery = {}) => {
  try {
    const formData = buildFormData({
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
    const params = formDataToParams(formData);
    const response = await api.get("/api/v2/conversations", { params });
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
  if (s === "unknown" || s === "" || s === "none") return undefined;
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

/** Pull an array of conversation DTOs from common paginated / envelope shapes (incl. .NET `Data`). */
export function extractConversationsArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;

  const dataUpper = p.Data;
  if (Array.isArray(dataUpper)) return dataUpper;

  const dataLower = p.data;
  if (Array.isArray(dataLower)) return dataLower;

  const keys = ["items", "conversations", "results", "Conversations", "Items"];
  for (const k of keys) {
    const v = p[k];
    if (Array.isArray(v)) return v;
  }
  if (dataLower && typeof dataLower === "object" && !Array.isArray(dataLower)) {
    const inner = (dataLower as Record<string, unknown>).items;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

/** True when payload is the standard API envelope and the call did not succeed. */
export function isConversationsEnvelopeFailed(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  if (typeof p.Succeeded === "boolean") return !p.Succeeded;
  if (typeof p.succeeded === "boolean") return !p.succeeded;
  return false;
}

export function readApiEnvelopeMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const p = payload as Record<string, unknown>;
  const m = p.Message ?? p.message;
  return typeof m === "string" && m.length > 0 ? m : undefined;
}

function readRecentMessagesLatestContent(o: Record<string, unknown>): string | undefined {
  const raw = o.RecentMessages ?? o.recentMessages;
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  let bestRow: Record<string, unknown> | undefined;
  let bestTime = -Infinity;

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const sent = readString(row, "SentAt", "sentAt", "CreatedAt", "createdAt");
    const t = sent ? Date.parse(sent) : NaN;
    if (!Number.isNaN(t) && t >= bestTime) {
      bestTime = t;
      bestRow = row;
    }
  }

  const pick = bestRow ?? (raw[raw.length - 1] as Record<string, unknown>);
  return readString(pick, "Content", "content", "body", "Body", "text", "Text");
}

function stripHtmlToPlain(html: string, maxLen: number): string {
  const noTags = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const text = noTags.replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
}

const EMAIL_MESSAGE_BODY_MAX_LEN = 500_000;

/** Strip common marketing-email noise (raw CSS) then HTML → readable plain text for the chat body. */
function normalizeEmailBodyForDisplay(raw: string): string {
  const withoutImports = raw.replace(/@import\s+url\([^)]*\)\s*;?/gi, " ");
  const withoutFontFace = withoutImports.replace(/@font-face\s*\{[\s\S]*?\}/gi, " ");
  return stripHtmlToPlain(withoutFontFace, EMAIL_MESSAGE_BODY_MAX_LEN);
}

function unwrapConversationDetailRecord(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const d = p.Data ?? p.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
  if (Array.isArray(p.RecentMessages) || Array.isArray(p.recentMessages)) return p;
  return null;
}

function formatMessageSentAt(raw: string | undefined): string {
  if (!raw?.trim()) return "—";
  const d = Date.parse(raw);
  if (Number.isNaN(d)) return raw;
  const day = new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const time = new Date(d).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

function recentMessageRowTime(row: unknown): number {
  if (!row || typeof row !== "object") return 0;
  const s = readString(row as Record<string, unknown>, "SentAt", "sentAt", "CreatedAt", "createdAt");
  const t = s ? Date.parse(s) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

/** Map one `RecentMessages[]` item from GET conversation-by-id into inbox `Message`. */
export function mapRecentMessageDto(raw: unknown): Message | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = readString(row, "Id", "id");
  if (!id) return null;

  const contentRaw = readString(row, "Content", "content", "body", "Body") ?? "";
  const content = normalizeEmailBodyForDisplay(contentRaw);
  const sentAt = readString(row, "SentAt", "sentAt", "CreatedAt", "createdAt");
  const type = readString(row, "Type", "type");
  const explicit = row.IsFromCustomer ?? row.isFromCustomer;
  let isFromCustomer = true;
  if (typeof explicit === "boolean") {
    isFromCustomer = explicit;
  } else if (type?.toLowerCase() === "outgoing") {
    isFromCustomer = false;
  } else if (type?.toLowerCase() === "incoming") {
    isFromCustomer = true;
  }

  return {
    id,
    content: content.length > 0 ? content : "(Empty message)",
    timestamp: formatMessageSentAt(sentAt),
    isFromCustomer,
  };
}

/** All messages in `Data.RecentMessages` from GET `/api/v1/conversations/{id}`, oldest first. */
export function mapDetailPayloadToMessages(payload: unknown): Message[] {
  const detail = unwrapConversationDetailRecord(payload);
  if (!detail) return [];
  const raw = detail.RecentMessages ?? detail.recentMessages;
  if (!Array.isArray(raw)) return [];

  const sorted = [...raw].sort((a, b) => recentMessageRowTime(a) - recentMessageRowTime(b));
  return sorted.map(mapRecentMessageDto).filter((m): m is Message => m != null);
}

/** Map one API conversation object into inbox `Conversation` (best-effort for typical .NET / REST shapes). */
export function mapConversationDto(raw: unknown): Conversation | null {
  if (!raw || typeof raw !== "object") return null;
  let o = raw as Record<string, unknown>;

  const wrapped = o.Data ?? o.data;
  if (
    wrapped &&
    typeof wrapped === "object" &&
    !Array.isArray(wrapped) &&
    readString(wrapped as Record<string, unknown>, "ConversationId", "conversationId", "Id", "id")
  ) {
    o = wrapped as Record<string, unknown>;
  }

  const customer = readNestedObject(o, "customer") ?? readNestedObject(o, "Customer");

  const id =
    readString(o, "id", "Id", "conversationId", "ConversationId") ??
    (customer ? readString(customer, "customerId", "CustomerId") : undefined);
  if (!id) return null;

  const channelRaw = o.channelType ?? o.ChannelType ?? o.channel ?? o.Channel;

  const lastMessageRaw =
    readString(
      o,
      "lastMessage",
      "LastMessage",
      "lastMessagePreview",
      "preview",
      "LastMessagePreview"
    ) ??
    readRecentMessagesLatestContent(o) ??
    "";

  const lastMessage = lastMessageRaw ? stripHtmlToPlain(lastMessageRaw, 180) : "";

  const customerName =
    (customer
      ? readString(customer, "Name", "name", "fullName", "displayName", "email")
      : undefined) ??
    readString(
      o,
      "customerName",
      "CustomerName",
      "Subject",
      "subject",
      "displayName",
      "title"
    ) ??
    (lastMessage
      ? lastMessage.length > 52
        ? `${lastMessage.slice(0, 51).trimEnd()}…`
        : lastMessage
      : undefined) ??
    (normalizeChannel(channelRaw) === "email" ? "Email" : "WhatsApp");

  const lastAt =
    o.LastMessageAt ??
    o.lastMessageAt ??
    o.LastMessageTime ??
    o.lastMessageTime ??
    o.updatedAt ??
    o.UpdatedAt;

  const statusRaw = o.status ?? o.Status ?? o.conversationStatus ?? o.ConversationStatus;

  const unread =
    typeof o.unreadCount === "number"
      ? o.unreadCount
      : typeof o.UnreadCount === "number"
        ? o.UnreadCount
        : Number(o.unreadCount ?? o.UnreadCount ?? 0) || 0;

  const avatar =
    readString(o, "customerAvatar", "avatarUrl", "profileImageUrl") ??
    (customer
      ? readString(customer, "AvatarUrl", "avatarUrl", "profileImageUrl", "photoUrl")
      : undefined);

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
