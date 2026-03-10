# Manifest Property Management README

## First time set up

Clone the repo

Get the .env file from Google Drive

Run `npm install --legacy-peer-deps`

# ----------------------------------------------------------------------------

When running in local mode data may be encrypted. To turn off encryption in the .env file set
REACT_APP_ENCRYPTION_ON=false to turn encryption off

REACT_APP_ENCRYPTION_ON=true keeps encryption on
NOTE: Turning encryption off only affects POST & PUT commands
GET Commands are still returned as encrypted and must be decoded in POSTMAN or turning off encryption in the Backend .env file
