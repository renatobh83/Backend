import socketEmit from "../../helpers/socketEmit";
import Contact from "../../models/Contact";

interface ExtraInfo {
  id?: number;
  name: string;
  value: string;
  contactId?: number;
  contact?: Contact;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: [];
  tenantId: number;
  pushname: string;
  isUser: boolean;
  isWAContact: boolean;
  telegramId?: string ;
  instagramPK?: number ;
  messengerId?: string ;
  origem?: string;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  tenantId,
  pushname,
  isUser,
  isWAContact,
  email = "",
  telegramId,
  instagramPK,
  messengerId,

  origem = "whatsapp"
}: Request): Promise<Contact> => {
  const number = isGroup
    ? String(rawNumber)
    : String(rawNumber).replace(/[^0-9]/g, "");

  let contact: Contact | null = null;

  if (origem === "whatsapp") {
    contact = await Contact.findOne({ where: { number, tenantId } });
  }

  if (origem === "telegram" && telegramId) {
    contact = await Contact.findOne({ where: { telegramId, tenantId } });
  }

  if (origem === "instagram" && instagramPK) {
    contact = await Contact.findOne({ where: { instagramPK, tenantId } });
  }

  if (origem === "messenger" && messengerId) {
    contact = await Contact.findOne({ where: { messengerId, tenantId } });
  }

  if (contact) {
    contact.update({
      profilePicUrl,
      pushname,
      isUser,
      isWAContact,
      telegramId,
      instagramPK,
      messengerId
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      pushname,
      isUser,
      isWAContact,
      tenantId,
      telegramId,
      instagramPK,
      messengerId
    });
  }

  socketEmit({
    tenantId,
    type: "contact:update",
    payload: contact
  });

  return contact;
};

export default CreateOrUpdateContactService;