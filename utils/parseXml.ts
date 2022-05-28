import xml2js from "xml2js";

const parseXml = (xml: string) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err: any, result: any) => {
      console.log("parse xml err: ", err);
      if (err) {
        reject(err);
      }
      resolve(result.xml);
    });
  });
};

export default parseXml;
