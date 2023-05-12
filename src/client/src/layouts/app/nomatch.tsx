import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function NoMatch() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "25vh",
      }}
    >
      <Typography
        component={"span"}
        style={{
          textAlign: "center",
          color: "black",
        }}
      >
        <h1>
          Error 404
          <br />
          Página no encontrada 🤔
          <br />
          <br />
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            Ir a inicio
          </Link>
        </h1>
      </Typography>
    </div>
  );
}
