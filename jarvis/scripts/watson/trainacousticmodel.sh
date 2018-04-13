USERNAME=24c3e489-c30c-465a-88c7-f8874ea072c6
PASSWORD=OOH6Z1dQhnpw
CUSTOMIZATION_ID="5a38b07e-219f-4d1e-bc9a-a9bb62ab7fcd"

/usr/bin/curl -X POST -u $USERNAME:$PASSWORD \
--header "Content-Type: application/json" \
"https://stream.watsonplatform.net/speech-to-text/api/v1/acoustic_customizations/$CUSTOMIZATION_ID/train"

