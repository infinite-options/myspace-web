const encryptionON = process.env.REACT_APP_ENCRYPTION_ON === "true";

const APIConfig = {
  // baseURL: {
  //   dev: "https://mfs1128sspm.manifestmy.space",
  // },

  // baseURL: {
  //   dev: "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev",
  // },

  baseURL: {
    dev: encryptionON ? "https://qn4agnb0v9.execute-api.us-west-1.amazonaws.com/production" : "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev",
  },

  // baseURL: {
  //   dev: "http://127.0.0.1:4010",
  // },
};

export default APIConfig;
