import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ExternalLink, Headphones, Scale, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button, Input, Select, Textarea } from "../components/ui";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/auth";
import { setSeo } from "../lib/seo";
import type { SupportRequest } from "../types";

const LEGAL_VERSION = "17 de setembro de 2026";

type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

function LegalDocument({
  eyebrow,
  title,
  summary,
  sections
}: {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
}) {
  useEffect(() => setSeo(title, `${summary} NhongAqui.`), [summary, title]);
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8 lg:py-12">
      <header className="border-b border-gray-200 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black text-gray-950 md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">{summary}</p>
        <p className="mt-3 text-sm font-bold text-gray-500">Versão em vigor: {LEGAL_VERSION}</p>
      </header>

      <div className="grid gap-8 py-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav className="h-fit border-l-2 border-brand-600 pl-4 lg:sticky lg:top-24" aria-label={`Índice de ${title}`}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">Nesta página</p>
          <div className="space-y-2">
            {sections.map((section) => (
              <a key={section.id} className="block text-sm font-bold text-gray-600 hover:text-brand-700" href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <article className="min-w-0 divide-y divide-gray-200">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 py-6 first:pt-0">
              <h2 className="text-xl font-black text-gray-950 md:text-2xl">{section.title}</h2>
              <div className="mt-3 space-y-3 text-[0.95rem] leading-7 text-gray-700">{section.content}</div>
            </section>
          ))}
        </article>
      </div>
      <LegalNotice />
    </main>
  );
}

function LegalSources() {
  return (
    <ul className="space-y-2">
      <li>
        <a className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline" href="https://portaldogoverno.gov.mz/por/content/download/7051/51882/version/2/file/LEI_DE_TRANSACCOES_ELECTRONICAS.pdf" target="_blank" rel="noreferrer">
          Lei n.º 3/2017, Lei das Transacções Electrónicas <ExternalLink size={14} />
        </a>
      </li>
      <li>
        <a className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline" href="https://www.econference.mctes.gov.mz/assets/Documentos/Legislacoes/Act.Ecocn%C3%B3mica/Transversal/Lei%20de%20defesa%20do%20consumidor.pdf" target="_blank" rel="noreferrer">
          Lei n.º 22/2009, Lei de Defesa do Consumidor <ExternalLink size={14} />
        </a>
      </li>
      <li>
        <a className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline" href="https://www.portaldogoverno.gov.mz/por/content/download/4423/32819/version/1/file/constituicao.pdf" target="_blank" rel="noreferrer">
          Constituição da República de Moçambique <ExternalLink size={14} />
        </a>
      </li>
      <li>
        <a className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline" href="https://intic.gov.mz/sectorial/" target="_blank" rel="noreferrer">
          Legislação sectorial publicada pelo INTIC <ExternalLink size={14} />
        </a>
      </li>
    </ul>
  );
}

