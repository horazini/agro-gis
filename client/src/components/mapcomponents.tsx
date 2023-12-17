import { Fragment, useState, useEffect, useRef } from "react";
import { NavigateFunction } from "react-router-dom";

import {
  LayersControl,
  Marker,
  Popup,
  TileLayer,
  WMSTileLayer,
  useMapEvents,
  MapContainer,
  Circle,
  Polygon,
  useMap,
  Pane,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { Box, Button, Card, CardMedia, Menu, Switch } from "@mui/material";
import { Today as TodayIcon } from "@mui/icons-material";

import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { format, sub } from "date-fns";
import { es } from "date-fns/locale";
import {
  PLANET_LABS_API_KEY,
  SENTINEL_HUB_API_URL,
  SENTINEL_HUB_BASE_URL,
} from "../config";

import { SimpleMapScreenshoter } from "leaflet-simple-map-screenshoter";
import { postLandplotSnapshot } from "../utils/services";
import {
  CircularProgressBackdrop,
  CustomDialog,
  MySnackBarProps,
  SnackBarAlert,
  mySnackBars,
} from "./customComponents";

import convert from "color-convert";

export const position: LatLngExpression = [-29, -58];

const { snapshotSuccessSnackBar, errorSnackBar } = mySnackBars;

const LeafIcon: any = L.Icon.extend({
  options: {
    iconSize: [25, 40],
    shadowSize: [50, 64],
    iconAnchor: [12.5, 40],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -50],
  },
});

const icon = new LeafIcon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
});

// Ubicacion actual del usuario
function LocationMarker() {
  const [userPosition, setUserPosition] = useState<LatLngExpression>([0, 0]);

  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setUserPosition(e.latlng);
      //map.flyTo(e.latlng, map.getZoom());
    },
  });
  return userPosition === null ? null : (
    <Marker position={userPosition} icon={icon}>
      <Popup>Posición actual</Popup>
    </Marker>
  );
}

//#region WMSOptions workaround
declare module "leaflet" {
  interface WMSOptions {
    urlProcessingApi?: string;
    maxcc?: number;
    preset?: string;
    time?: string;
  }
}
//#endregion
export function SentinelHubSnapshoter({
  tilesAreLoaded,
  selectedDate,
  setSelectedDate,
}: {
  tilesAreLoaded?: any;
  selectedDate?: any;
  setSelectedDate?: any;
}) {
  const [sentinelIsSelected, setSentinelIsSelected] = useState<boolean>(false);

  // Date handle

  const today = new Date();
  const formatedDate = format(selectedDate, "yyyy-MM-dd");

  const [WMSreloadTrigger, setWMSreloadTrigger] = useState(0);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    setWMSreloadTrigger((prevCount) => prevCount + 1);
  };

  // Date selector

  const [anchorDateEl, setAnchorDateEl] = useState(null);
  const openDateSelector = Boolean(anchorDateEl);
  const handleOpenDateSelector = (event: any) => {
    setAnchorDateEl(event.currentTarget);
  };
  const handleCloseDateSelector = () => {
    setAnchorDateEl(null);
  };

  //

  const [showAcquisitionDates, setShowAcquisitionDates] =
    useState<boolean>(false);

  const showDate = showAcquisitionDates ? ",DATE" : "";

  const handleShowDatesChange = () => {
    setShowAcquisitionDates((prev) => !prev);
    setWMSreloadTrigger((prevCount) => prevCount + 1);
  };

  return (
    <>
      <WMSTileLayer
        key={WMSreloadTrigger}
        url={SENTINEL_HUB_BASE_URL}
        tileSize={512}
        attribution='&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>'
        urlProcessingApi={SENTINEL_HUB_API_URL}
        maxcc={3}
        minZoom={7}
        maxZoom={16}
        preset="TRUE-COLOR-S2L2A"
        layers={`TRUE-COLOR-S2L2A${showDate}`}
        time={formatedDate}
        eventHandlers={{
          add: () => {
            setSentinelIsSelected(true);
          },
          remove: () => {
            setSentinelIsSelected(false);
          },
          tileloadstart: () => {
            if (typeof tilesAreLoaded === "function") {
              tilesAreLoaded(false);
            }
          },
          load: () => {
            if (typeof tilesAreLoaded === "function") {
              tilesAreLoaded(true);
            }
          },
        }}
      />
      <div className={"leaflet-bottom leaflet-left"} id="time-controller">
        <div className="leaflet-control leaflet-bar">
          {sentinelIsSelected ? (
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={handleOpenDateSelector}
                endIcon={<TodayIcon />}
                color="inherit"
                sx={{ color: "black" }}
              >
                {format(selectedDate, "dd/MM/yyyy")}
              </Button>
              <Switch onClick={handleShowDatesChange} />
            </Box>
          ) : null}
        </div>
      </div>
      <Menu
        id="date-menu"
        anchorEl={anchorDateEl}
        open={openDateSelector}
        onClose={handleCloseDateSelector}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
      >
        <DateCalendar
          showDaysOutsideCurrentMonth
          value={dayjs(selectedDate)}
          minDate={dayjs("2017-01-01")}
          maxDate={dayjs(today)}
          onChange={(newValue: any) => {
            handleDateChange(new Date(newValue));
            handleCloseDateSelector();
          }}
        />
      </Menu>
    </>
  );
}

