import { sign } from "jsonwebtoken";
import ApiConfirmacao from "../../models/ApiConfirmacao";


interface Request {
    urlService: string;
    usuarioApi: string;
    senhaApi: string;
    tenantId:  number;
    action: string[];
  }

  const CreateApiConfirmacaoService = async ({
    urlService,
    usuarioApi,
    senhaApi,
    tenantId,
    action,
  }: Request): Promise<ApiConfirmacao> => {
    const apiData = {
        link: urlService,
        usuario: usuarioApi,
        tenantId,
        senha: senhaApi,
        action
    }

    const apiConfirmacao = await ApiConfirmacao.create(apiData)

    return apiConfirmacao
   }



export default CreateApiConfirmacaoService