#!/bin/bash

function getLanguage() {

	JARVIS_CONFIG=$1;

	language=$(/bin/cat $JARVIS_CONFIG | /bin/grep language | /usr/bin/head -1 | /usr/bin/cut -d':' -f 2 | /bin/sed -e's/[", ]//g')

	echo $language
}
