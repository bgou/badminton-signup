import { Worker } from "./Worker";
import getLogger from "./logger";
import moment from "moment-timezone";

const logger = getLogger("App");
logger.info("Application starting");

const MAX_WORKERS = 10;
const PST = "America/Los_Angeles";
const workers = [];

const shouldRun = () => {
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

  logger.debug(`${now.format()} is not around Tuesday 5pm PST. Skipping`);
  return false;
};

const runApp = () => {
  if (!shouldRun() && process.env.NODE_ENV !== "development") {
    return;
  }

  logger.info("Starting registration");
  if (workers.length < MAX_WORKERS) {
    logger.info("Starting worker");
    const inst = new Worker(workers.length);
    inst.register();
    workers.push(inst);
  } else {
    logger.info(
      `Max workers (${MAX_WORKERS}) reached. Checking if we can free some workers.`
    );
    const replacedWorker = false;
    workers.forEach((worker, index) => {
      if (worker.isFinished()) {
        logger.info(
          `Worker ${index} is finished. Replacing with a new worker.`
        );
        const inst = new Worker(index);
        inst.register();
        workers[index] = inst;
      }
    });
    if (!replacedWorker) {
      logger.info("All workers are in progress, no new worker replaced");
    }
  }
};

// start right away
runApp();

// then run every 5 seconds
setInterval(() => {
  runApp();
}, 2000);
