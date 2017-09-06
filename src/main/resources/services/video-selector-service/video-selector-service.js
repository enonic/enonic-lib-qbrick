var portalLib = require('/lib/xp/portal');
var qbricklib = require('/lib/qbrick'); //import qbrickLib

exports.get = handleGet;

function handleGet(req) {
	var response = getVideos(req.params.query);
	var returnBody = createBody(response);

    return {
        contentType: 'application/json',
        body: returnBody
    }
}
function getVideos(query){
	if (query != "" && query != "undefined" && query != undefined){
			query = "&q=*"+query+"*";
	}else{
		query = "";
	}
	var settings = portalLib.getSiteConfig();
	var account = settings.qbrickAccountId;
	
	var callsettings = {};
	callsettings.accountID = account;
	callsettings.query = "sort=created+desc"+query+"&limit=20";
	var response = qbricklib.mediaQuery(callsettings);
	
	return response;
}
function createBody(response){
	var body= {};
	body.hits=[];
	
	for (var i = 0; i<response.length; i++){
		body.hits[i] = {id: response[i].id,displayName: response[i].title, description: response[i].description, iconUrl: response[i].thumbnail};
	}
	body.count = response.length;
	body.total = response.length;
	return body;
	
}