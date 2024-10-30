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
  const registroEncontrado = `Olá ${nome}!
Estamos felizes em tê-lo conosco e prontos para atender suas necessidades.
Temos diversos serviços disponíveis:
Consultar agendamentos, digite 1.
Laudo, digite 2.
Para finalizar digite, Sair.
Sinta-se à vontade para explorar e nos avisar como podemos ajudar!
`;
  const nenhumRegistroLocalizado = `Olá, ${nome}!
Encontramos mais de um registro associado ao seu nome em nossa base.

Para uma pesquisa mais precisa, por favor, digite consulta.
Para encerar o atendimento, digite Sair.
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
