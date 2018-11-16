import winston from "winston";
import { format } from "winston";
import moment from "moment-timezone";

const { combine, label, printf } = format;

const myFormat = printf(info => {
  return `${moment.tz("America/Los_Angeles").format()} [${info.label}] ${
    info.level
  }: ${info.message}`;
});

export const getLogger = (lab = "Badminton") =>
  winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: combine(label({ label: lab }), myFormat),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "log/application.log" })
    ]
  });

export default getLogger;
