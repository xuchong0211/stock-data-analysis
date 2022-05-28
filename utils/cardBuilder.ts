import { Exam, Question } from "@prisma/client";
import sortBy from "lodash/sortBy";
import { Block, SectionType, MCAnswer, ExamStyleTypes } from "../model/types";
import { createTitle1, createTitle2 } from "./cardTitle";

import { range, cloneDeep, sumBy, some, filter, find } from "lodash";

function getAnswerIndex(answer: String | null): number | null {
  if (!answer) {
    return null;
  }
  return answer.charCodeAt(0) - "A".charCodeAt(0);
}

function createMultipleChoiceAreaSix(
  title: string,
  questions: Question[],
  x: number,
  y: number,
  index: number
): Block[] {
  const choiceSize = 4,
    rowOfQ = 6,
    questionWidth = 31;
  const rowHeight = 7;
  const numberOfCol = Math.ceil(questions.length / rowOfQ);
  const sectionTitleHeight = 8,
    paddingY = 3;
  const areaHeight =
    rowHeight * numberOfCol + sectionTitleHeight + paddingY * 2 - 1;
  const areaContent = {
    id: "M" + questions.length + "-" + index,
    type: "area",
    x: 0,
    y: sectionTitleHeight,
    height: areaHeight - sectionTitleHeight,
    width: 200,
    children: sortBy(questions, "index").map<Block>((q: Question) => {
      const i = q.index - 1;
      const colIndex = Math.floor(i / numberOfCol);
      return {
        id: "mcq" + i,
        type: "multipleChoice",
        title: `${q.label}`,
        params: {
          size: choiceSize,
          answer: getAnswerIndex(q.answer),
          type: "small",
        },
        x: 1 + colIndex * (questionWidth + 2),
        y: paddingY + rowHeight * (i % numberOfCol),
        height: rowHeight,
        width: questionWidth,
      };
    }),
  };
  const area = {
    id: "M-" + index,
    type: "area",
    x,
    y,
    height: areaHeight,
    width: 200,
    border: { top: true, bottom: true, left: true, right: true },
    children: [
      {
        id: "M-Title-" + index,
        type: "textInput",
        x: 0,
        y: 1,
        height: sectionTitleHeight,
        width: 200,
        title: title,
        params: {
          borderStyle: {
            borderBottom: "1px dashed #000",
          },
          justifyContent: true,
          alignItems: true,
          fontSize: 12,
        },
      },
      areaContent,
    ],
  };

  return [area];
}

function createMultipleChoiceArea(
  title: string,
  questions: Question[],
  x: number,
  y: number,
  index: number
): Block[] {
  const choiceSize = 4,
    rowOfQ = 4,
    questionWidth = 50;
  const rowHeight = 7;
  const numberOfCol = Math.ceil(questions.length / rowOfQ);
  const sectionTitleHeight = 6;
  const paddingY = 2;
  const areaHeight = rowHeight * numberOfCol + paddingY * 2;

  const areaContent = {
    id: "M" + questions.length + "-" + index,
    type: "area",
    x,
    y: y + sectionTitleHeight,
    height: areaHeight,
    width: 200,
    border: { top: true, bottom: true, left: true, right: true },
    children: sortBy(questions, "index").map<Block>((q: Question) => {
      const i = q.index - 1;
      const colIndex = Math.floor(i / numberOfCol);
      return {
        id: "mcq" + i,
        type: "multipleChoice",
        title: `${q.label}`,
        params: {
          size: choiceSize,
          answer: getAnswerIndex(q.answer),
        },
        x: colIndex * questionWidth + 2,
        y: paddingY + rowHeight * (i % numberOfCol),
        height: rowHeight,
        width: questionWidth,
      };
    }),
  };

  const areaTitle = {
    id: "M-Title-" + index,
    type: "textInput",
    x,
    y,
    height: sectionTitleHeight,
    width: 200,
    title: title,
    params: { fontSize: 12 },
  };

  return [areaTitle, areaContent];
}

