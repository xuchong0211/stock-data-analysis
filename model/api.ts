import {
  Answer,
  AnswerCard,
  Exam,
  Question,
  StudentAnswerCard,
} from "@prisma/client";
import { Block } from "./types";
import { xor } from "lodash";

export async function createAnswerCard(
  exam: Exam & { answerCard?: AnswerCard },
  blocks: Block,
  templateType: string
): Promise<{ id: number }> {
  return fetch("/api/answerCard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      !exam?.answerCard?.id
        ? { examId: exam.id, blocks, templateType }
        : { id: exam.answerCard.id, blocks, templateType }
    ),
  }).then((req) => {
    return req.json();
  });
}

export function updateStudentAnswerCard(card: StudentAnswerCard) {
  return fetch("/api/studentAnswer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).then((req) => {
    return req.json();
  });
}

export function deleteStudentAnswer(id: number) {
  return fetch("/api/studentAnswer", {
    method: "DELETE",
    body: JSON.stringify({ id }),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  }).then((res) => {
    if (res.status === 200) {
      return res.json();
    }
    return null;
  });
}

export async function updateAnswerCard(id: number, params: any) {
  return await fetch("/api/answerCard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...params }),
  }).then((req) => {
    return req.json();
  });
}

export async function updateCardResult(id: number, answers: Answer[]) {
  console.log("update answers", answers);
  return await fetch("/api/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, answers }),
  }).then((req) => {
    return req.json();
  });
}

export async function updateCardResultStudentId(
  id: number,
  actualStudentId: string,
  clazzId: string
) {
  return await fetch("/api/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, actualStudentId, clazzId }),
  }).then((req) => {
    return req.json();
  });
}

export async function clientGetExam(id: number) {
  console.log("fetch exam ", id);
  return await fetch(`/api/exam/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((req) => {
    return req.json();
  });
}

export function getCardScore(answers: Answer[], questions: Question[]) {
  if (!answers || !questions) {
    return null;
  }

  let total = 0;
  answers.forEach((ans) => {
    const question = questions.find((q) => q.id === ans.questionId);
    if (question) {
      if (ans.score) {
        //手动给分
        total += ans.score;
      } else {
        const correctAnswers = question.answer?.split(",");
        const computedAnswers = ans.computed?.split(",");
        console.log("check answers", correctAnswers, computedAnswers);
        if (computedAnswers) {
          const diff = xor(correctAnswers, computedAnswers);
          if (diff.length === 0) {
            //识别答案正确
            console.log("CORRECT!", diff);
            total += question.score;
          }
        }
      }
    }
  });
  return total;
}
