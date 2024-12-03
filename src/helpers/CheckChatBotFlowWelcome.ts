import Contact from "../models/Contact";
import type Ticket from "../models/Ticket";
import Setting from "../models/Setting";
import ChatFlow from "../models/ChatFlow";
import CreateLogTicketService from "../services/TicketServices/CreateLogTicketService";
import IsContactTest from "../services/ChatFlowServices/IsContactTest";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";

const CheckChatBotFlowWelcome = async (instance: Ticket): Promise<void> => {
  if (instance.userId || instance.isGroup) return;

  const setting = await Setting.findOne({
    where: {
      key: "botTicketActive",
      tenantId: instance.tenantId
    }
  });

  const channel = await ShowWhatsAppService({
    id: instance.whatsappId,
    tenantId: instance.tenantId
  });

  const chatFlowId = channel?.chatFlowId || setting?.value;

  if (!chatFlowId) return;

  const chatFlow = await ChatFlow.findOne({
    where: {
      id: +chatFlowId,
      tenantId: instance.tenantId,
      isActive: true,
      isDeleted: false
    }
  });

  if (!chatFlow) return;

  const contato = await Contact.findByPk(instance.contactId);
  const { celularTeste } = chatFlow;
  const celularContato = contato?.number;

  if (await IsContactTest(celularContato, celularTeste, instance.channel))
    return;

  // alteracao do conteudo da line de from para source
  const lineFlow = chatFlow.flow.lineList.find(
    (line: any) => line.source === "start"
  );



  await instance.update({
    chatFlowId: chatFlow.id,
    // alteracao do conteudo da line de to para target
    stepChatFlow: lineFlow.target,
    lastInteractionBot: new Date()
  });

  await CreateLogTicketService({
    ticketId: instance.id,
    type: "chatBot"
  });
};

export default CheckChatBotFlowWelcome;