import { Fragment, useEffect, useState } from "react";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import { API } from "../../config";
import { getSpeciesById } from "../../services/services";

function SpeciesForm(): JSX.Element {
  type FormElement = React.FormEvent<HTMLFormElement>;
  const navigate = useNavigate();
  const params = useParams();

  const { tenantId } = useSelector((state: RootState) => state.auth);

  interface ISpecies {
    name: string;
    description: string;
    tenant_id: number;
  }

  const [species, setSpecies] = useState<ISpecies>({
    name: "",
    description: "",
    tenant_id: tenantId || 1,
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setSpecies({ ...species, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormElement) => {
    try {
      e.preventDefault();
      setLoading(true);
      if (editing) {
        await fetch(`${API}/species/${params.id}`, {
          method: "PUT",
          body: JSON.stringify(species),
          headers: { "Content-type": "application/json" },
        });
      } else {
        await fetch("${API}/species", {
          method: "POST",
          body: JSON.stringify(species),
          headers: { "Content-type": "application/json" },
        });
      }
      setLoading(false);
      navigate("/species/list");
    } catch (error) {
      console.log(error);
    }
  };

  const loadSpecies = async (id: string) => {
    try {
      const data = await getSpeciesById(id);
      setSpecies(data);
      setEditing(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadSpecies(params.id);
    }
  }, [params.id]);

  return (
    <Fragment>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs={3}>
          <Card
            sx={{ mt: 5 }}
            style={{
              backgroundColor: "#0f64f2",
              padding: "1rem",
            }}
          >
            <Typography variant="h5" textAlign="center" color="white">
              {editing ? "Editar especie" : "Agregar una especie"}
            </Typography>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <TextField
                  variant="filled"
                  label="Nombre de la especie"
                  sx={{ display: "block", margin: ".5rem 0" }}
                  name="name"
                  value={species.name || ""}
                  onChange={handleChange}
                  inputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "white" } }}
                />
                <TextField
                  variant="filled"
                  label="Descripción de la especie"
                  multiline
                  rows={4}
                  sx={{ display: "block", margin: ".5rem 0" }}
                  name="description"
                  value={species.description || ""}
                  onChange={handleChange}
                  inputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "white" } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!species.name}
                >
                  {loading ? (
                    <CircularProgress color="inherit" size={24} />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default SpeciesForm;
