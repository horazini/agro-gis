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
import TodayIcon from "@mui/icons-material/Today";

import {
  position,
  LayerControler,
  FormattedArea,
} from "../../components/mapcomponents";
import {
  AlertColor,
  Box,
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  Menu,
  Paper,
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
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  CircularProgressBackdrop,
  SnackBarAlert,
  TimeIntervalToReadableString,
} from "../../components/customComponents";

import { DateCalendar } from "@mui/x-date-pickers";
import PageTitle from "../../components/title";

type GrowthEvent = {
  due_date: string;
  done_date?: string;
};

const MapView = () => {
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

  const [open, setOpen] = useState(-1);
  const CropInfo = ({ feature }: any) => {
    const { crop, landplot, species, stages } = feature.properties;
    const startDate = new Date(crop.start_date).toLocaleDateString("en-GB");
    const finishDate = new Date(crop.finish_date || "").toLocaleDateString(
      "en-GB"
    );

    const formattedArea = FormattedArea(landplot.area);

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
          setDataReloadCounter((prevCounter) => prevCounter + 1);
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

    const disabledDates = (date: any) => {
      if (!doneObject.dateLimit) {
        return false;
      }

      const isoLimitDate = new Date(doneObject.dateLimit);

      // Deshabilitar todas las fechas anteriores a la fecha tope
      return date < isoLimitDate;
    };

    return (
      <Box>
        <Box>
          <h2>Parcela:</h2>
          <p>Parcela N.° {landplot.id}</p>
          {landplot.description && <p>Descripción: {landplot.description}</p>}
          {landplot.area && <p>Área: {formattedArea} </p>}
          {landplot.radius && <p>Radio: {landplot.radius.toFixed(2)} m.</p>}
        </Box>
        <Box>
          <h2>Cultivo:</h2>
          <p>Especie: {species.name}</p>
          {crop.description && <p>description: {crop.description}</p>}
          <p>Fecha de plantación: {startDate}</p>
          {crop.finish_date && <p>Fecha de cosecha: {finishDate}</p>}
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
                const formatedEstimatedTime = TimeIntervalToReadableString(
                  stage.species_growth_stage_estimated_time
                );

                const startDate = new Date(stage.start_date).toLocaleDateString(
                  "en-GB"
                );
                const finishDate = new Date(
                  stage.finish_date || null
                ).toLocaleDateString("en-GB");

                return (
                  <Fragment key={stage.id}>
                    <TableRow
                      //onClick={() => setOpen(open === stage.id ? -1 : stage.id)}
                      sx={{ "& > *": { borderBottom: "unset" } }}
                    >
                      <TableCell>{stage.species_growth_stage_name}</TableCell>
                      <TableCell>
                        {stage.species_growth_stage_description}
                      </TableCell>
                      <TableCell>{formatedEstimatedTime}</TableCell>
                      <TableCell>{stage.start_date && startDate}</TableCell>
                      <TableCell>{stage.finish_date && finishDate}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() =>
                            setOpen(open === stage.id ? -1 : stage.id)
                          }
                          style={{ marginLeft: ".5rem" }}
                        >
                          {open === stage.id ? (
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
                        <Collapse
                          in={open === stage.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box>
                            <p>Comentarios: {stage.comments}</p>
                            <Box>
                              <h2>Tareas:</h2>
                              {stage.events
                                .sort((a: GrowthEvent, b: GrowthEvent) => {
                                  const aDate = a.done_date || a.due_date;
                                  const bDate = b.done_date || b.due_date;

                                  return (
                                    new Date(aDate).getTime() -
                                    new Date(bDate).getTime()
                                  );
                                })
                                .map((event: any) => {
                                  const formatedETFromStageStart =
                                    TimeIntervalToReadableString(
                                      event.species_growth_event_et_from_stage_start
                                    );
                                  const formatedTimePeriod =
                                    TimeIntervalToReadableString(
                                      event.species_growth_event_time_period
                                    );
                                  const dueDate = new Date(
                                    event.due_date
                                  ).toLocaleDateString("en-GB");
                                  const doneDate = new Date(
                                    event.done_date
                                  ).toLocaleDateString("en-GB");

                                  return (
                                    <Box key={event.id} mb={2}>
                                      <h3>{event.name}</h3>
                                      <Typography mt={2}>
                                        Descripción: {event.description}
                                      </Typography>

                                      {event.species_growth_event_time_period && (
                                        <Typography mt={2}>
                                          Periodo de repetición:{" "}
                                          {formatedTimePeriod}
                                        </Typography>
                                      )}

                                      {event.due_date ? (
                                        <Fragment>
                                          <Typography mt={2}>
                                            Fecha estimada: {dueDate}
                                          </Typography>
                                          <Box
                                            display={"flex"}
                                            alignItems="center"
                                          >
                                            {event.done_date ? (
                                              <Typography mt={2}>
                                                {"Fecha de realización: "}{" "}
                                                {doneDate}
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
                                                      stage.start_date
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
                                        <p>
                                          Tiempo desde incio de la etapa:{" "}
                                          {formatedETFromStageStart}
                                        </p>
                                      )}
                                    </Box>
                                  );
                                })}
                            </Box>

                            <Box
                              style={{
                                display: "flex",
                                justifyContent: "end",
                              }}
                              mb={3}
                              mr={1}
                            >
                              {!stage.finish_date && stage.start_date ? (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  sx={{ mt: 3, ml: 1 }}
                                  disabled={
                                    !stage.events.every(
                                      (event: GrowthEvent) =>
                                        event.done_date !== null
                                    )
                                  }
                                  onClick={(e) =>
                                    handleStageFinishClick(e, stage)
                                  }
                                  endIcon={<TodayIcon />}
                                >
                                  Finalizar etapa
                                </Button>
                              ) : null}
                            </Box>
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
      </Box>
    );
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
    <Box
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>
        Cultivo en curso - Parcela N.° {cropFeature?.properties?.landplot.id}
      </h1>
      <MapContainer center={position} zoom={7}>
        <LayerControler />
        <FlyToLayer />
        <LayerGroup>
          {cropFeature && <CustomLayer feature={cropFeature} />}
        </LayerGroup>
      </MapContainer>

      {cropFeature && <CropInfo feature={cropFeature} />}
    </Box>
  );
};

export default MapView;
