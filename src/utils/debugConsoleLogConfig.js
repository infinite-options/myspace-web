const isDebug = process.env.REACT_APP_DEBUG === 'true';

if (!isDebug) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}