function createTextInputQuestionArea(
  question: Question,
  x: number,
  y: number,
  height: number,
  defaultQuestionWidth: number
): Block {
  const index = question.index - 1;
  let questionWidth = 35;
  switch (question.slots) {
    case 5:
      questionWidth = 38;
      break;
    case 4:
      questionWidth = 47;
      break;
    case 3:
      questionWidth = 63;
      break;
    case 2:
      questionWidth = 95;
      break;
    case 1:
      questionWidth = 190;
      break;
    default:
      questionWidth = 35;
  }
  questionWidth = Math.min(defaultQuestionWidth, questionWidth);
  const areaContent = {
    id: "sq" + index,
    type: "area",
    x,
    y,
    height,
    width: 200,
    children: range(1, question.slots + 1).map<Block>((c: number) => {
      const i = c - 1;
      return {
        id: "sq-i-" + i,
        type: "textInput",
        title: i === 0 ? question.label : "、",
        params: { fontSize: 12, underline: true },
        x: 1 + questionWidth * i,
        y: 0,
        height: height,
        width: questionWidth,
      };
    }),
  };
  return areaContent;
}

function createTextInputQuestionSlots(
  questions: Question[],
  x: number,
  y: number,
  rowHeight: number,
  questionWidth: number,
  questionsPerRow: number
): Block[] {
  const slotsSize = sumBy(questions, (q) => q?.slots);
  let childrenBlock: Block[] = [];
  const startSlots = sortBy(questions, "index").map<{
    label: string;
    startIndex: number;
  }>((q: Question) => {
    return {
      label: q.label,
      startIndex: sumBy(
        filter(questions, (qs) => qs.index < q.index),
        (q) => q?.slots
      ),
      questionIndex: q.index,
    };
  });

  childrenBlock = range(0, slotsSize).map<Block>((c: number) => {
    const i = c;
    const ifStart = find(startSlots, (ss) => ss.startIndex === i);
    const width = ifStart ? questionWidth + 3 : questionWidth + 2;
    const rowIndex = Math.floor(i / questionsPerRow);
    const y = rowHeight * rowIndex;
    const colIndex = i % questionsPerRow;
    const questionIndex = ifStart?.questionIndex ? ifStart.questionIndex : "";
    return {
      id: "sq-" + questionIndex + "-i-" + i,
      type: "textInput",
      title: ifStart ? ifStart.label : "、",
      params: { fontSize: 12, underline: true },
      x: 1 + width * colIndex,
      y: y,
      height: rowHeight,
      width: width,
    };
  });

  return childrenBlock;
}

