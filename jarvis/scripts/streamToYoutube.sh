#!/bin/bash

#
# Starts a stream to youtube using the paramters below.
#
# Author: Fernando Costa de Almeida
#

. $(dirname $0)/functions/actions.sh 

# Youtube
URL="rtmp://a.rtmp.youtube.com/live2"
CONFIG_FILE="$(dirname $0)/../config/jarvis.json"

KEY=$(grep -Pzo '"youtube":.*{.*\n.*' $CONFIG_FILE | grep "key" | cut -d':' -f2 | sed -e 's/"//g' | tr -d ' ')

# Video parameters
SIZE="320x240"
FPS="25"
DURATION="120"

# Audio parameters
DEVICE="hw:1,0"
BITRATE="44100"
USE_ALSA="0"

# Messages
DONE_MESSAGE="Feito!"

if [[ $USE_ALSA -eq 1 ]]; then
	SOUND_PARAMETERS="-f alsa -ac 4 -ab 256k -i $DEVICE"
else
	SOUND_PARAMETERS="-ar $BITRATE -ac 2 -f s16le -i /dev/zero"
fi

#
# Works with sound
# avconv  -f alsa -ac 4 -i hw:1,0 -f video4linux2 -s $SIZE -r $FPS -i /dev/video0 -f flv -ar 44100 test.flv

timeout $DURATION avconv $SOUND_PARAMETERS -f video4linux2 -s $SIZE -r $FPS -i /dev/video0 -f flv -ar $BITRATE "$URL/$KEY" > /dev/null 2>&1 &

buildPlayAction "$DONE_MESSAGE";

# EOF
