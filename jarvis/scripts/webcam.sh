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

FILE_NAME=$1
PLAY_MESSAGE=$2

if [ -z $FILE_NAME ]; then
    FILE_NAME="photo.jpg"
fi

/usr/bin/fswebcam -r 1280x720 --no-banner $PATH/$FILE_NAME > /dev/null 2>&1
/bin/sleep $SLEEP_TIME

if [ -z $PLAY_MESSAGE ]; then
    buildPlayAction "$DONE_MESSAGE";
else
    buildStopAction
fi


# EOF
