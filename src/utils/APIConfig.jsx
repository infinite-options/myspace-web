const isDebug = process.env.REACT_APP_DEBUG === 'true';

const APIConfig = {
  // baseURL: {
  //   dev: "https://mfs1128sspm.manifestmy.space",
  // },
  baseURL: {
    dev: isDebug? "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev" : "https://mfs1128sspm.manifestmy.space",
  }
  // baseURL: {
  //   dev: "http://127.0.0.1:4010",
  // }
};

export default APIConfig;
