import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import ApiConfirmacao from "../../models/ApiConfirmacao";

interface Data {
  nomeApi: string;
  tenantId?: string | number;
}

const ShowApiListServiceName = async ({
  nomeApi,
  tenantId,
}: Data): Promise<ApiConfirmacao> => {
  const attr = ["action", "token", "token2", "baseURl"];

  const api = await ApiConfirmacao.findOne({
    where: { nomeApi, tenantId },
    attributes: attr,
  });

  // ApiConfirmacao {
  //   dataValues: {
  //     id: 19,
  //     token: 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyAiZXhwIiA6IDE3Mjk4NjAyNDIsICJucl92ZXJzYW8iIDogMzA3ODQsICJjZF9ncnVwbyIgOiAxLCAiY2RfbWF0cml6IiA6IDEsICJucl9lbXByZXNhIiA6IDc3LCAibnJfZnVuY2lvbmFyaW8iIDogMCwgImNkX2VtcHJlc2EiIDogMSwgImNkX3VzdWFyaW8iIDogMSwgImRzX3VzdWFyaW8iIDogIlJPT1QiLCAiY2RfZnVuY2lvbmFyaW8iIDogMSwgImNkX21lZGljbyIgOiAwLCAiY2Rfc2Vzc2FvIiA6IDAsICJjZF9hdGVuZGltZW50byIgOiAwLCAiY2RfZXhhbWUiIDogMCB9.WF3bV7BcceJiuQlUL3-fluYkj0Sv0GBF4Lc8wENVrmA',
  //     status: 'CONECTADA',
  //     token2: null,
  //     usuario: 'root',
  //     tenantId: 1,
  //     senha: '1',
  //     action: [ 'consulta', 'agendamento', 'laudo', 'preparo' ],
  //     nomeApi: 'API GENESIS',
  //     expDate: 2024-10-25T12:44:02.000Z,
  //     createdAt: 2024-10-24T15:35:38.983Z,
  //     updatedAt: 2024-10-25T10:40:43.832Z
  //   }

  if (!api) {
    throw new AppError("ERR_NO_API_FOUND", 404);
  }

  return api;
};

export default ShowApiListServiceName;
