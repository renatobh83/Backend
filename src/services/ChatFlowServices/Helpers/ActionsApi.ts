import {
  confirmaExame,
  doGetAgendamentos,
  doListaAtendimentos,
} from "../../../helpers/SEMNOME";
import { TemplateConfirmaAgendamento } from "../../../templates/confirmacao";
import { TemplateConsulta } from "../../../templates/consultaDados";
import {
  TemplateListaAgendamentos,
  type ResponseListaAgendamentos,
} from "../../../templates/ListaAgendamentos";
import { TemplateListaAtendimentos } from "../../../templates/ListaAtendimentos";
import { validarCPF } from "../../../utils/ApiWebhook";
import { ConsultaPaciente } from "../../ApiConfirmacaoServices/Helpers/ConsultaPacientes";
import { ConsultarLaudos } from "../../ApiConfirmacaoServices/Helpers/ConsultarLaudos";
import { ListarPlanos } from "../../ApiConfirmacaoServices/Helpers/ListaPlanos";
interface ResponseListaAtendimento {
  ds_medico: string;
  dt_data: string;
  ds_procedimento: string;
  cd_exame: string;
}

interface ResponseListaPlanos {
  cd_plano: number;
  ds_plano: string;
  cd_fornecedor: number;
  ds_fornecedor: string;
}
let codPaciente: number;
let listaAtendimentos: ResponseListaAtendimento[];
let listaAgendamentos: ResponseListaAgendamentos[];
let listaPlanos: ResponseListaPlanos[];

export const apiConsulta = async (nome: string, api: any, numero: string) => {
  let mensagem: string;
  const dataResponseConsulta = await ConsultaPaciente({
    api,
    params: { NomePaciente: nome },
  });
  if (dataResponseConsulta.length > 1) {
    mensagem = TemplateConsulta({ nome }).nenhumRegistroLocalizado;
    return mensagem;
  }
  const dados = dataResponseConsulta.find(
    (i) => i.Celular || i.Whatsapp === numero
  );
  if (dados) {
    codPaciente = dados.CodigoPaciente;
    mensagem = TemplateConsulta({ nome }).registroEncontrado;
    return mensagem;
  }
  return TemplateConsulta({ nome }).nenhumRegistroLocalizado;
};
export const apiConsultaCPF = async (nome: string, api: any, cpf: string) => {
  let mensagem: string;
  const dataResponseConsulta = await ConsultaPaciente({
    api,
    params: { NomePaciente: nome, CPF: cpf },
  });

  if (dataResponseConsulta.length) {
    codPaciente = dataResponseConsulta[0].CodigoPaciente;
    mensagem = TemplateConsulta({ nome }).registroEncontrado;
    return mensagem;
  }
  return TemplateConsulta({ nome }).nenhumRegistroLocalizado;
};
export const consultaAtendimentos = async (api) => {
  // biome-ignore lint/style/useConst: <explanation>
  let mensagem: string;
  listaAtendimentos = await doListaAtendimentos({
    api,
    codigoPaciente: codPaciente,
  });

  mensagem =
    listaAtendimentos.length > 0
      ? TemplateListaAtendimentos({
          listaAtendimentos,
        }).atendimentosRecentes
      : TemplateListaAtendimentos({
          listaAtendimentos,
        }).semAtendimentoComLaudo;
  return mensagem;
};
export const getLaudoPDF = async (api: any, chosenIndex: number) => {
  const selectedLaudo = listaAtendimentos[chosenIndex - 1];
  await ConsultarLaudos({
    api,
    cdExame: +selectedLaudo.cd_exame,
    cdPaciente: codPaciente,
    cdFuncionario: 1,
    entrega: false,
  });
  const mediaName = `${+selectedLaudo.cd_exame}.pdf`;
  return mediaName;
};

