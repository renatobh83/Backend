import { sign } from "jsonwebtoken";
import ApiConfirmacao from "../../models/ApiConfirmacao";

interface Request {
  usuario: string;
  senha: string;
  tenantId: number;
  action: string[];
}

const CreateApiConfirmacaoService = async ({
  action,
  senha,
  usuario,
  tenantId,
}: Request): Promise<ApiConfirmacao> => {
  const apiData = {
    usuario,
    tenantId,
    senha,
    action,
  };

  const apiConfirmacao = await ApiConfirmacao.create(apiData);

  return apiConfirmacao;
};

export default CreateApiConfirmacaoService;
