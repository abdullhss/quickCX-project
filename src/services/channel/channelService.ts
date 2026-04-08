import { api } from "@/lib/api";
import { AxiosError } from "axios";

type ApiError = {
  message: string;
};

export type CreateWhatsAppChannelPayload = {
  type: number;
  name: string;
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  accessToken: string;
};

export type CreateEmailChannelPayload = {
  email: string;
  password: string;
  provider: string;
  imapServer: string;
  imapPort: number;
  smtpServer: string;
  smtpPort: number;
  imapUseSsl: boolean;
  smtpUseSsl: boolean;
};

/** Body for PATCH /api/v1/channel/{channelId} — extend when the API contract is known. */
export type UpdateChannelPayload = Record<string, unknown>;

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
