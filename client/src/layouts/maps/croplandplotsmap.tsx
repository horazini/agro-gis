import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

import {
  getTenantGeoData,
  getTenantSpecies,
  postCrop,
  speciesMainData,
} from "../../utils/services";

import {
  FlyToSelectedFeatureMap,
  FeatureInfo,
} from "../../components/mapcomponents";
import { FormControl, Card, Box, Autocomplete, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  ConfirmButton,
  DataFetcher,
  PageTitle,
} from "../../components/customComponents";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

interface ICrop {
  landplot: number;
  species: number;
  tenant_id: number;
  date: string;
}

const LandplotsAndCropsLoader = () => {
  PageTitle("Parcelas y cultivos");
  const { tenantId } = useSelector((state: RootState) => state.auth);

  const getLandplots = async () => {
    const data = await getTenantGeoData(Number(tenantId));
    return ["geoData", data];
  };

  const getSpecies = async () => {
    const data = await getTenantSpecies(Number(tenantId));
    return ["species", data];
  };

  return (
    <DataFetcher getResourceFunctions={[getLandplots, getSpecies]}>
      {(params) => <LandplotsAndCrops {...params} tenantId={tenantId} />}
    </DataFetcher>
  );
};

const LandplotsAndCrops = ({
  geoData,
  species,
  tenantId,
}: {
  geoData: any;
  species: speciesMainData[];
  tenantId: number;
}) => {
  // Manejo de alta de cultivo: parcela, especie y fecha inicial

  const [crop, setCrop] = useState<ICrop>({
    landplot: 0,
    species: 0,
    tenant_id: tenantId,
    date: "",
  });

  const handleFeatureSelect = (value: number) => {
    setCrop((prevCrop) => ({
      ...prevCrop,
      landplot: value,
    }));
  };

  const selectedFeature = geoData
    ? geoData.features.find(
        (feature: { properties: { landplot: { id: number } } }) =>
          feature.properties.landplot.id === crop.landplot
      )
    : null;

  const minDate = selectedFeature?.properties?.crop?.finish_date
    ? dayjs(selectedFeature.properties.crop.finish_date).add(1, "day")
    : null;

  const [isDateValid, setIsDateValid] = useState<boolean>(true);

  useEffect(() => {
    if (minDate === null) {
      setIsDateValid(true);
    } else {
      if (crop.date !== "") {
        if (crop.date > minDate.toISOString()) {
          setIsDateValid(true);
        } else {
          setIsDateValid(false);
        }
      }
    }
  }, [selectedFeature]);

  function handleDateChange(date: any) {
    if (date !== null && !Number.isNaN(new Date(date).getTime())) {
      const isoDate = date.toISOString(); // Convertir la fecha a formato ISO 8601

      if (minDate !== null) {
        if (isoDate >= minDate.toISOString()) {
          setCrop((prevCrop) => ({
            ...prevCrop,
            date: isoDate,
          }));
          setIsDateValid(true);
        } else {
          setIsDateValid(false);
        }
      } else {
        setCrop((prevCrop) => ({
          ...prevCrop,
          date: isoDate,
        }));
        setIsDateValid(true);
      }
    }
  }

  // Confirmar datos

  const handleSubmitForm: () => Promise<number> = async () => {
    try {
      const res = await postCrop(crop);
      return res.status;
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
      {geoData && (
        <FlyToSelectedFeatureMap
          features={geoData.features}
          selectedLandplotId={crop.landplot}
          handleFeatureClick={handleFeatureSelect}
        />
      )}

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
                showDaysOutsideCurrentMonth
                format="DD/MM/YYYY"
                label="Fecha"
                onChange={handleDateChange}
                minDate={minDate}
                slotProps={{
                  textField: {
                    error: !isDateValid,
                    helperText: isDateValid
                      ? null
                      : "La fecha de inicio no puede coincidir con un cultivo anterior en la parcela",
                  },
                }}
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

export default LandplotsAndCropsLoader;