function createTextInputArea(
  title: string,
  questions: Question[],
  x: number,
  y: number,
  index: number,
  questionsPerRow: number
): Block[] {
  const rowHeight = 11,
    sectionTitleHeight = 6;
  const oneQuestionPerRow = questionsPerRow === 1;
  const needSlots =
    some(questions, (q) => q.slots > 1) && questionsPerRow !== 1;

  const typeOfInput = questionsPerRow === 1 ? "L" : "S";

  let questionWidth = 35;
  switch (questionsPerRow) {
    case 5:
      questionWidth = 35;
      break;
    case 4:
      questionWidth = 45;
      break;
    case 3:
      questionWidth = 62;
      break;
    case 2:
      questionWidth = 93;
      break;
    case 1:
      questionWidth = 185;
      break;
    default:
      questionWidth = 35;
  }

  let contentChildren: Block[], areaHeight: number;
  if (needSlots) {
    const slotsSize = sumBy(questions, (q) => q?.slots);
    const numberOfRow = Math.ceil(slotsSize / questionsPerRow);
    areaHeight = rowHeight * numberOfRow + 6;
    contentChildren = createTextInputQuestionSlots(
      questions,
      2,
      y,
      rowHeight,
      questionWidth,
      questionsPerRow
    );
  } else {
    const numberOfRow = oneQuestionPerRow
      ? questions.length
      : Math.ceil(questions.length / questionsPerRow);
    areaHeight = rowHeight * numberOfRow + 6;
    contentChildren = sortBy(questions, "index").map<Block>((q: Question) => {
      const i = q.index - 1;
      const rowIndex = oneQuestionPerRow ? i : Math.floor(i / questionsPerRow);
      const y = rowHeight * rowIndex;
      if (oneQuestionPerRow) {
        return createTextInputQuestionArea(q, 2, y, rowHeight, questionWidth);
      } else {
        const colIndex = i % questionsPerRow;

        return {
          id: "sq" + i,
          type: "textInput",
          title: `${q.label}`,
          params: { fontSize: 11, underline: true },
          x: 2 + (questionWidth + 5) * colIndex,
          y: y,
          height: rowHeight,
          width: questionWidth,
        };
      }
    });
  }

  const areaContent = {
    id: typeOfInput + questions.length + "-" + index,
    type: "area",
    x,
    y: y + sectionTitleHeight,
    height: areaHeight,
    width: 200,
    border: { top: true, bottom: true, left: true, right: true },
    children: contentChildren,
  };

  const areaTitle = {
    id: typeOfInput + "-Title-" + index,
    type: "textInput",
    x,
    y,
    height: sectionTitleHeight,
    width: 200,
    title: title,
    params: { fontSize: 12 },
  };

  return [areaTitle, areaContent];
}

function createTextInputAreaTitleIn(
  title: string,
  questions: Question[],
  x: number,
  y: number,
  index: number,
  questionsPerRow: number
): Block[] {
  const rowHeight = 11,
    sectionTitleHeight = 8,
    paddingY = 3;
  const oneQuestionPerRow = questionsPerRow === 1;
  const needSlots =
    some(questions, (q) => q.slots > 1) && questionsPerRow !== 1;

  const typeOfInput = questionsPerRow === 1 ? "L" : "S";

  let questionWidth = 35;
  switch (questionsPerRow) {
    case 5:
      questionWidth = 35;
      break;
    case 4:
      questionWidth = 45;
      break;
    case 3:
      questionWidth = 62;
      break;
    case 2:
      questionWidth = 93;
      break;
    case 1:
      questionWidth = 185;
      break;
    default:
      questionWidth = 35;
  }

  let contentChildren: Block[], areaHeight: number;

  if (needSlots) {
    const slotsSize = sumBy(questions, (q) => q?.slots);
    const numberOfRow = Math.ceil(slotsSize / questionsPerRow);
    areaHeight = rowHeight * numberOfRow + sectionTitleHeight + paddingY * 2;
    contentChildren = createTextInputQuestionSlots(
      questions,
      2,
      y,
      rowHeight,
      questionWidth,
      questionsPerRow
    );
  } else {
    const numberOfRow = oneQuestionPerRow
      ? questions.length
      : Math.ceil(questions.length / questionsPerRow);
    areaHeight = rowHeight * numberOfRow + sectionTitleHeight + paddingY * 2;
    contentChildren = sortBy(questions, "index").map<Block>((q: Question) => {
      const i = q.index - 1;
      const rowIndex = oneQuestionPerRow ? i : Math.floor(i / questionsPerRow);
      const y = rowHeight * rowIndex;

      if (oneQuestionPerRow) {
        return createTextInputQuestionArea(q, 2, y, rowHeight, questionWidth);
      } else {
        const colIndex = i % questionsPerRow;
        return {
          id: "sq" + i,
          type: "textInput",
          title: `${q.label}`,
          params: { fontSize: 11, underline: true },
          x: 2 + (questionWidth + 5) * colIndex,
          y: y,
          height: rowHeight,
          width: questionWidth,
        };
      }
    });
  }

  const areaContent = {
    id: typeOfInput + "-" + index,
    type: "area",
    x: 0,
    y: sectionTitleHeight,
    height: areaHeight - sectionTitleHeight,
    width: 200,
    children: contentChildren,
  };

  const area = {
    id: typeOfInput + questions.length + "-" + index,
    type: "area",
    x,
    y,
    height: areaHeight,
    width: 200,
    border: { top: true, bottom: true, left: true, right: true },
    children: [
      {
        id: typeOfInput + "-Title-" + index,
        type: "textInput",
        x: 0,
        y: 1,
        height: sectionTitleHeight,
        width: 200,
        title: title,
        params: {
          borderStyle: {
            borderBottom: "1px dashed #000",
          },
          justifyContent: true,
          alignItems: true,
          fontSize: 12,
        },
      },
      areaContent,
    ],
  };

  return [area];
}

