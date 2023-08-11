import { useEffect, useState } from "react";
import {
  MapContainer,
  Popup,
  GeoJSON,
  Circle,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import { getTenantGeo } from "../../services/services";

import { position, LayerControler } from "../../components/mapcomponents";
import { GeoJsonObject } from "geojson";
import L, { LatLng, LatLngLiteral, Polygon, GeometryUtil } from "leaflet";

const MapView = () => {
  const [geoData, setGeoData] = useState<GeoJsonObject>();
  const [circles, setCircles] = useState<(typeof Circle)[]>();

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const loadData = async () => {
    const data = await getTenantGeo(tenantId);
    setGeoData(
      data.features.filter(
        (feature: any) => feature.geometry.type === "Polygon"
      )
    );
    setCircles(
      data.features.filter(
        (feature: any) => feature.properties.subType === "Circle"
      )
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const PolygonPopup = (
    feature: { properties: { id: number; description: string } },
    layer: Polygon
  ) => {
    // Crea una variable con el contenido del pop-up

    const latLngs: LatLng[] = layer.getLatLngs()[0] as LatLng[];
    const latLngLiterals: LatLngLiteral[] = latLngs.map((latLng: LatLng) => ({
      lat: latLng.lat,
      lng: latLng.lng,
    }));
    const area = GeometryUtil.geodesicArea(latLngLiterals);
    const formatedArea = GeometryUtil.readableArea(area, true);

    const popupContent = `
        <div>
          <h3>ID: ${feature.properties.id}</h3>
          <p>Descripción: ${feature.properties.description}</p>
          <p>Área: ${formatedArea}</p>
        </div>
      `;
    // Asigna el pop-up al layer cuando se hace clic en él
    layer.bindPopup(popupContent);
  };

  const CirclePopup = (properties: any) => {
    const area = Math.PI * Math.pow(properties.radius, 2);
    let formatedArea = "";
    if (area < 10000) {
      formatedArea = area.toFixed(2) + " m²";
    } else {
      formatedArea = (area / 10000).toFixed(2) + " ha";
    }

    return (
      <Popup>
        <div>
          <h3>ID: {properties.id}</h3>
          <p>Descripción: {properties.description}</p>
          <p>Radio: {properties.radius.toFixed(2)} m.</p>
          <p>Área: {formatedArea}</p>
        </div>
      </Popup>
    );
  };

  return (
    <div
      style={{
        //display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Mapa</h1>
      <MapContainer center={position} zoom={7}>
        <LayerControler />
        {geoData && (
          <GeoJSON
            key="my-polygons"
            data={geoData}
            onEachFeature={PolygonPopup}
          />
        )}

        <LayerGroup>
          {circles &&
            circles.map((circle: any) => {
              return (
                <Circle
                  key={circle.properties.id}
                  center={circle.geometry.coordinates}
                  radius={circle.properties.radius}
                >
                  {CirclePopup(circle.properties)}
                </Circle>
              );
            })}
        </LayerGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
