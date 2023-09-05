import { Container, Grid, Paper } from "@mui/material";
import PageTitle from "../../components/title";

const Home = () => {
  PageTitle("Inicio");

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={7}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            {/* <Chart /> */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={5}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            {/* <Deposits /> */}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            {/* <Orders /> */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
