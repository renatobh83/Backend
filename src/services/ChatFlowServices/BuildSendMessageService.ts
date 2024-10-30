import path, { join } from "path";
import { pupa } from "../../utils/pupa";
import { logger } from "../../utils/logger";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import socketEmit from "../../helpers/socketEmit";
import SendMessageSystemProxy from "../../helpers/SendMessageSystemProxy";
import ShowApiListService from "../ApiConfirmacaoServices/ShowApiListService";
import { ConsultaPaciente } from "../ApiConfirmacaoServices/Helpers/ConsultaPacientes";
import { TemplateConsulta } from "../../templates/consultaDados";
import {
  doGetAgendamentos,
  doGetLaudo,
  doListaAtendimentos,
} from "../../helpers/SEMNOME";
import { ConsultarLaudos } from "../ApiConfirmacaoServices/Helpers/ConsultarLaudos";
import { TemplateListaAtendimentos } from "../../templates/ListaAtendimentos";
import { existsSync } from "fs";
import { promisify } from "util";
import {
  ResponseListaAgendamentos,
  TemplateListaAgendamentos,
} from "../../templates/ListaAgendamentos";
import {
  apiConsulta,
  apiConsultaCPF,
  ConfirmaExame,
  consultaAtendimentos,
  getAgendamentos,
  getLaudoPDF,
  getPreparo,
  ListaExamesPreparo,
} from "./Helpers/ActionsApi";
import { validarCPF } from "../../utils/ApiWebhook";
import SendMessageBlobHtml from "../../helpers/SendWhatsAppBlob";
interface MessageData {
  id?: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  timestamp?: number;
  internalId?: string;
  userId?: string | number;
  tenantId: string | number;
  quotedMsgId?: string;
  // status?: string;
  scheduleDate?: string | Date;
  sendType?: string;
  status?: string;
}

interface WebhookProps {
  apiId: string;
  acao: string;
}
interface MessageRequest {
  data: {
    message?: string;
    values?: string[];
    caption?: string;
    ext?: string;
    mediaUrl?: string;
    name?: string;
    type?: string;
    webhook?: WebhookProps;
  };
  id: string;
  type: "MessageField" | "MessageOptionsField" | "MediaField" | "WebhookField";
}

interface Request {
  msg: MessageRequest;
  tenantId: string | number;
  ticket: Ticket;
  userId?: number | string;
}

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
interface ResponseListaAtendimento {
  ds_medico: string;
  dt_data: string;
  ds_procedimento: string;
  cd_exame: string;
}
// const writeFileAsync = promisify(writeFile);
let codPaciente: number;
let listaAtendimentos: ResponseListaAtendimento[];
let listaAgendamentos: ResponseListaAgendamentos[];

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
const BuildSendMessageService = async ({
  msg,
  tenantId,
  ticket,
  userId,
}: Request): Promise<void> => {
  const messageData: MessageData = {
    ticketId: ticket.id,
    body: "",
    contactId: ticket.contactId,
    fromMe: true,
    read: true,
    mediaType: "chat",
    mediaUrl: undefined,
    timestamp: new Date().getTime(),
    quotedMsgId: undefined,
    userId,
    scheduleDate: undefined,
    sendType: "bot",
    status: "pending",
    tenantId,
  };

  try {
    if (msg.type === "MediaField" && msg.data.mediaUrl) {
      const urlSplit = msg.data.mediaUrl.split("/");

      const message = {
        ...messageData,
        body: msg.data.name,
        mediaName: urlSplit[urlSplit.length - 1],
        mediaUrl: urlSplit[urlSplit.length - 1],
        mediaType: msg.data.type
          ? msg.data?.type.substr(0, msg.data.type.indexOf("/"))
          : "chat",
      };

      const customPath = join(__dirname, "..", "..", "..", "public");
      const mediaPath = join(customPath, message.mediaUrl);

      const media = {
        path: mediaPath,
        filename: message.mediaName,
      };

      const messageSent = await SendMessageSystemProxy({
        ticket,
        messageData: message,
        media,
        userId,
      });

      const msgCreated = await Message.create({
        ...message,
        ...messageSent,
        id: messageData.id,
        messageId: messageSent.id?.id || messageSent.messageId || null,
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
      });

      socketEmit({
        tenantId,
        type: "chat:create",
        payload: messageCreated,
      });
    } else if (msg.type === "WebhookField") {
      let mensagem: string;
      let messageSent: any;
      const idApi = msg.data.webhook.apiId;
      const acaoWebhook = msg.data.webhook.acao.toLowerCase();
      console.log(acaoWebhook);
      const api = await ShowApiListService({ id: idApi, tenantId });

      const actionIsInclude = api.action.includes(acaoWebhook);

      if (!actionIsInclude) {
        throw new Error("Actions is not defined to api");
      }
      const nome = ticket.contact.name;
      const numero = formatarNumero(ticket.contact.number);
      if (acaoWebhook === "consulta") {
        mensagem = await apiConsulta(nome, api, numero);
      } else if (acaoWebhook === "consultacpf") {
        mensagem = await apiConsultaCPF(
          nome,
          api,
          ticket.lastMessage.toString().trim()
        );
      } else if (acaoWebhook === "laudo") {
        mensagem = await consultaAtendimentos(api);
      } else if (acaoWebhook === "agendamento") {
        mensagem = await getAgendamentos(api);
      } else if (acaoWebhook === "preparo") {
        mensagem = await ListaExamesPreparo();
      } else if (acaoWebhook === "sendpreparo") {
        const preparo = await getPreparo(+ticket.lastMessage, api);
        preparo.map((p) => {
          SendMessageBlobHtml({
            ticket,
            blob: p,
            userId: null,
          });
        });
      } else if (acaoWebhook === "confirmacao") {
        mensagem = await ConfirmaExame(api, +ticket.lastMessage);
      } else if (acaoWebhook === "pdf") {
        const mediaName = await getLaudoPDF(api, +ticket.lastMessage);
        const customPath = join(__dirname, "..", "..", "..", "public");
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
          return;
        }
      }
      messageSent = await SendMessageSystemProxy({
        ticket,
        messageData: {
          ...messageData,
          body: mensagem,
        },
        media: null,
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
      // {
      //   type: 'WebhookField',
      //   id: '33947090-4669-41c3-8b3d-1a84e9fc24e6',
      //   data: { webhook: { apiId: '19', acao: 'consulta' } }
      // }
    } else {
      // Alter template message
      msg.data.message = pupa(msg.data.message || "", {
        // greeting: será considerado conforme data/hora da mensagem internamente na função pupa
        protocol: ticket.protocol,
        name: ticket.contact.name,
      });

      const messageSent = await SendMessageSystemProxy({
        ticket,
        messageData: {
          ...messageData,
          body: msg.data.message,
        },
        media: null,
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
    }
  } catch (error) {
    logger.error("BuildSendMessageService", error);
  }
};

export default BuildSendMessageService;
