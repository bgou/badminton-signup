import puppeteer from "puppeteer";
import moment from "moment";
import getLogger from "./logger";
import { worker } from "cluster";

export const dateFormat = "MM/D/YYYY h:mm:ss a";
const register2Url = "http://www.seattlebadmintonclub.com/Register2.aspx";
const tom = "tom nguyen 141";

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

  async register() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();

    try {
      await this.login();
      const hasDate = await this.chooseDate();
      if (hasDate) {
        await this.choosePartner(tom);
        await this.submitRegistration();
      }
    } catch (ex) {
      console.error(ex);
    }

    await this.page.screenshot({ path: "example.png" });
    await this.browser.close();
    this.finished = true;
  }

  async login() {
    logger.info("Opening login page");
    await this.page.goto("http://www.seattlebadmintonclub.com/Security.aspx");

    const leagueSelector =
      "#ctl00_bodyContentPlaceHolder_leagueRadioButtonList_2";
    await this.page.waitForSelector(leagueSelector);
    await this.page.click(leagueSelector);

    const loginButtonSelector = "#ctl00_bodyContentPlaceHolder_LoginButton";
    await this.page.waitForSelector(loginButtonSelector);
    await this.page.click(loginButtonSelector);
    await this.page.waitForNavigation();

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
    await this.page.waitForNavigation();
  }

  async chooseDate() {
    logger.info("Choosing date");
    const playDateSelector = "#ctl00_bodyContentPlaceHolder_ddlistPlayDate";
    await this.page.waitForSelector(playDateSelector);
    const playDateSelectElem = await this.page.$(playDateSelector);
    const dateOptions = await playDateSelectElem.$$eval("*", nodes =>
      nodes.map(n => ({ text: n.innerText, value: n.value }))
    );
    logger.info("Available play dates:");
    logger.info(JSON.stringify(dateOptions, null, " "));

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
    await this.page.waitForResponse(register2Url);
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
    await this.page.waitForResponse(register2Url);

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
