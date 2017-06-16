var options ={
  "type": "pie",
  "startAngle": 0,
  "radius": "60%",
  "innerRadius": "50%",
  "colorField": "color",
  "dataProvider": chartTemp,
  "valueField": "value",
  "titleField": "deviceId",
  "alphaField": "alpha",
  "labelsEnabled": false,
  "pullOutRadius": 0,
  "pieY": "65%",
  "pieX": "50%"
};


var chartTemp  = [{"deviceId": [],"value": 0,"color": "green"},{"deviceId": [],"value": 0,"color": "red"},{"deviceId": [],"value": 0,"color": "yellow"},{"deviceId": [],"value": 0,"color": "grey"}];
var chartHumid = [{"deviceId": [],"value": 0,"color": "green"},{"deviceId": [],"value": 0,"color": "red"},{"deviceId": [],"value": 0,"color": "yellow"},{"deviceId": [],"value": 0,"color": "grey"}];
var chartSo2   = [{"deviceId": [],"value": 0,"color": "green"},{"deviceId": [],"value": 0,"color": "red"},{"deviceId": [],"value": 0,"color": "yellow"},{"deviceId": [],"value": 0,"color": "grey"}];
var chartNo2   = [{"deviceId": [],"value": 0,"color": "green"},{"deviceId": [],"value": 0,"color": "red"},{"deviceId": [],"value": 0,"color": "yellow"},{"deviceId": [],"value": 0,"color": "grey"}];

 $.ajax({
  method: 'GET',
  url: '/api/sensorData/v1.0/kpiData/temperature'
 }).done(function(data) {

  if  (data.status === "OK") {
    console.log("Temperature Results" +data.results);
    for(var i in data.results)
    { 
      if(data.results[i].qualityColour=='green')
      {
        chartTemp[0].deviceId.push(data.results[i].deviceId);
        chartTemp[0].value++;
      }
      
      else if(data.results[i].qualityColour=='red')
      {
        chartTemp[1].deviceId.push(data.results[i].deviceId);
        chartTemp[1].value++;
      }
      
      else if(data.results[i].qualityColour=='yellow')
      {
        chartTemp[2].deviceId.push(data.results[i].deviceId);
        chartTemp[2].value++;
      }
      
      else
      {
        chartTemp[3].deviceId.push(data.results[i].deviceId);
        chartTemp[3].value++;
      }
      
      }
      var sum = 0;
      for ( var x in chartTemp ) {
      sum += chartTemp[x].value;
      }
      chartTemp.push({
        "value": sum,
        "alpha": 0
          });
        options.dataProvider=chartTemp;
      AmCharts.makeChart("containerTemp",options );   
    }
    
    else {
   console.log(data.results);
   
  }
  
 }).fail(function(data) {
  console.log (data);
 });

 $.ajax({
  method: 'GET',
  url: '/api/sensorData/v1.0/kpiData/humidity'
 }).done(function(data) {

  if  (data.status === "OK") {
    console.log("Humidity Results" +data.results);
    for(var i in data.results)
    { 
      if(data.results[i].qualityColour=='green')
      {
        chartHumid[0].deviceId.push(data.results[i].deviceId);
        chartHumid[0].value++;
      }
      
      else if(data.results[i].qualityColour=='red')
      {
        chartHumid[1].deviceId.push(data.results[i].deviceId);
        chartHumid[1].value++;
      }
      
      else if(data.results[i].qualityColour=='yellow')
      {
        chartHumid[2].deviceId.push(data.results[i].deviceId);
        chartHumid[2].value++;
      }
      
      else
      {
        chartHumid[3].deviceId.push(data.results[i].deviceId);
        chartHumid[3].value++;
      }
      
      }
      var sum = 0;
      for ( var x in chartHumid ) {
      sum += chartHumid[x].value;
      }
      chartHumid.push({
        "value": sum,
        "alpha": 0
          });
       options.dataProvider=chartHumid; 
      AmCharts.makeChart("containerHumid",options );   
    }
    
    else {
   console.log(data.results);
   
  }
  
 }).fail(function(data) {
  console.log (data);
 });


  $.ajax({
  method: 'GET',
  url: '/api/sensorData/v1.0/kpiData/so2'
 }).done(function(data) {

  if  (data.status === "OK") {
    console.log("So2 Results" +data.results);
    for(var i in data.results)
    { 
      if(data.results[i].qualityColour=='green')
      {
        chartSo2[0].deviceId.push(data.results[i].deviceId);
        chartSo2[0].value++;
      }
      
      else if(data.results[i].qualityColour=='red')
      {
        chartSo2[1].deviceId.push(data.results[i].deviceId);
        chartSo2[1].value++;
      }
      
      else if(data.results[i].qualityColour=='yellow')
      {
        chartSo2[2].deviceId.push(data.results[i].deviceId);
        chartSo2[2].value++;
      }
      
      else
      {
        chartSo2[3].deviceId.push(data.results[i].deviceId);
        chartSo2[3].value++;
      }
      
      }
      var sum = 0;
      for ( var x in chartSo2 ) {
      sum += chartSo2[x].value;
      }
      chartSo2.push({
        "value": sum,
        "alpha": 0
          });
       options.dataProvider=chartSo2; 
      AmCharts.makeChart("containerSo2",options );   
    }
    
    else {
   console.log(data.results);
   
  }
  
 }).fail(function(data) {
  console.log (data);
 });

  $.ajax({
  method: 'GET',
  url: '/api/sensorData/v1.0/kpiData/no2'
 }).done(function(data) {

  if  (data.status === "OK") {
    console.log("No2 Results" +data.results);
    for(var i in data.results)
    { 
      if(data.results[i].qualityColour=='green')
      {
        chartNo2[0].deviceId.push(data.results[i].deviceId);
        chartNo2[0].value++;
      }
      
      else if(data.results[i].qualityColour=='red')
      {
        chartNo2[1].deviceId.push(data.results[i].deviceId);
        chartNo2[1].value++;
      }
      
      else if(data.results[i].qualityColour=='yellow')
      {
        chartNo2[2].deviceId.push(data.results[i].deviceId);
        chartNo2[2].value++;
      }
      
      else
      {
        chartNo2[3].deviceId.push(data.results[i].deviceId);
        chartNo2[3].value++;
      }
      
      }
      var sum = 0;
      for ( var x in chartNo2 ) {
      sum += chartNo2[x].value;
      }
      chartNo2.push({
        "value": sum,
        "alpha": 0
          });
       options.dataProvider=chartNo2; 
      AmCharts.makeChart("containerNo2",options );   
    }
    
    else {
   console.log(data.results);
   
  }
  
 }).fail(function(data) {
  console.log (data);
 });