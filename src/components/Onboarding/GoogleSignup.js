import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import axios from "axios";
import { fetchMiddleware, axiosMiddleware} from "../../utils/httpMiddleware";
import googleImg from "../../images/ContinueWithGoogle.svg";
import APIConfig from "../../utils/APIConfig";
import ListsContext from "../../contexts/ListsContext";
import { roleMap } from "./helper";
import { useUser } from "../../contexts/UserContext";



let CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
let CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const GOOGLE_LOGIN = process.env.REACT_APP_GOOGLE_LOGIN;
let SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile email";


const GoogleSignup = (props) => {
  const { isReferral } = props;
  const { userID } = props || {};
  const { role } = props;
  const newRole = role;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [socialId, setSocialId] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessExpiresIn, setAccessExpiresIn] = useState("");
  const { fetchLists, } = useContext(ListsContext)
   const { setAuthData, setLoggedIn, selectRole } = useUser();

  // let google=null;
  let codeClient = {};

  const checkIfUserExists = async (email) => {
    if (email) {
      try {
        const response = await axiosMiddleware.get(`${APIConfig.baseURL.dev}/userInfo/${email}`);
        if (response) {
          return response;
        } else {
          return null;
        }
      } catch (error) {
        if (error.response && error.response.status === 404 && error.response.data.message === "User not found") {
          return null;
        } else {
          throw error;
        }
      }
    } 
  };

  const handleLogin = async (e, fn, ln, at, rt, si, ax) => {
    axiosMiddleware
      .get(
        `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/MYSPACE/${e}`
      )
      .then(async (response) => {
        // console.log("----dhyey---- response from social login - ", response);
        const data = response.data;
        if (
          data["message"] === "Email ID does not exist"
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
          // console.log("----dhyey---- data from social login - ", data);
          let user = data.result;
          let user_id = data.result.user.user_uid;
          setAccessToken(at);
          localStorage.removeItem('hasRedirected');
          sessionStorage.setItem('authToken', user.access_token);
          sessionStorage.setItem('refreshToken', user.refresh_token)
          await fetchLists();

          let url = `https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateAccessToken/MYSPACE/${user_id}`;
          axiosMiddleware
            .post(url, {
              google_auth_token: at,
            })
            .then(async (response) => {
              // socialGoogle(email, user);
              // setShowSpinner(true);
              
              const { role } = user.user;

              const existingRoles = role.split(",");
              // //console.log("----dhyey---- exisiting role for current user - ", existingRoles)

              setLoggedIn(true);
              // Check if the new role already exists
              if (!existingRoles.includes(newRole)) {
                // Add the new role
                existingRoles.push(newRole);
                const updatedRole = existingRoles.join(",");
                // Send the update request to the server
                const response = await axiosMiddleware.put("https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateUserByUID/MYSPACE", {
                  user_uid: user.user.user_uid,
                  role: updatedRole,
                });
                // Check if the response is successful
                if (response.status === 200) {
                  let updatedUser = data.result;
                  updatedUser.user.role = updatedRole;
                  setAuthData(updatedUser);
                  //setCookie("user", { ...cookies.user, role: updatedRole }, { path: "/" });
                  // //console.log("----dhyey---- before navigating addNewRole updateduser- ", updatedUser, " --- user_id - ", result.user.user_uid, " -- newRole - ", newRole)
                  alert("Role updated successfully");
                  navigate("/addNewRole", { state: { user_uid: user.user.user_uid, newRole: newRole } });
                  return;
                } else {
                  alert("An error occurred while updating the role.");
                }
              }
              const openingRole = role.split(",")[0];
              selectRole(openingRole);
              setAuthData(user);
              setLoggedIn(true);
              const { dashboardUrl } = roleMap[openingRole];
              // //console.log("---after if condition of exisitingRole Login successfull moving to dashboard ", dashboardUrl);
              navigate(dashboardUrl);

              // const openingRole = role.split(",")[0];
              // selectRole(openingRole);
              // setLoggedIn(true);
              // const { dashboardUrl } = roleMap[openingRole];
              // navigate(dashboardUrl);
              // setShowSpinner(false);
            })
            .catch((err) => {
              //console.log(err);
            });
          return accessToken;
        }
      });
  }

  //   run onclick for authorization and eventually sign up
  function getAuthorizationCode() {
    // Request authorization code and obtain user consent,  method of the code client to trigger the user flow
    codeClient.requestCode();
  }

  useEffect(() => {
    /* global google */

    if (google) {
      // initialize a code client for the authorization code flow.
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
                console.log(response);
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
                  .get("https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" + at)
                  .then((response) => {
                    let data = response.data;

                    let e = data["email"];
                    let si = data["id"];
                    let fn = data["given_name"];
                    let ln = data["family_name"];

                    setEmail(e);

                    setSocialId(si);
                    const socialGoogle = async () => {
                      const user = {
                        email: e,
                        password: GOOGLE_LOGIN,
                        first_name: data["given_name"],
                        last_name: data["family_name"],
                        google_auth_token: at,
                        google_refresh_token: rt,
                        social_id: si,
                        access_expires_in: String(ax),
                        phone_number: "",
                        role: role,
                      };
                      if (isReferral) {
                        navigate(`/referralGoogleSignup/${userID}`, { state: { googleUserInfo: user } });
                      } else {
                        // navigate("/selectRole", {
                        //   state: {
                        //     user: user,
                        //   },
                        // });

                        console.log(e)

                        const userExist = await checkIfUserExists(e);

                        if (userExist != null) {
                          handleLogin(e, fn, ln, at, rt, si, ax);
                        } else {
                          navigate("/createProfile", {
                            state: {
                              user: user,
                              selectedBusiness: role
                            },
                          });  
                        }
                        
                      }
                    };
                    socialGoogle();
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                return accessToken, refreshToken, accessExpiresIn, email, socialId;
              })
              .catch((err) => {
                console.log(err);
              });
          }
        },
      });
    }
  }, [getAuthorizationCode]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // paddingTop: "5%",
      }}
    >
      <div className='w-100'>
        <div></div>
        <div>
          <div></div>
          <div id='signUpDiv'>
            <Button
              onClick={() => getAuthorizationCode()}
              role='button'
              sx={{
                textTransform: "none",
                "&:hover, &:focus, &:active": {
                  backgroundColor: "white",
                },
              }}
            >
              <img
                style={{
                  width: "100%",
                }}
                alt='Google sign-up'
                src={googleImg}
              />
            </Button>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default GoogleSignup;
