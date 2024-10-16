import {  Sequelize } from "sequelize";
import ApiConfirmacao from "../../models/ApiConfirmacao";


interface Request {
    id: Number,
    urlService?: string;
    usuarioApi?: string;
    senhaApi?: string;
    action?: string[];
  }

  const UpdateApiConfirmacaoService = async ({
    id,
    urlService,
    usuarioApi,
    senhaApi,
    action,
  }: Request): Promise<void> => {

    const apiData = {
        link: urlService,
        usuario: usuarioApi,
        senha: senhaApi,
        action
    }

//    await ApiConfirmacao.update({
//     action: Sequelize.literal(
//         `action || '${apiData.action}'`
//       ),
//       link: apiData.link,
//    },{
//        where:id
//     })
   }



export default UpdateApiConfirmacaoService