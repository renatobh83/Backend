
/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../utils/logger";
import ApiConfirma from "../services/ApiConfirmacaoServices/ApiConfirma";
import GetApiConfirmacaoService from "../services/ApiConfirmacaoServices/GetApiConfirmacaoService";
import { confirmarAtendimentos } from "../helpers/SEMNOME";


interface Data {
  idexterno: number[]
  procedimentos: number[]
  tenantId: string;
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

      const { link, usuario, senha } = await GetApiConfirmacaoService({ tenantId: Number(data.tenantId)})
      const instanceApi = new ApiConfirma(usuario, senha, link);



    //   const response = await instanceApi.confirmaExame()
        if(confirmarAtendimentos(data.idexterno, instanceApi)){
            console.log('CONFIRMADo')
        }

      logger.info(
        `Queue WebHooksAPI success: Data: ${data}`
      );
      return true
    } catch (error) {
      logger.error(`Error send message confirmacao response: ${error}`);
      if (error?.response?.status === 404) {
        return { message: "url configurar no webhook não existe." };
      }
      throw new Error(error);
    }
  }
};
