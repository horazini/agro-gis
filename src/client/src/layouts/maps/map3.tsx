import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Popup,
  LayerGroup,
  Circle,
} from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { GeoJsonObject } from "geojson";

import { API } from "../../config";

function App() {
  const [geojsonData, setGeoData] = useState<GeoJsonObject | undefined>();
  const [circles, setCircles] = useState<any>(null);

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const loadData = async () => {
    const response = await fetch(`${API}/tenantGeo/${tenantId}`);
    const data = await response.json();
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

  const onEachFeature = (
    feature: { properties: { id: number; description: string } },
    layer: { bindPopup: (arg0: string) => void }
  ) => {
    // Crea una variable con el contenido del pop-up
    const popupContent = `
        <div>
          <h3>${feature.properties.id}</h3>
          <p>${feature.properties.description}</p>
        </div>
      `;
    // Asigna el pop-up al layer cuando se hace clic en él
    layer.bindPopup(popupContent);
  };

  return (
    <div>
      <h1>Mapa con pop-ups en React-Leaflet</h1>

      <MapContainer
        center={[-29, -58]} // Especifica las coordenadas del centro del mapa
        zoom={7} // Especifica el nivel de zoom inicial
        style={{ height: "100vh", width: "100%" }} // Establece un tamaño para el mapa
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {geojsonData && (
          <GeoJSON data={geojsonData} onEachFeature={onEachFeature} />
        )}

        <LayerGroup>
          {circles &&
            circles.map((circle: any) => {
              return (
                <Circle
                  key={circle.properties.id}
                  center={circle.geometry.coordinates}
                  radius={circle.properties.radius}
                />
              );
            })}
        </LayerGroup>
      </MapContainer>
    </div>
  );
}

export default App;
