// ─── Tipos ──────────────────────────────────────────────────────────────────

export type ChannelId = 'whatsapp' | 'stories' | 'publicacao' | 'atendimento'

export type StyleId = 'direto' | 'elegante' | 'descontraido' | 'consultivo'

export interface ChannelInfo {
  id: ChannelId
  label: string
  shortLabel: string
  description: string
  maxLength: number
}

export interface StyleInfo {
  id: StyleId
  label: string
  description: string
}

export interface CopyTemplate {
  id: string
  category: string
  name: string
  whenToUse: string
  template: string
  cta: string
  channels: ChannelId[]
}

export interface WhatsAppScenario {
  id: string
  situation: string
  response: string
  tip: string
}

export interface MentalTrigger {
  id: string
  name: string
  principle: string
  whenToUse: string
  example: string
  warning: string
}

export interface ClosingTechnique {
  id: string
  name: string
  description: string
  example: string
}

// ─── Canais ──────────────────────────────────────────────────────────────────

export const channels: ChannelInfo[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    shortLabel: 'WhatsApp',
    description: 'Mensagens diretas para conversa individual ou grupos.',
    maxLength: 1000,
  },
  {
    id: 'stories',
    label: 'Stories do Instagram',
    shortLabel: 'Stories',
    description: 'Textos curtos e visuais para Stories.',
    maxLength: 150,
  },
  {
    id: 'publicacao',
    label: 'Publicação no Feed',
    shortLabel: 'Publicação',
    description: 'Postagens mais estruturadas para o feed do Instagram.',
    maxLength: 2200,
  },
  {
    id: 'atendimento',
    label: 'Atendimento Individual',
    shortLabel: 'Atendimento',
    description: 'Respostas para clientes que entram em contato diretamente.',
    maxLength: 1500,
  },
]

// ─── Estilos de comunicação ─────────────────────────────────────────────────

export const styles: StyleInfo[] = [
  { id: 'direto', label: 'Direto', description: 'Claro, objetivo, sem rodeios. Vai direto ao ponto.' },
  { id: 'elegante', label: 'Elegante', description: 'Cuidado nos detalhes, tom sofisticado e atencioso.' },
  { id: 'descontraido', label: 'Descontraído', description: 'Próximo, casual, usa linguagem do dia a dia.' },
  { id: 'consultivo', label: 'Consultivo', description: 'Orienta e explica, age como um consultor que ajuda a decidir.' },
]

// ─── Modelos de copywriting ──────────────────────────────────────────────────

