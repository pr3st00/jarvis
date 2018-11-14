#!/bin/bash

function buildPlayAction() {

	message=$1;

	echo '{"actions": [{ 
		"code": "PLAY_TEXT", 
		"action": "PLAY", 
		"parameters": ["'$message'"], 
		"synchronous": true }]}'; 

}

function buildStopAction() {

	echo '{"actions": [{ 
		"code": "STOP", 
		"action": "STOP", 
		"parameters": ["'none'"], 
		"synchronous": true }]}'; 

}
