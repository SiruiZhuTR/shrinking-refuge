// generated on 2016-10-20 using generator-graphics 0.0.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();
const querystring = require('querystring')
const https = require('https');
const fs = require('fs');
const  gettextParser = require("gettext-parser");
const exec = require('child_process').exec;
const prompt = require('prompt');

var graphicCreated = false;
var firstRun = false;

gulp.task("publish",function(){

	readSettings ()

})

function inArray(array, value, key) {
    return indexOf(array, value, key) > -1;
}

function indexOf(array, value, key) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (key) {
            var item = array[i];
            if (item && item[key] == value)
                return i;
        }
        else if (value == array[i])
            return i;
    }
    return -1;
}

var context


function readSettings (){
	fs.readFile("config/server-settings.json", 'utf8', function(err,loadedData){
		if (err){
			console.log(err);
			return
		}
		context = JSON.parse(loadedData);
		gulp.start("update-metadata")
	
	}) 
	
}

gulp.task('update-metadata', () =>{
    var input = fs.readFileSync('app/locale/en/LC_MESSAGES/metadata.po');
	var po = gettextParser.po.parse(input);

	var poHeadline = po.translations['']["headline"].msgstr[0]
	var poDek = po.translations['']["description"].msgstr[0] 
	console.log(poHeadline, poDek)


    return gulp.src('./config/server-settings.json')
        .pipe(
	        $.prompt.prompt(
	        	[{
		            type: 'input',
		            name: 'title',
		            message: 'title: ',
		            default:poHeadline
				}, 
	        	{
		            type: 'input',
		            name: 'description',
		            message: 'description: ',
		            default:poDek
				}, 
	        	{
		            type: 'input',
		            name: 'byline',
		            message: 'byline: ',
		            default:context.metadata.graphic.byline
				}, 
	        	{
		            type: 'input',
		            name: 'slugline',
		            message: 'slugline: ',
		            default:context.metadata.graphic.slugline
				}, 
	        	{
		            type: 'input',
		            name: 'location',
		            message: 'location: ',
		            default:context.metadata.graphic.location.text
				}
				], 

				function(res){
		            context.metadata.graphic.title = res.title.replace(/'/g , "&#39;").replace(/"/g , "&#34;")
		            context.metadata.graphic.description = res.description.replace(/'/g , "&#39;").replace(/"/g , "&#34;")
		            context.metadata.graphic.byline = res.byline
		            context.metadata.graphic.slugline = res.slugline.toUpperCase()
					var location = res.location;
					if (res.location.indexOf(" ") > -1){
						location = encodeURIComponent(res.location)
					}
		            context.metadata.graphic.location = {"text":location}
					
					fs.writeFileSync("config/server-settings.json",JSON.stringify(context));

					if (context.graphic){
						graphicCreated = true;
						gulp.start("upload-final")
					}else{
						gulp.start("upload-prepub")
					}

					
				}
			)
        );
});

gulp.task("upload-prepub",["clean"],function(){
	//this starts the chain
	return gulp.start("prepub-zip-upload")


})

gulp.task("prepub-zip-upload", ['make-prepub','make-prepub-zip'], function(){
		requestToken ();
})

gulp.task("make-prepub-zip", ["make-prepub"], function(){

	    return gulp.src(['uploads/media-en/**/*','uploads/media-en/**/.*'],{base:"uploads/"})
	        .pipe($.archiver('media-en.zip'))
	        .pipe(gulp.dest('uploads'))	
/*
		  return gulp.src('uploads/media-en')
		    .pipe($.exec('cd uploads; zip -r media-en.zip media-en'))
*/
})

gulp.task('make-prepub', ['clean','build-dev','build-app-dev'], $.folders('app/locale', function(folder){
    var input = require('fs').readFileSync('app/locale/en/LC_MESSAGES/metadata.po');
    var po = require("gettext-parser").po.parse(input);
    var url = po.translations['']["page_url"].msgstr[0];

	gulp.src("media-assets/**/*.{txt,html,js}")
        .pipe($.build({
            'page_url': url
        }))
        .pipe(gulp.dest("uploads/media-"+folder+"/media-interactive"));

    gulp.src("dist/"+folder+"/**")
        .pipe(gulp.dest("uploads/media-"+folder+"/interactive"));

    return gulp.src("dist/"+folder+"/**")
        .pipe(gulp.dest("uploads/media-"+folder+"/media-interactive/development"));

        
}));


gulp.task("upload-final",[ "clean"],function(){
	return gulp.start("final-zip-upload")
})

gulp.task("final-zip-upload", ["make-media",'make-last-zip'], function(){
	setTimeout(function(){

		if (firstRun){
			reUploadGraphic ()
	
		}else{
			requestToken ();			
		}
	}, 100)

})

gulp.task("gerry", function(){
    return gulp.src(['uploads/media-en/**/*','uploads/media-en/**/.*'],{base:"uploads/"})
        .pipe($.archiver('media-en.zip'))
        .pipe(gulp.dest('uploads'))	
	
	
})

gulp.task("make-last-zip",["make-media"], function(){
		    return gulp.src(['uploads/media-en/**/*','uploads/media-en/**/.*'],{base:"uploads/"})
		        .pipe($.archiver('media-en.zip'))
		        .pipe(gulp.dest('uploads'))	
			
})



function requestToken (){
	var credentials = JSON.parse(fs.readFileSync(require('os').homedir()+'/.servercredentials/cred.json'));
	console.log(credentials.username)
	console.log(credentials.password)
	var postFile = JSON.stringify({
	    apiId: credentials.username,
	    apiKey: credentials.password,
	    service: "https://editdata.thomsonreuters.com/gfx/_vti_bin/spx/esp/graphics.svc/rngs"
	})
	
	var options = {
		host: 'sts.editdata.thomsonreuters.com',
		path: '/svc/api.svc/GetToken',
		method: 'POST',
		headers:{
			'Content-Type': 'application/json; charset=utf-8',
			'Content-Length': postFile.length
		}
	};   
		
	var post_req = https.request(options, function(res){
		console.log("Connected to safe: " + res.statusCode);
		res.setEncoding('utf-8');
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("getting safe data")
			responseString += data;
		}); 
	
		res.on('end', function() {
		
			//resultObject = JSON.parse(responseString);
			//FIX need check
			sendToken(responseString)
	
		})
		return
	})
	post_req.write(postFile);
	post_req.end();

}

