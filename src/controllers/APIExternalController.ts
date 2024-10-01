import * as Yup from "yup";
import { Request, Response } from "express";

import AppError from "../errors/AppError";
import ApiConfig from "../models/ApiConfig";
import Queue from "../libs/Queue";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { getWbot } from "../libs/wbot";

export default interface Notificacao {
  paciente_nome: string;
  cd_procedimento: number[];
  atendimento_data: string;
  atendimento_hora: string;
  atendimento_modalidade: string;
  atendimento_medico: string;
  atendimento_endereco: string;
  idexterno: string;
  dados_agendamentos: string
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
  apiConfig: ApiConfig,
  body: Contato
  idWbot: string
}

export const sendMessageConfirmacao = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contatos } : Configuracao = req.body
  const { apiId, authToken , idWbot } = req.params;


  const APIConfig = await ApiConfig.findOne({
      where: {
          id: apiId,
          authToken
        }
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
    idWbot
  };


   Queue.add("SendMessageConfirmar", newMessage);

  return res.status(200).json({ message: "Message add queue" });
}


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
      tenantId
    }
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
    media
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
        size: Yup.number().required()
      }),
    externalKey: Yup.string().required(),
    tenantId: Yup.number().required()
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
      tenantId
    }
  });

  if (APIConfig?.sessionId !== Number(sessionId)) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const whatsapp = await ShowWhatsAppService({
    id: APIConfig.sessionId,
    tenantId: APIConfig.tenantId,
    isInternal: true
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
