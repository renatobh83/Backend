/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../utils/logger";

import ShowApiListServiceName from "../services/ApiConfirmacaoServices/ShowApiListServiceName";
import { confirmaExame, getPreparos } from "../helpers/SEMNOME";
import Confirmacao from "../models/Confirmacao";
import SendMessageBlobHtml from "../helpers/SendWhatsAppBlob";
import SendMessagePreparoApiExternal from "../services/WbotServices/SendMessagePreparoApiExternal";

interface Data {
  idexterno: number[];
  procedimentos: number[];
  tenantId: string;
  contatoSend: string;
}

interface HandlerPayload {
  data: Data;
}

export default {
  key: "WebHookConfirma",
  options: {
    delay: 6000,
    attempts: 5,
    // backoff: {
    //   type: "fixed",
    //   delay: 60000 * 3 // 3 min
    // }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: HandlerPayload) {
    try {
      const msgConfirmacao = await Confirmacao.findOne({
        where: {
          tenantId: Number(data.tenantId),
          contatoSend: data.contatoSend,
        },
      });
      function isBase64Meaningful(base64) {
        // Decodifica e mede o tamanho do conteúdo base64
        const decodedContent = Buffer.from(base64, "base64");
        const minSize = 200; // Define 200 bytes como tamanho mínimo para conteúdo relevante

        return decodedContent.length >= minSize;
      }
      let responseSendMessage: any;
      //   const { link, usuario, senha } = await GetApiConfirmacaoService({ tenantId: Number(data.tenantId)})
      //   const instanceApi = new ApiConfirma(usuario, senha, link);
      // ConfirmaExame(api)
      const confirmacao = data.idexterno.map((i) =>
        confirmaExame(+data.tenantId, i)
      );
      const preparos = data.procedimentos.map((i) =>
        getPreparos({ tenantId: +data.tenantId, procedimento: i })
      );
      const retornoPreparo = await Promise.allSettled(preparos);
      const retornoConfirmacao = await Promise.allSettled(confirmacao);
      // Verifique se todas as promessas foram resolvidas com sucesso
      const allFulfilled = retornoConfirmacao.every(
        (result) => result.status === "fulfilled"
      );
      if (allFulfilled) {
        // Extraia os valores dos preparos

        msgConfirmacao.status = "CONFIRMADO";
        msgConfirmacao.save();
        responseSendMessage = retornoPreparo
          .filter((result) => result.status === "fulfilled")
          .filter((result) => isBase64Meaningful(result.value)) // Filtra apenas resultados onde base64 não está vazio
          .map(async (result) => {
            return await SendMessagePreparoApiExternal({
              msgConfirmacao,
              base64Html: result.value,
              sendTo: data.contatoSend,
            });
          });
      } else {
        console.log("Nem todas as promessas foram resolvidas com sucesso.");
      }

      logger.info(`Queue WebHooksAPI success: Data: ${responseSendMessage}`);
      return true;
    } catch (error) {
      logger.error(`Error send message confirmacao response: ${error}`);
      if (error?.response?.status === 404) {
        return { message: "url configurar no webhook não existe." };
      }
      throw new Error(error);
    }
  },
};