export const copyTemplates: CopyTemplate[] = [
  {
    id: 'apresentacao-direta',
    category: 'Apresentação de oferta',
    name: 'Apresentação direta da oferta',
    whenToUse: 'Quando você quer comunicar a oferta de forma clara e rápida, sem enrolação.',
    template: '{produto} — {precoNormal} agora por {precoPromo}.\n\n{beneficio}\n\nAproveite: {cta}',
    cta: 'É só chamar aqui no WhatsApp que eu separo o seu.',
    channels: ['whatsapp', 'publicacao'],
  },
  {
    id: 'foco-beneficio',
    category: 'Apresentação de oferta',
    name: 'Foco no benefício do produto',
    whenToUse: 'Quando o benefício é mais importante que o preço para o seu público.',
    template: 'Sabia que {produto} pode {beneficio}?\n\nÉ exatamente o que {publico} procura.\n\nDe {precoNormal} por {precoPromo} — só {prazo}.',
    cta: 'Garanta o seu enquanto tem estoque.',
    channels: ['whatsapp', 'publicacao', 'stories'],
  },
  {
    id: 'comparacao-precos',
    category: 'Apresentação de oferta',
    name: 'Comparação de preços',
    whenToUse: 'Quando a diferença entre o preço normal e o promocional é visualmente impactante.',
    template: 'Antes: {precoNormal}\nAgora: {precoPromo}\n\nVocê economiza {economia}!\n\n{beneficio}\n\n{cta}',
    cta: 'Só até {prazo} — não perca.',
    channels: ['stories', 'publicacao', 'whatsapp'],
  },
  {
    id: 'oferta-combo',
    category: 'Combos e ticket médio',
    name: 'Oferta de combo',
    whenToUse: 'Quando você junta dois ou mais produtos e oferece o conjunto por um preço menor.',
    template: 'Leve o combo {produto} por {precoPromo} (antes {precoNormal}).\n\n{beneficio}\n\nComprar separado custaria mais — no combo você economiza {economia}.',
    cta: 'Chama aqui que te mostro tudo que vem no combo.',
    channels: ['whatsapp', 'publicacao'],
  },
  {
    id: 'oferta-brinde',
    category: 'Benefícios e valor percebido',
    name: 'Oferta com brinde',
    whenToUse: 'Quando você adiciona um brinde sem reduzir o preço — aumenta o valor percebido.',
    template: 'Compre {produto} e ganhe {brinde} de presente!\n\n{beneficio}\n\nPreço: {precoNormal}\nO brinde é por nossa conta.',
    cta: 'Quantidade limitada de brindes — garanta o seu.',
    channels: ['whatsapp', 'publicacao', 'stories'],
  },
  {
    id: 'oferta-quantidade',
    category: 'Benefícios e valor percebido',
    name: 'Oferta por quantidade',
    whenToUse: 'Quando você tem poucas unidades e quer criar urgência real.',
    template: 'Restam apenas {quantidade} unidades de {produto}!\n\nDe {precoNormal} por {precoPromo}.\n{beneficio}\n\n{cta}',
    cta: 'Quando acabar, acabou — chama para reservar a sua.',
    channels: ['whatsapp', 'stories'],
  },
  {
    id: 'lancamento',
    category: 'Lançamentos',
    name: 'Divulgação de lançamento',
    whenToUse: 'Para um produto novo que você quer apresentar ao mercado.',
    template: 'Novidade na loja! 🎉\n\n{produto} chegou.\nPreço de lançamento: {precoPromo} (de {precoNormal}).\n\n{beneficio}\n\n{cta}',
    cta: 'Seja um dos primeiros a garantir — chama no WhatsApp.',
    channels: ['whatsapp', 'publicacao', 'stories'],
  },
  {
    id: 'liquidacao',
    category: 'Estoque e recuperação',
    name: 'Liquidação de estoque',
    whenToUse: 'Quando você precisa girar estoque parado ou encerrar uma coleção.',
    template: 'Liquidação: {produto} de {precoNormal} por {precoPromo}.\n\nEstamos liberando o estoque — {quantidade} unidades disponíveis.\n\n{beneficio}\n\n{cta}',
    cta: 'É enquanto durar o estoque.',
    channels: ['whatsapp', 'publicacao', 'stories'],
  },
  {
    id: 'campanha-sazonal',
    category: 'Fidelização e campanhas',
    name: 'Campanha sazonal',
    whenToUse: 'Em datas comemorativas, estações do ano ou eventos locais.',
    template: 'Especial de {ocasiao}!\n\n{produto} — {beneficio}\nDe {precoNormal} por {precoPromo}.\n\nVálido até {prazo}.',
    cta: 'Aproveite enquanto dura a campanha.',
    channels: ['whatsapp', 'publicacao', 'stories'],
  },
  {
    id: 'cliente-interessado',
    category: 'Recuperação e relacionamento',
    name: 'Cliente que demonstrou interesse',
    whenToUse: 'Quando um cliente olhou, perguntou, mas não fechou a compra.',
    template: 'Oi! Notei que você se interessou por {produto}.\n\nAinda tem disponível — {precoPromo} (de {precoNormal}).\n\n{beneficio}\n\n{cta}',
    cta: 'Quer que eu reserve um para você?',
    channels: ['whatsapp', 'atendimento'],
  },
  {
    id: 'recuperar-conversa',
    category: 'Recuperação e relacionamento',
    name: 'Recuperação de conversa sem resposta',
    whenToUse: 'Quando a conversa ficou parada e você quer reabrir sem ser invasivo.',
    template: 'Oi! Tudo bem?\n\nLembrei de você porque {produto} ainda está disponível — e o preço {precoPromo} é só até {prazo}.\n\nSe fizer sentido para você, é só chamar. Se não for a hora, tranquilo!',
    cta: 'Estou aqui se quiser conversar.',
    channels: ['whatsapp', 'atendimento'],
  },
  {
    id: 'recompra-antigos',
    category: 'Recuperação e relacionamento',
    name: 'Recompra para clientes antigos',
    whenToUse: 'Para clientes que já compraram antes e podem voltar.',
    template: 'Você já conhece {produto} — e agora ele está com condição especial.\n\nDe {precoNormal} por {precoPromo}.\n{beneficio}\n\nComo cliente que já comprou com a gente, você tem prioridade.',
    cta: 'Quer que eu separe um para você?',
    channels: ['whatsapp', 'atendimento'],
  },
  {
    id: 'lista-transmissao',
    category: 'Fidelização e campanhas',
    name: 'Lista de transmissão',
    whenToUse: 'Para enviar uma oferta a vários contatos sem ser um grupo.',
    template: 'Promoção exclusiva para quem está na minha lista!\n\n{produto}: {precoNormal} → {precoPromo}.\n{beneficio}\n\nVálido até {prazo}. Responda "quero" para reservar.',
    cta: 'Responda esta mensagem para garantir.',
    channels: ['whatsapp'],
  },
  {
    id: 'pos-venda',
    category: 'Recuperação e relacionamento',
    name: 'Mensagem de pós-venda',
    whenToUse: 'Depois da compra, para cuidar do relacionamento e gerar recompra.',
    template: 'Obrigada pela sua compra! 🙏\n\nEspero que {produto} seja exatamente o que você precisava.\n\nSe tiver qualquer dúvida, é só chamar. E se gostou, fica à vontade para indicar a loja para amigos!',
    cta: 'Estou aqui para o que precisar.',
    channels: ['whatsapp', 'atendimento'],
  },
  {
    id: 'complementar',
    category: 'Combos e ticket médio',
    name: 'Oferta complementar',
    whenToUse: 'Quando o cliente comprou um produto e você tem um complemento natural.',
    template: 'Já que você levou {produto}, tenho uma sugestão que combina:\n\n{complemento} — {beneficio}.\nPreço especial para quem já comprou: {precoPromo}.',
    cta: 'Quer ver como fica com o seu produto? Posso mandar uma foto.',
    channels: ['whatsapp', 'atendimento'],
  },
]

