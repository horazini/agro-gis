import { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Fade,
  DialogTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
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
import PageTitle from "../../components/title";

function Taskcalendar() {
  PageTitle("Calendario");

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
      id: 1,
      label: "Evento N° 1",
      groupLabel: "Cultivo 1",
      landplot: "Parcela 32",
      species: "Tomate",
      color: "#f28f6a",
      date: "2022-05-05",
      createdBy: "Juan Perez",
    },
    {
      id: 2,
      label: "Evento N° 2: Riego",
      groupLabel: "Cultivo 2",
      landplot: "Parcela 45",
      species: "Morron",
      color: "#099ce5",
      date: "2022-05-09",
      createdBy: "Juan Perez",
    },
    {
      id: 3,
      label: "Evento N° 3: Fertilización",
      groupLabel: "Cultivo 3",
      landplot: "Parclea 17",
      species: "Cebolla",
      color: "#263686",
      date: "2023-08-03",
      createdBy: "Juan Perez",
    },
    {
      id: 4,
      label: "Evento N° 4: Cosecha",
      groupLabel: "Cultivo 1",
      landplot: "Parcela 32",
      species: "Tomate",
      color: "#f28f6a",
      date: "2023-06-29",
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

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventDialogItem, setEventDialogItem] = useState<any>();

  const handleEventClick = (event: any, item: any) => {
    setEventDialogOpen(true);
    setEventDialogItem(item);
    console.log(item);
  };

  const EventDialog = () => {
    return (
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {eventDialogItem?.label}
        </DialogTitle>
        <DialogContent>
          <p>{eventDialogItem?.groupLabel}</p>
          <p>{eventDialogItem?.landplot}</p>
          <p> {eventDialogItem?.createdBy}</p>
          <p> {eventDialogItem?.date}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleEventDialogConfirm} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleEventDialogConfirm = () => {
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
      <EventDialog />
    </Paper>
  );
}

export default Taskcalendar;