export function LayerControler(): JSX.Element {
  const [sentinelIsSelected, setSentinelIsSelected] = useState<boolean>(true);
  const [planetLabsIsSelected, setPlanetLabsIsSelected] =
    useState<boolean>(false);

  // Date handle

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const SentinelHubFormatedDate = format(selectedDate, "yyyy-MM-dd");

  const [SentinelHubReloadTrigger, setSentinelHubReloadTrigger] = useState(0);
  //const [PlanetLabsReloadTrigger, setPlanetLabsReloadTrigger] = useState(0);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    setSentinelHubReloadTrigger((prevCount) => prevCount + 1);
  };

  // Date selector

  const [anchorDateEl, setAnchorDateEl] = useState(null);
  const openDateSelector = Boolean(anchorDateEl);
  const handleOpenDateSelector = (event: any) => {
    setAnchorDateEl(event.currentTarget);
  };
  const handleCloseDateSelector = () => {
    setAnchorDateEl(null);
  };

  // Sentinel Hub acquisition date

  const [showAcquisitionDates, setShowAcquisitionDates] =
    useState<boolean>(false);

  const showDate = showAcquisitionDates ? ",DATE" : "";

  const handleShowDatesChange = () => {
    setShowAcquisitionDates((prev) => !prev);
    setSentinelHubReloadTrigger((prevCount) => prevCount + 1);
  };

  // Planet Labs

  const PlanetLabsFormatedDate = format(selectedDate, "yyyy_MM");

  const handlePlanetLabsSelect = () => {
    setPlanetLabsIsSelected(true);
    if (
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    ) {
      let newDate = sub(selectedDate, { months: 1 });
      setSelectedDate(newDate);
    }
  };

  return (
    <Fragment>
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          checked={sentinelIsSelected}
          name="Sentinel Hub - S2 L2A"
        >
          <WMSTileLayer
            key={SentinelHubReloadTrigger}
            url={SENTINEL_HUB_BASE_URL}
            tileSize={512}
            attribution='&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>'
            urlProcessingApi={SENTINEL_HUB_API_URL}
            maxcc={3}
            minZoom={7}
            maxZoom={16}
            preset="TRUE-COLOR-S2L2A"
            layers={`TRUE-COLOR-S2L2A${showDate}`}
            time={SentinelHubFormatedDate}
            eventHandlers={{
              add: () => {
                setSentinelIsSelected(true);
              },
              remove: () => {
                setSentinelIsSelected(false);
              },
            }}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Planet Labs PB - Global monthly maps">
          <TileLayer
            //key={PlanetLabsReloadTrigger}
            url={`https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${PlanetLabsFormatedDate}_mosaic/gmap/{z}/{x}/{y}.png?api_key=${PLANET_LABS_API_KEY}`}
            attribution='&copy; <a href="https://www.planet.com/">Planet Labs PBC</a> &mdash; Global monthly Basemaps'
            eventHandlers={{
              add: () => {
                handlePlanetLabsSelect();
              },
              remove: () => {
                setPlanetLabsIsSelected(false);
              },
            }}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Esri - WorldImagery">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            maxZoom={17}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Open Topo Map">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>) &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={15}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Open Street Map">
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Stadia Alidade Smooth Dark">
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay name="Posición actual">
          <LocationMarker />
        </LayersControl.Overlay>
      </LayersControl>

      <Fragment>
        <div className={"leaflet-bottom leaflet-left"} id="time-controller">
          <div className="leaflet-control leaflet-bar">
            {sentinelIsSelected || planetLabsIsSelected ? (
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleOpenDateSelector}
                  endIcon={<TodayIcon />}
                  color="inherit"
                  sx={{ color: "black" }}
                >
                  {sentinelIsSelected
                    ? format(selectedDate, "dd/MM/yyyy")
                    : format(selectedDate, "MMMM yyyy", {
                        locale: es,
                      })}
                </Button>
                {sentinelIsSelected ? (
                  <Switch
                    checked={showAcquisitionDates}
                    onClick={handleShowDatesChange}
                  />
                ) : null}
              </Box>
            ) : null}
          </div>
        </div>
        <Menu
          id="date-menu"
          anchorEl={anchorDateEl}
          open={openDateSelector}
          onClose={handleCloseDateSelector}
          MenuListProps={{ "aria-labelledby": "basic-button" }}
        >
          <DateCalendar
            showDaysOutsideCurrentMonth
            views={
              planetLabsIsSelected
                ? ["month", "year"]
                : ["year", "month", "day"]
            }
            value={dayjs(selectedDate)}
            minDate={dayjs("2017-04-01")}
            maxDate={
              sentinelIsSelected
                ? dayjs(today)
                : dayjs(sub(today, { months: 1 }))
            }
            onChange={(newValue: any) => {
              handleDateChange(new Date(newValue));
              handleCloseDateSelector();
            }}
          />
        </Menu>
      </Fragment>
    </Fragment>
  );
}

