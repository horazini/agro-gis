import { Fragment, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import {
  getCropById,
  setDoneCropEvent,
  setFinishedCrop,
  setFinishedCropStage,
} from "../../utils/services";
import { Feature } from "geojson";

import {
  FormattedArea,
  SentinelSnapshoter,
} from "../../components/mapcomponents";
import {
  AlertColor,
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  Paper,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Today as TodayIcon,
  PlaylistAdd as PlaylistAddIcon,
} from "@mui/icons-material";
import {
  CircularProgressBackdrop,
  DialogComponent,
  PageTitle,
  SnackBarAlert,
  StandardDatePicker,
} from "../../components/customComponents";

import { DateCalendar } from "@mui/x-date-pickers";
import { format } from "date-fns";
import {
  TimeIntervalToReadableString,
  formatedDate,
  sumIntervalToDate,
} from "../../utils/functions";

function sortedEvents(
  events: { due_date: string; done_date: string | undefined }[]
) {
  const sortedEvents = events.sort((a, b) => {
    const aDate = a.done_date || a.due_date;
    const bDate = b.done_date || b.due_date;

    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  return sortedEvents;
}

const CropDetails = () => {
  PageTitle("Cultivo");
  const params = useParams();

  const [cropFeature, setCropFeature] = useState<Feature>();

  // Data refresh trigger
  const [dataReloadCounter, setDataReloadCounter] = useState(0);

  const loadCrop = async (id: string) => {
    try {
      const data = await getCropById(id);
      setCropFeature(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadCrop(params.id);
    }
  }, [params.id, dataReloadCounter]);

  return (
    <Box
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>
        Cultivo en curso - Parcela N.° {cropFeature?.properties?.landplot.id}
      </h1>
      <SentinelSnapshoter landplot={cropFeature} />

      {cropFeature && (
        <CropInfo
          feature={cropFeature}
          setDataReloadCounter={setDataReloadCounter}
        />
      )}
    </Box>
  );
};

const CropInfo = ({ feature, setDataReloadCounter }: any) => {
  const { crop, landplot, species, stages } = feature.properties;

  const [open, setOpen] = useState(-1);

  const navigate = useNavigate();
  return (
    <Box>
      <Box>
        <h2>Parcela:</h2>
        <Box style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Parcela N.° {landplot.id}</p>
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate(`/landplotdetails/${landplot.id}`)}
            >
              detalles de la parcela
            </Button>
          </Box>
        </Box>
        {landplot.description && <p>Descripción: {landplot.description}</p>}
        {landplot.area && <p>Área: {FormattedArea(landplot.area)} </p>}
        {landplot.radius && <p>Radio: {landplot.radius.toFixed(2)} m.</p>}
      </Box>
      <Box>
        <h2>Cultivo:</h2>
        <p>Especie: {species.name}</p>
        {crop.description && <p>description: {crop.description}</p>}
        <p>Fecha de inicio: {formatedDate(crop.start_date)}</p>
        {crop.finish_date ? (
          <>
            <p>Fecha de finalización: {formatedDate(crop.finish_date)}</p>
            <p>Peso total: {crop.weight_in_tons} toneladas</p>
          </>
        ) : (
          <p>
            Fecha de finalización estimada:{" "}
            {formatedDate(crop.estimatedCropFinishDate)}
          </p>
        )}
      </Box>
      <h3>Etapas de cultivo:</h3>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Etapa</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Tiempo estimado</TableCell>
              <TableCell>Fecha de inicio</TableCell>
              <TableCell>Fecha de finalización</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stages.map((stage: any) => {
              const {
                id,
                species_growth_stage_name,
                species_growth_stage_description,
                species_growth_stage_estimated_time,
                start_date,
                finish_date,
                comments,
              } = stage;
              const formatedEstimatedTime = TimeIntervalToReadableString(
                species_growth_stage_estimated_time
              );
              return (
                <Fragment key={id}>
                  <TableRow
                    //onClick={() => setOpen(open === id ? -1 : id)}
                    sx={{ "& > *": { borderBottom: "unset" } }}
                  >
                    <TableCell>{species_growth_stage_name}</TableCell>
                    <TableCell>{species_growth_stage_description}</TableCell>
                    <TableCell>{formatedEstimatedTime}</TableCell>
                    <TableCell>
                      {start_date && formatedDate(start_date)}
                    </TableCell>
                    <TableCell>
                      {finish_date
                        ? formatedDate(finish_date)
                        : start_date
                        ? "Estimado: " +
                          formatedDate(
                            sumIntervalToDate(
                              start_date,
                              species_growth_stage_estimated_time
                            ).toISOString()
                          )
                        : null}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(open === id ? -1 : id)}
                        style={{ marginLeft: ".5rem" }}
                      >
                        {open === id ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={6}
                    >
                      <Collapse in={open === id} timeout="auto" unmountOnExit>
                        <Box>
                          <p>Comentarios: {comments}</p>
                          <StageInfo
                            stage={stage}
                            setDataReloadCounter={setDataReloadCounter}
                          />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {stages[stages.length - 1].finish_date && !crop.finish_date ? (
        <FinalHarvestReport
          cropId={crop.id}
          minDate={stages[stages.length - 1].finish_date}
          setDataReloadCounter={setDataReloadCounter}
        />
      ) : null}
    </Box>
  );
};

//#region Snackbar

type MySnackBarProps = {
  open: boolean;
  severity: AlertColor | undefined;
  msg: string;
};

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

//#endregion

const StageInfo = ({ stage, setDataReloadCounter }: any) => {
  const { events, start_date, finish_date } = stage;

  //#region Done task/stage data

  type GrowthEvent = {
    id: number;
    species_growth_event_id: number;
    name: string;
    description: string;
    species_growth_event_et_from_stage_start: string;
    species_growth_event_time_period: string;
    due_date: string;
    done_date?: string;
  };

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

  //#endregion

  const handleStageFinishClick = (event: any, stage: any) => {
    let dateLimit = stage.start_date;

    for (const event of stage.events) {
      const isoDateLimit = new Date(dateLimit);
      const isoEventDate = new Date(event.done_date);
      if (isoEventDate > isoDateLimit) {
        dateLimit = event.done_date;
      }
    }

    handleOpenDateSelector(event, "crop_stage", stage.id, dateLimit);
  };

  //#region Snackbar

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
  };

  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);

  const handleNewTaskClick = () => {
    setNewTaskDialogOpen(true);
  };

  const handleNewTaskCancel = () => {
    //clear
    setNewTaskDialogOpen(false);
  };

  const TaskDialog = () => {
    const [newTask, setNewTask] = useState({
      name: "",
      description: "",
    });

    const handleEventChange = (
      event:
        | SelectChangeEvent<string>
        | React.ChangeEvent<{ name: string; value: unknown }>
    ) => {
      const { name, value } = event.target;
      setNewTask({ ...newTask, [name]: value });
    };

    const [estimatedDate, setEstimatedDate] = useState<Date | null>(null);

    const [finishDate, setFinishDate] = useState<Date | null>(null);

    const handleNewTaskConfirm = () => {
      const newTaskSent = {
        ...newTask,
        estimatedDate: estimatedDate?.toISOString(),
        finishDate: finishDate?.toISOString(),
      };
      console.log(newTaskSent);
      setNewTaskDialogOpen(false);
    };

    return (
      <Dialog
        open={newTaskDialogOpen}
        onClose={handleNewTaskCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Nueva tarea</DialogTitle>
        <DialogContent>
          <h4>Etapa: {stage.species_growth_stage_name}</h4>
          <TextField
            required
            variant="filled"
            label="Nombre"
            name="name"
            value={newTask.name}
            onChange={handleEventChange}
          />
          <p> </p>

          <TextField
            variant="filled"
            label="Descripción"
            name="description"
            value={newTask.description}
            onChange={handleEventChange}
          />

          <Box display={"flex"} alignItems="center">
            <Typography mt={2} mr={1}>
              {"Fecha estimada: "}
            </Typography>

            <StandardDatePicker
              date={estimatedDate}
              setDate={setEstimatedDate}
              minDate={start_date}
              maxDate={finish_date}
            />
          </Box>
          <Box display={"flex"} alignItems="center">
            <Typography mt={2} mr={1}>
              {"Fecha de realización: "}
            </Typography>

            <StandardDatePicker
              date={finishDate}
              setDate={setFinishDate}
              minDate={start_date}
              maxDate={finish_date}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewTaskCancel}>Cancelar</Button>

          <DialogComponent
            component={
              <Button
                disabled={!newTask.name || (!estimatedDate && !finishDate)}
              >
                Confirmar
              </Button>
            }
            dialogTitle={"¿Confirmar tarea?"}
            dialogSubtitle={"Se añadirá la nueva tarea a la etapa."}
            disabled={!newTask.name || (!estimatedDate && !finishDate)}
            onConfirm={() => handleNewTaskConfirm()}
          />
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Fragment>
      <Box>
        <h2>Tareas:</h2>
        {sortedEvents(events).map((event: any) => {
          return (
            <Box key={event.id} mb={2}>
              <Card
                variant="outlined"
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : null,
                }}
              >
                <Box ml={2} mb={2} mr={2}>
                  {event.id ? (
                    <UniqueEvent
                      event={event}
                      handleOpenDateSelector={handleOpenDateSelector}
                      start_date={start_date}
                    />
                  ) : (
                    <PeriodicEvent
                      event={event}
                      handleOpenDateSelector={handleOpenDateSelector}
                      start_date={start_date}
                    />
                  )}
                </Box>
              </Card>
            </Box>
          );
        })}
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
        mb={3}
        mr={1}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, ml: 1 }}
          disabled={!stage.start_date}
          onClick={() => handleNewTaskClick()}
          startIcon={<PlaylistAddIcon />}
        >
          Añadir tarea
        </Button>
        {!finish_date && start_date ? (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, ml: 1 }}
            disabled={
              !stage.events.every(
                (event: GrowthEvent) =>
                  event.done_date !== null ||
                  event.species_growth_event_time_period !== null
              )
            }
            onClick={(e) => handleStageFinishClick(e, stage)}
            endIcon={<TodayIcon />}
          >
            Finalizar etapa
          </Button>
        ) : null}
      </Box>
      <Fragment>
        <Menu
          id="date-menu"
          anchorEl={doneObject.calendarAnchor}
          open={openDateSelector}
          onClose={() => handleCloseDateSelector()}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <DateCalendar
            showDaysOutsideCurrentMonth
            shouldDisableDate={disabledDates}
            onChange={(newValue: any, selectionState: any) => {
              if (selectionState === "finish") {
                handleDoneDateSelect(newValue);
              }
            }}
          />
        </Menu>

        <CircularProgressBackdrop loading={loading} />
        <SnackBarAlert
          handleSnackbarClose={handleSnackbarClose}
          msg={snackBar.msg}
          open={snackBar.open}
          severity={snackBar.severity}
        />
      </Fragment>
      <TaskDialog />
    </Fragment>
  );
};

