import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  TextField,
} from "@mui/material";
import { Fragment, SetStateAction, useEffect, useState } from "react";

import {
  Inventory as InventoryIcon,
  Layers as LayersIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";

import {
  getSpeciesReport,
  getTenantGeo,
  getTenantSpecies,
  speciesMainData,
} from "../../utils/services";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  CircularProgressBackdrop,
  MySnackBarProps,
  PageTitle,
  SnackBarAlert,
  mySnackBars,
} from "../../components/customComponents";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { FeatureGroup } from "leaflet";

const { errorSnackBar } = mySnackBars;

const StatisticalReports = () => {
  PageTitle("Reportes estadísticos");

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [landplots, setLandplots] = useState<any>();
  const [species, setSpecies] = useState<speciesMainData[]>([]);

  const loadData = async () => {
    if (tenantId) {
      const data = await getTenantGeo(tenantId);
      setLandplots(data);
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

  const [report, setReport] = useState<{
    class: null | string;
    objectId: number;
    fromDate: null | string;
    toDate: null | string;
  }>({
    class: null,
    objectId: 0,
    fromDate: null,
    toDate: null,
  });

  async function handleGetReport() {
    setLoading(true);
    try {
      let res = null;
      if (report.class === "species") {
        const ReportSentData = {
          speciesId: report.objectId,
          fromDate: report.fromDate,
          toDate: report.toDate,
        };
        res = await getSpeciesReport(ReportSentData);
      } else if (report.class === "landplot") {
        console.log("pending landplot report service!");
      }

      if (res?.status === 200) {
        console.log(await res.json());
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
  }

  //#region Snackbar

  const [snackBar, setSnackBar] = useState<MySnackBarProps>({
    open: false,
    severity: undefined,
    msg: "",
  });

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar((prevObject) => ({
      ...prevObject,
      open: false,
    }));
  };

  //#endregion

  const [loading, setLoading] = useState(false);

  return (
    <Fragment>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Reportes estadísticos</h1>
      </Box>
      <Box paddingBottom={3}>
        <Button
          variant={report.class === "species" ? "contained" : "outlined"}
          color="primary"
          onClick={() => {
            report.class === "species"
              ? console.log()
              : setReport((prevReport) => ({
                  ...prevReport,
                  class: "species",
                  objectId: 0,
                }));
          }}
          style={{ marginLeft: ".5rem" }}
          startIcon={<InventoryIcon />}
          size="large"
        >
          Por especie
        </Button>
        <Button
          variant={report.class === "landplot" ? "contained" : "outlined"}
          color="primary"
          onClick={() => {
            report.class === "landplot"
              ? console.log()
              : setReport((prevReport) => ({
                  ...prevReport,
                  class: "landplot",
                  objectId: 0,
                }));
          }}
          style={{ marginLeft: ".5rem" }}
          startIcon={<LayersIcon />}
          size="large"
        >
          Por parcela
        </Button>
      </Box>

      <Box paddingBottom={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {report.class === "species" ? (
            <Fragment>{SpeciesReports(species, report, setReport)}</Fragment>
          ) : report.class === "landplot" ? (
            <Fragment>{LadnplotReports(landplots, report, setReport)}</Fragment>
          ) : null}
          {report.class !== null ? DatesSelector(report, setReport) : null}
        </Box>
      </Box>
      {report.class !== null ? (
        <Button
          variant={"contained"}
          color="primary"
          onClick={handleGetReport}
          style={{ marginLeft: ".5rem" }}
          startIcon={<ArticleIcon />}
        >
          Obtener reporte
        </Button>
      ) : null}
      <Fragment>
        <CircularProgressBackdrop loading={loading} />
        <SnackBarAlert
          handleSnackbarClose={handleSnackbarClose}
          msg={snackBar.msg}
          open={snackBar.open}
          severity={snackBar.severity}
        />
      </Fragment>
    </Fragment>
  );
};

const SpeciesReports = (
  species: speciesMainData[],
  report: {
    class?: string | null;
    objectId: number;
    fromDate?: string | null;
    toDate?: string | null;
  },
  setReport: {
    (
      value: SetStateAction<{
        class: string | null;
        objectId: number;
        fromDate: string | null;
        toDate: string | null;
      }>
    ): void;
    (arg0: (prevReport: any) => any): void;
  }
) => {
  return (
    <Fragment>
      <Box>
        <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
          {species ? (
            <Autocomplete
              id="species-autocomplete"
              options={species}
              getOptionLabel={(option: any) => option.name}
              value={
                species.find((specie: any) => specie.id === report.objectId) ||
                null
              }
              onChange={(_, newValue) =>
                setReport((prevReport) => ({
                  ...prevReport,
                  objectId: newValue?.id || 0,
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Especie" />
              )}
            />
          ) : null}
        </FormControl>
      </Box>
    </Fragment>
  );
};

const LadnplotReports = (
  landplots: { features: any[]; type: string },
  report: {
    class?: string | null;
    objectId: number;
    fromDate?: string | null;
    toDate?: string | null;
  },
  setReport: {
    (
      value: SetStateAction<{
        class: string | null;
        objectId: number;
        fromDate: string | null;
        toDate: string | null;
      }>
    ): void;
    (arg0: (prevReport: any) => any): void;
  }
) => {
  return (
    <Fragment>
      <Box>
        <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
          {landplots ? (
            <Autocomplete
              id="landplot-autocomplete"
              options={landplots.features.sort(
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
                landplots.features.find(
                  (feature: any) =>
                    feature.properties.landplot.id === report.objectId
                ) || null
              }
              onChange={(_, newValue) =>
                setReport((prevReport) => ({
                  ...prevReport,
                  objectId: newValue?.id || 0,
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Parcela" />
              )}
            />
          ) : null}
        </FormControl>
      </Box>
    </Fragment>
  );
};

const DatesSelector = (
  report: {
    class?: string | null;
    objectId: number;
    fromDate?: string | null;
    toDate?: string | null;
  },
  setReport: {
    (
      value: SetStateAction<{
        class: string | null;
        objectId: number;
        fromDate: string | null;
        toDate: string | null;
      }>
    ): void;
    (arg0: (prevReport: any) => any): void;
  }
) => {
  function handleDateChange(date: any, pickerName: string) {
    if (date !== null && !Number.isNaN(new Date(date).getTime())) {
      const isoDate = date.toISOString(); // Convertir la fecha a formato ISO 8601

      setReport((prevReport) => ({
        ...prevReport,
        [pickerName]: isoDate,
      }));
      //setIsDateValid(true);
    }
  }

  return (
    <Box>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
        <DatePicker
          showDaysOutsideCurrentMonth
          format="DD/MM/YYYY"
          label="Desde"
          value={report.fromDate ? dayjs(report.fromDate) : null}
          onChange={(e) => handleDateChange(e, "fromDate")}
          maxDate={dayjs(report.toDate)}
        />
      </FormControl>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 220 }}>
        <DatePicker
          showDaysOutsideCurrentMonth
          format="DD/MM/YYYY"
          label="Hasta"
          value={report.toDate ? dayjs(report.toDate) : null}
          onChange={(e) => handleDateChange(e, "toDate")}
          minDate={dayjs(report.fromDate)}

          /* slotProps={{
                    textField: {
                      error: !isDateValid,
                      helperText: isDateValid
                        ? null
                        : "La fecha de inicio no puede coincidir con un cultivo anterior en la parcela",
                    },
                  }} */
        />
      </FormControl>
    </Box>
  );
};

export default StatisticalReports;
