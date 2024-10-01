import Contato from "../../controllers/APIExternalController";

interface Request {
  msg: Contato;
  hora: string
}
const CreateTemplateMessageService = ({ msg, hora }: Request): { body: string } => {

  const nome = msg.paciente_nome;
  const atendimentoData = msg.atendimento_data;
  const atendimentoHora = hora;

  const template = {
    body: `
Olá ${nome}. 😊,
Nós, da Diagnóstico Por Imagem, temos um importante lembrete pra você:
🗓 Seu atendimento de Densitometria na nossa clínica está agendado para o dia ${atendimentoData} às ${atendimentoHora}.

⏰ Gentileza comparecer às ${atendimentoHora} para efetuar o processo de atendimento na Recepção

⚠ Importante:
    - Paciente deverá apresentar pedido médico, carteira do convênio e documento de identificação com foto.
    - Trazer todos os exames anteriores realizados da área a ser examinada.

Podemos confirmar sua presença?

✅ Para confirmar, digite 1.
🚫 Para cancelar, 2.
🔁 Se quiser reagendar, digite 3
`,
  };

  return template;
};

export default CreateTemplateMessageService;
