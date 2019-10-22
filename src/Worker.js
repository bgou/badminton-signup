import puppeteer from "puppeteer";
import moment from "moment";
import getLogger from "./logger";

export const dateFormat = "MM/D/YYYY h:mm:ss a";
const register2Url = "http://www.seattlebadmintonclub.com/Register2.aspx";

const TIMEOUT = 5000;
const partners = {
  tom: "tom nguyen 141",
  pratyush: "Pratyush Bhatt 771"
};

let logger = {};
export class Worker {
  constructor(index) {
    this.browser = {};
    this.page = {};
    this.index = index;
    this.finished = false;
    logger = getLogger(`Worker ${index}`);
  }
  isFinished() {
    return this.finished;
  }

  async waitForABit() {
    await this.page.waitFor(TIMEOUT);
  }

  async register() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        // slowMo: 100,
        // devtools: false,
        args: [
          // Required for Docker version of Puppeteer
          "--no-sandbox",
          "--disable-setuid-sandbox",
          // This will write shared memory files into /tmp instead of /dev/shm,
          // because Docker’s default for /dev/shm is 64MB
          "--disable-dev-shm-usage"
        ]
      });
      this.page = await this.browser.newPage();
      this.page.setDefaultTimeout(TIMEOUT);
    } catch (ex) {
      console.error(ex);
      if (this.browser) {
        await this.browser.close();
      }
      return;
    }

    try {
      await this.login();
      const hasDate = await this.chooseDate();

      if (hasDate) {
        await this.choosePartner(partners["pratyush"]);
        await this.submitRegistration();
        logger.info("Saving screenshot to Result.png");
        await this.page.screenshot({ path: "Result.png" });
        process.exit(0);
      }
    } catch (ex) {
      console.error(ex);
    } finally {
      await this.browser.close();
    }

    this.finished = true;
  }

  async login() {
    logger.info("Opening login page");
    await this.page.goto("http://www.seattlebadmintonclub.com/Security.aspx");

    const leagueSelector =
      "#ctl00_bodyContentPlaceHolder_leagueRadioButtonList_2";
    await this.page.waitForSelector(leagueSelector);
    await this.page.click(leagueSelector);

    const loginButtonSelector =
      "#ctl00_bodyContentPlaceHolder_Login1_LoginButton";
    await this.page.waitForSelector(loginButtonSelector);

    logger.info("Entering crendentials");
    await this.page.type(
      "#ctl00_bodyContentPlaceHolder_Login1_UserName",
      "geekhuh"
    );
    await this.page.type(
      "#ctl00_bodyContentPlaceHolder_Login1_Password",
      "$badminton"
    );

    logger.info("Logging in");
    await this.page.click("#ctl00_bodyContentPlaceHolder_Login1_LoginButton");
    await this.waitForABit();
  }

  async chooseDate() {
    logger.info("Choosing date");
    const playDateSelector = "#ctl00_bodyContentPlaceHolder_ddlistPlayDate";
    await this.page.waitForSelector(playDateSelector);
    const playDateSelectElem = await this.page.$(playDateSelector);
    const dateOptions = await playDateSelectElem.$$eval("*", nodes =>
      nodes.map(n => ({ text: n.innerText, value: n.value }))
    );
    logger.info(`Available play dates: ${JSON.stringify(dateOptions)}`);

    const nextTuesOpt = dateOptions.find(value =>
      this.isNextTuesday(value.text)
    );

    if (!nextTuesOpt) {
      logger.info("No date available.");
      return false;
    }

    logger.info(`Selecting ${JSON.stringify(nextTuesOpt)}`);

    await this.page.select(
      "#ctl00_bodyContentPlaceHolder_ddlistPlayDate",
      nextTuesOpt.value
    );

    await this.waitForABit();
    logger.info(`Selected ${nextTuesOpt.text}`);
    return true;
  }

  async choosePartner(partner) {
    if (!partner) {
      logger.info("No partner specified, registering self.");
      return;
    }

    logger.info(`Choosing ${partner} as partner`);
    await this.page.select(
      "#ctl00_bodyContentPlaceHolder_listUnselected",
      partner
    );
    await this.waitForABit();

    logger.info(`Selected ${partner} as partner`);
  }

  async submitRegistration() {
    logger.info("Attempt registration");
    const registerButtonSelector = "#ctl00_bodyContentPlaceHolder_registerTB";

    await this.page.waitForSelector(registerButtonSelector);

    logger.info("Detecting register button");
    const regBtn = await this.page.$(registerButtonSelector);
    const isDisabled = await this.page.$eval(
      registerButtonSelector,
      el => el.disabled
    );

    if (isDisabled) {
      logger.info("The register button is disabled. Exiting.");
      this.finished = true;
      return;
    }

    logger.info("Clicking the register button");

    await regBtn.click();
    await this.page.waitForResponse(register2Url);
    logger.info("Successfully clicked the register button");
  }

  isNextTuesday(dateStr) {
    const today = moment();
    const optDate = moment(dateStr, dateFormat);

    return (
      optDate.day() === 2 &&
      optDate.diff(today, "day") > 0 &&
      optDate.hour() === 20
    );
  }
}
