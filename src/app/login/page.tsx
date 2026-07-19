import { AuthFields } from "@/components/AuthFields";
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

        <AuthFields error={error} login={login} signup={signup} />
      </form>
    </div>
  );
}
