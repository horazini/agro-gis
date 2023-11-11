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
import type { FeatureCollection, Feature } from "geojson";
import { useEffect, useRef, useState } from "react";
import { LayerControler, position } from "../../components/mapcomponents";
import {
  getAvailableAndOccupiedTenantGeo,
  putFeatures,
} from "../../utils/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { LatLngExpression } from "leaflet";
import {
  CancelButton,
  ConfirmButton,
  PageTitle,
} from "../../components/customComponents";

import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Apps as AppsIcon,
} from "@mui/icons-material";

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
  PageTitle("Parcelas");
  const [features, setFeatures] = useState<Feature[]>([]);
  const { tenantId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (tenantId) {
      const data = await getAvailableAndOccupiedTenantGeo(tenantId);
      setFeatures(data.features);
    }
  };

  const mapFeatureGroup = useRef<L.FeatureGroup>(null);

  useEffect(() => {
    if (mapFeatureGroup.current?.getLayers().length === 0 && features) {
      // Branch for first component load.
      // adds each geoJSON feature to the map featureGroup Ref.
      L.geoJSON(features).eachLayer((layer) => {
        if (layer.feature?.properties?.crop?.finish_date !== null) {
          if (layer instanceof L.Marker && layer.feature) {
            const featureData = layer.feature;
            const circleCenter = featureData.geometry
              .coordinates as LatLngExpression;
            const { radius } = featureData.properties.landplot;
            const circle = new L.Circle(circleCenter, {
              radius,
            });
            circle.feature = featureData;
            mapFeatureGroup.current?.addLayer(circle);
          } else if (layer instanceof L.Polygon) {
            mapFeatureGroup.current?.addLayer(layer);
            /* 
            // forma alternativa
            new L.Polygon(layer.feature.geometry.coordinates).addTo(
              mapFeatureGroup.current
            ); 
            */
          } else {
            console.log("Invalid layer type.");
            console.log(layer);
          }
        }
      });
    } else {
      // Branch for aplying style to modified layers
      mapFeatureGroup.current?.eachLayer(function (layer) {
        if (layer.feature?.properties?.status === "modified") {
          layer.options.color = "#9933ff";
          // Workaround que soluciona el error de actualización de color un paso tarde
          mapFeatureGroup.current?.removeLayer(layer);
          mapFeatureGroup.current?.addLayer(layer);
        }
      });
    }
  }, [features]);

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

      setFeatures((layers: any) => [...layers, circle]); // Almacena en GeoJSON Features
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
      setFeatures((layers: any) => [...layers, polygon]);
    }
  };

  const handleChange = (e: any) => {
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).forEach((layer: any) => {
      let FeatureToEditId = layer._leaflet_id;
      let status = "added";
      if (layer.feature) {
        FeatureToEditId = layer.feature.properties.landplot.id;
        status = "modified";
        layer.feature.properties.status = status;
      }

      if (layer.editing.latlngs) {
        // Acciones para polígonos

        setFeatures((layers: any) =>
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

        setFeatures((layers: any) =>
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
        setFeatures((existingFeatures: any) =>
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
        setFeatures((existingFeatures: any) =>
          existingFeatures.filter(
            (f: any) => f.properties.landplot.id !== FeatureToDeleteId
          )
        );
      }
    });
  };

  const CustomLayer = ({ feature }: any) => {
    const { properties, geometry } = feature;

    const isSelected =
      properties.landplot.id === selectedFeature?.properties.landplot.id;

    const pathOptions = {
      color: isSelected
        ? "#bf4000"
        : /* : isHighlighted
        ? "#33ff33" */
          "red", //"#3388ff",
    };

    const eventHandlers = {
      click: () => setSelectedFeature(feature),
      /* mouseover: () => handleLayerMouseOver(properties.landplot.id),
      mouseout: handleLayerMouseOut, */
    };

    const PopUp = (
      <div>
        <h3>Parcela ocupada</h3>
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

  const handleSubmit: () => Promise<number> = async () => {
    try {
      const featureArray = features?.filter(
        (f: any) => f.properties.status !== undefined
      );

      const FeatureCollection: FeatureCollection = {
        type: "FeatureCollection",
        features: featureArray,
      };

      const msg = {
        tenantId: tenantId || 1,
        FeatureCollection,
      };

      const res = await putFeatures(msg);
      return res;
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  // Feature arrange

  function arrangeFeatures(features: Feature[]) {
    const arranged: any = {
      vacants: [],
      occupieds: [],
      addeds: [],
      modifieds: [],
      deleteds: [],
    };

    features.forEach((feature) => {
      if (feature.properties === null) {
        return;
      }

      if (feature.properties.status === "added") {
        arranged.addeds.push(feature);
      } else if (feature.properties.status === "modified") {
        arranged.modifieds.push(feature);
      } else if (feature.properties.status === "deleted") {
        arranged.deleteds.push(feature);
      } else if (
        feature.properties.crop &&
        feature.properties.crop.finish_date === null
      ) {
        arranged.occupieds.push(feature);
      } else {
        arranged.vacants.push(feature);
      }
    });

    return arranged;
  }

  const arrangedFeatures = arrangeFeatures(features);

  const [openGroups, setOpenGroups] = useState(["vacants", "occupieds"]);

  // manual feature handling

  const [selectedFeature, setSelectedFeature] = useState<any>();

  const eventHandlers = {
    click: (e: any) => setSelectedFeature(e.layer.feature),
  };

  useEffect(() => {
    mapFeatureGroup.current?.eachLayer(function (layer) {
      const isSelected =
        layer.feature?.properties?.landplot.id ===
        selectedFeature.properties.landplot.id;

      layer.options.color = isSelected ? "#bf4000" : "#3388ff";
      mapFeatureGroup.current?.removeLayer(layer);
      mapFeatureGroup.current?.addLayer(layer);
    });
  }, [selectedFeature]);
  return (
    <Box>
      <h1>Administración de parcelas</h1>

      <MapContainer center={position} zoom={7}>
        <LayerControler />
        <FeatureGroup ref={mapFeatureGroup} eventHandlers={eventHandlers}>
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
          {features &&
            features.map((feature: any) => {
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

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            width: "max-content",
            marginTop: 4,
            borderRadius: 2,
          }}
        >
          <Table>
            <TableBody>
              {features &&
                Object.keys(arrangedFeatures).map((featureArrange: any) => (
                  <>
                    <TableRow sx={{ backgroundColor: "rgba(211,211,211,.2)" }}>
                      <TableCell></TableCell>
                      <TableCell>
                        {featureArrange === "occupieds"
                          ? "Ocupados"
                          : featureArrange === "addeds"
                          ? "Creados"
                          : featureArrange === "modifieds"
                          ? "Modificados"
                          : featureArrange === "deleteds"
                          ? "Eliminados"
                          : featureArrange === "vacants"
                          ? "Libres"
                          : null}
                      </TableCell>

                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() =>
                            openGroups.includes(featureArrange)
                              ? setOpenGroups((groups: any) =>
                                  groups.filter(
                                    (g: any) => g !== featureArrange
                                  )
                                )
                              : setOpenGroups((groups: any) => [
                                  ...groups,
                                  featureArrange,
                                ])
                          }
                        >
                          {openGroups.includes(featureArrange) ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{
                          paddingBottom: 0,
                          paddingTop: 0,
                          border: "0px",
                        }}
                      >
                        <Collapse
                          in={openGroups.includes(featureArrange)}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ margin: 1 }}>
                            <Table>
                              <TableBody>
                                {arrangedFeatures[featureArrange].length > 0 ? (
                                  arrangedFeatures[featureArrange]
                                    .sort(
                                      (a: any, b: any) =>
                                        a.properties.landplot.id -
                                        b.properties.landplot.id
                                    )
                                    .map((feature: any) => (
                                      <TableRow
                                        key={feature.properties.landplot.id}
                                      >
                                        <TableCell>
                                          {feature.properties.status !== "added"
                                            ? feature.properties.landplot.id
                                            : ""}
                                        </TableCell>
                                        <TableCell>
                                          {feature.geometry.type === "Polygon"
                                            ? "Poligonal"
                                            : "Circular"}
                                        </TableCell>
                                        <TableCell></TableCell>

                                        <TableCell>
                                          <IconButton
                                            aria-label="expand row"
                                            size="small"
                                            onClick={() =>
                                              setSelectedFeature(feature)
                                            }
                                          >
                                            <AppsIcon />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                ) : featureArrange === "occupieds" ? (
                                  <h3>No se registran parcelas ocupadas</h3>
                                ) : featureArrange === "addeds" ? (
                                  <h3>No se crearon nuevas parcelas</h3>
                                ) : featureArrange === "modifieds" ? (
                                  <h3>No se modificaron parcelas existentes</h3>
                                ) : featureArrange === "deleteds" ? (
                                  <h3>No se eliminaron parcelas existentes</h3>
                                ) : featureArrange === "vacants" ? (
                                  <h3>No se registran parcelas libres</h3>
                                ) : null}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center">
            Parcela seleccionada
          </Typography>
          {selectedFeature ? (
            <Box>
              <Typography>
                ID: {selectedFeature.properties.landplot.id}
              </Typography>
              <Typography>
                Tipo:{" "}
                {selectedFeature.geometry.type === "Polygon"
                  ? "Poligonal"
                  : "Circular"}
              </Typography>
              <Typography>
                Estado:{" "}
                {selectedFeature.properties.status === "added"
                  ? "Creada"
                  : selectedFeature.properties.status === "modified"
                  ? "Modificada"
                  : selectedFeature.properties.status === "deleted"
                  ? "Eliminada"
                  : selectedFeature.properties.crop?.finish_date === null
                  ? "Ocupada"
                  : "Libre"}
              </Typography>
              <Typography>
                Descripción: {selectedFeature.properties.landplot.description}
              </Typography>
              {selectedFeature.properties.landplot.radius && (
                <Typography>
                  Radio: {selectedFeature.properties.landplot.radius}
                </Typography>
              )}{" "}
            </Box>
          ) : null}
        </Paper>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CancelButton navigateDir={"/landplots"} />
        <ConfirmButton
          msg={"Se registrarán todos los cambios realizados."}
          onConfirm={handleSubmit}
          navigateDir={"/landplots"}
          disabled={false}
        />
      </Box>
    </Box>
  );
}
