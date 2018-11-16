import { Worker, dateFormat } from "../app";
import moment from "moment";
describe("testDate", () => {
  let app;
  beforeEach(() => {
    app = new Worker();
  });

  test("next tuesday 8pm should return true", () => {
    // Always start from tomorrow because it expects it to be at least 1 day from today
    // https://momentjs.com/docs/#/get-set/day/
    const nextTues = moment().day(2 + 7); // next Tuesday
    nextTues.hour(20);
    const testDate = nextTues.format(dateFormat);
    expect(app.isNextTuesday(testDate)).toBe(true);
  });

  test("next tuesday 6pm should return false", () => {
    // Always start from tomorrow because it expects it to be at least 1 day from today
    // https://momentjs.com/docs/#/get-set/day/
    const nextTues = moment().day(2 + 7); // next Tuesday
    nextTues.hour(18);
    const testDate = nextTues.format(dateFormat);
    expect(app.isNextTuesday(testDate)).toBe(false);
  });

  test("none tuesday should return false", () => {
    // Always start from tomorrow because it expects it to be at least 1 day from today
    // https://momentjs.com/docs/#/get-set/day/
    for (let day = 0; day < 7; ++day) {
      const isTuesday = day === 2;
      const nextTues = moment()
        .day(day + 7)
        .hour(20); // next Tuesday
      const testDate = nextTues.format(dateFormat);
      expect(app.isNextTuesday(testDate)).toBe(isTuesday);
    }
  });
});
