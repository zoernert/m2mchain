require("http");

module.exports ={ 
     LocalDPServer: function(config) {	    
		var handleRequest = function(request, response){				
				response.end(JSON.stringify(config.lastreading));					
		}
		
		var server = require("http").createServer(handleRequest);

		//Lets start our server
		server.listen(config.dp_server_port, function(){			
			console.log("Server listening on: http://localhost:%s", config.dp_server_port);
		});
	 },
	 ChainProcess: function(src,interval,config) {
			this.config=config;

			var bmlink = require('bitmessage-node')(config.bm_host, config.bm_port, config.bm_username, config.bm_password);
			var nStore = require('nstore');
			
			var Datapoint = function(src) {				
					this.src=src; 	
					this.config=config;
					this.db_log = nStore.new(config.db_log, function () { 						
					});
					if(config.parser) this.parser= config.parser; else {
						this.parser=function(input) { return input; };
					}
			}
			Datapoint.prototype.send = function(reading) { 
							if(!config.bm_to) return;
								bmlink.messages.send(config.bm_to, config.bm_from, "*DATA", JSON.stringify(reading), function(l) { 							
								reading.hash=l;							
								var d = new Date();
								if(this.db_log) this.db_log.save("last_reading",reading);
							
				});
			}
			Datapoint.prototype.runHTTP = function() {
				var http = new require("http");
				http.dpparser=this.parser;
				http.datapoint=this;
				http.get(this.src, function(res){
						var data = '';
						res.on('data', function(chunk){
							data += chunk;
						});
						
						res.on('end', function(){				
							var d = new Date();				
							var reading = {
									time:d.getTime(),
									src:http.datapoint.src,
									data:http.dpparser(JSON.parse(data))				
							};
							http.datapoint.config.lastreading=reading;
							http.datapoint.send(reading);							
						});
				}).on('error', function(e){
				  console.log("Got an error: ", e);
				});
			};
			Datapoint.prototype.runBM = function() {
				bmlink.messages.inbox.list(function(l) { 				
				for(var i=0;i<l.length;i++ )  {
						if(l[i].subject==src) {
							var lastreading=JSON.parse(l[i].message);
							bmlink.messages.inbox.moveToTrash(l[i].msgid, function() {});
						}
				}
				if(lastreading) {
						config.lastreading=lastreading;
				}
				});
			}

			dp = new Datapoint(src);
			if(src.substr(0,4)=="http") {
				dp.runHTTP();
				setInterval(function() { dp.runHTTP(); },interval);
			} else {
				dp.runBM();
				setInterval(function() { dp.runBM(); }, interval);
			}
			
		}
};