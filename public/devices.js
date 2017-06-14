function getValue(){
               var deviceName = prompt("Enter Device Name : ", "New Device");
               if (deviceName!=null){
                addDevice(deviceName);
                var location = prompt("Enter Device Location : ", "Location");
                addDeviceLocation(location,deviceName);
              }

            }

function addDeviceLocation(locationx,deviceName)
{   
  var devices=[];
  devices.push(deviceName);

  var patch = {};
  patch.tags={};
  patch.tags['location']=locationx;

    $.ajax({
  method: 'POST',
  url: '/api/deviceManagement/v1.0/updateDesiredTwinProperty',
  data :{
   deviceid : JSON.stringify({ id: devices }),
   twinPatchData : JSON.stringify(patch)
   
  }
 }).done(function(data) {

  if  (data.status === "OK") {
   console.log(data.results);
   window.open('devices.html', '_parent');
   
  } else {
   alert(data.results);
   
  }
  
 }).fail(function(data) {
  console.log (data);
 });

}
function addDevice(retVal)
{   var deviceName =retVal;
	$.ajax({
  method: 'POST',
  url: '/api/deviceManagement/v1.0/createDevice/'+deviceName,
 }).done(function(data) {

  if (data.status === "OK") {
   console.log(data.results);
   refresh();
   
  } else {
   console.log(data.results);
   
  }
  
 }).fail(function(data) {
      console.log (data);
    });
}
function jobSchedule()
{ 
  alert("Check Devices");
  openNav();
  $('.row .col-sm-11 #mySidenav').html('<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>');
  var html1 ="<p>&ensp;&nbsp;Jobs</p><div class='box'><a><span id='twin1' style='font-size:25px'>Edit Device Twin</span></a><br/><a><span id='job' style='font-size:25px'>Invoke Method</span></a></div>";
  $('.row .col-sm-11 #mySidenav').append(html1);
  
}

function getCheckboxes()
{
  var deviceId,devicesForScheduling=[];
var boxes = $('.container #table :checkbox');

if($('.container #table :checkbox:checked').length > 0)
  {
    window.localStorage.removeItem('devicesForScheduling');
for(var i in boxes) {
  
  if(boxes[i].checked) {
    devicesForScheduling.push(boxes[i].value);
  }

}
 window.localStorage.setItem('devicesForScheduling',JSON.stringify(devicesForScheduling));
alert("Selected Devices :" +devicesForScheduling);
}
else
{  
  for(var i in boxes) {
    if(boxes[i].checked==false) {
    
    devicesForScheduling.push(boxes[i].value);
  }

}
 window.localStorage.setItem('devicesForScheduling',JSON.stringify(devicesForScheduling));
//alert(devicesForScheduling);


}
}
$(document).on("click", "#job", function(){
   getCheckboxes();
  window.open('scheduleMethod.html', '_parent');

});

