// src/shared/utils/logger.ts
import fs from "fs";
import path from "path";
import { getMessage } from "@/shared/lang";

const LOG_DIR = process.env.LOG_PATH || path.resolve(process.cwd(), "logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

type LogLevel = "info" | "warn" | "error";

export interface LogRequestMeta {
  method?: string;
  url?: string;
  ip?: string;
}

class Logger {
  private module: string;
  private lang: string;

  constructor(module: string, lang: string = "id") {
    this.module = module.toUpperCase();
    this.lang = lang;
  }

  setLang(lang: string) {
    this.lang = lang;
  }

  private getFilePath(): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(LOG_DIR, `${this.module}-${date}.log`);
  }

  private resolveMessage(message: string): string {
    if (message.startsWith("api.")) {
      return getMessage(this.lang, message);
    }
    return message;
  }

  private write(
    level: LogLevel,
    message: string,
    meta?: any,
    req?: LogRequestMeta
  ) {
    const timestamp = new Date().toISOString();
    const resolvedMessage = this.resolveMessage(message);

    let reqInfo = "";
    if (req) {
      reqInfo = `[${req.method ?? "-"}: ${req.url ?? "-"}] [${req.ip ?? "-"}] `;
    }

    let log = `[${timestamp}] ${reqInfo}[${level.toUpperCase()}] [${this.module}] ${resolvedMessage}`;

    if (meta) {
      log += ` | ${JSON.stringify(meta)}`;
    }

    log += "\n";
    fs.appendFileSync(this.getFilePath(), log);
  }

  info(message: string, meta?: any, req?: LogRequestMeta) {
    this.write("info", message, meta, req);
  }

  warn(message: string, meta?: any, req?: LogRequestMeta) {
    this.write("warn", message, meta, req);
  }

  error(message: unknown, meta?: any, req?: LogRequestMeta) {
    const msg =
      message instanceof Error ? message.message : String(message);
    this.write("error", msg, meta, req);
  }
}

export const Loggers = {
  user: new Logger("USER"),
  role: new Logger("ROLE"),
  permission: new Logger("PERMISSION"),
  test: new Logger("TEST"),
  example: new Logger("EXAMPLE"),
  product: new Logger("PRODUCT"),
  auth: new Logger("AUTH"),
  general: new Logger("GENERAL"),
  division: new Logger("DIVISION"),
  department: new Logger("DEPARTMENT"),
  position: new Logger("POSITION"),
  feature: new Logger("FEATURE"),
  approval: new Logger("APPROVAL"),
  status: new Logger("STATUS"),
};
