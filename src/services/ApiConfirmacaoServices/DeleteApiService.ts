import AppError from "../../errors/AppError";
import ApiConfirmacao from "../../models/ApiConfirmacao";

interface Request {
  id: string | number;
  tenantId: string | number;
}

const DeleteApiService = async ({ id, tenantId }: Request): Promise<void> => {
  const api = await ApiConfirmacao.findOne({
    where: { id, tenantId },
  });

  if (!api) {
    throw new AppError("ERR_NO_API_FOUND", 404);
  }

  await api.destroy();
};

export default DeleteApiService;