// ─── Respostas para WhatsApp e atendimento ───────────────────────────────────

export const whatsappScenarios: WhatsAppScenario[] = [
  {
    id: 'pergunta-preco',
    situation: 'Cliente pergunta o preço',
    response: 'Oi! {produto} está {precoNormal}. Mas hoje tem condição especial: {precoPromo}! Quer que eu te explique os detalhes?',
    tip: 'Responda rápido e sempre mencione o valor — não dê rodeios. Se houver oferta ativa, destaque.',
  },
  {
    id: 'vai-pensar',
    situation: 'Cliente diz que vai pensar',
    response: 'Claro, sem pressa! Só para você saber: a condição de {precoPromo} é válida até {prazo}. Se decidir, é só chamar. E se tiver qualquer dúvida, estou aqui.',
    tip: 'Não pressione. Lembre do prazo real da oferta para criar urgência sem ser abusivo.',
  },
  {
    id: 'produto-caro',
    situation: 'Cliente considera o produto caro',
    response: 'Entendo! Quando pensamos no valor, vale lembrar que {beneficio}. O custo fica diluído no tempo de uso e na qualidade. Se ajudar, podemos ver uma opção que se encaixe melhor no seu momento — me conta o que você procura.',
    tip: 'Nunca concorde que está caro. Explique o valor, não o preço. Ofereça alternativas reais.',
  },
  {
    id: 'pede-desconto',
    situation: 'Cliente pede desconto',
    response: 'O preço que pratiquei já é pensado para ser justo. Mas se você levar {quantidade} unidades, consigo fechar por {precoPromo}. Ou, se preferir, posso incluir {brinde} como cortesia. O que faz mais sentido para você?',
    tip: 'Nunca dê desconto sem pedir algo em troca (quantidade, indicação, pagamento à vista). Tenha alternativas prontas.',
  },
  {
    id: 'interesse-sem-conclusao',
    situation: 'Cliente demonstra interesse mas não conclui',
    response: 'Que bom que você gostou! Olha, tenho {quantidade} unidades disponíveis e a condição de {precoPromo} vai até {prazo}. Posso reservar uma para você enquanto decide. É só confirmar que eu seguro.',
    tip: 'Ofereça reservar temporariamente — mostra serviço e cria compromisso sem pressão.',
  },
  {
    id: 'pergunta-pagamento',
    situation: 'Cliente pergunta sobre pagamento',
    response: 'Aceitamos Pix, cartão em até {parcelas}x e dinheiro. No Pix tem {descontoPix}% de desconto. Qual forma fica melhor para você?',
    tip: 'Tenha as condições sempre à mão. Se há desconto no Pix, mencione — costuma fechar a venda.',
  },
  {
    id: 'compara-produto',
    situation: 'Cliente compara com outro produto',
    response: 'É uma boa pergunta! A diferença principal é que {beneficio}. O outro pode parecer parecido, mas {diferencial}. No fim, depende do que você prioriza. Me conta o que é mais importante para você que eu te ajudo a decidir.',
    tip: 'Nunca fale mal do concorrente. Destaque seu diferencial real e ajude o cliente a decidir.',
  },
  {
    id: 'indeciso',
    situation: 'Cliente quer comprar mas está indeciso',
    response: 'Entendo a indecisão! Vou te ajudar: o que está te segurando — o preço, a cor, ou se vai funcionar para você? Me fala que eu te dou uma recomendação honesta. Às vezes a gente descobre que é a peça certa, às vezes que tem algo melhor para seu momento.',
    tip: 'Descubra a objeção real perguntando. Posicione-se como consultor, não como vendedor pressionando.',
  },
  {
    id: 'cliente-antigo-nova-oferta',
    situation: 'Cliente antigo recebe nova oferta',
    response: 'Oi! Lembrei de você porque chegou {produto} — e acho que combina com o que você comprou da outra vez. Como você já é cliente, segurei o preço de {precoPromo} só para você até {prazo}. Quer dar uma olhada?',
    tip: 'Personalize a mensagem. O cliente se lembra de quem o trata como pessoa, não como número.',
  },
  {
    id: 'pos-compra',
    situation: 'Atendimento após a compra',
    response: 'Oi! Passando para saber se {produto} chegou certinho e se está tudo perfeito. Se tiver qualquer coisa, é só me chamar. E se gostou, ficaria feliz com sua indicação — ajuda muito a loja crescer!',
    tip: 'O pós-venda gera recompra e indicação. Não seja chato, mas mostre que se importa.',
  },
]

