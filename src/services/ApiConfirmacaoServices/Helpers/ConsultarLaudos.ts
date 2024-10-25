import { doGetLaudo } from "../../../helpers/SEMNOME";

interface AxiosInstance {
  baseURl: string;
  token: string;
}
interface ConsultarLaudosProps {
  api: AxiosInstance;
  cdExame: number;
  cdPaciente: number;
  cdFuncionario: number;
  entrega: boolean;
}
export const ConsultarLaudos = async ({
  api,
  cdExame,
  cdPaciente,
  cdFuncionario,
  entrega,
}: ConsultarLaudosProps) => {
  const data = await doGetLaudo({
    api,
    cdExame,
    cdPaciente,
    cdFuncionario,
    entrega,
  });
  return data;
};