$(document).on("click", "#twin1", function(){
  getCheckboxes();
  window.open('scheduleTwin.html', '_parent');

});

 /*$("a").click(function(e) {
        e.preventDefault();
    $("a").toggleClass('show');
  });*/
  $(document).on("click", "#editDesired", function(){
  window.open('editDesired.html', '_parent');

});
  $(document).on("click", "#editTags", function(){
  window.open('editTags.html', '_parent');

});
  $(document).on("click", "#methods", function(){
  window.open('methods.html', '_parent');

});
  

  $(document).on("click", "#addRule", function(){

    var devicesForAddRule=[];
    var boxes = $('.container #table :checkbox');

    for(var i in boxes) {
      if(boxes[i].checked==false || boxes[i].checked==true) {
    
       devicesForAddRule.push(boxes[i].value);
     }

    }
 window.localStorage.setItem('devicesForAddRule',JSON.stringify(devicesForAddRule));
 window.open("addRule.html", "_parent");

});


  $(document).on("click", "#removeDevice", function(){

   var deviceId = window.localStorage.getItem('deviceIdForMethod');
   $.ajax({
  method: 'DELETE',
  url: '/api/deviceManagement/v1.0/deleteDevice/'+deviceId,
 }).done(function(data) {

  if (data.status === "OK") {
   console.log(data.results);
   
  } else {
   console.log(data.results);
   
  }
  
 }).fail(function(data) {
      console.log (data);
    });

});
   $(document).on("click", "#disableDevice", function(){

var status=window.localStorage.getItem('deviceStatus');
var newStatus;
if(status.trim() == "enabled")
{
  newStatus='disabled';

}
else
{
  newStatus='enabled';

}
alert(newStatus);
var deviceId = window.localStorage.getItem('deviceIdForMethod');

$.ajax({
  method: 'POST',
  url: '/api/deviceManagement/v1.0/updateDevice/'+deviceId,
  data : {
    deviceStatus: newStatus
  }
 }).done(function(data) {

  if (data.status === "OK") {
   console.log(data.results);
   refresh();
   
  } else {
   console.log(data.results);
   
  }
  
 }).fail(function(data) {
      console.log (data);
    });

});
var GetWholeTwinConfig = function () 
{ 
  openNav();

  $('.row .col-sm-11 #mySidenav').html('<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a><a href="#" ><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>Device Properties</a><div id="properties" class="box"></div><a><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>Device Twin</a><div id="twin" ><a id="downloadAnchorElem" style="font-size:15px;margin-left:80%">Download</a><a href="#" style="font-size:15px;padding-left:15px"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true" style="font-size:15px"></span>Tags </a><span id="editTags" style="font-size:25px"><a style="font-size:15px;margin-left:90%;display:inline" >Edit</a></span><div id="tags" class="box"></div><a href="#"  style="font-size:15px;padding-left:15px"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true" style="font-size:15px"></span>Desired Properties </a><span id="editDesired" style="font-size:25px"><a style="font-size:15px;margin-left:90%;display:inline" >Edit</a></span><div id="desired" class="box"></div><a href="#"  style="font-size:15px;padding-left:15px"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true" style="font-size:15px"></span>Reported Properties</a><div id="reported" class="box"></div></div><a href="#"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>Device Details </a><div id="details"><span id="disableDevice" style="font-size:25px"><a> Disable Device</a></span><span id="addRule" style="font-size:25px"><a>Add Rule</a></span><a href="">Add/Delete Sensors</a><span id="methods" style="font-size:25px"><a >Execute Remote Command<br/></span></a><span id="removeDevice" style="font-size:25px"><a href="">Remove Device</a></span></div>');

  var status=window.localStorage.getItem('deviceStatus');
  if(status.trim()=='disabled')
    $('.row .col-sm-11 #mySidenav #disableDevice').html('<a> Enable Device</a>');

 var deviceId = window.localStorage.getItem('deviceIdForMethod');
    $.ajax({
  method: 'GET',
  url: '/api/deviceManagement/v1.0/wholeDeviceTwinConfig/'+deviceId,
 }).done(function(data) {

  if (data.status === "OK") {
    var dataStore = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.results));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStore);
    dlAnchorElem.setAttribute("download", "twinConfig.json");
    //dlAnchorElem.click();

    console.log("Twin config "+data.results);
    $('.row .col-sm-11 #mySidenav #twin #tags').empty();
    $('.row .col-sm-11 #mySidenav #twin #desired').empty();
    $('.row .col-sm-11 #mySidenav #twin #reported').empty();

    for(var i = 0; i < data.results.length; i++){
      
      for(var j=0;j<(Object.keys(data.results[i].tags)).length;j++)
      {
       
            $('.row .col-sm-11 #mySidenav #twin #tags').append("<p>"+(Object.keys(data.results[i].tags))[j]+" : "+(Object.values(data.results[i].tags))[j]+"</p>");
      } 

      for(var k=0;k<(Object.keys(data.results[i].properties.desired)).length;k++)
      {
       
            $('.row .col-sm-11 #mySidenav #twin #desired').append("<p>"+(Object.keys(data.results[i].properties.desired))[k]+" : <br/>"+JSON.stringify((Object.values(data.results[i].properties.desired))[k])+"</p>");
      }
      for(var l=0;l<(Object.keys(data.results[i].properties.reported)).length;l++)
      { 
          if((Object.keys(data.results[i].properties.reported))[l]=='$metadata')
          {}
        else{
            $('.row .col-sm-11 #mySidenav #twin #reported').append("<p>"+(Object.keys(data.results[i].properties.reported))[l]+" : <br/>"+JSON.stringify((Object.values(data.results[i].properties.reported))[l])+"</p>");
          }
      }
  
      console.log((Object.keys(data.results[0].properties.desired)).length);
 }
   
  } else {
   alert(data.results);
   
  }
  
 }).fail(function(data) {
  console.log (data);
  
 });
 $('.row .col-sm-11 #mySidenav #properties').append('<p>DEVICE ID</p><input type="text" name="deviceId" value="" id ="p1" ><input id="copy_btn1" type="button" value="copy"><br><p>HOSTNAME</p><input type="text" name="hostname" value="" id ="p2" ><input id="copy_btn2" type="button" value="copy"><br><p>KEY</p><input type="text" name="hostname" value="" id ="p3" ><input id="copy_btn3" type="button" value="copy">');
 //$('.row .col-sm-11 #mySidenav #properties $p1').val('deviceId');
 $.ajax({
  method: 'GET',
  url: '/api/deviceManagement/v1.0/hostNameDevicePrimaryKey/'+deviceId,
 }).done(function(data) {

  if (data.status === "OK") {
   console.log(data.results);
   $('.row .col-sm-11 #mySidenav #properties #p1').val(deviceId);
	$('.row .col-sm-11 #mySidenav #properties #p2').val(data.results.hostName);
	$('.row .col-sm-11 #mySidenav #properties #p3').val(data.results.devicePrimaryKey);
   
  } else { 
   console(data.results);
   
  }
  
 }).fail(function(data) {
  console.log (data);
  
 });


}

