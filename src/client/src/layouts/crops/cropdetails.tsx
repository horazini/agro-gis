import { Fragment, useEffect, useState } from "react";
import {
  MapContainer,
  Circle,
  LayerGroup,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { getCropById } from "../../services/services";
import { Feature } from "geojson";

import { position, LayerControler } from "../../components/mapcomponents";
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import {
  FormatListBulleted,
  KeyboardArrowDown,
  KeyboardArrowUp,
  StorageSharp,
} from "@mui/icons-material";
import { DialogButton } from "../../components/customComponents";

const MapView = () => {
  const timeUnits = [
    { key: "days", label: "Día/s" },
    { key: "weeks", label: "Semana/s" },
    { key: "months", label: "Mes/es" },
    { key: "years", label: "Año/s" },
  ];

  const params = useParams();

  const [cropFeature, setCropFeature] = useState<Feature>();

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
  }, [params.id]);

  const CustomLayer = ({ feature }: any) => {
    const { crop, landplot, species, stage } = feature.properties;
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

  const [open, setOpen] = useState(-1);
  const CropInfo = ({ feature }: any) => {
    const { crop, landplot, species, stages } = feature.properties;
    const startDate = new Date(crop.start_date).toLocaleDateString("en-GB");
    const finishDate = new Date(crop.finish_date || "").toLocaleDateString(
      "en-GB"
    );

    let formatedArea = landplot.area + " m²";
    if (landplot.area > 10000) {
      formatedArea = (landplot.area / 10000).toFixed(2) + " ha";
    }
    return (
      <Box>
        <Box>
          <h2>Parcela:</h2>
          <p>Parcela N.° {landplot.id}</p>
          {landplot.description && <p>Descripción: {landplot.description}</p>}
          {landplot.area && <p>Área: {formatedArea} </p>}
          {landplot.radius && <p>Radio: {landplot.radius.toFixed(2)} m.</p>}
        </Box>
        <Box>
          <h2>Cultivo:</h2>
          <p>Fecha de plantación: {startDate}</p>
          {crop.finish_date && <p>Fecha de cosecha: {finishDate}</p>}
        </Box>
        <Box>
          <p>Especie: {species.name}</p>
          {crop.description && <p>description: {crop.description}</p>}
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
                const estimatedTimeUnit =
                  Object.keys(stage.species_growth_stage_estimated_time)[0] ||
                  "days";
                const estimatedTimeCuantity =
                  stage.species_growth_stage_estimated_time[
                    estimatedTimeUnit
                  ] || 0;
                const formatedEstimatedTime =
                  estimatedTimeCuantity +
                  " " +
                  timeUnits.find((unit) => unit.key === estimatedTimeUnit)
                    ?.label;

                const startDate = new Date(stage.start_date).toLocaleDateString(
                  "en-GB"
                );
                const finishDate = new Date(
                  stage.finish_date || null
                ).toLocaleDateString("en-GB");
                return (
                  <Fragment>
                    <TableRow
                      key={stage.id}
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
                          <Box>Comentarios: {stage.comments}</Box>
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