function sendToken (samlToken){
	samlToken = samlToken.replace(/\\/g, '').substring(1)
	samlToken = samlToken.substring(0, samlToken.length-1)
	var postFile = JSON.stringify({
		token:''+samlToken+''
	})
	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/_trust',
		method: 'POST',
		headers:{
			'Content-Type': 'application/json; charset=utf-8',
			'Content-Length': postFile.length
		}
	};   
		
	var post_req = https.request(options, function(res){
		console.log("Connecting to get token: " + res.statusCode);
		res.setEncoding('utf-8');
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("getting token")
			responseString += data;
		}); 
	
		res.on('end', function() {
			var token = responseString.replace(/\\/g, '').substring(1)
			token = token.substring(0, token.length-1)
			context.svc = {token:token}
			//FIX need check

			getConfig ()
		})
		return
	})
	post_req.write(postFile);
	post_req.end();
	
	
	
}	

function getConfig (){
	var headers = {
		'Content-Type': 'application/json',
		'Authorization': context.svc.token,
		"Accept": "application/json",
	
	};

	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/app',
		method: 'GET',
		headers: headers
	};   
	
	var req = https.request(options, function(res) {
		res.setEncoding('utf-8');
		console.log("Connecting to server for config file: " + res.statusCode);
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("getting config")
			responseString += data;
		});  
	
		res.on('end', function() {
			var config = JSON.parse(responseString)

			if (config.hasError){
				console.log(responseString);
				getConfig ();
				return
			}
            context.config = config;
            context.languages = {}
            var lang, i;
            for (i = 0; i < config.languages.length; i++) {
                lang = config.languages[i];
                context.languages[lang.isoCode] = lang;
            }

            context.language = context.languages[context.metadata.graphic.languageAbbr.text];
            context.metadata.graphic.language = context.language.lookupRef;

			getLocation ()
			
	
	
		})
	});
	
	req.end();
	
}



