import {
  Box,
  BoxProps,
  Card,
  CardMedia,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { DataFetcher, PageTitle } from "../../components/customComponents";

import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  getNextHarvest,
  getAvailableAndOccupiedTenantAreasSum,
  getTenantPendingTasksNumber,
  getTenantSpeciesCropsAreasSum,
  getWeather,
} from "../../utils/services";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { formatedDate } from "../../utils/functions";
import { FormattedArea } from "../../components/mapcomponents";
import { WMOcodesInterpretation } from "../../utils/wmo_weather_condition_codes_interpretation";

const textPanelStyle = {
  p: 2,
  pt: 1,
  display: "flex",
  flexDirection: "column",
  height: 290,
};

const chartPanelStyle = {
  p: 2,
  display: "flex",
  flexDirection: "column",
  alignContent: "center",
  alignItems: "center",
  height: 290,
};

export const CustomBox: React.FC<BoxProps> = ({ children, ...props }) => {
  return (
    <Box
      style={{
        paddingLeft: 10,
        cursor: "pointer",
        display: "flex",
        flexFlow: "column",
        height: "100%",
      }}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light" ? theme.palette.grey[200] : "#121212",
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

const DashboardLoader = () => {
  PageTitle("Inicio");
  const navigate = useNavigate();

  const { tenantId, userTypeId } = useSelector(
    (state: RootState) => state.auth
  );

  const nextHarvestGetter = async () => {
    const data = await getNextHarvest(Number(tenantId));
    return ["nextHarvest", data];
  };

  const areasSumGetter = async () => {
    const data = await getAvailableAndOccupiedTenantAreasSum(Number(tenantId));
    return ["areasSum", data];
  };

  const cultivatedAreasGetter = async () => {
    const data = await getTenantSpeciesCropsAreasSum(Number(tenantId));
    return ["cultivatedAreaBySpecies", data];
  };

  const pendingTasksGetter = async () => {
    const data = await getTenantPendingTasksNumber(Number(tenantId));
    return ["pendingTasksNumber", data];
  };

  const weatherReportGetter = async () => {
    const data = await getWeather();
    return ["weatherReport", data];
  };

  return (
    <Fragment>
      {userTypeId !== 1 ? (
        <DataFetcher
          getResourceFunctions={[
            nextHarvestGetter,
            areasSumGetter,
            cultivatedAreasGetter,
            pendingTasksGetter,
            weatherReportGetter,
          ]}
        >
          {(params) => <TenantsDashboard {...params} navigate={navigate} />}
        </DataFetcher>
      ) : (
        <DataFetcher getResourceFunctions={[weatherReportGetter]}>
          {(params) => <ServiceAdminDashboard {...params} />}
        </DataFetcher>
      )}
    </Fragment>
  );
};

const TenantsDashboard = ({
  nextHarvest,
  areasSum,
  cultivatedAreaBySpecies,
  pendingTasksNumber,
  weatherReport,
  navigate,
}: {
  nextHarvest: any;
  areasSum: any;
  cultivatedAreaBySpecies: any;
  pendingTasksNumber: any;
  weatherReport: any;
  navigate: any;
}) => {
  return (
    <Container maxWidth="xl" sx={{ paddingBottom: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Paper sx={textPanelStyle}>
            <Fragment>
              <p>Tareas atrasadas</p>

              <CustomBox>
                {pendingTasksNumber ? (
                  <Fragment>
                    {PendingTasksPanel(pendingTasksNumber, navigate)}
                  </Fragment>
                ) : (
                  <p>No existen tareas atrasadas.</p>
                )}
              </CustomBox>
            </Fragment>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={3}>
          {areasSum &&
          (areasSum.availableAreasSum > 0 || areasSum.occupiedAreasSum > 0) ? (
            <Paper sx={chartPanelStyle}>
              {LandplotAreasPanel(areasSum, navigate)}
            </Paper>
          ) : (
            <Paper sx={textPanelStyle}>
              <p>Resumen de parcelas</p>
              <CustomBox>
                <p>No hay parcelas cargadas en el sistema.</p>
              </CustomBox>
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={textPanelStyle}>
            <Fragment>
              <p>Próxima cosecha</p>
              <CustomBox>
                {nextHarvest ? (
                  <Fragment>{NextHarvestPanel(nextHarvest, navigate)}</Fragment>
                ) : (
                  <p>Acutalmente no hay cultivos en curso.</p>
                )}
              </CustomBox>
            </Fragment>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          {weatherReport ? (
            <Paper sx={textPanelStyle}>
              {WeatherReportPanel(weatherReport)}
            </Paper>
          ) : (
            <Paper sx={textPanelStyle}>
              <p>Clima</p>
              <CustomBox>
                <p>
                  No se pudo acceder al servicio meteorológico. Inténtelo más
                  tarde. <br />
                  Si el problema persiste contáctese con su proveedor de
                  servicio.
                </p>
              </CustomBox>
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
          {cultivatedAreaBySpecies && cultivatedAreaBySpecies.length > 0 ? (
            <Paper sx={chartPanelStyle}>
              {CropsBySpeciePanel(cultivatedAreaBySpecies)}
            </Paper>
          ) : (
            <Paper sx={textPanelStyle}>
              <p>Resumen de cultivos</p>
              <CustomBox>
                <p>Actualmente no hay cultivos en curso.</p>
              </CustomBox>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

const LandplotAreasPanel = (areasSum: any, navigate: any) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const { occupiedAreasSum, availableAreasSum } = areasSum;

  const pieData = {
    labels: ["Ocupado", "Libre"],
    datasets: [
      {
        label: "Área",
        data: [occupiedAreasSum, availableAreasSum],
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Pie
      style={{
        cursor: "pointer",
      }}
      onClick={() => navigate(`/landplots`)}
      data={pieData}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "bottom" as const,
          },
          title: {
            display: true,
            text: "Tierras ocupadas",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let formatedArea = FormattedArea(context.parsed);
                let label = context.dataset.label + ": " + formatedArea;

                return label;
              },
            },
          },
        },
      }}
    />
  );
};

const PendingTasksPanel = (pendingTasksNumber: any, navigate: any) => {
  return (
    <Box sx={{ height: "100%" }} onClick={() => navigate(`/calendar`)}>
      <p>Actualmente hay {pendingTasksNumber} tareas atrasadas.</p>
    </Box>
  );
};

const NextHarvestPanel = (nextHarvest: any, navigate: any) => {
  const { id, landplot_id, species_name, estimatedCropFinishDate } =
    nextHarvest;

  return (
    <Box sx={{ height: "100%" }} onClick={() => navigate(`/crops/${id}`)}>
      <p>
        Parcela N°. {landplot_id} - {species_name}
      </p>

      <p>Fecha estimada: {formatedDate(estimatedCropFinishDate)}</p>
    </Box>
  );
};

const CropsBySpeciePanel = (cultivatedAreaBySpecies: any) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Área en cultivo por especie",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let formatedArea = FormattedArea(context.parsed.y);
            let label = context.dataset.label + ": " + formatedArea;

            return label;
          },
        },
      },
    },
  };

  const barData = {
    labels: ["Especie"],
    datasets: cultivatedAreaBySpecies,
  };

  return (
    <Fragment>
      <Bar options={barOptions} data={barData} />
    </Fragment>
  );
};

const WeatherReportPanel = (weatherReport: any) => {
  const { formated_location_name, current } = weatherReport;
  const { is_day, weather_code, wind_direction_10m } = current;

  function formatWindDirectionDegrees(windDirectionDegrees: number): string {
    if (windDirectionDegrees > 45 && windDirectionDegrees < 136) {
      return "Este";
    } else if (windDirectionDegrees > 135 && windDirectionDegrees < 226) {
      return "Sur";
    } else if (windDirectionDegrees > 225 && windDirectionDegrees < 316) {
      return "Oeste";
    } else {
      return "Norte";
    }
  }

  function formatWeatherParameter(parameter: string): string {
    const unit = weatherReport.current_units[parameter];
    const value = weatherReport.current[parameter];

    return `${value} ${unit}`;
  }

  const WeatherCondition = (): {
    description: string;
    image: string;
  } => {
    const weatherInterpretation = WMOcodesInterpretation[weather_code];

    if (is_day === 1) {
      return weatherInterpretation.day;
    } else {
      return weatherInterpretation.night;
    }
  };

  return (
    <Fragment>
      <Box
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Card sx={{ boxShadow: 0 }}>
          <CardMedia
            component="img"
            image={WeatherCondition().image}
            height="70"
          />
        </Card>
        <Box>
          <Typography variant="h6">{formated_location_name}</Typography>
          <Typography variant="body1" marginBottom={2}>
            {WeatherCondition().description}
          </Typography>
        </Box>
      </Box>

      <CustomBox
        onClick={() => {
          window.location.href = "https://openweathermap.org/";
        }}
      >
        <Typography variant="body1" paddingTop={2} marginBottom={2}>
          Temperatura: {formatWeatherParameter("temperature_2m")}
          <br />
          Humedad: {formatWeatherParameter("relative_humidity_2m")}
          <br />
          Sensación térmica: {formatWeatherParameter("apparent_temperature")}
          <br />
          Prob. de precipitaciones:{" "}
          {formatWeatherParameter("precipitation_probability")}
          <br />
          Precipitaciones en la última hora:{" "}
          {formatWeatherParameter("precipitation")}
          <br />
          Viento: {formatWeatherParameter("wind_speed_10m")}{" "}
          {formatWindDirectionDegrees(wind_direction_10m)}
        </Typography>
      </CustomBox>
    </Fragment>
  );
};

const ServiceAdminDashboard = ({ weatherReport }: { weatherReport: any }) => {
  return (
    <Container maxWidth="xl" sx={{ paddingBottom: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          {weatherReport ? (
            <Paper sx={textPanelStyle}>
              {WeatherReportPanel(weatherReport)}
            </Paper>
          ) : (
            <Paper sx={textPanelStyle}>
              <p>Clima</p>
              <CustomBox>
                <p>
                  No se pudo acceder al servicio meteorológico. Inténtelo más
                  tarde.
                </p>
              </CustomBox>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardLoader;
