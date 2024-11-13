/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis";
import { logger } from "../utils/logger"; // Supondo que você tenha um logger
const redisClient = new Redis({
  port: Number(process.env.IO_REDIS_PORT), // Redis port
  host: process.env.IO_REDIS_SERVER,
  db: Number(process.env.IO_REDIS_DB_SESSION) || 9,
  password: process.env.IO_REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 1000, 30000); // Aumentar o intervalo de reconexão até 30 segundos
    logger.warn(`Retrying Redis connection in ${delay / 1000} seconds...`);
    return delay;
  },
});

// Evento para capturar erros de conexão
redisClient.on("error", (error) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  if ((error as any).code === "ECONNRESET") {
    logger.error("Redis connection was reset:", error);
  } else {
    logger.error("Redis encountered an error:", error);
  }
});
// Evento para reconexão bem-sucedida
redisClient.on("connect", () => {
  logger.info("Connected to Redis successfully.");
});

// Evento para quando a conexão com o Redis é fechada
redisClient.on("close", () => {
  logger.warn("Redis connection closed.");
});

// Evento para quando o Redis estiver pronto para uso
redisClient.on("ready", () => {
  logger.info("Redis is ready for commands.");
});
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getValue = (key: string) => {
  return new Promise((resolve, reject) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    redisClient.get(key, (err, value): any => {
      if (err) return reject(err);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let data: any;
      if (value) {
        try {
          data = JSON.parse(value || "");
        } catch (error) {
          data = String(value);
        }
      } else {
        data = value;
      }
      return resolve(data);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const setValue = (key: string, value: any) => {
  return new Promise((resolve, reject) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let stringfy: any;
    if (typeof value === "object") {
      stringfy = JSON.stringify(value);
    } else {
      stringfy = String(value);
    }
    redisClient.set(key, stringfy, (err) => {
      if (err) return reject(err);
      return resolve(stringfy);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const removeValue = (key: string) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err) => {
      if (err) return reject(err);
      return resolve(true);
    });
  });
};
