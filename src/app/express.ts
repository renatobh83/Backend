import "reflect-metadata";
import "express-async-errors";
import "./config-env";
import { type Application, json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { logger } from "../utils/logger";

export default async function express(app: Application) {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  if (process.env.NODE_ENV !== "dev") {
    app.use(helmet());
    // Sets all of the defaults, but overrides script-src
    // app.use(
    //   helmet.contentSecurityPolicy({
    //     directives: {
    //       "default-src": ["'self'"],
    //       "base-uri": ["'self'"],
    //       "block-all-mixed-content": [],
    //       "font-src": ["'self'", "https:", "data:"],
    //       "img-src": ["'self'", "data:"],
    //       "object-src": ["'none'"],
    //       "script-src-attr": ["'none'"],
    //       "style-src": ["'self'", "https:", "'unsafe-inline'"],
    //       "upgrade-insecure-requests": [],
    //       // ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    //       scriptSrc: [
    //         "'self'",
    //         `*${process.env.FRONTEND_URL || "localhost: 3101"}`
    //         // "localhost"
    //       ],
    //       frameAncestors: [
    //         "'self'",
    //         `* ${process.env.FRONTEND_URL || "localhost: 3101"}`
    //       ]
    //     }
    //   })
    // );
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: { policy: "credentialless" },
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any)
    );
  }
  console.info("cors domain ======>>>>", process.env.FRONTEND_URL);
  app.use(cookieParser());
  app.use(json({ limit: "50MB" }));

  app.use(
    urlencoded({ extended: true, limit: "50MB", parameterLimit: 200000 })
  );

  logger.info("express already in server!");
}
