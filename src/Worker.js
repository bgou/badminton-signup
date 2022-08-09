import puppeteer from "puppeteer";
import moment from "moment";
import getLogger from "./logger";

export const dateFormat = "MM/D/YYYY h:mm:ss a";
const register2Url = "http://www.seattlebadmintonclub.com/Register2.aspx";
const USERNAME = process.env["SBC_USERNAME"];
const PASSWORD = process.env["SBC_PASSWORD"];
const PARTNER = process.env["SBC_PARTNER"] || "";

const TIMEOUT = 10000;

let logger = {};
export class Worker {
  constructor(index) {
    logger = getLogger(`Worker ${index}`);
    try {
      this.browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 100,
        // devtools: true,
        args: [
          // Required for Docker version of Puppeteer
          "--no-sandbox",
          "--disable-setuid-sandbox",
          // This will write shared memory files into /tmp instead of /dev/shm,
          // because Docker’s default for /dev/shm is 64MB
          "--disable-dev-shm-usage"
        ]
      });
      this.page = {};
      this.index = index;
      this.finished = false;
    } catch (error) {
      
    }
  }

  isFinished() {
    return this.finished;
  }

  async waitForABit() {
    await this.page.waitFor(TIMEOUT);
  }

  async register() {
    try {
      this.page = await this.browser.newPage();
      this.page.setDefaultTimeout(TIMEOUT);
      await this.login();
      const hasDate = await this.chooseDate();

      if (hasDate) {
        await this.choosePartner();
        await this.submitRegistration();
        logger.info("Saving screenshot to Result.png");
        await this.page.screenshot({ path: "Result.png" });
        process.exit(0);
      }
    } catch (ex) {
      console.error(ex);
      if (this.page) {
        this.page.close()
      }
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
      USERNAME
    );
    await this.page.type(
      "#ctl00_bodyContentPlaceHolder_Login1_Password",
      PASSWORD
    );

    logger.info("Logging in");
    await this.page.click("#ctl00_bodyContentPlaceHolder_Login1_LoginButton");
    await this.waitForABit();
  }

  async chooseDate() {
    logger.info("Choosing date");
    const playDateSelector = "#ctl00_bodyContentPlaceHolder_ddlistPlayDate";
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

  async choosePartner() {
    if (!PARTNER) {
      logger.info("No partner specified, registering self.");
      return;
    }

    logger.info(`Attempting to choose ${PARTNER} as partner`);

    const selector = "#ctl00_bodyContentPlaceHolder_listUnselected";

    let partner_selector = "";
    const options = await this.getSelectOptions(`${selector} > option`);

    for (let i = 0; i < options.length; ++i) {
      const item = options[i];
      if (item.value.toLowerCase().includes(PARTNER.toLowerCase())) {
        partner_selector = item.value;
        break;
      }
    }

    if (!partner_selector) {
      logger.error(
        `Unable to find partner ${partner_selector}, registering self.`
      );
      return;
    }

    logger.info(`Selecting partner ${partner_selector}`);
    await this.page.select(selector, partner_selector);

    await this.waitForABit();
    logger.info(`Selected ${PARTNER} as partner`);
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

  async getSelectOptions(selector) {
    logger.info(`selecting ${selector}`);
    const options = await this.page.evaluate(optionSelector => {
      console.log(`optionSelector ${optionSelector}`);
      return Array.from(document.querySelectorAll(optionSelector))
        .filter(o => o.value)
        .map(o => {
          return {
            name: o.text,
            value: o.value
          };
        });
    }, selector);

    return options;
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
