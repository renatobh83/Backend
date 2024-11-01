import { doGetAgendamentos } from "../../../helpers/SEMNOME";

interface AxiosInstance {
  baseURl: string;
  token: string;
}
interface ConsultarAgendamentosProps {
  tenantId: number;
  codPaciente: number;
}
export const ConsultarAgendamentos = async ({
  tenantId,
  codPaciente,
}: ConsultarAgendamentosProps) => {
  const data = await doGetAgendamentos({
    tenantId,
    codPaciente,
  });
  return data;
};
