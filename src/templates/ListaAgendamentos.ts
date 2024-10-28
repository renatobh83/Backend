interface TemplateConsultaReturn {
  agendamentos: string;
  semAgendamento: string;
}

export interface ResponseListaAgendamentos {
  cd_atendimento: number;
  ds_status: string;
  cd_paciente: number;
  ds_paciente: string;
  ds_paciente_social: null;
  dt_data: string;
  dt_hora_chegada: string;
  dt_hora: string;
  ds_empresa: string;
  cd_procedimento: string;
  cd_modalidade: number;
  ds_modalidade: string;
}
interface TemplateProps {
  listaAgendamentos: ResponseListaAgendamentos[];
}

export const TemplateListaAgendamentos = ({
  listaAgendamentos,
}: TemplateProps): TemplateConsultaReturn => {
  let message =
    "Prezado, segue a relação dos proximos 5 agendamentos futuro. Para confirmar um agendamento por favor, escolha uma das opções abaixo, informando o número correspondente:\n\n";
  listaAgendamentos.forEach((item, index) => {
    message += `${index + 1}. Data do Exame: ${item.dt_data}\n`;
    message += `   Horáro : ${item.dt_hora}\n`;
    message += `   Exame de : ${item.ds_modalidade}\n\n`;
  });

  // Adicionando as opções com os índices dos atendimentos

  message += "Para consultar preparo do exame, digite 6.\n";
  message += "Para retornar o menu de opções, digite 6.\n";
  message += "Para encerar o atendimento, digite 7.\n";
  const agendamentos = message;
  const semAgendamento =
    "Olá! Gostaríamos de informá-lo que, no momento, você não tem nenhum agendamento marcado conosco. Se precisar de ajuda para marcar um horário ou tiver outras dúvidas, estamos à disposição. Aguardamos o seu contato!";
  return {
    agendamentos,
    semAgendamento,
  };
};