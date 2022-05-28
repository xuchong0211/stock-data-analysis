import { jsPDF } from "jspdf";
import { range } from "lodash";
import { Block, Grid, MultipleChoice, TextInput } from "../model/types";

const QRCODE_SIZE = 14;

const DEFAULT_STYLE = {
  fontSize: 12,
  sectionBorderWidth: 0.25,
  multipleChoice: {
    labelFontSize: 10,
  },
};

function drawBlackLine(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
  dashed?: boolean
) {
  const color = doc.getDrawColor();
  const lineWidth = doc.getLineWidth();

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(lineHeight);

  if (dashed) {
    doc.setLineDashPattern([1, 1], 0);
  }
  doc.line(x, y, x + width, y);

  doc.setLineWidth(lineWidth);
  doc.setDrawColor(color);

  if (dashed) {
    doc.setLineDashPattern([], 0);
  }
}

function drawVLine(
  doc: jsPDF,
  x: number,
  y: number,
  height: number,
  lineHeight: number
) {
  const color = doc.getDrawColor();
  const lineWidth = doc.getLineWidth();

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(lineHeight);
  doc.line(x, y, x, y + height);

  doc.setLineWidth(lineWidth);
  doc.setDrawColor(color);
}

function drawBorder(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const lineWidth = doc.getLineWidth();
  doc.setDrawColor(240, 55, 111);
  doc.setLineWidth(DEFAULT_STYLE.sectionBorderWidth);
  doc.roundedRect(x, y, width, height, 0, 0);
  doc.setLineWidth(lineWidth);
}

function createQrCode(content: string, x: number, y: number, size: number) {
  return {
    content,
    x: x,
    y: y,
    size,
  };
}

function substringWithinWidth(doc: jsPDF, s: string, maxWidth: number) {
  for (let i = s.length - 1; i >= 0; i--) {
    const substring = s.substring(0, i);
    if (doc.getTextDimensions(substring).w < maxWidth) {
      return substring;
    }
  }
}
function drawTextInputXY(
  doc: jsPDF,
  block: TextInput,
  blockX: number,
  blockY: number,
  isParentArea: boolean
) {
  console.log("draw text input xy block ", block);
  let height = block.height;
  let width = block.width;
  let result;

  if (block.border) {
    const x = blockX;
    const y = blockY;
    drawBorder(doc, x, y, width, height);
    //console.log("DRAW textinput", x, y, width, height, block);
    // if (block.params?.qrcode) {
    //   result = createQrCode(
    //     block.params?.uuid,
    //     x + width - QRCODE_SIZE - 1,
    //     y + height - QRCODE_SIZE - 1,
    //     QRCODE_SIZE
    //   );
    // }
  }

  let textDim = { w: 0, h: 0 };

  if (block.params?.image) {
    const imgEle = new Image();
    imgEle.src = block.params.image;
    const picHeight = height * 0.9;
    const picWidth = width * 0.9;
    doc.addImage(
      imgEle,
      block.params.image.indexOf("png") > 0 ? "png" : "jpg",
      blockX + width * 0.01,
      blockY + height * 0.05,
      picWidth,
      picHeight
    );
  }

  if (block.title) {
    let fontSize = doc.getFontSize();

    if (block.params?.fontSize) {
      doc.setFontSize(block.params.fontSize * 0.8);
      console.log("SET FONT SIZE", doc.getFontSize());
    }

    textDim = doc.getTextDimensions(block.title);

    if (textDim.w > width) {
      const firstLine = substringWithinWidth(
        doc,
        block.title,
        block.width * 0.9
      );

      if (firstLine) {
        doc.text(firstLine, blockX, blockY + textDim.h);
        doc.text(
          block.title.substring(firstLine.length),
          blockX,
          blockY + textDim.h * 2 + 2
        );
      }
    } else {
      let textX = blockX;
      let textY = blockY + (block.params?.underline ? height : textDim.h);

      if (block.params?.justifyContent) {
        textX = blockX + (block.width / 2 - textDim.w / 2);
      }
      if (block.params?.alignItems) {
        textY = blockY + (block.height / 2 + textDim.h / 2);
      }

      doc.text(block.title, textX, textY);

      if (block.params?.borderStyle?.borderBottom) {
        drawBlackLine(doc, blockX + 3, textY + 3, block.width - 6, 0.1, true);
      }
    }

    if (block.params?.fontSize) {
      doc.setFontSize(fontSize);
    }
  }

  if (block.params?.underline) {
    drawBlackLine(
      doc,
      blockX + (block.border ? 3 : 0) + textDim.w + 1,
      blockY + height,
      block.width - 5,
      0.1
    );
  }

  return result;
}

