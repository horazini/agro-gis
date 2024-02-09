import {
  Alert,
  AlertColor,
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
import { ResourceNotFound } from "../layouts/app/nomatch";

export const PageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} - AgroSense`;
  }, [title]);

  return null;
};

//#region Dialog components

export type CustomDialogProps = {
  open: boolean;
  disabled?: boolean;
  dialogTitle: string;
  dialogSubtitle: string | JSX.Element;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onClose: () => void;
  handleValidation?: () => boolean | Promise<boolean>;
  onConfirm: () => void;
};

/**
 * Basic dialog component that works with an "open" boolean prop.
 */
export const CustomDialog = ({
  open,
  dialogTitle,
  dialogSubtitle,
  confirmButtonText,
  cancelButtonText,
  onClose,
  handleValidation,
  onConfirm,
}: CustomDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  const handleValidationTest = async () => {
    if (handleValidation === undefined) {
      return;
    }
    const res = await handleValidation();
    if (res) {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
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
        <Button onClick={handleClose}>
          {cancelButtonText ? cancelButtonText : "Cancelar"}
        </Button>
        <Button
          onClick={
            handleValidation !== undefined
              ? handleValidationTest
              : handleConfirm
          }
          autoFocus
        >
          {confirmButtonText ? confirmButtonText : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export type DialogComponentProps = {
  component: JSX.Element;
  disabled?: boolean;
  dialogTitle: string;
  dialogSubtitle: string | JSX.Element;
  cancelButtonText?: string;
  onClose?: () => void;
  handleValidation?: () => boolean | Promise<boolean>;
  onConfirm: () => void;
};

/**
 * Custom clickable component that opens a "confirm action" dialog.
 */
export const DialogComponent = ({
  component,
  disabled,
  dialogTitle,
  dialogSubtitle,
  cancelButtonText,
  onClose,
  handleValidation,
  onConfirm,
}: DialogComponentProps) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    if (disabled !== true) {
      setOpen(true);
    }
  };

  const handleClickClose = () => {
    if (onClose !== undefined) {
      onClose();
    }
    setOpen(false);
  };

  return (
    <Fragment>
      <span onClick={handleClickOpen}>{component}</span>

      <CustomDialog
        open={open}
        dialogTitle={dialogTitle}
        dialogSubtitle={dialogSubtitle}
        cancelButtonText={cancelButtonText}
        onClose={handleClickClose}
        handleValidation={handleValidation}
        onConfirm={onConfirm}
      />
    </Fragment>
  );
};

export type CancelFormProps = {
  navigateDir: string;
};

/**
 * Dialog button to confirm a form resignation. Redirects to some other page.
 * @param {string} navigateDir - redirect directory
 * @returns {JSX.Element} Button and dialog
 */
export const CancelButton = ({ navigateDir }: CancelFormProps) => {
  const navigate = useNavigate();

  return (
    <Fragment>
      <DialogComponent
        component={
          <Button variant="outlined" color="primary" sx={{ mt: 3, ml: 1 }}>
            Cancelar
          </Button>
        }
        dialogTitle="¿Cancelar carga?"
        dialogSubtitle={"Los datos ingresados no serán guardados."}
        cancelButtonText={"Quedarme aquí"}
        onConfirm={() => {
          navigate(navigateDir);
        }}
      />
    </Fragment>
  );
};

export type ConfirmFetchAndRedirectProps = {
  component: JSX.Element;
  disabled?: boolean;
  handleValidation?: any;
  onClose?: () => void;
  msg: string;
  onConfirm: () => Promise<number>;
  navigateDir: string;
};

/**
 * Highly customizable component that opens a confirmation dialog and waits for an HTML response to redirect to some directory
 */
export const ConfirmFetchAndRedirect = ({
  component,
  disabled,
  handleValidation,
  onClose,
  msg,
  onConfirm,
  navigateDir,
}: ConfirmFetchAndRedirectProps) => {
  const [open, setOpen] = useState(false);

  const handleValidationTest = async () => {
    if (handleValidation === undefined) {
      return;
    }
    const res = await handleValidation();
    if (res) {
      setOpen(true);
    }
  };

  const handleComponentOpen = () => {
    if (!disabled) {
      if (handleValidation !== undefined) {
        handleValidationTest();
      } else {
        setOpen(true);
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);

  const navigate = useNavigate();

  const handleClickClose = () => {
    if (onClose !== undefined) {
      onClose();
    }
    setOpen(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setOpen(false);
    const resStatus = await onConfirm();

    setLoading(false);
    if (200 <= resStatus && resStatus < 300) {
      setSuccess(true);
      setTimeout(() => {
        navigate(navigateDir);
      }, 4000);
    } else {
      if (onClose !== undefined) {
        onClose();
      }
      setFailure(true);
      setTimeout(() => {
        setFailure(false);
      }, 4000);
    }
  };

  return (
    <Fragment>
      <span onClick={handleComponentOpen}>{component}</span>

      <CustomDialog
        open={open}
        dialogTitle="¿Confirmar?"
        dialogSubtitle={msg}
        onClose={handleClickClose}
        onConfirm={handleConfirm}
      />

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

export type ConfirmButtonProps = {
  handleValidation?: () => boolean | Promise<boolean>;
  msg: string;
  onConfirm: () => Promise<number>;
  navigateDir: string;
  disabled?: boolean;
};

/**
 * Opens a dialog component to confirm a data load action. Redirects to some other page.
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
  disabled = false,
}: ConfirmButtonProps) => {
  return (
    <Fragment>
      <ConfirmFetchAndRedirect
        component={
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, ml: 1 }}
            disabled={disabled}
          >
            Confirmar
          </Button>
        }
        handleValidation={handleValidation}
        msg={msg}
        navigateDir={navigateDir}
        onConfirm={onConfirm}
        disabled={disabled}
      />
    </Fragment>
  );
};

//#endregion

//#region snackbars

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

export type MySnackBarProps = {
  open: boolean;
  severity: AlertColor | undefined;
  msg: string;
};

const eventSuccessSnackBar: MySnackBarProps = {
  open: true,
  severity: "success",
  msg: "Tarea realizada!",
};

const eventAddSuccessSnackBar: MySnackBarProps = {
  open: true,
  severity: "success",
  msg: "Tarea agregada exitosamente!",
};

const commentSuccessSnackBar: MySnackBarProps = {
  open: true,
  severity: "success",
  msg: "Comentario registrado!",
};

const snapshotSuccessSnackBar: MySnackBarProps = {
  open: true,
  severity: "success",
  msg: "Captura guardada!",
};

const errorSnackBar: MySnackBarProps = {
  open: true,
  severity: "error",
  msg: "Algo ha fallado.",
};

export const mySnackBars = {
  eventSuccessSnackBar,
  eventAddSuccessSnackBar,
  commentSuccessSnackBar,
  snapshotSuccessSnackBar,
  errorSnackBar,
};

export type SnackBarAlertProps = {
  open: boolean;
  severity: AlertColor | undefined;
  msg: string;
  setSnackBar: React.Dispatch<React.SetStateAction<MySnackBarProps>>;
};

export const SnackBarAlert = ({
  open,
  severity,
  msg,
  setSnackBar,
}: SnackBarAlertProps) => {
  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar((prevObject: any) => ({
      ...prevObject,
      open: false,
    }));
  };

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

//#endregion

export type StandardDatePickerProps = {
  onOpenDateSelector?: () => void;
  date?: Date | null;
  setDate?: React.Dispatch<React.SetStateAction<Date | null>>;
  onDateSelect?: (date: Date) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
};

/**
 *
 * @param {Date | null} date
 * @param {React.Dispatch<React.SetStateAction<Date | null>>} setDate
 * @param {function(Date): void} onDateSelect
 * @param {string} minDate
 * @param {string} maxDate
 * @param {string} label
 * @returns {JSX.Element}
 */
export const StandardDatePicker = ({
  onOpenDateSelector,
  date,
  setDate,
  onDateSelect,
  label,
  minDate,
  maxDate,
}: StandardDatePickerProps): JSX.Element => {
  const today = new Date();

  const [calendarAnchor, setCalendarAnchor] = useState<any>();
  const openDateSelector = Boolean(calendarAnchor);

  const handleOpenDateSelector = (event: any) => {
    onOpenDateSelector && onOpenDateSelector();
    setCalendarAnchor(event.currentTarget);
  };

  const handleCloseDateSelector = () => {
    setCalendarAnchor(null);
  };

  function handleDateChange(date: any) {
    if (!Number.isNaN(new Date(date).getTime())) {
      const dateObject = new Date(date);
      setDate && setDate(dateObject);
      onDateSelect && onDateSelect(dateObject);
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
          date && setDate && (e.key === "Backspace" || e.key === "Delete")
            ? setDate(null)
            : null
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

export const ButtonDatePicker = ({
  onOpenDateSelector,
  onDateSelect,
  date,
  label,
  minDate,
  maxDate,
  disabled,
}: any): JSX.Element => {
  const today = new Date();

  const [calendarAnchor, setCalendarAnchor] = useState<any>();
  const openDateSelector = Boolean(calendarAnchor);

  const handleOpenDateSelector = (event: any) => {
    onOpenDateSelector && onOpenDateSelector();
    setCalendarAnchor(event.currentTarget);
  };

  const handleCloseDateSelector = () => {
    setCalendarAnchor(null);
  };

  function handleDateChange(date: any) {
    if (!Number.isNaN(new Date(date).getTime())) {
      const dateObject = new Date(date);
      onDateSelect && onDateSelect(dateObject);
    }
    handleCloseDateSelector();
  }

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, ml: 1 }}
        disabled={disabled}
        onClick={(e) => (!disabled ? handleOpenDateSelector(e) : null)}
        endIcon={<TodayIcon />}
      >
        {label ? label : "Seleccionar fecha"}
      </Button>

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

//#region Data Fetcher

const PageLoading = () => {
  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "25vh",
      }}
    >
      <CircularProgress
        size={68}
        sx={{
          color: "grey",
        }}
      />
    </Box>
  );
};

type ResourceGetter = () => Promise<any>;

interface DataFetcherProps {
  children: (params: any) => JSX.Element;
  getResourceFunctions: ResourceGetter[];
  dataReloadCounter?: number;
}

export const DataFetcher: React.FC<DataFetcherProps> = ({
  children,
  getResourceFunctions,
  dataReloadCounter,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [params, setParams] = useState<any>({});

  const fetchData = async () => {
    try {
      const results = await Promise.all(
        getResourceFunctions.map((func) => func())
      );
      const paramsObject = Object.fromEntries(results);
      setParams(paramsObject);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataReloadCounter]);

  return loading ? (
    <PageLoading />
  ) : !error ? (
    children(params)
  ) : (
    <ResourceNotFound />
  );
};

//#endregion