const UniqueEvent = ({ event, handleOpenDateSelector, start_date }: any) => {
  const formatedETFromStageStart = TimeIntervalToReadableString(
    event.species_growth_event_et_from_stage_start
  );

  return (
    <Fragment>
      <h3>{event.name}</h3>
      <Typography mt={2}>Descripción: {event.description}</Typography>

      {event.due_date ? (
        <Fragment>
          <Typography mt={2}>
            Fecha estimada: {formatedDate(event.due_date)}
          </Typography>
          <Box display={"flex"} alignItems="center">
            {event.done_date ? (
              <Typography mt={2}>
                {"Fecha de realización: "} {formatedDate(event.done_date)}
              </Typography>
            ) : (
              <Fragment>
                <Typography mt={2} mr={1}>
                  {"Fecha de realización: "}
                </Typography>

                <TextField
                  disabled
                  variant="standard"
                  label="Marcar como realizado"
                  onClick={(e) =>
                    handleOpenDateSelector(
                      e,
                      "crop_event",
                      event.id,
                      start_date
                    )
                  }
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
          </Box>
        </Fragment>
      ) : (
        <p>Tiempo desde incio de la etapa: {formatedETFromStageStart}</p>
      )}
    </Fragment>
  );
};

const PeriodicEvent = ({ event, handleOpenDateSelector, start_date }: any) => {
  const formatedETFromStageStart = TimeIntervalToReadableString(
    event.species_growth_event_et_from_stage_start
  );

  const formatedTimePeriod = TimeIntervalToReadableString(
    event.species_growth_event_time_period
  );

  const periodicEvents = sortedEvents(event.periodic_events);

  return (
    <Fragment>
      <Box marginBottom={2}>
        <Box fontStyle={{ display: "flex" }}>
          <h3>{event.name} </h3>
          <Chip
            label={"Periodo de repetición: " + formatedTimePeriod}
            variant="outlined"
            color="info"
            size="small"
            style={{ marginLeft: 5, marginTop: 16 }}
          />
        </Box>

        <Typography mt={2}>Descripción: {event.description}</Typography>
      </Box>

      <Divider />

      {periodicEvents[0].due_date ? (
        periodicEvents.map((event: any, index) => {
          return (
            <Fragment key={index}>
              {event.done_date ? (
                <Typography mt={2}>
                  {"Fecha de realización: "} {formatedDate(event.done_date)}
                </Typography>
              ) : (
                <Fragment>
                  <Typography mt={2}>
                    Fecha estimada: {formatedDate(event.due_date)}
                  </Typography>
                  <Box display={"flex"} alignItems="center">
                    <Typography mt={2} mr={1}>
                      {"Fecha de realización: "}
                    </Typography>

                    <TextField
                      disabled
                      variant="standard"
                      label="Marcar como realizado"
                      onClick={(e) =>
                        handleOpenDateSelector(
                          e,
                          "crop_event",
                          event.id,
                          start_date
                        )
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">
                            <TodayIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Fragment>
              )}
            </Fragment>
          );
        })
      ) : (
        <p>Tiempo desde incio de la etapa: {formatedETFromStageStart}</p>
      )}
    </Fragment>
  );
};

const FinalHarvestReport = ({ cropId, minDate, setDataReloadCounter }: any) => {
  const [weight_in_tons, setWeight_in_tons] = useState<any>(0);

  const [date, setDate] = useState<Date | null>(null);

  // submit data

  const [loading, setLoading] = useState(false);

  const handleSubmitData = async () => {
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

      let res = await setFinishedCrop(sentData, cropId);

      if (res === 200) {
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

  return (
    <Box>
      <h2>Reporte final de cosecha:</h2>
      <Paper
        variant="outlined"
        component={Paper}
        sx={{ mt: 3, p: { xs: 2, md: 3 } }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box display={"flex"} alignItems="center" sx={{ m: 1 }}>
              <Typography mt={2} mr={1}>
                {"Fecha de finalización: "}
              </Typography>

              <StandardDatePicker
                date={date}
                setDate={setDate}
                label={"Fecha de finalización"}
                minDate={minDate}
              />
            </Box>

            <Box display={"flex"} alignItems="center" sx={{ m: 1 }}>
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
          </Grid>
        </Grid>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
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
            onConfirm={() => handleSubmitData()}
          />
        </Box>
      </Paper>
      <CircularProgressBackdrop loading={loading} />
      <SnackBarAlert
        handleSnackbarClose={handleSnackbarClose}
        msg={snackBar.msg}
        open={snackBar.open}
        severity={snackBar.severity}
      />
    </Box>
  );
};
export default CropDetails;
