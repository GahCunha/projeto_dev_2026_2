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

O primeiro início cria as tabelas por migration e cadastra três oficinas pelo seed. A API responde em `http://localhost:3333`.

O administrador de demonstração também é criado pelo seed:

```text
E-mail: admin@feitoamao.local
Senha: FeitoAMao@2026
```

Essas credenciais são apenas para desenvolvimento e podem ser alteradas pelas variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

Verifique a aplicação:

```bash
curl http://localhost:3333/api/saude
curl http://localhost:3333/api/oficinas
```

A documentação interativa fica disponível em `http://localhost:3333/api/docs` e o documento OpenAPI em `http://localhost:3333/api/docs.json`.

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

### Criar uma inscrição

```json
{
  "name": "Maria Artesã",
  "email": "maria@example.com",
  "workshopId": "UUID_DA_OFICINA"
}
```

A inscrição é recusada quando os dados são inválidos, a oficina está inativa ou encerrada, não há vagas, ou o mesmo e-mail já está inscrito na oficina.

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
