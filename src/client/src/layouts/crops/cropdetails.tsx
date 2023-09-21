import { Fragment, useEffect, useState } from "react";
import {
  MapContainer,
  Circle,
  LayerGroup,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  getCropById,
  setDoneCropEvent,
  setFinishedCropStage,
} from "../../services/services";
import { Feature } from "geojson";

import {
  position,
  LayerControler,
  FormattedArea,
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
import { useParams } from "react-router-dom";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Today as TodayIcon,
  PlaylistAdd as PlaylistAddIcon,
} from "@mui/icons-material";
import {
  CircularProgressBackdrop,
  SnackBarAlert,
  TimeIntervalToReadableString,
  formatedDate,
} from "../../components/customComponents";

import { DateCalendar } from "@mui/x-date-pickers";
import PageTitle from "../../components/title";

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
      <MapView cropFeature={cropFeature} />

      {cropFeature && (
        <CropInfo
          feature={cropFeature}
          setDataReloadCounter={setDataReloadCounter}
        />
      )}
    </Box>
  );
};

const MapView = ({ cropFeature }: any) => {
  const CustomLayer = ({ feature }: any) => {
    const { landplot } = feature.properties;
    const { type, coordinates } = feature.geometry;

    const [isHighlighted, setIsHighlighted] = useState<boolean>(false);

    const handleLayerMouseOver = () => {
      setIsHighlighted(true);
    };

    const handleLayerMouseOut = () => {
      setIsHighlighted(false);
    };

    const pathOptions = {
      color: isHighlighted ? "#33ff33" : "#3388ff",
    };

    const eventHandlers = {
      mouseover: handleLayerMouseOver,
      mouseout: handleLayerMouseOut,
    };

    if (type === "Polygon") {
      const LatLngsCoordinates = coordinates[0].map(([lng, lat]: number[]) => [
        lat,
        lng,
      ]);
      return (
        <Polygon
          positions={LatLngsCoordinates}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        />
      );
    } else if (type === "Point" && landplot.subType === "Circle") {
      return (
        <Circle
          center={coordinates}
          radius={landplot.radius}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        />
      );
    }
    return null;
  };

  function FlyToLayer() {
    let coords: LatLngExpression = position;
    if (cropFeature?.geometry.type === "Point") {
      coords = cropFeature.geometry.coordinates as LatLngExpression;
    }
    if (cropFeature?.geometry.type === "Polygon") {
      const LatLngsCoordinates: LatLngExpression[] =
        cropFeature.geometry.coordinates[0].map(([lng, lat]: number[]) => [
          lat,
          lng,
        ]);

      coords = L.polygon(LatLngsCoordinates).getBounds().getCenter();
    }
    const map = useMapEvents({
      layeradd() {
        map.flyTo(coords, 13);
      },
    });
    return null;
  }

  return (
    <MapContainer center={position} zoom={7}>
      <LayerControler />
      <FlyToLayer />
      <LayerGroup>
        {cropFeature && <CustomLayer feature={cropFeature} />}
      </LayerGroup>
    </MapContainer>
  );
};

const CropInfo = ({ feature, setDataReloadCounter }: any) => {
  const { crop, landplot, species, stages } = feature.properties;

  const [open, setOpen] = useState(-1);

  return (
    <Box>
      <Box>
        <h2>Parcela:</h2>
        <p>Parcela N.° {landplot.id}</p>
        {landplot.description && <p>Descripción: {landplot.description}</p>}
        {landplot.area && <p>Área: {FormattedArea(landplot.area)} </p>}
        {landplot.radius && <p>Radio: {landplot.radius.toFixed(2)} m.</p>}
      </Box>
      <Box>
        <h2>Cultivo:</h2>
        <p>Especie: {species.name}</p>
        {crop.description && <p>description: {crop.description}</p>}
        <p>Fecha de plantación: {formatedDate(crop.start_date)}</p>
        {crop.finish_date && (
          <p>Fecha de cosecha: {formatedDate(crop.finish_date)}</p>
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
                      {finish_date && formatedDate(finish_date)}
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
    </Box>
  );
};

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

  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    due_date: null,
    done_date: null,
  });

  const handleEventChange = (
    event:
      | SelectChangeEvent<string>
      | React.ChangeEvent<{ name: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);

  const handleNewTaskClick = () => {
    setNewTaskDialogOpen(true);
  };

  const handleNewTaskCancel = () => {
    //clear
    setNewTaskDialogOpen(false);
  };

  const handleNewTaskConfirm = () => {
    //...
    //clear
    setNewTaskDialogOpen(false);
  };

  const TaskDialog = () => {
    return (
      <Dialog
        open={newTaskDialogOpen}
        onClose={handleNewTaskCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Nueva tarea</DialogTitle>
        <DialogContent>
          <p>Etapa: {stage.species_growth_stage_name}</p>
          <TextField
            required
            label="Nombre"
            name="name"
            value={newTask.name}
            onChange={handleEventChange}
          />
          <p> </p>

          <TextField
            variant="outlined"
            label="Descripción"
            name="description"
            value={newTask.description}
            onChange={handleEventChange}
          />
          <p>Fecha estimada: </p>
          <p>Fecha de realización: </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewTaskCancel}>Cancelar</Button>
          <Button onClick={handleNewTaskConfirm} autoFocus>
            Confirmar
          </Button>
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
          disabled
          //disabled={!stage.start_date}
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
          );
        })
      ) : (
        <p>Tiempo desde incio de la etapa: {formatedETFromStageStart}</p>
      )}
    </Fragment>
  );
};

export default CropDetails;
