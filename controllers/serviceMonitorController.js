let serviceModel = require('./../models/servicesModel');
let express = require('express');
exports.getServiceStatus =  (Request, Reply) =>{

    console.log("Im in API");
    serviceModel.getAllServices().
    then((res, err)=>{
        console.log("respObj =", JSON.stringify(res));
        if(err){
            console.log("Error in GetAllServices API", err);
            Reply.status(400).send(err);
        }else if(res.rowCount == 0){
            console.log("NO Records found in database");
            Reply.status(200).send("No Records found in Database");
        }
        else{
            console.log("The Response form DB", JSON.stringify(res.rows));
            Reply.status(200).send(res.rows);
        }

    }).catch(err =>{

        console.log("Error in Catch block", err);
        Reply.status(400).send(err);            

    });

}