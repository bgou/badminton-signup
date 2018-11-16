import { Worker } from "./app";
import getLogger from "./logger";

const logger = getLogger("App");
logger.info("Application starting");

const MAX_WORKERS = 5;
const workers = [];
setInterval(() => {
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
}, 5000);
