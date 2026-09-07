# Publicação no Railway

O deploy utiliza o `Dockerfile` da raiz para compilar frontend e backend no mesmo serviço. A aplicação e a API compartilham a origem pública, evitando configuração de CORS e cookies entre domínios.

## Serviços do projeto

Crie três serviços no mesmo projeto Railway:

1. **Aplicação:** este repositório e a branch `deploy/railway`.
2. **Postgres:** template oficial do PostgreSQL.
3. **Mailpit:** imagem Docker `axllent/mailpit:v1.27`.

Gere um domínio público para a Aplicação e outro para a interface do Mailpit. O PostgreSQL e a porta SMTP do Mailpit devem permanecer na rede privada.

## Variáveis da Aplicação

```text
NODE_ENV=production
PORT=3333
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<SEGREDO_ALEATORIO_COM_32_OU_MAIS_CARACTERES>
JWT_EXPIRES_SECONDS=7200
AUTH_COOKIE_NAME=feito_a_mao_session
COOKIE_SECURE=true
ADMIN_NAME=Administrador
ADMIN_EMAIL=<EMAIL_DO_ADMINISTRADOR>
ADMIN_PASSWORD=<SENHA_FORTE>
EMAIL_ENABLED=true
SMTP_HOST=<HOST_PRIVADO_DO_MAILPIT>
SMTP_PORT=1025
SMTP_FROM=Feito à Mão <nao-responda@feitoamao.local>
FRONTEND_URL=https://<DOMINIO_PUBLICO_DA_APLICACAO>
```

Use a referência de variável oferecida pelo Railway para `DATABASE_URL`. Não copie uma senha de banco para o repositório.

## Configuração da Aplicação

- Builder: Dockerfile
- Dockerfile: `/Dockerfile`
- Healthcheck: `/api/saude`
- Porta pública: `3333`
- Restart policy: `On Failure`

O comando inicial aplica migrations, cria o administrador e cadastra as oficinas somente quando o catálogo estiver vazio. Reinícios posteriores preservam inscrições e alterações administrativas.

## Verificação

Depois do deploy:

1. Abra `/api/saude` e confirme a resposta `status: ok`.
2. Abra a página inicial e faça uma inscrição.
3. Confira a mensagem na interface pública do Mailpit.
4. Simule o pagamento pelo link recebido.
5. Entre em `/admin` e confirme a inscrição.
6. Reinicie o serviço e confirme que os dados permanecem no PostgreSQL.

O Mailpit é adequado apenas para demonstração. Em uma publicação destinada a usuários reais, substitua-o por um provedor SMTP e não exponha sua interface publicamente.
