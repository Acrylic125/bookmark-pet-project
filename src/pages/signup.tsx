import { useState } from "react";
import { Box, Button, Container, FormGroup, Typography, Input, InputLabel } from "@mui/material";

function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const onFormSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Validation
    if (!email || !email.includes("@") || !password || !name) {
      setError("Please enter a valid email and password");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // POST form values
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await res.json();

    alert(data.success ? "User created successfully" : data.message);
  };

  return (
    <Container maxWidth="md">
      <Box m={2} pt={3}>
        <FormGroup>
          <form
            onSubmit={onFormSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            // In practice, do not use inline styles
          >
            <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
              Sign Up
            </Typography>
            <InputLabel htmlFor="name">Name</InputLabel>
            <Input type="name" size="small" id="name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
            <InputLabel htmlFor="email">Email address</InputLabel>
            <Input type="email" size="small" id="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input type="password" size="small" id="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
            {error && (
              <Typography variant="body2" sx={{ color: "red" }}>
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" color="primary">
              Sign Up
            </Button>
          </form>
        </FormGroup>
      </Box>
    </Container>
  );
}

export default SignUpForm;
