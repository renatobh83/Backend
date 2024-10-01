
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { logger } from "../utils/logger";
import CheckResponseConfirmacao from "../helpers/CheckResponseConfirmacao";

interface Data {
  data: any;
  tenantId: string;
}

interface HandlerPayload {
  data: Data;
}

export default {
  key: "WebHooksAPIConfirmacao",
  options: {
    delay: 6000,
    attempts: 5,
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // 3 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: HandlerPayload) {
    try {
      let payload = {};



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
