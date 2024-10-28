const fs = require("fs");
const path = require("path");
import { createApiInstance, createApiInstanceJTW } from "../utils/ApiWebhook";

// export async function confirmarAtendimentos(
//   atendimentos,
//   instanceApi: ApiConfirma
// ) {
//   try {
//     // Mapeia cada atendimento para uma promessa
//     const promessas = atendimentos.map(async (atendimento) => {
//       const response = await instanceApi.confirmaExame(atendimento);
//       return response;
//     });

//     // Aguarda todas as promessas serem resolvidas
//     const responses = await Promise.allSettled(promessas);

//     // Verifica se todos os status são 200
//     const todosSucesso = responses.every(
//       (response) => response.status === "fulfilled"
//     );

//     if (todosSucesso) {
//       // A FAZER
//       // - ENVIAR MENSAGEM DE EXAME CONFIRMADO
//       console.log("Todos os atendimentos foram confirmados com sucesso.");
//       //await getPreparos(data.procedimentos)
//       return true;
//       // biome-ignore lint/style/noUselessElse: <explanation>
//     } else {
//       console.log("Nem todos os atendimentos foram confirmados com sucesso.");
//       return false;
//     }
//   } catch (error) {
//     console.error(
//       "Ocorreu um erro durante a confirmação dos atendimentos:",
//       error
//     );
//   }
// }

// export async function getPreparos(
//   procedimentos: number[],
//   instanceApi: ApiConfirma
// ) {

//   const promessas = procedimentos.map(async (procedimento) => {
//     const response = await instanceApi.doGetPreparo(procedimento);
//     return response;
//   });
//   const responses = await Promise.all(promessas);
// }
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
export async function consultaPaciente({ api, params }: ConsultaPacienteProps) {
  try {
    if (!api.baseURl) {
      throw new Error("Url não cadatrada para a api");
    }
    if (!params.NomePaciente) {
      return "Nao tem parametro para pesquisa";
    }
    const apiInstance = createApiInstance(api);
    const url = "/clinuxintegra/consultapacientes";
    const URL_FINAL = `${api.baseURl}${url}`;

    const consultaDados = {
      NomePaciente: params.NomePaciente,
      ...(params.CPF && { CPF: params.CPF }), // Inclui o CPF somente se ele estiver presente em `params`
    };
    const { data } = await apiInstance.post(URL_FINAL, consultaDados);
    console.log(data);
    return data;
  } catch (error) {
    throw new Error("Url não cadatrada para a api");
  }
}

interface InstanceAxiosJTW {
  baseURl: string;
  token: string;
}

interface ConsultaLaudoProps {
  api: InstanceAxiosJTW;
  cdExame: number;
  cdPaciente: number;
  cdFuncionario: number;
  entrega: boolean;
}
export async function doGetLaudo({
  api,
  cdExame,
  cdPaciente,
  cdFuncionario,
  entrega,
}: ConsultaLaudoProps) {
  const apiInstance = createApiInstanceJTW(api);
  const url = `/doLaudoDownload?cd_exame=${cdExame}&cd_paciente=${cdPaciente}&cd_funcuionario=${cdFuncionario}&sn_entrega=${entrega}`;
  const URL_FINAL = `${api.baseURl}${url}`;
  try {
    const response = await apiInstance.post(
      URL_FINAL,
      {},
      {
        headers: {
          Accept: "application/pdf",
        },
        responseType: "stream",
      }
    );

    const filePath = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      `${cdExame}.pdf`
    );

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return true;
  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
}

interface doListaAtendimentoProps {
  api: InstanceAxiosJTW;
  codigoPaciente: number;
}

export async function doListaAtendimentos({
  api,
  codigoPaciente,
}: doListaAtendimentoProps) {
  const apiInstance = createApiInstanceJTW(api);

  const url = `/doListaAtendimento?cd_paciente=${codigoPaciente}`;
  const URL_FINAL = `${api.baseURl}${url}`;
  try {
    const { data } = await apiInstance.post(URL_FINAL, {});
    if (data.length) {
      return data
        .filter((i) => i.nr_laudo !== null)
        .filter((a) => a.sn_assinado === true)
        .sort((a, b) => {
          const dateA = new Date(a.dt_data.split("/").reverse().join("-"));
          const dateB = new Date(b.dt_data.split("/").reverse().join("-"));
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5); // Seleciona os 5 registros mais recentes
    }
  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
}
export async function doGetAgendamentos({ api, codPaciente }) {
  const apiInstance = createApiInstanceJTW(api);
  const url = `/doListaAgendamento?cd_paciente=${codPaciente}`;
  const URL_FINAL = `${api.baseURl}${url}`;
  try {
    const { data } = await apiInstance.post(URL_FINAL, {});
    //   console.log("Exame confirmado com sucesso", response.data);
    if (data.length) {
      return data
        .filter((i) => i.ds_status !== "CANCELADO")
        .sort((a, b) => {
          const dateA = new Date(a.dt_data.split("/").reverse().join("-"));
          const dateB = new Date(b.dt_data.split("/").reverse().join("-"));
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5); // Seleciona os 5 registros mais recentes
    }
  } catch (error) {
    console.error("Erro ao confirmar exame:", error);
    throw error;
  }
}
