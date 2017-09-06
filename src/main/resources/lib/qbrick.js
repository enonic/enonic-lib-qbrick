var httpClientLib = require('/lib/http-client');
var UTIL = require('/lib/enonic/util');
var qbrickBaseURL = "https://video.qbrick.com/";
var accountID;
function getThumbnail(asset){
	var thumb;
	var j;
	var k;
	var foundwidth = 0;
	var found = false;//if found image with rel: thumbnail
	if(asset != undefined){
		if(asset.resources != []){
			for (j = 0; j < asset.resources.length && !found; j++){
				if (asset.resources[j].type == "image"){
					if(asset.resources[j].rel != undefined){
						if (asset.resources[j].rel[0] == "thumbnail"){
							//found thumbnail
							found = true;
							for (k = 0; k < asset.resources[j].renditions.length; k++){
								if (asset.resources[j].renditions[k].width > foundwidth){
									foundwidth = asset.resources[j].renditions[k].width;
									thumb = asset.resources[j].renditions[k].links[0].href;	
								}
							}
						}							
					}
				}
			}
		}
	}
	return thumb;
}

function getDuration(asset){
	var duration = "";
	if(asset !=undefined){
		if (asset.resources != undefined){
			for (var x = 0; x < asset.resources.length; x++ ){
				if (asset.resources[x].type == "video"){
					if(asset.resources[x].renditions[0].videos[0].duration != undefined){
						duration = asset.resources[x].renditions[0].videos[0].duration;
					}
					else{
						duration = "Live";
					}
				}
			}
		}else if(resource[0].asset !=undefined){
			if (resource[0].asset.resources != undefined){
				for (var x = 0; x < resource[0].asset.resources.length; x++ ){
					if (resource[0].asset.resources[x].type == "video"){
						if(resource[0].asset.resources[x].renditions[0].videos[0].duration != undefined){
							duration = resource[0].asset.resources[x].renditions[0].videos[0].duration;

						}
						else{
							duration = "Live";
						}
					}
				}
			}
		}
	}
	if (duration !="" && duration != "Live"){
		var hour = Math.floor(parseFloat(duration) / 3600);
		duration = duration - (hour*3600);
		var minute =  Math.floor(parseFloat(duration) / 60);
		duration = duration - (minute*60);
		var second = Math.floor(parseFloat(duration)/1);
		if(hour < 10){
			if(hour == 0){
				hour = "00";
			} else {
				hour = "0"+hour;
			}			
		}
		if(minute < 10){
			if(minute == 0){
				minute = "00";
			} else {
				minute = "0"+minute;
			}
		}
		if(second < 10){
			if(second == 0){
				second = "00";
			} else {
				second = "0"+second;
			}			
		}
		duration = hour + ":" + minute + ":" + second;
	}
	return duration;
}

exports.mediaQuery = function (settings){
	var params = {};
	var response = [];
	var accountID;
	var fields = "";
	var query = "";
	var offset = "";
	var limit = "";
	if (settings.accountID != undefined){
		accountID = settings.accountID;
	}
	if (settings.fields != undefined){
		fields = settings.fields;
	}
	if (settings.query != undefined){
		query = settings.query;
	}
	if (settings.offset !=undefined){
		offset = settings.offset;
	}
	if (settings.limit != undefined){
		limit = settings.limit;
	}
	
	var  url = qbrickBaseURL + "api/v1/public/accounts/"+accountID+"/medias/?"+query + fields;
	url = encodeURI(url);
	var result = [];
	params.url = url;
	params.method = "GET";
	try{
		result = httpClientLib.request(params);
	if(result.status == 200){
	var JSONresult = JSON.parse(result.body);
	for (var i = 0; i < JSONresult.length; i++){
		response[i] = {};
		if(JSONresult[i].id != undefined){
			response[i].id = JSONresult[i].id;
		}
		if(JSONresult[i].metadata.title != undefined){
			response[i].title = JSONresult[i].metadata.title;
		}
		if(JSONresult[i].metadata.description != undefined){
			response[i].description = JSONresult[i].metadata.description;
		}
		response[i].hits = "";
		if(JSONresult[i].hits != undefined){
			response[i].hits = JSONresult[i].hits;
		}
		if(JSONresult[i].created != undefined){
			response[i].created = JSONresult[i].created;
		}
		if(JSONresult[i].asset != undefined){		
			response[i].duration = getDuration(JSONresult[i].asset);	
			response[i].thumbnail = getThumbnail(JSONresult[i].asset);
		}
		
	
	}
	}
	}
	catch(err){
		UTIL.log(result.status);
		UTIL.log("DEBUG: Error in qbricklib mediaQuery(HTTP GET), might be a bad search or malformatted APicall");
		UTIL.log("HTTP GET URL: " + url);
		UTIL.log("Error: "+err);
		UTIL.log("Settings variable: "+settings);
		UTIL.log("Returning empty array []");
		return [];
	}
	return response;
	
};