export function TermsPage() {
  const sections: LegalSection[] = [
    {
      id: "operador",
      title: "1. Identificação e âmbito",
      content: (
        <>
          <p>NhongAqui é uma plataforma digital de classificados que aproxima compradores e vendedores em Moçambique. A plataforma permite criar anúncios, pesquisar produtos, guardar favoritos, trocar mensagens, denunciar conteúdo e avaliar utilizadores.</p>
          <p>O serviço encontra-se em fase de lançamento. A denominação jurídica completa do operador, NUIT, endereço físico e dados de registo ou licenciamento serão publicados aqui antes do início da exploração comercial. O canal oficial disponível nesta fase é o <Link className="font-bold text-brand-700 hover:underline" to="/contactos">formulário de suporte</Link>.</p>
        </>
      )
    },
    {
      id: "aceitacao",
      title: "2. Aceitação e elegibilidade",
      content: (
        <>
          <p>Ao criar uma conta ou utilizar funcionalidades autenticadas, aceita estes Termos e a <Link className="font-bold text-brand-700 hover:underline" to="/privacidade">Política de Privacidade</Link>. A versão aceite e a respetiva data ficam registadas na conta.</p>
          <p>O utilizador deve ter pelo menos 18 anos e capacidade legal para celebrar contratos. Quem atua por uma empresa declara ter poderes para a representar. Não deve criar contas com identidade falsa, usar dados de terceiros ou contornar uma suspensão.</p>
        </>
      )
    },
    {
      id: "conta",
      title: "3. Conta e segurança",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>Forneça informação verdadeira, atual e suficiente para contacto e verificação.</li>
          <li>Proteja a palavra-passe e informe o suporte se suspeitar de acesso indevido.</li>
          <li>Uma conta é pessoal. Não venda, alugue nem partilhe o acesso.</li>
          <li>A verificação de identidade reduz risco, mas não constitui garantia sobre cada transação.</li>
        </ul>
      )
    },
    {
      id: "papel",
      title: "4. Papel do NhongAqui",
      content: (
        <>
          <p>O NhongAqui disponibiliza tecnologia para publicação e contacto. Salvo indicação expressa numa funcionalidade futura, não é proprietário dos produtos, não define o preço, não recebe o pagamento, não realiza a entrega e não é parte no contrato celebrado entre comprador e vendedor.</p>
          <p>Cada utilizador deve verificar o produto, a identidade da contraparte, a legitimidade da venda e as condições de pagamento e entrega. Vendedores profissionais continuam responsáveis pelas garantias, informação e demais deveres previstos na legislação de defesa do consumidor.</p>
        </>
      )
    },
    {
      id: "anuncios",
      title: "5. Regras dos anúncios",
      content: (
        <>
          <p>O vendedor deve anunciar apenas bens que possui ou está autorizado a vender. Título, categoria, condição, localização, preço e fotografias devem representar o produto real. Não são permitidos anúncios duplicados, palavras enganosas, preços fictícios, fotografias copiadas sem autorização ou contactos destinados a retirar utilizadores da plataforma para fins fraudulentos.</p>
          <p>A <Link className="font-bold text-brand-700 hover:underline" to="/politica-de-anuncios">Política de Anúncios</Link> faz parte destes Termos e identifica bens e práticas proibidos ou sujeitos a restrições.</p>
        </>
      )
    },
    {
      id: "transacoes",
      title: "6. Compras, pagamentos e entrega",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>Confirme o estado do produto antes de pagar e prefira encontro em local público e seguro.</li>
          <li>Não envie códigos de autenticação, PIN, palavra-passe ou cópia desnecessária de documentos.</li>
          <li>Desconfie de urgência artificial, preço muito abaixo do mercado, pedido de depósito antecipado ou pagamento para desbloquear um prémio.</li>
          <li>Marcar um anúncio como reservado ou vendido informa os interessados, mas não substitui contrato, recibo ou prova de pagamento.</li>
        </ul>
      )
    },
    {
      id: "conteudo",
      title: "7. Conteúdo e propriedade intelectual",
      content: (
        <>
          <p>O utilizador mantém os direitos sobre fotografias e textos que publica. Concede ao NhongAqui uma licença não exclusiva, gratuita e limitada ao funcionamento, apresentação, moderação, segurança e promoção do respetivo anúncio enquanto este permanecer na plataforma.</p>
          <p>Não publique marcas, fotografias, textos ou outros conteúdos que violem direitos de terceiros. O NhongAqui pode retirar conteúdo após denúncia fundamentada ou quando existam indícios razoáveis de infração.</p>
        </>
      )
    },
    {
      id: "moderacao",
      title: "8. Moderação e suspensão",
      content: (
        <p>Podemos analisar fotografias e anúncios, pedir informação adicional, limitar funcionalidades, suspender conteúdo ou desativar contas quando necessário para aplicar estas regras, proteger utilizadores, cumprir a lei ou responder a autoridades competentes. Sempre que adequado, será possível pedir esclarecimento através do suporte. Violações graves podem ser comunicadas às autoridades.</p>
      )
    },
    {
      id: "responsabilidade",
      title: "9. Disponibilidade e responsabilidade",
      content: (
        <p>Procuramos manter o serviço seguro e disponível, mas não garantimos funcionamento ininterrupto nem a identidade, qualidade, legalidade ou entrega de todos os bens anunciados. Nada nestes Termos exclui direitos imperativos do consumidor ou responsabilidade que não possa ser limitada por lei. O utilizador responde por prejuízos causados por informação falsa, venda ilícita ou violação destes Termos.</p>
      )
    },
    {
      id: "alteracoes",
      title: "10. Alterações e encerramento",
      content: (
        <p>Podemos atualizar estes Termos por razões legais, técnicas ou de segurança. Alterações relevantes serão anunciadas no serviço e poderão exigir nova aceitação. O utilizador pode deixar de usar o serviço e pedir a desativação da conta pelo suporte, sem prejuízo da conservação de registos legalmente necessários.</p>
      )
    },
    {
      id: "lei",
      title: "11. Lei aplicável e reclamações",
      content: (
        <>
          <p>Estes Termos são regidos pelas leis da República de Moçambique. Antes de recorrer às vias legalmente disponíveis, o utilizador pode apresentar reclamação pelo <Link className="font-bold text-brand-700 hover:underline" to="/contactos">canal de suporte</Link>. Esta cláusula não limita o direito de recorrer às autoridades administrativas ou aos tribunais competentes.</p>
          <LegalSources />
        </>
      )
    }
  ];

  return <LegalDocument eyebrow="Regras do serviço" title="Termos e Condições" summary="As regras que tornam o NhongAqui útil, transparente e seguro para compradores e vendedores." sections={sections} />;
}

