import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Apps as AppsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import {
  getLandplotSnapshots,
  getCropSnapshots,
  deleteSnapshot,
} from "../../utils/services";
import {
  CircularProgressBackdrop,
  DialogComponent,
  MySnackBarProps,
  PageTitle,
  SnackBarAlert,
} from "../../components/customComponents";
import { formatedDate } from "../../utils/functions";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export const LandplotLoader = () => {
  const params = useParams();

  const [snapshotData, setSnapshotData] = useState<any>();

  const loadSnapshots = async (id: string) => {
    try {
      const data = await getLandplotSnapshots(id);
      setSnapshotData(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Data refresh trigger
  const [dataReloadCounter, setDataReloadCounter] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadSnapshots(params.id);
    }
  }, [params.id, dataReloadCounter]);

  return (
    <Fragment>
      {snapshotData && (
        <SnapshotGallery
          objectId={params.id}
          snapshotData={snapshotData}
          isCropForm={false}
          setDataReloadCounter={setDataReloadCounter}
        />
      )}
    </Fragment>
  );
};

export const CropLoader = () => {
  const params = useParams();

  const [snapshotData, setSnapshotData] = useState<any>();

  const loadSnapshots = async (id: string) => {
    try {
      const data = await getCropSnapshots(id);
      setSnapshotData(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Data refresh trigger
  const [dataReloadCounter, setDataReloadCounter] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadSnapshots(params.id);
    }
  }, [params.id, dataReloadCounter]);

  return (
    <Fragment>
      {snapshotData && (
        <SnapshotGallery
          objectId={params.id}
          snapshotData={snapshotData}
          isCropForm={true}
          setDataReloadCounter={setDataReloadCounter}
        />
      )}
    </Fragment>
  );
};

const SnapshotGallery = ({
  objectId,
  snapshotData,
  isCropForm,
  setDataReloadCounter,
}: any) => {
  PageTitle("Galería de snapshots");
  const { userTypeId } = useSelector((state: RootState) => state.auth);

  const [selectedSnapshotIndex, setSelectedSnapshotInex] = useState(0);

  const selectedSnapshot = snapshotData[selectedSnapshotIndex];

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

  const eventSuccessSnackBar: MySnackBarProps = {
    open: true,
    severity: "success",
    msg: "Captura eliminada!",
  };

  const errorSnackBar: MySnackBarProps = {
    open: true,
    severity: "error",
    msg: "Algo ha fallado.",
  };

  //#endregion

  const [loading, setLoading] = useState(false);

  const handleDeleteSnapshot = async () => {
    setLoading(true);
    try {
      let res = await deleteSnapshot(selectedSnapshot.id);

      if (res === 200) {
        setDataReloadCounter((prevCounter: number) => prevCounter + 1);
        setSnackBar(eventSuccessSnackBar);
      } else {
        setSnackBar(errorSnackBar);
      }
    } catch (error) {
      console.log(error);
      setSnackBar(errorSnackBar);
    }
    setLoading(false);
  };

  return (
    <Fragment>
      <Box
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>
          Capturas tomadas - {isCropForm ? "Cultivo" : "Parcela"} N.° {objectId}
        </h1>
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconButton
          disabled={selectedSnapshotIndex === snapshotData.length - 1}
          onClick={() => setSelectedSnapshotInex(selectedSnapshotIndex + 1)}
          sx={{ margin: 3 }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Card>
          <CardMedia component="img" image={selectedSnapshot.imageDataUri} />
          <CardContent
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {formatedDate(selectedSnapshot.date)}
            </Typography>
          </CardContent>
        </Card>
        <IconButton
          disabled={selectedSnapshotIndex === 0}
          onClick={() => setSelectedSnapshotInex(selectedSnapshotIndex - 1)}
          sx={{ margin: 3 }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
      {userTypeId === 3 ? (
        <Fragment>
          <br />

          <DialogComponent
            component={
              <Button
                startIcon={<DeleteIcon />}
                variant="contained"
                color={"error"}
              >
                Eliminar captura seleccionada
              </Button>
            }
            dialogTitle={"¿Desea eliminar la captura seleccionada?"}
            dialogSubtitle={"Esta acción es irreversible."}
            onConfirm={() => handleDeleteSnapshot()}
          />
        </Fragment>
      ) : null}

      <br />
      <h2>Lista de capturas:</h2>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={"5%"}></TableCell>
                  <TableCell width={"95%"}>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {snapshotData.map((snapshot: any, index: number) => {
                  const { id, date } = snapshot;
                  return (
                    <Fragment key={id}>
                      <TableRow
                        key={index}
                        selected={index === selectedSnapshotIndex}
                      >
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setSelectedSnapshotInex(index)}
                          >
                            <AppsIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{formatedDate(date)}</TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <CircularProgressBackdrop loading={loading} />
      <SnackBarAlert
        handleSnackbarClose={handleSnackbarClose}
        msg={snackBar.msg}
        open={snackBar.open}
        severity={snackBar.severity}
      />
    </Fragment>
  );
};
