USERNAME=24c3e489-c30c-465a-88c7-f8874ea072c6
PASSWORD=OOH6Z1dQhnpw

curl -X GET -u $USERNAME:$PASSWORD \
--header "Content-Type: application/json" \
"https://stream.watsonplatform.net/speech-to-text/api/v1/acoustic_customizations?language=pt-BR"