function getLocation () {


	var headers = {
		'Content-Type': 'application/json',
		'Authorization': context.svc.token,
		"Accept": "application/json",
	
	};

	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/codes/location/' + context.metadata.graphic.location.text + '?limit=1',
		method: 'GET',
		headers: headers
	};   
	
	var req = https.request(options, function(res) {
		res.setEncoding('utf-8');
		console.log("Connecting to server to get location: " + res.statusCode);
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("getting location")	
			responseString += data;
		});  
	
		res.on('end', function() {
			console.log(responseString,"location")

			var location = JSON.parse(responseString)

			if (location.hasError){
				getLocation ();
				return
			}

			context.metadata.graphic.location = location[0]
			
			getEvents ()
	
		})
	});
	
	req.end();
}	

function getEvents () {
	var postFile = querystring.stringify({
		DateFilter: "week",
        EventName: context.metadata.graphic.slugline,
        IncludeDeleted: false,
        ExcludeNics: true,
        IncludeMetadata: false,
        LanguageCode: context.language.isoCode,
        Pagination: {
            Ascending: true,
            CurrentPage: 1,
            PageSize: 1,
            SortingKey: "relevance",
            TotalPages: 1
        }
	})
	
	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/events/search',
		method: 'POST',
		cache:false,
		headers:{
			'Content-Type': 'application/raw; charset=utf-8',
			'Content-Length': postFile.length,
			'Authorization': context.svc.token
		}
	};   
		
	var post_req = https.request(options, function(res){
		console.log("Connecting to server to get events " + res.statusCode);
		res.setEncoding('utf-8');
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("getting events")
			responseString += data;
		}); 
	
		res.on('end', function() {
			console.log(responseString,"events")
			var response = JSON.parse(responseString);

			if (response.hasError){
				getEvents ();
				return
			}


            var i, item;
            if (response.Events) {
                for (i = 0; i < response.Events.length; i++) {
                    item = response.Events[i];
                    if (context.metadata.graphic.slugline.indexOf(item.Slugline) == 0) {
                        context.metadata.eventId = item.Id;
                        break;
                    }
                }
            }
            
		    if (!context.metadata.eventId) {
				console.log("It appears your slug does not exist")
				
				prompt.get([{
			            type: 'string',
			            name: 'continue',
			            message: 'It appears your slug does not exist, do you wish to continue? ',
			            default:'y',
			            required:true
					}
					], function(err, res){
						if (res.continue != "y"){
							return
						}
						getTopicCodes ()
					})

		    }else{
			    getTopicCodes()
		    }

	
		})
		return
	})
	post_req.write(postFile);
	post_req.end();
	
	
}

function getTopicCodes (){
	var headers = {
		'Content-Type': 'application/json',
		'Authorization': context.svc.token,
		"Accept": "application/json",
	
	};

	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/events/' + context.metadata.eventId,
		method: 'GET',
		headers: headers
	};   
	
	var req = https.request(options, function(res) {
		res.setEncoding('utf-8');
		console.log("Connecting to server to get topics: " + res.statusCode);
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("getting topics")	
			responseString += data;
		});  
	
		res.on('end', function() {

			var response = JSON.parse(responseString)
			if (response.hasError){
				console.log(responseString);
				getTopicCodes ();
				return
			}


            var code, item;
            if (response.Status == 'Active') {
                for (var i = 0; i < response.MetadataItems.length; i++) {
                    code = response.MetadataItems[i];
                    if (code.Category == 'TopicCode' && !inArray(context.metadata.graphic.topicCodes, code.Code, 'mnemonic'))
                        context.metadata.graphic.topicCodes.push({ codeId: code.PermanentIdentifier, text: code.Code, mnemonic: code.Code });
                }
            }
			
			if (graphicCreated){
				reUploadGraphic ()
			}else{
				createGraphic ();
			}

		})
	});
	
	req.end();	
	
	
}


