import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useEffect } from "react";
import { roleMap } from "../Onboarding/helper";

const Forbidden = () => {
  const navigate = useNavigate();
  const { user} = useUser();

  useEffect(() => {
    if(user){
      window.location.reload();
    }
  }, [user]);


  return (
    <Box sx={{ textAlign: "center", p: 4 }}>
      <Typography variant="h5">{"Login required"}</Typography>
      <Typography sx={{ my: 2 }}>
        {`You will need to login to view this page.`}
      </Typography>
      <Button
        variant="contained"
        sx={{
          background: "#3D5CAC",
          color: "#FFFFFF",
          borderRadius: "10px",
          textTransform: "none",
        }}
        onClick={() => navigate("/")}
      >
        {"Go to Login"}
      </Button>
    </Box>
  );
};

export default Forbidden;
