#!/bin/bash

DATE=$(date +"%Y-%m-%d_%H%M")
PATH=/home/pi/jarvis/public/images/photos

/usr/bin/fswebcam -r 1280x720 --no-banner $PATH/photo.jpg > /dev/null 2>&1
sleep 10

echo '{"actions": [{
   "code": "PLAY_TEXT",
   "action": "PLAY",
   "parameters": ["Feito!"],
   "synchronous": true
}]}';

# EOF
