var portal = require('/lib/xp/portal'); // Import the portal functions
var qbricklib = require('/lib/qbrick'); //import qbrickLib

// Handle the GET request
exports.macro = function(req) {
	var settings = portal.getSiteConfig();	
	//GET Settings from app and videopage
	var account = settings.qbrickAccountId;
    var component = portal.getComponent();
	var selectedVideo = req.params.videoID || "";
	var autoplay = false;
	var volume = 1;
	var replay = false;
	if(req.params.mute != undefined){
		if(req.params.mute == "true"){
			volume = 0;
		}else{
			volume = 1;
		}		
	}else{
		volume = 1;
	}
	if(req.params.replay != undefined){
		replay = req.params.replay;
	}
	if(req.params.autoplay != undefined){
		autoplay = req.params.autoplay;
	}
	var settingscall = {};
	settingscall.accountID = account;
	settingscall.mediaID = selectedVideo;
	
	if (selectedVideo!= ""){
		var response2 = qbricklib.getMedia(settingscall);
		if(response2.error != undefined){
			
			selectedVideo = "0";
		}
	
	}else {
		selectedVideo = "0";
	}
		
	
	//Generate the embedcode
	var embedplayer = "";
	if(selectedVideo != "0"){
		var playersettings = {};
		playersettings.mediaID = selectedVideo;
		playersettings.accountID = account;
		playersettings.autoplay = autoplay;
		playersettings.repeat = replay;
		playersettings.volume = volume;
		if(req.request.mode != "edit"){
			embedplayer +='<div class="qbrick-video-wrapper-single">'
			embedplayer +='<div class="qbrick-video-single">'
			embedplayer += qbricklib.getPlayer(playersettings);
			embedplayer += '</div>';
			embedplayer += '</div></BR></p>';
		}else{
			var mediaSettings = {};
			mediaSettings.accountID = account;
			mediaSettings.mediaID = selectedVideo;
			var previewObject = qbricklib.getMedia(mediaSettings);
			var previewHtml = "";
			previewHtml +='<div class="qbrick-video-wrapper-single">';
			previewHtml +='<div class="qbrick-video-single" style="background-image: url(\'';
			previewHtml += previewObject.thumbnail;
			previewHtml += '\'); background-size: 100%">';
			previewHtml += '</div></div>';
			embedplayer = previewHtml;
		}
	}else{
		embedplayer += "<p><strong>This video is not available</strong></p>"
	}
	
    return {
        body: embedplayer,
		pageContributions: {
            headEnd: [
                '<link rel="stylesheet" type="text/css" href="' + portal.assetUrl({path: 'css/video.css'}) + '"/>'
            ]
        }
    }
};