import { Fragment, useState } from "react";
import {
  LayersControl,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

import L from "leaflet";
import { Box } from "@mui/material";

export const position: LatLngExpression = [-29, -58];

const LeafIcon: any = L.Icon.extend({
  options: {
    iconSize: [25, 40],
    shadowSize: [50, 64],
    iconAnchor: [12.5, 40],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -50],
  },
});

const icon = new LeafIcon({
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

export function LayerControler(): JSX.Element {
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
      <LayersControl.BaseLayer name="Stadia Alidade Smooth Dark">
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        />
      </LayersControl.BaseLayer>

      <LayersControl.Overlay name="Posición actual">
        <LocationMarker />
      </LayersControl.Overlay>
    </LayersControl>
  );
}

type Species = {
  id: number;
  name: string;
  description: string;
};

type Crop = {
  id: number;
  species_id: number;
  description: string | null;
  start_date: string;
  finish_date: string | null;
};

const cropInfo = (crop: Crop, species: Species[]) => {
  const startDate = new Date(crop.start_date).toLocaleDateString("en-GB");
  const finishDate = new Date(crop.finish_date || "").toLocaleDateString(
    "en-GB"
  );

  const cropSpecies = species.find(
    (specie) => specie.id === crop.species_id
  )?.name;

  return (
    <div>
      {(crop.finish_date && (
        <Fragment>
          <h2>Parcela libre</h2>
          <h3>Última cosecha:</h3>
        </Fragment>
      )) || (
        <Fragment>
          <h2>Parcela ocupada</h2>
          <h3>Cultivo actual:</h3>
        </Fragment>
      )}
      <p>Fecha de plantación: {startDate}</p>
      {crop.finish_date && <p>Fecha de cosecha: {finishDate}</p>}
      <p>Especie: {cropSpecies}</p>
      {crop.description && <p>description: {crop.description}</p>}
    </div>
  );
};

export const featureInfo = (feature: any, species: Species[]) => {
  return (
    <Box>
      <h2>Información seleccionada:</h2>
      <p>Parcela N.° {feature.properties?.id}</p>
      {feature.properties?.description && (
        <p>Descripción: {feature.properties?.description}</p>
      )}
      {feature.properties?.radius && (
        <p>Radio: {feature.properties?.radius.toFixed(2)} m.</p>
      )}
      {(feature.properties?.crop &&
        cropInfo(feature.properties.crop, species)) || (
        <Fragment>
          <h2>Parcela libre</h2>
          <h3>No se registran cultivos en esta parcela.</h3>
        </Fragment>
      )}
    </Box>
  );
};
