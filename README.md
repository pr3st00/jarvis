<h1 align="center">Jarvis Home Automation</h1>

<p>
A voice controlled home automation system, along with plugins for doing cool things. 

It uses the amazing snowboy product (https://snowboy.kitt.ai/)
for waiting for a keyword, and then executes actions based on a pre-determined json format.

Actions can be executed in parallel or sequentially, and can in turn return another actions. This simple framework allows complex actions to be executed with little effort.
</p>

## Current Release: v0.0.10

## Current available plugins
1. Jokes    = tells a random joke
2. Weather  = tells the current weather condition
3. TV       = controls a bravia tv (turn off, open netflix, etc)
4. Music    = search for musics on youtube, plays all of them until it's called again.
5. Define   = looks for a term on wikipedia, tells the definition.

## Web interface
It currently has a web interface, which displays real time events and also plays messages. In the future it will allow some level of interaction too.

## Installation
Quick installation for the Raspberry Pi 2+
```
git clone https://github.com/pr3st00/jarvis.git
cd jarvis
npm install
npm start
```

## Current Feature Requests/Suggestions
Pending..

## License
MIT

## Author
[Fernando Almeida] (fernando.c.almeida@gmail.com)
