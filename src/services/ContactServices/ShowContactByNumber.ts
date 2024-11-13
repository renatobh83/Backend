import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

interface Request {
  number: string;
  tenantId: string | number;
}

const ShowContactByNumber = async ({
  number,
  tenantId,
}: Request): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: {
      number,
    },
    include: [
      "extraInfo",
      "tags",
      {
        association: "wallets",
        attributes: ["id", "name"],
      },
    ],
  });
  if (!contact || contact.tenantId !== tenantId) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contact;
};

export default ShowContactByNumber;
