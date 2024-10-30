import type { Message } from "whatsapp-web.js";
import SendMessageBlob from "../services/WbotServices/SendMessageBlob";

type Payload = {
  ticket: any;
  blob: string;
  userId: number;
};

const SendMessageBlobHtml = async ({
  ticket,
  blob,
  userId,
}: Payload): Promise<Message> => {
  // biome-ignore lint/style/useConst: <explanation>
  let message: Message;
  message = await SendMessageBlob({ base64Html: blob, ticket, userId });
  return message;
};

export default SendMessageBlobHtml;
