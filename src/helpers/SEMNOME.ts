const fs = require("fs");
const path = require("path");
import {
  createApiSessionInstance,
  sessionApiDados,
} from "../services/ApiExternaService/StartApiSessionByName";

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
export interface StartSessionProps {
  nomeApi: string;
  tenantId: number;
}

interface ConsultaPacienteParams {
  NomePaciente: string;
  CPF?: string; // Campo opcional para incluir na consulta quando necessário
}
interface ConsultaPacienteProps {
  tenantId?: number;
  params: ConsultaPacienteParams;
}
export async function consultaPaciente({
  tenantId,
  params,
}: ConsultaPacienteProps) {
  try {
    const apiInstance = await createApiSessionInstance({
      nomeApi: "API GENESIS",
      tenantId: tenantId,
      jwt: false,
    });

    if (!sessionApiDados.baseURl) {
      throw new Error("Url não cadatrada para a api");
    }
    if (!params.NomePaciente) {
      return "Nao tem parametro para pesquisa";
    }

    const url = "/clinuxintegra/consultapacientes";
    const URL_FINAL = `${sessionApiDados.baseURl}${url}`;

    const consultaDados = {
      NomePaciente: params.NomePaciente,
      ...(params.CPF && { CPF: params.CPF }), // Inclui o CPF somente se ele estiver presente em `params`
    };
    const { data } = await apiInstance.post(URL_FINAL, consultaDados);
    if (data !== null) {
      return data;
    }
    return [];
  } catch (error) {
    throw new Error("Url não cadatrada para a api");
  }
}

interface InstanceAxiosJTW {
  baseURl: string;
  token: string;
}

interface ConsultaLaudoProps {
  tenantId: number;
  cdExame: number;
  cdPaciente: number;
  cdFuncionario: number;
  entrega: boolean;
}
export async function doGetLaudo({
  tenantId,
  cdExame,
  cdPaciente,
  cdFuncionario,
  entrega,
}: ConsultaLaudoProps) {
  const apiInstance = await createApiSessionInstance({
    nomeApi: "API GENESIS",
    tenantId,
    jwt: true,
  });

  const url = `/doLaudoDownload?cd_exame=${cdExame}&cd_paciente=${cdPaciente}&cd_funcuionario=${cdFuncionario}&sn_entrega=${entrega}`;
  const URL_FINAL = `${sessionApiDados.baseURl}${url}`;
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
  tenantId: number;
  codigoPaciente: number;
}

export async function doListaAtendimentos({
  tenantId,
  codigoPaciente,
}: doListaAtendimentoProps) {
  const apiInstance = await createApiSessionInstance({
    nomeApi: "API GENESIS",
    tenantId,
    jwt: true,
  });

  const url = `/doListaAtendimento?cd_paciente=${codigoPaciente}`;
  const URL_FINAL = `${sessionApiDados.baseURl}${url}`;
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
export async function doGetAgendamentos({ tenantId, codPaciente }) {
  const apiInstance = await createApiSessionInstance({
    nomeApi: "API GENESIS",
    tenantId,
    jwt: true,
  });

  const url = `/doListaAgendamento?cd_paciente=${codPaciente}`;
  const URL_FINAL = `${sessionApiDados.baseURl}${url}`;
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
    return [];
  } catch (error) {
    console.error("Erro ao confirmar exame:", error);
    throw error;
  }
}

export async function doListaPlano(tenantId: number) {
  const apiInstance = await createApiSessionInstance({
    nomeApi: "API GENESIS",
    tenantId,
    jwt: true,
  });
  const url = "/doListaPlano/";
  const URL_FINAL = `${sessionApiDados.baseURl}${url}`;
  try {
    const { data } = await apiInstance.post(URL_FINAL, {});
    return data;
  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
}
export async function confirmaExame(tenantId: number, atendimento: number) {
  const apiInstance = await createApiSessionInstance({
    nomeApi: "API GENESIS",
    tenantId,
    jwt: true,
  });
  const url = `/doAgendaConfirmar?cd_atendimento=${atendimento}`;
  const URL_FINAL = `${sessionApiDados.baseURl}${url}`;
  try {
    const { data } = await apiInstance.post(URL_FINAL, {});

    return data;
  } catch (error) {
    console.error("Erro ao confirmar exame:", error);
    throw error;
  }
}
export async function getPreparos({ procedimento, tenantId }) {
  const apiInstance = await createApiSessionInstance({
    nomeApi: "API GENESIS",
    tenantId,
    jwt: true,
  });
  const url = `/doProcedimentoPreparo?cd_procedimento=${procedimento}`;
  const URL_FINAL = `${sessionApiDados.baseURl}${url}`;
  try {
    const { data } = await apiInstance.post(URL_FINAL, {});
    const blob = data[0].bb_preparo;

    return blob;
  } catch (error) {
    console.error("Erro ao confirmar exame:", error);
    throw error;
  }
}
