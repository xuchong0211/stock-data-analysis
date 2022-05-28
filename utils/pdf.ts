import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Block } from "../model/types";
import "../font/alibaba-normal";
// import "../font/ShipporiMincho-Regular-normal";
import { drawBlockFromXY } from "./pdfXY";
import JSBarcode from "jsbarcode";
import { ExamSheet } from "../components/examSheet/types";

const ROW_SIZE = 9.5; //mm
const COL_SIZE = 9.5; //mm
const QRCODE_SIZE = 15;

async function drawQRCode(
  doc: jsPDF,
  params: { content: string; x: number; y: number; size: number }
) {
  const { content, x, y, size } = params;
  console.log("draw qrcode with size ", params);
  var qrCode = await QRCode.toDataURL(content, { errorCorrectionLevel: "H" });
  doc.addImage(qrCode, "jpeg", x, y, size, size);
}

async function drawBarcode(
  doc: jsPDF,
  params: { content: string; x: number; y: number; size: number }
) {
  const { content, x, y } = params;
  const canvas = document.createElement("canvas");
  JSBarcode(canvas, content, { width: 2, height: 50, displayValue: false });
  const barcode = canvas.toDataURL();
  doc.addImage(barcode, "jpeg", x - 31, y, 45, 11);
}

export async function makePDF(iframe: HTMLElement, pages: Block[]) {
  var doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFont("alibaba", "normal"); // set font
  doc.setFontSize(16);
  console.log(" GEN PDF", pages);
  let qrCodes: { content: string; x: number; y: number; size: number }[] = [];

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      doc.addPage("a4", "p");
    }
    const page = pages[i];
    const pageFooter =
      pages.length > 1 ? `第${i + 1}页/共${pages.length}页` : undefined;
    qrCodes = drawBlockFromXY(doc, page, 5, 5, true, pageFooter);

    // for (let j = 0; j < qrCodes.length; j++) {
    //   if (qrCodes[j].size < 15) {
    //     drawBarcode(doc, qrCodes[j]);
    //   } else {
    //     await drawQRCode(doc, qrCodes[j]);
    //   }
    // }
  }

  var pdfOutputUri = doc.output("datauristring");
  iframe.setAttribute("src", pdfOutputUri);
}

function htmlEleToPdf(doc: jsPDF, x, y, ele: HTMLElement) {
  return new Promise((resolve, reject) => {
    doc.html(ele, {
      callback() {
        resolve(true);
      },
      x,
      y,
      fontFaces: [
        {
          family: "ShipporiMincho-Regular",
          src: [
            {
              url: "https://cdn.tooieapp.com/font/ShipporiMincho-Regular.ttf",
              format: "truetype",
            },
          ],
        },
        {
          family: "NotoSerifSC-VF",
          src: [
            {
              url: "https://cdn.tooieapp.com/font/NotoSerifSC-VF.ttf",
              format: "truetype",
            },
          ],
        },
      ],
      html2canvas: {
        scale: 0.3,
      },
    });
  });
}

export async function htmlToPdf(pageIdList: string[]) {
  console.log("html to pdf", pageIdList);
  var doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageEles = pageIdList.map((id) => {
    return document.getElementById(id);
  });

  for (let i = 0; i < pageEles.length; i++) {
    const ele = pageEles[i];
    if (ele) {
      console.log("geneate page ", i, ele);
      await htmlEleToPdf(doc, 5, 210 * i, ele);
    } else {
      console.error("cannot generate from null HTML elemnt to pdf");
    }
  }

  console.log("generate html finished. write to iframe");
  //var pdfOutputUri = doc.output("datauristring");
  //viewerIframe.setAttribute("src", pdfOutputUri);
  window.open(URL.createObjectURL(doc.output("blob")));
}
