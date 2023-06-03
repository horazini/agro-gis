import { useDispatch } from "react-redux";
import { login, logout } from "../../redux/authSlice";
import bcrypt from "bcryptjs";

// función para codificar la contraseña
function Login() {
  const dispatch = useDispatch();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const username = event.target.username.value;
    //const password = event.target.password.value;
    const password = bcrypt.hashSync(event.target.password.value, 10);
    console.log(password);
    //dispatch(login({ username, password }) as any);
  };

  const handleClose = (event: any) => {
    event.preventDefault();
    dispatch(logout() as any);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input type="text" name="username" />

        <label htmlFor="password">Password:</label>
        <input type="password" name="password" />

        <button type="submit">Submit</button>
      </form>
      <button onClick={handleClose}>Aah re loco</button>
    </>
  );
}

export default Login;
