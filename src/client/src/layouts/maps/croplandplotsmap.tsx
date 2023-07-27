import { useEffect, useState } from "react";
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

import { position, LayerControler } from "../../components/mapcomponents";

type Species = {
  id: number;
  name: string;
  description: string;
  tenant_id: number;
};

type Crop = {
  id: number;
  species_id: number;
  description: string | null;
  start_date: string;
  finish_date: string | null;
};

const MapView = () => {
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

  const cropInfo = (crop: Crop) => {
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
          <>
            <h2>Parcela libre</h2>
            <h3>Última cosecha:</h3>
          </>
        )) || (
          <>
            <h2>Parcela ocupada</h2>
            <h3>Cultivo actual:</h3>
          </>
        )}
        <p>Fecha de plantación: {startDate}</p>
        {crop.finish_date && <p>Fecha de cosecha: {finishDate}</p>}
        <p>Especie: {cropSpecies}</p>
        {crop.description && <p>description: {crop.description}</p>}
      </div>
    );
  };

  return (
    <div
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

      {(selectedFeature && (
        <div>
          <h2>Información seleccionada:</h2>
          <p>Parcela N.° {selectedFeature.properties?.id}</p>
          {selectedFeature.properties?.description && (
            <p>Descripción: {selectedFeature.properties?.description}</p>
          )}
          {selectedFeature.properties?.radius && (
            <p>Radio: {selectedFeature.properties?.radius.toFixed(2)} m.</p>
          )}
          {(selectedFeature.properties?.crop &&
            cropInfo(selectedFeature.properties.crop)) || (
            <>
              <h2>Parcela libre</h2>
              <h3>No se registran cultivos en esta parcela.</h3>
            </>
          )}
        </div>
      )) || <h2>Seleccione una parcela</h2>}
    </div>
  );
};

export default MapView;
