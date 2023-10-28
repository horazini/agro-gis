import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Popup,
  Circle,
  LayerGroup,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import {
  getTenantGeoData,
  getTenantSpecies,
  postCrop,
  speciesMainData,
} from "../../services/services";

import {
  position,
  LayerControler,
  FeatureInfo,
} from "../../components/mapcomponents";
import {
  FormControl,
  Card,
  Box,
  Autocomplete,
  TextField,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { ConfirmButton } from "../../components/customComponents";
import { useNavigate } from "react-router";
import PageTitle from "../../components/title";
import { LatLngExpression } from "leaflet";
import L from "leaflet";

interface ICrop {
  landplot: number;
  species: number;
  tenant_id: number;
  date: string;
}

const LandplotsAndCrops = () => {
  PageTitle("Parcelas y cultivos");
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [geoData, setGeoData] = useState<any>();
  const [species, setSpecies] = useState<speciesMainData[]>([]);

  const loadData = async () => {
    if (tenantId) {
      const data = await getTenantGeoData(tenantId);
      setGeoData(data);
    }
  };

  const loadSpecies = async () => {
    if (tenantId) {
      const data = await getTenantSpecies(tenantId);
      setSpecies(data);
    }
  };

  useEffect(() => {
    loadData();
    loadSpecies();
  }, []);

  // Manejo de alta de cultivo: parcela, especie y fecha inicial

  const [crop, setCrop] = useState<ICrop>({
    landplot: 0,
    species: 0,
    tenant_id: tenantId || 1,
    date: "",
  });

  const mapRef = useRef<any>();

  useEffect(() => {
    if (
      mapRef === null ||
      selectedFeature === null ||
      selectedFeature === undefined
    ) {
      return;
    }
    const { properties, geometry } = selectedFeature;

    let coords: LatLngExpression = position;
    let zoom = 13;

    if (geometry.type === "Polygon") {
      const coordinates = geometry.coordinates[0].map(([lng, lat]: any) => [
        lat,
        lng,
      ]);

      const p = L.polygon(coordinates).addTo(mapRef.current);
      const bounds = p.getBounds();
      coords = bounds.getCenter();
      zoom = mapRef.current.getBoundsZoom(bounds);
      p.remove();
    } else if (
      geometry.type === "Point" &&
      properties.landplot.subType === "Circle"
    ) {
      coords = geometry.coordinates as LatLngExpression;

      const radius = properties.landplot.radius as number;

      const c = L.circle(geometry.coordinates, { radius }).addTo(
        mapRef.current
      );
      const bounds = c.getBounds();
      zoom = mapRef.current.getBoundsZoom(bounds);
      c.remove();
    }
    mapRef.current.flyTo(coords, zoom);
  }, [crop.landplot]);

  const selectedFeature = geoData
    ? geoData.features.find(
        (feature: { properties: { landplot: { id: number } } }) =>
          feature.properties.landplot.id === crop.landplot
      )
    : null;

  const [isDateValid, setIsDateValid] = useState<boolean>(false);

  function handleDateChange(date: any) {
    if (!Number.isNaN(new Date(date).getTime())) {
      const isoDate = date.toISOString(); // Convertir la fecha a formato ISO 8601
      setCrop((prevCrop) => ({
        ...prevCrop,
        date: isoDate,
      }));
      setIsDateValid(true);
    } else {
      setIsDateValid(false);
    }
  }

  // Comportamiento de las Layers

  const CustomLayer = ({ feature }: any) => {
    const { properties, geometry } = feature;

    const [highlightedLayerId, setHighlightedLayerId] = useState<number | null>(
      null
    );
    const handleLayerMouseOver = (layerId: number) => {
      setHighlightedLayerId(layerId);
    };

    const handleLayerMouseOut = () => {
      setHighlightedLayerId(null);
    };

    const isHighlighted = highlightedLayerId === properties.landplot.id;
    const isSelected = crop.landplot === properties.landplot.id;
    const isOccupied = properties.crop && properties.crop?.finish_date === null;

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

    const eventHandlers = {
      click: () =>
        setCrop((prevCrop) => ({
          ...prevCrop,
          landplot: properties.landplot.id,
        })),
      mouseover: () => handleLayerMouseOver(properties.landplot.id),
      mouseout: handleLayerMouseOut,
    };

    const PopUp = (
      <div>
        <h3>ID: {properties.landplot.id}</h3>
        <p>Descripción: {properties.landplot.description}</p>
        {properties.landplot.radius && (
          <p>Radio: {properties.landplot.radius} m.</p>
        )}
      </div>
    );

    if (geometry.type === "Polygon") {
      const coordinates = geometry.coordinates[0].map(([lng, lat]: any) => [
        lat,
        lng,
      ]);
      return (
        <Polygon
          key={properties.landplot.id}
          positions={coordinates}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      geometry.type === "Point" &&
      properties.landplot.subType === "Circle"
    ) {
      return (
        <Circle
          key={properties.landplot.id}
          center={geometry.coordinates}
          radius={properties.landplot.radius}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Circle>
      );
    }
    return null;
  };

  // Confirmar datos

  const handleSubmitForm: () => Promise<number> = async () => {
    try {
      const res = await postCrop(crop);
      return res;
    } catch (error) {
      console.log(error);
      return 400;
    }
  };

  const navigate = useNavigate();

  return (
    <Box
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Parcelas y cultivos</h1>
      <MapContainer center={position} zoom={7} ref={mapRef}>
        <LayerControler />
        <LayerGroup>
          {geoData &&
            geoData.features.map((feature: any) => {
              return (
                <CustomLayer
                  key={feature.properties.landplot.id}
                  feature={feature}
                />
              );
            })}
        </LayerGroup>
      </MapContainer>

      <Box ml={2} mb={2} mr={2}>
        {(selectedFeature &&
          FeatureInfo(selectedFeature.properties, navigate)) || (
          <h2>Seleccione una parcela</h2>
        )}
      </Box>

      <Card
        variant="outlined"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light" ? theme.palette.grey[100] : null,
        }}
      >
        <Box ml={2} mb={2} mr={2}>
          <h2>Alta de cultivos</h2>
          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
              {geoData ? (
                <Autocomplete
                  id="landplot-autocomplete"
                  options={geoData.features.sort(
                    (a: any, b: any) =>
                      a.properties.landplot.id - b.properties.landplot.id
                  )}
                  getOptionLabel={(option: any) =>
                    "Parcela " +
                    option.properties.landplot.id +
                    (option.properties.landplot.description
                      ? " - " + option.properties.landplot.description
                      : "")
                  }
                  value={
                    geoData.features.find(
                      (feature: any) =>
                        feature.properties.landplot.id === crop.landplot
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    setCrop((prevCrop) => ({
                      ...prevCrop,
                      landplot: newValue?.properties.landplot.id || 0,
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Parcela" />
                  )}
                />
              ) : null}
            </FormControl>
            <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
              {species ? (
                <Autocomplete
                  id="species-autocomplete"
                  options={species}
                  getOptionLabel={(option: any) => option.name}
                  value={
                    species.find((specie: any) => specie.id === crop.species) ||
                    null
                  }
                  onChange={(_, newValue) =>
                    setCrop((prevCrop) => ({
                      ...prevCrop,
                      species: newValue?.id || 0,
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Especie" />
                  )}
                />
              ) : null}
            </FormControl>
            <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
              <DatePicker
                format="DD/MM/YYYY"
                label="Fecha"
                onChange={handleDateChange}
              />
            </FormControl>

            <Box>
              <ConfirmButton
                msg={"Se dará de alta al cultivo en la parcela seleccionada."}
                onConfirm={handleSubmitForm}
                navigateDir={"/"}
                disabled={
                  !Object.values(crop).every((value) => !!value) ||
                  (selectedFeature?.properties?.crop &&
                    selectedFeature?.properties?.crop?.finish_date === null) ||
                  !isDateValid
                }
              />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default LandplotsAndCrops;
