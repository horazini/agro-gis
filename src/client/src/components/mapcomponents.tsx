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
import { Box, Button } from "@mui/material";
import { NavigateFunction } from "react-router-dom";

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

export type Crop = {
  id: number;
  species_id: number;
  species_name: string;
  description: string | null;
  start_date: string;
  finish_date: string | null;
};

const CropInfo = (crop: Crop, navigate: NavigateFunction) => {
  const startDate = new Date(crop.start_date).toLocaleDateString("en-GB");
  const finishDate = new Date(crop.finish_date || "").toLocaleDateString(
    "en-GB"
  );

  return (
    <Box>
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
      <Box style={{ display: "flex", justifyContent: "space-between" }}>
        <p>Especie: {crop.species_name}</p>
        {crop.description && <p>description: {crop.description}</p>}
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/cropdetails/${crop.id}`)}
          >
            detalles del cultivo
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export const FeatureInfo = (
  featureProperties: any,
  navigate: NavigateFunction
) => {
  const { landplot, crop } = featureProperties;
  return (
    <Box>
      <h2>Información seleccionada:</h2>
      <Box style={{ display: "flex", justifyContent: "space-between" }}>
        <p>Parcela N.° {landplot.id}</p>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/landplotdetails/${landplot.id}`)}
          >
            detalles de la parcela
          </Button>
        </Box>
      </Box>
      {landplot.description && <p>Descripción: {landplot.description}</p>}
      {landplot.radius && <p>Radio: {landplot.radius.toFixed(2)} m.</p>}
      {(crop && CropInfo(crop, navigate)) || (
        <Fragment>
          <h2>Parcela libre</h2>
          <h3>No se registran cultivos en esta parcela.</h3>
        </Fragment>
      )}
    </Box>
  );
};

/**
 *
 * @param {number} area - the area in square meters, as it is returned by the PostGIS ST_Area function.
 * @returns {string} the formatted area in either square meters or hectares
 */
export function FormattedArea(area: number): string {
  let formatedArea = area + " m²";
  if (area > 10000) {
    formatedArea = (area / 10000).toFixed(2) + " ha.";
  }
  return formatedArea;
}
