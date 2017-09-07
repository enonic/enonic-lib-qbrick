# enonic-lib-qbrick

Exposes the Qbrick API and makes it easy for developers to use the Qbrick Video Platform on any Enonic XP site.

## Getting Started

To include this lib in your Enonic project you will need to add the repo to your build.gradle file, and declare the dependencies. You must also have a couple of libs from Enonic.
It would also be wise to learn about the REST APIs that Qbrick use. The documentation can be found here: http://video.qbrick.com/docs/api/index.php


### Building

In build.gradle, add this to your buildscript's repositories:

```
maven {
	url  "http://dl.bintray.com/qbrickipo/Enonic" 
}
```

After that, you must include the lib in build.gradle under dependencies:

```
include 'com.qbrick:qvp:0.8'
```

If you haven't allready have included the lib.http-client from Enonic, you must do that aswell:

```
include 'com.enonic.lib:lib-http-client:1.0.0'
include 'com.qbrick:qvp:0.8'
```
Now you are ready to build.

# Using the lib

The lib consists of four different components, a lib (/lib/qbrick.js), a custom selector (/services/video-selector-service/video-selector-service.js), a macro (/macros/qbrickVideo) and simple styling (/assets/css/video.css)

## Lib (/lib/qbrick.js)

To gain access to the lib in a controller, you must require it:

```
var qbricklib = require('/lib/qbrick');
```
If you dont want to declare your Qbrick account ID each time you call a function, you can add this field to you site.xml:
```
 <items>
  <input type="TextLine" name="qbrickAccountId">
    <label>Qbrick Video Platform Account ID</label>
    <occurrences minimum="1" maximum="1"/>
  </input>
</items>
```
### Settings model
Each function in qbricklib will take a JSON object with the functions settings so when you are going to use a function, you must create a JSON with the desired parameters, for example:

```
var qbricklib = require('/lib/qbrick');

var settings = {};
settings.accountID = "12345";
settings.mediaID = "12345-12345-12345";
var mediaData = qbricklib.getMedia(settings);
```

### qbricklib.mediaQuery(settings)

Searches for medias on the spessified account with the query added.

Required parametrs in settings:
```
(String)settings.accountID; //Your account id
```
Optional parameters:
```
(String)settings.query // variables for the APi call, follow the Qbrick standard For a normal string search, query should be "q=[your search term here]" if left emtpy, the newest medias will be returned

(String)settings.fields; // Any fields you would like to add after the searchterm in the API call

```

Returns an array with metadata on each media:

```
var response = qbricklib.mediaQuery(settings);
(String)response[i].id //the ID of the media
(String)response[i].title //the title of the media
(String)response[i].description // the descritpion of the media
(int)response[i].hits // number of views
(String)response[i].created // the date the media was created
(String)response[i].duration // the duration of the media
(String)response[i].thumbnail // an URL the a preview image of the video
```


### qbricklib.getMedia(settings)

Returns the metadata of a single media.

Required parametrs in settings:
```
(String)settings.accountID; //Your account id
(String)settings.mediaID; //The id of the media you want metadata from
```
Optional parameters:
```
(String)settings.fields; // Any fields you would like to add in the API call

```
Returns a single JSON with the metadata of the media:
```
var response = qbricklib.getMedia(settings);
(String)response.id //the ID of the media
(String)response.title //the title of the media
(String)response.description // the descritpion of the media
(int)response.hits // number of views
(String)response.created // the date the media was created
(String)response.duration // the duration of the media
(String)response.thumbnail // an URL the a preview image of the video
```


### qbricklib.catalogQuery(settings)

Lists out all catalogs the the spessified account:

Required parametrs in settings:
```
(String)settings.accountID; //Your account id
```
Returns an array with metadata of each catalog:
```
var response = qbricklib.catalogQuery(settings);
(String)response[i].id //the ID of the catalog
(String)response[i].title //the title of the catalog
(String)response[i].description // the descritpion of the catalog
```

### qbricklib.getCatalog(settings)

Lists out all catalogs the the spessified account:

