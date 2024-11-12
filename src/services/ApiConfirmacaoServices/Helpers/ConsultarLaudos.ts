import { consultaLaudo, doGetLaudo } from "../../../helpers/SEMNOME";
interface ConsultarLaudosNovo {
  tenantId: number;
  cdExame: number;
}
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
export const ConsultarLaudosNovo = async ({
  tenantId,
  cdExame,
}: ConsultarLaudosNovo) => {
  const data = await consultaLaudo(tenantId, cdExame);

  return data;
};
