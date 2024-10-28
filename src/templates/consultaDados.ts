interface TemplateConsultaReturn {
  registroEncontrado: string;
  variosRegistro: string;
  nenhumRegistroLocalizado: string;
}
interface TemplateProps {
  nome: string;
}

export const TemplateConsulta = ({
  nome,
}: TemplateProps): TemplateConsultaReturn => {
  const registroEncontrado = `
Olá ${nome}! Estamos felizes em tê-lo conosco e prontos para atender suas necessidades.
Temos diversos serviços disponíveis:
Para consultar agendamentos futuros, digite 1.
Para pegar um laudo, digite 2.
Para fazer um novo agendamento, digite 3.
Sinta-se à vontade para explorar e nos avisar como podemos ajudar!
`;
  const variosRegistro = `Olá! ${nome} Infelizmente, não conseguimos localizar os dados.
Por favor, informe o número do seu CPF para uma nova consulta.
Se preferir, digite "sair" para ser atendido anonimamente.
Agradecemos pela sua compreensão!`;

  const nenhumRegistroLocalizado = `Olá! ${nome} Infelizmente, não conseguimos localizar os dados.
Por favor, informe o número do seu CPF para uma nova consulta.
Se preferir, digite "sair" para ser atendido anonimamente.
Agradecemos pela sua compreensão!`;

  return {
    registroEncontrado,
    variosRegistro,
    nenhumRegistroLocalizado,
  };
};
