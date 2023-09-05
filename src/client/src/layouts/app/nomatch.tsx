import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import PageTitle from "../../components/title";

export default function NoMatch() {
  PageTitle("404");

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
        }}
      >
        <h1>
          Error 404
          <br />
        </h1>
        <h1>
          Página no encontrada 🤔
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
