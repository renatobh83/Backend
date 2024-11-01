import axios, { type AxiosInstance } from "axios";
import AppError from "../../errors/AppError";
import ApiConfirmacao from "../../models/ApiConfirmacao";
import { logger } from "../../utils/logger";

interface ApiConfig {
  nomeApi: string;
  tenantId: number;
  jwt: boolean;
}
export let sessionApiDados: ApiConfirmacao | null = null;
export const createApiSessionInstance = async ({
  nomeApi,
  tenantId,
  jwt = true,
}: ApiConfig): Promise<AxiosInstance> => {
  const dadosApi = await ApiConfirmacao.findOne({
    where: { nomeApi, tenantId },
  });

  if (!dadosApi) {
    throw new AppError("ERR_NO_API_FOUND", 404);
  }
  sessionApiDados = dadosApi;
  const { usuario, senha, baseURl, token, expDate, token2 } = dadosApi;

  // Check if token is valid, otherwise generate a new one
  let currentToken = token;
  if (!token || new Date() >= new Date(expDate)) {
    try {
      const response = await axios.get(
        `${baseURl}/doFuncionarioLogin?id=${usuario}&pw=${senha}`
      );
      currentToken = response.data[0].ds_token;

      // Update the database with the new token and expiration date
      dadosApi.token = currentToken;
      dadosApi.status = "CONECTADA";
      dadosApi.expDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiry as needed
      await dadosApi.save();
    } catch (error) {
      logger.error(`Erro ao conectar com a API | Error: ${error.message}`);
      throw new AppError("ERR_USER_NOT_FOUND", 404);
    }
  }

  // Create Axios instance based on the token type
  const authorizationHeader = jwt ? `Bearer ${currentToken}` : token2;

  return axios.create({
    baseURL: baseURl,
    headers: {
      Authorization: authorizationHeader,
      "Content-Type": "application/json",
    },
  });
};
