import { api } from "@/lib/api";
import { AxiosError } from "axios";

type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

type ApiError = {
  message: string;
};

export const signupService = async ({
  fullName,
  email,
  password,
}: SignupPayload) => {
  try {
    const response = await api.post("/api/v1/user/create", {
      fullName,
      email,
      password,
    });

    console.log("Signup response:", response.status, response.data);

    return { data: response.data, error: null };
  } catch (err: unknown) {
  

    let error: ApiError;

    if (err instanceof AxiosError) {
      // Use the backend message if it exists
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