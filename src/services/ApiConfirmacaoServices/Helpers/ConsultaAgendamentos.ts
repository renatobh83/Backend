import { doGetAgendamentos } from "../../../helpers/SEMNOME";

interface AxiosInstance {
  baseURl: string;
  token: string;
}
interface ConsultarAgendamentosProps {
  api: AxiosInstance;

  codPaciente: number;
}
export const ConsultarAgendamentos = async ({
  api,

  codPaciente,
}: ConsultarAgendamentosProps) => {
  const data = await doGetAgendamentos({
    api,
    codPaciente,
  });
  return data;
};
