/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata";
import "express-async-errors";
import "./config-env";
import { createServer } from "http";
import { env } from "process";
import express from "express";
import GracefulShutdown from "http-graceful-shutdown";
import { initIO } from "../libs/socket";
import bootstrap from "./boot";
import { StartAllWhatsAppsSessions } from "../services/WbotServices/StartAllWhatsAppsSessions";


export default async function application() {
    const app: any = express();
    const httpServer: any = createServer(app);
    const port = app.get("port") || env.PORT || 3100;

    await bootstrap(app)

    async function start() {
        const host = app.get("host") || "0.0.0.0";
        app.server = httpServer.listen(port, host, async () => {
          console.info(`Web server listening at: http://${host}:${port}/`);
        });

        initIO(app.server);

        // needs to start after socket is available
        await StartAllWhatsAppsSessions();
        GracefulShutdown(app.server);
      }
      async function close() {
        return new Promise<void>((resolve, reject) => {
          httpServer.close((err: any) => {
            if (err) {
              reject(err);
            }

            resolve();
          });
        });
      }
      process.on("SIGTERM", close);

      app.start = start;
      app.close = close

    return app

}