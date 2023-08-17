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

import {
  getTenantGeoData,
  getTenantSpecies,
  postCrop,
  speciesMainData,
} from "../../services/services";
import { Feature } from "geojson";

import {
  position,
  LayerControler,
  featureInfo,
} from "../../components/mapcomponents";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { ConfirmButton } from "../../components/customComponents";

interface ICrop {
  landplot: number;
  species: number;
  tenant_id: number;
  date: string;
}

const MapView = () => {
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [geoData, setGeoData] = useState<any>();
  const [species, setSpecies] = useState<speciesMainData[]>([]);

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

  function handleLandplotChange(cropId: number) {
    setCrop((prevCrop) => ({
      ...prevCrop,
      landplot: cropId,
    }));
    const found: Feature = geoData.features.find(
      (feature: { properties: { id: number } }) =>
        feature.properties.id === cropId
    );
    setSelectedFeature(found);
    setLandplotError(false);
  }

  const [crop, setCrop] = useState<ICrop>({
    landplot: 0,
    species: 0,
    tenant_id: tenantId || 1,
    date: "",
  });

  const handleFormChange = (e: { target: { name: string; value: string } }) => {
    setCrop({ ...crop, [e.target.name]: e.target.value });
  };

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
    const [highlightedLayerId, setHighlightedLayerId] = useState<number | null>(
      null
    );
    const handleLayerMouseOver = (layerId: number) => {
      setHighlightedLayerId(layerId);
    };

    const handleLayerMouseOut = () => {
      setHighlightedLayerId(null);
    };

    const isHighlighted = highlightedLayerId === feature.properties.id;
    const isSelected =
      (selectedFeature?.properties?.id ?? null) === feature.properties.id;
    const isOccupied =
      feature.properties.crop && feature.properties.crop?.finish_date === null;

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

    const handleLayerClick = (event: LayerEvent, feature: any) => {
      handleLandplotChange(feature.properties?.id);
      console.log(feature);
    };

    const eventHandlers = {
      click: (event: LayerEvent) => handleLayerClick(event, feature),
      mouseover: () => handleLayerMouseOver(feature.properties.id),
      mouseout: handleLayerMouseOut,
    };

    const PopUp = (
      <div>
        <h3>ID: {feature.properties.id}</h3>
        <p>Descripción: {feature.properties.description}</p>
        {feature.properties?.radius && (
          <p>Radio: {feature.properties.radius} m.</p>
        )}
      </div>
    );

    if (feature.geometry.type === "Polygon") {
      const coordinates = feature.geometry.coordinates[0].map(
        ([lng, lat]: any) => [lat, lng]
      );
      return (
        <Polygon
          key={feature.properties.id}
          positions={coordinates}
          pathOptions={pathOptions}
          eventHandlers={eventHandlers}
        >
          <Popup>{PopUp}</Popup>
        </Polygon>
      );
    } else if (
      feature.geometry.type === "Point" &&
      feature.properties.subType === "Circle"
    ) {
      return (
        <Circle
          key={feature.properties.id}
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

  // Confirmar datos

  const [landplotError, setLandplotError] = useState(false);

  const handleSubmitForm = async () => {
    try {
      await postCrop(crop);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Alta de cultivos</h1>
      <MapContainer center={position} zoom={7}>
        <LayerControler />
        <LayerGroup>
          {geoData &&
            geoData.features.map((feature: any) => {
              return (
                <CustomLayer key={feature.properties.id} feature={feature} />
              );
            })}
        </LayerGroup>
      </MapContainer>

      {(selectedFeature && featureInfo(selectedFeature, species)) || (
        <h2>Seleccione una parcela</h2>
      )}

      <FormControl
        variant="filled"
        sx={{ m: 1, minWidth: 220 }}
        error={landplotError}
      >
        <InputLabel>Parcela</InputLabel>
        <Select
          label="Landplot"
          name="landplot"
          value={crop.landplot.toString()}
          onChange={(e) => handleLandplotChange(Number(e.target.value))}
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
        <FormHelperText>
          {landplotError ? "Parcela actualmente ocupada" : ""}
        </FormHelperText>
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
          onChange={handleDateChange}
        />
      </FormControl>

      <ConfirmButton
        msg={"Se dará de alta al cultivo en la parcela seleccionada."}
        onConfirm={handleSubmitForm}
        navigateDir={"/croplandplots"}
        disabled={
          !Object.values(crop).every((value) => !!value) ||
          (selectedFeature?.properties?.crop &&
            selectedFeature?.properties?.crop?.finish_date === null) ||
          !isDateValid
        }
      />
    </div>
  );
};

export default MapView;