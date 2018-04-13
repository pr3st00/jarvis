USERNAME=24c3e489-c30c-465a-88c7-f8874ea072c6
PASSWORD=OOH6Z1dQhnpw
CUSTOMIZATION_ID="5a38b07e-219f-4d1e-bc9a-a9bb62ab7fcd"

if ! $(ls /tmp/command*wav >/dev/null 2>&1); then
	echo "[ERROR] No file to process"
	exit 1;
fi

for FILE in /tmp/command*wav
do

NAME=$(basename $FILE | cut -d"." -f1)

echo "[INFO] Adding file $FILE as $NAME"

/usr/bin/curl -X POST -u $USERNAME:$PASSWORD \
--header "Content-Type: audio/wav" \
--data-binary @$FILE \
"https://stream.watsonplatform.net/speech-to-text/api/v1/acoustic_customizations/$CUSTOMIZATION_ID/audio/$NAME"

rm $FILE
sleep 10

done
