import { api } from "@/lib/api";
import { AxiosError } from "axios";
type ApiError = {
  message: string;
};

// Organization creation
type CreateOrganizationPayload = {
  name: string;
  creatorUserId: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export const createOrganizationService = async (payload: CreateOrganizationPayload) => {
  try {
    const response = await api.post("/api/v1/organization", payload);
    console.log("Create organization response:", response.status, response.data);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    let error: ApiError;

    if (err instanceof AxiosError) {
      error = {
        message: err.response?.data?.Message || err.message,
      };
    } else if (err instanceof Error) {
      error = { message: err.message };
    } else {
      error = { message: "Unknown error occurred" };
    }

    return { data: null, error };
  }
};

// Add user to role (JSON body)
type AddUserToRolePayload = {
  roleName: string;
};

export const addUserToRoleService = async ({ roleName }: AddUserToRolePayload) => {
  try {
    const response = await api.post("/api/v1/role/addusertorole", {
      RoleName: roleName,
    });

    console.log("Add user to role response:", response.status, response.data);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    let error: ApiError;

    if (err instanceof AxiosError) {
      error = {
        message: err.response?.data?.Message || err.message,
      };
    } else if (err instanceof Error) {
      error = { message: err.message };
    } else {
      error = { message: "Unknown error occurred" };
    }

    return { data: null, error };
  }
};

// Set organization size
type OrganizationSizePayload = {
  size: number;
};

export const setOrganizationSizeService = async ({ size }: OrganizationSizePayload) => {
  try {
    const response = await api.put("/api/v1/organization/size", { size });
    console.log("Set organization size response:", response.status, response.data);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    let error: ApiError;

    if (err instanceof AxiosError) {
      error = {
        message: err.response?.data?.Message || err.message,
      };
    } else if (err instanceof Error) {
      error = { message: err.message };
    } else {
      error = { message: "Unknown error occurred" };
    }

    return { data: null, error };
  }
};