// ─── Gatilhos mentais ────────────────────────────────────────────────────────

export const mentalTriggers: MentalTrigger[] = [
  {
    id: 'clareza-valor',
    name: 'Clareza de valor',
    principle: 'Deixe claro o que o produto vale e por que vale. O cliente precisa entender o valor antes de pensar no preço.',
    whenToUse: 'Sempre. Especialmente em produtos com preço acima da média do mercado.',
    example: 'Em vez de "camiseta R$ 80", diga "camiseta em algodão pima, que dura 3x mais — R$ 80".',
    warning: 'Não confunda clareza com listing de especificações. Mostre o que o valor significa na prática.',
  },
  {
    id: 'prova-social',
    name: 'Prova social verdadeira',
    principle: 'Mostre que outras pessoas já compraram e ficaram satisfeitas. Aprovação de terceiros reduz o medo de errar.',
    whenToUse: 'Quando você tem avaliações, fotos de clientes usando, ou um histórico de vendas que pode ser mostrado.',
    example: 'Poste fotos reais de clientes com o produto e o depoimento verdadeiro deles.',
    warning: 'Nunca invente depoimentos. Depoimentos falsos destruídos destroem confiança e podem configurar propaganda enganosa.',
  },
  {
    id: 'escassez-real',
    name: 'Escassez real',
    principle: 'Quando algo é limitado de verdade, o cliente sente que precisa agir antes que acabe.',
    whenToUse: 'Apenas quando a escassez é real: restam poucas unidades, produção limitada, edição especial.',
    example: '"Restam apenas 5 unidades do tamanho M" — quando de fato restam 5.',
    warning: 'Não finte escassez. Se você diz "últimas 3" e tem 30, o cliente descobre e nunca mais confia.',
  },
  {
    id: 'urgencia-prazo',
    name: 'Urgência baseada em prazos reais',
    principle: 'Um prazo real força a decisão sem ser agressivo. O cliente sabe que depois daquela data a condição acaba.',
    whenToUse: 'Em promoções com data de término real, campanhas sazonais, ou condições por tempo determinado.',
    example: '"Preço promocional válido até sexta, 23h59" — e você realmente volta ao preço normal no sábado.',
    warning: 'Se você estende o prazo repetidamente, a urgência perde credibilidade. Cumpra o prazo que comunicou.',
  },
  {
    id: 'reciprocidade',
    name: 'Reciprocidade',
    principle: 'Quando você oferece algo primeiro (um brinde, uma dica, um atendimento), o cliente sente vontade de retribuir.',
    whenToUse: 'Ao oferecer brindes, amostras, conteúdo útil gratuito, ou atendimento acima da média.',
    example: 'Inclua um brinde-surpresa no pedido. O cliente fica mais propenso a indicar e recomprar.',
    warning: 'Não use reciprocidade como chantagem. O brinde deve ser genuíno, não uma cobrança velada.',
  },
  {
    id: 'conveniencia',
    name: 'Conveniência',
    principle: 'Reduza o esforço do cliente para comprar. Quanto mais fácil, maior a chance de fechar.',
    whenToUse: 'Quando você pode oferecer entrega, pagamento simplificado, ou resolver uma dor do cliente.',
    example: '"Entrego no seu endereço hoje à tarde e você paga quando receber" — remove barreiras.',
    warning: 'Não prometa conveniências que você não consegue cumprir. Entrega atrasada gera mais frustração que atração.',
  },
  {
    id: 'comparacao-alternativas',
    name: 'Comparação de alternativas',
    principle: 'Ajude o cliente a comparar suas opções de forma clara. Ele decide melhor e confia mais em quem o ajudou a decidir.',
    whenToUse: 'Quando você tem diferentes versões ou níveis de um produto.',
    example: 'Apresente 3 opções (básico, intermediário, premium) com os benefícios de cada uma, lado a lado.',
    warning: 'Não manipule a comparação para empurrar a opção mais cara. Apresente honestamente os prós e contras.',
  },
  {
    id: 'reducao-risco',
    name: 'Redução de risco',
    principle: 'Se você oferece garantia, troca, ou devolução, mostre isso. O cliente tem medo de errar — reduza esse medo.',
    whenToUse: 'Quando você tem uma política real de troca, garantia, ou satisfação garantida.',
    example: '"Não gostou? Você tem 7 dias para trocar sem custo nenhum" — quando a política realmente existe.',
    warning: 'Não prometa garantia ou devolução que você não vai cumprir. A confiança vai embora na primeira negativa.',
  },
  {
    id: 'beneficios-diferenciais',
    name: 'Benefícios e diferenciais',
    principle: 'Destaque o que seu produto tem de único. Não é sobre ser melhor em tudo — é sobre ser diferente no que importa.',
    whenToUse: 'Quando seu produto tem características que os concorrentes não oferecem.',
    example: 'Em vez de "qualidade premium", diga "feito à mão em couro vegetal, com costura reforçada nos pontos de maior desgaste".',
    warning: 'Diferenciais devem ser reais e verificáveis. "Melhor do mercado" é vago e difícil de sustentar.',
  },
  {
    id: 'exclusividade',
    name: 'Exclusividade verdadeira',
    principle: 'Quando o produto ou condição é exclusivo de verdade, o cliente sente que tem acesso a algo que poucos têm.',
    whenToUse: 'Em edições limitadas, parcerias exclusivas, ou condições para um grupo seleto de clientes.',
    example: '"Edição limitada de 30 peças, numeradas à mão" — quando realmente é limitada e numerada.',
    warning: 'Exclusividade fabricada (dizer "exclusivo" de algo que todo mundo tem) destrói credibilidade.',
  },
]

