import { useEffect, useState } from "react";
import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
  GeoJSON,
  Circle,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

import L from "leaflet";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import { API } from "../../config";

const position: LatLngExpression = [-29, -58];

const LeafIcon: any = L.Icon.extend({
  options: {
    iconSize: [25, 40],
    shadowSize: [50, 64],
    iconAnchor: [12.5, 40],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -50],
  },
});
var icon = new LeafIcon({
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

function LayerControler(): JSX.Element {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="Esri.WorldImagery">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer name="Open Topo Map">
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>) &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer name="Open Street Map">
        <TileLayer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </LayersControl.BaseLayer>

      <LayersControl.Overlay name="Posición actual">
        <LocationMarker />
      </LayersControl.Overlay>
    </LayersControl>
  );
}

const MapView = () => {
  const mystyle = {};

  const [geoData, setGeoData] = useState<any>(null);
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
