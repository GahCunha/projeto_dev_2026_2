import { EnrollmentStatus, PaymentStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { env } from "../src/config/environment.js";

const prisma = new PrismaClient();

function futureDate(days: number, hour = 14, minute = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}

type MeetingSeed = {
  daysFromNow: number;
  hour: number;
  minute?: number;
  durationMin: number;
  location: string;
};

type ClassSeed = {
  name: string;
  capacity: number;
  price: number;
  active: boolean;
  meetings: MeetingSeed[];
};

type WorkshopSeed = {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  materials: string[];
  active: boolean;
  classes: ClassSeed[];
};

const workshops: WorkshopSeed[] = [
  // --- CROCHÊ (3 oficinas) ---
  {
    title: "Crochê: primeiros pontos",
    category: "Crochê",
    description: "Uma introdução acolhedora e prática ao universo do crochê. Aprenda o manuseio correto da agulha, correntinha, ponto baixo e ponto alto enquanto confecciona sua primeira peça de algodão.",
    imageUrl: "https://images.unsplash.com/photo-1620633437938-be73c35eb77e",
    materials: ["Agulha de crochê 3,5 mm", "Novelo de fio 100% algodão", "Tesourinha de arremate"],
    active: true,
    classes: [
      {
        name: "Turma Terça · Tarde",
        capacity: 12,
        price: 85,
        active: true,
        meetings: [
          { daysFromNow: 7, hour: 14, minute: 0, durationMin: 150, location: "Ateliê Têxtil, sala 1" },
        ],
      },
      {
        name: "Turma Sábado · Manhã",
        capacity: 10,
        price: 95,
        active: true,
        meetings: [
          { daysFromNow: 11, hour: 9, minute: 30, durationMin: 150, location: "Ateliê Têxtil, sala 1" },
        ],
      },
    ],
  },
  {
    title: "Crochê: sua primeira bolsa",
    category: "Crochê",
    description: "Do fundo estruturado às alças reforçadas, construa uma bolsa completa em fio de malha em uma tarde. Domine técnicas de acabamento invisível e colocação de ferragens.",
    imageUrl: "https://images.unsplash.com/photo-1594638963668-52eb9798e8ca",
    materials: ["Fio de malha premium", "Agulha de crochê 7 mm", "Par de alças e fecho magnético"],
    active: true,
    classes: [
      {
        name: "Turma Sábado Intensivo (2 aulas)",
        capacity: 8,
        price: 130,
        active: true,
        meetings: [
          { daysFromNow: 12, hour: 13, minute: 30, durationMin: 240, location: "Ateliê Têxtil, sala 1" },
          { daysFromNow: 19, hour: 13, minute: 30, durationMin: 240, location: "Ateliê Têxtil, sala 1" },
        ],
      },
      {
        name: "Turma Quarta · Noturna (2 aulas)",
        capacity: 8,
        price: 130,
        active: true,
        meetings: [
          { daysFromNow: 15, hour: 18, minute: 30, durationMin: 210, location: "Ateliê Têxtil, sala 1" },
          { daysFromNow: 22, hour: 18, minute: 30, durationMin: 210, location: "Ateliê Têxtil, sala 1" },
        ],
      },
    ],
  },
  {
    title: "Amigurumi: bichinhos em crochê",
    category: "Crochê",
    description: "Aprenda a magia de criar pequenos personagens tridimensionais. Domine anel mágico, aumentos, diminuições perfeitas, montagem de partes e enchimento com fibra siliconada.",
    imageUrl: "https://images.unsplash.com/photo-1766090503766-623b62f0da26",
    materials: ["Fio amigurumi 100% algodão", "Agulha de crochê 2,5 mm", "Fibra siliconada antialérgica", "Olhos com trava de segurança"],
    active: true,
    classes: [
      {
        name: "Turma Sábado · Tarde",
        capacity: 8,
        price: 120,
        active: true,
        meetings: [
          { daysFromNow: 14, hour: 14, minute: 0, durationMin: 240, location: "Ateliê Têxtil, sala 2" },
        ],
      },
      {
        name: "Turma Quinta · Tarde",
        capacity: 8,
        price: 110,
        active: true,
        meetings: [
          { daysFromNow: 17, hour: 14, minute: 0, durationMin: 240, location: "Ateliê Têxtil, sala 2" },
        ],
      },
    ],
  },

  // --- CERÂMICA (3 oficinas) ---
  {
    title: "Cerâmica: copo feito à mão",
    category: "Cerâmica",
    description: "Modele sua própria caneca ou copo utilitário usando as técnicas clássicas de belisco (pinch pot) e placas manuais. Inclui queima em alta temperatura e esmaltação artesanal.",
    imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261",
    materials: ["Argila terracota pura", "Estecas de madeira para modelagem", "Avental de lona"],
    active: true,
    classes: [
      {
        name: "Turma Quarta · Manhã",
        capacity: 8,
        price: 95,
        active: true,
        meetings: [
          { daysFromNow: 9, hour: 9, minute: 0, durationMin: 180, location: "Ateliê de Cerâmica, sala 1" },
        ],
      },
      {
        name: "Turma Quinta · Noturna",
        capacity: 8,
        price: 105,
        active: true,
        meetings: [
          { daysFromNow: 16, hour: 19, minute: 0, durationMin: 180, location: "Ateliê de Cerâmica, sala 1" },
        ],
      },
      {
        name: "Turma Sábado · Tarde",
        capacity: 6,
        price: 110,
        active: true,
        meetings: [
          { daysFromNow: 18, hour: 14, minute: 0, durationMin: 180, location: "Ateliê de Cerâmica, sala 1" },
        ],
      },
    ],
  },
  {
    title: "Cerâmica: pratos e texturas",
    category: "Cerâmica",
    description: "Transforme folhas botânicas, rendas e carimbos em relevos e texturas expressivas em argila branca. Crie um conjunto de dois pratos artesanais exclusivos para mesa posta.",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
    materials: ["Argila branca nacional", "Kit de carimbos e elementos botânicos", "Rolo nivelador e guias de espessura"],
    active: true,
    classes: [
      {
        name: "Turma Sexta · Tarde",
        capacity: 10,
        price: 110,
        active: true,
        meetings: [
          { daysFromNow: 13, hour: 14, minute: 0, durationMin: 180, location: "Ateliê de Cerâmica, sala 2" },
        ],
      },
      {
        name: "Turma Domingo · Manhã",
        capacity: 8,
        price: 120,
        active: true,
        meetings: [
          { daysFromNow: 20, hour: 9, minute: 30, durationMin: 180, location: "Ateliê de Cerâmica, sala 2" },
        ],
      },
    ],
  },
  {
    title: "Cerâmica criativa: formas livres",
    category: "Cerâmica",
    description: "Desconecte-se de moldes rígidos e explore assimetria, volume e formas orgânicas. Ideal para quem deseja criar vasos esculturais e peças decorativas de design autoral.",
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61",
    materials: ["Argila com chamote", "Desbastadores de laço metálico", "Esponjas de acabamento", "Avental"],
    active: true,
    classes: [
      {
        name: "Turma Sábado · Tarde",
        capacity: 8,
        price: 140,
        active: true,
        meetings: [
          { daysFromNow: 21, hour: 14, minute: 0, durationMin: 210, location: "Ateliê de Cerâmica, sala 1" },
        ],
      },
    ],
  },

  // --- MADEIRA (2 oficinas) ---
  {
    title: "Madeira: primeira tábua de corte",
    category: "Madeira",
    description: "Aprenda fundamentos da marcenaria manual: traçagem, corte com serrote japonês, lixamento progressivo e acabamento culinário seguro com óleo mineral e cera de abelha.",
    imageUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b",
    materials: ["Prancha de madeira maciça sustentável", "Kit de lixas para madeira", "Óleo mineral e cera de abelha", "Óculos de proteção"],
    active: true,
    classes: [
      {
        name: "Turma Sábado · Manhã",
        capacity: 8,
        price: 150,
        active: true,
        meetings: [
          { daysFromNow: 10, hour: 9, minute: 0, durationMin: 180, location: "Ateliê de Madeira, bancada central" },
        ],
      },
      {
        name: "Turma Domingo · Manhã",
        capacity: 8,
        price: 150,
        active: true,
        meetings: [
          { daysFromNow: 18, hour: 9, minute: 0, durationMin: 180, location: "Ateliê de Madeira, bancada central" },
        ],
      },
    ],
  },
  {
    title: "Madeira: banco de encaixe",
    category: "Madeira",
    description: "Construa um banco compacto sem uso de parafusos aparentes, trabalhando corte guiado, furação, encaixes de espiga e acabamento refinado para levar para casa.",
    imageUrl: "https://tse4.mm.bing.net/th/id/OIP.ELp9-JTtTrVIhhKETH6JIAHaJ4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    materials: ["Madeira pré-cortada de reflorestamento", "Sargentos e grampos de fixação", "Cola PVA de alta resistência", "EPIs completos"],
    active: true,
    classes: [
      {
        name: "Turma Sábado Completo (2 aulas)",
        capacity: 6,
        price: 190,
        active: true,
        meetings: [
          { daysFromNow: 24, hour: 9, minute: 0, durationMin: 300, location: "Ateliê de Madeira, sala de máquinas" },
          { daysFromNow: 31, hour: 9, minute: 0, durationMin: 300, location: "Ateliê de Madeira, sala de máquinas" },
        ],
      },
    ],
  },

  // --- TÊXTIL (2 oficinas) ---
  {
    title: "Bordado: desenhando com linha",
    category: "Têxtil",
    description: "Conheça os pontos fundamentais do bordado livre (ponto atrás, haste, nó francês e cheio) e transforme um traço ilustrado em arte têxtil delicada em bastidor de bambu.",
    imageUrl: "https://images.unsplash.com/photo-1610562831268-e04a620e1b0d",
    materials: ["Bastidor de bambu 16 cm", "Corte de algodão cru pré-lavado", "Meadas de algodão coloridas", "Agulha de bordado nº 7"],
    active: true,
    classes: [
      {
        name: "Turma Terça · Tarde",
        capacity: 12,
        price: 80,
        active: true,
        meetings: [
          { daysFromNow: 8, hour: 14, minute: 30, durationMin: 150, location: "Ateliê Têxtil, sala 2" },
        ],
      },
      {
        name: "Turma Quinta · Noite",
        capacity: 10,
        price: 85,
        active: true,
        meetings: [
          { daysFromNow: 15, hour: 19, minute: 0, durationMin: 150, location: "Ateliê Têxtil, sala 2" },
        ],
      },
    ],
  },
  {
    title: "Costura à mão: nécessaire de tecido",
    category: "Têxtil",
    description: "Corte, monte e costure uma nécessaire forrada funcional totalmente à mão, aprendendo ponto pesponto reforçado, aplicação de zíper e acabamento de cantos.",
    imageUrl: "https://drikaartesanato.com/wp-content/uploads/2022/01/necessaire-de-tecido-passo-a-passo-capa.jpg",
    materials: ["Tecido externo em sarja de algodão", "Forro em tricoline estampada", "Zíper destacável de nylon", "Linha reforçada de pesponto"],
    active: true,
    classes: [
      {
        name: "Turma Quarta · Tarde",
        capacity: 10,
        price: 90,
        active: true,
        meetings: [
          { daysFromNow: 16, hour: 14, minute: 0, durationMin: 180, location: "Ateliê Têxtil, sala 1" },
        ],
      },
      {
        name: "Turma Sábado · Manhã",
        capacity: 10,
        price: 95,
        active: true,
        meetings: [
          { daysFromNow: 23, hour: 9, minute: 0, durationMin: 180, location: "Ateliê Têxtil, sala 1" },
        ],
      },
    ],
  },
];

const participantNames = [
  "Ana Lima", "Bruno Souza", "Carla Mendes", "Diego Alves", "Elisa Rocha", "Fábio Nunes",
  "Gabriela Reis", "Henrique Luz", "Isabela Melo", "João Castro", "Karen Dias", "Lucas Freitas",
  "Marina Lopes", "Nicolas Pinto", "Olívia Ramos", "Paulo Martins", "Queila Gomes", "Rafael Barros",
  "Sofia Correia", "Tiago Moraes", "Úrsula Vieira", "Vinícius Costa", "Yasmin Araújo", "Zeca Campos",
];

const enrollmentStatuses = [
  EnrollmentStatus.PENDENTE,
  EnrollmentStatus.CONFIRMADA,
  EnrollmentStatus.CANCELADA,
];

async function run() {
  const passwordHash = await hash(env.ADMIN_PASSWORD, 12);

  // 1. Garante o administrador configurado
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL.toLowerCase() },
    update: {
      name: env.ADMIN_NAME,
      passwordHash,
    },
    create: {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
    },
  });

  // 2. Limpa dados anteriores para garantir que o seed fique limpo e sincronizado
  await prisma.enrollment.deleteMany();
  await prisma.classMeeting.deleteMany();
  await prisma.workshopClass.deleteMany();
  await prisma.workshop.deleteMany();

  const allSavedClasses: Array<{ id: string; workshopId: string; name: string }> = [];

  // 3. Cadastra as oficinas com múltiplas turmas e seus respectivos encontros
  for (const workshop of workshops) {
    const { classes, ...workshopData } = workshop;

    const savedWorkshop = await prisma.workshop.create({
      data: workshopData,
    });

    for (const classData of classes) {
      const { meetings, ...classFields } = classData;

      const savedClass = await prisma.workshopClass.create({
        data: {
          workshopId: savedWorkshop.id,
          name: classFields.name,
          capacity: classFields.capacity,
          price: classFields.price,
          active: classFields.active,
        },
      });

      allSavedClasses.push(savedClass);

      for (const meeting of meetings) {
        const startsAt = futureDate(meeting.daysFromNow, meeting.hour, meeting.minute ?? 0);
        const endsAt = new Date(startsAt.getTime() + meeting.durationMin * 60_000);

        await prisma.classMeeting.create({
          data: {
            classId: savedClass.id,
            startsAt,
            endsAt,
            location: meeting.location,
          },
        });
      }
    }
  }

  // 4. Cadastra inscrições de demonstração distribuídas entre as turmas
  for (const [index, name] of participantNames.entries()) {
    const targetClass = allSavedClasses[index % allSavedClasses.length];
    if (!targetClass) continue;

    const email = `participante${String(index + 1).padStart(2, "0")}@feitoamao.local`;
    const status = enrollmentStatuses[index % enrollmentStatuses.length] ?? EnrollmentStatus.PENDENTE;
    const paymentStatus =
      status === EnrollmentStatus.CONFIRMADA
        ? PaymentStatus.PAGO
        : PaymentStatus.PENDENTE;

    await prisma.enrollment.create({
      data: {
        name,
        email,
        status,
        paymentStatus,
        classId: targetClass.id,
        paidAt: status === EnrollmentStatus.CONFIRMADA ? new Date() : null,
      },
    });
  }

  console.log(`Seed finalizado com sucesso! ${workshops.length} oficinas e ${allSavedClasses.length} turmas cadastradas.`);
}

run()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Não foi possível executar o seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