// ─── Técnicas de fechamento e CTA ────────────────────────────────────────────

export const closingTechniques: ClosingTechnique[] = [
  {
    id: 'cta-direto',
    name: 'Chamada direta à ação',
    description: 'Diga claramente o que o cliente deve fazer a seguir. Sem ambiguidade.',
    example: 'Chama no WhatsApp e reserva o seu: [link]',
  },
  {
    id: 'cta-escassez',
    name: 'Fechar com escassez real',
    description: 'Lembre o cliente que a condição é limitada — quando for verdade.',
    example: 'Só restam 3 unidades. Quer que eu separe uma para você?',
  },
  {
    id: 'cta-escolha',
    name: 'Oferecer escolha (não sim/não)',
    description: 'Em vez de perguntar "quer comprar?", dê duas opções que levam à venda.',
    example: 'Prefere retirar na loja ou quer que eu entregue? Pix ou cartão?',
  },
  {
    id: 'cta-reserva',
    name: 'Oferecer reservar temporariamente',
    description: 'Propõe segurar o produto por um tempo, sem compromisso. Reduz o risco para o cliente.',
    example: 'Posso reservar para você até amanhã. Assim você decide com calma.',
  },
  {
    id: 'cta-pergunta-final',
    name: 'Pergunta final de fechamento',
    description: 'Uma pergunta que assume a venda e ajuda a descobrir a última objeção.',
    example: 'O que falta para você fechar? Se for o preço, vejo o que consigo fazer.',
  },
  {
    id: 'cta-resumo',
    name: 'Resumo da oferta + prazo',
    description: 'Recapitule tudo o que o cliente recebe e o prazo, reforçando o valor antes do pedido final.',
    example: 'Então: {produto} por {precoPromo}, com {brinde} de brinde, até {prazo}. Vou separar?',
  },
]
