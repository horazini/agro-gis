import { Box, Container, Grid, Paper } from "@mui/material";
import { PageTitle } from "../../components/customComponents";

import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import {
  getNextHarvest,
  getAvailableAndOccupiedTenantAreasSum,
  getTenantPendingTasksNumber,
} from "../../utils/services";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { formatedDate } from "../../utils/functions";
import { FormattedArea } from "../../components/mapcomponents";

const DashboardLoader = () => {
  PageTitle("Inicio");
  const navigate = useNavigate();

  const { tenantId } = useSelector((state: RootState) => state.auth);

  const [nextHarvest, setNextHarvest] = useState();
  const [areasSum, setAreasSum] = useState();
  const [pendingTasksNumber, setPendingTasksNumber] = useState();

  const loadTenant = async (id: number) => {
    try {
      const nextHarvestData = await getNextHarvest(id);
      setNextHarvest(nextHarvestData);
      const areasData = await getAvailableAndOccupiedTenantAreasSum(id);
      setAreasSum(areasData);
      const pendingTasksNumberRes = await getTenantPendingTasksNumber(id);
      setPendingTasksNumber(pendingTasksNumberRes);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadTenant(tenantId);
    }
  }, [tenantId]);

  const data = {
    nextHarvest,
    areasSum,
    pendingTasksNumber,
  };
  return <Fragment>{data && Dashboard(data, navigate)}</Fragment>;
};

const Dashboard = (data: any, navigate: any) => {
  const { nextHarvest, areasSum, pendingTasksNumber } = data;
  return (
    <Container maxWidth="xl" sx={{ paddingBottom: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              alignItems: "center",
              height: 290,
            }}
          >
            {areasSum ? (
              <Fragment>{landplotAreasPanel(areasSum, navigate)}</Fragment>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              pt: 1,
              pl: 2,
              pr: 2,
              pb: 2,
              display: "flex",
              flexDirection: "column",
              height: 290,
            }}
          >
            {pendingTasksNumber ? (
              <Fragment>
                {pendingTasksPanel(pendingTasksNumber, navigate)}
              </Fragment>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              pt: 1,
              pl: 2,
              pr: 2,
              pb: 2,
              display: "flex",
              flexDirection: "column",
              height: 290,
            }}
          >
            {nextHarvest ? (
              <Fragment>{NextHarvestPanel(nextHarvest, navigate)}</Fragment>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              alignItems: "center",
              height: 290,
            }}
          >
            <FourthPanel />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              alignItems: "center",
              height: 290,
            }}
          >
            <FifthPanel />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const landplotAreasPanel = (areasSum: any, navigate: any) => {
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
            text: "Porcentaje de tierras ocupadas",
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

const pendingTasksPanel = (pendingTasksNumber: any, navigate: any) => {
  return (
    <Fragment>
      <p>Tareas pendientes</p>
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
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : "#121212",
        }}
        onClick={() => navigate(`/calendar`)}
      >
        <p>Actualmente hay {pendingTasksNumber} tareas pendientes.</p>
      </Box>
    </Fragment>
  );
};

const NextHarvestPanel = (nextHarvest: any, navigate: any) => {
  const { id, landplot_id, species_name, estimatedCropFinishDate } =
    nextHarvest;

  return (
    <Fragment>
      <p>Próxima cosecha</p>
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
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : "#121212",
        }}
        onClick={() => navigate(`/crops/${id}`)}
      >
        <p>
          Parcela N°. {landplot_id} - {species_name}
        </p>

        <p>Fecha estimada: {formatedDate(estimatedCropFinishDate)}</p>
      </Box>
    </Fragment>
  );
};

const FourthPanel = (param: any, navigate: any) => {
  return <Fragment></Fragment>;
};

const FifthPanel = (param: any, navigate: any) => {
  return <Fragment></Fragment>;
};

export default DashboardLoader;
