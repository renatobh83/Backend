import { doGetLaudo, doListaPlano } from "../../../helpers/SEMNOME";
import { getPreparo } from "../../ChatFlowServices/Helpers/ActionsApi";

interface AxiosInstance {
  baseURl: string;
  token: string;
}
interface ConsultarLaudosProps {
  api: AxiosInstance;
  procedimentos: number[];
}
export const ListarPlanos = async ({
  procedimentos,
  api,
}: ConsultarLaudosProps) => {
  const data = await getPreparo(procedimentos, api);
  return data;
};