exports.getMedia = function (settings){
	var params = {};
	var response = {};
	var fields = "";
	if (settings.fields != undefined){
		fields = settings.fields;
	}
	var  url = qbrickBaseURL + "api/v1/public/accounts/"+settings.accountID+"/medias/"+settings.mediaID + fields;
	url = encodeURI(url);
	var result;
	params.url = url;
	params.method = "GET";
	try{
		result = httpClientLib.request(params);
	if(result.status == 200){
	var JSONresult = JSON.parse(result.body);
	if(JSONresult.id != undefined){
		response.id = JSONresult.id;
	}
	if(JSONresult.metadata.title != undefined){
		response.title = JSONresult.metadata.title;
	}
	if(JSONresult.metadata.description != undefined){
		response.description = JSONresult.metadata.description;
	}
	response.hits = "";
	if(JSONresult.hits != undefined){
		response.hits = JSONresult.hits;
	}
	if(JSONresult.created != undefined){
		response.created = JSONresult.created;
	}
	if(JSONresult.asset != undefined){		
		response.duration = getDuration(JSONresult.asset);	
		response.thumbnail = getThumbnail(JSONresult.asset);
	}		
	}else{
		response.error = true;
	}
	}
	catch(err){		
		
		UTIL.log("DEBUG: Error in qbricklib getMedia(HTTP GET), media might be corrupt, or deleted");
		UTIL.log("HTTP statuscode: "+result.status);
		UTIL.log("HTTP GET URL: " + url);
		UTIL.log("Error: "+err);
		UTIL.log("Settings variable: "+settings);
		UTIL.log("Returning empty object {}");
	return {};
	}
	return response;
};

exports.catalogQuery = function (settings){
	var  params = {};
	response = [];
	var query = "";
	if (settings.query != undefined){
		query = settings.query;
	}
	var  url = qbrickBaseURL + "api/v1/public/accounts/"+settings.accountID+"/catalogs/?" + query;
	url = encodeURI(url);
	var result;
	params.url = url;
	params.method = "GET";
	try{
		result = httpClientLib.request(params);
	}
	catch(err){
		//logg the error, return empty result
		// do we need to return the whole result? (for 40x statuses?)
	}
	var JSONresult = JSON.parse(result.body);
	if(result.status == 200){
		for (var i = 0; i < JSONresult.length; i++){
			response[i] = {};
			if(JSONresult[i].id != undefined){
				response[i].id = JSONresult[i].id;
			}
			if(JSONresult[i].metadata.title != undefined){
				response[i].title = JSONresult[i].metadata.title;
			}
			if(JSONresult[i].metadata.description != undefined){
				response[i].description = JSONresult[i].metadata.description;
			}	
		}
	}
	return response;
};

exports.getCatalog = function (settings){
	var  params = {};
	var  url = qbrickBaseURL + "api/v1/public/accounts/"+settings.accountID+"/catalogs/" + settings.catalogID;
	url = encodeURI(url);
	var result;
	var response = {};
	params.url = url;
	params.method = "GET";
	try{
		result = httpClientLib.request(params);
	}
	catch(err){
		//logg the error, return empty result
		// do we need to return the whole result? (for 40x statuses?)
	}
	if (result.status == 200){
		var JSONresult = JSON.parse(result.body);
		if(JSONresult.id != undefined){
			response.id = JSONresult.id;
		}
		if(JSONresult.metadata.title != undefined){
			response.title = JSONresult.metadata.title;
		}
		if(JSONresult.metadata.description != undefined){
			response.description = JSONresult.metadata.description;
		}	
	}else{
		response.error = true;
	}
	return response;
};

exports.getPlayer = function (settings){
	var accountID;
	var mediaID;
	var embedplayer = "";
	var playerID = "default";
	var volume = 1;
	var autoplay = false;
	var repeat = false;
	var custom = "";
	var uidprefix = Math.floor((Math.random() * 1000000) + 1);
	
	if(settings.accountID != undefined){
		accountID = settings.accountID;
	}
	if(settings.mediaID != undefined){
		mediaID = settings.mediaID;
	}
	if(settings.playerID != undefined){
		playerID = settings.playerID;
	}
	if(settings.volume != undefined){
		volume = settings.volume;
	}
	if(settings.autoplay != undefined){
		autoplay = settings.autoplay;
	}
	if(settings.repeat != undefined){
		repeat = settings.repeat;
	}
	if(settings.custom != undefined){
		custom = settings.custom;
	}
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
	
	return embedplayer;
	
};