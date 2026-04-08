import { api } from "@/lib/api"; // adjust path if needed
import { AxiosError } from "axios";

type SigninPayload = {
  email: string;
  password: string;
};

type ApiError = {
  message: string;
};

export const signinService = async ({ email, password }: SigninPayload) => {
  try {
    const body = new URLSearchParams();
    body.set("email", email);
    body.set("password", password);

    const response = await api.post("/api/v1/auth/signin", body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log("Signin response:", response.status, response.data);

    return {
      data: response.data,
      error: null,
    };
  } catch (err: unknown) {
    console.error("Signin error:", err);

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

    return {
      data: null,
      error,
    };
  }
};