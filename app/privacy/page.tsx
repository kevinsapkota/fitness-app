export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
      <p className="mb-6 text-gray-600">Última atualização: Maio 2026</p>
      <div className="space-y-6 text-gray-700 leading-7">

        <p>
          O StreetViz respeita a privacidade dos utilizadores e
          compromete-se a proteger os seus dados pessoais em conformidade
          com o Regulamento Geral de Proteção de Dados (RGPD —
          Regulamento UE 2016/679) e a legislação portuguesa aplicável.
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Responsável pelo tratamento
          </h2>
          <p>
            O responsável pelo tratamento dos dados pessoais é:
          </p>
          <ul className="list-none ml-0 mt-2 space-y-1">
            <li><strong>Nome:</strong> Kevin Sapkota</li>
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:histreetviz@gmail.com"
                className="text-blue-600 underline"
              >
                histreetviz@gmail.com
              </a>
            </li>
            <li><strong>Telefone:</strong> +351 964 221 091</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Dados recolhidos</h2>
          <p>
            Recolhemos os seguintes dados pessoais dos utilizadores da
            plataforma:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Nome ou username</li>
            <li>Endereço de email</li>
            <li>Fotografias enviadas nos reports</li>
            <li>Localização geográfica dos reports</li>
            <li>Informações básicas do dispositivo e navegador</li>
            <li>Endereço IP</li>
          </ul>
          <p className="mt-3">
            Adicionalmente, as fotografias submetidas pelos utilizadores
            podem conter, de forma não intencional, dados pessoais de
            terceiros não utilizadores da plataforma (como rostos ou
            matrículas de veículos). Consulte a secção abaixo sobre o
            tratamento destes dados.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Fotografias e dados pessoais de terceiros
          </h2>
          <p>
            O StreetViz reconhece que, enquanto responsável pelo
            tratamento, tem obrigações legais perante o RGPD
            relativamente a dados pessoais de terceiros que possam
            aparecer nas fotografias submetidas pelos utilizadores
            (como rostos identificáveis ou matrículas de veículos).
          </p>
          <p className="mt-3">
            Para cumprir essas obrigações, o StreetViz adota as
            seguintes medidas:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>
              <strong>Revisão de conteúdo:</strong> As fotografias
              submetidas estão sujeitas a moderação. O StreetViz
              reserva-se o direito de remover ou restringir o acesso
              a qualquer imagem que contenha dados pessoais de
              terceiros de forma desnecessária ou desproporcional
              face à finalidade do reporte.
            </li>
            <li>
              <strong>Anonimização automática (em desenvolvimento):</strong>{" "}
              O StreetViz está a implementar mecanismos técnicos de
              desfocagem automática de rostos e matrículas antes da
              publicação pública das imagens. Esta funcionalidade
              será ativada assim que disponível e será comunicada
              aos utilizadores.
            </li>
            <li>
              <strong>Direito de eliminação:</strong> Qualquer pessoa
              que identifique dados pessoais seus numa fotografia
              publicada na plataforma pode solicitar a sua remoção
              imediata através do email{" "}
              <a
                href="mailto:histreetviz@gmail.com"
                className="text-blue-600 underline"
              >
                histreetviz@gmail.com
              </a>
              , ao abrigo do Art. 17.º do RGPD (direito ao
              esquecimento). Os pedidos serão tratados no prazo de
              72 horas.
            </li>
            <li>
              <strong>Responsabilidade do utilizador:</strong> Sem
              prejuízo das medidas acima, os utilizadores são
              igualmente responsáveis por não submeterem fotografias
              que exponham desnecessariamente dados pessoais de
              terceiros, conforme previsto nos Termos e Condições.
              A submissão de imagens com dados de terceiros de forma
              intencional e desnecessária pode constituir violação
              do RGPD da responsabilidade exclusiva do utilizador.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Base legal para o tratamento
          </h2>
          <p>
            Tratamos os seus dados com base nas seguintes bases legais
            previstas no Art. 6.º do RGPD:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>Execução de contrato (Art. 6.º/1/b)</strong> —
              para criar e gerir a sua conta e permitir a utilização
              da plataforma
            </li>
            <li>
              <strong>Interesse legítimo (Art. 6.º/1/f)</strong> —
              para garantir a segurança da plataforma, prevenir spam
              e abusos, e melhorar a experiência do utilizador
            </li>
            <li>
              <strong>Consentimento (Art. 6.º/1/a)</strong> — para o
              envio de comunicações opcionais, quando aplicável
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Finalidade do tratamento
          </h2>
          <p>Os dados são utilizados para:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Funcionamento e prestação do serviço</li>
            <li>Autenticação e gestão de contas</li>
            <li>Segurança e prevenção de fraude ou spam</li>
            <li>Melhoria da experiência do utilizador</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Prazo de conservação
          </h2>
          <p>
            Os dados pessoais são conservados enquanto a conta do
            utilizador estiver ativa. Após a eliminação da conta, os
            dados são apagados no prazo de 30 dias, salvo obrigação
            legal de conservação por prazo superior.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Partilha de dados com terceiros
          </h2>
          <p>
            O StreetViz não vende dados pessoais a terceiros. Para o
            funcionamento da plataforma, recorremos aos seguintes
            subcontratantes:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>Supabase (Supabase Inc.)</strong> — base de dados
              e autenticação.{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Política de privacidade
              </a>
            </li>
            <li>
              <strong>Vercel (Vercel Inc.)</strong> — alojamento e
              entrega da aplicação.{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Política de privacidade
              </a>
            </li>
          </ul>
          <p className="mt-3">
            Estes prestadores apenas tratam os dados nas condições por
            nós instruídas e não os podem utilizar para fins próprios.
          </p>
          <p className="mt-3">
            No futuro, os reports (fotografias e localização) poderão
            ser partilhados com entidades públicas competentes, como
            Câmaras Municipais ou Juntas de Freguesia, para efeitos de
            resolução dos problemas reportados. Nesse caso, os dados de
            identidade do utilizador (nome e email) não serão
            partilhados, sendo os reports tratados de forma anonimizada
            perante essas entidades. Os utilizadores serão informados
            previamente de qualquer alteração a esta prática.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Transferências internacionais de dados
          </h2>
          <p>
            Os dados podem ser processados fora do Espaço Económico
            Europeu (EEE), nomeadamente nos Estados Unidos da América,
            pelos prestadores Supabase e Vercel. Estas transferências
            são realizadas ao abrigo dos seguintes mecanismos jurídicos
            que garantem proteção adequada, nos termos do Art. 46.º do
            RGPD:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>Cláusulas Contratuais-Tipo (CCT)</strong>{" "}
              aprovadas pela Comissão Europeia
            </li>
            <li>
              <strong>EU-U.S. Data Privacy Framework</strong> (Quadro
              de Privacidade de Dados UE-EUA), quando aplicável ao
              prestador em causa
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Cookies</h2>
          <p>
            O StreetViz utiliza apenas cookies essenciais para o
            funcionamento da plataforma, nomeadamente para manter a
            sessão do utilizador autenticado. Não utilizamos cookies de
            rastreamento ou publicidade. Pode gerir as preferências de
            cookies nas definições do seu navegador.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Segurança</h2>
          <p>
            São aplicadas medidas técnicas e organizacionais razoáveis
            para proteger os dados dos utilizadores contra acesso não
            autorizado, perda ou destruição. No entanto, nenhum sistema
            online é totalmente seguro e não podemos garantir segurança
            absoluta.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Os seus direitos (RGPD)
          </h2>
          <p>
            Nos termos dos Artigos 15.º a 21.º do RGPD, tem os
            seguintes direitos relativamente aos seus dados pessoais:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>
              <strong>Acesso (Art. 15.º)</strong> — saber quais os
              dados que temos sobre si e como os utilizamos
            </li>
            <li>
              <strong>Retificação (Art. 16.º)</strong> — corrigir
              dados incorretos ou incompletos
            </li>
            <li>
              <strong>Apagamento (Art. 17.º)</strong> — solicitar a
              eliminação dos seus dados ("direito ao esquecimento")
            </li>
            <li>
              <strong>Limitação (Art. 18.º)</strong> — restringir o
              tratamento em determinadas circunstâncias
            </li>
            <li>
              <strong>Portabilidade (Art. 20.º)</strong> — receber os
              seus dados num formato estruturado e legível por máquina
            </li>
            <li>
              <strong>Oposição (Art. 21.º)</strong> — opor-se ao
              tratamento baseado em interesse legítimo
            </li>
            <li>
              <strong>Retirar o consentimento</strong> — a qualquer
              momento, sem custos, sem afetar a licitude do tratamento
              anterior
            </li>
          </ul>
          <p className="mt-3">
            Para exercer qualquer destes direitos, contacte-nos em{" "}
            <a
              href="mailto:histreetviz@gmail.com"
              className="text-blue-600 underline"
            >
              histreetviz@gmail.com
            </a>
            . Responderemos no prazo de 30 dias. Tem também o direito de
            apresentar reclamação à autoridade de controlo portuguesa:{" "}
            <a
              href="https://www.cnpd.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              CNPD — Comissão Nacional de Proteção de Dados
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Alterações a esta política
          </h2>
          <p>
            Podemos atualizar esta política periodicamente. Em caso de
            alterações relevantes, notificaremos os utilizadores por
            email com uma antecedência mínima de 7 dias. A data de
            última atualização está sempre indicada no topo desta página.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Contacto</h2>
          <p>
            Para qualquer questão relacionada com privacidade ou
            proteção de dados, contacte-nos em:{" "}
            <a
              href="mailto:histreetviz@gmail.com"
              className="text-blue-600 underline"
            >
              histreetviz@gmail.com
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}