import ApiConfirmacao from "../../models/ApiConfirmacao";


interface Response {
  link: string,
  usuario: string,
  senha: string
}
interface Request {
  tenantId: number;
}

const GetApiConfirmacaoService = async ({
  tenantId
}: Request): Promise<Response> => {

  const {link, senha, usuario } = await ApiConfirmacao.findOne({
    where: { tenantId }
  }) as Response
  return { usuario, link, senha };
};

export default GetApiConfirmacaoService;

