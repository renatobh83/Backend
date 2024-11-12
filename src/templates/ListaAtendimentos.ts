interface TemplateConsultaReturn {
  atendimentosRecentes: string;
  semAtendimentoComLaudo: string;
  // nenhumRegistroLocalizado: string;
}

interface Response {
  ds_medico: string;
  dt_data: string;
  ds_procedimento: string;
}
interface TemplateProps {
  listaAtendimentos: Response[];
}

export const TemplateListaAtendimentos = ({
  listaAtendimentos,
}: TemplateProps): TemplateConsultaReturn => {
  let message =
    "Prezado, segue a relação de atendimentos recentes que o laudo já está liberado.\n\n Por favor, escolha uma das opções abaixo, informando o número correspondente:\n\n";
  listaAtendimentos.forEach((item, index) => {
    message += `${index + 1}. Data do Exame: ${item.dt_data}\n`;
    message += `   Descrição do Exame: ${item.ds_procedimento}\n\n`;
  });

  // Adicionando as opções com os índices dos atendimentos
  message +=
    "Caso deseja um laudo de outro periodo favor entrar em contato com nossa central para fazer a sua solicitação.\n\n";
  message += "Para retornar o menu de opções, digite 6.\n";
  message += "Para encerar o atendimento, digite 7.\n";
  const atendimentosRecentes = message;
  const semAtendimentoComLaudo = `Infelizmente, não conseguimos localizar os dados nenhum exame recente com laudo liberado.
   Favor entrar em contato com a nossa central de atendimento para maiores informções.
   Agradecemos pela sua compreensão!`;

  // const nenhumRegistroLocalizado = `Olá! ${nome} Infelizmente, não conseguimos localizar os dados.
  //  Se desejar, podemos iniciar um atendimento.
  //  Por favor, informe o número do seu CPF para uma nova consulta.
  //  Se preferir, digite "sair" para ser atendido anonimamente.
  //  Agradecemos pela sua compreensão!`;

  return {
    atendimentosRecentes,
    semAtendimentoComLaudo,
    //   nenhumRegistroLocalizado,
  };
};
