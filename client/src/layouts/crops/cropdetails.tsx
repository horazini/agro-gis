import { Fragment, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import {
  addCropEvent,
  getCropById,
  setCropComment,
  setCropStageComment,
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
  PlaylistAdd as PlaylistAddIcon,
  AddComment as AddCommentIcon,
  RateReview as RateReviewIcon,
  PhotoSizeSelectActual,
} from "@mui/icons-material";
import {
  ButtonDatePicker,
  CircularProgressBackdrop,
  DialogComponent,
  MySnackBarProps,
  PageTitle,
  SnackBarAlert,
  StandardDatePicker,
  mySnackBars,
} from "../../components/customComponents";
import { ResourceNotFound } from "../app/nomatch";

import { format } from "date-fns";
import {
  TimeIntervalToReadableString,
  formatedDate,
  sumIntervalToDate,
} from "../../utils/functions";

const {
  eventSuccessSnackBar,
  eventAddSuccessSnackBar,
  commentSuccessSnackBar,
  errorSnackBar,
} = mySnackBars;

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

const CropLoader = () => {
  PageTitle("Cultivo");
  const params = useParams();
  const [loadError, setLoadError] = useState<boolean>(false);

  const [cropFeature, setCropFeature] = useState<Feature>();

  // Data refresh trigger
  const [dataReloadCounter, setDataReloadCounter] = useState(0);

  const refreshPage = () => {
    setDataReloadCounter((prevCounter: number) => prevCounter + 1);
  };

  const loadCrop = async (cropId: number) => {
    try {
      const data = await getCropById(cropId);
      setCropFeature(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const cropId = Number(params.id);
    if (!isNaN(cropId)) {
      loadCrop(cropId);
    } else {
      setLoadError(true);
    }
  }, [params.id, dataReloadCounter]);

  return cropFeature ? (
    <CropDetails cropFeature={cropFeature} refreshPage={refreshPage} />
  ) : loadError ? (
    <ResourceNotFound />
  ) : null;
};

const CropDetails = ({
  cropFeature,
  refreshPage,
}: {
  cropFeature: Feature;
  refreshPage: () => void;
}) => {
  return (
    <Box
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>
        {cropFeature?.properties?.crop.finish_date
          ? "Cultivo finalizado"
          : "Cultivo en curso"}{" "}
        - Parcela N.° {cropFeature?.properties?.landplot.id} -{" "}
        {cropFeature?.properties?.species.name}
      </h1>
      <SentinelSnapshoter landplot={cropFeature} />

      {cropFeature && (
        <CropInfo cropData={cropFeature.properties} refreshPage={refreshPage} />
      )}
    </Box>
  );
};

const CropInfo = ({ cropData, refreshPage }: any) => {
  const { crop, landplot, species, stages } = cropData;

  const navigate = useNavigate();

  //#region fetch, await and snackbar

  const [snackBar, setSnackBar] = useState<MySnackBarProps>({
    open: false,
    severity: undefined,
    msg: "",
  });

  const [loading, setLoading] = useState(false);

  const HandlePutData = async (
    awaitFunction: () => Promise<number>,
    successSnackBar: MySnackBarProps,
    onSuccess?: () => void
  ) => {
    setLoading(true);
    try {
      const res = await awaitFunction();

      if (res === 200) {
        onSuccess && onSuccess();
        refreshPage();
        setSnackBar(successSnackBar);
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box>
        <h2>Parcela:</h2>
        <Box style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Parcela N.° {landplot.id}</p>
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate(`/landplots/${landplot.id}`)}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <h2>Cultivo:</h2>
          </Box>

          <Button
            variant={"contained"}
            color="primary"
            onClick={() => navigate(`/landplots/${landplot.id}/snapshots`)}
            style={{ marginLeft: ".5rem" }}
            startIcon={<PhotoSizeSelectActual />}
          >
            Ver snapshots
          </Button>
        </Box>
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
        <CommentsSection
          comments={crop.comments}
          HandlePutData={HandlePutData}
          objectTable={"crop"}
          objectId={crop.id}
        />
        <StagesList stages={stages} HandlePutData={HandlePutData} />
      </Box>
      {stages[stages.length - 1].finish_date && !crop.finish_date ? (
        <FinalHarvestReport
          cropId={crop.id}
          minDate={stages[stages.length - 1].finish_date}
          HandlePutData={HandlePutData}
        />
      ) : null}

      <Fragment>
        <CircularProgressBackdrop loading={loading} />
        <SnackBarAlert
          setSnackBar={setSnackBar}
          msg={snackBar.msg}
          open={snackBar.open}
          severity={snackBar.severity}
        />
      </Fragment>
    </Box>
  );
};

const StagesList = ({ stages, HandlePutData }: any) => {
  const [open, setOpen] = useState(-1);

  return (
    <Box>
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
              } = stage;
              const formatedEstimatedTime = TimeIntervalToReadableString(
                species_growth_stage_estimated_time
              );
              return (
                <Fragment key={id}>
                  <TableRow sx={{ "& td": { border: 0 } }}>
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
                          <StageInfo
                            stage={stage}
                            HandlePutData={HandlePutData}
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
    </Box>
  );
};

const CommentsSection = ({
  comments,
  HandlePutData,
  objectTable,
  objectId,
  start_date,
}: any) => {
  const [textFieldOpen, setTextFieldOpen] = useState<boolean>(false);

  const [newComment, setNewComment] = useState<string>(comments || "");

  const handleSubmitComments = async () => {
    const sentData = {
      comments: newComment,
    };
    if (objectTable === "crop_stage") {
      await HandlePutData(
        () => setCropStageComment(sentData, objectId),
        commentSuccessSnackBar,
        setTextFieldOpen(false)
      );
    } else if (objectTable === "crop") {
      await HandlePutData(
        () => setCropComment(sentData, objectId),
        commentSuccessSnackBar,
        setTextFieldOpen(false)
      );
    }
  };

  const isStageForm = objectTable === "crop_stage";
  const maxLength = isStageForm ? 500 : 5000;
  return (
    <Fragment>
      {textFieldOpen ? (
        <Box>
          <h2>Comentarios:</h2>
          <TextField
            inputProps={{ maxLength: maxLength }}
            id="comments"
            multiline
            fullWidth
            variant="filled"
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              sx={{ mt: 3, ml: 1 }}
              onClick={() => setTextFieldOpen(false)}
            >
              Cancelar
            </Button>

            <DialogComponent
              component={
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 3, ml: 1 }}
                  disabled={newComment === comments}
                >
                  Guardar comentarios
                </Button>
              }
              dialogTitle={"¿Confirmar comentarios?"}
              dialogSubtitle={
                isStageForm
                  ? "Se registrarán los comentarios para esta etapa."
                  : "Se registrarán los comentarios para el cultivo."
              }
              disabled={newComment === comments}
              onConfirm={() => handleSubmitComments()}
            />
          </Box>
        </Box>
      ) : comments ? (
        <Fragment>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Comentarios:</h2>
            <Button variant="outlined" onClick={() => setTextFieldOpen(true)}>
              <RateReviewIcon sx={{ mr: 1 }} />
              Editar comentarios
            </Button>
          </Box>
          <p>{comments}</p>
        </Fragment>
      ) : (
        <Button
          variant="outlined"
          disabled={objectTable === "crop_stage" && !start_date}
          onClick={() => setTextFieldOpen(true)}
        >
          <AddCommentIcon sx={{ mr: 1 }} />
          Agregar comentarios
        </Button>
      )}
    </Fragment>
  );
};

const StageInfo = ({ stage, HandlePutData }: any) => {
  const { events, comments, start_date, finish_date } = stage;

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

  const handleDoneDateSelect = async (
    date: any,
    recordTable: string,
    id: number
  ) => {
    if (id === undefined) {
      return;
    }
    const isoDate = date.toISOString();
    let updateData = {
      doneDate: isoDate,
    };

    if (recordTable === "crop_event") {
      await HandlePutData(
        () => setDoneCropEvent(updateData, id),
        eventSuccessSnackBar
      );
    } else if (recordTable === "crop_stage") {
      await HandlePutData(
        () => setFinishedCropStage(updateData, id),
        eventSuccessSnackBar
      );
    }
  };

  //#region Stage finishing handling

  const [doneStageId, setDoneStageId] = useState(0);
  const [doneStageMinDate, setDoneStageMinDate] = useState(null);

  const handleStageFinishOpen = (stage: any) => {
    setDoneStageId(stage.id);

    let dateLimit = stage.start_date;

    for (const event of stage.events) {
      const isoDateLimit = new Date(dateLimit);

      if (event.periodic_events) {
        for (const periodic_event of event.periodic_events) {
          const isoEventDate = new Date(periodic_event.done_date);
          if (isoEventDate > isoDateLimit) {
            dateLimit = periodic_event.done_date;
          }
        }
      } else {
        const isoEventDate = new Date(event.done_date);
        if (isoEventDate > isoDateLimit) {
          dateLimit = event.done_date;
        }
      }
    }

    setDoneStageMinDate(dateLimit);
  };

  const handleStageFinishDateSelect = (date: Date) => {
    handleDoneDateSelect(date, "crop_stage", doneStageId);
  };

  //#endregion

  const sorteredEvents = sortedEvents(events);

  return (
    <Fragment>
      <CommentsSection
        comments={comments}
        HandlePutData={HandlePutData}
        objectTable={"crop_stage"}
        objectId={stage.id}
        start_date={stage.start_date}
      />
      <Box>
        <h2>Tareas:</h2>
        {sorteredEvents.length !== 0
          ? sortedEvents(events).map((event: any) => {
              return (
                <Box key={event.id || event.name} mb={2}>
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
                          start_date={start_date}
                          handleDoneDateSelect={handleDoneDateSelect}
                        />
                      ) : (
                        <PeriodicEvent
                          event={event}
                          start_date={start_date}
                          handleDoneDateSelect={handleDoneDateSelect}
                        />
                      )}
                    </Box>
                  </Card>
                </Box>
              );
            })
          : "Este etapa no registra tareas ni eventos."}
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
        mb={3}
        mr={1}
      >
        <NewTaskDialog stage={stage} HandlePutData={HandlePutData} />
        {!finish_date && start_date ? (
          <ButtonDatePicker
            label="Finalizar etapa"
            disabled={
              !stage.events.every(
                (event: GrowthEvent) =>
                  event.done_date !== null ||
                  event.species_growth_event_time_period !== null
              )
            }
            minDate={doneStageMinDate}
            onOpenDateSelector={() => handleStageFinishOpen(stage)}
            onDateSelect={handleStageFinishDateSelect}
          />
        ) : null}
      </Box>
    </Fragment>
  );
};

