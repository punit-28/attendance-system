export async function api(url, opts = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, cache: "no-store", ...opts });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Something went wrong.");
  return data;
}