export const getAgendamentos = async (api: any) => {
  // biome-ignore lint/style/useConst: <explanation>
  let mensagem: string;
  listaAgendamentos = await doGetAgendamentos({
    api,
    codPaciente: codPaciente,
  });

  mensagem =
    listaAgendamentos.length > 0
      ? TemplateListaAgendamentos({
          listaAgendamentos,
        }).agendamentos
      : TemplateListaAgendamentos({
          listaAgendamentos,
        }).semAgendamento;

  return mensagem;
};
export const ConfirmaExame = async (api: any, chosenIndex: number) => {
  // biome-ignore lint/style/useConst: <explanation>
  let message: string;
  const selectedAgendamemto = listaAgendamentos[chosenIndex - 1].cd_atendimento;
  const data = await confirmaExame(api, selectedAgendamemto);
  message =
    data.length > 0
      ? TemplateConfirmaAgendamento().confirmacao
      : TemplateConfirmaAgendamento().erroConfirmacao;
  return message;
};
export const getListaPlanos = async (api, plano) => {
  listaPlanos = await ListarPlanos({ api });
};
// if (acaoWebhook === "consulta") {
//     const dataResponseConsulta = await ConsultaPaciente({
//       api,
//       params: { NomePaciente: nome },
//     });
//     console.log(dataResponseConsulta);
//     if (dataResponseConsulta.length > 1) {
//       mensagem = TemplateConsulta({ nome }).variosRegistro;
//     } else {
//       const dados = dataResponseConsulta.find(
//         (i) => i.Celular || i.Whatsapp === numero
//       );
//       if (dados) {
//         // enviar mensagem que foi localizado o registro
//         codPaciente = dados.CodigoPaciente;
//         mensagem = TemplateConsulta({ nome }).registroEncontrado;
//         const messageSent = await SendMessageSystemProxy({
//           ticket,
//           messageData: {
//             ...messageData,
//             body: mensagem,
//           },
//           media: null,
//           userId: null,
//         });
//         const msgCreated = await Message.create({
//           ...messageData,
//           ...messageSent,
//           id: messageData.id,
//           messageId: messageSent.id?.id || messageSent.messageId || null,
//           mediaType: "bot",
//         });
//         const messageCreated = await Message.findByPk(msgCreated.id, {
//           include: [
//             {
//               model: Ticket,
//               as: "ticket",
//               where: { tenantId },
//               include: ["contact"],
//             },
//             {
//               model: Message,
//               as: "quotedMsg",
//               include: ["contact"],
//             },
//           ],
//         });

//         if (!messageCreated) {
//           throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
//         }

//         await ticket.update({
//           lastMessage: messageCreated.body,
//           lastMessageAt: new Date().getTime(),
//           answered: true,
//         });
//         return;
//       }
//       // nao conseguimos localizar
//       mensagem = TemplateConsulta({ nome }).nenhumRegistroLocalizado;
//       const messageSent = await SendMessageSystemProxy({
//         ticket,
//         messageData: {
//           ...messageData,
//           body: mensagem,
//         },
//         media: null,
//         userId: null,
//       });
//       const msgCreated = await Message.create({
//         ...messageData,
//         ...messageSent,
//         id: messageData.id,
//         messageId: messageSent.id?.id || messageSent.messageId || null,
//         mediaType: "bot",
//       });
//       const messageCreated = await Message.findByPk(msgCreated.id, {
//         include: [
//           {
//             model: Ticket,
//             as: "ticket",
//             where: { tenantId },
//             include: ["contact"],
//           },
//           {
//             model: Message,
//             as: "quotedMsg",
//             include: ["contact"],
//           },
//         ],
//       });

//       if (!messageCreated) {
//         throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
//       }

//       await ticket.update({
//         lastMessage: messageCreated.body,
//         lastMessageAt: new Date().getTime(),
//         answered: true,
//       });
//       return;
//     }
//   }
//   if (acaoWebhook === "consultacpf") {
//     console.log(ticket.lastMessage);
//     const dataResponseConsulta = await ConsultaPaciente({
//       api,
//       params: {
//         NomePaciente: nome,
//         CPF: ticket.lastMessage.toLowerCase().trim(),
//       },
//     });
//     if (dataResponseConsulta.length > 1) {
//       mensagem = TemplateConsulta({ nome }).variosRegistro;
//     } else {
//       const dados = dataResponseConsulta.find(
//         (i) => i.Celular || i.Whatsapp === numero
//       );
//       if (dados) {
//         // enviar mensagem que foi localizado o registro
//         codPaciente = dados.CodigoPaciente;
//         mensagem = TemplateConsulta({ nome }).registroEncontrado;
//         const messageSent = await SendMessageSystemProxy({
//           ticket,
//           messageData: {
//             ...messageData,
//             body: mensagem,
//           },
//           media: null,
//           userId: null,
//         });
//         const msgCreated = await Message.create({
//           ...messageData,
//           ...messageSent,
//           id: messageData.id,
//           messageId: messageSent.id?.id || messageSent.messageId || null,
//           mediaType: "bot",
//         });
//         const messageCreated = await Message.findByPk(msgCreated.id, {
//           include: [
//             {
//               model: Ticket,
//               as: "ticket",
//               where: { tenantId },
//               include: ["contact"],
//             },
//             {
//               model: Message,
//               as: "quotedMsg",
//               include: ["contact"],
//             },
//           ],
//         });

