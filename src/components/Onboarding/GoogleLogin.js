import React, { useState, useEffect } from "react";
// import axios from "axios";
import { fetchMiddleware as fetchMiddleware, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { roleMap } from './helper';
import googleImg from "../../images/ContinueWithGoogle.svg";
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Stack, ThemeProvider, Button, Typography, Grid, Paper, Container, Toolbar, OutlinedInput } from "@mui/material";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const GOOGLE_LOGIN = process.env.REACT_APP_GOOGLE_LOGIN;
let SCOPES =
  "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile ";

function GoogleLogin({buttonStyle, buttonText, }) {
  const navigate = useNavigate();
  // let google=null;
  const [email, setEmail] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [userDoesntExist, setUserDoesntExist] = useState(false);
  const [socialId, setSocialId] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [accessExpiresIn, setAccessExpiresIn] = useState("");
  const { setAuthData, setLoggedIn, selectRole } = useUser();
  let codeClient = {};
  function getAuthorizationCode() {
    // Request authorization code and obtain user consent,  method of the code client to trigger the user flow
    codeClient.requestCode();
  }

  const socialGoogle = async (e, u) => {
    setShowSpinner(true);
    setAuthData(u);
    const { role } = u.user;
    const openingRole = role.split(",")[0];
    selectRole(openingRole);
    setLoggedIn(true);
    const { dashboardUrl } = roleMap[openingRole];
    navigate(dashboardUrl);
    setShowSpinner(false);
  };

  useEffect(() => {
    /* global google */
    if(google) {
    codeClient = google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        // gets back authorization code
        if (tokenResponse && tokenResponse.code) {
          let auth_code = tokenResponse.code;
          let authorization_url = "https://accounts.google.com/o/oauth2/token";

          var details = {
            code: auth_code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirectUri: "postmessage",
            grant_type: "authorization_code",
          };
          var formBody = [];
          for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
          }
          formBody = formBody.join("&");
          // use authorization code, send it to google endpoint to get back ACCESS TOKEN n REFRESH TOKEN
          fetch(authorization_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formBody,
          })
            .then((response) => {
              return response.json();
            })

            .then((data) => {
              let at = data["access_token"];
              let rt = data["refresh_token"];
              let ax = data["expires_in"];
              //  expires every 1 hr
              setAccessToken(at);
              // stays the same and used to refresh ACCESS token
              setRefreshToken(rt);
              setAccessExpiresIn(ax);
              //  use ACCESS token, to get email and other account info
              axios
                .get(
                  "https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" +
                    at
                )
                .then((response) => {
                  let data = response.data;                  

                  let e = data["email"];
                  let si = data["id"];
                  let fn = data["given_name"];
                  let ln = data["family_name"];

                  setEmail(e);

                  setSocialId(si);

                  axios
                    .get(
                      `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/MYSPACE/${e}`
                    )
                    .then(({ data }) => {
                      if (
                        data["message"] === "Email ID doesnt exist"
                      ) {
                        const navigateToNewUser = async () => {
                          const user = {
                            email: e,
                            password: GOOGLE_LOGIN,
                            first_name: fn,
                            last_name: ln,
                            google_auth_token: at,
                            google_refresh_token: rt,
                            social_id: si,
                            phone_number: "",
                            // access_expires_in: ax,
                            access_expires_in: String(ax),
                          };
                          // navigate("/createProfile", {
                          //   state: {
                          //     user: user,
                          //   },
                          // });
                          navigate("/newUser", {
                            state: {
                              user: user,
                            },
                          });
                        };                        
                        navigateToNewUser();
                        return;
                      } else if (
                        data["message"] === "Login with email"
                      ) {
                        alert(data["message"]);
                      } else {
                        let user = data.result;
                        let user_id = data.result.user.user_uid;
                        setAccessToken(at);
                        localStorage.removeItem('hasRedirected');
                        sessionStorage.setItem('authToken', user.access_token);
                        sessionStorage.setItem('refreshToken', user.refresh_token)
                        let url = `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateAccessToken/MYSPACE/${user_id}`;
                        axios
                          .post(url, {
                            google_auth_token: at,
                          })
                          .then((response) => {
                            socialGoogle(email, user);
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                        return accessToken;
                      }
                    });
                })
                .catch((error) => {
                  console.log(error);
                });
              return (
                accessToken, refreshToken, accessExpiresIn, email, socialId
              );
            })
            .catch((err) => {
              console.log(err);
            });
        }
      },
    });
    }
  }, [getAuthorizationCode]);
  const onCancelModal = () => {
    setUserDoesntExist(false);
  };

  // return (
  //   <div
  //     style={{
  //       display: "flex",
  //       justifyContent: "center",
  //       alignItems: "center",
  //       // paddingTop: "5%",
  //     }}
  //   >
  //     <div className="w-100">
  //       <div></div>
  //       <div>
  //         <div></div>
  //         <div id="signUpDiv">
  //           <Button
  //             onClick={() => getAuthorizationCode()}
  //             role="button"
  //             sx={{
  //               width: '100%',
  //               textTransform: "none",
  //               "&:hover, &:focus, &:active": {
  //                 backgroundColor: "white",
  //               },
  //             }}
  //           >
  //             <img
  //               style={{
  //                 width: "100%",
  //               }}
  //               alt="Google sign-up"
  //               src={googleImg}
  //             />
  //           </Button>
  //         </div>
  //       </div>
  //       <div></div>
  //     </div>
  //   </div>
  // );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // paddingTop: "5%",
      }}
    >                      
      <Button
        onClick={() => getAuthorizationCode()}
        role="button"
        // sx={{
        //   marginTop: "10px",
        //   width: '100%',
        //   height: '39px',         
        //   textTransform: "none",
        //   // "&:hover, &:focus, &:active": {
        //   //   backgroundColor: "white",
        //   // },
        //   borderRadius: "5px",
        //   fontSize: "16px",
        //   backgroundColor: "#F2F2F2",
        //   textTransform: "none",
        //   color: "#000000",
        //   fontWeight: "bold",
        //   "&:hover": {
        //     backgroundColor: "#3D5CAC",
        //     color: "#FFFFFF",
        //   },
        // }}
        sx={buttonStyle}
      >
        <GoogleIcon />
        <Box sx={{ marginLeft: '10px', }}>
          <Typography sx={{fontWeight: "bold",}}>{buttonText}</Typography>
        </Box>
        
        {/* <img
          style={{
            // width: "100%",
            
          }}
          alt="Google sign-up"
          src={googleImg}
        /> */}
      </Button>                
    </div>
  );
}

export default GoogleLogin;