function createCompositionArea(
  title: string,
  questions: Question[],
  wordCount: number,
  x: number,
  y: number,
  index: number
): Block[] {
  const rowHeight = 9.5;
  const numberOfRow = Math.ceil(wordCount / 20);
  const sectionTitleHeight = 6,
    inputTitleHeight = 13;
  const areaHeight =
    rowHeight * numberOfRow + sectionTitleHeight + inputTitleHeight + 9;
  const titleY = 5;

  const areaContent = {
    id: "C" + questions.length + "-" + index,
    type: "area",
    x,
    y: y + sectionTitleHeight,
    height: areaHeight - sectionTitleHeight,
    width: 200,
    border: { top: true, bottom: true, left: true, right: true },
    children: [
      {
        id: "CompositionTitle" + index,
        type: "textInput",
        params: { underline: true },
        x: 50,
        y: titleY,
        height: 8,
        width: 100,
      },
      {
        id: "CompositionContent" + index,
        type: "grid",
        title,
        x: 5,
        y: inputTitleHeight + 3,
        height: rowHeight * numberOfRow,
        width: 200,
        row: numberOfRow,
        column: 20,
        size: 9.5,
      },
    ],
  };

  const areaTitle = {
    id: "C-Title-" + index,
    type: "textInput",
    x,
    y,
    height: sectionTitleHeight,
    width: 200,
    title: title,
    params: { fontSize: 12 },
  };

  return [areaTitle, areaContent];
}

function createCompositionAreaTitleIn(
  title: string,
  questions: Question[],
  wordCount: number,
  x: number,
  y: number,
  index: number
): Block[] {
  const rowHeight = 9.5;
  const numberOfRow = Math.ceil(wordCount / 20);
  const sectionTitleHeight = 8,
    inputTitleHeight = 13;
  const areaHeight =
    rowHeight * numberOfRow + sectionTitleHeight + inputTitleHeight + 10;
  const titleY = 5;

  const areaContent = {
    id: "C-" + index,
    type: "area",
    x: 0,
    y: sectionTitleHeight,
    height: areaHeight - sectionTitleHeight,
    width: 200,
    children: [
      {
        id: "CompositionTitle" + index,
        type: "textInput",
        params: { underline: true },
        x: 50,
        y: titleY,
        height: 8,
        width: 100,
      },
      {
        id: "CompositionContent" + index,
        type: "grid",
        title,
        x,
        y: inputTitleHeight + 3,
        height: rowHeight * numberOfRow,
        width: 200,
        row: numberOfRow,
        column: 20,
        size: 9.5,
      },
    ],
  };

  const area = {
    id: "C" + questions.length + "-" + index,
    type: "area",
    x,
    y,
    height: areaHeight,
    width: 200,
    border: { top: true, bottom: true, left: true, right: true },
    children: [
      {
        id: "c-Title-" + index,
        type: "textInput",
        x: 0,
        y: 1,
        height: sectionTitleHeight,
        width: 200,
        title: title,
        params: {
          borderStyle: {
            borderBottom: "1px dashed #000",
          },
          justifyContent: true,
          alignItems: true,
          fontSize: 12,
        },
      },
      areaContent,
    ],
  };

  return [area];
}

