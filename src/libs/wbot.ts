/* eslint-disable camelcase */
import { Client, LocalAuth, DefaultOptions } from "whatsapp-web.js";
import path from "node:path";
import { rm } from "node:fs/promises";
import { getIO } from "./socket";
import type Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import SyncUnreadMessagesWbot from "../services/WbotServices/SyncUnreadMessagesWbot";
import AppError from "../errors/AppError";

interface Session extends Client {
  id: number;
  requestPairingCode(phoneNumber: string): Promise<string>;
}

const sessions: Session[] = [];

const minimal_args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-gpu",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];

export const apagarPastaSessao = async (id: number | string): Promise<void> => {
  const pathRoot = path.resolve(__dirname, "..", "..", ".wwebjs_auth");
  const pathSession = `${pathRoot}/session-wbot-${id}`;

  try {
    await rm(pathSession, { recursive: true, force: true });
  } catch (error) {
    logger.info(`apagarPastaSessao:: ${pathSession}`);
    logger.error(error);
  }
};

// export const removeWbot = (whatsappId: number): void => {
//   try {
//     const sessionIndex = sessions.findIndex((s) => s.id === whatsappId);
//     if (sessionIndex !== -1) {
//       sessions[sessionIndex].destroy();
//       sessions.splice(sessionIndex, 1);
//     }
//   } catch (err) {
//     logger.error(`removeWbot | Error: ${err}`);
//   }
// };
export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex((s) => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      if (sessions[sessionIndex].pupBrowser) {
        sessions[sessionIndex].pupBrowser.close(); // Fecha o navegador Puppeteer
      }
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`);
  }
};

const args: string[] = process.env.CHROME_ARGS
  ? process.env.CHROME_ARGS.split(",")
  : minimal_args;

args.unshift(`--user-agent=${DefaultOptions.userAgent}`);

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;
      const { tenantId } = whatsapp;
      const wbot = new Client({
        authStrategy: new LocalAuth({ clientId: `wbot-${whatsapp.id}` }),
        takeoverOnConflict: true,
        puppeteer: {
          headless: true,
          executablePath: process.env.CHROME_BIN || undefined,
          args,
        },
        webVersion: process.env.WEB_VERSION || "2.2409.2",
        webVersionCache: {
          type: "remote",
          remotePath:
            "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/{version}.html",
        },
        qrMaxRetries: 2,
      }) as Session;

      wbot.id = whatsapp.id;

      wbot.initialize();
      let pairingCodeRequested = false;

      wbot.on("qr", async (qr) => {
        if (whatsapp.pairingCodeEnabled && !pairingCodeRequested) {
          const pairingCode = await wbot.requestPairingCode(whatsapp.wppUser); // enter the target phone number
          await whatsapp.update({
            pairingCode: pairingCode,
            status: "qrcode",
            retries: 0,
          });
          pairingCodeRequested = true;
        }
        // qrGen.generate(qr,  {small: true})
        if (whatsapp.status === "CONNECTED") return;
        logger.info(
          `Session QR CODE: ${sessionName}-ID: ${whatsapp.id}-${whatsapp.status}`
        );

        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });
        const sessionIndex = sessions.findIndex((s) => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp,
        });
      });

      wbot.on("authenticated", async () => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
      });

      wbot.on("auth_failure", async (msg) => {
        logger.error(
          `Session: ${sessionName}-AUTHENTICATION FAILURE :: ${msg}`
        );
        if (whatsapp.retries > 1) {
          await whatsapp.update({
            retries: 0,
            session: "",
          });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1,
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp,
        });
        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        logger.info(`Session: ${sessionName}-READY`);

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const info: any = wbot?.info;
        const wbotVersion = await wbot.getWWebVersion();
        const wbotBrowser = await wbot.pupBrowser?.version();
        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot?.info?.wid?.user, // || wbot?.info?.me?.user,
          phone: {
            ...(info || {}),
            wbotVersion,
            wbotBrowser,
          },
          session: sessionName,
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp,
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "readySession",
          session: whatsapp,
        });

        const sessionIndex = sessions.findIndex((s) => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        wbot.sendPresenceAvailable();
        SyncUnreadMessagesWbot(wbot, tenantId);
        resolve(wbot);
      });
    } catch (err) {
      logger.error(`initWbot error | Error: ${err}`);
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex((s) => s.id === Number(whatsappId));
  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }

  return sessions[sessionIndex];
};
