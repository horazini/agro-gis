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

import { getTenantGeoData, getTenantSpecies } from "../../services/services";
import { Feature, FeatureCollection } from "geojson";

import { position, LayerControler, Crop } from "../../components/mapcomponents";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Species = {
  id: number;
  name: string;
  description: string;
};

const MapView = () => {
  const navigate = useNavigate();
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [geoData, setGeoData] = useState<FeatureCollection>();
  const [species, setSpecies] = useState<Species[]>([]);

  const loadData = async () => {
    const data = await getTenantGeoData(tenantId);
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

  // Manejo de alta de cultivo: parcela, especie y fecha inicial

  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  function handleLandplotChange(feature: Feature) {
    setSelectedFeature(feature);
  }

  // Comportamiento de las Layers

  const CustomLayer = ({ feature }: any) => {
    const { id, crop, description } = feature.properties;
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
    const isSelected = (selectedFeature?.properties?.id ?? null) === id;
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
        {feature.properties?.radius && (
          <p>Radio: {feature.properties.radius} m.</p>
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
    } else if (type === "Point" && feature.properties.subType === "Circle") {
      return (
        <Circle
          key={id}
          center={feature.geometry.coordinates}
          radius={feature.properties.radius}
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
  const CropInfo = (crop: Crop) => {
    const startDate = new Date(crop.start_date).toLocaleDateString("en-GB");
    const finishDate = new Date(crop.finish_date || "").toLocaleDateString(
      "en-GB"
    );

    const cropSpecies = species.find(
      (specie) => specie.id === crop.species_id
    )?.name;

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
        <p>Especie: {cropSpecies}</p>
        {crop.description && <p>description: {crop.description}</p>}
        <Button
          variant="contained"
          onClick={() => navigate(`/cropdetails/${crop.id}`)}
        >
          Ver detalles del cultivo
        </Button>
      </Box>
    );
  };

  const featureInfo = (feature: any) => {
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
        {(feature.properties?.crop && CropInfo(feature.properties.crop)) || (
          <Fragment>
            <h2>Parcela libre</h2>
            <h3>No se registran cultivos en esta parcela.</h3>
          </Fragment>
        )}
      </Box>
    );
  };

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
                <CustomLayer key={feature.properties?.id} feature={feature} />
              );
            })}
        </LayerGroup>
      </MapContainer>

      {(selectedFeature && featureInfo(selectedFeature)) || (
        <h2>Seleccione una parcela</h2>
      )}
    </Box>
  );
};

export default MapView;
