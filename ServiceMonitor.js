const find = require('find-process');
const Request = require('request');


const Pool = require('pg')


let serviceMonitorPollInterval = 50000;


//Set of Porcess to do healthCheck which includes 
//few standalone & web based applciation 
let serviceList = [{
  "service_name":"mongo",
  "port" : 27017,
  "type" : "tcp",
  "url" :"",
  "restart_required" : true
},
{
  "service_name":"apache2",
  "port" : 80,
  "type" : "tcp",
  "url":"",
  "restart_required" : true
},
{
  "service_name":"google",
  "port" : "",
  "url":"https://www.google.com/",
  "type" : "https", 
  "restart_required" : false
},
{
  "service_name":"facebook",
  "port" : "",
  "url":"https://www.facebook.com/",
  "type" : "https", 
  "restart_required" : false
},
{
  "service_name":"node",
  "port" : 3000,
  "type" : "tcp", 
  "restart_required" : true
}];

//Creating Pool of DB Requests
const pool = new Pool({
  user: 'postgres',
  host: '192.168.43.50',
  database: 'stezy',
  password: 'stezy',
  port: 5432,
})


//Update the Db Status on Success/Failure
function updateServiceStatus (serviceName, serviceStatus, err) {

  pool.query(`UPDATE stezy_services  SET service_status = $1 :: int,
              error_msg      = $2 :: text WHERE service_name = $3 :: text`,
        [serviceStatus, err, serviceName],
      ( err, res ) => {
    if (err) {
    console.log('Error while updating services on Table service status: ', err);
    }
    console.log("Successfully update the status");
});
}


//Will do helathchecks of tcp based Service 
function isPorcessRunning(portNum, serviceName){

find('port', portNum)
.then(function (list) {//On Success of Finding the porcess
  console.log("the List params", list);
  let serviceStatus = 1; 
  let err = '';
  if (!list.length) {
    console.log('port ', portNum ,' is free now');
    //Add Auto-restart Code
  } else {
    console.log('%s is listening port ', portNum,' , list[0].name');
      updateServiceStatus(serviceName, serviceStatus, err);
  }
}).catch(error=>{//On Error while finding the services
  console.log("Error in Finding the process ", error);
  serviceStatus = 0;
  err = error;
  updateServiceStatus(serviceName, serviceStatus, err);
});
}


//Will do the https based health checks 
function isSiteRunning(url, serviceName){
  console.log("Im in isSiteChecking()");
  let serviceStatus = 1;
  let err = '';

  Request.get(url).
  on('response', function(response){ //On Successful Response
    let statusCode =  response.statusCode;
    console.log("Response Status Code ",statusCode);
    if(statusCode == 200){
     console.log( serviceName , " up and running ");
     updateServiceStatus(serviceName, serviceStatus, err); 
    }else{
      serviceStatus = 0;
      err = response.body;
      console.log( serviceName, " Site is Down");
      updateServiceStatus(serviceName, serviceStatus, err); 
      isSiteRunning(url, serviceName);
    }
  })
  .on('error', function(error){ //On Error
    serviceStatus = 0;
    err = error;
    updateServiceStatus(serviceName, serviceStatus, err); 
    isSiteRunning(url, serviceName);
  })
}


//Will start doing Helath Checks of Services
function doHealthCheck(){
  console.log("Inside checkAllServices");

  for(let count =0; count < serviceList.length; count++){
    //Getting Each service Type
    let servName = serviceList[count].service_name;
    let servType = serviceList[count].type;
    let servPort = serviceList[count].port;
    let servUrl = serviceList[count].url;
    let servRestartRequired = serviceList[count].restart_required;
    if(servType == "tcp"){
      isPorcessRunning(servPort, servName);
    }else if( servType == "https"){
      isSiteRunning("https://www.google.com/", "google");
    } 
  }
  setTimeout(doHealthCheck, serviceMonitorPollInterval);
}


/*(function(){
  console.log("Imin self Execution");
  setTimeout(checkAllServices, 1000);
})(); */
checkAllServices();



