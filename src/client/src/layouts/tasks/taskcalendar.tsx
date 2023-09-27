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
import PageTitle from "../../components/title";
import { useNavigate } from "react-router-dom";
import { getAllTenantTasksStructuredForCalendar } from "../../services/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export type TaskType = {
  id: number;
  name: string;
  crop_id: number;
  landplot: number;
  species_name: string;
  crop_start_date?: string;
  stage_name: string;
  color: string;
  due_date: string;
  done_date?: string;
};

function Taskcalendar() {
  PageTitle("Calendario");
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const today = new Date();

  const [state, setState] = useState<any>({});

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

  const [selectedDate, setSelectedDate] = useState(today);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

  // searchResult handle

  const [searchResult, setSearchResult] = useState();

  const onSearchResult = (item: any) => {
    setSearchResult(item);
  };

  // Tasks load

  const [cropTasks, setCropTasks] = useState<TaskType[]>([]);

  const loadTasks = async (id: number) => {
    try {
      const tasks = await getAllTenantTasksStructuredForCalendar(id);
      setCropTasks(tasks);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadTasks(tenantId);
    }
  }, [tenantId]);

  // Calendar and TimeLine data getters

  const getMonthRows = () => {
    let rows: any = [],
      daysBefore = [];

    let iteration = getWeeksInMonth(selectedDate);
    let monthStartDate = startOfMonth(selectedDate); // First day of month
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
        let data = cropTasks.filter((event: any) =>
          isSameDay(
            subDate,
            parse(event?.done_date || event?.due_date, "yyyy-MM-dd", new Date())
          )
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
        j < (i === 0 ? 7 - daysBefore.length : 7) &&
        dateDay <= getDaysInMonth(selectedDate);
        j++
      ) {
        let date = parse(
          `${dateDay}-${format(selectedDate, "MMMM-yyyy")}`,
          "dd-MMMM-yyyy",
          new Date()
        );
        let data = cropTasks.filter((event: any) =>
          isSameDay(
            date,
            parse(event?.done_date || event?.due_date, "yyyy-MM-dd", new Date())
          )
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
      let day = lastRow.days[lastRow.days.length - 1];
      let addDate = day.date;
      for (let i = dateDay; i < dateDay + lastRowDaysdiff; i++) {
        addDate = add(addDate, { days: 1 });
        let d = format(addDate, "dd");
        let data = cropTasks.filter((event: any) =>
          isSameDay(
            addDate,
            parse(event?.done_date || event?.due_date, "yyyy-MM-dd", new Date())
          )
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
    let eventDate = parse(event?.due_date, 'yyyy-MM-dd', new Date())
    return isSameDay(selectedDate, eventDate)
    }) */
    cropTasks;

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
  }, [cropTasks, mode, selectedDate]);

  // Cells and events handlers

  const handleCellClick = (event: any, row: any, day: any) => {
    // Do something...
  };

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventDialogItem, setEventDialogItem] = useState<TaskType>({
    id: 0,
    name: "",
    crop_id: 0,
    landplot: 0,
    species_name: "",
    stage_name: "",
    color: "",
    due_date: "",
  });

  const handleEventClick = (event: any, item: any) => {
    setEventDialogOpen(true);
    setEventDialogItem(item);
    console.log(item);
  };

  const EventDialog = () => {
    const navigate = useNavigate();
    const {
      id,
      name,
      crop_id,
      landplot,
      species_name,
      stage_name,
      due_date,
      done_date,
    } = eventDialogItem;

    return (
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{name}</DialogTitle>
        <DialogContent>
          <p>
            Parcela N° {landplot} - {species_name}
          </p>
          <p>Etapa: {stage_name}</p>
          <p>Fecha estimada: {due_date}</p>
          {done_date ? <p>Fecha de realización: {done_date}</p> : null}
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button onClick={() => setEventDialogOpen(false)}>Cerrar</Button>
          <Button onClick={() => navigate(`/cropdetails/${crop_id}`)} autoFocus>
            Ver cultivo
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleEventDialogConfirm = () => {
    // Do something...
  };

  const handleEventsChange = async (item: any) => {
    console.log(item);
    /* let eventIndex = events.findIndex((e: any) => e.id === item?.id);
    if (eventIndex !== -1) {
      let oldObject = Object.assign({}, events[eventIndex]);
      console.log(oldObject);
    } */
    // Do something...
  };

  return (
    <Paper variant="outlined" elevation={0} sx={{ p: 0 }}>
      <SchedulerToolbar
        events={cropTasks}
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
                selectedDate={selectedDate}
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
