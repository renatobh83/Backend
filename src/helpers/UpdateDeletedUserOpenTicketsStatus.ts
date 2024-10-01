// import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

const UpdateDeletedUserOpenTicketsStatus = async (
  tickets: Ticket[],
  tenantId: number,
  userIdRequest: number
): Promise<void> => {
  tickets.forEach(async t => {
    const ticketId = t.id

    await UpdateTicketService({
      ticketData: { status: "pending", tenantId },
      ticketId,
      userIdRequest
    });

    // const io = getIO();
    // if (ticket.status !== oldStatus) {
    //   io.to(`${tenantId}-${oldStatus}`).emit(`${tenantId}-ticket`, {
    //     action: "delete",
    //     ticketId: ticket.id
    //   });
    // }

    // io.to(`${tenantId}-${ticket.status}`)
    //   .to(`${tenantId}-${ticketId}`)
    //   .emit(`${tenantId}-ticket`, {
    //     action: "updateStatus",
    //     ticket
    //   });
  });
};

export default UpdateDeletedUserOpenTicketsStatus;
