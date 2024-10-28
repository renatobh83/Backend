import { readFileSync } from "fs";

import expressInstance, { Request, Response, NextFunction } from "express";

import moment from "moment-timezone";

import routes from "../routes";
import uploadConfig from "../config/upload";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

export default async function modules(app: any): Promise<void> {
  const { version } = JSON.parse(readFileSync("./package.json").toString());
  const started = new Date(); //.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
  const { env } = process;

  // const formattedDate = format(started, 'dd.MM.yyyy');

  app.get("/health", async (req: Request, res: Response) => {
    let checkConnection: string;
    try {
      checkConnection = "Servidor disponível!";
    } catch (e) {
      checkConnection = `Servidor indisponível! ${e}`;
    }
    res.json({
      started: moment(started)
        .tz("America/Sao_Paulo")
        .format("DD/MM/YYYY HH:mm:ss"),
      currentVersion: version,
      uptime: (Date.now() - Number(started)) / 1000,
      statusService: checkConnection,
    });
  });

  app.use("/public", expressInstance.static(uploadConfig.directory));

  app.use(routes);

  // error handle
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
    if (err instanceof AppError) {
      if (err.statusCode === 403) {
        logger.warn(err);
      } else {
        logger.error(err);
      }
      return res.status(err.statusCode).json({ error: err.message });
    }

    logger.error(err);
    return res.status(500).json({ error: `Internal server error: ${err}` });
  });

  logger.info("modules routes already in server!");
}
