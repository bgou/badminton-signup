import { Worker } from "./Worker";
import getLogger from "./logger";
import moment from "moment-timezone";
import yargs from "yargs";

const logger = getLogger("App");
logger.info("Application starting");

const MAX_WORKERS = 10;
const PST = "America/Los_Angeles";
const workers = [];

const argv = yargs
  .option("force", {
    alias: "f",
    description: "Force run",
    type: "boolean"
  })
  .help()
  .alias("help", "h").argv;

const shouldRun = () => {
  if (argv.force) {
    logger.info("--force is specified, ignoring schedule interval");
    return true;
  }

  const now = moment.tz(PST);
  const startTime = moment
    .tz(PST)
    .day(2)
    .hour(16)
    .minute(55)
    .second(0);
  const endTime = moment
    .tz(PST)
    .day(2)
    .hour(17)
    .minute(5)
    .second(0);

  logger.debug(`Start: ${startTime.format()}`);
  logger.debug(`End: ${endTime.format()}`);

  if (now.diff(startTime, "second") > 0 && now.diff(endTime, "second") < 0) {
    return true;
  }

  logger.info(`${now.format()} is not around Tuesday 5pm PST. Skipping`);
  return false;
};

const runApp = async () => {
  while (true) {
    if (!shouldRun() && process.env.NODE_ENV !== "development") {
      return;
    }

    const inst = new Worker(0);
    await inst.register();
  }
};

// start right away
runApp();
