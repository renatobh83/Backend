import * as Yup from "yup";
import { Request, Response } from "express";

import AppError from "../errors/AppError";
import ApiConfig from "../models/ApiConfig";
import Queue from "../libs/Queue";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { getWbot } from "../libs/wbot";

import { find, result } from "lodash";
import ShowApiListService from "../services/ApiConfirmacaoServices/ShowApiListService";
import {
  consultaLaudo,
  consultaPaciente,
  doGetAgendamentos,
  doGetLaudo,
  doListaAtendimentos,
  getPreparos,
} from "../helpers/SEMNOME";
import { TemplateConsulta } from "../templates/consultaDados";

import { validarCPF } from "../utils/ApiWebhook";
import { ListarPlanos } from "../services/ApiConfirmacaoServices/Helpers/ListaPlanos";
import SendMessageBlob from "../services/WbotServices/SendMessageBlob";
import ProcessBodyData from "../helpers/ProcessBodyData";
import GetApiConfirmacaoService from "../services/ApiConfirmacaoServices/GetApiConfirmacaoService";
import ShowApiListServiceName from "../services/ApiConfirmacaoServices/ShowApiListServiceName";

export default interface Notificacao {
  paciente_nome: string;
  cd_procedimento: number[];
  atendimento_data: string;
  atendimento_hora: string;
  atendimento_modalidade: string;
  atendimento_medico: string;
  atendimento_endereco: string;
  idexterno: string;
  dados_agendamentos: string;
  bot: string;
}

interface Contato {
  contato: string;
  cliente: string;
  idExterno: number;
  notificacao: Notificacao;
}

interface Configuracao {
  expiraLista: number;
  cancelarPendentes: boolean;
  contatos: Contato[];
}

interface MessageDataRequest {
  apiId: string;
  sessionId: number;
  media?: Express.Multer.File | string;
  externalKey: string;
  tenantId: number;
  apiConfig: ApiConfig;
  body: Contato;
  idWbot: string;
}

export const sendMessageConfirmacao = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contatos }: Configuracao = req.body;
  const { apiId, authToken, idWbot } = req.params;

  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      authToken,
    },
  });

  if (APIConfig === null) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const newMessage: MessageDataRequest = {
    externalKey: authToken,
    body: contatos[0],
    apiId,
    sessionId: APIConfig.sessionId,
    tenantId: APIConfig.tenantId,
    apiConfig: APIConfig,
    idWbot,
  };

  Queue.add("SendMessageConfirmar", newMessage);

  return res.status(200).json({ message: "Message add queue" });
};

export const sendMessageAPI = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;
  const media = req.file as Express.Multer.File;

  // eslint-disable-next-line eqeqeq
  // if (!apiIdParam || apiId != apiIdParam) {
  //   throw new AppError("ERR_APIID_NO_PERMISSION", 403);
  // }

  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId,
    },
  });

  if (APIConfig?.sessionId !== Number(sessionId)) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const newMessage: MessageDataRequest = {
    ...req.body,
    apiId,
    sessionId,
    tenantId,
    apiConfig: APIConfig,
    media,
  };

  const schema = Yup.object().shape({
    apiId: Yup.string(),
    sessionId: Yup.number(),
    body: Yup.string().required(),
    number: Yup.string().required(),
    mediaUrl:
      Yup.string().url().nullable() ||
      Yup.object().shape({
        destination: Yup.string().required(),
        encoding: Yup.string().required(),
        fieldname: Yup.string().required(),
        filename: Yup.string().required(),
        mimetype: Yup.string().required(),
        originalname: Yup.string().required(),
        path: Yup.string().required(),
        size: Yup.number().required(),
      }),
    externalKey: Yup.string().required(),
    tenantId: Yup.number().required(),
  });

  try {
    await schema.validate(newMessage);
  } catch (error) {
    throw new AppError(error.message);
  }

  Queue.add("SendMessageAPI", newMessage);

  return res.status(200).json({ message: "Message add queue" });
};

