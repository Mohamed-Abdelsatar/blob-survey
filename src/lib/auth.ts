import { cookies } from "next/headers";

function isValidPassword(value: string | undefined): boolean {
  if (!value) return false;
  return value === process.env.ADMIN_PASSWORD || value === process.env.DEMO_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidPassword(store.get("admin_token")?.value);
}

export async function getCurrentOwner(): Promise<string> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (token === process.env.DEMO_PASSWORD) return "demo";
  return "admin";
}
