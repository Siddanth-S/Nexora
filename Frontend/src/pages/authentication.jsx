import React, { useContext } from "react";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContexts"; // Adjust the path as needed
// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [message, setMessage] = useState(); // For error messages or notifications
  const [formState, setformState] = useState(0);
  const [error, setError] = useState();

  const { handleRegister, handleLogin } = useContext(AuthContext);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
        if (result && result.toLowerCase().includes("success")) {
          setMessage("Logged in successfully");
          setError(null);
        } else {
          setError(result || "Login failed");
          setMessage(null);
        }
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        if (result) {
          setError(result);
          setMessage("User registered successfully.Please Log in");
        }
      }
    } catch (e) {
      const errMsg = e?.response?.data?.message || "An error occurred";
      setError(errMsg);
      setMessage(null); // Clear previous message to prevent Snackbar showing
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          backgroundImage: "url('/background.jpeg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <CssBaseline />
        <Typography
          variant="h4"
          sx={{
            position: "absolute",
            top: 20,
            left: 30,
            color: "orange",
            fontWeight: "bold",
            zIndex: 10,
          }}
        >
          Nexora
        </Typography>
        <Grid
          item
          xs={12}
          component={Paper}
          elevation={6}
          square
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            minHeight: "100vh",
          }}
        >
          <Box
            sx={{
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: 400,
              width: "100%",
              justifyContent: "flex-start",
              height: "100%",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5"></Typography>
            <Box
              component="img"
              src="/preview.png"
              alt="Preview Illustration"
              sx={{
                position: "absolute",
                top: "40%",
                left: 200,
                transform: "translateY(-30%)",
                width: 500,
                height: "60vh",
                maxWidth: "40%",
                zIndex: 5,
              }}
            />
            <div>
              <Button
                variant={formState === 0 ? "contained" : "text"}
                onClick={() => {
                  setformState(0);
                  setMessage(null);
                  setError(null);
                }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "text"}
                onClick={() => {
                  setformState(1);
                  setMessage(null);
                  setError(null);
                }}
              >
                Sign Up
              </Button>
            </div>

            <Box component="form" noValidate sx={{ mt: 1, width: "100%" }}>
              {formState === 1 ? (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="Fullname"
                  label="Fullname"
                  name="Fullname"
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              ) : null}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="Username"
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />
              {(error || message) && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color:
                      message === "User registered successfully.Please Log in"
                        ? "green"
                        : "red",
                  }}
                >
                  {error || message}
                </Typography>
              )}
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
