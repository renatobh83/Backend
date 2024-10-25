import { Sequelize } from "sequelize";
import ApiConfirmacao from "../../models/ApiConfirmacao";
import AppError from "../../errors/AppError";

interface Request {
  id: string;
  status?: string;
  tenantId: number;
}

const UpdateApiStatusService = async ({
  id,
  status,
  tenantId,
}: Request): Promise<ApiConfirmacao> => {
  const apiData = {
    status,
    token: null,
  };

  const api = await ApiConfirmacao.findOne({
    where: { id: id, tenantId },
  });

  if (!api) {
    throw new AppError("ERR_NO_API_FOUND", 404);
  }
  await api.update(apiData);
  await api.reload();
  return api;
};

export default UpdateApiStatusService;
