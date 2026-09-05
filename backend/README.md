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
| `GET` | `/api/oficinas/:id/turmas` | Público | Lista as turmas disponíveis da oficina |
| `POST` | `/api/inscricoes` | Público | Cria uma inscrição pendente |
| `GET` | `/api/inscricoes/cancelamento/:token` | Link privado | Consulta os dados para cancelamento |
| `POST` | `/api/inscricoes/cancelamento/:token` | Link privado | Cancela a própria inscrição |
| `GET` | `/api/inscricoes/pagamento/:token` | Link privado | Consulta o pagamento ilustrativo |
| `POST` | `/api/inscricoes/pagamento/:token` | Link privado | Simula o pagamento PIX |
| `POST` | `/api/admin/auth/login` | Público | Autentica o administrador |
| `POST` | `/api/admin/auth/logout` | Administrador | Encerra a sessão |
| `GET` | `/api/admin/auth/me` | Administrador | Retorna o usuário autenticado |
| `GET` | `/api/admin/inscricoes` | Administrador | Lista inscrições com busca, filtro e paginação |
| `PATCH` | `/api/admin/inscricoes/:id/status` | Administrador | Confirma ou cancela uma inscrição |
| `GET` | `/api/admin/oficinas` | Administrador | Lista oficinas com busca, filtro e paginação |
| `POST` | `/api/admin/oficinas` | Administrador | Cria uma oficina |
| `PATCH` | `/api/admin/oficinas/:id` | Administrador | Edita os dados de uma oficina |
| `PATCH` | `/api/admin/oficinas/:id/status` | Administrador | Ativa ou desativa uma oficina |
| `GET` | `/api/admin/oficinas/:id/turmas` | Administrador | Lista as turmas da oficina |
| `POST` | `/api/admin/oficinas/:id/turmas` | Administrador | Cria uma turma com seus encontros |
| `PATCH` | `/api/admin/turmas/:id` | Administrador | Edita turma e encontros |
| `PATCH` | `/api/admin/turmas/:id/status` | Administrador | Ativa ou desativa uma turma |

### Criar uma inscrição

```json
{
  "name": "Maria Artesã",
  "email": "maria@example.com",
  "classId": "UUID_DA_TURMA"
}
```

Para editar uma oficina, envie um ou mais campos permanentes para `PATCH /api/admin/oficinas/:id`. Agenda, valor e capacidade pertencem às turmas. A capacidade de uma turma não pode ser reduzida para menos que suas inscrições pendentes e confirmadas.

O status é alterado separadamente:

```json
{
  "active": false
}
```

Uma oficina desativada continua armazenada com suas inscrições, mas deixa de aparecer nas rotas públicas.

A inscrição é recusada quando os dados são inválidos, a oficina ou turma está inativa, não há encontro futuro, não há vagas, ou o mesmo e-mail já está inscrito na turma. A verificação e a reserva acontecem na mesma transação, com bloqueio da turma, para impedir que duas requisições simultâneas ocupem a última vaga.

Ao criar uma inscrição, a API gera um token aleatório e armazena somente seu hash. O token original aparece no link enviado por e-mail e permite ao visitante consultar e cancelar apenas a própria inscrição. O cancelamento libera a vaga imediatamente. O hash nunca é retornado nas respostas da API.

As consultas públicas retornam somente oficinas ativas com alguma turma ativa e encontro futuro. Cada oficina inclui `category`, `imageUrl`, `materials`, `classCount`, `nextMeetingAt` e totais calculados de vagas. As vagas disponíveis não são armazenadas: a API soma as capacidades das turmas elegíveis e desconta suas inscrições pendentes e confirmadas.

Turmas pagas recebem um pagamento `PENDENTE`, separado do status da inscrição. O e-mail contém um link que simula o PIX sem movimentar dinheiro real. Após a simulação, o pagamento fica `PAGO`, o administrador é notificado e pode confirmar a inscrição. Turmas gratuitas usam o status `ISENTO`.

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

Os parâmetros são opcionais. A API limita cada página a 50 itens e ordena as inscrições pela criação. Cada item inclui a oficina, a turma e todos os encontros relacionados.

### Alteração de status

```http
PATCH /api/admin/inscricoes/UUID_DA_INSCRICAO/status
Content-Type: application/json

{
  "status": "CONFIRMADA"
}
```

Uma inscrição pendente pode ser confirmada ou cancelada; uma confirmada pode ser cancelada. Inscrições canceladas não podem ser reabertas e nenhuma inscrição pode voltar ao estado pendente. Uma inscrição paga só pode ser confirmada após o PIX ilustrativo. Como inscrições pendentes já ocupam vaga, confirmá-las não aumenta a ocupação da turma.

### Gestão de oficinas

```http
GET /api/admin/oficinas?active=true&search=ceramica&page=1&pageSize=10
```

Os filtros são opcionais. Para criar uma oficina, envie apenas os dados permanentes do catálogo:

```json
{
  "title": "Cerâmica fria",
  "category": "Modelagem",
  "description": "Aprenda a modelar e finalizar pequenas peças decorativas.",
  "imageUrl": "https://example.com/ceramica.jpg",
  "materials": ["Avental", "Pano de limpeza"]
}
```

Depois, crie uma turma informando nome, capacidade, valor em reais e um ou mais encontros com início, fim e local.

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
| `FRONTEND_URL` | Origem usada para montar os links públicos de cancelamento e pagamento |
