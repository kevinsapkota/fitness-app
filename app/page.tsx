"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-gray-900 relative overflow-x-hidden font-sans">

      {/* ───── NAV ───── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-2.5 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <Link href="/">
          <img src="/logo.png" alt="StreetViz" className="h-[72px] w-auto cursor-pointer" />
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-500 hover:text-gray-900 transition font-medium hidden sm:block"
          >
            Entrar
          </button>

          <button
            onClick={() => router.push("/register")}
            className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-semibold shadow-sm"
          >
            Criar conta
          </button>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative pt-48 pb-12 px-6 text-center">

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-100 opacity-50 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Dados em tempo real · Gratuito · Feito por cidadãos
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight">
          Se ninguém reportar,<br />
          <span className="text-blue-600">nada muda.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto mb-3 leading-relaxed font-light">
          Problemas ignorados começam na rua. Ajuda a tornar a tua cidade mais segura — em segundos.
        </p>

        <p className="text-sm text-gray-400 mb-10">
          Começa em menos de 10 segundos. Sem complicações.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm mx-auto sm:max-w-none">
          <button
            onClick={() => router.push("/register")}
            className="w-full sm:w-auto bg-blue-600 text-white px-9 py-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all font-bold text-base shadow-lg shadow-blue-200 hover:-translate-y-0.5 duration-300"
          >
            Criar conta grátis →
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto bg-white/70 backdrop-blur-xl border border-gray-200 text-gray-700 px-9 py-4 rounded-2xl hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all duration-300 font-semibold text-base shadow-sm"
          >
            Ver o mapa
          </button>
        </div>

        <p className="mt-5 text-sm text-gray-400 sm:hidden">
          Já tens conta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 font-semibold"
          >
            Entrar
          </button>
        </p>
      </section>

      {/* ───── MINI DASHBOARD PREVIEW ───── */}
<section className="px-6 pb-14 -mt-2">

  <div className="max-w-[340px] sm:max-w-[420px] md:max-w-[500px] mx-auto">

    <div
      className="
        relative
        rounded-[18px]
        overflow-hidden
        border border-white/80
        bg-white
        shadow-[0_16px_50px_-12px_rgba(59,130,246,0.16)]
      "
    >

      {/* browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">

        <span className="w-2 h-2 rounded-full bg-red-400/80" />
        <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
        <span className="w-2 h-2 rounded-full bg-green-400/80" />

        <div className="flex-1 mx-2">
          <div
            className="
              bg-white
              border border-gray-200
              rounded-md
              px-2 py-1
              text-[9px] sm:text-[10px]
              text-gray-400
              font-medium
              text-center
            "
          >
            streetviz.app/dashboard
          </div>
        </div>
      </div>

      {/* screenshot */}
      <img
        src="/dashboard-preview.jpg"
        alt="StreetViz Dashboard"
        className="
          w-full
          h-auto
          block
        "
      />

    </div>
  </div>
</section>

      {/* ───── REPORTADO RECENTEMENTE ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">

          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-5 text-center">
            Reportado recentemente
          </p>

          <div className="space-y-3">

            {[
              {
                tag: "Médio",
                tagColor: "text-orange-600 bg-orange-50 border-orange-100",
                dot: "bg-orange-400",
                title: "Muro em pedaços",
                desc: "Muro com planas a sair, ao lado de zona de construção de prédio.",
                local: "Rua Nova de Santa Cruz",
                votos: "0 confirmações",
              },

              {
                tag: "Baixo",
                tagColor: "text-yellow-700 bg-yellow-50 border-yellow-100",
                dot: "bg-yellow-400",
                title: "Raízes a destruir o passeio",
                desc: "Raízes de árvores a tirar tijolos do passeio — risco de queda.",
                local: "Avenida João Paulo II",
                votos: "1 confirmação",
              },
            ].map((item, i) => (

              <div
                key={i}
                className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-4 flex items-start gap-4 hover:shadow-md hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 cursor-default"
              >

                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.title}
                    </p>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs leading-relaxed mb-1.5">
                    {item.desc}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span>{item.local}</span>
                    <span>·</span>
                    <span>{item.votos}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              Ver todos no mapa →
            </button>
          </div>
        </div>
      </section>

      {/* ───── MAPA REAL ───── */}
      <section className="px-6 pb-20">

        <div className="max-w-4xl mx-auto">

          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            O mapa da tua cidade
          </h2>

          <p className="text-gray-400 text-sm text-center mb-8">
            Todos os problemas, num só lugar.
          </p>

          <div
            onClick={() => router.push("/dashboard")}
            className="rounded-3xl overflow-hidden border border-gray-200 shadow-xl aspect-[16/7] relative cursor-pointer group hover:scale-[1.01] transition-transform duration-500"
          >

            <img
              src="/map-preview.jpg"
              alt="Mapa StreetViz"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2 text-gray-700 font-semibold text-sm">
                Abrir mapa interativo
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ───── COMO FUNCIONA ───── */}
      <section className="py-20 px-6 bg-white">

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Como funciona
        </h2>

        <p className="text-center text-gray-400 mb-14 text-sm">
          Simples. Direto. Eficaz.
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">

          {[
            {
              n: "1",
              title: "Explora o mapa",
              desc: "Vê todos os problemas reportados perto de ti, em tempo real.",
            },

            {
              n: "2",
              title: "Reporta em segundos",
              desc: "Adiciona uma ocorrência com localização, foto e descrição.",
            },

            {
              n: "3",
              title: "Problemas resolvidos mais rápido",
              desc: "A câmara municipal recebe alertas e resolve com base na prioridade da comunidade.",
            },
          ].map((step) => (

            <div
              key={step.n}
              className="relative pl-7 border-l-2 border-blue-100 hover:border-blue-400 transition-colors duration-300 group"
            >

              <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {step.n}
              </span>

              <h3 className="font-bold text-gray-900 mb-2 mt-0.5">
                {step.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed">
                {step.desc}
              </p>

            </div>
          ))}
        </div>
      </section>

      {/* ───── CTA FINAL ───── */}
      <section className="py-24 px-6 bg-blue-600 text-white text-center relative overflow-hidden">

        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">
          Junta-te à vizinhança
        </h2>

        <p className="text-blue-100 mb-2 text-lg">
          A tua cidade precisa de ti. Começa hoje.
        </p>

        <p className="text-blue-200 text-sm mb-10">
          Sem complicações. Apenas entra e explora.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm mx-auto sm:max-w-none">

          <button
            onClick={() => router.push("/register")}
            className="w-full sm:w-auto bg-white text-blue-600 px-9 py-4 rounded-2xl font-bold hover:bg-gray-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-lg text-base"
          >
            Criar conta grátis →
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto bg-blue-800 text-white px-9 py-4 rounded-2xl font-semibold hover:bg-blue-900 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-base"
          >
            Ver o mapa
          </button>

        </div>
      </section>
    </div>
  );
}