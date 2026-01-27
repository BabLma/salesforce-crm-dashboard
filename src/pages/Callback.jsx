import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import { exchangeCodeForToken, storeAuthTokens } from "../auth/salesforceAuth";

function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false); // Prevent double execution

  useEffect(() => {
    // Prevent running twice in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Check for OAuth errors
      if (errorParam) {
        setError(errorDescription || "Authorization failed");
        setLoading(false);
        return;
      }

      // Check if code exists
      if (!code) {
        setError("No authorization code received");
        setLoading(false);
        return;
      }

      try {
        // Exchange code for access token
        const authData = await exchangeCodeForToken(code);

        // Store tokens
        storeAuthTokens(authData);

        // Redirect to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Callback error:", err);
        setError(err.message || "Failed to complete authentication");
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Authenticating with Salesforce...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait while we verify your credentials
            </Typography>
          </>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ width: "100%" }}
            action={
              <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
                Return to Login
              </a>
            }
          >
            <Typography variant="subtitle1" gutterBottom>
              Authentication Error
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        ) : null}
      </Box>
    </Container>
  );
}

export default Callback;
