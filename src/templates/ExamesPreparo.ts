interface TemplateConsultaReturn {
  agendamentos: string;
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

export const TemplateExamesPreparo = ({
  listaAgendamentos,
}: TemplateProps): TemplateConsultaReturn => {
  let message =
    "Para consultar o preparo, escolha uma das opções abaixo, informando o número correspondente:\n\n";
  listaAgendamentos.forEach((item, index) => {
    message += `${index + 1}. Data do Exame: ${item.dt_data}\n`;
    message += `Exame de : ${item.ds_modalidade}\n\n`;
  });

  // // Adicionando as opções com os índices dos atendimentos

  // message += "Para consultar preparo do exame, digite 6.\n";
  // message += "Para retornar o menu de opções, digite 7.\n";
  // message += "Para encerar o atendimento, digite 8.\n";
  const agendamentos = message;

  return {
    agendamentos,
  };
};
