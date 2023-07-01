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
import type { FeatureCollection } from "geojson";
import { useEffect, useRef, useState } from "react";
import { LayerControler, position } from "../../components/mapcomponents";
import { getTenantGeoData } from "../../services/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { LatLngExpression } from "leaflet";
import { ConfirmButton } from "../../components/confirmform";

type CircleFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: LatLngExpression;
  };
  properties: {
    id: string;
    radius: number;
  };
};

export default function EditControlFC() {
  const [geojson, setGeojson] = useState<FeatureCollection>();
  const [occupiedLandplots, setOccupiedLandplots] = useState<any>(null);
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const loadData = async () => {
    const data = await getTenantGeoData(tenantId);

    setGeojson(
      data.features.filter(
        (feature: any) => feature.properties.crop?.finish_date !== null
      )
    );
    setOccupiedLandplots(
      data.features.filter(
        (feature: any) => feature.properties.crop?.finish_date === null
      )
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const ref = useRef<L.FeatureGroup>(null);

  useEffect(() => {
    if (ref.current?.getLayers().length === 0 && geojson) {
      L.geoJSON(geojson).eachLayer((layer) => {
        if (
          layer instanceof L.Polyline ||
          layer instanceof L.Polygon ||
          layer instanceof L.Marker
        ) {
          if (layer?.feature?.properties.radius && ref.current) {
            new L.Circle(layer.feature.geometry.coordinates, {
              radius: layer.feature?.properties.radius,
            }).addTo(ref.current);
          } else {
            ref.current?.addLayer(layer);
          }
        }
      });
    }
  }, [geojson]);

  const handleChange = () => {
    const geo = ref.current?.toGeoJSON();
    console.log(geo);
    if (geo?.type === "FeatureCollection") {
      setGeojson(geo);
    }
  };

  const CustomLayer = ({ feature }: any) => {
    const pathOptions = {
      color: "red",
    };

    const PopUp = (
      <div>
        <h3>ID: {feature.properties.id}</h3>
        <p>Descripción: {feature.properties.description}</p>
        {feature.properties?.radius && (
          <p>Radio: {feature.properties.radius} m.</p>
        )}
      </div>
    );

    if (feature.geometry.type === "Polygon") {
      const coordinates = feature.geometry.coordinates[0].map(
        ([lng, lat]: any) => [lat, lng]
      );
      return (
        <Polygon
          key={feature.properties.id}
          positions={coordinates}
          pathOptions={pathOptions}
        >
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      feature.geometry.type === "Point" &&
      feature.properties.subType === "Circle"
    ) {
      return (
        <Circle
          key={feature.properties.id}
          center={feature.geometry.coordinates}
          radius={feature.properties.radius}
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
      //await postFeatures(geoJSONFeatures);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="row">
      <div className="col text-center">
        <h1>Crear, editar y eliminar polígonos y círculos en el mapa</h1>

        <div className="col">
          <MapContainer center={position} zoom={7}>
            <FeatureGroup ref={ref}>
              <LayerControler />
              <EditControl
                position="topright"
                onEdited={handleChange}
                onCreated={handleChange}
                onDeleted={handleChange}
                draw={{
                  rectangle: false,
                  circle: true,
                  polyline: false,
                  polygon: true,
                  marker: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>

            <LayerGroup>
              {occupiedLandplots &&
                occupiedLandplots.map((feature: any) => {
                  return (
                    <CustomLayer
                      key={feature.properties.id}
                      feature={feature}
                    />
                  );
                })}
            </LayerGroup>
          </MapContainer>

          <pre className="text-left">{JSON.stringify(geojson, null, 2)}</pre>

          <ConfirmButton
            msg={"Se registrarán todos los cambios realizados."}
            onConfirm={handleSubmit}
            navigateDir={"/map"}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}
