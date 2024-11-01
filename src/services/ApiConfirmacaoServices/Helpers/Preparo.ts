import { getPreparo } from "../../ChatFlowServices/Helpers/ActionsApi";

interface ConsultarLaudosProps {
  tenantId: number;
  procedimento: number;
}
export const ListarPlanos = async ({
  procedimento,
  tenantId,
}: ConsultarLaudosProps) => {
  const data = await getPreparo(procedimento, tenantId);
  return data;
};
