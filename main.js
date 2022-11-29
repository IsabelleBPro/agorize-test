const { Calendar } = require("./calendar");
const moment = require("moment");

const calendar = new Calendar();

let startDate = new Date(2016, 6, 1, 10, 30); // July 1st, 10:30
let endDate = new Date(2016, 6, 1, 14, 00); // July 1st, 14:00

calendar.addEvent(true, true, startDate, endDate); // weekly recurring opening in calendar

startDate = new Date(2016, 6, 8, 11, 30); // July 8th 11:30
endDate = new Date(2016, 6, 8, 12, 30); // July 8th 12:30
calendar.addEvent(false, true, startDate, endDate); // intervention scheduled

const fromDate = new Date(2016, 6, 4, 10, 00);
const toDate = new Date(2016, 6, 10, 10, 00);

const availabilitiesResult = calendar.availabilities(fromDate, toDate);

const availabilitiesMsg = [];

if (availabilitiesResult.length) {
  availabilitiesMsg.push("I'm available from:");

  for (const availability of availabilitiesResult) {
    const startDate = moment(availability.startDate);
    const endDate = moment(availability.endDate);

    availabilitiesMsg.push(
      `- ${startDate.format("MMMM Do")} from ${startDate.format(
        "hh:mma"
      )} to ${endDate.format("hh:mma")}`
    );
  }

  availabilitiesMsg.push("I'm not available any other time!");
} else {
  availabilitiesMsg.push("I'm not available at any time for this period!");
}

console.log(availabilitiesMsg.join("\n"));
