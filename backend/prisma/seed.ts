import { PrismaClient } from "@prisma/client";

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
    description: "Aprenda técnicas fundamentais e construa sua primeira peça em madeira.",
    startsAt: futureDate(14),
    durationMin: 240,
    capacity: 12,
    location: "Ateliê Madeira, sala 1",
  },
  {
    title: "Crochê: primeiros pontos",
    description: "Uma introdução acolhedora ao crochê, do manuseio da agulha à primeira peça.",
    startsAt: futureDate(21),
    durationMin: 180,
    capacity: 16,
    location: "Ateliê Têxtil, sala 2",
  },
  {
    title: "Cerâmica fria criativa",
    description: "Modele e finalize pequenos objetos decorativos usando cerâmica fria.",
    startsAt: futureDate(28),
    durationMin: 210,
    capacity: 10,
    location: "Ateliê Modelagem, sala 3",
  },
];

async function run() {
  for (const workshop of workshops) {
    const existingWorkshop = await prisma.workshop.findFirst({
      where: { title: workshop.title },
    });

    if (!existingWorkshop) {
      await prisma.workshop.create({ data: workshop });
    }
  }
}

run()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Não foi possível executar o seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });


