import { env } from "../config/environment.js";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Feito à Mão API",
    version: "0.1.0",
    description:
      "API para divulgação de oficinas artesanais, inscrições públicas e administração da plataforma Feito à Mão.",
  },
  servers: [{ url: "/", description: "Servidor atual" }],
  tags: [
    { name: "Sistema", description: "Saúde e informações da API" },
    { name: "Oficinas", description: "Consulta pública de oficinas" },
    { name: "Inscrições", description: "Inscrições públicas em oficinas" },
    { name: "Autenticação", description: "Sessão do administrador" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: env.AUTH_COOKIE_NAME,
        description: "Cookie httpOnly criado pela rota de login.",
      },
    },
    schemas: {
      Workshop: {
        type: "object",
        required: [
          "id",
          "title",
          "description",
          "startsAt",
          "durationMin",
          "capacity",
          "location",
          "active",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Carpintaria para iniciantes" },
          description: {
            type: "string",
            example: "Aprenda técnicas fundamentais e construa sua primeira peça em madeira.",
          },
          startsAt: { type: "string", format: "date-time" },
          durationMin: { type: "integer", minimum: 30, example: 240 },
          capacity: { type: "integer", minimum: 1, example: 12 },
          location: { type: "string", example: "Ateliê Madeira, sala 1" },
          active: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Enrollment: {
        type: "object",
        required: ["id", "name", "email", "status", "workshopId", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Maria Artesã" },
          email: { type: "string", format: "email", example: "maria@example.com" },
          status: {
            type: "string",
            enum: ["PENDENTE", "CONFIRMADA", "CANCELADA"],
            example: "PENDENTE",
          },
          workshopId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        required: ["id", "name", "email"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Administrador" },
          email: { type: "string", format: "email", example: "admin@feitoamao.local" },
        },
      },
      CreateEnrollmentInput: {
        type: "object",
        additionalProperties: false,
        required: ["name", "email", "workshopId"],
        properties: {
          name: { type: "string", minLength: 3, maxLength: 120, example: "Maria Artesã" },
          email: {
            type: "string",
            format: "email",
            maxLength: 254,
            example: "maria@example.com",
          },
          workshopId: { type: "string", format: "uuid" },
        },
      },
      LoginInput: {
        type: "object",
        additionalProperties: false,
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@feitoamao.local" },
          password: { type: "string", format: "password", example: "FeitoAMao@2026" },
        },
      },
      Error: {
        type: "object",
        required: ["error", "message"],
        properties: {
          error: { type: "string", example: "INVALID_DATA" },
          message: { type: "string", example: "Os dados enviados são inválidos." },
          fields: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
    responses: {
      InvalidData: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/Error" } },
        },
      },
      Unauthenticated: {
        description: "Sessão ausente, inválida ou expirada",
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/Error" } },
        },
      },
    },
  },
  paths: {
    "/api/saude": {
      get: {
        tags: ["Sistema"],
        summary: "Verifica a saúde da API",
        responses: {
          "200": {
            description: "API disponível",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "feito-a-mao-api" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/oficinas": {
      get: {
        tags: ["Oficinas"],
        summary: "Lista oficinas ativas",
        responses: {
          "200": {
            description: "Oficinas ordenadas pela data de início",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Workshop" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/oficinas/{id}": {
      get: {
        tags: ["Oficinas"],
        summary: "Consulta uma oficina ativa",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Oficina encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Workshop" } },
                },
              },
            },
          },
          "404": {
            description: "Oficina não encontrada ou inativa",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/inscricoes": {
      post: {
        tags: ["Inscrições"],
        summary: "Cria uma inscrição pendente",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateEnrollmentInput" } },
          },
        },
        responses: {
          "201": {
            description: "Inscrição criada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Enrollment" } },
                },
              },
            },
          },
          "409": {
            description: "Inscrição duplicada ou oficina lotada",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autentica o administrador",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } },
          },
        },
        responses: {
          "200": {
            description: "Login realizado e cookie de sessão criado",
            headers: {
              "Set-Cookie": {
                description: "Cookie httpOnly de autenticação",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          "401": {
            description: "Credenciais inválidas",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/auth/logout": {
      post: {
        tags: ["Autenticação"],
        summary: "Encerra a sessão administrativa",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Sessão encerrada" },
          "401": { $ref: "#/components/responses/Unauthenticated" },
        },
      },
    },
    "/api/admin/auth/me": {
      get: {
        tags: ["Autenticação"],
        summary: "Retorna o administrador autenticado",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Usuário autenticado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthenticated" },
        },
      },
    },
  },
} as const;
