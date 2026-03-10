const encryptionON = process.env.REACT_APP_ENCRYPTION_ON === "true";

if (!encryptionON) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
