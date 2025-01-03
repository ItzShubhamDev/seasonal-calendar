export const fetch = (url: string, options?: RequestInit) => {
    const headers = {
        ...options?.headers,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
    options = { ...options, headers };
    return window.fetch(url, options);
};