//var copyBtn = $('.row .col-sm-11 #mySidenav #properties #copy_btn1');
 $(document).on("click", "#copy_btn1", function(){
  $('.row .col-sm-11 #mySidenav #properties #p1').val().select();
  //id.select();
  document.execCommand('copy','false',null); // or 'cut'
});


/*copyBtn.addEventListener('click', function () {
  var id = document.querySelector('#p1');
  id.select();
  document.execCommand('copy'); // or 'cut'
}, false);
*/

function openNav() {
    document.getElementById("mySidenav").style.width = "30%";
    document.getElementById("table").style.marginRight = "30%";
    $('.row .col-sm-11 .container #table').css({'margin-right':'50%'})
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}


function refresh()
{ closeNav();
  var tb = document.getElementById('table');
    while(tb.rows.length > 1) {
      tb.deleteRow(1);
    }
  //alert("cleared");
  fillTable();
}


function fillTable(){
 
      $.ajax({
      method: 'GET',
      url: '/api/deviceManagement/v1.0/deviceId'
    
      }).done(function(data) {

    if (data.status === "OK") { 
      var tb = document.getElementById('table');
    while(tb.rows.length > 1) {
      tb.deleteRow(1);
    }
      
      for(var i = 0; i < data.results.length; i++){
            //var x=JSON.parse(data.results[i]);
            
            var row='<tr>',col;
                col = '<td ><label><input type="checkbox" value='+data.results[i].gatewayId+'></label></td>'+'<td >'+data.results[i].status+'\n('+data.results[i].connectionState+')'+'</td>'+'<td >'+data.results[i].gatewayId+'</td>'+'<td >'+data.results[i].manufacturer+'</td>'+'<td >'+data.results[i].hardwareVersion+'</td>'+'<td >'+data.results[i].softwareVersion+'</td>'+'<td >'+data.results[i].lastBootup+'</td>'+'<td >'+data.results[i].location+'</td>';
              row += col+'</tr>';
          $('.row .col-sm-11 .container #table').append(row);
          console.log(data.results[i]);
          
    
    /*else{
    	var row='<tr>',col;
                col = '<td ><label><input type="checkbox" name='+data.results[i].gatewayId+' ></label></td>'+'<td >'+data.results[i].status+'</td>'+'<td >'+data.results[i].gatewayId+'</td>'+'<td >'+data.results[i].manufacturer+'</td>'+'<td >'+data.results[i].hardwareVersion+'</td>'+'<td >'+data.results[i].softwareVersion+'</td>'+'<td >'+data.results[i].reboot.lastReboot+'</td>';
              row += col+'</tr>';
          $('.row .col-sm-11 .container #table').append(row);
          console.log(data.results[i]);

      }*/
  }addRowHandlers();
      $('.row .col-sm-11 .container #table').DataTable({columnDefs: [ { orderable: false, targets: [0] }],order: [[ 2, 'asc' ]]}
);
    }
    else{ 
        console.log(data.message);
      }
  }).fail(function(data) {
      console.log (data);
    });
}

