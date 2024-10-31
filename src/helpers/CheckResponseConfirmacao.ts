import Confirmacao from "../models/Confirmacao";
import GetApiConfirmacaoService from "../services/ApiConfirmacaoServices/GetApiConfirmacaoService";
import Queue from "../libs/Queue";

interface responseMsg {
  from: string;
  body: any;
}

interface Data {
  data: responseMsg;
  tenantId: number;
}

const CheckConfirmationResponse = async ({
  tenantId,
  data,
}: Data): Promise<void> => {
  const msgConfirmacao = await Confirmacao.findOne({
    where: {
      tenantId: tenantId,
      contatoSend: data.from,
    },
  });
  msgConfirmacao.status = "RESPONDIDO";
  msgConfirmacao.lastMessage = data.body;
  // msgConfirmacao.answered = true;
  msgConfirmacao.lastMessageAt = new Date().getTime();
  msgConfirmacao.save();
  switch (data.body) {
    case "sim":
    case "Sim":
    case "👍":
    case "1":
      Queue.add("WebHookConfirma", {
        idexterno: msgConfirmacao.idexterno,
        procedimentos: msgConfirmacao.procedimentos,
        tenantId,
        contatoSend: data.from,
      });
      break;
    case "nao":
    case "Nao":
    case "Não":
    case "2":
      console.log("Resposta cancela:", data.body);
      //Queue.add("WebHookCancela",{})
      // Lógica adicional aqui
      break;
    default:
      console.log("Resposta inválida:", data.body);
      // Lógica adicional aqui
      break;
  }
};

export default CheckConfirmationResponse;
