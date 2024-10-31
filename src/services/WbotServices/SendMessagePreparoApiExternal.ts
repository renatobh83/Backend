import { MessageMedia, type Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import type Ticket from "../../models/Ticket";
import UserMessagesLog from "../../models/UserMessagesLog";
import { logger } from "../../utils/logger";
import type Confirmacao from "../../models/Confirmacao";

interface Request {
  base64Html: string;
  msgConfirmacao: Confirmacao;
  sendTo: string;
}

const SendMessagePreparoApiExternal = async ({
  base64Html,
  msgConfirmacao,
  sendTo,
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(msgConfirmacao);

    const media = new MessageMedia("text/html", base64Html, "Preparo");
    await wbot.sendMessage(sendTo, "Agendamento Confirmado com sucesso!");
    const sendMessage = await wbot.sendMessage(sendTo, media, {
      sendAudioAsVoice: true,
      caption: "Segue o preparo do seu exame!",
    });

    await msgConfirmacao.update({
      lastMessage: "Segue o preparo do seu exame!",
      lastMessageAt: new Date().getTime(),
      closedAt: new Date().getTime(),
      status: "PREPARO ENVIADO",
      preparoEnviado: true,
    });
    return sendMessage;
  } catch (err) {
    console.log(err);
    logger.error(`SendWhatsBlob | Error: ${err}`);
    // StartWhatsAppSessionVerify(ticket.whatsappId, err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};
export default SendMessagePreparoApiExternal;
