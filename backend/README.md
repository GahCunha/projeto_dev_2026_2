# Feito à Mão

Plataforma para divulgação de oficinas artesanais e gerenciamento de inscrições. Visitantes poderão encontrar oficinas de carpintaria, crochê, cerâmica e outros ofícios; administradores cuidarão das turmas, vagas e inscrições.

> O projeto está em desenvolvimento. Neste momento, a API já possui estrutura modular, banco versionado e consulta pública de oficinas ativas.

## Tecnologias

- Node.js, Express e TypeScript
- Zod para validação
- Prisma ORM e PostgreSQL
- Docker e Docker Compose

## Como executar com Docker

### Pré-requisitos

- Git
- Docker com o comando `docker compose`

### Passos

```bash
git clone <URL_DO_REPOSITORIO>
cd projeto_dev_2026_2
docker compose up --build
```

O primeiro início cria as tabelas por migration, cadastra três oficinas pelo seed e constrói o frontend. A aplicação fica disponível em `http://localhost:5173`, a API responde em `http://localhost:3333` e a caixa de e-mails local fica em `http://localhost:8025`.

O administrador de demonstração também é criado pelo seed:

```text
E-mail: admin@feitoamao.local
Senha: FeitoAMao@2026
```

Essas credenciais são apenas para desenvolvimento e podem ser alteradas pelas variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

Verifique a API:

```bash
curl http://localhost:3333/api/saude
```

Depois, abra `http://localhost:5173` no navegador.

No ambiente Docker, o Nginx do frontend encaminha chamadas em `/api` para a API. No desenvolvimento local, o Vite faz o mesmo encaminhamento.

A documentação interativa fica disponível em `http://localhost:3333/api/docs` e o documento OpenAPI em `http://localhost:3333/api/docs.json`.

## E-mails locais

No ambiente Docker, a API envia notificações para o Mailpit quando uma inscrição é criada, confirmada ou cancelada. Nenhuma mensagem sai para a internet: todas ficam disponíveis em `http://localhost:8025` para inspeção durante o desenvolvimento.

No desenvolvimento sem Docker, mantenha `EMAIL_ENABLED=false` se não houver um servidor SMTP local. Para usar outro SMTP de desenvolvimento, configure `EMAIL_ENABLED`, `SMTP_HOST`, `SMTP_PORT` e `SMTP_FROM` no arquivo `.env`.

Uma falha no envio não desfaz a criação ou a mudança de status da inscrição. A operação principal permanece salva e a API registra apenas uma mensagem genérica, sem expor os dados da pessoa.

Para encerrar:

```bash
docker compose down
```

Para também excluir o volume do banco e recomeçar do zero:

```bash
docker compose down --volumes
```

## Desenvolvimento local

É possível executar a API localmente e manter apenas o PostgreSQL no Docker:

```bash
cd backend
npm install
```

Copie `.env.example` para `.env`, inicie o banco e prepare os dados:

```bash
docker compose -f ../compose.yaml up -d banco
npm run db:deploy
npm run db:seed
npm run dev
```

## Scripts

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia a API com recarregamento automático |
| `npm run build` | Compila o TypeScript |
| `npm run check` | Verifica os tipos sem gerar arquivos |
| `npm test` | Executa os testes automatizados |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:deploy` | Aplica as migrations versionadas |
| `npm run db:seed` | Cadastra os dados iniciais |

## Rotas disponíveis

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/saude` | Público | Verifica se a API está ativa |
| `GET` | `/api/docs` | Público | Abre a documentação Swagger UI |
| `GET` | `/api/docs.json` | Público | Retorna o documento OpenAPI |
| `GET` | `/api/oficinas` | Público | Lista oficinas ativas por data |
| `GET` | `/api/oficinas/:id` | Público | Consulta uma oficina ativa |
| `POST` | `/api/inscricoes` | Público | Cria uma inscrição pendente |
| `POST` | `/api/admin/auth/login` | Público | Autentica o administrador |
| `POST` | `/api/admin/auth/logout` | Administrador | Encerra a sessão |
| `GET` | `/api/admin/auth/me` | Administrador | Retorna o usuário autenticado |
| `GET` | `/api/admin/inscricoes` | Administrador | Lista inscrições com busca, filtro e paginação |
| `PATCH` | `/api/admin/inscricoes/:id/status` | Administrador | Confirma ou cancela uma inscrição |
| `GET` | `/api/admin/oficinas` | Administrador | Lista oficinas com busca, filtro e paginação |
| `POST` | `/api/admin/oficinas` | Administrador | Cria uma oficina |
| `PATCH` | `/api/admin/oficinas/:id` | Administrador | Edita os dados de uma oficina |
| `PATCH` | `/api/admin/oficinas/:id/status` | Administrador | Ativa ou desativa uma oficina |