export type Crop = {
  id: number;
  species_id: number;
  species_name: string;
  description: string | null;
  start_date: string;
  finish_date: string | null;
};

const CropInfo = (crop: Crop, navigate: NavigateFunction) => {
  const startDate = new Date(crop.start_date).toLocaleDateString("en-GB");
  const finishDate = new Date(crop.finish_date || "").toLocaleDateString(
    "en-GB"
  );

  return (
    <Box>
      {(crop.finish_date && (
        <Fragment>
          <h2>Parcela libre</h2>
          <h3>Última cosecha:</h3>
        </Fragment>
      )) || (
        <Fragment>
          <h2>Parcela ocupada</h2>
          <h3>Cultivo actual:</h3>
        </Fragment>
      )}
      <p>Fecha de plantación: {startDate}</p>
      {crop.finish_date && <p>Fecha de cosecha: {finishDate}</p>}
      <Box style={{ display: "flex", justifyContent: "space-between" }}>
        <p>Especie: {crop.species_name}</p>
        {crop.description && <p>description: {crop.description}</p>}
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/crops/${crop.id}`)}
          >
            detalles del cultivo
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export const FeatureInfo = (
  featureProperties: any,
  navigate: NavigateFunction
) => {
  const { landplot, crop } = featureProperties;
  return (
    <Box>
      <h2>Información seleccionada:</h2>
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
      {(crop && CropInfo(crop, navigate)) || (
        <Fragment>
          <h2>Parcela libre</h2>
          <h3>No se registran cultivos en esta parcela.</h3>
        </Fragment>
      )}
    </Box>
  );
};

/**
 *
 * @param {number} area - the area in square meters, as it is returned by the PostGIS ST_Area function.
 * @returns {string} the formatted area in either square meters or hectares
 */
export function FormattedArea(area: number): string {
  let formatedArea = area + " m²";
  if (area > 10000) {
    formatedArea = (area / 10000).toFixed(2) + " ha.";
  }
  return formatedArea;
}

const snapshotOptions = {
  hideElementsWithSelectors: [
    ".leaflet-control-container",
    ".leaflet-dont-include-pane",
    "#snapshot-button",
    "#time-controller",
  ],
  hidden: true,
};

const screenshotter = new SimpleMapScreenshoter(snapshotOptions);

export const SentinelSnapshoter = ({ landplot }: any) => {
  const [mapref, setMapref] = useState<any>(null);
  const featureRef = useRef<any>();
  const [tilesAreLoaded, setTilesAreLoaded] = useState<boolean>(false);

  const [featureBoundsCoords, setFeatureBoundsCoords] = useState<any>(position);
  const [featureBoundsZoom, setFeatureBoundsZoom] = useState<number>(7);
  const [alreadyFlyed, setAlreadyFlyed] = useState<boolean>(false);

  const [JSONSnapshotData, setJSONSnapshotData] = useState<{
    image: string;
    landplot_id: any;
    crop_id: any;
    date: Date;
  } | null>(null);

  const [snapshotButtonIsClicked, setSnapshotButtonIsClicked] =
    useState<boolean>(false);

  useEffect(() => {
    if (mapref) {
      screenshotter.addTo(mapref);
    }
  }, [mapref]);

  //#region snapshot trigger mechanism

  useEffect(() => {
    snapshotButtonIsClicked && tilesAreLoaded && TakeSnapshot();
  }, [snapshotButtonIsClicked, tilesAreLoaded]);

  const SnapshotClick = async () => {
    setSnapshotButtonIsClicked(true);
    mapref.setView(featureBoundsCoords, featureBoundsZoom);

    mapref.zoomControl.disable();
    mapref.dragging.disable();
    mapref.scrollWheelZoom.disable();
    mapref.touchZoom.disable();
    mapref.doubleClickZoom.disable();
    mapref.boxZoom.disable();
    mapref.keyboard.disable();
    // Alt to mapref.setView
    // mapref.fitBounds(feature.getBounds());
  };

  const TakeSnapshot = () => {
    const feature = featureRef.current;
    // Get bounds of feature
    const featureBounds = feature.getBounds();
    // Get pixel position on screen of top left and bottom right of the bounds of the feature
    const nw = featureBounds.getNorthWest();
    const se = featureBounds.getSouthEast();
    const topLeft = mapref.latLngToContainerPoint(nw);
    const bottomRight = mapref.latLngToContainerPoint(se);
    // Get the resulting image size that contains the feature
    const imageSize = bottomRight.subtract(topLeft);

    // timeout for the Leaflet loaded tiles white-to-color animation
    setTimeout(() => {
      screenshotter
        .takeScreen("image")
        .then((image: any) => {
          // Create <img> element to render img data
          var img = new Image();

          // once the image loads, do the following:
          img.onload = async () => {
            // Create canvas to process image data
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx === null) {
              return;
            }

            // Set canvas size to the size of your resultant image
            canvas.width = imageSize.x;
            canvas.height = imageSize.y;

            // Draw the Leaflet map bounding box image on the canvas
            ctx.drawImage(
              img,
              topLeft.x,
              topLeft.y,
              imageSize.x,
              imageSize.y,
              0,
              0,
              imageSize.x,
              imageSize.y
            );

            if (feature instanceof L.Polygon) {
              ctx.globalCompositeOperation = "destination-in";

              const coordinates = feature.getLatLngs()[0];

              if (!Array.isArray(coordinates)) {
                return;
              }
              // draw the polygon
              ctx.beginPath();
              coordinates.forEach((coord: any, index: number) => {
                const point = mapref.latLngToContainerPoint(
                  L.latLng(coord.lat, coord.lng)
                );
                const x = point.x - topLeft.x;
                const y = point.y - topLeft.y;
                if (index === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              });
              ctx.closePath();
              ctx.fill();
            } else if (feature instanceof L.Circle) {
              ctx.globalCompositeOperation = "destination-in";

              // get screen radius of the circle
              const rad = imageSize.x / 2;

              // get screen center of circle
              const x = rad; //- topLeft.x;
              const y = rad; //- topLeft.x;

              // draw the circle
              ctx.beginPath();
              ctx.arc(x, y, rad, 0, 2 * Math.PI);
              ctx.closePath();
              ctx.fill();
            }

            const base64Canvas = canvas.toDataURL("image/png");

            const cropId = landplot.properties?.crop?.id || null;

            setJSONSnapshotData({
              image: base64Canvas,
              landplot_id: landplot.properties.landplot.id,
              crop_id: cropId,
              date: selectedDate,
            });
          };

          // set the image source to what the snapshotter captured
          // img.onload will fire AFTER this
          img.src = image;

          setSnapshotButtonIsClicked(false);
          mapref.zoomControl.enable();
          mapref.dragging.enable();
          mapref.scrollWheelZoom.enable();
          mapref.touchZoom.enable();
          mapref.doubleClickZoom.enable();
          mapref.boxZoom.enable();
          mapref.keyboard.enable();
        })
        .catch((e: { toString: () => any }) => {
          alert(e.toString());
        });
    }, 500);
  };

  const PreviewCard = (
    <Card>
      <CardMedia
        component="img"
        image={JSONSnapshotData?.image}
        style={{ padding: 10 }}
      />
    </Card>
  );

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

  const [loading, setLoading] = useState(false);

  const handleConfirmSaveSnapshot = async () => {
    setLoading(true);
    try {
      let res = await postLandplotSnapshot(JSONSnapshotData);

      if (res === 200) {
        setJSONSnapshotData(null);
        setSnackBar(snapshotSuccessSnackBar);
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
  };

  //#endregion

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
          ref={featureRef}
        />
      );
    } else if (type === "Point" && landplot.subType === "Circle") {
      return (
        <Circle
          center={coordinates}
          radius={landplot.radius}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
          ref={featureRef}
        />
      );
    }
    return null;
  };

  function FlyToLayer() {
    const feature = featureRef.current;
    // Get bounds of feature
    const featureBounds = feature.getBounds();
    let coords: LatLngExpression = position;
    let zoom = 13;

    let map = useMap();

    if (feature instanceof L.Circle) {
      coords = landplot.geometry.coordinates as LatLngExpression;

      const radius = landplot.properties.landplot.radius as number;

      const c = L.circle(coords, { radius }).addTo(map);
      const bounds = c.getBounds();
      zoom = map.getBoundsZoom(bounds);
      c.remove();
    }
    if (feature instanceof L.Polygon) {
      coords = featureBounds.getCenter();
      zoom = map.getBoundsZoom(featureBounds);
    }

    map = useMapEvents({
      layeradd() {
        map.flyTo(coords, zoom);
        if (!alreadyFlyed) {
          setAlreadyFlyed(true);
        }
        setFeatureBoundsCoords(coords);
        setFeatureBoundsZoom(zoom);
      },
    });

    return null;
  }

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

  return (
    <Fragment>
      <MapContainer
        doubleClickZoom={false}
        id="mapId"
        center={position}
        zoom={7}
        preferCanvas={true}
        ref={setMapref}
      >
        <SentinelHubSnapshoter
          tilesAreLoaded={setTilesAreLoaded}
          selectedDate={selectedDate}
          setSelectedDate={handleDateChange}
        />

        {mapref && featureRef.current && !alreadyFlyed && <FlyToLayer />}

        <Pane name="dont-include">
          {landplot && <CustomLayer feature={landplot} />}
        </Pane>

        <div className={"leaflet-bottom leaflet-right"} id="snapshot-button">
          <div className="leaflet-control leaflet-bar">
            <Button
              variant="contained"
              color="inherit"
              sx={{ color: "black" }}
              disabled={snapshotButtonIsClicked}
              onClick={() => SnapshotClick()}
            >
              Tomar Snapshot
            </Button>
          </div>
        </div>
      </MapContainer>
      <CustomDialog
        open={JSONSnapshotData !== null}
        dialogTitle="Snapshot tomada"
        dialogSubtitle={PreviewCard}
        onClose={() => setJSONSnapshotData(null)}
        onConfirm={handleConfirmSaveSnapshot}
        confirmButtonText="Guardar"
        cancelButtonText="Descartar"
      />
      <CircularProgressBackdrop loading={loading} />
      <SnackBarAlert
        handleSnackbarClose={handleSnackbarClose}
        msg={snackBar.msg}
        open={snackBar.open}
        severity={snackBar.severity}
      />
    </Fragment>
  );
};

/**
 *
 * @param {array} features - array of GeoJSON features
 * @param {number} selectedLandplotId
 * @param {function(number)} handleFeatureClick - function that would receive the selected feature ID, so it can be seted on your component context
 * @returns {react-leaflet MapContainer} a map that flies to the selected feature, and in which you can select a feature by clicking on them
 */
export const FlyToSelectedFeatureMap = ({
  features,
  selectedLandplotId,
  handleFeatureClick,
}: any) => {
  const mapRef = useRef<any>();

  useEffect(() => {
    if (
      mapRef === null ||
      selectedFeature === null ||
      selectedFeature === undefined
    ) {
      return;
    }

    //#endregion

    const { properties, geometry } = selectedFeature;

    let coords: LatLngExpression = position;
    let zoom = 13;

    if (geometry.type === "Polygon") {
      const coordinates = geometry.coordinates[0].map(([lng, lat]: any) => [
        lat,
        lng,
      ]);

      const p = L.polygon(coordinates).addTo(mapRef.current);
      const bounds = p.getBounds();
      coords = bounds.getCenter();
      zoom = mapRef.current.getBoundsZoom(bounds);
      p.remove();
    } else if (
      geometry.type === "Point" &&
      properties.landplot.subType === "Circle"
    ) {
      coords = geometry.coordinates as LatLngExpression;

      const radius = properties.landplot.radius as number;

      const c = L.circle(geometry.coordinates, { radius }).addTo(
        mapRef.current
      );
      const bounds = c.getBounds();
      zoom = mapRef.current.getBoundsZoom(bounds);
      c.remove();
    }
    mapRef.current.flyTo(coords, zoom);
  }, [selectedLandplotId]);

  const selectedFeature = features.find(
    (feature: { properties: { landplot: { id: number } } }) =>
      feature.properties.landplot.id === selectedLandplotId
  );

  // Comportamiento de las Layers

  const CustomLayer = ({ feature }: any) => {
    const { properties, geometry } = feature;

    const [highlightedLayerId, setHighlightedLayerId] = useState<number | null>(
      null
    );
    const handleLayerMouseOver = (layerId: number) => {
      setHighlightedLayerId(layerId);
    };

    const handleLayerMouseOut = () => {
      setHighlightedLayerId(null);
    };

    const isHighlighted = highlightedLayerId === properties.landplot.id;
    const isSelected = selectedLandplotId === properties.landplot.id;
    const isOccupied = properties.crop && properties.crop?.finish_date === null;

    const pathOptions = {
      color: isSelected
        ? "#bf4000"
        : isHighlighted
        ? "#33ff33"
        : isOccupied
        ? "red"
        : "#3388ff",
      weight: isSelected ? 4 : isHighlighted ? 4 : 3,
    };

    const eventHandlers = {
      click: () => handleFeatureClick(properties.landplot.id),
      mouseover: () => handleLayerMouseOver(properties.landplot.id),
      mouseout: handleLayerMouseOut,
    };

    const PopUp = (
      <div>
        <h3>ID: {properties.landplot.id}</h3>
        <p>Descripción: {properties.landplot.description}</p>
        {properties.landplot.radius && (
          <p>Radio: {properties.landplot.radius} m.</p>
        )}
      </div>
    );

    if (geometry.type === "Polygon") {
      const coordinates = geometry.coordinates[0].map(([lng, lat]: any) => [
        lat,
        lng,
      ]);
      return (
        <Polygon
          key={properties.landplot.id}
          positions={coordinates}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      geometry.type === "Point" &&
      properties.landplot.subType === "Circle"
    ) {
      return (
        <Circle
          key={properties.landplot.id}
          center={geometry.coordinates}
          radius={properties.landplot.radius}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Circle>
      );
    }
    return null;
  };

  return (
    <MapContainer center={position} zoom={7} ref={mapRef}>
      <LayerControler />
      <LayerGroup>
        {features.map((feature: any) => {
          return (
            <CustomLayer
              key={feature.properties.landplot.id}
              feature={feature}
            />
          );
        })}
      </LayerGroup>
    </MapContainer>
  );
};

/**
 *
 * @param {array} features - array of GeoJSON features
 * @param {string} targetProp - string representing the nested or direct property to be evaluated by the heat map, e.g., "landplot.area" or "totalweightintons"
 * @returns {react-leaflet MapContainer} a map that assigns a color between green and red to each feature based on the value of one of its properties
 */
export const FeaturesHeatMap = ({ features, targetProp }: any) => {
  const mapRef = useRef<any>();

  // Target variable heating

  function accessProperty(obj: any, propPath: string): any {
    const parts = propPath.split(".");

    if (parts.length === 1) {
      // Base case: first order property
      return obj[propPath];
    } else {
      // Recursive case: nested property
      const currentProp = parts[0];
      const remainingProps = parts.slice(1).join(".");
      return accessProperty(obj[currentProp], remainingProps);
    }
  }

  let varRangeMax = accessProperty(features[0].properties, targetProp) | 0;
  let varRangeMin = accessProperty(features[0].properties, targetProp) | 0;

  features.forEach((feature: any) => {
    const value = accessProperty(feature.properties, targetProp) | 0;

    if (value > varRangeMax) {
      varRangeMax = value;
    }

    if (value < varRangeMin) {
      varRangeMin = value;
    }
  });
  const varRangeLength = varRangeMax - varRangeMin;

  // Layer behavior

  const CustomLayer = ({ feature }: any) => {
    const { properties, geometry } = feature;

    // Target variable heating

    function valueToHue(originalValue: number): number {
      if (varRangeLength < 1) {
        return 120;
      }
      const originalValueRatio = (originalValue - varRangeMin) / varRangeLength;
      const hueValue = originalValueRatio * 120;
      return Math.round(hueValue);
    }

    const featureHue = valueToHue(
      Number(accessProperty(properties, targetProp))
    );
    const cropColor = `#${convert.hsv.hex([120 - featureHue, 100, 100])}`;

    const pathOptions = {
      color: cropColor,
    };

    const eventHandlers = {
      click: (e: any) => mapRef.current.flyToBounds(e.target.getBounds()),
      mouseover: (e: any) => {
        var layer = e.target;
        layer.setStyle({
          weight: 5,
        });
      },
      mouseout: (e: any) => {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
        });
      },
    };

    const PopUp = (
      <div>
        <h3>Parclea N°. {properties.landplot.id}</h3>
        {properties.landplot.radius && (
          <p>Radio: {properties.landplot.radius} m.</p>
        )}
        <p>Área: {FormattedArea(properties.landplot.area)}</p>
      </div>
    );

    if (geometry.type === "Polygon") {
      const coordinates = geometry.coordinates[0].map(([lng, lat]: any) => [
        lat,
        lng,
      ]);
      return (
        <Polygon
          key={properties.landplot.id}
          positions={coordinates}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      geometry.type === "Point" &&
      properties.landplot.subType === "Circle"
    ) {
      return (
        <Circle
          key={properties.landplot.id}
          center={geometry.coordinates}
          radius={properties.landplot.radius}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Circle>
      );
    }
    return null;
  };

  return (
    <Fragment>
      <MapContainer center={position} zoom={7} ref={mapRef}>
        <LayerControler />
        <LayerGroup>
          {features.map((feature: any) => {
            return (
              <CustomLayer
                key={feature.properties.landplot.id}
                feature={feature}
              />
            );
          })}
        </LayerGroup>
      </MapContainer>
    </Fragment>
  );
};

