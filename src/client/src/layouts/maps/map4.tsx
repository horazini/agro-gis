import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import "dayjs/locale/es"; // Importa el idioma que deseas utilizar

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

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getTenantGeo, getTenantSpecies } from "../../services/services";
import { ConfirmButton } from "../../components/confirmform";

interface ICrop {
  landplot: number;
  species: number;
  tenant_id: number;
  date: string;
}

interface RowData {
  properties: {
    id: number;
    description: string;
    radius: null | number;
  };
}

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

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [geoData, setGeoData] = useState<any>(null);
  const [species, setSpecies] = useState<any[]>([]);

  const loadData = async () => {
    const data = await getTenantGeo(tenantId);
    setGeoData(data);
  };

  const loadSpecies = async () => {
    const data = await getTenantSpecies(tenantId);
    setSpecies(data);
  };

  useEffect(() => {
    loadData();
    loadSpecies();
  }, []);

  //

  const [selectedFeature, setSelectedFeature] = useState<RowData | null>(null);

  const PolygonPopup = (
    feature: RowData,
    layer: {
      bindPopup: (arg0: string) => void;
      on: (arg0: string, arg1: () => void) => void;
    }
  ) => {
    const handlePopupClick = () => {
      setCrop((prevCrop) => ({
        ...prevCrop,
        landplot: feature.properties.id,
      }));
      setSelectedFeature(feature);
    };
    const popupContent = `
      <div>
        <h3>ID: ${feature.properties.id}</h3>
        <p>Descripción: ${feature.properties.description}</p>
      </div>
    `;
    layer.bindPopup(popupContent);
    layer.on("click", handlePopupClick);
  };

  // Manejo de alta de cultivo: parcela, especie y fecha inicial

  const [crop, setCrop] = useState<ICrop>({
    landplot: 0,
    species: 0,
    tenant_id: tenantId || 1,
    date: "",
  });

  const handleFormChange = (e: { target: { name: string; value: string } }) => {
    setCrop({ ...crop, [e.target.name]: e.target.value });
  };

  function handleChangeDate(date: any) {
    const isoDate = date.toISOString(); // Convertir la fecha a formato ISO 8601
    setCrop((prevCrop) => ({
      ...prevCrop,
      date: isoDate,
    }));
  }

  function handleLandplotChange(e: {
    target: { name: string; value: string };
  }) {
    setCrop((prevCrop) => ({
      ...prevCrop,
      landplot: Number(e.target.value),
    }));
    const found = geoData.features.find(
      (feature: { properties: { id: number } }) =>
        feature.properties.id === Number(e.target.value)
    );
    setSelectedFeature(found);
  }

  // Confirmar datos

  const handleSubmitForm = async () => {
    try {
      const body = JSON.stringify(crop);
      console.log(body);
    } catch (error) {
      console.log(error);
    }
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
          <>
            <GeoJSON
              key="my-polygons"
              style={mystyle}
              data={geoData.features.filter(
                (feature: any) => feature.geometry.type === "Polygon"
              )}
              onEachFeature={PolygonPopup}
            />
            <LayerGroup>
              {geoData.features
                .filter(
                  (feature: any) => feature.properties.subType === "Circle"
                )
                .map((circle: any) => {
                  const handleCircleClick = () => {
                    setCrop((prevCrop) => ({
                      ...prevCrop,
                      landplot: circle.properties.id,
                    }));
                    setSelectedFeature(circle);
                  };

                  return (
                    <Circle
                      key={circle.properties.id}
                      center={circle.geometry.coordinates}
                      radius={circle.properties.radius}
                      eventHandlers={{
                        click: handleCircleClick,
                      }}
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
          </>
        )}
      </MapContainer>

      {(selectedFeature && (
        <div>
          <h2>Información seleccionada:</h2>
          <p>Parcela N.° {selectedFeature.properties.id}</p>
          <p>Descripción: {selectedFeature.properties.description}</p>
          {selectedFeature.properties.radius && (
            <p>Radio: {selectedFeature.properties.radius.toFixed(2)} m.</p>
          )}
        </div>
      )) || <h2>Seleccione una parcela</h2>}

      <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
        <InputLabel>Parcela</InputLabel>
        <Select
          label="Landplot"
          name="landplot"
          value={crop.landplot.toString()}
          onChange={handleLandplotChange}
        >
          <MenuItem value="0" disabled>
            Seleccione una parcela
          </MenuItem>
          {geoData &&
            geoData.features.map((item: any) => (
              <MenuItem key={item.properties.id} value={item.properties.id}>
                Parcela {item.properties.id + " "} {item.properties.description}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
        <InputLabel>Especie</InputLabel>
        <Select
          label="Species"
          name="species"
          value={crop.species.toString()}
          onChange={handleFormChange}
        >
          <MenuItem value="0" disabled>
            Seleccione una especie
          </MenuItem>
          {species.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
        <DatePicker
          format="DD/MM/YYYY"
          label="Fecha"
          onChange={handleChangeDate}
        />
      </FormControl>
      <ConfirmButton
        msg={"Se dará de alta al cultivo en la parcela seleccionada."}
        onConfirm={handleSubmitForm}
        navigateDir={"/"}
        disabled={!Object.values(crop).every((value) => !!value)}
      />
    </div>
  );
};

export default MapView;
