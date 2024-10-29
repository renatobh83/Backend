import { doGetLaudo, doListaPlano } from "../../../helpers/SEMNOME";

interface AxiosInstance {
  baseURl: string;
  token: string;
}
interface ConsultarLaudosProps {
  api: AxiosInstance;
}
export const ListarPlanos = async ({ api }: ConsultarLaudosProps) => {
  const data = await doListaPlano(api);
  return data;
};
