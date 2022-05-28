import { TemplateTag } from "@prisma/client";

export type Question = {
  content: string;
  type: "multipleChoice" | "textInput" | "section";
  answers: {
    label: string;
    value: string;
    startIndex: number;
    isCorrect?: boolean;
  }[];
  questions: Question[];
  score?: number;
  index?: number;
  id?: number;
  tags?: number[];
  selectedTags?: TemplateTag[]
};

function isMultipleChoice(text: string) {
  const regex = /A\..+C\..+([\s]|$)/g;
  const result = regex.exec(text);

  return result;
}

function isOptionOnNewLine(text: string) {
  const result = text.matchAll(/\n([ABCD]\.[^\n]*)/g);
  return result ? [...result] : null;
}

export function getMultipleChoiceAnswers(text: string) {
  const result = isMultipleChoice(text);

  let matchResult = isOptionOnNewLine(text);
  console.log("is option on new line", matchResult);

  if (matchResult?.length >= 3) {
    answers = matchResult?.map((match) => {
      let value = match[1].substring(2).trim();
      const lastChar = value.substring(value.length - 1);
      let isCorrect = false;

      if (lastChar === "*") {
        isCorrect = true;
        value = value.substring(0, value.length - 1);
      }
      return {
        label: match[1].substring(0, 1),
        value,
        isCorrect,
      };
    });
    return answers;
  }

  let answers = [];

  if (result && result?.length > 0) {
    const fourOptionsMatch = result[0].matchAll(new RegExp(`[D]\\.(.+)`, "g"));

    const options = [
      ["A", "B"],
      ["B", "C"],
    ];

    if (fourOptionsMatch) {
      const matchResult = [...fourOptionsMatch];

      if (matchResult.length == 1 && matchResult[0].length == 2) {
        options.push(["C", "D"]);
        options.push(["D", null]);
      } else {
        options.push(["C", null]);
      }
    }

    answers = options.map(([start, end]) => {
      const re = !end
        ? new RegExp(`[${start}]\\.(.+)`, "g")
        : new RegExp(`[${start}]\\.(.+)\\s${end}\\.`, "g");
      const option = [...result[0].matchAll(re)];
      let value = option[0][1].trim();
      const lastChar = value.substring(value.length - 1);
      let isCorrect = false;

      if (lastChar === "*") {
        isCorrect = true;
        value = value.substring(0, value.length - 1);
      }
      return { label: start, value, isCorrect };
    });

    return answers;
  }

  return [];
}

export function getTextInputAnswers(text: string) {
  console.log("textinput find answers", text);
  // \uFF3F = 英文字体以外的 _
  const regex = /[\(（]([^\(（]*)[\)）]|([_\uFF3F]{1,})/g;
  const result = text.matchAll(regex);

  let answers: { value: string; content: string; startIndex: number }[] = [];
  if (result) {
    const matchResult = [...result];
    console.log("text input answers", matchResult);

    matchResult.forEach((match, i) => {
      if (match.length > 1) {
        answers.push(
          match[0].startsWith("_") || match[0].startsWith("\uFF3F")
            ? {
                value: "",
                content: match[0],
                startIndex: match.index,
              }
            : {
                value: match[1].trim(),
                content: match[0],
                startIndex: match.index,
              }
        );
      }
    });

    console.log("textinput answers", answers);
    return answers;
  }

  return [];
}

export function parseSubQuestion(text: string) {
  const regex = /[\n\s]\.\d{1,2}/g;
  let result = text.matchAll(regex);
  console.log("parse sub question result", result);

  if (result) {
    result = [...result];
    console.log("sub question match result ", result);
    const questions = [];
    result.forEach((match, i) => {
      const q = text.substring(
        match.index,
        i < result.length - 1 ? result[i + 1].index : text.length
      );

      console.log("question text", q);

      let answers = getMultipleChoiceAnswers(q);

      if (!answers || answers.length === 0) {
        answers = getTextInputAnswers(q);
        questions.push({
          content: q,
          answers,
          type: "textInput",
          index: i + 1,
        });
      } else {
        questions.push({
          content: q,
          answers,
          type: "multipleChoice",
          index: i + 1,
        });
      }
    });
    console.log("parse questions ", questions);
  }
  return questions;
}

export function removeQuestionIndex(text: string, isSubQuestion?: boolean) {
  const regex = isSubQuestion ? /[\n\s]\.\d{1,2}/g : /\d{1,2}\.(?!\d)/g;
  let result = text.matchAll(regex);
  if (result) {
    const match = [...result][0];

    if (match) {
      const content = match.input?.substring(match.index + match[0].length);
      return content;
    }
  }
  return text;
}

export function parseQuestion(text: string) {
  console.log("parse question", text);
  const regex = /\d{1,2}\.(?!\d)/g;
  let result = text.matchAll(regex);
  console.log("parse question result", result);

  if (result) {
    result = [...result];
    console.log("match result ", result);
    const questions = [];
    result.forEach((match, i) => {
      const q = text.substring(
        match.index,
        i < result.length - 1 ? result[i + 1].index : text.length
      );

      console.log("question text", q);
      const subQuestions = parseSubQuestion(q);
      let question;

      if (subQuestions?.length > 0) {
        console.log("sub questions ", subQuestions);
        question = { content: q, type: "section", questions: subQuestions };
      } else {
        let answers = getMultipleChoiceAnswers(q);

        if (!answers || answers.length === 0) {
          answers = getTextInputAnswers(q);
          question = { content: q, answers, type: "textInput" };
        } else {
          question = { content: q, answers, type: "multipleChoice" };
        }
      }
      questions.push(question);
    });
    console.log("parse questions ", questions);
  }
  return questions;
}
