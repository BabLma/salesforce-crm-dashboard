import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function AddContactDialog({ open, onClose, onContactAdded }) {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.FirstName || !formData.LastName) {
      setError("First Name and Last Name are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import the API function dynamically to avoid circular deps
      const { createContact } = await import("../services/salesforceApi");

      await createContact({
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        Email: formData.Email || null,
        Phone: formData.Phone || null,
      });

      const fullName = `${formData.FirstName} ${formData.LastName}`;

      // Reset form
      setFormData({
        FirstName: "",
        LastName: "",
        Email: "",
        Phone: "",
      });

      // Notify parent component with contact name
      onContactAdded(fullName);
      onClose();
    } catch (err) {
      console.error("Error creating contact:", err);
      setError(err.message || "Failed to create contact");
      setSnackbar({
        open: true,
        message: err.message || "Failed to create contact",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        FirstName: "",
        LastName: "",
        Email: "",
        Phone: "",
      });
      setError(null);
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="add-contact-dialog-title"
        aria-describedby={error ? "add-contact-error" : undefined}
      >
        <DialogTitle id="add-contact-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            Add New Contact
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                id="add-contact-error"
                role="alert"
              >
                {error}
              </Alert>
            )}
            <TextField
              name="FirstName"
              label="First Name"
              value={formData.FirstName}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              autoFocus
              disabled={loading}
            />

            <TextField
              name="LastName"
              label="Last Name"
              value={formData.LastName}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              disabled={loading}
            />

            <TextField
              name="Email"
              label="Email"
              type="email"
              value={formData.Email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={loading}
            />

            <TextField
              name="Phone"
              label="Phone"
              value={formData.Phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={loading}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <PersonAddIcon />
              }
            >
              {loading ? "Creating..." : "Create Contact"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AddContactDialog;
