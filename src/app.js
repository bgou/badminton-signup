import puppeteer from "puppeteer";
import moment from "moment";

export const dateFormat = "MM/D/YYYY h:mm:ss a";
const register2Url = "http://www.seattlebadmintonclub.com/Register2.aspx";
const tom = "tom nguyen 141";

export class AutomaticRegister {
  constructor() {
    this.browser = {};
    this.page = {};
  }
  async register() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();

    try {
      await this.login();
      await this.chooseDate();
      await this.choosePartner(tom);
      await this.submitRegistration();
    } catch (ex) {
      console.error(ex);
    }
  }

  async login() {
    console.log("Opening login page");
    await this.page.goto("http://www.seattlebadmintonclub.com/Security.aspx");

    const leagueSelector =
      "#ctl00_bodyContentPlaceHolder_leagueRadioButtonList_2";
    await this.page.waitForSelector(leagueSelector);
    await this.page.click(leagueSelector);

    const loginButtonSelector = "#ctl00_bodyContentPlaceHolder_LoginButton";
    await this.page.waitForSelector(loginButtonSelector);
    await this.page.click(loginButtonSelector);
    await this.page.waitForNavigation();

    console.log("Entering crendentials");
    await this.page.type(
      "#ctl00_bodyContentPlaceHolder_Login1_UserName",
      "geekhuh"
    );
    await this.page.type(
      "#ctl00_bodyContentPlaceHolder_Login1_Password",
      "$badminton"
    );

    console.log("Logging in");
    await this.page.click("#ctl00_bodyContentPlaceHolder_Login1_LoginButton");
    await this.page.waitForNavigation();
  }

  async chooseDate() {
    console.log("Choosing date");
    const playDateSelector = "#ctl00_bodyContentPlaceHolder_ddlistPlayDate";
    await this.page.waitForSelector(playDateSelector);
    const playDateSelectElem = await this.page.$(playDateSelector);
    const dateOptions = await playDateSelectElem.$$eval("*", nodes =>
      nodes.map(n => ({ text: n.innerText, value: n.value }))
    );
    console.log("Available play dates:");
    console.log(JSON.stringify(dateOptions, null, " "));

    const nextTuesOpt = dateOptions.find(value =>
      this.isNextTuesday(value.text)
    );
    console.log(`Selecting ${JSON.stringify(nextTuesOpt)}`);

    await this.page.select(
      "#ctl00_bodyContentPlaceHolder_ddlistPlayDate",
      nextTuesOpt.value
    );
    await this.page.waitForResponse(register2Url);
    console.log(`Selected ${nextTuesOpt.text}`);
  }

  async choosePartner(partner) {
    if (!partner) {
      console.log("No partner specified, registering self.");
      return;
    }

    console.log(`Choosing ${partner} as partner`);
    await this.page.select(
      "#ctl00_bodyContentPlaceHolder_listUnselected",
      partner
    );
    await this.page.waitForResponse(register2Url);

    console.log(`Selected ${partner} as partner`);
  }

  async submitRegistration() {
    console.log("Attempt registration");
    const registerButtonSelector = "#ctl00_bodyContentPlaceHolder_registerTB";

    await this.page.waitForSelector(registerButtonSelector);

    console.log("Detecting register button");
    const regBtn = await this.page.$(registerButtonSelector);
    const isDisabled = await this.page.$eval(
      registerButtonSelector,
      el => el.disabled
    );

    if (isDisabled) {
      console.log("The register button is disabled. Exiting.");
      process.exit(0);
    }

    console.log("Clicking the register button");

    await regBtn.click();
    await this.page.waitForResponse(register2Url);

    await this.page.screenshot({ path: "example.png" });
    await this.browser.close();
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
