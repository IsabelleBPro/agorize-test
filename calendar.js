const moment = require("moment");

class Calendar {
  #eventList = [];
  #recurrentEventList = [];

  /**
   * Add new event to the calendar
   * @param {Boolean} opening
   * @param {Boolean} recurring
   * @param {Date} startDate
   * @param {Date} endDate
   */
  addEvent(opening, recurring, startDate, endDate) {
    let event = {
      opening,
      recurring,
      startDate: moment(startDate),
      endDate: moment(endDate),
    };

    if (recurring) {
      this.#recurrentEventList.push(event);
    } else {
      this.#eventList.push(event);
    }
  }

  /**
   * Return all availabilities of the calendar into period of time
   * @param {Date} fromDate
   * @param {Date} toDate
   * @returns
   */
  availabilities(fromDate, toDate) {
    const slotStartDate = moment(fromDate);
    const slotEndDate = moment(toDate);

    const { companyAvailabilities, companyUnavailabilities } =
      this.#searchEventInPeriod(slotStartDate, slotEndDate);

    const availabilities = !companyUnavailabilities.length
      ? companyAvailabilities
      : this.#splitAvailabilitiesAccordingToUnavailabilities(
          companyAvailabilities,
          companyUnavailabilities
        );

    return availabilities.map((availability) => ({
      ...availability,
      startDate: moment(availability.startDate).toDate(),
      endDate: moment(availability.endDate).toDate(),
    }));
  }

  #splitAvailabilitiesAccordingToUnavailabilities(
    companieAvailabilities,
    companieUnavailabilities
  ) {
    const newAvailabilities = [];

    for (const availability of companieAvailabilities) {
      for (const unavailability of companieUnavailabilities) {
        if (
          availability.startDate.isSame(unavailability.startDate) &&
          availability.endDate.isSame(unavailability.endDate)
        ) {
          // Availability inside the unavailability, so no availability
          continue;
        }

        if (
          availability.startDate.isSame(unavailability.startDate) &&
          availability.endDate.isAfter(unavailability.endDate)
        ) {
          // availability and unavailability start at the same time, so reduce the availability
          newAvailabilities.push({
            startDate: unavailability.endDate,
            endDate: availability.endDate,
          });
        } else if (
          availability.startDate.isBefore(unavailability.startDate) &&
          availability.endDate.isSame(unavailability.endDate)
        ) {
          // availability and unavailability end at the same time, so reduce the availability
          newAvailabilities.push({
            startDate: availability.startDate,
            endDate: unavailability.startDate,
          });
        } else if (
          availability.startDate.isBefore(unavailability.startDate) &&
          availability.endDate.isAfter(unavailability.endDate)
        ) {
          // Unavailability inside the availability, so split the availability
          newAvailabilities.push(
            {
              startDate: availability.startDate,
              endDate: unavailability.startDate,
            },
            {
              startDate: unavailability.endDate,
              endDate: availability.endDate,
            }
          );
        }
      }
    }

    return newAvailabilities;
  }

  /**
   * Search event in period and group by opening
   * @param {Date} slotStartDate
   * @param {Date} slotEndDate
   * @returns
   */
  #searchEventInPeriod(slotStartDate, slotEndDate) {
    const companyAvailabilities = [];
    const companyUnavailabilities = [];

    const events = [
      ...this.#getRecurrentEvent(slotStartDate, slotEndDate),
      ...this.#eventList,
    ];

    for (const event of events) {
      // In period
      if (
        slotStartDate.isBefore(event.startDate) &&
        slotEndDate.isAfter(event.endDate)
      ) {
        const eventPeriod = {
          startDate: event.startDate,
          endDate: event.endDate,
        };

        if (event.opening) {
          companyAvailabilities.push(eventPeriod);
        } else {
          companyUnavailabilities.push(eventPeriod);
        }
      }
    }

    return {
      companyAvailabilities,
      companyUnavailabilities,
    };
  }

  /**
   * Compute the recurrent event into the period
   * @param {*} fromDate
   * @param {*} toDate
   * @returns
   */
  #getRecurrentEvent(fromDate, toDate) {
    // We admit of a recursion of an event is in 7 days

    const recurrentEvents = [];

    for (const event of this.#recurrentEventList) {
      let firstRecurrentDate = event.startDate;

      if (event.startDate.isAfter(toDate)) {
        // The event is after the period
        continue;
      }

      if (fromDate.isAfter(event.startDate)) {
        // The first recursion is before the start of the period, so wa have to compute the date of the first recusion into the period

        // The number of the day after the start period when the first recusion is
        const diff =
          7 -
          (moment.duration(fromDate.diff(event.startDate, "days")).days() % 7);
        firstRecurrentDate = moment(fromDate).add(diff, "days");

        recurrentEvents.push({
          ...event,
          startDate: moment(event.startDate).add(diff, "days"),
          endDate: moment(event.endDate).add(diff, "days"),
        });
      } else {
        // First recusion is into the period
        recurrentEvents.push({
          ...event,
        });
      }

      // Compute the number of recursion into the period.
      const diff = moment.duration(toDate.diff(firstRecurrentDate)).days();
      const recurrentCount = Math.floor(diff / 7);

      // Push all the event occurence with an interval of 7 days
      for (let i = 0; i < recurrentCount; i++) {
        recurrentEvents.push({
          ...event,
          startDate: moment(event.startDate).add(i * 7, "days"),
          endDate: moment(event.endDate).add(i * 7, "days"),
        });
      }
    }

    return recurrentEvents;
  }
}

module.exports.Calendar = Calendar;
