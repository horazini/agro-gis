import { useState, useEffect, Fragment } from "react";
import {
  Grid,
  Paper,
  Fade,
  DialogTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  TextField,
  Typography,
  AlertColor,
} from "@mui/material";
import { Today as TodayIcon } from "@mui/icons-material";
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
import { useNavigate } from "react-router-dom";
import {
  getAllTenantTasksStructuredForCalendar,
  setDoneCropEvent,
  setFinishedCropStage,
} from "../../utils/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { DateCalendar } from "@mui/x-date-pickers";
import {
  CircularProgressBackdrop,
  PageTitle,
  SnackBarAlert,
} from "../../components/customComponents";

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
  min_date?: string;
};

const getMonthRows = (selectedDate: any, cropTasks: any) => {
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

function Taskcalendar() {
  PageTitle("Calendario");
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const today = new Date();

  const [options] = useState({
    minWidth: 540,
    maxWidth: 540,
    minHeight: 540,
    maxHeight: 540,
  });

  // Tasks load

  const [dataReloadCounter, setDataReloadCounter] = useState(0);

  const [cropTasks, setCropTasks] = useState<TaskType[]>([]);

  const [filteredCropTasks, setFilteredCropTasks] = useState<TaskType[]>([]);

  const [rows, setRows] = useState<any>();

  const loadTasks = async (id: number) => {
    try {
      const tasks = await getAllTenantTasksStructuredForCalendar(id);
      setCropTasks(tasks);
      setFilteredCropTasks(tasks);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadTasks(tenantId);
    }
  }, [tenantId, dataReloadCounter]);

  // searchResult handle

  const [searchResult, setSearchResult] = useState<any>();

  const onSearchResult = (item: any) => {
    setSearchResult(item);
  };

  const [taskStatus, setTaskStatus] = useState("any");

  // crop and status task filter

  useEffect(() => {
    let filteredEvents = cropTasks;
    if (searchResult) {
      filteredEvents = filteredEvents?.filter(
        (event: TaskType) => event?.crop_id === searchResult?.crop_id
      );
    }
    if (taskStatus === "done") {
      filteredEvents = filteredEvents?.filter(
        (event: TaskType) => event?.done_date
      );
    } else if (taskStatus === "todo") {
      filteredEvents = filteredEvents?.filter(
        (event: TaskType) => !event?.done_date
      );
    }
    setFilteredCropTasks(filteredEvents);
  }, [searchResult, taskStatus]);

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

  // Calendar and TimeLine data getters

  const getTimeLineRows = () =>
    /* events.filter((event: any) => {
    let eventDate = parse(event?.due_date, 'yyyy-MM-dd', new Date())
    return isSameDay(selectedDate, eventDate)
    }) */
    filteredCropTasks;

  useEffect(() => {
    if (isMonthMode) {
      setRows(getMonthRows(selectedDate, filteredCropTasks));
    }
    if (isTimelineMode) {
      setRows(getTimeLineRows());
    }
  }, [filteredCropTasks, mode, selectedDate]);

  const handleEventsChange = async (item: any) => {
    console.log(item);
    /* let eventIndex = events.findIndex((e: any) => e.id === item?.id);
    if (eventIndex !== -1) {
      let oldObject = Object.assign({}, events[eventIndex]);
      console.log(oldObject);
    } */
    // Do something...
  };

  const handleCellClick = (event: any, row: any, day: any) => {
    // Do something...
  };

  // Events handling

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

  const handleEventClick = (item: any) => {
    setEventDialogOpen(true);
    setEventDialogItem(item);
    console.log(item);
  };

  return (
    <Fragment>
      <Paper variant="outlined" elevation={0} sx={{ p: 0 }}>
        <SchedulerToolbar
          events={cropTasks}
          switchMode={mode}
          onModeChange={handleModeChange}
          onSearchResult={onSearchResult}
          onDateChange={handleDateChange}
          taskStatus={taskStatus}
          setTaskStatus={setTaskStatus}
        />
        <Grid container spacing={0} alignItems="center" justifyContent="start">
          {isMonthMode && (
            <Fade in>
              <Grid item xs={12}>
                <MonthModeView
                  selectedDate={selectedDate}
                  rows={rows}
                  options={options}
                  onTaskClick={handleEventClick}
                  onCellClick={handleCellClick}
                  onDateChange={handleDateChange}
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
                  rows={rows}
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
        <EventDialogs
          eventDialogItem={eventDialogItem}
          eventDialogOpen={eventDialogOpen}
          setEventDialogOpen={setEventDialogOpen}
          setDataReloadCounter={setDataReloadCounter}
        />
      </Paper>
    </Fragment>
  );
}

const EventDialogs = ({
  eventDialogItem,
  eventDialogOpen,
  setEventDialogOpen,
  setDataReloadCounter,
}: any) => {
  const navigate = useNavigate();

  const [doneObject, setDoneObject] = useState<{
    calendarAnchor: any;
    objectTable: null | string;
    objectId: number;
    dateLimit: any;
  }>({
    calendarAnchor: null,
    objectTable: null,
    objectId: 0,
    dateLimit: null,
  });

  const openDateSelector = Boolean(doneObject.calendarAnchor);

  const handleOpenDateSelector = (
    event: any,
    objectTable: string,
    objectId: number,
    dateLimit: any
  ) => {
    event.preventDefault();
    setDoneObject({
      calendarAnchor: event.currentTarget,
      objectTable: objectTable,
      objectId: objectId,
      dateLimit: dateLimit,
    });
  };

  const handleCloseDateSelector = () => {
    setDoneObject({
      calendarAnchor: null,
      objectTable: null,
      objectId: 0,
      dateLimit: null,
    });
  };

  // ###

  const disabledDates = (date: any) => {
    if (!doneObject.dateLimit) {
      return false;
    }

    const isoLimitDate = new Date(doneObject.dateLimit);

    // Deshabilitar todas las fechas anteriores a la fecha tope
    return date < isoLimitDate;
  };

  const [loading, setLoading] = useState(false);

  const handleDoneDateSelect = async (newValue: any) => {
    setLoading(true);
    try {
      const isoDate = newValue.toISOString(); // Convertir la fecha a formato ISO 8601
      let updateData = {
        doneDate: isoDate,
      };

      let res;
      if (doneObject.objectTable === "crop_event") {
        res = await setDoneCropEvent(updateData, doneObject.objectId);
      } else if (doneObject.objectTable === "crop_stage") {
        res = await setFinishedCropStage(updateData, doneObject.objectId);
      }

      if (res === 200) {
        // Increment the data reload counter to trigger a data refresh
        setDataReloadCounter((prevCounter: number) => prevCounter + 1);

        setSnackBar(eventSuccessSnackBar);
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
    handleCloseDateSelector();
    setEventDialogOpen(false);
  };

  //#endregion

  //#region Snackbar

  type MySnackBarProps = {
    open: boolean;
    severity: AlertColor | undefined;
    msg: string;
  };
  const [snackBar, setSnackBar] = useState<MySnackBarProps>({
    open: false,
    severity: undefined,
    msg: "",
  });

  const eventSuccessSnackBar: MySnackBarProps = {
    open: true,
    severity: "success",
    msg: "Tarea realizada!",
  };

  const errorSnackBar: MySnackBarProps = {
    open: true,
    severity: "error",
    msg: "Algo ha fallado.",
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar((prevObject) => ({
      ...prevObject,
      open: false,
    }));
  };

  //#endregion

  const {
    id,
    name,
    crop_id,
    landplot,
    species_name,
    stage_name,
    due_date,
    done_date,
    min_date,
  } = eventDialogItem;

  return (
    <Fragment>
      <Dialog
        open={eventDialogOpen}
        onClose={
          openDateSelector
            ? () => handleCloseDateSelector()
            : () => setEventDialogOpen(false)
        }
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {openDateSelector ? (
          <DateCalendar
            showDaysOutsideCurrentMonth
            shouldDisableDate={disabledDates}
            onChange={(newValue: any, selectionState: any) => {
              if (selectionState === "finish") {
                handleDoneDateSelect(newValue);
              }
            }}
          />
        ) : (
          <Fragment>
            <DialogTitle id="alert-dialog-title">{name}</DialogTitle>
            <DialogContent>
              <p>
                Parcela N° {landplot} - {species_name}
              </p>
              <p>Etapa: {stage_name}</p>
              <p>Fecha estimada: {due_date}</p>
              {done_date ? (
                <p>Fecha de realización: {done_date}</p>
              ) : (
                <Fragment>
                  <Typography mt={2} mr={1}>
                    {"Fecha de realización: "}
                  </Typography>

                  <TextField
                    disabled
                    variant="standard"
                    label="Marcar como realizado"
                    onClick={(e) => {
                      let objectTable = eventDialogItem.class
                        ? "crop_stage"
                        : "crop_event";
                      handleOpenDateSelector(e, objectTable, id, min_date);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <TodayIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Fragment>
              )}
            </DialogContent>
            <DialogActions
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button onClick={() => setEventDialogOpen(false)}>Cerrar</Button>
              <Button
                onClick={() => navigate(`/cropdetails/${crop_id}`)}
                autoFocus
              >
                Ver cultivo
              </Button>
            </DialogActions>
          </Fragment>
        )}
      </Dialog>
      <Fragment>
        <CircularProgressBackdrop loading={loading} />
        <SnackBarAlert
          handleSnackbarClose={handleSnackbarClose}
          msg={snackBar.msg}
          open={snackBar.open}
          severity={snackBar.severity}
        />
      </Fragment>
    </Fragment>
  );
};

export default Taskcalendar;