const NewTaskDialog = ({ stage, HandlePutData }: any) => {
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);

  const handleNewTaskCancel = () => {
    setNewTaskDialogOpen(false);
  };

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

  const params = useParams();
  const handleNewTaskConfirm = async () => {
    const newTaskSent = {
      ...newTask,
      estimatedDate: estimatedDate?.toISOString(),
      finishDate: finishDate?.toISOString(),
      cropId: params.id,
      stageId: stage.id,
    };
    await HandlePutData(
      () => addCropEvent(newTaskSent),
      eventAddSuccessSnackBar,
      () => setNewTaskDialogOpen(false)
    );
    setNewTask({
      name: "",
      description: "",
    });
    setEstimatedDate(null);
    setFinishDate(null);
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, ml: 1 }}
        disabled={!stage.start_date}
        onClick={() => setNewTaskDialogOpen(true)}
        startIcon={<PlaylistAddIcon />}
      >
        Añadir tarea
      </Button>
      <Dialog open={newTaskDialogOpen} onClose={handleNewTaskCancel}>
        <DialogTitle id="alert-dialog-title">Nueva tarea</DialogTitle>
        <DialogContent>
          <h4>Etapa: {stage.species_growth_stage_name}</h4>
          <TextField
            required
            variant="filled"
            label="Nombre"
            name="name"
            inputProps={{ maxLength: 100 }}
            value={newTask.name}
            onChange={handleEventChange}
          />
          <p> </p>

          <TextField
            variant="filled"
            label="Descripción"
            name="description"
            inputProps={{ maxLength: 500 }}
            fullWidth
            multiline
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
              minDate={stage.start_date}
              maxDate={stage.finish_date}
            />
          </Box>
          <Box display={"flex"} alignItems="center">
            <Typography mt={2} mr={1}>
              {"Fecha de realización: "}
            </Typography>

            <StandardDatePicker
              date={finishDate}
              setDate={setFinishDate}
              minDate={stage.start_date}
              maxDate={stage.finish_date}
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
    </Fragment>
  );
};

