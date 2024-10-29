interface TemplateConsultaReturn {
  confirmacao: string;
  erroConfirmacao: string;
}

export const TemplateConfirmaAgendamento = (): TemplateConsultaReturn => {
  let message = "Exame(s) confirmado com sucesso.";
  message += "Para retornar o menu de opções, digite 2.\n";
  message += "Para encerar o atendimento, digite 3.\n";
  const confirmacao = message;
  const erroConfirmacao = `Infelizamente não conseguimos confirmar o exame selecionado.
    Se precisar favor entrar em contato com a nossa central, estamos à disposição.
    Para retornar o menu de opções, digite 2.\n
    Para encerar o atendimento, digite 3.\n `;
  return {
    confirmacao,
    erroConfirmacao,
  };
};