export function PrivacyPage() {
  const sections: LegalSection[] = [
    {
      id: "responsavel",
      title: "1. Responsável e contacto",
      content: (
        <>
          <p>O NhongAqui determina como os dados pessoais são tratados para prestar este marketplace. O serviço está em fase de lançamento e os dados formais completos do operador serão acrescentados antes da exploração comercial.</p>
          <p>Pedidos de acesso, correção, eliminação ou esclarecimento podem ser enviados em <Link className="font-bold text-brand-700 hover:underline" to="/contactos">Contactos</Link>, escolhendo “Privacidade e dados”.</p>
        </>
      )
    },
    {
      id: "dados",
      title: "2. Dados que tratamos",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Conta:</strong> nome, email, telefone, palavra-passe protegida por hash, cidade, província, bairro, avatar e estado de verificação.</li>
          <li><strong>Verificação:</strong> nome, telefone, NUIT quando fornecido, tipo e número de documento e decisão de verificação.</li>
          <li><strong>Marketplace:</strong> anúncios, preços, descrições, fotografias, favoritos, avaliações, reservas e vendas.</li>
          <li><strong>Comunicação e segurança:</strong> mensagens, denúncias, bloqueios, pedidos de suporte, notificações e registos de moderação.</li>
          <li><strong>Dados técnicos:</strong> endereço IP e informação básica de pedidos registada pelos servidores e fornecedores de alojamento para segurança, diagnóstico e prevenção de abuso.</li>
          <li><strong>Consentimento:</strong> versão e data de aceitação dos Termos e desta Política.</li>
        </ul>
      )
    },
    {
      id: "finalidades",
      title: "3. Para que usamos os dados",
      content: (
        <p>Usamos os dados para criar e proteger contas, publicar e pesquisar anúncios, permitir mensagens e notificações, verificar vendedores, moderar conteúdo, responder ao suporte, prevenir fraude, resolver denúncias, melhorar estabilidade, cumprir obrigações legais e defender direitos do NhongAqui ou dos utilizadores. Não vendemos dados pessoais.</p>
      )
    },
    {
      id: "fundamentos",
      title: "4. Fundamentos do tratamento",
      content: (
        <p>Tratamos informação necessária para executar o serviço solicitado, cumprir deveres legais e de segurança, proteger interesses legítimos como prevenção de fraude e moderação, e com consentimento quando este seja exigido. O utilizador pode retirar consentimento para tratamentos opcionais sem afetar a legalidade do uso anterior.</p>
      )
    },
    {
      id: "visibilidade",
      title: "5. O que fica visível",
      content: (
        <p>Outros utilizadores podem ver o nome público, avatar, cidade, perfil de vendedor, avaliações e conteúdo dos anúncios. O email, telefone, NUIT, número de documento e mensagens privadas não são apresentados publicamente. Não inclua dados sensíveis na descrição ou nas fotografias de um anúncio.</p>
      )
    },
    {
      id: "partilha",
      title: "6. Partilha e fornecedores",
      content: (
        <>
          <p>Partilhamos apenas o necessário com fornecedores que alojam a aplicação, base de dados, imagens e envio de email, e com consultores ou autoridades quando a lei o exigir. Atualmente a infraestrutura de produção utiliza serviços Railway; os dados podem ser processados fora de Moçambique conforme a localização técnica do fornecedor.</p>
          <p>Exigimos que prestadores usem a informação para prestar o serviço contratado e adotem medidas de segurança adequadas. Uma futura integração de pagamento terá política própria e identificará o prestador antes de ser ativada.</p>
        </>
      )
    },
    {
      id: "conservacao",
      title: "7. Conservação",
      content: (
        <p>Conservamos os dados enquanto a conta estiver ativa e pelo período necessário para prestar o serviço. Após pedido de eliminação, apagamos ou anonimizamos o que já não for necessário, podendo manter registos limitados de transações, consentimentos, denúncias, fraude, segurança e obrigações legais durante o prazo aplicável. Cópias de segurança são eliminadas de acordo com o respetivo ciclo de retenção.</p>
      )
    },
    {
      id: "seguranca",
      title: "8. Segurança",
      content: (
        <p>Aplicamos controlo de acesso, autenticação, ligações HTTPS, palavras-passe com hash, limitação de pedidos, moderação e cópias de segurança. Nenhum sistema é infalível. Em caso de incidente relevante, investigaremos, reduziremos o impacto e notificaremos utilizadores ou autoridades quando exigido.</p>
      )
    },
    {
      id: "direitos",
      title: "9. Direitos do utilizador",
      content: (
        <p>O utilizador pode pedir confirmação do tratamento, acesso, correção, atualização ou eliminação dos seus dados, bem como apresentar oposição ou reclamação quando aplicável. Podemos pedir prova de identidade e limitar o pedido quando for necessário proteger terceiros, prevenir fraude ou cumprir a lei. A Constituição moçambicana reconhece o acesso e a retificação de dados pessoais constantes de registos informáticos.</p>
      )
    },
    {
      id: "cookies",
      title: "10. Cookies e armazenamento local",
      content: (
        <p>A aplicação web guarda no dispositivo os tokens necessários para manter a sessão iniciada. Não utilizamos atualmente cookies publicitários nem ferramentas de publicidade comportamental. Se forem introduzidas análises ou tecnologias opcionais, esta Política e os controlos de consentimento serão atualizados primeiro.</p>
      )
    },
    {
      id: "menores",
      title: "11. Menores",
      content: (
        <p>O serviço não se destina a pessoas com menos de 18 anos. Se detetarmos uma conta criada por menor sem base legal adequada, poderemos restringi-la e eliminar os dados, preservando apenas o necessário para segurança ou cumprimento da lei.</p>
      )
    },
    {
      id: "enquadramento",
      title: "12. Enquadramento e alterações",
      content: (
        <>
          <p>Esta Política considera os direitos à vida privada e à proteção de dados previstos na Constituição, a Lei das Transacções Electrónicas, a legislação de cibersegurança e as boas práticas refletidas na proposta nacional de proteção de dados. Alterações importantes serão comunicadas e identificadas por uma nova data de versão.</p>
          <LegalSources />
        </>
      )
    }
  ];

  return <LegalDocument eyebrow="Dados pessoais" title="Política de Privacidade" summary="Explica que informação recolhemos, por que motivo a usamos, com quem pode ser partilhada e como exercer os seus direitos." sections={sections} />;
}

