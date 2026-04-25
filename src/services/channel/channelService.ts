import { api } from "@/lib/api";
import { AxiosError } from "axios";

type ApiError = {
  message: string;
};

/** Inbox / channels UI row — mapped from GET /api/v1/channels `Data[]`. */
export interface ChannelConnection {
  id: string;
  channel: "whatsapp" | "email";
  name: string;
  identifier: string;
  status: "connected" | "disconnected" | "pending";
  connectedAt?: string;
}

export type CreateWhatsAppChannelPayload = {
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  accessToken: string;
};

export type CreateEmailChannelPayload = {
  email: string;
  password: string;
  provider: string;
  imapUseSsl: boolean;
  smtpUseSsl: boolean;
  imapServer?: string;
  imapPort?: number;
  smtpServer?: string;
  smtpPort?: number;
};

/** Body for PATCH /api/v1/channel/{channelId} — extend when the API contract is known. */
export type UpdateChannelPayload = Record<string, unknown>;

/** Best-effort parse of created channel id from common API shapes. */
export function extractChannelIdFromResponse(data: unknown): string | undefined {
  if (data == null || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  const candidates = [o.id, o.channelId, o.ChannelId, o.Id];
  for (const c of candidates) {
    if (typeof c === "string" || typeof c === "number") return String(c);
  }
  return undefined;
}

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

function readString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

/** Standard list envelope from GET /api/v1/channels. */
export function isChannelsEnvelopeFailed(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  if (typeof p.Succeeded === "boolean") return !p.Succeeded;
  if (typeof p.succeeded === "boolean") return !p.succeeded;
  return false;
}

export function readChannelsEnvelopeMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const p = payload as Record<string, unknown>;
  const m = p.Message ?? p.message;
  return typeof m === "string" && m.length > 0 ? m : undefined;
}

function extractChannelsDataArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const data = p.Data ?? p.data;
  if (Array.isArray(data)) return data;
  return [];
}

export function mapChannelApiRowToConnection(raw: unknown): ChannelConnection | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = readString(o, "Id", "id");
  if (!id) return null;

  const typeRaw = String(o.Type ?? o.type ?? "").toLowerCase();
  let channel: ChannelConnection["channel"] | null = null;
  if (typeRaw.includes("email")) channel = "email";
  else if (typeRaw.includes("whatsapp")) channel = "whatsapp";
  if (!channel) return null;

  const isActive = Boolean(o.IsActive ?? o.isActive);
  const status: ChannelConnection["status"] = isActive ? "connected" : "disconnected";

  const email = readString(o, "EmailAddress", "emailAddress");
  const phoneId = readString(o, "PhoneNumberId", "phoneNumberId");

  const identifier =
    channel === "email" ? email ?? "—" : phoneId ?? "—";

  const name =
    channel === "email"
      ? email?.split("@")[0]?.trim() || email || "Email"
      : "WhatsApp Business";

  const connectedAt = readString(o, "CreatedAt", "createdAt");

  return {
    id,
    channel,
    name,
    identifier,
    status,
    ...(connectedAt ? { connectedAt } : {}),
  };
}

export function parseChannelsResponsePayload(payload: unknown): ChannelConnection[] {
  const rows = extractChannelsDataArray(payload);
  return rows.map(mapChannelApiRowToConnection).filter((c): c is ChannelConnection => c != null);
}

export const getChannels = async () => {
  try {
    const response = await api.get("/api/v1/channels");
    return { data: response.data as unknown, error: null as null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

export const createWhatsAppChannel = async (
  payload: CreateWhatsAppChannelPayload
) => {
  try {
    const response = await api.post("/api/v1/channel/whatsapp", payload);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

export const createEmailChannel = async (payload: CreateEmailChannelPayload) => {
  try {
    const response = await api.post("/api/v1/channel/email", payload);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

export const deleteChannel = async (channelId: string) => {
  try {
    const response = await api.delete(`/api/v1/channel/${channelId}`);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};

export const updateChannel = async (
  channelId: string,
  payload: UpdateChannelPayload
) => {
  try {
    const response = await api.patch(`/api/v1/channel/${channelId}`, payload);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    return { data: null, error: toApiError(err) };
  }
};
