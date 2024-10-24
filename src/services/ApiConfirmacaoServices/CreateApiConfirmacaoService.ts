import { sign } from "jsonwebtoken";
import ApiConfirmacao from "../../models/ApiConfirmacao";

interface Request {
  usuario: string;
  senha: string;
  tenantId: number;
  action: string[];
  nomeApi: string;
  status: string;
}

const CreateApiConfirmacaoService = async ({
  action,
  senha,
  usuario,
  tenantId,
  nomeApi,
  status,
}: Request): Promise<ApiConfirmacao> => {
  const apiData = {
    usuario,
    tenantId,
    senha,
    action,
    nomeApi,
    status,
  };

  const apiConfirmacao = await ApiConfirmacao.create(apiData);

  return apiConfirmacao;
};

export default CreateApiConfirmacaoService;
