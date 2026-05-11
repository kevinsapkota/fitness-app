"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {

  const router = useRouter();

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-gray-900 relative">

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

      {/* HERO */}
      <section className="text-center py-24 px-6">

        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          StreetViz
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Uma nova forma de colaborar com a tua cidade.
          Vê, partilha e melhora a tua vizinhança com informação em tempo real.
        </p>

        <div className="flex flex-wrap justify-center gap-4">

          <button
            onClick={() => router.push("/register")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Criar conta
          </button>

          <button
            onClick={() => router.push("/login")}
            className="bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition"
          >
            Entrar
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition"
          >
            Ver o mapa
          </button>

        </div>

      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-6 bg-white">

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Como funciona
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">

          <div className="text-center">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              1. Explora o mapa
            </h3>
            <p className="text-gray-600">
              Visualiza ocorrências e informações da tua cidade num mapa interativo.
            </p>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              2. Contribui
            </h3>
            <p className="text-gray-600">
              Partilha situações, melhorias ou informações úteis para a comunidade.
            </p>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              3. Melhora a cidade
            </h3>
            <p className="text-gray-600">
              A informação ajuda cidadãos e municípios a tomar melhores decisões.
            </p>
          </div>

        </div>

      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 px-6">

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Porquê usar StreetViz?
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-gray-900 mb-2">
              Comunidade ativa
            </h3>
            <p className="text-gray-600">
              Liga cidadãos que querem melhorar o espaço público.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-gray-900 mb-2">
              Informação visual
            </h3>
            <p className="text-gray-600">
              Um mapa claro com dados úteis sobre o que acontece na cidade.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-gray-900 mb-2">
              Impacto real
            </h3>
            <p className="text-gray-600">
              Ajuda municípios e cidadãos a resolver problemas mais rápido.
            </p>
          </div>

        </div>

      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 text-center bg-blue-600 text-white">

        <h2 className="text-3xl font-bold mb-4">
          Junta-te à vizinhança
        </h2>

        <p className="mb-8">
          Começa hoje a contribuir para uma cidade mais inteligente.
        </p>

        <div className="flex justify-center gap-4">

          <button
            onClick={() => router.push("/register")}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Criar conta
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition"
          >
            Ver o mapa
          </button>

        </div>

      </section>

    </div>

  );
}