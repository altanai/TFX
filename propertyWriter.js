module.exports = function(fs) {
    
    module.options = {       
    "hostname"      : "host",        
    "enviornment"   : "local",        
    "host"          : "localhost",
    "jsdebug"       :  true,          
    "httpsPort"     :  8084,
    "clientPath"    : "/home/altanai/tfx/tfx_module"
    };

    module.writeEnv = function(data, callback){
        propertyOptions = JSON.stringify(module.options);

        fs.writeFile('./env.json', propertyOptions, (err) => {
          if (err) throw err;
          console.log('It\'s saved!');
        });
        /*        
        fs.writeFile('./env.json', propertyOptions, function (err) {
            if (err) {
              console.log('There has been an error saving your configuration data.' , err.message);
              return;
            }
            console.log('Configuration saved successfully.');
        });*/
    };

    module.readEnv = function(){
        //console.log("readConfig" , this.propertyOptions);
        return fs.readFileSync('env.json');
    };

    return   module;
};