export const OneFeatureMap = ({ feature }: any) => {
  const mapRef = useRef<any>();

  const [effectCounter, setEffectCounter] = useState(0);
  const [alreadyFlyed, setAlreadyFlyed] = useState(false);

  useEffect(() => {
    if (alreadyFlyed) {
      return;
    }

    if (mapRef.current === null || feature === null || feature === undefined) {
      setEffectCounter((prevCounter: number) => prevCounter + 1);
      return;
    }

    //#endregion

    const { properties, geometry } = feature;

    let coords: LatLngExpression = position;
    let zoom = 13;

    if (geometry.type === "Polygon") {
      const coordinates = geometry.coordinates[0].map(([lng, lat]: any) => [
        lat,
        lng,
      ]);

      const p = L.polygon(coordinates).addTo(mapRef.current);
      const bounds = p.getBounds();
      coords = bounds.getCenter();
      zoom = mapRef.current.getBoundsZoom(bounds);
      p.remove();
    } else if (
      geometry.type === "Point" &&
      properties.landplot.subType === "Circle"
    ) {
      coords = geometry.coordinates as LatLngExpression;

      const radius = properties.landplot.radius as number;

      const c = L.circle(geometry.coordinates, { radius }).addTo(
        mapRef.current
      );
      const bounds = c.getBounds();
      zoom = mapRef.current.getBoundsZoom(bounds);
      c.remove();
    }
    mapRef.current.flyTo(coords, zoom);
    setAlreadyFlyed(true);
  }, [effectCounter]);

  // Comportamiento de las Layers

  const CustomLayer = ({ feature }: any) => {
    const { properties, geometry } = feature;

    const PopUp = (
      <div>
        <h3>ID: {properties.landplot.id}</h3>
        <p>Descripción: {properties.landplot.description}</p>
        {properties.landplot.radius && (
          <p>Radio: {properties.landplot.radius} m.</p>
        )}
      </div>
    );

    if (geometry.type === "Polygon") {
      const coordinates = geometry.coordinates[0].map(([lng, lat]: any) => [
        lat,
        lng,
      ]);
      return (
        <Polygon key={properties.landplot.id} positions={coordinates}>
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      geometry.type === "Point" &&
      properties.landplot.subType === "Circle"
    ) {
      return (
        <Circle
          key={properties.landplot.id}
          center={geometry.coordinates}
          radius={properties.landplot.radius}
        >
          <Popup>{PopUp}</Popup>
        </Circle>
      );
    }
    return null;
  };

  return (
    <MapContainer center={position} zoom={7} ref={mapRef}>
      <LayerControler />
      <LayerGroup>
        <CustomLayer key={feature.properties.landplot.id} feature={feature} />
      </LayerGroup>
    </MapContainer>
  );
};
