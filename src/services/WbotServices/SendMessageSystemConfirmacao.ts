import type { Client, Message as WbotMessage } from "whatsapp-web.js";
import VerifyContact from "./helpers/VerifyContact";
import Confirmacao from "../../models/Confirmacao";
import { logger } from "../../utils/logger";
import ProcessBodyData from "../../helpers/ProcessBodyData";
import CreateTemplateMessageService from "../MessageServices/CreateTemplateMessageService";

import FindOrCreateConfirmacao from "../ConfirmacaoServices/FindOrCreateConfirmacaoTicket";

interface Session extends Client {
  id: number;
}

const SendMessageSystemConfirmacao = async (wbot: Session, data: any) => {
  let message: WbotMessage = {} as WbotMessage;
  const bodyProcessed = ProcessBodyData(data.body);

  const idNumber = await wbot.getNumberId(bodyProcessed.contato);
  const msgContact = await wbot.getContactById(idNumber._serialized);
  const contact = await VerifyContact(msgContact, data.tenantId);

  const ticket = await FindOrCreateConfirmacao({
    contact: contact.id,
    tenantId: data.tenantId,
    channel: "Whatsapp",
    data,
    contatoSend: msgContact.id._serialized,
  });

  if (ticket.confirmacaoJaEnviada) {
    logger.info("Mensagem ja enviada para esse atendimento");
    return;
  }

  const template = CreateTemplateMessageService({
    msg: bodyProcessed.notificacao,
    hora: ticket.atendimentoHora,
  });

  message = await wbot.sendMessage(msgContact.id._serialized, template.body, {
    linkPreview: false,
  });
  if (message) {
    await Confirmacao.update(
      {
        enviada: new Date(message.timestamp * 1000),
      },
      {
        where: {
          id: ticket.id,
        },
      }
    );
  }
  logger.info("sendMessage", message.id);
};

export default SendMessageSystemConfirmacao;
