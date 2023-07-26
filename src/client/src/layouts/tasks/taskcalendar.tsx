import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Paper, Fade } from "@mui/material";
import {
  format,
  getDaysInMonth,
  getDay,
  sub,
  startOfMonth,
  parse,
  add,
  getWeeksInMonth,
  isSameDay,
} from "date-fns";
import SchedulerToolbar from "./toolbar";
import MonthModeView from "./monthview";
import TimeLineModeView from "./timelineview";
import es from "date-fns/locale/es";

function Taskcalendar() {
  const theme = useTheme();
  const today = new Date();

  const [state, setState] = useState<any>({});
  let dateFnsLocale = es;

  const [options] = useState({
    minWidth: 540,
    maxWidth: 540,
    minHeight: 540,
    maxHeight: 540,
  });

  // Mode handle

  const [mode, setMode] = useState("month");
  const isMonthMode = mode.toLowerCase() === "month";
  const isTimelineMode = mode.toLowerCase() === "timeline";

  const handleModeChange = (newMode: any) => {
    setMode(newMode);
  };

  // Date handle

  const [selectedDay, setSelectedDay] = useState(today);
  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(today));
  const [selectedDate, setSelectedDate] = useState(format(today, "MMMM-yyyy"));

  const handleDateChange = (day: any, date: any) => {
    setDaysInMonth(day);
    setSelectedDay(date);
    setSelectedDate(format(date, "MMMM-yyyy"));
  };

  // searchResult handle

  const [searchResult, setSearchResult] = useState();

  const onSearchResult = (item: any) => {
    setSearchResult(item);
  };

  // hardcoded static events, to replace with a GET fetch from the 'services' file

  const events = [
    {
      id: "event-1",
      label: "Evento N° 1",
      groupLabel: "Grupo 1",
      user: "Grupo 1",
      color: "#f28f6a",
      date: "2022-05-05",
      createdAt: new Date(),
      createdBy: "Juan Perez",
    },
    {
      id: "event-2",
      label: "Evento N° 2: Riego",
      groupLabel: "Grupo 2",
      user: "Grupo 2",
      color: "#099ce5",
      date: "2022-05-09",
      createdAt: new Date(),
      createdBy: "Juan Perez",
    },
    {
      id: "event-3",
      label: "Evento N° 3: Fertilización",
      groupLabel: "Grupo 3",
      user: "Grupo 3",
      color: "#263686",
      date: "2023-08-03",
      createdAt: new Date(),
      createdBy: "Juan Perez",
    },
    {
      id: "event-4",
      label: "Evento N° 4: Cosecha",
      groupLabel: "Grupo 1",
      user: "Grupo 1",
      color: "#f28f6a",
      date: "2023-06-29",
      createdAt: new Date(),
      createdBy: "Juan Perez",
    },
  ];

  // Calendar and TimeLine data getters

  const getMonthRows = () => {
    let rows: any = [],
      daysBefore = [];

    let iteration = getWeeksInMonth(selectedDay);
    let monthStartDate = startOfMonth(selectedDay); // First day of month
    let monthStartDay = getDay(monthStartDate); // Index of the day in week
    let dateDay = parseInt(format(monthStartDate, "dd")); // Month start day

    // Add days of precedent month
    const checkCondition = (v: any) => v <= monthStartDay; // Condition check helper
    if (monthStartDay >= 1) {
      for (let i = 1; checkCondition(i); i++) {
        let subDate = sub(monthStartDate, {
          days: monthStartDay - i + 1,
        });
        let day = parseInt(format(subDate, "dd"));
        let data = events.filter((event: any) =>
          isSameDay(subDate, parse(event?.date, "yyyy-MM-dd", new Date()))
        );
        daysBefore.push({
          id: `day_-${day}`,
          day: day,
          date: subDate,
          data: data,
          outmonthday: true,
        });
      }
    }

    if (daysBefore.length > 0) {
      rows.push({ id: 0, days: daysBefore });
    }

    // Add days and events data
    for (let i = 0; i < iteration; i++) {
      let obj = [];

      for (
        let j = 0;
        // substract inserted days in the first line to 7 and ensure that days will not exceed 31
        j < (i === 0 ? 7 - daysBefore.length : 7) && dateDay <= daysInMonth;
        j++
      ) {
        let date = parse(
          `${dateDay}-${selectedDate}`,
          "dd-MMMM-yyyy",
          new Date()
        );
        let data = events.filter((event: any) =>
          isSameDay(date, parse(event?.date, "yyyy-MM-dd", new Date()))
        );
        obj.push({
          id: `day_-${dateDay}`,
          date,
          data,
          day: dateDay,
        });
        dateDay++;
      }

      if (i === 0 && daysBefore.length > 0) {
        rows[0].days = rows[0].days.concat(obj);
        continue;
      }
      if (obj.length > 0) {
        rows.push({ id: i, days: obj });
      }
    }

    // Check if last row is not fully filled
    let lastRow = rows[iteration - 1];
    let lastRowDaysdiff = 7 - lastRow?.days?.length;
    let lastDaysData = [];

    if (lastRowDaysdiff > 0) {
      let day = lastRow.days[lastRow?.days?.length - 1];
      let addDate = day.date;
      for (let i = dateDay; i < dateDay + lastRowDaysdiff; i++) {
        addDate = add(addDate, { days: 1 });
        let d = format(addDate, "dd");
        let data = events.filter((event: any) =>
          isSameDay(addDate, parse(event?.date, "yyyy-MM-dd", new Date()))
        );
        lastDaysData.push({
          id: `day_-${d}`,
          date: addDate,
          day: d,
          data,
          outmonthday: true,
        });
      }
      rows[iteration - 1].days = rows[iteration - 1].days.concat(lastDaysData);
    }

    return rows;
  };

  const getTimeLineRows = () =>
    /* events.filter((event: any) => {
    let eventDate = parse(event?.date, 'yyyy-MM-dd', new Date())
    return isSameDay(selectedDay, eventDate)
    }) */
    events;

  useEffect(() => {
    if (isMonthMode) {
      setState({
        ...state,
        rows: getMonthRows(),
      });
    }
    if (isTimelineMode) {
      setState({
        ...state,
        rows: getTimeLineRows(),
      });
    }
  }, [mode, daysInMonth, selectedDay, selectedDate, dateFnsLocale]);

  // Cells and events handlers

  const handleCellClick = (event: any, row: any, day: any) => {
    // Do something...
  };

  const handleEventClick = (event: any, item: any) => {
    // Do something...
  };

  const handleEventsChange = async (item: any) => {
    // Do something...
    let eventIndex = events.findIndex((e: any) => e.id === item?.id);
    if (eventIndex !== -1) {
      let oldObject = Object.assign({}, events[eventIndex]);
    }
  };

  return (
    <Paper variant="outlined" elevation={0} sx={{ p: 0 }}>
      <SchedulerToolbar
        events={events}
        switchMode={mode}
        onModeChange={handleModeChange}
        onSearchResult={onSearchResult}
        onDateChange={handleDateChange}
      />
      <Grid container spacing={0} alignItems="center" justifyContent="start">
        {isMonthMode && (
          <Fade in>
            <Grid item xs={12}>
              <MonthModeView
                //date={selectedDate}
                rows={state?.rows}
                options={options}
                searchResult={searchResult}
                onTaskClick={handleEventClick}
                onCellClick={handleCellClick}
                onDateChange={handleDateChange}
                //searchResult={searchResult}
                //onEventsChange={handleEventsChange}
              />
            </Grid>
          </Fade>
        )}
      </Grid>
      {isTimelineMode && (
        <Fade in>
          <Grid container spacing={2} alignItems="start">
            <Grid item xs={12}>
              <TimeLineModeView
                rows={state?.rows}
                options={options}
                searchResult={searchResult}
                onTaskClick={handleEventClick}
                //date={selectedDate}
                //onCellClick={handleCellClick}
                //onDateChange={handleDateChange}
                //onEventsChange={handleEventsChange}
              />
            </Grid>
          </Grid>
        </Fade>
      )}
    </Paper>
  );
}

export default Taskcalendar;
