var ChainConfig = {
	bm_host:"127.0.0.1", // you have to enable API in your keys.dat file
	bm_port:8442,
	bm_username:"m2mdata",
	bm_password:"secure",
    bm_to:"BM-2cSnPxXJwS1WVd3uRthiJ1ooFEUdEuPm8t", // BM Address to send to
	bm_from:"BM-2cXzB4V5AFRdK6fkigbQd4PZMDSo1c2PfJ", // BM Address to send from
	parser:function(input) { input.tst="TEST"; return input; }, // Helper to parse inbound format 
	db_log:'data/log.db',	// Logs last reading locally 
	dp_server_port:8080,	// exposes last reading as JSON on this port 
};

var m2m=require("./m2mchain");

//var chainprocess = new m2m.ChainProcess("http://grid.stromhaltig.de/time.php",20000,ChainConfig);
var chainprocess = new m2m.ChainProcess("*DATA",20000,ChainConfig);
var chainserver = new m2m.LocalDPServer(ChainConfig);



//setTimeout(function() {dp.run();},20000);