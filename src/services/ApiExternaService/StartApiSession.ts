import axios from "axios";
import AppError from "../../errors/AppError";
import ApiConfirmacao from "../../models/ApiConfirmacao";
import { logger } from "../../utils/logger";

export const StartApiSession = async (api: ApiConfirmacao) => {
  const findApi = await ApiConfirmacao.findOne({
    where: { id: api.id, tenantId: api.tenantId },
  });
  if (!findApi) {
    throw new AppError("ERR_NO_API_FOUND", 404);
  }

  const usuario = findApi.usuario;
  const senha = findApi.senha;
  const link = "https://otrsweb.zapto.org/testeportal/cgi-bin/dwserver.cgi/se1";
  if (findApi.token) {
    const currentDate = new Date();
    const diffInMilliseconds = findApi.expDate - currentDate;

    if (diffInMilliseconds <= 0) {
      try {
        const response = await axios.get(
          `${link}/doFuncionarioLogin?id=${usuario}&pw=${senha}`
        );
        const token = response.data[0].ds_token;
        findApi.token = token;
        findApi.status = "CONECTADA";
        await findApi.save();
      } catch (error) {
        logger.error(`Erro ao conectar com a API | Error: ${error.message}`);
        throw error;
      }
      return "O token já expirou";
    }

    // Cálculo para obter os componentes de tempo restantes
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const seconds = diffInSeconds % 60;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const minutes = diffInMinutes % 60;

    const diffInHours = Math.floor(diffInMinutes / 60);
    const hours = diffInHours % 24;

    const days = Math.floor(diffInHours / 24);

    console.log(
      `${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`
    );

    return;
  }
  try {
    const response = await axios.get(
      `${link}/doFuncionarioLogin?id=${usuario}&pw=${senha}`
    );
    const token = response.data[0].ds_token;
    findApi.token = token;
    findApi.status = "CONECTADA";
    await findApi.save();
  } catch (error) {
    logger.error(`Erro ao conectar com a API | Error: ${error.message}`);
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }
};
