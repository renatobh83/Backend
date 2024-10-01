import { Op, Sequelize } from "sequelize";
import Confirmacao from "../../models/Confirmacao"
import VerifyContact from "../WbotServices/helpers/VerifyContact";



const UpdateExamesConfirmados = async ({
    data, wbot
}) =>{
    const idNumber = await wbot.getNumberId(data.body.contato);
    const msgContact = await wbot.getContactById(idNumber._serialized);
    const contact = await VerifyContact(msgContact, data.tenantId);
      await Confirmacao.update({
        procedimentos: Sequelize.literal(
          `procedimentos || '${data.body.notificacao.cd_procedimento}'`
        ),
        atendimentoHora: Sequelize.fn('LEAST', Sequelize.col('atendimentoHora'),  data.body.notificacao.atendimento_hora),
        idexterno: Sequelize.literal(`
          CASE
            WHEN NOT EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(idexterno) AS elem
              WHERE elem::int = ANY(ARRAY[${data.body.idExterno}]::int[])
            )
            THEN idexterno || '${JSON.stringify(data.body.idExterno)}'
            ELSE idexterno
          END
        `)
      },{
        where:    {
            contactId: contact.id,
            atendimentoData: data.body.notificacao.atendimento_data,
            answered: false,
            closedAt: null,
            [Op.and]: [
              Sequelize.where(
                Sequelize.literal(`"idexterno"`),
                '@>',
                JSON.stringify([data.body.idExterno])
              )
            ]
          }
      })

}





export default UpdateExamesConfirmados