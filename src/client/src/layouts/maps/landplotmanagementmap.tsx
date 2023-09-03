import * as L from "leaflet";
import {
  Circle,
  FeatureGroup,
  LayerGroup,
  MapContainer,
  Polygon,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { FeatureCollection, Feature, GeoJsonObject } from "geojson";
import { useEffect, useRef, useState } from "react";
import { LayerControler, position } from "../../components/mapcomponents";
import {
  getAvailableAndOccupiedTenantGeo,
  putFeatures,
} from "../../services/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { LatLngExpression } from "leaflet";
import { ConfirmButton } from "../../components/customComponents";

import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import React from "react";

type CircleFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: LatLngExpression;
  };
  properties: {
    status?: string;
    landplot: {
      id: string;
      subType: "Circle";
      radius: number;
      description?: string | null;
    };
  };
};

declare module "leaflet" {
  interface Layer {
    feature?: Feature;
  }
  interface LayerOptions {
    color?: string;
  }
}

export default function EditControlFC() {
  const [geojson, setGeojson] = useState<GeoJsonObject[]>();
  const { tenantId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAvailableAndOccupiedTenantGeo(tenantId);
    setGeojson(data.features);
  };

  const featureGroup = useRef<L.FeatureGroup>(null);

  useEffect(() => {
    if (featureGroup.current?.getLayers().length === 0 && geojson) {
      L.geoJSON(geojson).eachLayer((layer) => {
        if (
          layer.feature?.properties?.crop?.finish_date !== null &&
          (layer instanceof L.Polyline ||
            layer instanceof L.Polygon ||
            layer instanceof L.Marker)
        ) {
          if (
            layer?.feature?.properties.landplot.radius &&
            featureGroup.current
          ) {
            const circle = new L.Circle(layer.feature.geometry.coordinates, {
              radius: layer.feature?.properties.landplot.radius,
            });
            circle.feature = layer.feature;
            featureGroup.current?.addLayer(circle);
          } else if (layer instanceof L.Polygon) {
            featureGroup.current?.addLayer(layer);
            /* 
            //forma alternativa
            new L.Polygon(layer.feature.geometry.coordinates).addTo(
              featureGroup.current
            ); */
          }
        }
      });
    } else {
      featureGroup.current?.eachLayer(function (layer) {
        if (layer.feature?.properties?.status === "modified") {
          layer.options.color = "#9933ff";
          // Workaround que soluciona el error de actualización de color un paso tarde
          featureGroup.current?.removeLayer(layer);
          featureGroup.current?.addLayer(layer);
        }
      });
    }
  }, [geojson]);

  const circleToGeoJSON = (circleProperties: any, circleLatLng: L.LatLng) => {
    const { lat, lng } = circleLatLng;
    const feature: CircleFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        ...circleProperties,
      },
    };
    return feature;
  };

  const onCreate = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "circle") {
      const circleProperties = {
        status: "added",
        landplot: {
          id: layer._leaflet_id,
          radius: layer.getRadius().toFixed(2),
          description: null,
          subType: "Circle",
        },
      };
      const circleLatLng: L.LatLng = layer.getLatLng();

      const circle = circleToGeoJSON(circleProperties, circleLatLng);

      setGeojson((layers: any) => [...layers, circle]); // Almacena en GeoJSON Features
    }
    if (layerType === "polygon") {
      const { _leaflet_id } = layer;

      const polygon = layer.toGeoJSON(); // convierte los polígonos dibujados en objetos GeoJSON.
      polygon.properties = {
        status: "added",
        landplot: {
          id: _leaflet_id,
          description: null,
        },
      };
      setGeojson((layers: any) => [...layers, polygon]);
    }
  };

  const handleChange = (e: any) => {
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).forEach((layer: any) => {
      let FeatureToEditId = layer._leaflet_id;
      let status = "added";
      if (layer?.feature) {
        FeatureToEditId = layer.feature.properties.landplot.id;
        status = "modified";
        layer.feature.properties.status = status;
      }

      if (layer.editing.latlngs) {
        // Acciones para polígonos

        setGeojson((layers: any) =>
          layers.map((l: any) =>
            l.properties.landplot.id === FeatureToEditId
              ? {
                  ...l,
                  geometry: {
                    type: "Polygon",
                    coordinates: [
                      layer.editing.latlngs[0][0].map((latlng: any) => [
                        latlng.lng,
                        latlng.lat,
                      ]),
                    ],
                  },
                  properties: {
                    ...l.properties,
                    status,
                  },
                }
              : l
          )
        );
      } else if (layer.editing._shape) {
        // Acciones para círculos

        setGeojson((layers: any) =>
          layers.map((l: any) =>
            l.properties.landplot.id === FeatureToEditId
              ? {
                  ...l,
                  geometry: {
                    type: "Point",
                    coordinates: [
                      layer.editing._shape._latlng.lng,
                      layer.editing._shape._latlng.lat,
                    ],
                  },
                  properties: {
                    ...l.properties,
                    landplot: {
                      ...l.properties.landplot,
                      radius: layer.editing._shape._mRadius.toFixed(2),
                    },
                    status,
                  },
                }
              : l
          )
        );
      }
    });
  };

  const onDeleted = (e: any) => {
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).forEach((layer: any) => {
      let FeatureToDeleteId = layer._leaflet_id;

      if (layer.feature) {
        FeatureToDeleteId = layer.feature.properties.landplot.id;
        setGeojson((existingFeatures: any) =>
          existingFeatures.map((f: any) =>
            f.properties.landplot.id === FeatureToDeleteId
              ? {
                  ...f,
                  properties: {
                    ...f.properties,
                    status: "deleted",
                  },
                }
              : f
          )
        );
      } else {
        setGeojson((existingFeatures: any) =>
          existingFeatures.filter(
            (f: any) => f.properties.landplot.id !== FeatureToDeleteId
          )
        );
      }
    });
  };

  const CustomLayer = ({ feature }: any) => {
    const pathOptions = {
      color: "#ff4019",
    };

    const PopUp = (
      <div>
        <h3>Parcela ocupada</h3>
        <p>ID: {feature.properties.landplot.id}</p>
        <p>Descripción: {feature.properties.landplot.description}</p>
        {feature.properties?.landplot.radius && (
          <p>Radio: {feature.properties.landplot.radius} m.</p>
        )}
      </div>
    );

    if (feature.geometry.type === "Polygon") {
      const coordinates = feature.geometry.coordinates[0].map(
        ([lng, lat]: any) => [lat, lng]
      );
      return (
        <Polygon
          key={feature.properties.landplot.id}
          positions={coordinates}
          pathOptions={pathOptions}
        >
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      feature.geometry.type === "Point" &&
      feature.properties.landplot.subType === "Circle"
    ) {
      return (
        <Circle
          key={feature.properties.landplot.id}
          center={feature.geometry.coordinates}
          radius={feature.properties.landplot.radius}
          pathOptions={pathOptions}
        >
          <Popup>{PopUp}</Popup>
        </Circle>
      );
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      const featureCollection = geojson?.filter(
        (f: any) => f.properties.status !== undefined
      );

      const msg = {
        tenantId: tenantId || 1,
        featureCollection,
      };

      await putFeatures(msg);
    } catch (error) {
      console.log(error);
    }
  };

  const [open, setOpen] = useState(-1);
  return (
    <div className="row">
      <div className="col text-center">
        <h1>Administración de parcelas</h1>

        <div className="col">
          <MapContainer center={position} zoom={7}>
            <LayerControler />
            <FeatureGroup ref={featureGroup}>
              <EditControl
                position="topleft"
                onEdited={handleChange}
                onCreated={onCreate}
                onDeleted={onDeleted}
                draw={{
                  rectangle: false,
                  circle: {
                    shapeOptions: {
                      color: "lightgreen",
                    },
                  },
                  polyline: false,
                  polygon: {
                    shapeOptions: {
                      color: "lightgreen",
                    },
                  },
                  marker: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>

            <LayerGroup>
              {geojson &&
                geojson.map((feature: any) => {
                  if (feature.properties.crop?.finish_date === null) {
                    return (
                      <CustomLayer
                        key={feature.properties.landplot.id}
                        feature={feature}
                      />
                    );
                  }
                })}
            </LayerGroup>
          </MapContainer>

          <TableContainer
            component={Paper}
            sx={{
              width: "max-content",
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: 4,
              borderRadius: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(211,211,211,.2)" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Condición</TableCell>

                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {geojson &&
                  geojson.map((feature: any) => (
                    <React.Fragment key={feature.properties.landplot.id}>
                      <TableRow key={feature.properties.landplot.id}>
                        <TableCell>
                          {feature.properties.status !== "added"
                            ? feature.properties.landplot.id
                            : ""}
                        </TableCell>
                        <TableCell>
                          {feature.geometry.type === "Polygon"
                            ? "Polígonal"
                            : "Circular"}
                        </TableCell>
                        <TableCell>
                          {feature.properties.crop?.finish_date === null
                            ? "Ocupado"
                            : feature.properties.status === "added"
                            ? "Creado"
                            : feature.properties.status === "modified"
                            ? "Modificado"
                            : feature.properties.status === "deleted"
                            ? "Eliminado"
                            : ""}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() =>
                              setOpen(
                                open === feature.properties.landplot.id
                                  ? -1
                                  : feature.properties.landplot.id
                              )
                            }
                          >
                            {open === feature.properties.landplot.id ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{
                            paddingBottom: 0,
                            paddingTop: 0,
                            border: "0px",
                          }}
                        >
                          <Collapse
                            in={open === feature.properties.landplot.id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box>
                              <TextField
                                required
                                inputProps={{ maxLength: 100 }}
                                id="description"
                                name="description"
                                label="Descripción"
                                fullWidth
                                variant="standard"
                                value={
                                  feature.properties.landplot.description || ""
                                }
                                /* onChange={handle...Change} */
                              />
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <ConfirmButton
            msg={"Se registrarán todos los cambios realizados."}
            onConfirm={handleSubmit}
            navigateDir={"/croplandplots"}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}
