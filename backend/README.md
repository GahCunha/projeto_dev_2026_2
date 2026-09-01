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

Verifique a aplicação:

```bash
curl http://localhost:3333/api/saude
curl http://localhost:3333/api/oficinas
```

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
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:deploy` | Aplica as migrations versionadas |
| `npm run db:seed` | Cadastra os dados iniciais |

## Rotas disponíveis

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/saude` | Público | Verifica se a API está ativa |
| `GET` | `/api/oficinas` | Público | Lista oficinas ativas por data |
| `GET` | `/api/oficinas/:id` | Público | Consulta uma oficina ativa |
