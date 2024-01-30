import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageTitle } from "../../components/customComponents";

const NoMatchSkeleton = ({ message }: { message: string }) => {
  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20vh",
      }}
    >
      <Typography
        variant="h4"
        component={"span"}
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        Error 404
        <br />
        {message}
        <br />
        <br />
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          Ir a inicio
        </Link>
      </Typography>
    </Box>
  );
};

export default function NoMatch() {
  PageTitle("404");
  return <NoMatchSkeleton message={"Página no encontrada 🤔"} />;
}

export function ResourceNotFound() {
  return <NoMatchSkeleton message={"Recurso no encontrado 🤔"} />;
}
