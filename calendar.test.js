const { Calendar } = require("./calendar");

describe("Calendar", () => {
  it("should return an empty array with no availability", () => {
    const calendar = new Calendar();
    const fromDate = new Date(2016, 6, 4, 10, 0);
    const toDate = new Date(2016, 6, 10, 10, 0);

    const result = calendar.availabilities(fromDate, toDate);
    expect(result).toEqual([]);
  });

  it("should return an availability", () => {
    const calendar = new Calendar();
    const startDate = new Date(2016, 6, 1, 10, 30);
    const endDate = new Date(2016, 6, 1, 14, 0);

    calendar.addEvent(true, false, startDate, endDate);

    const fromDate = new Date(2016, 6, 1, 0, 0);
    const toDate = new Date(2016, 6, 2, 0, 0);

    const result = calendar.availabilities(fromDate, toDate);
    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 1, 10, 30),
      endDate: new Date(2016, 6, 1, 14, 0),
    });
  });

  it("should be recurrent", () => {
    const calendar = new Calendar();
    const startDate = new Date(2016, 6, 1, 10, 30);
    const endDate = new Date(2016, 6, 1, 14, 0);

    calendar.addEvent(true, true, startDate, endDate);

    const fromDate = new Date(2016, 6, 4, 0, 0);
    const toDate = new Date(2016, 6, 10, 0, 0);

    const result = calendar.availabilities(fromDate, toDate);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 8, 10, 30),
      endDate: new Date(2016, 6, 8, 14, 0),
    });
  });

  it("should return empty array when there is an unavailability surrounds all availabilities", () => {
    const calendar = new Calendar();
    let startDate = new Date(2016, 6, 1, 10, 30);
    let endDate = new Date(2016, 6, 1, 14, 0);

    calendar.addEvent(true, false, startDate, endDate);

    startDate = new Date(2016, 6, 1, 10, 30);
    endDate = new Date(2016, 6, 1, 14, 0);
    calendar.addEvent(false, false, startDate, endDate);

    const fromDate = new Date(2016, 6, 1, 0, 0);
    const toDate = new Date(2016, 6, 2, 0, 0);

    const result = calendar.availabilities(fromDate, toDate);
    expect(result).toEqual([]);
  });

  it("should return two availabilities when there is an unavailability into a availability", () => {
    const calendar = new Calendar();

    let startDate = new Date(2016, 6, 1, 10, 30);
    let endDate = new Date(2016, 6, 1, 14, 0);

    calendar.addEvent(true, false, startDate, endDate);

    startDate = new Date(2016, 6, 1, 11, 30);
    endDate = new Date(2016, 6, 1, 12, 30);
    calendar.addEvent(false, false, startDate, endDate);

    const fromDate = new Date(2016, 6, 1, 0, 0);
    const toDate = new Date(2016, 6, 2, 0, 0);

    const result = calendar.availabilities(fromDate, toDate);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 1, 10, 30),
      endDate: new Date(2016, 6, 1, 11, 30),
    });
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 1, 12, 30),
      endDate: new Date(2016, 6, 1, 14, 0),
    });
  });

  it("should return an availability when there is an unavailability at start of the availability", () => {
    const calendar = new Calendar();

    let startDate = new Date(2016, 6, 1, 10, 30);
    let endDate = new Date(2016, 6, 1, 14, 0);

    calendar.addEvent(true, false, startDate, endDate);

    startDate = new Date(2016, 6, 1, 10, 30);
    endDate = new Date(2016, 6, 1, 11, 0);
    calendar.addEvent(false, false, startDate, endDate);

    const fromDate = new Date(2016, 6, 1, 0, 0);
    const toDate = new Date(2016, 6, 2, 0, 0);

    const result = calendar.availabilities(fromDate, toDate);
    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 1, 11, 0),
      endDate: new Date(2016, 6, 1, 14, 0),
    });
  });

  it("should return an availability when there is an unavailability at end of the availability", () => {
    const calendar = new Calendar();

    let startDate = new Date(2016, 6, 1, 10, 30);
    let endDate = new Date(2016, 6, 1, 14, 0);

    calendar.addEvent(true, false, startDate, endDate);

    startDate = new Date(2016, 6, 1, 13, 0);
    endDate = new Date(2016, 6, 1, 14, 0);
    calendar.addEvent(false, false, startDate, endDate);

    const fromDate = new Date(2016, 6, 1, 0, 0);
    const toDate = new Date(2016, 6, 2, 0, 0);

    const result = calendar.availabilities(fromDate, toDate);
    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 1, 10, 30),
      endDate: new Date(2016, 6, 1, 13, 0),
    });
  });

  it("should be recurrent unavailability", () => {
    const calendar = new Calendar();
    let startDate = new Date(2016, 6, 1, 10, 30);
    let endDate = new Date(2016, 6, 1, 14, 0);

    calendar.addEvent(true, true, startDate, endDate);

    startDate = new Date(2016, 6, 1, 11, 30);
    endDate = new Date(2016, 6, 1, 12, 30);
    calendar.addEvent(false, true, startDate, endDate);

    const fromDate = new Date(2016, 6, 4, 0, 0);
    const toDate = new Date(2016, 6, 10, 0, 0);

    const result = calendar.availabilities(fromDate, toDate);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 8, 10, 30),
      endDate: new Date(2016, 6, 8, 11, 30),
    });
    expect(result).toContainEqual({
      startDate: new Date(2016, 6, 8, 12, 30),
      endDate: new Date(2016, 6, 8, 14, 0),
    });
  });
});
