interface TemplateConsultaReturn {
  registroEncontrado: string;
  nenhumRegistroLocalizado: string;
  buscaCpf: string;
}
interface TemplateProps {
  nome: string;
}

export const TemplateConsulta = ({
  nome,
}: TemplateProps): TemplateConsultaReturn => {
  const registroEncontrado = `Olá ${nome}!\n\n
Estamos felizes em tê-lo conosco e prontos para atender suas necessidades.\n
Favor escolher um dos nossos serviços:\n
Consultar agendamentos, digite 1.\n
Laudo, digite 2.\n
Para finalizar digite, Sair.\n
Sinta-se à vontade para explorar e nos avisar como podemos ajudar!
`;
  const nenhumRegistroLocalizado = `Olá, ${nome}!\n\n
Encontramos mais de um registro associado ao seu nome em nossa base.\n
Por favor, digite seu cpf (somente números).\n
Para encerar o atendimento, digite sair.
Agradecemos pela sua compreensão!`;
  const buscaCpf = `Não encontramos nenhum registro correspondente às informações fornecidas em nossa base de dados.
Por favor, verifique os dados e tente novamente.
Se o problema persistir, entre em contato com nossa central para assistência.`;
  return {
    registroEncontrado,
    nenhumRegistroLocalizado,
    buscaCpf,
  };
};
