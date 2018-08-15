#!/bin/bash

#
# Takes a picture and saves it to the folder provided in PATH variable.
#
# Author: Fernando Costa de Almeida
#

. $(dirname $0)/functions/actions.sh 

DATE=$(date +"%Y-%m-%d_%H%M")
PATH=/home/pi/jarvis/public/images/photos
DONE_MESSAGE="Feito!"
SLEEP_TIME=6

/usr/bin/fswebcam -r 1280x720 --no-banner $PATH/photo.jpg > /dev/null 2>&1
/bin/sleep $SLEEP_TIME

buildPlayAction "$DONE_MESSAGE";

# EOF
