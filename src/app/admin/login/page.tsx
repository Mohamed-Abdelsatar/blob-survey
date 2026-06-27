import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authed = await isAuthenticated();
  if (authed) redirect("/admin");
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    if (password === process.env.ADMIN_PASSWORD) {
      const store = await cookies();
      store.set("admin_token", password, { httpOnly: true, path: "/" });
      redirect("/admin");
    } else {
      redirect("/admin/login?error=1");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        action={login}
        className="bg-white rounded-2xl p-8 shadow-lg w-80 flex flex-col gap-4"
      >
        <div className="text-4xl text-center">🔐</div>
        <h1 className="text-xl font-bold text-center">Admin Access</h1>
        {error && (
          <p className="text-red-500 text-sm text-center">Wrong password</p>
        )}
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-400"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
