import type WAWebJS from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";
import { logger } from "../../../utils/logger";

export async function* HandleMsgReaction(reactionEvent: WAWebJS.Reaction) {
  yield new Promise((resolve) => setTimeout(resolve, 500));
  try {
    const messageToUpdate = await Message.findOne({
      where: { messageId: reactionEvent.msgId.id },
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "tenantId", "apiConfig"],
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"],
        },
      ],
    });
    if (messageToUpdate) {
      const { ticket } = messageToUpdate;

      if (reactionEvent.id.fromMe) {
        const updateData = { reactionFromMe: reactionEvent.reaction };
        yield messageToUpdate.update(updateData);

        socketEmit({
          tenantId: ticket.tenantId,
          type: "chat:update",
          payload: messageToUpdate,
        });
      }
      if (!reactionEvent.id.fromMe) {
        const updateData = { reaction: reactionEvent.reaction };
        yield messageToUpdate.update(updateData);
        socketEmit({
          tenantId: ticket.tenantId,
          type: "chat:update",
          payload: messageToUpdate,
        });
      }
    }
  } catch (error) {
    logger.error(error);
  }
}
