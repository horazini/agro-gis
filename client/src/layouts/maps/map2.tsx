import { Fragment, useState } from "react";

import { MapContainer, FeatureGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import { position, LayerControler } from "../../components/mapcomponents";

const MapView = () => {
  const [geoJSONFeatures, setGeoJSONFeatures] = useState<any>([]);
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const circleToGeoJSON = (circle: any) => {
    const { lat, lng } = circle.latlngs;
    const radius = circle.radius.toFixed(2);
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

      const feature = circleToGeoJSON(circle);
      setGeoJSONFeatures((features: any) => [...features, feature]); // Almacena en GeoJSON Features
    }
    if (layerType === "polygon") {
      const { _leaflet_id } = layer;

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
                    radius: editing._shape._mRadius.toFixed(2),
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
      setGeoJSONFeatures((features: any) =>
        features.filter((f: any) => f.properties.id !== _leaflet_id)
      );
    });
  };

  return (
    <Fragment>
      <div className="row">
        <div className="col text-center">
          <h1>Crear, editar y eliminar polígonos y círculos en el mapa</h1>

          <div className="col">
            <MapContainer
              center={position}
              zoom={7}
              //ref={mapRef}        <-- deprecado
            >
              <LayerControler />
              <FeatureGroup>
                <EditControl
                  position="topleft"
                  onCreated={_onCreate}
                  onEdited={_onEdited}
                  onDeleted={_onDeleted}
                  draw={{
                    circlemarker: false,
                    polyline: false,
                    rectangle: false,
                    circle: true,
                    marker: true,
                    polygon: true,
                  }}
                />
              </FeatureGroup>
            </MapContainer>

            <pre className="text-left">
              {JSON.stringify(geoJSONFeatures, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default MapView;
