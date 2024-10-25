import { consultaPaciente } from "../../../helpers/SEMNOME";
interface InstanceAxios {
  baseURl: string;
  token2: string;
}
interface ConsultaPacienteParams {
  NomePaciente: string;
  CPF?: string; // Campo opcional para incluir na consulta quando necessário
}
interface ConsultaPacienteProps {
  api: InstanceAxios;
  params: ConsultaPacienteParams;
}

export const ConsultaPaciente = async ({
  api,
  params,
}: ConsultaPacienteProps) => {
  try {
    const data = await consultaPaciente({ api, params });

    return data;
  } catch (error) {
    // // Responder com o status de erro e a mensagem apropriada
    // if (error instanceof AppError) {
    //   return res.status(error.statusCode).json({ message: error.message });
    //   throw new AppError(error)
    // }
    // return res.status(500).json({ message: error });
  }
};
