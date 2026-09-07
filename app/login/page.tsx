import { Wallet } from "lucide-react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#1e3a8a,_#0f172a_65%)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30">
            <Wallet size={24} />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">
            Contas da Casa
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Entre com seu usuário e senha.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