function addRowHandlers() {
    var rows = document.getElementById("table").rows;
      for (i = 1; i < rows.length; i++) {
            rows[i].onclick = function(){ 
              return function(){
               var id = this.cells[2].innerHTML;
               var status = this.cells[1].innerHTML.split('(')[0];
               window.localStorage.setItem('deviceIdForMethod',id);
               window.localStorage.setItem('deviceStatus',status);
               //alert(id+" "+status);
               GetWholeTwinConfig();
        };
    }
        (rows[i]);
    }
}
function methods()
{
  var deviceId = window.localStorage.getItem('deviceIdForMethod');
  var taskName=window.localStorage.getItem('taskName');
  
  console.log("Id  "+deviceId);
  var x='100';
   
   
  $('.row .col-sm-11 #mySidenav #details #methods').empty();
    if(x=='100')
    {
      $('.row .col-sm-11 #mySidenav #details #methods').append("<progress value="+x+" max='100'></progress><span id='btn' >&ensp;&#10003;</span>");
  
  }
  else{
      x++;
    $('.row .col-sm-11 #mySidenav #details #methods').append("<progress value="+x+" max='100'></progress>");
  }
}


$(document).on("click", "#btn", function(){
  $('.row .col-sm-11 #mySidenav #details #methods').empty();

});

window.onload = refresh();
/**
<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
  <a href="#"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>Device Details </a>
    <div id="details">
      <a> Disable Device</a>
      <a href="#" onclick="window.open('addRule.html', '_parent')">Add Rule</a>
      <a href="">Commands</a>
      <a href="#" onclick="window.open('methods.html', '_parent')">Methods<br/><span id="methods"/></a>
      <a href="">Remove Device</a>
    </div>
   
  
  <a>Device Twin</a>
  <div id="twin" >
  <a id="downloadAnchorElem" style="font-size:15px;margin-left:85%">Download</a>
   <a href="#" style="font-size:15px;padding-left:15px"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true" style="font-size:15px"></span>Tags </a><a style="font-size:15px;margin-left:90%;display:inline" onclick="window.open('editTags.html', '_parent');">Edit</a>
   <div id="tags" class="box">
     
   </div>
   <a href="#"  style="font-size:15px;padding-left:15px"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true" style="font-size:15px"></span>Desired Properties </a><a style="font-size:15px;margin-left:90%;display:inline" onclick="window.open('editDesired.html', '_parent');">Edit</a>
   <div id="desired" class="box"> 
     
   </div>
   <a href="#"  style="font-size:15px;padding-left:15px"><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true" style="font-size:15px"></span>Reported Properties</a>
   <div id="reported" class="box">
     
   </div>
    </div>

  <a href="#" ><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>Device Properties</a>
  <div id="properties" class="box">
  
    </div>
  <a href="#" ><span id="glyph" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>Recent Job</a>
  <div class="box">
    
    </div>**/