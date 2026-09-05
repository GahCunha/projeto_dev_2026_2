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
    { name: "Turmas", description: "Datas, valores e vagas das turmas" },
    { name: "Inscrições", description: "Inscrições públicas em oficinas" },
    { name: "Autenticação", description: "Sessão do administrador" },
    { name: "Administração", description: "Gestão protegida da plataforma" },
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
          "category",
          "description",
          "imageUrl",
          "materials",
          "nextMeetingAt",
          "classCount",
          "totalCapacity",
          "occupiedSeats",
          "availableSeats",
          "active",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Carpintaria para iniciantes" },
          category: { type: "string", example: "Carpintaria" },
          description: {
            type: "string",
            example: "Aprenda técnicas fundamentais e construa sua primeira peça em madeira.",
          },
          imageUrl: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://example.com/carpintaria.jpg",
          },
          materials: {
            type: "array",
            maxItems: 20,
            items: { type: "string" },
            example: ["Avental", "Óculos de proteção"],
          },
          nextMeetingAt: { type: "string", format: "date-time", nullable: true },
          classCount: { type: "integer", minimum: 0, example: 2 },
          totalCapacity: { type: "integer", minimum: 0, example: 24 },
          occupiedSeats: { type: "integer", minimum: 0, example: 8 },
          availableSeats: {
            type: "integer",
            minimum: 0,
            example: 8,
            description:
              "Capacidade menos inscrições pendentes e confirmadas; calculada no momento da consulta.",
          },
          active: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AdminWorkshop: {
        allOf: [
          { $ref: "#/components/schemas/Workshop" },
          {
            type: "object",
            required: ["enrollmentCount", "occupiedSeats", "availableSeats"],
            properties: {
              enrollmentCount: {
                type: "integer",
                minimum: 0,
                description: "Quantidade total de inscrições, inclusive canceladas.",
              },
              occupiedSeats: {
                type: "integer",
                minimum: 0,
                description: "Inscrições pendentes e confirmadas que reservam vaga.",
              },
              availableSeats: {
                type: "integer",
                minimum: 0,
                description: "Capacidade restante após descontar as vagas ocupadas.",
              },
            },
          },
        ],
      },
      ClassMeeting: {
        type: "object",
        required: ["id", "startsAt", "endsAt", "location"],
        properties: {
          id: { type: "string", format: "uuid" },
          startsAt: { type: "string", format: "date-time" },
          endsAt: { type: "string", format: "date-time" },
          location: { type: "string", example: "Ateliê Têxtil, sala 1" },
        },
      },
      WorkshopClass: {
        type: "object",
        required: [
          "id", "workshopId", "name", "capacity", "price", "active",
          "meetings", "occupiedSeats", "availableSeats",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          workshopId: { type: "string", format: "uuid" },
          name: { type: "string", example: "Turma noturna de setembro" },
          capacity: { type: "integer", minimum: 1, example: 12 },
          price: { type: "number", format: "double", minimum: 0, multipleOf: 0.01, example: 120 },
          active: { type: "boolean", example: true },
          meetings: {
            type: "array",
            items: { $ref: "#/components/schemas/ClassMeeting" },
          },
          occupiedSeats: { type: "integer", minimum: 0 },
          availableSeats: { type: "integer", minimum: 0 },
        },
      },
      ClassInput: {
        type: "object",
        additionalProperties: false,
        required: ["name", "capacity", "price", "meetings"],
        properties: {
          name: { type: "string", minLength: 3, maxLength: 100 },
          capacity: { type: "integer", minimum: 1, maximum: 500 },
          price: { type: "number", format: "double", minimum: 0, multipleOf: 0.01, example: 120 },
          active: { type: "boolean" },
          meetings: {
            type: "array",
            minItems: 1,
            maxItems: 60,
            items: {
              type: "object",
              required: ["startsAt", "endsAt", "location"],
              properties: {
                startsAt: { type: "string", format: "date-time" },
                endsAt: { type: "string", format: "date-time" },
                location: { type: "string", minLength: 3, maxLength: 160 },
              },
            },
          },
        },
      },
      Enrollment: {
        type: "object",
        required: ["id", "name", "email", "status", "paymentStatus", "classId", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Maria Artesã" },
          email: { type: "string", format: "email", example: "maria@example.com" },
          status: {
            type: "string",
            enum: ["PENDENTE", "CONFIRMADA", "CANCELADA"],
            example: "PENDENTE",
          },
          paymentStatus: {
            type: "string",
            enum: ["ISENTO", "PENDENTE", "PAGO"],
            example: "PENDENTE",
          },
          classId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      EnrollmentWithWorkshop: {
        allOf: [
          { $ref: "#/components/schemas/Enrollment" },
          {
            type: "object",
            required: ["workshop", "class"],
            properties: {
              workshop: {
                type: "object",
                required: ["id", "title", "active"],
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string", example: "Crochê: primeiros pontos" },
                  active: { type: "boolean" },
                },
              },
              class: { $ref: "#/components/schemas/WorkshopClass" },
            },
          },
        ],
      },
      EnrollmentCancellation: {
        type: "object",
        required: ["id", "name", "status", "paymentStatus", "workshop", "class"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Maria Artesã" },
          status: {
            type: "string",
            enum: ["PENDENTE", "CONFIRMADA", "CANCELADA"],
          },
          paymentStatus: { type: "string", enum: ["ISENTO", "PENDENTE", "PAGO"] },
          workshop: {
            type: "object",
            required: ["title"],
            properties: {
              title: { type: "string", example: "Crochê: primeiros pontos" },
            },
          },
          class: {
            type: "object",
            required: ["name", "price", "meetings"],
            properties: {
              name: { type: "string" },
              price: { type: "number", format: "decimal" },
              meetings: { type: "array", items: { $ref: "#/components/schemas/ClassMeeting" } },
            },
          },
        },
      },
      EnrollmentPayment: {
        type: "object",
        required: ["name", "status", "paymentStatus", "workshop", "class"],
        properties: {
          name: { type: "string", example: "Maria Artesã" },
          status: { type: "string", enum: ["PENDENTE", "CONFIRMADA", "CANCELADA"] },
          paymentStatus: { type: "string", enum: ["PENDENTE", "PAGO"] },
          paidAt: { type: "string", format: "date-time", nullable: true },
          workshop: {
            type: "object",
            properties: { title: { type: "string" } },
          },
          class: { $ref: "#/components/schemas/WorkshopClass" },
        },
      },
      Pagination: {
        type: "object",
        required: ["page", "pageSize", "totalItems", "totalPages"],
        properties: {
          page: { type: "integer", minimum: 1, example: 1 },
          pageSize: { type: "integer", minimum: 1, maximum: 50, example: 10 },
          totalItems: { type: "integer", minimum: 0, example: 34 },
          totalPages: { type: "integer", minimum: 0, example: 4 },
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
        required: ["name", "email", "classId"],
        properties: {
          name: { type: "string", minLength: 3, maxLength: 120, example: "Maria Artesã" },
          email: {
            type: "string",
            format: "email",
            maxLength: 254,
            example: "maria@example.com",
          },
          classId: { type: "string", format: "uuid" },
        },
      },
      CreateWorkshopInput: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "category",
          "description",
        ],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 120, example: "Cerâmica fria" },
          category: { type: "string", minLength: 2, maxLength: 80, example: "Modelagem" },
          description: {
            type: "string",
            minLength: 10,
            maxLength: 1000,
            example: "Aprenda a modelar e finalizar pequenas peças decorativas.",
          },
          imageUrl: {
            type: "string",
            format: "uri",
            nullable: true,
            maxLength: 2048,
            example: "https://example.com/ceramica.jpg",
          },
          materials: {
            type: "array",
            maxItems: 20,
            items: { type: "string", minLength: 2, maxLength: 120 },
            example: ["Avental", "Pano de limpeza"],
          },
        },
      },
      UpdateWorkshopInput: {
        type: "object",
        additionalProperties: false,
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 3, maxLength: 120 },
          category: { type: "string", minLength: 2, maxLength: 80 },
          description: { type: "string", minLength: 10, maxLength: 1000 },
          imageUrl: { type: "string", format: "uri", nullable: true, maxLength: 2048 },
          materials: {
            type: "array",
            maxItems: 20,
            items: { type: "string", minLength: 2, maxLength: 120 },
          },
        },
      },
      UpdateWorkshopStatusInput: {
        type: "object",
        additionalProperties: false,
        required: ["active"],
        properties: {
          active: { type: "boolean", example: false },
        },
      },
      UpdateEnrollmentStatusInput: {
        type: "object",
        additionalProperties: false,
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["CONFIRMADA", "CANCELADA"],
            example: "CONFIRMADA",
          },
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
        description:
          "Retorna somente oficinas ativas e futuras. Inclui categoria, imagem, materiais e vagas disponíveis calculadas.",
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
    "/api/oficinas/{workshopId}/turmas": {
      get: {
        tags: ["Turmas"],
        summary: "Lista as turmas disponíveis de uma oficina",
        parameters: [{ name: "workshopId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Turmas ativas com aulas futuras e vagas calculadas",
            content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/WorkshopClass" } } } } } },
          },
          "404": { description: "Oficina não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/turmas/{id}": {
      get: {
        tags: ["Turmas"],
        summary: "Consulta uma turma disponível",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Turma encontrada", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/WorkshopClass" } } } } } },
          "404": { description: "Turma não encontrada ou inativa", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
    "/api/inscricoes/cancelamento/{token}": {
      get: {
        tags: ["Inscrições"],
        summary: "Consulta uma inscrição pelo link de cancelamento",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[a-f0-9]{64}$" },
          },
        ],
        responses: {
          "200": {
            description: "Dados seguros da inscrição e da oficina",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/EnrollmentCancellation" } },
                },
              },
            },
          },
          "404": {
            description: "Link inválido ou desconhecido",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
      post: {
        tags: ["Inscrições"],
        summary: "Cancela a própria inscrição pelo link seguro",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[a-f0-9]{64}$" },
          },
        ],
        responses: {
          "200": {
            description: "Inscrição cancelada e vaga liberada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/EnrollmentCancellation" } },
                },
              },
            },
          },
          "404": {
            description: "Link inválido ou desconhecido",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "409": {
            description: "Inscrição já cancelada ou alterada simultaneamente",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/inscricoes/pagamento/{token}": {
      get: {
        tags: ["Inscrições"],
        summary: "Consulta uma cobrança PIX ilustrativa",
        parameters: [{ name: "token", in: "path", required: true, schema: { type: "string", pattern: "^[a-f0-9]{64}$" } }],
        responses: {
          "200": {
            description: "Dados seguros da cobrança",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/EnrollmentPayment" } } } } },
          },
          "404": { description: "Link inválido ou desconhecido", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
      post: {
        tags: ["Inscrições"],
        summary: "Simula o pagamento PIX sem movimentação financeira real",
        parameters: [{ name: "token", in: "path", required: true, schema: { type: "string", pattern: "^[a-f0-9]{64}$" } }],
        responses: {
          "200": {
            description: "Pagamento marcado como pago; inscrição permanece pendente",
            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/EnrollmentPayment" } } } } },
          },
          "404": { description: "Link inválido ou desconhecido", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Pagamento já registrado ou inscrição cancelada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
    "/api/admin/inscricoes": {
      get: {
        tags: ["Administração"],
        summary: "Lista inscrições para gestão",
        description:
          "Retorna inscrições paginadas e ordenadas pela data da oficina. Permite busca case-insensitive por nome ou e-mail e filtros por status e oficina.",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["PENDENTE", "CONFIRMADA", "CANCELADA"] },
          },
          {
            name: "workshopId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", maxLength: 120 },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        ],
        responses: {
          "200": {
            description: "Página de inscrições",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/EnrollmentWithWorkshop" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/oficinas": {
      get: {
        tags: ["Administração"],
        summary: "Lista oficinas para gestão",
        description:
          "Retorna oficinas ativas e inativas com ocupação calculada, busca por título ou local, filtro de atividade e paginação.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "active", in: "query", schema: { type: "boolean" } },
          { name: "search", in: "query", schema: { type: "string", maxLength: 120 } },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        ],
        responses: {
          "200": {
            description: "Página de oficinas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AdminWorkshop" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
      post: {
        tags: ["Administração"],
        summary: "Cria uma oficina",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateWorkshopInput" } },
          },
        },
        responses: {
          "201": {
            description: "Oficina criada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Workshop" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/oficinas/{id}": {
      patch: {
        tags: ["Administração"],
        summary: "Edita uma oficina",
        description:
          "Atualiza um ou mais dados. A capacidade não pode ficar abaixo das inscrições pendentes e confirmadas.",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateWorkshopInput" } },
          },
        },
        responses: {
          "200": {
            description: "Oficina atualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Workshop" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "404": {
            description: "Oficina não encontrada",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "409": {
            description: "Capacidade menor que a ocupação atual",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/oficinas/{id}/status": {
      patch: {
        tags: ["Administração"],
        summary: "Ativa ou desativa uma oficina",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateWorkshopStatusInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Status atualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Workshop" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "404": {
            description: "Oficina não encontrada",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "409": {
            description: "A oficina já possui o status solicitado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/oficinas/{workshopId}/turmas": {
      get: {
        tags: ["Administração"],
        summary: "Lista todas as turmas de uma oficina",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "workshopId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Turmas ativas e inativas", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/WorkshopClass" } } } } } } },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "404": { description: "Oficina não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Administração"],
        summary: "Cria uma turma com uma ou mais aulas",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "workshopId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ClassInput" } } } },
        responses: {
          "201": { description: "Turma criada", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/WorkshopClass" } } } } } },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "404": { description: "Oficina não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/turmas/{id}": {
      patch: {
        tags: ["Administração"],
        summary: "Edita dados e aulas de uma turma",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ClassInput" } } } },
        responses: {
          "200": { description: "Turma atualizada", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/WorkshopClass" } } } } } },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "404": { description: "Turma não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Capacidade menor que a ocupação", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/turmas/{id}/status": {
      patch: {
        tags: ["Administração"],
        summary: "Ativa ou desativa uma turma",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateWorkshopStatusInput" } } } },
        responses: {
          "200": { description: "Status atualizado", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/WorkshopClass" } } } } } },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "404": { description: "Turma não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "A turma já possui o status solicitado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
    "/api/admin/inscricoes/{id}/status": {
      patch: {
        tags: ["Administração"],
        summary: "Altera o status de uma inscrição",
        description:
          "Permite confirmar ou cancelar uma inscrição. Inscrições canceladas não podem ser reabertas e o status não pode voltar para PENDENTE.",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateEnrollmentStatusInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Status atualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Enrollment" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthenticated" },
          "404": {
            description: "Inscrição não encontrada",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "409": {
            description: "Transição inválida, status repetido ou alteração concorrente",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "422": { $ref: "#/components/responses/InvalidData" },
        },
      },
    },
  },
} as const;
