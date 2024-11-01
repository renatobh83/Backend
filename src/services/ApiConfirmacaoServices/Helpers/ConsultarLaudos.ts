import { doGetLaudo } from "../../../helpers/SEMNOME";

interface ConsultarLaudosProps {
  tenantId: number;
  cdExame: number;
  cdPaciente: number;
  cdFuncionario: number;
  entrega: boolean;
}
export const ConsultarLaudos = async ({
  tenantId,
  cdExame,
  cdPaciente,
  cdFuncionario,
  entrega,
}: ConsultarLaudosProps) => {
  const data = await doGetLaudo({
    tenantId,
    cdExame,
    cdPaciente,
    cdFuncionario,
    entrega,
  });
  return data;
};
