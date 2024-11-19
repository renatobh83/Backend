import { Client } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import { Jimp } from "jimp";
import HandleMessage from "./helpers/HandleMessage";
import HandleMsgAck from "./helpers/HandleMsgAck";
import VerifyCall from "./VerifyCall";
import { HandleMsgReaction } from "./helpers/HandleReaction";
import Tesseract from "tesseract.js";
import { extractInfoFromPdf } from "../../helpers/extractInfoFromPDF";

interface Session extends Client {
  id: number;
}

const wbotMessageListener = (wbot: Session): void => {
  // const queue = `whatsapp::${wbot.id}`;
  wbot.on("message", async (msg) => {
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media.mimetype.includes("image")) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "public",
          `image_${Date.now()}.jpg`
        );
        fs.writeFileSync(imagePath, media.data, "base64");
        Jimp.read(imagePath)
          .then((image) => {
            // Converter a imagem para escala de cinza e aumentar o contraste
            return (
              image
                .color([{ apply: "brighten", params: [20] }])
                .contrast(-0.5)
                .greyscale()
                // .threshold({ max: 200 }) // Binarização para destacar texto (opcional)
                .brightness(0.1) // Ajustar o brilho
                .write("processed_image.jpg")
            );
          })
          .then(() => {
            console.log("Imagem processada e salva como processed_image.jpg");

            // Após o pré-processamento, usar Tesseract para OCR
            return Tesseract.recognize("processed_image.jpg", "por", {
              // logger: (m) => console.log("Tesseract Log:", m),
            });
          })
          .then(({ data: { text } }) => {
            console.log("Texto Extraído:", text);
          })
          .catch((err) => {
            console.error("Erro:", err);
          });
        // .finally(() => fs.unlinkSync("processed_image.jpg"));
        fs.unlinkSync(imagePath);
      }
      if (media.mimetype === "application/pdf") {
        const pdfPath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "public",
          `file_${Date.now()}.pdf`
        );

        // Salva o PDF temporariamente
        fs.writeFileSync(pdfPath, media.data, "base64");

        // Processa o PDF para extrair texto
        const { procedimentos, validadeSenha } = await extractInfoFromPdf(
          pdfPath
        );

        // Converter a string da data de validade para um objeto Date
        const [dia, mes, ano] = validadeSenha.split("/").map(Number);
        const dataValidade = new Date(ano, mes - 1, dia); // Ajuste o mês, pois é zero-based

        // Obter a data atual
        const dataAtual = new Date();

        // Função para verificar se a data de validade é menor que a data atual
        function isValidadeVencida(dataValidade, dataAtual) {
          return dataValidade < dataAtual;
        }

        // Verificar a validade
        if (isValidadeVencida(dataValidade, dataAtual)) {
          msg.reply("Pedido com data de autorização ja vencida!");
        }

        // // Envia o texto extraído ao cliente
        // msg.reply(`Texto extraído do PDF:\n\n${data.text}`);

        // Limpa o arquivo temporário
        fs.unlinkSync(pdfPath);
      }
    }
  });
  wbot.on("message_create", async (msg) => {
    // desconsiderar atualização de status
    if (msg.isStatus) {
      return;
    }

    HandleMessage(msg, wbot);
  });

  wbot.on("media_uploaded", async (msg) => {
    HandleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    HandleMsgAck(msg, ack);
  });
  wbot.on("message_reaction", async (msg) => {
    for await (const _ of HandleMsgReaction(msg)) {
    }
  });

  wbot.on("call", async (call) => {
    VerifyCall(call, wbot);
  });
};

export { wbotMessageListener, HandleMessage };
