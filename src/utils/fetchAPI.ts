import {
  getLocalStorageAccessToken,
  setLocalStorageAccessToken,
  getRefreshToken,
  setRefreshToken,
} from "./localStorage";

const baseURL =
  "https://t5gj8q0b96.execute-api.us-east-1.amazonaws.com/staging";

export const fetchAPI = async (url: string, options: RequestInit) => {
  const token = getLocalStorageAccessToken();

  const response = await fetch(`${baseURL}${url}`, {
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : null,
    },
    ...options,
  });

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    const result = await fetchRefreshAccessToken(refreshToken);

    setLocalStorageAccessToken(result.body.accessToken);
    setRefreshToken(result.body.refresh);

    return fetchAPI(url, options);
  }

  return response;
};

function fetchRefreshAccessToken(refreshToken: string) {
  return fetchAPI("/taxi/refreshToken", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}
