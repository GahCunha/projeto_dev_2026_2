# Decisões do projeto

Este documento registra as escolhas que alteram o comportamento do **Feito à Mão**, seus trade-offs e os limites assumidos na entrega.

## Produto e modelagem

Escolhi oficinas artesanais porque o tema conecta o catálogo administrável pedido no desafio a inscrições públicas. Uma oficina representa o conteúdo; cada turma define preço, capacidade e agenda. A turma pode possuir vários encontros, permitindo cursos com mais de um dia sem duplicar a oficina.

Oficinas e turmas desativadas desaparecem do catálogo público, mas continuam relacionadas às inscrições anteriores. Essa desativação lógica preserva o histórico.

## Stack e arquitetura

Usei React, Vite e Tailwind CSS no frontend; Node.js, Express, TypeScript e Zod na API; Prisma e PostgreSQL nos dados. O Docker Compose inicia a aplicação completa com o mesmo comando em qualquer máquina compatível.

O backend separa responsabilidades por módulo:

- **Controller**: traduz requisições HTTP em chamadas da aplicação
- **Schema**: valida entradas com Zod
- **Service**: concentra regras de negócio
- **Repository**: acessa o PostgreSQL pelo Prisma

Essa estrutura facilita localizar regras e testar fluxos. Em troca, exige mais configuração que uma aplicação monolítica com SQLite. Não adotei interfaces ou um contêiner de injeção de dependência porque o tamanho atual não compensaria essa abstração.

## Autenticação

O administrador entra com uma senha protegida por bcrypt. A API armazena o JSON Web Token (JWT) em cookie `httpOnly`, inacessível ao JavaScript do navegador, e encerra sua validade após duas horas.

Essa solução dispensa uma tabela de sessões, mas não revoga individualmente um token antes da expiração. Aceitei esse limite porque a entrega possui um único perfil administrativo e sessões curtas.

## Inscrições e vagas

O mesmo e-mail pode se inscrever apenas uma vez em cada turma. Inscrições pendentes e confirmadas ocupam vaga; o cancelamento devolve a vaga.

A quantidade disponível não fica duplicada no banco. A API calcula o valor com base na capacidade e nas inscrições ativas. Durante uma inscrição, uma transação bloqueia a turma consultada para impedir que solicitações simultâneas ocupem a última vaga.

Uma inscrição pode passar de `PENDENTE` para `CONFIRMADA` ou `CANCELADA`. Uma confirmação ainda pode ser cancelada, mas registros cancelados não são reabertos.

## Pagamento e e-mail simulados

Turmas pagas geram um pagamento pendente separado do status da inscrição. O participante recebe um link que simula o PIX e o administrador só pode confirmar a inscrição depois desse passo. O Mailpit captura as mensagens, portanto nenhum pagamento ou e-mail real é enviado.

Os links de pagamento e cancelamento usam tokens aleatórios. O banco armazena apenas os hashes, limitando o impacto de uma eventual exposição dos dados.

## Dados iniciais

A seed cria um administrador, seis oficinas e suas turmas com datas futuras relativas à execução. Ela não cria inscrições porque registros artificiais ignorariam os fluxos de e-mail, pagamento e cancelamento. Reinícios preservam os dados; a remoção do volume permite repetir a instalação do zero.

## Estratégia de testes

Os testes priorizam os fluxos que não podem quebrar: inscrição válida e inválida, bloqueio do painel sem autenticação e mudança de status. A suíte também cobre concorrência pela última vaga, filtros, paginação, catálogo público, pagamento e cancelamento.

## Escopo deixado de fora

- Pagamento real, pois exigiria um provedor financeiro e credenciais externas
- Recuperação de senha e múltiplos administradores, pois o desafio exige apenas um painel protegido
- Lista de espera, histórico de alterações
- Rate limit e proteção avançada contra spam, adequados a uma aplicação pública real

## Uso de inteligência artificial

Usei inteligência artificial como apoio de desenvolvimento para discutir alternativas, gerar trechos repetitivos e revisar código. O Google Stitch produziu uma referência inicial de identidade visual; usei esse material como direção inicial, adaptei composição, componentes, responsividade, contraste e temas durante a implementação.

Também usei skills especializadas durante o trabalho: Playwright para observar a aplicação renderizada em resoluções de desktop e celular, interface design para revisar hierarquia e espaçamento, e napkin para manter orientações recorrentes do projeto.

A IA sugeriu popular a seed com muitas oficinas e inscrições prontas. Esses registros poluíam a demonstração e não passavam pelos fluxos de e-mail, PIX e cancelamento. Identifiquei o problema ao testar como participante, reduzi o catálogo para seis oficinas e removi as inscrições artificiais.