### Criar uma inscrição

```json
{
  "name": "Maria Artesã",
  "email": "maria@example.com",
  "workshopId": "UUID_DA_OFICINA"
}
```

Para editar, envie um ou mais desses campos para `PATCH /api/admin/oficinas/:id`. A capacidade não pode ser reduzida para um valor menor que a quantidade de inscrições pendentes e confirmadas.

O status é alterado separadamente:

```json
{
  "active": false
}
```

Uma oficina desativada continua armazenada com suas inscrições, mas deixa de aparecer nas rotas públicas.

A inscrição é recusada quando os dados são inválidos, a oficina está inativa ou encerrada, não há vagas, ou o mesmo e-mail já está inscrito na oficina.

As consultas públicas de oficinas retornam somente oficinas ativas e futuras. Cada oficina inclui `category`, `imageUrl`, `materials` e `availableSeats`. As vagas disponíveis não são armazenadas: a API subtrai da capacidade as inscrições pendentes e confirmadas em cada consulta.

## Testes

Com os containers ativos, execute na raiz do repositório:

```bash
docker compose exec api npm test
```

Os testes criam dados próprios e os removem ao terminar, sem apagar o seed de demonstração.

## Autenticação

O login recebe e-mail e senha:

```json
{
  "email": "admin@feitoamao.local",
  "password": "FeitoAMao@2026"
}
```

Quando as credenciais são válidas, a API grava um JWT em cookie `httpOnly`. O token não é devolvido no JSON e expira após duas horas. Rotas protegidas verificam a assinatura do token e se o usuário ainda existe no banco.

Em uma implantação HTTPS, configure obrigatoriamente `COOKIE_SECURE=true` e substitua `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

Também é possível testar o fluxo pelo Swagger UI: execute primeiro `/api/admin/auth/login`; como a documentação está na mesma origem da API, o navegador mantém o cookie para as chamadas protegidas seguintes.

### Listagem administrativa

```http
GET /api/admin/inscricoes?status=PENDENTE&search=maria&page=1&pageSize=10
```

Os parâmetros são opcionais. A API limita cada página a 50 itens e ordena as inscrições pela data da oficina. Cada item inclui um resumo da oficina relacionada.

### Alteração de status

```http
PATCH /api/admin/inscricoes/UUID_DA_INSCRICAO/status
Content-Type: application/json

{
  "status": "CONFIRMADA"
}
```

Uma inscrição pendente pode ser confirmada ou cancelada; uma confirmada pode ser cancelada. Inscrições canceladas não podem ser reabertas e nenhuma inscrição pode voltar ao estado pendente. Como inscrições pendentes já ocupam vaga, confirmá-las não aumenta a ocupação da oficina.

### Gestão de oficinas

```http
GET /api/admin/oficinas?active=true&search=ceramica&page=1&pageSize=10
```

Os filtros são opcionais. Para criar uma oficina, envie título, descrição, data futura, duração em minutos, capacidade e local:

```json
{
  "title": "Cerâmica fria",
  "category": "Modelagem",
  "description": "Aprenda a modelar e finalizar pequenas peças decorativas.",
  "imageUrl": "https://example.com/ceramica.jpg",
  "materials": ["Avental", "Pano de limpeza"],
  "startsAt": "2026-10-20T14:00:00.000Z",
  "durationMin": 180,
  "capacity": 12,
  "location": "Sala 2"
}
```

## Variáveis de ambiente

| Variável | Finalidade |
|---|---|
| `DATABASE_URL` | Conexão com o PostgreSQL |
| `PORT` | Porta HTTP da API |
| `JWT_SECRET` | Chave de assinatura dos tokens; mínimo de 32 caracteres |
| `JWT_EXPIRES_SECONDS` | Tempo de validade da sessão em segundos |
| `AUTH_COOKIE_NAME` | Nome do cookie de autenticação |
| `COOKIE_SECURE` | Exige HTTPS para enviar o cookie |
| `ADMIN_NAME` | Nome do administrador criado pelo seed |
| `ADMIN_EMAIL` | E-mail do administrador inicial |
| `ADMIN_PASSWORD` | Senha do administrador inicial |
| `EMAIL_ENABLED` | Ativa ou desativa o envio de notificações |
| `SMTP_HOST` | Endereço do servidor SMTP; no Docker, `mailpit` |
| `SMTP_PORT` | Porta SMTP; o Mailpit utiliza `1025` |
| `SMTP_FROM` | Remetente exibido nas mensagens |
