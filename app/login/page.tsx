import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">
          Contas da Casa
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Entre com seu usuário e senha.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
