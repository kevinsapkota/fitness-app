"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const register = async () => {
    setError("");

    if (!fullName.trim()) {
      setError("Por favor insere o teu nome.");
      return;
    }
    if (!email.trim()) {
      setError("Por favor insere o teu email.");
      return;
    }
    if (password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (!error) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(error.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") register();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] text-gray-900 relative px-4">

      {/* LOGO */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/">
          <img src="/logo.png" alt="StreetViz" className="h-[84px] w-auto cursor-pointer" />
        </Link>
      </div>

      <div className="w-full max-w-md">

        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-3xl shadow-xl">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Bem-vindo à vizinhança </h1>
            <p className="text-gray-400 text-sm">Cria a tua conta e começa a contribuir para uma cidade melhor</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-2xl">✓</div>
              <p className="font-bold text-gray-900">Conta criada com sucesso!</p>
              <p className="text-gray-400 text-sm">A redirecionar para o login...</p>
            </div>
          ) : (
            <div className="space-y-4" onKeyDown={handleKeyDown}>

              {/* Nome */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Nome completo"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Password (mín. 6 caracteres)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>

              {/* Erro suave */}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Botão com loading */}
              <button
                onClick={register}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-bold text-sm shadow-md shadow-blue-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    A criar conta...
                  </>
                ) : (
                  "Criar conta grátis →"
                )}
              </button>

            </div>
          )}

          {!success && (
            <p className="text-center text-sm text-gray-400 mt-6">
              Já fazes parte da vizinhança?{" "}
              <a href="/login" className="text-blue-600 font-semibold hover:underline">
                Entrar
              </a>
            </p>
          )}

        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-6 mt-6 text-xs text-gray-400">
          <span>✔ Gratuito</span>
          <span>✔ Seguro</span>
          <span>✔ Sem spam</span>
        </div>

      </div>
    </div>
  );
}