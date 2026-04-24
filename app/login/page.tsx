"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {

  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const login = async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) router.push("/dashboard");
    else alert(error.message);

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
          Entra e ajuda a melhorar a tua cidade
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </button>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">

          Ainda não fazes parte da vizinhança?
          <a href="/register" className="text-blue-600 ml-1">
            Criar conta
          </a>

        </p>

      </div>

    </div>
  );
}