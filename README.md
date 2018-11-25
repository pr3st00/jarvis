<h1 align="center">Jarvis Home Automation</h1>

<p>
A voice controlled home automation system, along with plugins for doing cool things. 

It uses the amazing snowboy product (https://snowboy.kitt.ai/)
for waiting for a keyword, and then executes actions based on a pre-determined json format.

Actions can be executed in parallel or sequentially, and can in turn return another actions. This simple framework allows complex actions to be executed with little effort.
</p>

## Services backend
<p>
It currently supports two backend systems: WATSON and WIT (in progress).

The implementation can be selected by modifying the processor config on jarvis.json config file:

```json
{
    "jarvis": {
        "processor": "WATSON",
```
</p>

## Current Release: v0.0.15

## Message format

The messages will contain a list of actions, with a code which is mostly informative, an action which is one of the actions recognized by the framework (PLAY, HTTPGET, HTTPPOST, SCRIPT and MODULE) and a list of parameters which meaning will vary between modules. The messages will be executed sequentially or in parallel depending on the synchronous parameter.

Sample message for the music module:

```json
{
  "actions": [
    {
      "code": "playmusic",
      "action": "PLAY",
      "parameters": [
        "ok, searching..."
      ],
      "synchronous": true
    },
    {
      "code": "playmusic",
      "action": "MODULE",
      "parameters": [
        "music",
        "ramones"
      ],
      "synchronous": true
    }
  ]
}
```

## Supported actions:

| Action        | Description             | Parameters                                                                                          |
| ------------- | ------------------------| ----------------------------------------------------------------------------------------------------|
| PLAY          | Says a phrase           | One parameter only with the phrase itself or a http url pointing to an mp3                          |
| HTTPGET       | Do a HTTP GET           | First parameter is the url, Any remaining ones will be passed as parameters in the url              |
| HTTPPOST      | Do a HTTP POST          | First parameter is the url, Second parameter is the body                                            |
| SCRIPT        | Executes a shell script | First parameter is the script location. Any remaining ones will be passed as parameters to the same |
| MODULE        | Calls a module          | First parameter is the module name. Any remaining ones will be passed as parameters to the same     |
| STOP          | Stops processing        | Stops the processing of all actions right away                                                      |

## Modules
Jarvis uses a module system, where you can extend its capabilities by implementing new individual classes.

A plugin consits of:

1. A class which inherits from JarvisModule and implements a method called process with an array as an argument;
2. An entry on jarvis.json with at least a name and the location of the resource js file. Any other related config can be placed here and it will be automatically available during module runtime: 

```json
      "modules": [
      {
          "name": "joke",
          "resource": "default/joke",
          "config": "value"
      },
```

3. module.exports should export a single function called getInstance which returns a new instance of the plugin, usually a singleton.

## Current available modules

| Name          | Description                          | Parameters                       |
| ------------- | ------------------------------------ | -------------------------------- |
| joke          | tells a random joke                  | -NONE-                           |
| weather       | tells the current weather condition  | -NONE-                           |
| tv            | controls a bravia tv                 | Action (netflix or turnoff)      |
| music         | searchs  for musics on youtube,      | music/artist                     |
| video         | searchs  for videos on youtube,      | video                            |
| news          | displays current news                | -NONE-                           |
| wikipedia     | looks for a term on wikipedia        | term                             |
| 3dprinter     | interfaces with a 3d printer         | (add|remove),name or (list|clear)|

## Web interface
There are two web interfaces available (jarvis.html and tjbot.html), which displays real time events and also plays messages. They allow user to interact
with both text and voice as well, and they will use socket.io to display events. 

## Web services layer
Jarvis also exposes some RESTFull webservices in order for other systems to interact to it. This facilitates home automation allowing, for example, 
to trigger jarvis through a mobile application.

All services will reply with a json message in the following format:

```json
{ status : code }
```

where code can be one of the following: "success", "an error message" or "busy"

| Endpoint      | Method   | Description              |  Parameters                                                                          |
| ------------- | -------- | ------------------------ | ------------------------------------------------------------------------------------ |
| /api/actions  |  POST    | Process all actions      |  JSON list of actions (see format above in Message format section)                   |
| /api/command  |  POST    | Process a wav file       |  A wav file attached in a multipart/form-data with "command" as the contentId        |
| /api/text     |  POST    | Process a command text   |  A text for jarvis to proces in json format. Sample: { "text" : "What time is it?" } |
| /api/status   |  GET     | Process a status request |  Used for automation, it will reply with the current jarvis status (busy|available ) |

## Installation
Quick installation for the Raspberry Pi 2+
```
git clone https://github.com/pr3st00/jarvis.git
rename the sample config jarvis/config/jarvis_sample.json to jarvis/config/jarvis.json
edit the file and provide your details
cd jarvis
npm install
npm start
```
A small tweak is needed on the wav module, since it has all options hardcoded. Please edit the file writer.js under 
node_modules/wav/lib and modify the parameters as seen below:

```javascript
  // TODO: allow/properly handle other WAVE audio formats
  this.endianness = 'LE';
  this.format = 1; // raw PCM
  this.channels = 1;
  this.sampleRate = 16000;
```

## Current Feature Requests/Suggestions
Pending..

## License
MIT

## Author
[Fernando Almeida] (fernando.c.almeida@gmail.com)