function createGraphic (){
	var postFile = JSON.stringify(context.metadata)
	
	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/graphic',
		method: 'POST',
		cache:false,
		headers:{
			'Content-Type': 'application/json; charset=utf-8',
			'Content-Length': postFile.length,
			'Authorization': context.svc.token
		}
	};   
		
	var post_req = https.request(options, function(res){
		console.log("Connecting to server to create graphic " + res.statusCode);
		res.setEncoding('utf-8');
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("creating graphic")
			responseString += data;
		}); 
	
		res.on('end', function() {

			var graphic = JSON.parse(responseString);

			if (graphic.hasError){
				console.log(responseString)
				createGraphic ();
				return
			}

			context.graphic = graphic;
			//getUser()
			uploadGraphic ()
			
		})
		return
	})
	post_req.write(postFile);
	post_req.end();	
	
	
}



function uploadGraphic (){
	//back to here
//     var data = fs.readFileSync("uploads/media-en.zip");
	fs.readFile("uploads/media-en.zip", function(err, data) {

		var options = {
			host: 'editdata.thomsonreuters.com',
			path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/'+context.graphic.workspace+'/graphic/'+context.graphic.graphicId+"/package/media-en.zip",
			method: 'POST',
			headers:{
				'Content-Type': 'application/octet-stream; charset=utf-8',
				'Authorization': context.svc.token
			}
		};   
	
	
			
		var post_req = https.request(options, function(res){
			console.log("Connecting to server upload graphic " + res.statusCode);
			res.setEncoding('utf-8');
		
			var responseString = '';
		
			res.on('data', function(data) {
				console.log("uploading graphic")
				responseString += data;
			}); 
		
			res.on('end', function() {

				var graphic = JSON.parse(responseString.replace(/\\/g, ''))

				if (graphic.hasError){
					console.log(responseString)
					uploadGraphic ();
					return
				}

				context.graphic = graphic					


				updateMetadata ()

			})
			return
		})
	
		post_req.write(data);
		post_req.end();				
	
	})			
				

}

function reUploadGraphic (){
	//back to here
//     var data = fs.readFileSync("uploads/media-en.zip");
	fs.readFile("uploads/media-en.zip", function(err, data) {

	//matt: update mode can take three parameter values, 0, update all, 1 add a new folder, and 2, update only folders specified by the edition IDs param
	//editionIds param is a space or comma separated list of ids or empty (without the =)
		var options = {
			host: 'editdata.thomsonreuters.com',
			path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/'+context.graphic.workspace+'/graphic/'+context.graphic.graphicId+"/package/media-en.zip?editionIds&updateMode=0",
			method: 'PUT',
			headers:{
				'Content-Type': 'application/octet-stream; charset=utf-8',
				'Authorization': context.svc.token
			}
		};   
	
	
			
		var post_req = https.request(options, function(res){
			console.log("Connecting to server REupload graphic " + res.statusCode);
			res.setEncoding('utf-8');
		
			var responseString = '';
		
			res.on('data', function(data) {
				console.log("REuploading graphic")
				responseString += data;
			}); 
		
			res.on('end', function() {
				console.log(responseString)
				var graphic = JSON.parse(responseString)


				if (graphic.hasError){
					console.log(responseString)
					reUploadGraphic ();
					return
				}

				context.graphic = graphic					


				if (firstRun){
					writeConfigSettings ()					
				}else{
					updateMetadata ()
				}

				
			})
			return
		})
	
		post_req.write(data);
		post_req.end();				
	
	})			
				

}

function getUser (){

	
}



function updateMetadata (){
	var graphic = context.graphic
	updateGraphic(graphic)

    graphic.title = context.metadata.graphic.title;
    graphic.description = context.metadata.graphic.description;
    graphic.byline = context.metadata.graphic.byline;
    graphic.slugline = context.metadata.graphic.slugline;
    graphic.topicCodes = context.metadata.graphic.topicCodes;
    graphic.location = context.metadata.graphic.location;


	var putData = JSON.stringify({
        graphic: {
            graphicId: graphic.graphicId,
            editions: graphic.editions,
            title: graphic.title,
            description: graphic.description,
            byline: graphic.byline,
            slugline: graphic.slugline,
            topicCodes: graphic.topicCodes,
            location: graphic.location,
            changed:true
        }
    })
	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/'+context.graphic.workspace+'/graphic/'+context.graphic.graphicId,
		method: 'PUT',
		headers:{
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': context.svc.token
		}
	};  
		 
		
	var post_req = https.request(options, function(res){
		console.log("Connecting to server update the metadata " + res.statusCode);
		res.setEncoding('utf-8');
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("updating  metadata")
			responseString += data;
		}); 
	
		res.on('end', function() {
			var graphic = JSON.parse(responseString);

			if (graphic.hasError){
				console.log(responseString)
				updateMetadata ();
				return
			}


			context.graphic = graphic
			
			getURL ()


		})
		return
	})

	post_req.write(putData);
	post_req.end();		




	
}

