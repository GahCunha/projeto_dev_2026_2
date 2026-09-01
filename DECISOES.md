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


## Ambiguidades decididas até agora

### Oficina desativada com inscrições existentes

A oficina deixa de aparecer para visitantes, mas permanece no banco e continua relacionada às inscrições antigas. Não é apagado do histórico.

### Inscrição duplicada

O mesmo e-mail não poderá se inscrever duas vezes na mesma oficina. A restrição também existe no banco para proteger a regra em situações concorrentes.

### Datas dos dados iniciais

O seed cria oficinas com datas relativas ao momento da execução. Assim, os dados de demonstração continuam futuros quando o projeto é avaliado.

## Uso de IA

A IA inicialmente foi utilizada para criar a arquitetura básica do projeto, discutir arquitetura, estruturar o projeto e revisar decisões.