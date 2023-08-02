import {
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
} from "@mui/material";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

export type CancelFormProps = {
  navigateDir: string;
};

export type ConfirmFormProps = {
  msg: string;
  onConfirm: () => void;
  navigateDir: string;
  disabled: boolean;
};

export type DialogButtonProps = {
  icon?: JSX.Element;
  buttonText?: string;
  dialogTitle: string;
  dialogSubtitle: string;
  onConfirm: () => void;
};

export const DialogButton = ({
  icon,
  buttonText,
  dialogTitle,
  dialogSubtitle,
  onConfirm,
}: DialogButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Fragment>
      <Button onClick={handleClickOpen}>
        {icon} {buttonText}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogSubtitle}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export const CancelButton = ({ navigateDir }: CancelFormProps) => {
  const navigate = useNavigate();

  const [cancel, setCancel] = useState(false);

  const handleCancelOpen = () => {
    setCancel(true);
  };

  const handleClose = () => {
    setCancel(false);
  };

  const handleCancel = () => {
    navigate(navigateDir);
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, ml: 1 }}
        onClick={handleCancelOpen}
      >
        Cancelar
      </Button>

      <Dialog
        open={cancel}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Cancelar carga?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Los datos ingresados no serán guardados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Quedarme aquí</Button>
          <Button onClick={handleCancel} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export const ConfirmButton = ({
  msg,
  onConfirm,
  navigateDir,
  disabled,
}: ConfirmFormProps) => {
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
        navigate(navigateDir);
      }, 4000);
    }, 500);
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, ml: 1 }}
        onClick={handleClickOpen}
        disabled={disabled}
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
            {msg}
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
    </Fragment>
  );
};
