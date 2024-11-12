import { join } from "path";
import fs from "fs";
import { existsSync } from "fs";
import { promisify } from "util";
import type ApiConfirmacao from "../models/ApiConfirmacao";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import ShowApiListService from "../services/ApiConfirmacaoServices/ShowApiListService";
import {
  apiConsulta,
  apiConsultaCPF,
  ConfirmaExame,
  consultaAtendimentos,
  getAgendamentos,
  getLaudoPDF,
  getPreparo,
  ListaExamesPreparo,
} from "../services/ChatFlowServices/Helpers/ActionsApi";

import VerifyStepsChatFlowTicketWebhook from "../services/ChatFlowServices/VerifyStepsChatFlowTicketWebhook";
import { TemplateConsulta } from "../templates/consultaDados";
import SendMessageSystemProxy from "./SendMessageSystemProxy";
import SendMessageBlobHtml from "./SendWhatsAppBlob";
import socketEmit from "./socketEmit";
const formatarNumero = (numero) => {
  let numeroFormatado = numero.replace(/^55/, "");
  // Adiciona o dígito '9' após o DDD se ele estiver ausente
  if (numeroFormatado.length === 10) {
    numeroFormatado = `${numeroFormatado.slice(0, 2)}9${numeroFormatado.slice(
      2
    )}`;
  }
  return numeroFormatado;
};
let servicesApi: ApiConfirmacao;
const delay = promisify(setTimeout);
async function verificarArquivo(mediaPath, intervalo = 500, tentativas = 20) {
  for (let i = 0; i < tentativas; i++) {
    if (existsSync(mediaPath)) {
      return true;
    }
    await delay(intervalo);
  }
  return false;
}
export const CheckChatFlowWebhook = async (
  webhook: any,
  tenantId: string | number,
  ticket: Ticket | any,
  messageData
): Promise<string | boolean> => {
  let mensagem: string | boolean;
  const idApi = webhook.apiId;
  const acaoWebhook = webhook.acao.toLowerCase();

  if (!servicesApi) {
    servicesApi = await ShowApiListService({ id: idApi, tenantId });
  }
  const actionIsInclude = servicesApi.action.includes(acaoWebhook);
  if (!actionIsInclude) {
    throw new Error("Actions is not defined to servicesApi");
  }
  const nome = ticket.contact.name;
  const numero = formatarNumero(ticket.contact.number);
  console.log(acaoWebhook);
  if (acaoWebhook === "consulta") {
    const dadosConsulta = await apiConsulta(nome, servicesApi.tenantId, numero);

    if (dadosConsulta.length > 1 || dadosConsulta.length === 0) {
      VerifyStepsChatFlowTicketWebhook(ticket, "A");
      mensagem = TemplateConsulta({ nome }).nenhumRegistroLocalizado;
      return mensagem;
    }

    VerifyStepsChatFlowTicketWebhook(ticket, "I");
    // mensagem = TemplateConsulta({ nome }).registroEncontrado;
    // return mensagem;
    return true;
  }
  if (acaoWebhook === "consultacpf") {
    mensagem = await apiConsultaCPF(
      nome,
      servicesApi.tenantId,
      ticket.lastMessage.toString().trim()
    );
  } else if (acaoWebhook === "laudo") {
    mensagem = await consultaAtendimentos(servicesApi.tenantId);
  } else if (acaoWebhook === "agendamento") {
    mensagem = await getAgendamentos(servicesApi.tenantId);
  } else if (acaoWebhook === "preparo") {
    mensagem = await ListaExamesPreparo();
  } else if (acaoWebhook === "sendpreparo") {
    const preparo = await getPreparo(+ticket.lastMessage, servicesApi.tenantId);
    preparo
      .filter((result) => result.status === "fulfilled")
      .map((result) => {
        SendMessageBlobHtml({
          ticket,
          blob: result.value,
          userId: null,
        });
      });
  } else if (acaoWebhook === "confirmacao") {
    mensagem = await ConfirmaExame(servicesApi.tenantId, +ticket.lastMessage);
  } else if (acaoWebhook === "pdf") {
    const { mediaName, data } = await getLaudoPDF(
      servicesApi.tenantId,
      +ticket.lastMessage
    );

    const customPath = join(__dirname, "..", "..", "public");
    const mediaPath = join(customPath, mediaName);

    const arquivoExiste = await verificarArquivo(mediaPath);
    if (arquivoExiste) {
      const messageSent = await SendMessageSystemProxy({
        ticket,
        messageData: {
          ...messageData,
          mediaName: mediaName,
        },
        media: {
          path: mediaPath,
          data,
        },
        userId: null,
      });

      const msgCreated = await Message.create({
        ...messageData,
        ...messageSent,
        id: messageData.id,
        messageId: messageSent.id?.id || messageSent.messageId || null,
        mediaType: "bot",
      });

      const messageCreated = await Message.findByPk(msgCreated.id, {
        include: [
          {
            model: Ticket,
            as: "ticket",
            where: { tenantId },
            include: ["contact"],
          },
          {
            model: Message,
            as: "quotedMsg",
            include: ["contact"],
          },
        ],
      });

      if (!messageCreated) {
        throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
      }

      await ticket.update({
        lastMessage: messageCreated.body,
        lastMessageAt: new Date().getTime(),
        answered: true,
      });

      socketEmit({
        tenantId,
        type: "chat:create",
        payload: messageCreated,
      });
      fs.unlinkSync(mediaPath);
      return true;
    }

    return mensagem;
  }
  return mensagem;
  // const idApi = msg.data.webhook.apiId;
  // const acaoWebhook = msg.data.webhook.acao.toLowerCase();
  // console.log(acaoWebhook);
  // if (!servicesApi) {
  //   servicesApi = await ShowApiListService({ id: idApi, tenantId });
  // }

  // const actionIsInclude = servicesApi.action.includes(acaoWebhook);

  // if (!actionIsInclude) {
  //   throw new Error("Actions is not defined to servicesApi");
  // }
  // const nome = ticket.contact.name;
  // const numero = formatarNumero(ticket.contact.number);
  // if (acaoWebhook === "consulta") {
  //   mensagem = await apiConsulta(nome, servicesApi.tenantId, numero);
  // } else if (acaoWebhook === "consultacpf") {
  //   mensagem = await apiConsultaCPF(
  //     nome,
  //     servicesApi.tenantId,
  //     ticket.lastMessage.toString().trim()
  //   );
  // } else if (acaoWebhook === "laudo") {
  //   mensagem = await consultaAtendimentos(servicesApi.tenantId);
  // } else if (acaoWebhook === "agendamento") {
  //   mensagem = await getAgendamentos(servicesApi.tenantId);
  // } else if (acaoWebhook === "preparo") {
  //   mensagem = await ListaExamesPreparo();
  // } else if (acaoWebhook === "sendpreparo") {
  //   const preparo = await getPreparo(
  //     +ticket.lastMessage,
  //     servicesApi.tenantId
  //   );
  //   preparo
  //     .filter((result) => result.status === "fulfilled")
  //     .map((result) => {
  //       SendMessageBlobHtml({
  //         ticket,
  //         blob: result.value,
  //         userId: null,
  //       });
  //     });
  // } else if (acaoWebhook === "confirmacao") {
  //   mensagem = await ConfirmaExame(
  //     servicesApi.tenantId,
  //     +ticket.lastMessage
  //   );
  // } else if (acaoWebhook === "pdf") {
  //   const mediaName = await getLaudoPDF(
  //     servicesApi.tenantId,
  //     +ticket.lastMessage
  //   );
  //   const customPath = join(__dirname, "..", "..", "..", "public");
  //   const mediaPath = join(customPath, mediaName);
  //   const arquivoExiste = await verificarArquivo(mediaPath);
  //   if (arquivoExiste) {
  //     const messageSent = await SendMessageSystemProxy({
  //       ticket,
  //       messageData: {
  //         ...messageData,
  //         mediaName: mediaName,
  //       },
  //       media: {
  //         path: mediaPath,
  //       },
  //       userId: null,
  //     });
  //     const msgCreated = await Message.create({
  //       ...messageData,
  //       ...messageSent,
  //       id: messageData.id,
  //       messageId: messageSent.id?.id || messageSent.messageId || null,
  //       mediaType: "bot",
  //     });

  //     const messageCreated = await Message.findByPk(msgCreated.id, {
  //       include: [
  //         {
  //           model: Ticket,
  //           as: "ticket",
  //           where: { tenantId },
  //           include: ["contact"],
  //         },
  //         {
  //           model: Message,
  //           as: "quotedMsg",
  //           include: ["contact"],
  //         },
  //       ],
  //     });

  //     if (!messageCreated) {
  //       throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
  //     }

  //     await ticket.update({
  //       lastMessage: messageCreated.body,
  //       lastMessageAt: new Date().getTime(),
  //       answered: true,
  //     });

  //     socketEmit({
  //       tenantId,
  //       type: "chat:create",
  //       payload: messageCreated,
  //     });
  //     fs.unlinkSync(mediaPath);
  //     return;
  //   }
};