//         if (!messageCreated) {
//           throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
//         }

//         await ticket.update({
//           lastMessage: messageCreated.body,
//           lastMessageAt: new Date().getTime(),
//           answered: true,
//         });
//         return;
//       }
//       // nao conseguimos localizar
//       mensagem = TemplateConsulta({ nome }).nenhumRegistroLocalizado;
//       const messageSent = await SendMessageSystemProxy({
//         ticket,
//         messageData: {
//           ...messageData,
//           body: mensagem,
//         },
//         media: null,
//         userId: null,
//       });
//       const msgCreated = await Message.create({
//         ...messageData,
//         ...messageSent,
//         id: messageData.id,
//         messageId: messageSent.id?.id || messageSent.messageId || null,
//         mediaType: "bot",
//       });
//       const messageCreated = await Message.findByPk(msgCreated.id, {
//         include: [
//           {
//             model: Ticket,
//             as: "ticket",
//             where: { tenantId },
//             include: ["contact"],
//           },
//           {
//             model: Message,
//             as: "quotedMsg",
//             include: ["contact"],
//           },
//         ],
//       });

//       if (!messageCreated) {
//         throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
//       }

//       await ticket.update({
//         lastMessage: messageCreated.body,
//         lastMessageAt: new Date().getTime(),
//         answered: true,
//       });
//       return;
//     }
//   }
//   if (acaoWebhook === "laudo") {
//     listaAtendimentos = await doListaAtendimentos({
//       api,
//       codigoPaciente: codPaciente,
//     });

//     mensagem =
//       listaAtendimentos.length > 0
//         ? TemplateListaAtendimentos({
//             listaAtendimentos,
//           }).atendimentosRecentes
//         : TemplateListaAtendimentos({
//             listaAtendimentos,
//           }).semAtendimentoComLaudo;

//     const messageSent = await SendMessageSystemProxy({
//       ticket,
//       messageData: {
//         ...messageData,
//         body: mensagem,
//       },
//       media: null,
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
//     return;
//   }
//   if (acaoWebhook === "pdf") {
//     const chosenIndex = +ticket.lastMessage;
//     const selectedLaudo = listaAtendimentos[chosenIndex - 1];
//     await ConsultarLaudos({
//       api,
//       cdExame: +selectedLaudo.cd_exame,
//       cdPaciente: codPaciente,
//       cdFuncionario: 1,
//       entrega: false,
//     });
//     const customPath = join(__dirname, "..", "..", "..", "public");
//     const mediaName = `${+selectedLaudo.cd_exame}.pdf`;
//     const mediaPath = join(customPath, mediaName);
//     const arquivoExiste = await verificarArquivo(mediaPath);
//     if (arquivoExiste) {
//       const messageSent = await SendMessageSystemProxy({
//         ticket,
//         messageData: {
//           ...messageData,
//           mediaName: mediaName,
//         },
//         media: {
//           path: mediaPath,
//         },
//         userId: null,
//       });
//       const msgCreated = await Message.create({
//         ...messageData,
//         ...messageSent,
//         id: messageData.id,
//         messageId: messageSent.id?.id || messageSent.messageId || null,
//         mediaType: "bot",
//       });
//       const messageCreated = await Message.findByPk(msgCreated.id, {
//         include: [
//           {
//             model: Ticket,
//             as: "ticket",
//             where: { tenantId },
//             include: ["contact"],
//           },
//           {
//             model: Message,
//             as: "quotedMsg",
//             include: ["contact"],
//           },
//         ],
//       });

//       if (!messageCreated) {
//         throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
//       }

//       await ticket.update({
//         lastMessage: messageCreated.body,
//         lastMessageAt: new Date().getTime(),
//         answered: true,
//       });
//     }
//     return;
//   }
//   if (acaoWebhook === "agendamento") {
//     listaAgendamentos = await doGetAgendamentos({
//       api,
//       codPaciente: codPaciente,
//     });

//     mensagem =
//       listaAgendamentos.length > 0
//         ? TemplateListaAgendamentos({
//             listaAgendamentos,
//           }).agendamentos
//         : TemplateListaAgendamentos({
//             listaAgendamentos,
//           }).semAgendamento;

//     const messageSent = await SendMessageSystemProxy({
//       ticket,
//       messageData: {
//         ...messageData,
//         body: mensagem,
//       },
//       media: null,
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
//     return;
//   }