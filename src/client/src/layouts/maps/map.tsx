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

const MapView = () => {
  const mystyle = {};

  const [geoData, setGeoData] = useState<any>(null);
  const [circles, setCircles] = useState<any>(null);

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
    layer: { bindPopup: (arg0: string) => void }
  ) => {
    // Crea una variable con el contenido del pop-up
    const popupContent = `
        <div>
          <h3>ID: ${feature.properties.id}</h3>
          <p>Descripción: ${feature.properties.description}</p>
        </div>
      `;
    // Asigna el pop-up al layer cuando se hace clic en él
    layer.bindPopup(popupContent);
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
            style={mystyle}
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
                  <Popup>
                    <div>
                      <h3>ID: {circle.properties.id}</h3>
                      <p>Descripción: {circle.properties.description}</p>
                      <p>Radio: {circle.properties.radius.toFixed(2)} m.</p>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
        </LayerGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
