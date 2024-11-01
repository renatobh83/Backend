import { doListaPlano } from "../../../helpers/SEMNOME";

interface ConsultarLaudosProps {
  tenantId: number;
}
export const ListarPlanos = async ({ tenantId }: ConsultarLaudosProps) => {
  const data = await doListaPlano(tenantId);
  return data;
};
