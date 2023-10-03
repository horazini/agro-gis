import { Container, Grid, Paper } from "@mui/material";
import PageTitle from "../../components/title";

const Home = () => {
  PageTitle("Inicio");

  return (
    <Container maxWidth="xl" sx={{ paddingBottom: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={5}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 290,
            }}
          >
            {/* <Chart /> */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={7}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 290,
            }}
          >
            {/* <Deposits /> */}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 290 }}
          >
            {/* <Orders /> */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
