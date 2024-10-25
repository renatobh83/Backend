import type { Request, Response } from "express";
import AppError from "../errors/AppError";
import GetApiConfirmacaoService from "../services/ApiConfirmacaoServices/GetApiConfirmacaoService";
import CreateApiConfirmacaoService from "../services/ApiConfirmacaoServices/CreateApiConfirmacaoService";
import UpdateApiConfirmacaoService from "../services/ApiConfirmacaoServices/updateApiConfirmacaoService";
import ListApiConfigService from "../services/ApiConfigServices/ListApiConfigService";
import DeleteApiService from "../services/ApiConfirmacaoServices/DeleteApiService";
import { StartApiSession } from "../services/ApiExternaService/StartApiSession";
import UpdateApiStatusService from "../services/ApiConfirmacaoServices/UpdateApiStatusService";

interface ApiData {
  usuario: string;
  senha: string;
  tenantId: number;
  status: string;
  nomeApi: string;
  action: string[];
  baseURl: string;
}

interface updateData {
  id: number;
  status?: string;
  usuario?: string;
  senha?: string;
  action?: string[];
  token: string;
  token2: string;
  expDate: Date;
  nomeApi: string;
  tenantId: number;
  baseURl: string;
}
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const apis = await GetApiConfirmacaoService({ tenantId });
  return res.status(200).json(apis);
};
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const newApi: ApiData = { ...req.body, tenantId };
  const api = await CreateApiConfirmacaoService(newApi);
  return res.json(api);
};
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id: idApi } = req.params;

  const id = Number(idApi);
  const updateApi: updateData = { ...req.body, id };

  const api = await UpdateApiConfirmacaoService(updateApi);

  return res.status(200).json(api);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { id } = req.params;
  await DeleteApiService({ id, tenantId });
  return res.status(200).json({ message: "Api deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const apiConfirmacao = await ListApiConfigService({ tenantId });
  return res.status(200).json(apiConfirmacao);
};

export const connect = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await StartApiSession(req.body);

    return res.sendStatus(200);
  } catch (error) {
    // Responder com o status de erro e a mensagem apropriada
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { id, status } = req.params;
  const data = await UpdateApiStatusService({ id, status, tenantId });
  return res.status(200).json(data);
};
