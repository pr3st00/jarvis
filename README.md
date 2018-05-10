<h1 align="center">Jarvis Home Automation</h1>

<p>
A voice controlled home automation system, along with plugins for doing cool things. 

It uses the amazing snowboy product (https://snowboy.kitt.ai/)
for waiting for a keyword, and then executes actions based on a pre-determined json format.

Actions can be executed in parallel or sequentially, and can in turn return another actions. This simple framework allows complex actions to be executed with little effort.
</p>

## Current Release: v0.0.10

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
| PLAY          | Says a phrase           | One parameter only with the phrase itself                                                           |
| HTTPGET       | Do a HTTP GET           | First parameter is the url, Any remaining ones will be passed as parameters in the url              |
| HTTPPOST      | Do a HTTP POST          | First parameter is the url, Second parameter is the body                                            |
| SCRIPT        | Executes a shell script | First parameter is the script location. Any remaining ones will be passed as parameters to the same |
| MODULE        | Calls a module          | First parameter is the module name. Any remaining ones will be passed as parameters to the same     |

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
| wikipedia     | looks for a term on wikipedia        | term                             |

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
