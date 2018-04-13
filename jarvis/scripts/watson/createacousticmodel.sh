USERNAME=24c3e489-c30c-465a-88c7-f8874ea072c6
PASSWORD=OOH6Z1dQhnpw
NAME=SALA
BASE_MODEL=pt-BR_BroadbandModel
DESC="Sala acoustic model"

curl -X POST -u $USERNAME:$PASSWORD \
--header "Content-Type: application/json" \
--data "{\"name\": \"$NAME\", \"base_model_name\": \"$BASE_MODEL\", \"description\": \"$DESC\"}" \
"https://stream.watsonplatform.net/speech-to-text/api/v1/acoustic_customizations"
