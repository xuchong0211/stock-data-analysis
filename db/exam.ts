import { PrismaClient } from "@prisma/client";

export function getExam(prisma: PrismaClient, id: number, options: any) {
  let includeParams = {
    sections: { include: { questions: true } },
    studentAnswers: {
      include: {
        student: true,
        photos: true,
        result: {
          include: { answers: true },
        },
        sectionScores: true,
      },
      orderBy: { createdAt: "desc" },
    },
    clazz: true,
  };

  if (options?.include) {
    includeParams = { ...includeParams, ...options.include };
  }

  return prisma.exam.findUnique({
    where: { id },
    include: includeParams,
  });
}