export function AdsPolicyPage() {
  const sections: LegalSection[] = [
    {
      id: "principio",
      title: "1. Princípio geral",
      content: (
        <p>Publique apenas produtos lícitos, autênticos, seguros e que esteja autorizado a vender. O anúncio deve mostrar o artigo real e descrever de forma clara o estado, defeitos, preço e localização. Esta política aplica-se a anúncios, fotografias, perfil e mensagens usadas para concluir a venda.</p>
      )
    },
    {
      id: "proibidos",
      title: "2. Artigos e atividades proibidos",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>Produtos roubados, obtidos por fraude ou cuja origem legítima não possa ser demonstrada.</li>
          <li>Armas, munições, explosivos, fogo de artifício, componentes de armas e instruções para os fabricar.</li>
          <li>Drogas, substâncias controladas, tabaco, cigarros eletrónicos, álcool e utensílios destinados ao consumo de droga.</li>
          <li>Medicamentos sujeitos a receita, produtos médicos não autorizados, partes do corpo, sangue ou alegações falsas de cura.</li>
          <li>Contrafações, réplicas apresentadas como originais, cópias piratas e bens que violem marcas ou direitos de autor.</li>
          <li>Animais vivos, espécies protegidas, marfim, troféus de caça e produtos de origem animal cuja comercialização seja ilegal.</li>
          <li>Conteúdo sexual, serviços sexuais, exploração de menores ou material que incentive violência, ódio ou discriminação.</li>
          <li>Documentos de identidade, cartões bancários, dados pessoais, contas digitais, cartões SIM registados, credenciais e bases de dados.</li>
          <li>Crédito, empréstimos, esquemas de investimento, apostas, moeda falsa, instrumentos financeiros ou criptoativos.</li>
          <li>Produtos recolhidos do mercado, químicos perigosos, pesticidas não autorizados, resíduos, combustível ou bens que apresentem risco grave.</li>
          <li>Veículos sem prova de propriedade, matrículas, documentos de viatura vendidos separadamente ou peças com identificação adulterada.</li>
          <li>Qualquer bem, serviço ou conteúdo proibido pela legislação aplicável, mesmo que não esteja expressamente nesta lista.</li>
        </ul>
      )
    },
    {
      id: "praticas",
      title: "3. Práticas proibidas",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>Usar fotografias de outro vendedor, imagens que escondam defeitos ou descrição diferente do produto entregue.</li>
          <li>Publicar preço irreal apenas para atrair contactos, pedir taxa para libertar prémio ou exigir depósito sob falsa urgência.</li>
          <li>Criar anúncios duplicados, spam, avaliações combinadas ou múltiplas contas para contornar limites e sanções.</li>
          <li>Recolher documentos, códigos, PIN ou dados bancários sem necessidade legítima.</li>
          <li>Direcionar utilizadores para páginas falsas, ficheiros maliciosos, esquemas em cadeia ou recrutamento fraudulento.</li>
        </ul>
      )
    },
    {
      id: "restritos",
      title: "4. Artigos sujeitos a prova adicional",
      content: (
        <p>Telemóveis, computadores, artigos de luxo, peças automóveis e outros bens de maior risco podem exigir número de série, comprovativo de compra, prova de propriedade, fotografia adicional ou verificação do vendedor. O NhongAqui pode manter o anúncio em análise até receber informação suficiente.</p>
      )
    },
    {
      id: "aplicacao",
      title: "5. Moderação e consequências",
      content: (
        <p>Podemos rejeitar fotografias, retirar anúncios, limitar a conta, pedir prova de origem ou comunicar indícios de crime às autoridades. A repetição, tentativa de fraude ou risco para pessoas pode resultar em desativação imediata. Uma aprovação inicial não impede revisão posterior.</p>
      )
    },
    {
      id: "denuncia",
      title: "6. Denúncias e esclarecimentos",
      content: (
        <p>Use “Denunciar” na página do produto para conteúdo suspeito. Para questões sobre uma remoção ou sobre a possibilidade de anunciar determinado artigo, envie um pedido em <Link className="font-bold text-brand-700 hover:underline" to="/contactos">Contactos</Link> antes de publicar.</p>
      )
    }
  ];

  return <LegalDocument eyebrow="Marketplace responsável" title="Política de Anúncios" summary="O que pode ser vendido no NhongAqui, o que é proibido e como tratamos anúncios de risco." sections={sections} />;
}

