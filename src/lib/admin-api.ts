export async function adminFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
