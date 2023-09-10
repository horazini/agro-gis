import {
  Alert,
  AlertColor,
  AlertTitle,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

export type CancelFormProps = {
  navigateDir: string;
};

export type ConfirmFormProps = {
  msg: string;
  onConfirm: () => Promise<number>;
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

// Opens a dialog component to confirm an action. Stays in the same page
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

// Opens a dialog component to confirm the 'leave' of a form. Redirects to some other page
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

export const ConfirmDialog = ({
  open,
  handleClose,
  msg,
  onConfirm,
  navigateDir,
}: {
  open: boolean;
  handleClose: () => void;
  msg: string;
  onConfirm: () => Promise<number>;
  navigateDir: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);

  const navigate = useNavigate();

  const handleConfirm = async () => {
    setLoading(true);
    const res = await onConfirm();

    setLoading(false);
    handleClose();
    if (res === 200) {
      setSuccess(true);
      setTimeout(() => {
        navigate(navigateDir);
      }, 4000);
    } else {
      setFailure(true);
      setTimeout(() => {
        setFailure(false);
      }, 4000);
    }
  };

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Confirmar?"}</DialogTitle>
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

      <Dialog open={success}>
        <Alert severity="success" sx={{ width: "100%" }}>
          <AlertTitle>Datos cargados correctamente!</AlertTitle>
          Redirigiendo...
        </Alert>
      </Dialog>

      <Dialog open={failure}>
        <Alert severity="error">
          <AlertTitle>Los datos no pudieron ser cargados</AlertTitle>
          Algo ha salido mal.
        </Alert>
      </Dialog>
    </Fragment>
  );
};

/**
 * Opens a dialog component to confirm a data load action. Redirects to some other page
 * @param {string} msg - dialog content text
 * @param {() => Promise<number>} onConfirm - action to realize when user confirms
 * @param {string} navigateDir - redirect directory
 * @param {boolean} disabled - boolean to set the button as disabled or not
 */
export const ConfirmButton = ({
  msg,
  onConfirm,
  navigateDir,
  disabled,
}: ConfirmFormProps) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
        Confirmar
      </Button>

      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        msg={msg}
        navigateDir={navigateDir}
        onConfirm={onConfirm}
      />
    </Fragment>
  );
};

/* 
    --------------------------------------------------------------------
 */

export type CircularProgressBackdropProps = {
  loading: boolean;
};

export const CircularProgressBackdrop = ({
  loading,
}: CircularProgressBackdropProps) => {
  return (
    <Backdrop open={loading} style={{ zIndex: 9999 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export type SnackBarAlertProps = {
  open: boolean;
  severity: AlertColor | undefined;
  msg: string;
  handleSnackbarClose: (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => void;
};

export const SnackBarAlert = ({
  open,
  severity,
  msg,
  handleSnackbarClose,
}: SnackBarAlertProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {msg}
      </Alert>
    </Snackbar>
  );
};

/**
 *
 * @param {[unit: string]: number;} interval - PostgreSQL return object of data type 'interval'
 * @returns {string} readable string (in Spanish) of the interval
 */
export function TimeIntervalToReadableString(interval: {
  [unit: string]: number;
}): string {
  const timeUnitObjects = [
    { key: "days", singularLabel: "Día", pluralLabel: "Días" },
    { key: "weeks", singularLabel: "Semana", pluralLabel: "Semanas" },
    { key: "months", singularLabel: "Mes", pluralLabel: "Meses" },
    { key: "years", singularLabel: "Año", pluralLabel: "Años" },
  ];

  try {
    const intervalUnit = Object.keys(interval)[0] || "days";
    const intervalCuantity = interval[intervalUnit] || 0;
    const intervalUnitObject = timeUnitObjects.find(
      (unitObj) => unitObj.key === intervalUnit
    );
    let readableIntervalUnit = "";
    if (intervalCuantity === 1) {
      readableIntervalUnit = intervalUnitObject?.singularLabel || "";
    } else {
      readableIntervalUnit = intervalUnitObject?.pluralLabel || "";
    }
    const readableString = intervalCuantity + " " + readableIntervalUnit;
    return readableString;
  } catch {
    return "";
  }
}

export function UsertypeIDToString(id: number): string {
  const usertypeObjects = [
    { key: 1, label: "Service admin" },
    { key: 2, label: "Gerente administrativo" },
    { key: 3, label: "Gerente agrónomo" },
    { key: 4, label: "Especialista en suelos" },
    { key: 5, label: "Botánico " },
    { key: 6, label: "Agricultor" },
  ];

  const usertypeString = usertypeObjects.find(
    (usertypeObj) => usertypeObj.key === id
  )?.label;

  return usertypeString || "";
}

export function formatedDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB");
}
