import { Box, Button, Container, Typography, Paper } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import CloudIcon from "@mui/icons-material/Cloud";
import { initiateLogin } from "../auth/salesforceAuth";

function Login() {
  const handleLogin = async () => {
    try {
      await initiateLogin();
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to initiate login. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
          role="region"
          aria-label="Login form"
        >
          <CloudIcon
            sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
            aria-hidden="true"
          />

          <Typography variant="h3" component="h1" gutterBottom align="center">
            Personal CRM Dashboard
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Connect with your Salesforce account to access contacts, leads, and
            manage your CRM data
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            fullWidth
            sx={{
              py: 1.5,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
            aria-label="Login with Salesforce using OAuth 2.0"
          >
            Login with Salesforce
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ mt: 3 }}
            role="note"
          >
            Secure OAuth 2.0 Authentication
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
