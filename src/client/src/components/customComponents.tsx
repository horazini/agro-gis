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
  InputAdornment,
  Menu,
  Snackbar,
  TextField,
} from "@mui/material";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Today as TodayIcon } from "@mui/icons-material";
import { format } from "date-fns";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import { useEffect } from "react";

export const PageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} - Nombre App`;
  }, [title]);

  return null;
};

export type DialogComponentProps = {
  component: JSX.Element;
  disabled?: boolean;
  dialogTitle: string;
  dialogSubtitle: string | JSX.Element;
  onConfirm: () => void;
};

// Opens a dialog component to confirm an action. Stays in the same page
export const DialogComponent = ({
  component,
  disabled,
  dialogTitle,
  dialogSubtitle,
  onConfirm,
}: DialogComponentProps) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    if (disabled !== true) {
      setOpen(true);
    }
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
      <span onClick={handleClickOpen}>{component}</span>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
        <DialogContent>
          {typeof dialogSubtitle === "string" ? (
            <DialogContentText id="alert-dialog-description">
              {dialogSubtitle}
            </DialogContentText>
          ) : (
            dialogSubtitle
          )}
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

export type CancelFormProps = {
  navigateDir: string;
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
        variant="outlined"
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
    if (200 <= res && res < 300) {
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

export type ConfirmFormProps = {
  handleValidation?: () => boolean | Promise<boolean>;
  msg: string;
  onConfirm: () => Promise<number>;
  navigateDir: string;
  disabled: boolean;
};

/**
 * Opens a dialog component to confirm a data load action. Redirects to some other page
 * @param {string} msg - dialog content text
 * @param {() => Promise<number>} onConfirm - action to realize when user confirms
 * @param {string} navigateDir - redirect directory
 * @param {boolean} disabled - boolean to set the button as disabled or not
 */
export const ConfirmButton = ({
  handleValidation,
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

  const handleValidationTest = async () => {
    if (handleValidation === undefined) {
      return;
    }
    const res = await handleValidation();
    if (res) {
      handleClickOpen();
    }
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, ml: 1 }}
        onClick={
          handleValidation !== undefined
            ? handleValidationTest
            : handleClickOpen
        }
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
 * @param {Date | null} date
 * @param {React.Dispatch<React.SetStateAction<Date | null>>} setDate
 * @param {string} minDate
 * @param {string} maxDate
 * @param {string} label
 * @returns {JSX.Element}
 */
export const StandardDatePicker = ({
  date,
  setDate,
  label,
  minDate,
  maxDate,
}: any): JSX.Element => {
  const today = new Date();

  const [calendarAnchor, setCalendarAnchor] = useState<any>();
  const openDateSelector = Boolean(calendarAnchor);

  const handleOpenDateSelector = (event: any) => {
    setCalendarAnchor(event.currentTarget);
  };

  const handleCloseDateSelector = () => {
    setCalendarAnchor(null);
  };

  function handleDateChange(date: any) {
    if (!Number.isNaN(new Date(date).getTime())) {
      const dateObject = new Date(date);
      setDate(dateObject);
    }
    handleCloseDateSelector();
  }

  return (
    <Fragment>
      <TextField
        sx={{ input: { cursor: "pointer" } }}
        variant="standard"
        label={label ? label : "Seleccionar fecha"}
        value={date ? format(date, "dd/MM/yyyy") : ""}
        onClick={(e) => (!date ? handleOpenDateSelector(e) : null)}
        onKeyDown={(e) =>
          e.key === "Backspace" || e.key === "Delete" ? setDate(null) : null
        }
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="start"
              sx={{ cursor: "pointer" }}
              onClick={(e) => handleOpenDateSelector(e)}
            >
              <TodayIcon />
            </InputAdornment>
          ),
        }}
      />

      <Menu
        id="date-menu"
        anchorEl={calendarAnchor}
        open={openDateSelector}
        onClose={() => handleCloseDateSelector()}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <DateCalendar
          showDaysOutsideCurrentMonth
          value={date ? dayjs(date) : dayjs(today)}
          minDate={minDate ? dayjs(minDate) : null}
          maxDate={maxDate ? dayjs(maxDate) : null}
          onChange={(newValue: any, selectionState: any) => {
            if (selectionState === "finish") {
              handleDateChange(newValue);
            }
          }}
        />
      </Menu>
    </Fragment>
  );
};
