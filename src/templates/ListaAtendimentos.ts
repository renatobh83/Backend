interface TemplateConsultaReturn {
  atendimentosRecentes: string;
  // variosRegistro: string;
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
    "Prezado, segue a relação de atendimentos recentes que o laudo já está liberado. Por favor, escolha uma das opções abaixo, informando o número correspondente:\n\n";
  listaAtendimentos.forEach((item, index) => {
    message += `${index + 1}. Data do Exame: ${item.dt_data}\n`;
    message += `   Descrição do Exame: ${item.ds_procedimento}\n\n`;
  });

  // Adicionando as opções com os índices dos atendimentos
  message +=
    "Caso deseja um laudo de outro periodo favor entrar em contato com nossa central para fazer a sua solicitação.\n";
  message += "Para retornar o menu de opções, digite 2.\n";
  message += "Para encerar o atendimento, digite 3.\n";
  const atendimentosRecentes = message;
  // const variosRegistro = `Olá! ${nome} Infelizmente, não conseguimos localizar os dados.
  //  Se desejar, podemos iniciar um atendimento.
  //  Por favor, informe o número do seu CPF para uma nova consulta.
  //  Se preferir, digite "sair" para ser atendido anonimamente.
  //  Agradecemos pela sua compreensão!`;

  // const nenhumRegistroLocalizado = `Olá! ${nome} Infelizmente, não conseguimos localizar os dados.
  //  Se desejar, podemos iniciar um atendimento.
  //  Por favor, informe o número do seu CPF para uma nova consulta.
  //  Se preferir, digite "sair" para ser atendido anonimamente.
  //  Agradecemos pela sua compreensão!`;

  return {
    atendimentosRecentes,
    //   variosRegistro,
    //   nenhumRegistroLocalizado,
  };
};
