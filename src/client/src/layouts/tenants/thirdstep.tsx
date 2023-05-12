import {
  Alert,
  AlertTitle,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export type ThirdStepProps = {
  formData: {
    tenantName: string;
    adminSurname: string;
    adminNames: string;
    adminMailAddress: string;
  };
  usersSummary: {
    usertype: string;
    total: number;
  }[];
  onBack: () => void;
  onConfirm: () => void;
};

const ThirdStep = ({
  formData,
  usersSummary,
  onBack,
  onConfirm,
}: ThirdStepProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    setLoading(true);

    setTimeout(() => {
      onConfirm();
      setLoading(false);
      setOpen(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/tenant/list");
      }, 4000);
    }, 1000);
  };

  return (
    <React.Fragment>
      <Typography variant="h5" gutterBottom>
        Cliente “{formData.tenantName}”
      </Typography>
      <Typography variant="h6" gutterBottom>
        Administrador: {formData.adminSurname}, {formData.adminNames}
        <br />
        Email: {formData.adminMailAddress}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Resumen de usuarios:
      </Typography>
      {usersSummary.map((row) => (
        <Typography key={row.usertype} variant="h6" gutterBottom>
          {row.usertype}: {row.total}
        </Typography>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button sx={{ mt: 3, ml: 1 }} onClick={onBack}>
          Regresar
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, ml: 1 }}
          onClick={handleClickOpen}
        >
          Confirmar datos
        </Button>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"¿Confirmar datos?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Se darán de alta al cliente y todos los usuarios cargados.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleConfirm} autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

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
    </React.Fragment>
  );
};

export default ThirdStep;
