import React, { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  LayersControl,
  Marker,
  Popup,
  useMapEvents,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "@mui/material";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import { API } from "../../config";

//import { useRef } from "react";
//import L, { LatLng, LatLngExpression } from "leaflet";

const ZOOM_LEVEL = 7;
//  const mapRef = useRef();    <-- deprecado

const PolygonMap = () => {
  const [center, setCenter] = useState({ lat: -29, lng: -58 });
  const [mapLayers, setMapLayers] = useState<any>([]);
  const [geoJSONFeatures, setGeoJSONFeatures] = useState<any>([]);
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const circleToGeoJSON = (circle: any) => {
    const { lat, lng } = circle.latlngs;
    const radius = circle.radius;
    const feature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        tenantId: tenantId,
        id: circle.id,
        subType: "Circle",
        radius,
      },
    };
    return feature;
  };

  const _onCreate = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "circle") {
      const { _leaflet_id } = layer;
      const circle = {
        tenantId: tenantId,
        id: _leaflet_id,
        latlngs: layer.getLatLng(),
        radius: layer.getRadius(),
      };
      setMapLayers((layers: any) => [...layers, circle]); // Almacena en MapLayers

      const feature = circleToGeoJSON(circle);
      setGeoJSONFeatures((features: any) => [...features, feature]); // Almacena en GeoJSON Features
    }
    if (layerType === "polygon") {
      const { _leaflet_id } = layer;

      setMapLayers((layers: any) => [
        ...layers,
        { tenantId: tenantId, id: _leaflet_id, latlngs: layer.getLatLngs()[0] },
      ]);

      const polygon = layer.toGeoJSON(); // convierte los polígonos dibujados en objetos GeoJSON.
      polygon.properties = { tenantId: tenantId, id: _leaflet_id }; // agrega una propiedad id a cada objeto GeoJSON para identificar el polígono.
      setGeoJSONFeatures((layers: any) => [...layers, polygon]);
    }
  };

  const _onEdited = (e: any) => {
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).forEach(({ _leaflet_id, layer, editing }: any) => {
      if (editing.latlngs) {
        // Acciones para polígonos
        setMapLayers((layers: any) =>
          layers.map((l: any) =>
            l.id === _leaflet_id ? { ...l, latlngs: editing.latlngs[0] } : l
          )
        );

        setGeoJSONFeatures((layers: any) =>
          layers.map((l: any) =>
            l.properties.id === _leaflet_id
              ? {
                  ...l,
                  geometry: {
                    type: "Polygon",
                    coordinates: [
                      editing.latlngs[0][0].map((latlng: any) => [
                        latlng.lng,
                        latlng.lat,
                      ]),
                    ],
                  },
                }
              : l
          )
        );
      } else {
        // Acciones para círculos
        setMapLayers((layers: any) =>
          layers.map((l: any) =>
            l.id === _leaflet_id
              ? {
                  ...l,
                  latlngs: editing._shape._latlng,
                  radius: editing._shape._mRadius,
                }
              : l
          )
        );
        setGeoJSONFeatures((layers: any) =>
          layers.map((l: any) =>
            l.properties.id === _leaflet_id
              ? {
                  ...l,
                  geometry: {
                    type: "Point",
                    coordinates: [
                      editing._shape._latlng.lng,
                      editing._shape._latlng.lat,
                    ],
                  },
                  properties: {
                    id: _leaflet_id,
                    subType: "Circle",
                    radius: editing._shape._mRadius,
                  },
                }
              : l
          )
        );
      }
    });
  };

  const _onDeleted = (e: any) => {
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).forEach(({ _leaflet_id }: any) => {
      setMapLayers((layers: any) =>
        layers.filter((l: any) => l.id !== _leaflet_id)
      );
      setGeoJSONFeatures((features: any) =>
        features.filter((f: any) => f.properties.id !== _leaflet_id)
      );
    });
  };

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      //setLoading(true);

      geoJSONFeatures.forEach(async (feature: any) => {
        await fetch(`${API}/geo`, {
          method: "POST",
          body: JSON.stringify(feature),
          headers: { "Content-type": "application/json" },
        });
      });

      //setLoading(false);
      //navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col text-center">
          <h2>React-leaflet - Crear, editar y eliminar polígonos en el mapa</h2>

          <div className="col">
            <MapContainer
              center={center}
              zoom={ZOOM_LEVEL}
              //ref={mapRef}        <-- deprecado
            >
              <FeatureGroup>
                <EditControl
                  position="topright"
                  onCreated={_onCreate}
                  onEdited={_onEdited}
                  onDeleted={_onDeleted}
                  draw={{
                    circlemarker: false,
                    polyline: false,
                    rectangle: false,
                    //circle: false,
                    //marker: false,
                  }}
                />
              </FeatureGroup>

              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              />
            </MapContainer>

            <pre className="text-left">
              {JSON.stringify(mapLayers, null, 2)}
            </pre>
            <pre className="text-left">
              {JSON.stringify(geoJSONFeatures, null, 2)}
            </pre>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleSubmit}
              //disabled={!species.name}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolygonMap;
