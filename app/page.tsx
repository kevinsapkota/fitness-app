"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-gray-900 relative overflow-x-hidden font-sans">

      {/* ───── NAV ───── */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5">
        <Link href="/">
          <img src="/logo.png" alt="StreetViz" className="h-[110px] w-auto cursor-pointer" />
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
            className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-semibold shadow-sm"
          >
            Criar conta
          </button>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative pt-52 pb-16 px-6 text-center">

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-100 opacity-50 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Dados em tempo real · Gratuito · Feito por cidadãos
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight">
          Reporta problemas<br />
          <span className="text-blue-600">na tua rua em segundos.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto mb-3 leading-relaxed font-light">
          Vê o que está a acontecer perto de ti. Reporta. E acompanha até estar resolvido.
        </p>
        <p className="text-sm text-gray-400 mb-10">Começa em menos de 10 segundos. Sem complicações.</p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm mx-auto sm:max-w-none">
          <button
            onClick={() => router.push("/register")}
            className="w-full sm:w-auto bg-blue-600 text-white px-9 py-4 rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all font-bold text-base shadow-lg shadow-blue-200"
          >
            Criar conta grátis →
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 px-9 py-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all font-semibold text-base shadow-sm"
          >
            Ver o mapa
          </button>
        </div>

        <p className="mt-5 text-sm text-gray-400 sm:hidden">
          Já tens conta?{" "}
          <button onClick={() => router.push("/login")} className="text-blue-600 font-semibold">
            Entrar
          </button>
        </p>
      </section>

      {/* ───── APP PREVIEW ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white aspect-[16/9] flex items-center justify-center">
          <img
            src="/preview.png"
            alt="Preview da app StreetViz"
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const p = t.parentElement!;
              p.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;height:100%;background:#f0f4ff;color:#94a3b8;"><svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 9h18M9 21V9"/></svg><p style="font-size:13px;font-weight:600;margin:0">Preview da app</p><p style="font-size:11px;margin:0">Coloca /preview.png na pasta public</p></div>`;
            }}
          />
        </div>
      </section>

      {/* ───── REPORTADO RECENTEMENTE ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-5 text-center">Reportado recentemente</p>

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
                className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 flex items-start gap-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-default"
              >
                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-1.5">{item.desc}</p>
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

      {/* ───── MAPA PLACEHOLDER ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">O mapa da tua cidade</h2>
          <p className="text-gray-400 text-sm text-center mb-8">Todos os problemas, num só lugar.</p>

          <div
            onClick={() => router.push("/dashboard")}
            className="rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-gradient-to-br from-blue-50 to-slate-100 aspect-[16/7] relative cursor-pointer group"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 group-hover:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <p className="font-semibold text-sm">Clica para abrir o mapa</p>
            </div>
            {/* pins decorativos */}
            <div className="absolute top-[30%] left-[35%] w-3 h-3 rounded-full bg-orange-400 shadow-md animate-pulse" />
            <div className="absolute top-[55%] left-[58%] w-3 h-3 rounded-full bg-yellow-400 shadow-md animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-[25%] left-[65%] w-2.5 h-2.5 rounded-full bg-blue-400 shadow-md animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </section>

      {/* ───── COMO FUNCIONA ───── */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Como funciona</h2>
        <p className="text-center text-gray-400 mb-14 text-sm">Simples. Direto. Eficaz.</p>

        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            { n: "1", title: "Explora o mapa", desc: "Vê todos os problemas reportados perto de ti, em tempo real." },
            { n: "2", title: "Reporta em segundos", desc: "Adiciona uma ocorrência com localização, foto e descrição." },
            { n: "3", title: "Problemas resolvidos mais rápido", desc: "A câmara municipal recebe alertas e resolve com base na prioridade da comunidade." },
          ].map((step) => (
            <div key={step.n} className="relative pl-7 border-l-2 border-blue-100 hover:border-blue-400 transition-colors duration-200">
              <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {step.n}
              </span>
              <h3 className="font-bold text-gray-900 mb-2 mt-0.5">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── TRUST LAYER ───── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            { label: "Dados anonimizados", sub: "A tua privacidade é sempre protegida" },
            { label: "Feito para cidadãos", sub: "Para quem vive e usa a cidade" },
            { label: "100% Gratuito", sub: "Sem subscrições, sem spam" },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <span className="text-green-500 font-extrabold text-base mt-0.5">✔</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── BENEFÍCIOS ───── */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Porquê usar StreetViz?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { title: "Comunidade ativa", desc: "Liga cidadãos que querem melhorar o espaço público e a qualidade de vida." },
            { title: "Mapa com tudo visível", desc: "Ocorrências, gravidade e localização — tudo num mapa claro e intuitivo." },
            { title: "Câmaras municipais mais rápidas", desc: "Os municípios recebem dados estruturados e resolvem problemas com mais eficácia." },
          ].map((b, i) => (
            <div
              key={i}
              className="bg-[#f4f6fb] p-6 rounded-2xl border border-transparent hover:border-blue-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <div className="w-8 h-1 bg-blue-600 rounded-full mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CTA FINAL ───── */}
      <section className="py-24 px-6 bg-blue-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-60px] right-[-60px] w-[400px] h-[400px] rounded-full bg-blue-500 opacity-30 blur-3xl" />
          <div className="absolute top-[-40px] left-[-40px] w-[300px] h-[300px] rounded-full bg-blue-800 opacity-20 blur-2xl" />
        </div>

        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Junta-te à vizinhança</h2>
        <p className="text-blue-100 mb-2 text-lg">Começa hoje a contribuir para uma cidade mais inteligente.</p>
        <p className="text-blue-200 text-sm mb-10">Sem complicações. Apenas entra e explora.</p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm mx-auto sm:max-w-none">
          <button
            onClick={() => router.push("/register")}
            className="w-full sm:w-auto bg-white text-blue-600 px-9 py-4 rounded-2xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all shadow-lg text-base"
          >
            Criar conta grátis →
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto bg-blue-800 text-white px-9 py-4 rounded-2xl font-semibold hover:bg-blue-900 active:scale-[0.98] transition-all text-base"
          >
            Ver o mapa
          </button>
        </div>
      </section>

    </div>
  );
}