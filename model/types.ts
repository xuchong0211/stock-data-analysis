import { range } from "lodash";
import uuid from "short-uuid";
export type BlockType =
  | "area"
  | "multipleChoice"
  | "textInput"
  | "template"
  | "grid";

type BaseBlock = {
  id: string;
  height: number;
  width: number;
  title?: string;
  border?: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  isRoot?: boolean;
  x: number;
  y: number;
};

export type TextInput = BaseBlock & {
  type: "textInput";
  params?: {
    fontSize?: number;
    underline?: boolean;
    borderStyle?: any;
    justifyContent?: boolean; //左右居中
    alignItems?: boolean; //上下局中
    image?: string;
  };
};

export type MultipleChoice = BaseBlock & {
  type: "multipleChoice";
  params: {
    direction?: "column" | "row";
    size: number;
    optionType?: "number" | "letter";
    answer?: number | null;
    type?: "normal" | "small";
  };
};

export type Area = BaseBlock & {
  type: "area";
  children: Block[];
  params?: { uuid?: string; qrcode?: boolean; qrCodeSize?: number };
};

export type Grid = BaseBlock & {
  type: "grid";
  row: number;
  column: number;
  size: number;
};

export type Block = TextInput | MultipleChoice | Area | Grid;

export type Template = {
  id: string;
  name: string;
  block: Block;
};

export type BlockParams = {
  col: number;
  row: number;
  id: string;
  children: Block[];
};

export type Position = { col: number; row: number };

export type Size = { height: number; width: number };

export type AreaConfig = {
  type: "area" | "textInput";
  height: number;
  width: number;
  title?: string;
  border?: boolean;
  textQuestion?: boolean;
};

export type MultipleChoiceConfig = {
  type: "multipleChoice";
  title: string;
  size: number;
  optionType: "letter" | "number";
};

export type ItemConfig = AreaConfig | MultipleChoiceConfig;

export type Exam = {
  id: number;
  name: string;
  examDate: Date;
  createdAt: Date;
  multipleChoiceNum: number;
  textInputNum: number;
};

export type ExamParams = {
  name: string;
  examDate: moment.Moment;
  multipleChoice: number;
  textInput: number;
};

export const DnDTypes = {
  MUTIPLE_CHOICE: "multipleChoice",
  TEXT_INPUT: "textInput",
  AREA: "area",
  TEMPLATE: "template",
  COMPOSITION: "composition",
};

export const ItemLabels = {
  multipleChoice: { label: "选择题" },
  textInput: { label: "文字输输入" },
  area: { label: "区域" },
  template: { label: "模版" },
};

export type STSToken = {
  SecurityToken: string;
  AccessKeyId: string;
  AccessKeySecret: string;
  Expiration: string;
};

export type MCAnswer = {
  index: number;
  label: string;
  answer?: string;
  score?: number;
};

export const SectionType = {
  MultipleChoice: "MultipleChoice",
  TextInput: "TextInput",
  Composition: "Composition",
} as const;

export const ExamStyleTypes = {
  STYLE_ONE: "校内考试模版",
  STYLE_TWO: "高考模版",
};

export type Section = {
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

export function hasBlock(position: Position & Size, blocks: Block[]) {
  const { col, row, height, width } = position;
  const overlappedBlock = blocks.find(
    (b) =>
      col >= b.col &&
      col + width <= b.col + b.width &&
      row >= b.row &&
      row + height <= b.row + b.height
  );
  return overlappedBlock;
}

export function addChildren(parent: Block, child?: Block | null) {
  if (!parent || !child || hasBlock(child, parent.children)) {
    return null;
  }

  return { ...parent, children: [...parent.children, child] };
}

export function newTemplateFromBlock(name: string, block: Block) {
  return { id: "template-" + new Date().getTime(), name, block };
}

export function createTemplate(
  name: string,
  row: number,
  col: number
): Block[] {
  if (name === "multipleChoice10") {
    return range(10).map<Block>((i) => ({
      id: (new Date().getTime() + i).toString(),
      type: "multipleChoice",
      height: 1,
      width: 5,
      row: row + i + 1,
      col,
      children: [],
      params: { size: 4 },
      title: i + 1 + ".",
    }));
  }

  return [];
}
export function createBlock(
  x: number,
  y: number,
  params: ItemConfig
): Block | undefined {
  const block = {
    col: -1,
    row: -1,
    x,
    y,
    children: [],
  };

  const id = new Date().getTime().toString();

  switch (params.type) {
    case "area":
      return {
        ...block,
        id,
        type: params.type,
        height: params.height || 5,
        width: params.width || 5,
        params: { title: params.title },
      };
    case "textInput":
      return {
        ...block,
        id,
        type: params.type,
        height: params.height || 3,
        width: params.width || 5,
        params: {
          title: params.title || "标题",
          qrcode: true,
          textQuestion: params.textQuestion,
          uuid: uuid.generate(),
        },
        border: params.border,
        title: params.title || "文字标题",
      };
    case "multipleChoice":
      return {
        ...block,
        id,
        type: "multipleChoice",
        height: 1,
        width: params.size ? params.size + 1 : 5,
        params: {
          title: params.title,
          size: params.size || 5,
          optionType: params.optionType || "letter",
        },
      };
  }
}

export function getRootBlock(
  blocks: Block[],
  height: number,
  width: number
): Block {
  return {
    id: "root",
    children: blocks,
    height: height,
    width: width,
    col: 0,
    row: 0,
    type: "area",
    isRoot: true,
  };
}

export function updateChild(parent: Block, blockToUpdate: Block): Block {
  return {
    ...parent,
    children: parent.children.reduce<Block[]>((newChildren, child) => {
      if (child.id === blockToUpdate.id) {
        return newChildren.concat([blockToUpdate]);
      } else {
        return newChildren.concat(
          child.type === "area" ? updateChild(child, blockToUpdate) : [child]
        );
      }
    }, []),
  };
}

export function removeChild(parent: Block, blockToDelete: Block): Block {
  return {
    ...parent,
    children: parent.children.reduce<Block[]>((newChildren, child) => {
      if (child.id !== blockToDelete.id) {
        return newChildren.concat(
          child.type === "area" ? removeChild(child, blockToDelete) : [child]
        );
      } else return newChildren;
    }, []),
  };
}

export function canDropItem(parent: Block, child: Block): boolean {
  if (child.col + child.width > parent.width) {
    return false;
  }

  if (child.row + child.height > parent.height) {
    return false;
  }

  if (hasBlock(child, parent.children)) {
    return false;
  }

  return true;
}
