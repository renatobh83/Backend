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
import { doGetLaudo, doListaAtendimentos } from "../../helpers/SEMNOME";
import { ConsultarLaudos } from "../ApiConfirmacaoServices/Helpers/ConsultarLaudos";
import { TemplateListaAtendimentos } from "../../templates/ListaAtendimentos";
import { existsSync } from "fs";
import { promisify } from "util";
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

      const idApi = msg.data.webhook.apiId;
      const acaoWebhook = msg.data.webhook.acao.toLowerCase();

      const api = await ShowApiListService({ id: idApi, tenantId });

      const actionIsInclude = api.action.includes(acaoWebhook);

      if (!actionIsInclude) {
        throw new Error("Actions is not defined to api");
      }
      const nome = ticket.contact.name;
      const numero = formatarNumero(ticket.contact.number);

      if (acaoWebhook === "consulta") {
        const dataResponseConsulta = await ConsultaPaciente({
          api,
          params: { NomePaciente: nome },
        });
        if (dataResponseConsulta.length > 1) {
          mensagem = TemplateConsulta({ nome }).variosRegistro;
        } else {
          const dados = dataResponseConsulta.find(
            (i) => i.Celular || i.Whatsapp === numero
          );
          if (dados) {
            // enviar mensagem que foi localizado o registro
            codPaciente = dados.CodigoPaciente;
            mensagem = TemplateConsulta({ nome }).registroEncontrado;
            const messageSent = await SendMessageSystemProxy({
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
            return;
          }
          // nao conseguimos localizar
          mensagem = TemplateConsulta({ nome }).nenhumRegistroLocalizado;
          const messageSent = await SendMessageSystemProxy({
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
          return;
        }
      }
      if (acaoWebhook === "laudo") {
        listaAtendimentos = await doListaAtendimentos({
          api,
          codigoPaciente: codPaciente,
        });
        mensagem = TemplateListaAtendimentos({
          listaAtendimentos,
        }).atendimentosRecentes;
        const messageSent = await SendMessageSystemProxy({
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
        return;
      }
      if (acaoWebhook === "pdf") {
        const chosenIndex = +ticket.lastMessage;
        const selectedLaudo = listaAtendimentos[chosenIndex - 1];
        await ConsultarLaudos({
          api,
          cdExame: +selectedLaudo.cd_exame,
          cdPaciente: codPaciente,
          cdFuncionario: 1,
          entrega: false,
        });
        const customPath = join(__dirname, "..", "..", "..", "public");
        const mediaName = `${+selectedLaudo.cd_exame}.pdf`;
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
        }
        return;
      }
      // {
      //   type: 'WebhookField',
      //   id: '33947090-4669-41c3-8b3d-1a84e9fc24e6',
      //   data: { webhook: { apiId: '19', acao: 'consulta' } }
      // }162824,72382, 1, false
      // Choice Webhoook
      //   const token = "aa5234f21048750108464e50cf9ddf5ab86972861a6d62c7d540525e989c097d"
      //   const urlTeste = "http://otrsweb.zapto.org/clinuxintegra/consultapacientes"
      //   const nome = ticket.contact.name
      //   const {data } = await axios.post(urlTeste, {
      //     NomePaciente: nome
      //   }, {
      //     headers: {
      //       'Authorization': token,
      //       'Content-Type': 'application/json'
      //     }
      //   })
      // const codigoPaciente = data[0].CodigoPaciente
      //   const token2 = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyAiZXhwIiA6IDE3MjkwOTQ1NjIsICJucl92ZXJzYW8iIDogMzA3ODQsICJjZF9ncnVwbyIgOiAxLCAiY2RfbWF0cml6IiA6IDEsICJucl9lbXByZXNhIiA6IDEsICJucl9mdW5jaW9uYXJpbyIgOiAwLCAiY2RfZW1wcmVzYSIgOiAxLCAiY2RfdXN1YXJpbyIgOiAxLCAiZHNfdXN1YXJpbyIgOiAiUk9PVCIsICJjZF9mdW5jaW9uYXJpbyIgOiAxLCAiY2RfbWVkaWNvIiA6IDAsICJjZF9zZXNzYW8iIDogMCwgImNkX2F0ZW5kaW1lbnRvIiA6IDAsICJjZF9leGFtZSIgOiAwIH0.-PtWxWRHSrFqCfS7pgY01Bs5RYCDjktlfFwdGGbDtdw'
      //   const agenda = `https://otrsweb.zapto.org/testeportal/cgi-bin/dwserver.cgi/se1/doListaAgendamento?cd_paciente=${codigoPaciente}`
      //  const agendamento  = await axios.post(agenda,{}, {
      //    headers: {
      //      'Authorization': `Bearer ${token2}`
      //    }
      //  })
      //  const messageSend = agendamento.data[0]
      //  const template = CreateTemplateMessageConsulta({
      //   msg: messageSend,
      // });
      //  const messageSent = await SendMessageSystemProxy({
      //   ticket,
      //   messageData: {
      //     ...messageData,
      //     body: template.body
      //   },
      //   media: null,
      //   userId: null
      // });
      //   console.log(messageSent)
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