function getURL (){
	var repository = getPublicRepository();
	var headers = {
		'Content-Type': 'application/json',
		'Authorization': context.svc.token,
		"Accept": "application/json",
	
	};

	var options = {
		host: 'editdata.thomsonreuters.com',
		path: '/gfx/_vti_bin/spx/esp/graphics.svc/rngs/'+context.graphic.workspace+'/graphic/'+context.graphic.graphicId+"/"+repository.editionId+"/"+repository.repositoryId+"/url",
		method: 'GET',
		headers: headers
	};   
	
	var req = https.request(options, function(res) {
		res.setEncoding('utf-8');
		console.log("Connecting to server to  retrieve url " + res.statusCode);
	
		var responseString = '';
	
		res.on('data', function(data) {
			console.log("retrieving url")	
			responseString += data;
		});  
	
		res.on('end', function() {
			
				var urlObj = JSON.parse(responseString.replace(/\\/g, ''))

				if (urlObj.hasError){
					console.log(responseString)
					getURL ();
					return
				}		
					
				console.log("ENDING")
				//FIX need check
				var url = urlObj.url.split("index.html")[0]
			    var input = require('fs').readFileSync('app/locale/en/LC_MESSAGES/metadata.po');
				var po = gettextParser.po.parse(input);

				po.translations['']["headline"].msgstr = [context.metadata.graphic.title]
				po.translations['']["description"].msgstr = [context.metadata.graphic.description]
				po.translations['']["page_url"].msgstr = [url]
				var output = gettextParser.po.compile(po);
				fs.writeFileSync("app/locale/en/LC_MESSAGES/metadata.po",output);
			
				writeConfigSettings();

		})
	});
	
	req.end();	

	
}

function updateGraphic(graphic) {
    var i, ii, ed, med;
    for (i = 0; i < graphic.editions.length; i++) {
        ed = graphic.editions[i];
        for (ii = 0; ii < context.metadata.editions.length; ii++) {
            med = context.metadata.editions[ii];
            if (med.editionName == ed.editionName)
                updateEdition(ed, med)
        }
    }
}
function updateEdition(edition, metadata) {
    var key, i, ii, rep, mrep;
    edition.changed = true;
    for (key in metadata) {
        if(key!='repositories')
            edition[key] = metadata[key];
    }
    for (i = 0; i < edition.repositories.length; i++) {
        rep = edition.repositories[i];
        for (ii = 0; ii < metadata.repositories.length; ii++) {
            mrep = metadata.repositories[ii];
            if (mrep.repositoryType == rep.repositoryType)
                updateRepository(rep, mrep)                    
        }
    }
}

function updateRepository(rep, metadata) {
    var key;
    rep.changed = true;
    for (key in metadata) {
        rep[key] = metadata[key];
    }
}

function getPublicRepository() {
    var edition, repository, i, ii;
    for (i = 0; i < context.graphic.editions.length; i++) {
        edition = context.graphic.editions[i];        
        for (ii = 0; ii < edition.repositories.length; ii++) {
            repository = edition.repositories[ii];
            if (repository.repositoryType == 'Public')
                return repository;
        }
    }
}



function writeConfigSettings (){
	fs.writeFile('config/server-settings.json', JSON.stringify(context, null, 4), function(err){
		console.log("written")

		if (graphicCreated){
			console.log("done")
		}else{
			graphicCreated = true;
			firstRun = true;
			gulp.start("upload-final")
		}
	})

	
}