export const startSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;

  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId,
    },
  });

  if (APIConfig?.sessionId !== Number(sessionId)) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const whatsapp = await ShowWhatsAppService({
    id: APIConfig.sessionId,
    tenantId: APIConfig.tenantId,
    isInternal: true,
  });
  try {
    const wbot = getWbot(APIConfig.sessionId);
    const isConnectStatus = (await wbot.getState()) === "CONNECTED";
    if (!isConnectStatus) {
      throw new Error("Necessário iniciar sessão");
    }
  } catch (error) {
    StartWhatsAppSession(whatsapp);
  }

  return res.status(200).json(whatsapp);
};

export const TESTEAPIWEBHOOKS = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // const api = await ShowApiListServiceName({
  //   nomeApi: "API GENESIS",
  //   tenantId: 1,
  // });

  const a = await consultaLaudo(1, 30168857);
  // const preparos = cdProcedimento.map(async (procedimento) => {
  //   const response = await getPreparos({ api, procedimento });
  //   return response;
  // });
  // return await Promise.allSettled(preparos);
  // const response = a.notificacao.dados_agendamentos.map((i) =>
  //   getPreparos({ api, procedimento: i.Procedimento })
  // );

  // const retur = await Promise.allSettled(response);
  // const fulfilledResults = retur
  //   .filter((result) => result.status === "fulfilled")
  //   .map((result) => result.value);

  // fulfilledResults.map((a) => console.log(a));
  // const api = await ShowApiListService({ id: idApi, tenantId: 1 });
  // const responseTeste = await doGetAgendamentos({ api, codPaciente: 72382 });
  // console.log(responseTeste);
  // const response = await ListarPlanos({ api });
  // const searchTerm = "brasilia";
  // const filteredData = response.filter((item) =>
  //   item.ds_fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // return res.json(filteredData);
  // const actionIsInclude = api.action.includes(acaoWebhook);

  // if (!actionIsInclude) {
  //   throw new Error("Actions is not defined to api");
  // }

  // if (acaoWebhook === "consulta") {
  //   try {
  //     const data = await consultaPaciente({
  //       api,
  //       params: { NomePaciente: "Renato Mendonca" },
  //     });

  //     if (data.length > 1) {
  //       const findRegistro = data.find((i) => i.CPF === "22895523053");
  //       if (findRegistro) {
  //         // REGISTRO LOCALIZADO
  //         return res.status(200).json(findRegistro);
  //       }
  //       // REGISTRO NAO LOCALIZADO
  //       console.log(findRegistro);
  //     }
  //     // REGISTRO LOCALIZADO
  //     return res.status(200).json(data);
  //   } catch (error) {
  //     // Responder com o status de erro e a mensagem apropriada
  //     if (error instanceof AppError) {
  //       return res.status(error.statusCode).json({ message: error.message });
  //     }

  //     return res.status(500).json({ message: error });
  //   }
  // }
  //    const token = "aa5234f21048750108464e50cf9ddf5ab86972861a6d62c7d540525e989c097d"
  // const urlTeste = "http://otrsweb.zapto.org/clinuxintegra/consultapacientes"
  // const nome = ticket.contact.name
  // const {data } = await axios.post(urlTeste, {
  //   NomePaciente: nome
  // }, {
  //   headers: {
  //     'Authorization': token,
  //     'Content-Type': 'application/json'
  //   }
  // })
  // const dataRequest = {
  //   js_paciente: btoa(JSON.stringify(req.body)),
  // };
  // // const agendamento = await API.doGetAgendamentos(73493)
  // // const da = await API.confirmaExame( 228399)
  // // const pr = await API.doGetPreparo(104)
  // // const login= await API.doPacienteLogin('suporte2@exp.net.br','1')
  // try {
  //   // const newPaciente = await API.doCadatrarPaciente(btoa(JSON.stringify(req.body)))
  //   // const planos = await API.doListaPlano()
  //   // const atendimento = await API.doListaAtendimentos(72382)
  //   // const medicos = await API.doListaMedicos()
  //   // const laudo = await API.doGetLaudo(162824,72382, 1, false)
  //   const data = {
  //     dt_de: "20241016",
  //     dt_ate: "20241016",
  //   };
  //   const confirmacaolista = await API.doListaConfirmacao(data);
  //   return res.status(200).send(confirmacaolista);
  // } catch (error) {
  //   return res.status(500).send(error.response);
  // }
  return res.status(200).json("ok");
};
