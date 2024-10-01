import { Request, Response } from "express";
import AppError from "../errors/AppError";
import GetApiConfirmacaoService from "../services/ApiConfirmacaoServices/GetApiConfirmacaoService";
import CreateApiConfirmacaoService from "../services/ApiConfirmacaoServices/CreateApiConfirmacaoService";
import UpdateApiConfirmacaoService from "../services/ApiConfirmacaoServices/updateApiConfirmacaoService";

interface ApiData {

  urlService: string;
  usuarioApi: string;
  senhaApi: string;
  tenantId: number;
  action: string[];
}

interface updateData {
  id: number
  urlService?: string;
  usuarioApi?: string;
  senhaApi?: string;
  action?: string[];
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
  const { tenantId } = req.user;
  const { id : idApi } = req.params

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const id = Number(idApi)
  const updateApi: updateData = { ...req.body, id};

  // await UpdateApiConfirmacaoService(updateApi)

  return res.send('ola');
};
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return res;
};
