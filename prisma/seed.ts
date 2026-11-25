import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // Development starter data for onboarding; replace/extend with verified records via admin.
  const university = await prisma.university.upsert({
    where: { slug: "university-of-benin" },
    update: { name: "University of Benin", shortName: "UNIBEN", isActive: true },
    create: {
      name: "University of Benin",
      shortName: "UNIBEN",
      slug: "university-of-benin",
      country: "Nigeria",
      isActive: true,
    },
  });

  const program = await prisma.program.upsert({
    where: { universityId_name: { universityId: university.id, name: "Optometry" } },
    update: { isActive: true },
    create: { universityId: university.id, name: "Optometry", code: "OPT", isActive: true },
  });

  for (const [sortOrder, name] of [
    [1, "100 Level"],
    [2, "200 Level"],
    [3, "300 Level"],
    [4, "400 Level"],
    [5, "500 Level"],
    [6, "600 Level"],
  ] as const) {
    await prisma.academicLevel.upsert({
      where: { programId_name: { programId: program.id, name } },
      update: { sortOrder, isActive: true },
      create: { programId: program.id, name, sortOrder, isActive: true },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
