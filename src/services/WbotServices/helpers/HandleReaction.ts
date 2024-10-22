import type WAWebJS from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";

export const HandleMsgReaction = async (msg: WAWebJS.Reaction) => {
  const messageToUpdate = await Message.findOne({
    where: { messageId: msg.msgId.id },
  });
  //   if (messageToUpdate) {
  //     await messageToUpdate.update({ msg });
  //     const { ticket } = messageToUpdate;
  //     socketEmit({
  //       tenantId: ticket.tenantId,
  //       type: "chat:ack",
  //       payload: messageToUpdate,
  //     });
  //   }
};
