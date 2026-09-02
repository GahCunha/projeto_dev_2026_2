# Decisões do Projeto

## Tema escolhido

**Feito à Mão** é uma plataforma de oficinas artesanais. O visitante escolhe uma oficina e solicita uma inscrição; o administrador gerencia as oficinas e decide se cada inscrição será confirmada ou cancelada.

O tema se encaixa na especificação porque as oficinas são as opções gerenciáveis e as inscrições são os registros enviados pelo público.

## Stack escolhida

Usamos Node.js, Express, TypeScript, Zod, Prisma, PostgreSQL e Docker Compose.

### O que ganhamos

- TypeScript ajuda a detectar incompatibilidades antes da execução.
- Zod centraliza a validação dos dados recebidos pela API.
- Prisma fornece migrations, seed e consultas tipadas.
- Docker Compose torna API e banco reproduzíveis com um comando.
- PostgreSQL permite usar um banco relacional semelhante ao de um ambiente de produção.

### O que perdemos

- A configuração inicial é maior do que seria com SQLite.
- Docker passa a ser um pré-requisito no caminho principal.
- Express exige integrar manualmente peças que frameworks completos oferecem prontas.

## Arquitetura do backend

O código é organizado por módulo. Cada módulo pode conter rotas, controller, schemas, service e repository.

- **Controller:** traduz HTTP em chamadas da aplicação.
- **Schema:** valida dados de entrada com Zod.
- **Service:** aplica regras de negócio.
- **Repository:** concentra o acesso ao banco com Prisma.

Optamos por camadas simples, sem interfaces ou injeção de dependência enquanto elas não trouxerem benefício concreto.

## Autenticação administrativa

Usamos senha protegida com bcrypt e JWT armazenado em cookie `httpOnly`. O token expira após duas horas, e o middleware consulta o usuário no banco antes de liberar a rota. O token não é exposto ao JavaScript do frontend nem retornado no corpo da resposta.

Ganhamos uma autenticação simples para uma API separada do frontend, sem manter uma tabela de sessões. Em contrapartida, não temos revogação individual de tokens: o logout remove o cookie do navegador, mas um token copiado permanece válido até expirar enquanto o usuário existir. Para o escopo de um único administrador e sessões curtas, aceitamos essa limitação.

O seed cria um administrador com credenciais configuradas por variáveis de ambiente.


## Ambiguidades decididas até agora

### Oficina desativada com inscrições existentes

A oficina deixa de aparecer para visitantes, mas permanece no banco e continua relacionada às inscrições antigas. Não é apagado do histórico.

### Inscrição duplicada

O mesmo e-mail não poderá se inscrever duas vezes na mesma oficina. A restrição também existe no banco para proteger a regra em situações concorrentes.

### Ocupação das vagas

Inscrições `PENDENTE` e `CONFIRMADA` ocupam vaga. Uma vaga volta a ficar disponível somente quando a inscrição é `CANCELADA`. Preferimos não receber mais solicitações do que a capacidade anunciada comporta.

### Transições de status

Uma inscrição `PENDENTE` pode passar para `CONFIRMADA` ou `CANCELADA`, e uma inscrição `CONFIRMADA` pode passar para `CANCELADA`. Uma inscrição cancelada não pode ser reaberta e nenhuma inscrição volta para `PENDENTE`. Como a pendência já reserva uma vaga, a confirmação não altera a ocupação. A atualização também compara o status atual no banco para detectar alterações concorrentes.

### Listagem administrativa de oficinas

A área administrativa lista oficinas ativas e inativas, diferentemente da área pública. A consulta aceita busca por título ou local, filtro de atividade e paginação, preparando o contrato necessário para o painel sem expor essas informações na rota pública.

### Edição e desativação de oficinas

Editar dados e alterar o estado ativo são operações separadas. Isso evita desativação acidental em uma edição comum. A capacidade nunca pode ser reduzida abaixo das inscrições pendentes e confirmadas. Desativar uma oficina não remove seus dados ou inscrições, apenas a retira da consulta pública.

### Apresentação pública das oficinas

A API pública omite oficinas inativas ou cuja data já passou. Categoria, URL de capa e materiais ficam armazenados com a oficina e são retornados ao frontend. O filtro visual por categoria será feito inicialmente no frontend.

`availableSeats` não é armazenado no banco. A cada consulta pública, ele é calculado subtraindo da capacidade as inscrições `PENDENTE` e `CONFIRMADA`; inscrições canceladas não ocupam vaga. Isso evita sincronização manual e dados divergentes.

### Datas dos dados iniciais

O seed cria oficinas com datas relativas ao momento da execução. Assim, os dados de demonstração continuam futuros quando o projeto é avaliado.

## Uso de IA

A IA inicialmente foi utilizada para criar a arquitetura básica do projeto, discutir arquitetura, estruturar o projeto e revisar decisões.