type Section = {
  sectionType: keyof typeof SectionType;
  title: string;
  startIndex: number;
  number: number;
  score: number;
  choiceSize?: number;
  questionList?: MCAnswer[];
  wordCount?: number;
  questionsPerRow?: number;
};

function examSectionBlock(
  examStyle: string,
  section: Section,
  startHeight: number,
  index: number
): Block[] {
  let block: Block;

  const sectionTitle = section.title;
  const titleOut = examStyle === ExamStyleTypes.STYLE_ONE;

  if (section.sectionType === SectionType.MultipleChoice) {
    block = titleOut
      ? createMultipleChoiceArea(
          sectionTitle,
          section.questionList,
          5,
          startHeight,
          index
        )
      : createMultipleChoiceAreaSix(
          sectionTitle,
          section.questionList,
          5,
          startHeight,
          index
        );
  } else if (section.sectionType === SectionType.TextInput) {
    block = titleOut
      ? createTextInputArea(
          sectionTitle,
          section.questionList,
          5,
          startHeight,
          index,
          section.questionsPerRow
        )
      : createTextInputAreaTitleIn(
          sectionTitle,
          section.questionList,
          5,
          startHeight,
          index,
          section.questionsPerRow
        );
  } else if (section.sectionType === SectionType.Composition) {
    block = titleOut
      ? createCompositionArea(
          sectionTitle,
          section.questionList,
          section.wordCount,
          5,
          startHeight,
          index
        )
      : createCompositionAreaTitleIn(
          sectionTitle,
          section.questionList,
          section.wordCount,
          5,
          startHeight,
          index
        );
  }
  return block;
}

export function createBlocksFromExamNew(
  exam: Exam,
  sections: Section[],
  examStyle: string
): Block[] {
  const A4_AREA = { height: 297, width: 210 };
  const headerHeight = examStyle === ExamStyleTypes.STYLE_ONE ? 88 : 92;

  let returnPages: Block[] = [],
    childrenBlock: Block[] = [],
    page: Block = {
      id: "page" + Math.random().toString(),
      children: childrenBlock,
      height: A4_AREA.height,
      width: A4_AREA.width,
      x: 0,
      y: 0,
      type: "area",
    };

  childrenBlock =
    examStyle === ExamStyleTypes.STYLE_ONE
      ? [createTitle1(exam)]
      : [createTitle2(exam)];
  const sectionPaddingY = 4;

  if (sections && sections.length >= 1) {
    let startHeight = headerHeight + sectionPaddingY;
    sections?.map((section, index) => {
      let sectionBlocks: Block[] = examSectionBlock(
        examStyle,
        section,
        startHeight,
        index
      );
      if (sectionBlocks && sectionBlocks.length > 0) {
        const examSectionHeight = sumBy(sectionBlocks, (b) => b.height);
        if (examSectionHeight > A4_AREA.height) {
          console.log("高度超出答题卡单页，请减少题数");
        }
        if (
          startHeight + examSectionHeight + sectionPaddingY >
          A4_AREA.height
        ) {
          let newPage: Block = {
            ...cloneDeep(page),
            id: "page" + Math.random().toString() + index,
            children: childrenBlock,
          };

          returnPages.push(newPage);
          let newSectionBlock: Block[] = examSectionBlock(
            examStyle,
            section,
            8,
            index
          );
          childrenBlock = newSectionBlock;
          startHeight = 8 + examSectionHeight + sectionPaddingY;
        } else {
          startHeight = startHeight + examSectionHeight + sectionPaddingY;
          childrenBlock = childrenBlock.concat(sectionBlocks);
          return childrenBlock;
        }
      }
    });
  }

  let newPage: Block = {
    ...cloneDeep(page),
    children: childrenBlock,
  };
  if (returnPages.length > 0) {
    returnPages.splice(returnPages.length, 0, newPage);
    return returnPages;
  } else {
    return [newPage];
  }
}
