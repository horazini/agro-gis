import { Fragment, useEffect, useState } from "react";
import {
  MapContainer,
  Popup,
  Circle,
  LayerGroup,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LayerEvent } from "leaflet";

import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import { getTenantGeoData } from "../../services/services";
import { Feature, FeatureCollection } from "geojson";

import {
  position,
  LayerControler,
  FeatureInfo,
} from "../../components/mapcomponents";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/title";

const MapView = () => {
  PageTitle("Cultivos en curso");
  const navigate = useNavigate();
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [geoData, setGeoData] = useState<FeatureCollection>();

  const loadData = async () => {
    const data = await getTenantGeoData(tenantId);
    setGeoData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Manejo de alta de cultivo: parcela, especie y fecha inicial

  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  function handleLandplotChange(feature: Feature) {
    setSelectedFeature(feature);
  }

  // Comportamiento de las Layers

  const CustomLayer = ({ feature }: any) => {
    const { landplot, crop } = feature.properties;
    const { id, description } = landplot;
    const { type } = feature.geometry;

    const [highlightedLayerId, setHighlightedLayerId] = useState<number | null>(
      null
    );
    const handleLayerMouseOver = (layerId: number) => {
      setHighlightedLayerId(layerId);
    };

    const handleLayerMouseOut = () => {
      setHighlightedLayerId(null);
    };

    const isHighlighted = highlightedLayerId === id;
    const isSelected =
      (selectedFeature?.properties?.landplot.id ?? null) === id;
    const isOccupied = crop && crop?.finish_date === null;

    const pathOptions = {
      color: isSelected
        ? "#bf4000"
        : isHighlighted
        ? "#33ff33"
        : isOccupied
        ? "red"
        : "#3388ff",
      weight: isSelected ? 4 : isHighlighted ? 4 : 3,
    };

    const handleLayerClick = (event: LayerEvent, feature: Feature) => {
      handleLandplotChange(feature);
    };

    const eventHandlers = {
      click: (event: LayerEvent) => handleLayerClick(event, feature),
      mouseover: () => handleLayerMouseOver(id),
      mouseout: handleLayerMouseOut,
    };

    const PopUp = (
      <div>
        <h3>ID: {id}</h3>
        <p>Descripción: {description}</p>
        {feature.properties?.landplot.radius && (
          <p>Radio: {feature.properties.landplot.radius} m.</p>
        )}
      </div>
    );

    if (type === "Polygon") {
      const coordinates = feature.geometry.coordinates[0].map(
        ([lng, lat]: number[]) => [lat, lng]
      );
      return (
        <Polygon
          key={id}
          positions={coordinates}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      type === "Point" &&
      feature.properties.landplot.subType === "Circle"
    ) {
      return (
        <Circle
          key={id}
          center={feature.geometry.coordinates}
          radius={feature.properties.landplot.radius}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Circle>
      );
    }
    return null;
  };
  //
  return (
    <Box
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Parcelas y cultivos en curso</h1>
      <MapContainer center={position} zoom={7}>
        <LayerControler />
        <LayerGroup>
          {geoData &&
            geoData.features.map((feature: Feature) => {
              return (
                <CustomLayer
                  key={feature.properties?.landplot.id}
                  feature={feature}
                />
              );
            })}
        </LayerGroup>
      </MapContainer>

      {(selectedFeature &&
        FeatureInfo(selectedFeature.properties, navigate)) || (
        <h2>Seleccione una parcela</h2>
      )}
    </Box>
  );
};

export default MapView;
