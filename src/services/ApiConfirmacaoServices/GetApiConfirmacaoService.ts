import ApiConfirmacao from "../../models/ApiConfirmacao";

interface Response {
  action: string[];
  usuario: string;
  senha: string;
}
interface Request {
  tenantId: number;
}

const GetApiConfirmacaoService = async ({
  tenantId,
}: Request): Promise<Response> => {
  const apiConfirmacao = (await ApiConfirmacao.findAll({
    where: { tenantId },
    attributes: { exclude: ["token", "token2"] }, // Exclui o campo token
    order: [["usuario", "ASC"]],
  })) as unknown as Response;

  return apiConfirmacao;
  // return { usuario, link, senha };
};

export default GetApiConfirmacaoService;
