import { EnrollmentStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { env } from "../src/config/environment.js";

const prisma = new PrismaClient();

function futureDate(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(13, 0, 0, 0);
  return date;
}

const workshops = [
  {
    title: "Carpintaria para iniciantes",
    category: "Carpintaria",
    description: "Aprenda técnicas fundamentais e construa sua primeira peça em madeira.",
    imageUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b",
    materials: ["Avental", "Óculos de proteção"],
    startsAt: futureDate(14),
    durationMin: 240,
    capacity: 12,
    location: "Ateliê Madeira, sala 1",
    active: true,
  },
  {
    title: "Crochê: primeiros pontos",
    category: "Crochê",
    description: "Uma introdução acolhedora ao crochê, do manuseio da agulha à primeira peça.",
    imageUrl: "https://images.unsplash.com/photo-1604881991720-f91add269bed",
    materials: ["Agulha de crochê 3,5 mm", "Novelo de algodão"],
    startsAt: futureDate(21),
    durationMin: 180,
    capacity: 16,
    location: "Ateliê Têxtil, sala 2",
    active: true,
  },
  {
    title: "Cerâmica fria criativa",
    category: "Modelagem",
    description: "Modele e finalize pequenos objetos decorativos usando cerâmica fria.",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
    materials: ["Avental", "Pano de limpeza"],
    startsAt: futureDate(28),
    durationMin: 210,
    capacity: 10,
    location: "Ateliê Modelagem, sala 3",
    active: true,
  },
  {
    title: "Bordado botânico",
    category: "Bordado",
    description: "Crie composições inspiradas em folhas e flores usando pontos de bordado livre.",
    imageUrl: "https://images.unsplash.com/photo-1590739225287-bd31519780c3",
    materials: ["Bastidor de 18 cm", "Agulha de bordado", "Tesoura pequena"],
    startsAt: futureDate(35),
    durationMin: 180,
    capacity: 14,
    location: "Ateliê Têxtil, sala 1",
    active: true,
  },
  {
    title: "Velas artesanais aromáticas",
    category: "Velas",
    description: "Aprenda a preparar cera, combinar aromas e finalizar velas artesanais.",
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59",
    materials: ["Avental", "Caderno para anotações"],
    startsAt: futureDate(42),
    durationMin: 150,
    capacity: 12,
    location: "Cozinha experimental",
    active: true,
  },
  {
    title: "Encadernação manual",
    category: "Papel",
    description: "Monte um caderno artesanal e conheça técnicas básicas de costura e acabamento.",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363",
    materials: ["Régua", "Lápis", "Estilete"],
    startsAt: futureDate(49),
    durationMin: 240,
    capacity: 10,
    location: "Ateliê de Papel",
    active: true,
  },
  {
    title: "Macramê para decoração",
    category: "Macramê",
    description: "Pratique os nós essenciais e produza uma pequena peça decorativa para casa.",
    imageUrl: "https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d",
    materials: ["Tesoura", "Fita métrica"],
    startsAt: futureDate(56),
    durationMin: 180,
    capacity: 16,
    location: "Ateliê Têxtil, sala 2",
    active: true,
  },
  {
    title: "Sabonetes naturais",
    category: "Cosmética artesanal",
    description: "Descubra bases, essências e moldes para produzir sabonetes artesanais suaves.",
    imageUrl: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec",
    materials: ["Avental", "Luvas reutilizáveis"],
    startsAt: futureDate(63),
    durationMin: 150,
    capacity: 12,
    location: "Cozinha experimental",
    active: true,
  },
  {
    title: "Mosaico com azulejos",
    category: "Mosaico",
    description: "Planeje um desenho e transforme fragmentos de azulejo em uma peça colorida.",
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342",
    materials: ["Óculos de proteção", "Avental"],
    startsAt: futureDate(70),
    durationMin: 210,
    capacity: 10,
    location: "Ateliê Modelagem, sala 1",
    active: true,
  },
  {
    title: "Pintura em tecido",
    category: "Pintura",
    description: "Explore mistura de cores, pincéis e acabamento em uma peça de algodão.",
    imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5",
    materials: ["Pincéis macios", "Pano de algodão"],
    startsAt: futureDate(77),
    durationMin: 180,
    capacity: 14,
    location: "Sala de Pintura",
    active: true,
  },
  {
    title: "Cestaria em fibras naturais",
    category: "Cestaria",
    description: "Conheça o preparo das fibras e faça uma pequena cesta com trama simples.",
    imageUrl: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6",
    materials: ["Tesoura", "Borrifador com água"],
    startsAt: futureDate(84),
    durationMin: 240,
    capacity: 8,
    location: "Ateliê Madeira, sala 2",
    active: false,
  },
  {
    title: "Papel machê criativo",
    category: "Papel",
    description: "Modele formas leves com papel reaproveitado e aprenda técnicas de acabamento.",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
    materials: ["Avental", "Pincel largo"],
    startsAt: futureDate(91),
    durationMin: 180,
    capacity: 12,
    location: "Ateliê de Papel",
    active: false,
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

  const savedWorkshops = [];

  for (const [workshopIndex, workshop] of workshops.entries()) {
    const existingWorkshop = await prisma.workshop.findFirst({
      where: { title: workshop.title },
    });

    const savedWorkshop = existingWorkshop
      ? await prisma.workshop.update({ where: { id: existingWorkshop.id }, data: workshop })
      : await prisma.workshop.create({ data: workshop });

    savedWorkshops.push(savedWorkshop);

    await prisma.workshopClass.upsert({
      where: { id: savedWorkshop.id },
      update: {
        capacity: workshop.capacity,
        price: workshopIndex % 3 === 0 ? 120 : workshopIndex % 3 === 1 ? 85.5 : 0,
        active: workshop.active,
      },
      create: {
        id: savedWorkshop.id,
        workshopId: savedWorkshop.id,
        name: "Turma inicial",
        capacity: workshop.capacity,
        price: workshopIndex % 3 === 0 ? 120 : workshopIndex % 3 === 1 ? 85.5 : 0,
        active: workshop.active,
      },
    });

    await prisma.classMeeting.upsert({
      where: { id: savedWorkshop.id },
      update: {
        startsAt: workshop.startsAt,
        endsAt: new Date(workshop.startsAt.getTime() + workshop.durationMin * 60_000),
        location: workshop.location,
      },
      create: {
        id: savedWorkshop.id,
        classId: savedWorkshop.id,
        startsAt: workshop.startsAt,
        endsAt: new Date(workshop.startsAt.getTime() + workshop.durationMin * 60_000),
        location: workshop.location,
      },
    });

    if (workshopIndex === 0) {
      const secondMeetingStart = new Date(workshop.startsAt.getTime() + 2 * 24 * 60 * 60 * 1000);
      await prisma.classMeeting.upsert({
        where: { id: "00000000-0000-4000-8000-000000000001" },
        update: {
          classId: savedWorkshop.id,
          startsAt: secondMeetingStart,
          endsAt: new Date(secondMeetingStart.getTime() + workshop.durationMin * 60_000),
          location: workshop.location,
        },
        create: {
          id: "00000000-0000-4000-8000-000000000001",
          classId: savedWorkshop.id,
          startsAt: secondMeetingStart,
          endsAt: new Date(secondMeetingStart.getTime() + workshop.durationMin * 60_000),
          location: workshop.location,
        },
      });
    }
  }

  for (const [index, name] of participantNames.entries()) {
    const workshop = savedWorkshops[index % savedWorkshops.length];
    if (!workshop) continue;

    const email = `participante${String(index + 1).padStart(2, "0")}@feitoamao.local`;
    const status = enrollmentStatuses[index % enrollmentStatuses.length] ?? EnrollmentStatus.PENDENTE;

    await prisma.enrollment.upsert({
      where: { email_classId: { email, classId: workshop.id } },
      update: { name, status, classId: workshop.id },
      create: { name, email, status, workshopId: workshop.id, classId: workshop.id },
    });
  }
}

run()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Não foi possível executar o seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
