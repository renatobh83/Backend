/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import Redis from "ioredis";
import SendMessageSystemConfirmacao from "../services/WbotServices/SendMessageSystemConfirmacao";
import UpdateExamesConfirmados from "../services/ConfirmacaoServices/UpdateExamesConfirmados";

const sending: any = {};

const LOCK_TIMEOUT = 30; // Tempo em segundos que o lock será mantido

const redis = new Redis({
  host: process.env.IO_REDIS_SERVER,
  port: +(process.env.IO_REDIS_PORT || "6379"),
  password: process.env.IO_REDIS_PASSWORD || undefined,
  db: 3
});

export default {
  key: "SendMessageConfirmar",
  options: {
    delay: 6000,
    attempts: 2,
    removeOnComplete: true,
    removeOnFail: false,
    backoff: {
      type: "fixed",
      delay: 60000 * 3, // 3 min
    },
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    const wbot = getWbot(data.sessionId);
    const phoneNumber = data.body.contato; // Assumindo que 'phoneNumber' é parte do objeto 'data'
    const lockKey = `lock:${phoneNumber}`;

    const isLocked = await redis.exists(lockKey);
    if (isLocked) {
      // Se o lock existe, ignora a nova adição à fila

      logger.info(`Mensagem para ${phoneNumber} não foi adicionada à fila (lock ativo).`);
      return;
    }
       // Se não existe lock, cria um lock temporário
    await redis.set(lockKey, 'locked', 'EX', LOCK_TIMEOUT);
    try {
      logger.info(`Sending message Initiated: ${data.tenantId}`);
      if (sending[data.tenantId]) return;

      sending[data.tenantId] = true;
     await SendMessageSystemConfirmacao(wbot, data)
      sending[data.tenantId] = false;
      logger.info(`Finalized sending message: ${data.tenantId}`);
    } catch (error) {
      logger.error({ message: "Error send message confirmacao", error });
      throw new Error(error);
    }
  },
};
