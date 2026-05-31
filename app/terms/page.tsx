export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8">Termos e Condições</h1>
      <p className="mb-6 text-gray-600">Última atualização: Maio 2026</p>
      <div className="space-y-6 text-gray-700 leading-7">

        <p>
          Ao utilizar o StreetViz, concorda com os seguintes termos e
          condições de utilização. Leia-os atentamente antes de usar a
          plataforma.
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Utilização da plataforma</h2>
          <p>
            O StreetViz é uma plataforma que permite reportar problemas
            urbanos como buracos, passeios danificados e outros problemas
            de infraestrutura pública. A utilização da plataforma está
            condicionada à aceitação destes termos. Para informações
            sobre o tratamento dos seus dados pessoais, consulte a nossa{" "}
            <a href="/privacy" className="text-blue-600 underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Conduta do utilizador</h2>
          <p>Não é permitido:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Publicar conteúdo ilegal ou enganoso</li>
            <li>Fazer spam ou publicações repetidas sem fundamento</li>
            <li>Tentar comprometer a segurança ou funcionamento da plataforma</li>
            <li>Publicar reports falsos de forma intencional</li>
            <li>Utilizar a plataforma para fins comerciais não autorizados</li>
            <li>
              Publicar fotografias que exponham desnecessariamente dados
              pessoais de terceiros (rostos identificáveis, matrículas,
              etc.) sem que tal seja relevante para o reporte do problema
            </li>
          </ul>
          <p className="mt-3">
            A violação destas regras pode resultar na suspensão ou
            remoção da conta. Em casos não urgentes, o utilizador será
            notificado por email com antecedência mínima de 7 dias. Em
            casos de violação grave, urgente ou ilegal, a suspensão pode
            ser imediata.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Conteúdo dos utilizadores e licença
          </h2>
          <p>
            Cada utilizador é inteiramente responsável pelo conteúdo que
            publica, incluindo imagens, localizações e descrições. Ao
            publicar conteúdo na plataforma, o utilizador garante que
            possui todos os direitos e autorizações necessários sobre o
            mesmo e que este não viola direitos de terceiros nem a
            legislação aplicável em matéria de proteção de dados.
          </p>
          <p className="mt-3">
            Ao submeter qualquer conteúdo (incluindo fotografias), o
            utilizador concede ao StreetViz uma licença mundial, não
            exclusiva, gratuita, transferível e sublicenciável para
            alojar, armazenar, utilizar, reproduzir, modificar e exibir
            publicamente esse conteúdo, exclusivamente para efeitos de
            funcionamento e promoção da plataforma, bem como para
            eventual partilha com entidades públicas competentes (como
            Câmaras Municipais ou Juntas de Freguesia) para efeitos de
            resolução dos problemas reportados. Neste caso, os dados de
            identidade do utilizador (nome e email) não são partilhados,
            sendo os reports tratados de forma anonimizada perante essas
            entidades.
          </p>
          <p className="mt-3">
            O StreetViz reserva-se o direito de remover qualquer
            conteúdo que viole estes termos ou que seja considerado
            inadequado, sem aviso prévio.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Fotografias e dados de terceiros
          </h2>
          <p>
            As fotografias publicadas na plataforma podem, involuntariamente,
            conter dados pessoais de terceiros não utilizadores da plataforma,
            como rostos ou matrículas de veículos. O StreetViz está a
            desenvolver mecanismos automáticos de desfocagem de rostos e
            matrículas antes da publicação pública das imagens, que serão
            implementados assim que disponíveis. Até lá, os utilizadores
            são responsáveis por não exporem desnecessariamente dados
            pessoais de terceiros nas fotografias que submetem.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Disponibilidade do serviço</h2>
          <p>
            O StreetViz pode alterar funcionalidades ou interromper o
            serviço temporariamente. Não garantimos disponibilidade
            contínua. A nossa responsabilidade por interrupções do serviço
            é limitada aos casos de negligência grave ou dolo da nossa
            parte, nos termos da legislação portuguesa aplicável.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Limitação de responsabilidade</h2>
          <p>
            O StreetViz não se responsabiliza pela veracidade dos reports
            publicados pelos utilizadores, nem por decisões tomadas com
            base nesses reports por entidades públicas ou privadas. A
            plataforma funciona como intermediário de reporte e não tem
            controlo sobre as ações das autoridades competentes. Esta
            limitação não se aplica em casos de dolo ou negligência grave
            da nossa parte.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Alterações aos termos</h2>
          <p>
            Reservamo-nos o direito de atualizar estes termos a qualquer
            momento. No caso de alterações substanciais que afetem os
            direitos dos utilizadores, notificaremos os utilizadores
            registados por email ou através de um aviso na plataforma com
            uma antecedência mínima de <strong>7 dias</strong> antes de
            as alterações entrarem em vigor. A continuação da utilização
            da plataforma após essa data constitui aceitação dos novos
            termos. Caso não concorde, pode eliminar a sua conta antes da
            data de entrada em vigor.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Resolução alternativa de litígios (RAL)
          </h2>
          <p>
            Em caso de litígio de consumo, o utilizador pode recorrer a
            uma entidade de Resolução Alternativa de Litígios de Consumo,
            nos termos da Lei n.º 144/2015. Para consultar a lista de
            entidades disponíveis em Portugal, aceda ao{" "}
            <a
              href="https://www.consumidor.gov.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Portal do Consumidor
            </a>
            . Pode também utilizar a plataforma europeia de resolução de
            litígios em linha:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              ec.europa.eu/consumers/odr
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Lei aplicável</h2>
          <p>
            Estes termos são regidos pela legislação portuguesa e da
            União Europeia. Em caso de litígio judicial, é competente o
            tribunal da comarca correspondente à sede do responsável pelo
            serviço, sem prejuízo do direito do consumidor de recorrer
            aos tribunais da sua área de residência.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Contacto</h2>
          <p>
            Para questões relacionadas com estes termos, contacte-nos
            através do email:{" "}
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