Required parametrs in settings:
```
(String)settings.accountID; //Your account id
(String)settings.catalogID; //The catalogs ID
```
Returns matadata on the spessified catalog:
```
var response = qbricklib.getCatalog(settings);
(String)response.id //the ID of the catalog
(String)response.title //the title of the catalog
(String)response.description // the descritpion of the catalog
```

### qbricklib.getPlayer(settings)

Generates html code to spawn a videoplayer that plays back the spessific media.

Required parametrs in settings:
```
(String)settings.accountID; //Your account id
(String)settings.mediaID; //The id of the media you want the player to play

```
Optional parameters in settings:
```
(String)settings.playerID // use a diferent playerID than 'default'
(float)settings.volume // the volume the plauer starts with, 1 = 100% and 0 = 0%. Defaults to 1
(bool)settings.autoplay // Should the player begin playback automaticly. Defaults to false
(bool)settings.repeat // Should the video repeat when done. Defaults to false
(String/JSON)settings.custom // any custom variables to add in the JSON of the embedSettings

```
Returns HTML:
```
embedplayer += '<script src="//play2.qbrick.com/framework/GoBrain.min.js"></script>'
embedplayer += '<div style="width: 100%; height: 100%" id="divPageContainer"><div style="width: 100%; height: 100%" id="'+uidprefix+mediaID+'" class="divPlayerContainer"></div></div><script type="text/javascript">';
embedplayer += 'var embedSettings = {';
embedplayer += 'config: "//video.qbrick.com/play2/api/v1/accounts/'+accountID+'/configurations/'+playerID+'",'; 
embedplayer += 'data: "//video.qbrick.com/api/v1/public/accounts/'+accountID+'/medias/'+mediaID+'",';
embedplayer += 'autoplay: '+autoplay+',';
embedplayer += 'repeat: '+repeat+',';
embedplayer += 'volume: '+volume+',';
embedplayer += 'height: "100%",';
embedplayer += 'width: "100%",';
embedplayer += custom;
embedplayer += 'widgetId: "'+uidprefix+mediaID+'"';
embedplayer += '};';
embedplayer += 'GoBrain.create(document.getElementById("'+uidprefix+mediaID+'"), embedSettings);';
embedplayer += '</script>';
```
Note that the player can be targeted though CSS.

## Custom selector (/services/video-selector-service/video-selector-service.js)
This is a selector you can use in any form that stores the ID of a media:
```
<input name="videoID" type="CustomSelector">
 <label>Select video</label>
 <occurrences minimum="1" maximum="1"/>
 <config>
  <service>video-selector-service</service>
 </config>
</input>
 ```
 
 ## Macro (/macros/qbrickVideo)
 A macro to embed a video in rich textfields. Will not work without the qbrickAccountId in site.xml:
 ```
 <items>
  <input type="TextLine" name="qbrickAccountId">
    <label>Qbrick Video Platform Account ID</label>
    <occurrences minimum="1" maximum="1"/>
  </input>
</items>
```

## Simple styling (/assets/css/video.css)
This CSS will make any video players from the lib responsive. 
To include this CSS on a render add the pagecontribution:
```
return {
	body: thymeleaf.render(view, model),
	pageContributions: {
		headEnd: [
			'<link rel="stylesheet" type="text/css" href="' + portal.assetUrl({path: 'css/video.css'}) + '"/>'
		]
	}
}
```


```
.qbrick-video-wrapper-single{
  width: 100%;
  /* whatever width you want */
  display: inline-block;
  position: relative;
  float: left;
  margin-bottom: 19px;
}
.qbrick-video-wrapper-single:after {
  padding-top: 56.25%;
  /* 16:9 ratio */
  display: block;
  content: '';
}
.qbrick-video-single{
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  /* fill parent */
  background-color: white;
  color: white;
}

.divPlayerContainer > div:first-child{
	width: 100% !important;
	height: 100% !important
}
```

## Built With

* [Enonic XP](http://www.enonic.com/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management

## Authors

* **Haakon Høier Sandvik** - *Developer* - [Hoier](https://github.com/Hoier)

## Special Thanks

* [Enonic Forum](https://discuss.enonic.com/)
* Runar Brastad [rbrastad](https://github.com/rbrastad)