export function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.full_name ?? "",
    email: user?.email ?? "",
    category: "account",
    subject: "",
    message: ""
  });
  const submit = useMutation({
    mutationFn: () => apiRequest<SupportRequest>("/support-requests/", {
      method: "POST",
      body: JSON.stringify(form)
    })
  });

  useEffect(() => setSeo("Contactos", "Contacte o suporte do NhongAqui."), []);
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.full_name,
      email: current.email || user.email || ""
    }));
  }, [user]);

  if (submit.data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12 lg:px-8">
        <div className="w-full border-y border-gray-200 py-10 text-center">
          <CheckCircle2 className="mx-auto text-brand-700" size={42} />
          <h1 className="mt-4 text-3xl font-black text-gray-950">Pedido recebido</h1>
          <p className="mt-2 text-gray-600">Guarde a referência <strong className="text-gray-950">{submit.data.reference}</strong>. A resposta será enviada para {submit.data.email}.</p>
          <Button className="mt-6" variant="secondary" onClick={() => { submit.reset(); setForm((current) => ({ ...current, subject: "", message: "" })); }}>
            Novo pedido
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">Apoio NhongAqui</p>
          <h1 className="mt-2 text-4xl font-black text-gray-950">Como podemos ajudar?</h1>
          <p className="mt-4 leading-7 text-gray-600">Envie detalhes suficientes, mas nunca inclua palavra-passe, PIN, código de autenticação ou dados bancários completos.</p>
          <div className="mt-7 space-y-5 border-t border-gray-200 pt-6">
            <div className="flex gap-3"><Headphones className="shrink-0 text-brand-700" /><div><p className="font-black text-gray-950">Canal oficial</p><p className="text-sm text-gray-600">Este formulário cria um pedido com referência e fica disponível para a equipa de administração.</p></div></div>
            <div className="flex gap-3"><ShieldCheck className="shrink-0 text-brand-700" /><div><p className="font-black text-gray-950">Privacidade</p><p className="text-sm text-gray-600">Pedidos sobre dados pessoais recebem tratamento separado. Podemos pedir confirmação de identidade.</p></div></div>
            <div className="flex gap-3"><AlertTriangle className="shrink-0 text-accent-red" /><div><p className="font-black text-gray-950">Perigo imediato</p><p className="text-sm text-gray-600">Em situação de crime, ameaça ou risco físico, contacte primeiro as autoridades competentes.</p></div></div>
          </div>
        </section>

        <form className="space-y-4 border border-gray-200 bg-white p-5 shadow-soft md:p-7" onSubmit={(event) => { event.preventDefault(); void submit.mutate(); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-gray-700">Nome<Input className="mt-1.5" required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="text-sm font-bold text-gray-700">Email<Input className="mt-1.5" required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          </div>
          <label className="block text-sm font-bold text-gray-700">Assunto<Select className="mt-1.5" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            <option value="account">Conta e acesso</option>
            <option value="listing">Anúncio</option>
            <option value="safety">Segurança ou fraude</option>
            <option value="privacy">Privacidade e dados</option>
            <option value="technical">Problema técnico</option>
            <option value="other">Outro assunto</option>
          </Select></label>
          <label className="block text-sm font-bold text-gray-700">Título<Input className="mt-1.5" required maxLength={160} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
          <label className="block text-sm font-bold text-gray-700">Mensagem<Textarea className="mt-1.5 min-h-40" required minLength={20} maxLength={3000} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>
          <p className="text-xs leading-5 text-gray-500">Ao enviar, aceita o tratamento destes dados para responder ao pedido, conforme a <Link className="font-bold text-brand-700" to="/privacidade">Política de Privacidade</Link>.</p>
          {submit.error instanceof Error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{submit.error.message}</p> : null}
          <Button className="w-full sm:w-auto" type="submit" disabled={submit.isPending}><Send size={18} /> {submit.isPending ? "A enviar..." : "Enviar pedido"}</Button>
        </form>
      </div>
    </main>
  );
}

export function LegalNotice() {
  return (
    <div className="flex items-start gap-3 border-l-4 border-accent-yellow bg-yellow-50 p-4 text-sm text-yellow-950">
      <Scale className="shrink-0" size={20} />
      <p>Estes documentos são uma base operacional e devem ser revistos por um advogado moçambicano antes do lançamento comercial.</p>
    </div>
  );
}
