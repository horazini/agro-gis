import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageTitle } from "../../components/customComponents";

export default function RuntimeError() {
  PageTitle("😧");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10vh",
      }}
    >
      <Typography
        component={"span"}
        style={{
          textAlign: "center",
        }}
      >
        <h1>
          ¡Vaya! 😧 Algo ha salido mal.
          <br />
        </h1>
        <h1>
          Intente nuevamente.
          <br />
          Si el problema persiste contacte a su proveedor de servicio.
          <br />
          <br />
        </h1>
        <h1>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            Ir a inicio
          </Link>
        </h1>
      </Typography>
    </div>
  );
}