const UniqueEvent = ({ event, start_date, handleDoneDateSelect }: any) => {
  const formatedETFromStageStart = TimeIntervalToReadableString(
    event.species_growth_event_et_from_stage_start
  );

  const [doneEventId, setDoneEventId] = useState(0);

  const handleDateSelect = (date: Date) => {
    handleDoneDateSelect(date, "crop_event", doneEventId);
  };

  return (
    <Fragment>
      <h3>{event.name}</h3>
      {event.description ? (
        <Typography mt={2}>Descripción: {event.description}</Typography>
      ) : null}

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

                <StandardDatePicker
                  onOpenDateSelector={() => setDoneEventId(event.id)}
                  //date
                  onDateSelect={handleDateSelect}
                  minDate={start_date}
                  //maxDate
                  label="Marcar como realizado"
                />
              </Fragment>
            )}
          </Box>
        </Fragment>
      ) : event.done_date ? (
        <Typography mt={2}>
          {"Fecha de realización: "} {formatedDate(event.done_date)}
        </Typography>
      ) : event.species_growth_event_et_from_stage_start ? (
        <p>Tiempo desde incio de la etapa: {formatedETFromStageStart}</p>
      ) : null}
    </Fragment>
  );
};

const PeriodicEvent = ({ event, start_date, handleDoneDateSelect }: any) => {
  const formatedETFromStageStart = TimeIntervalToReadableString(
    event.species_growth_event_et_from_stage_start
  );

  const formatedTimePeriod = TimeIntervalToReadableString(
    event.species_growth_event_time_period
  );

  const periodicEvents = sortedEvents(event.periodic_events);

  const [doneEventId, setDoneEventId] = useState(0);

  const handleDateSelect = (date: Date) => {
    handleDoneDateSelect(date, "crop_event", doneEventId);
  };

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

        {event.description ? (
          <Typography mt={2}>Descripción: {event.description}</Typography>
        ) : null}
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

                    <StandardDatePicker
                      onOpenDateSelector={() => setDoneEventId(event.id)}
                      //date
                      onDateSelect={handleDateSelect}
                      minDate={start_date}
                      //maxDate
                      label="Marcar como realizado"
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

const FinalHarvestReport = ({ cropId, minDate, HandlePutData }: any) => {
  const [weight_in_tons, setWeight_in_tons] = useState<any>(0);

  const [date, setDate] = useState<Date | null>(null);

  const handleSubmitData = async () => {
    if (!date) {
      return;
    }

    const isoDate = date.toISOString();
    const sentData = {
      date: isoDate,
      weight_in_tons: weight_in_tons,
    };

    await HandlePutData(
      () => setFinishedCrop(sentData, cropId),
      eventSuccessSnackBar
    );
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
                onChange={(e) => {
                  var value = parseInt(e.target.value, 10);
                  if (value > 9999999999) {
                    return;
                  } else {
                    setWeight_in_tons(value);
                  }
                }}
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
    </Box>
  );
};
export default CropLoader;
