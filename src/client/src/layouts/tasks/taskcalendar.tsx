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
  TextField,
  Typography,
  Box,
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
import { useNavigate } from "react-router-dom";
import {
  getAllCalendarTenantTasks,
  getFulfilledCropsCalendarTenantTasks,
  getOngoingCropsCalendarTenantTasks,
  setDoneCropEvent,
  setFinishedCrop,
  setFinishedCropStage,
} from "../../utils/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  CircularProgressBackdrop,
  DialogComponent,
  MySnackBarProps,
  PageTitle,
  SnackBarAlert,
  StandardDatePicker,
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
      const tasks = await getOngoingCropsCalendarTenantTasks(id);
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

  const [loading, setLoading] = useState(false);

  const handleDoneDateSelect = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const isoDate = selectedDate.toISOString(); // Convertir la fecha a formato ISO 8601
      let updateData = {
        doneDate: isoDate,
      };

      let res;

      if (eventDialogItem.class === "stage_finish") {
        res = await setFinishedCropStage(updateData, eventDialogItem.id);
      } else {
        res = await setDoneCropEvent(updateData, eventDialogItem.id);
      }

      if (res === 200) {
        // Increment the data reload counter to trigger a data refresh
        setDataReloadCounter((prevCounter: number) => prevCounter + 1);

        setSnackBar(successSnackBar);
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
    setEventDialogOpen(false);
  };

  //#endregion

  //#region Snackbar

  const successSnackBar: MySnackBarProps = {
    open: true,
    severity: "success",
    msg: "Tarea realizada!",
  };

  const errorSnackBar: MySnackBarProps = {
    open: true,
    severity: "error",
    msg: "Algo ha fallado.",
  };

  const [snackBar, setSnackBar] = useState<MySnackBarProps>({
    open: false,
    severity: undefined,
    msg: "",
  });

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

  //#region crop finish vars

  const [date, setDate] = useState<Date | null>(null);
  const [weight_in_tons, setWeight_in_tons] = useState<any>(0);

  const handleSubmitCropFinish = async () => {
    if (!date) {
      return;
    }
    setLoading(true);
    try {
      const isoDate = date.toISOString();
      const sentData = {
        date: isoDate,
        weight_in_tons: weight_in_tons,
      };

      let res = await setFinishedCrop(sentData, eventDialogItem.id);

      if (res === 200) {
        setDataReloadCounter((prevCounter: number) => prevCounter + 1);
        setSnackBar(successSnackBar);
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
    setEventDialogOpen(false);
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
        open={
          eventDialogOpen &&
          (eventDialogItem.class !== "crop_finish" ||
            (done_date !== undefined && done_date !== null))
        }
        onClose={() => setEventDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography mt={2} mr={1}>
                  {"Fecha de realización: "}
                </Typography>

                <StandardDatePicker
                  label={"Marcar como realizado"}
                  minDate={min_date}
                  onDateSelect={handleDoneDateSelect}
                />
              </div>
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
      </Dialog>

      <Dialog
        open={
          eventDialogOpen &&
          eventDialogItem.class === "crop_finish" &&
          !done_date
        }
        onClose={() => setEventDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{name}</DialogTitle>
        <DialogContent>
          <p>
            Parcela N° {landplot} - {species_name}
          </p>

          <p>Fecha estimada: {due_date}</p>

          <Box display={"flex"} alignItems="center">
            <Typography mt={2} mr={1}>
              {"Fecha de finalización: "}
            </Typography>

            <StandardDatePicker
              date={date}
              setDate={setDate}
              label={"Fecha de finalización"}
              minDate={min_date}
            />
          </Box>

          <Box display={"flex"} alignItems="center">
            <Typography>{"Peso final en toneladas: "}</Typography>{" "}
            <TextField
              required
              name="weight_in_tons"
              value={weight_in_tons}
              onChange={(e) => setWeight_in_tons(e.target.value)}
              variant="standard"
              sx={{ margin: 1 }}
              type="number"
              onKeyPress={(event) => {
                if (
                  event?.key === "-" ||
                  event?.key === "+" ||
                  event?.key === "." ||
                  event?.key === "e"
                ) {
                  event.preventDefault();
                }
              }}
              InputProps={{
                inputProps: { min: 0 },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button onClick={() => navigate(`/cropdetails/${crop_id}`)} autoFocus>
            Ver cultivo
          </Button>
          <DialogComponent
            component={
              <Button variant="contained" disabled={!date}>
                Confirmar
              </Button>
            }
            disabled={!date}
            dialogTitle={"¿Desea confirmar los siguientes datos?"}
            dialogSubtitle={
              <div>
                <p>
                  Fecha de finalización:{" "}
                  {date ? format(date, "dd/MM/yyyy") : ""}
                </p>
                <p>Peso final: {weight_in_tons} toneladas </p>
              </div>
            }
            onConfirm={() => handleSubmitCropFinish()}
          />
        </DialogActions>
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
