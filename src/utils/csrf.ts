const API_BASE_URL = import.meta.env.VITE_API_URL;

const getCookie = (name: string): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

export const getCsrfToken = async (): Promise<string | null> => {
  try {
    console.log("Getting CSRF token...");
    await fetch(`${API_BASE_URL.replace("/api", "")}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
    });

    const csrfToken = getCookie("XSRF-TOKEN");

    if (csrfToken) {
      console.log("CSRF token found:", csrfToken ? "Yes" : "No");
      return csrfToken;
    }

    console.log("No CSRF token found in cookies");
    return null;
  } catch (error) {
    console.error("CSRF token fetch failed:", error);
    return null;
  }
};

export const createAuthHeaders = async (): Promise<HeadersInit> => {
  const csrfToken = await getCsrfToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (csrfToken) {
    headers["X-XSRF-TOKEN"] = csrfToken;
  }

  console.log("Created session auth headers:", Object.keys(headers));
  return headers;
};

export const createFormDataHeaders = async (): Promise<HeadersInit> => {
  const csrfToken = await getCsrfToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (csrfToken) {
    headers["X-XSRF-TOKEN"] = csrfToken;
  }

  return headers;
};
