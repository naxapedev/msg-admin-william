import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Messaging Dashboard
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">
          Broadcast
        </Button>
        <Button color="inherit" component={RouterLink} to="/admin">
          Admin Panel
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar