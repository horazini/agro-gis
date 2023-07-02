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
} from "../../services/services";
import { Feature } from "geojson";

import { position, LayerControler } from "../../components/mapcomponents";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Alert,
  AlertTitle,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useNavigate } from "react-router-dom";

interface ICrop {
  landplot: number;
  species: number;
  tenant_id: number;
  date: string;
}

const MapView = () => {
  const mystyle = {};

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [geoData, setGeoData] = useState<any>(null);
  const [species, setSpecies] = useState<any[]>([]);

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

  function handleDateChange(date: any) {
    const isoDate = date.toISOString(); // Convertir la fecha a formato ISO 8601
    setCrop((prevCrop) => ({
      ...prevCrop,
      date: isoDate,
    }));
    console.log("crop:", crop, "selected:", selectedFeature);
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

  const cropInfo = (crop: any) => {
    const startDate = new Date(crop.start_date).toLocaleDateString("en-GB");
    const finishDate = new Date(crop.finish_date).toLocaleDateString("en-GB");

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

  // Confirmar datos

  const [landplotError, setLandplotError] = useState(false);

  const handleSubmitForm = async () => {
    try {
      await postCrop(crop);
    } catch (error) {
      console.log(error);
    }
  };

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleClickOpen = () => {
    const isOccupied =
      selectedFeature?.properties?.crop &&
      selectedFeature?.properties?.crop?.finish_date === null;

    setLandplotError(isOccupied);

    if (!isOccupied) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      handleSubmitForm();
      setLoading(false);
      setOpen(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/map");
      }, 4000);
    }, 500);
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

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, ml: 1 }}
        onClick={handleClickOpen}
        disabled={!Object.values(crop).every((value) => !!value)}
      >
        Confirmar datos
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Confirmar datos?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {"Se dará de alta al cultivo en la parcela seleccionada."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop open={loading} style={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {success && (
        <Dialog open={success}>
          <Alert severity="success" sx={{ width: "100%" }}>
            <AlertTitle>Datos cargados correctamente!</AlertTitle>
            Redirigiendo...
          </Alert>
        </Dialog>
      )}
    </div>
  );
};

export default MapView;
