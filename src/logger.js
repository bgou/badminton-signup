import winston from "winston";
import { format } from "winston";

const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

export const getLogger = (lab = "Badminton") =>
  winston.createLogger({
    level: "info",
    format: combine(label({ label: lab }), timestamp(), myFormat),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "application.log" })
    ]
  });

export default getLogger;