function drawMultipleChoice(
  doc: jsPDF,
  block: MultipleChoice,
  x: number,
  y: number
) {
  let dim = null;
  const isSmallType = block.params.type === "small";

  if (block.title) {
    if (isSmallType) {
      doc.setFontSize(10);
    } else {
      doc.setFontSize(DEFAULT_STYLE.multipleChoice.labelFontSize);
    }

    dim = doc.getTextDimensions(block.title);
    const widthThreshold = isSmallType ? 3 : 4;
    doc.text(block.title, x + (dim.w < widthThreshold ? 2 : 0), y + dim.h);
    doc.setFontSize(DEFAULT_STYLE.fontSize);
  }

  const textHeight = dim ? dim.h : 0;
  doc.setDrawColor(240, 55, 111);
  doc.setFontSize(12);
  doc.setTextColor("red");

  range(block.params.size).forEach((i) => {
    const label =
      block.params.optionType === "number"
        ? i.toString()
        : String.fromCharCode(i + 65);
    doc.setLineWidth(0.1);

    doc.setFontSize(isSmallType ? 7 : 8);

    if (block.params.direction === "column") {
      const rowHeight = 5;
      doc.text(label, x + 7.5, y + 2.5 + (i === 0 ? 0 : rowHeight * i));
      doc.roundedRect(x + 6, y + i * rowHeight, 5, 3, 0, 0);
    } else {
      const optionGapX = isSmallType ? 7 : 8; // 10
      const optionLabelOffsetX = isSmallType ? 6.2 : 7; //9
      doc.text(
        label,
        x + optionGapX * i + optionLabelOffsetX,
        y + textHeight - (isSmallType ? 0.2 : 0)
      );
      doc.roundedRect(
        x + 2 + optionGapX * (i + 1) - 4.2,
        y + (isSmallType ? 0.9 : 1),
        5,
        3,
        0,
        0
      );
    }
    //doc.setLineWidth(0.3);
  });
  doc.setFontSize(12);
}

function drawGrid(doc: jsPDF, block: Grid, x: number, y: number) {
  const xPadding = 0;
  const paddingTop = 0;
  const paddingBottom = 0;
  const rowHeight = (block.height + paddingTop + paddingBottom) / block.row;
  const width = block.width - 2 * xPadding - block.column / 2;
  const columnWidth = width / block.column;

  for (let i = 0; i <= block.row; i++) {
    drawBlackLine(
      doc,
      x + xPadding,
      y + paddingTop + i * rowHeight,
      width,
      0.05
    );
  }

  for (let i = 0; i <= block.column; i++) {
    drawVLine(
      doc,
      x + xPadding + i * columnWidth,
      y + paddingTop,
      rowHeight * block.row,
      0.05
    );
  }
}

export function drawBlockFromXY(
  doc: jsPDF,
  page: Block,
  parentX: number,
  parentY: number,
  isRoot: boolean,
  pageFooter?: string
) {
  let qrCodeResult: any[] = [];
  const isParentArea = !isRoot;

  console.log("DRAW BLOCK", page);
  doc.setFontSize(DEFAULT_STYLE.fontSize);

  for (let block of page.children) {
    doc.setDrawColor(0);
    doc.setTextColor("black");
    const blockX = block.x;
    const blockY = block.y;

    switch (block.type) {
      case "textInput":
        const result = drawTextInputXY(
          doc,
          block,
          blockX + (isRoot ? 0 : parentX),
          blockY + (isRoot ? 0 : parentY),
          isParentArea
        );
        if (result) {
          qrCodeResult = [...qrCodeResult, result];
        }
        break;
      case "multipleChoice":
        drawMultipleChoice(doc, block, blockX + parentX, blockY + parentY);
        break;
      case "grid":
        drawGrid(doc, block, blockX + parentX, blockY + parentY);
        break;
      case "area":
        const width = block.width;
        const height = block.height;

        if (block.border) {
          drawBorder(
            doc,
            blockX + (isRoot ? 0 : parentX),
            blockY + (isRoot ? 0 : parentY),
            width,
            height
          );
        }

        const areaPadding = 2;
        const textHeight = 5;

        if (block.title) {
          doc.text(
            block.title,
            blockX + (isRoot ? 0 : parentX) + areaPadding,
            blockY + (isRoot ? 0 : parentY) + areaPadding + textHeight
          );
        }

        let areaQrCode = null;

        // if (block.params?.qrcode && block.params?.uuid) {
        //   const qrCodeSize = Number(block.params.qrCodeSize) || QRCODE_SIZE;
        //   areaQrCode = createQrCode(
        //     block.params.uuid,
        //     blockX + width - qrCodeSize - 1,
        //     blockY + 1,
        //     qrCodeSize
        //   );
        // } else {
        //   areaQrCode = createQrCode(
        //     block.id,
        //     blockX + width - QRCODE_SIZE - 1,
        //     blockY + 1,
        //     QRCODE_SIZE
        //   );
        // }

        if (areaQrCode) {
          qrCodeResult = [...qrCodeResult, areaQrCode];
        }

        if (block.children.length > 0) {
          const result = drawBlockFromXY(
            doc,
            block,
            blockX + (isRoot ? 0 : parentX),
            blockY + (isRoot ? 0 : parentY),
            false
          );

          if (result) {
            qrCodeResult = [...qrCodeResult, ...result];
          }
        }

        break;
    }
  }

  if (pageFooter) {
    const footerDim = doc.getTextDimensions(pageFooter);
    doc.setFontSize(7);
    doc.text(
      pageFooter,
      page.width / 2 - footerDim.w / 2,
      page.height - footerDim.h
    );
  }
  return qrCodeResult;
}
