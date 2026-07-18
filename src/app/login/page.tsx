import { login, signup } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};
export default async function LoginPage(props: Readonly<LoginPageProps>) {
  const { error } = await props.searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-300">
      <form className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 shadow-sm">
        <span className="text-lg font-bold tracking-tight text-black">
          Recon<span className="text-emerald-400">IQ</span>
        </span>

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label className="text-sm font-medium text-gray-900">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div className="flex gap-2">
          <button
            formAction={login}
            className="flex-1 rounded bg-black py-2 text-sm text-white"
          >
            Log in
          </button>
          <button
            formAction={signup}
            className="flex-1 rounded border py-2 text-sm text-gray-900"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
