"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function RegisterPage() {

  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const register = async () => {

    if (!fullName.trim()) {
      alert("Por favor insere o teu nome");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error) {
      alert("Conta criada com sucesso!");
      router.push("/login");
    } else {
      alert(error.message);
    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 relative">

      {/* LOGO CLICK → HOME */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/">
          <img
            src="/logo.png"
            alt="StreetViz"
            className="h-[84px] w-auto cursor-pointer"
          />
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2">
          StreetViz
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Bem-vindo à vizinhança 👋  
          Cria a tua conta e começa a contribuir para uma cidade melhor
        </p>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Nome completo"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={register}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Criar conta
          </button>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">

          Já fazes parte da vizinhança?
          <a href="/login" className="text-blue-600 ml-1">
            Entrar
          </a>

        </p>

      </div>

    </div>

  );
}