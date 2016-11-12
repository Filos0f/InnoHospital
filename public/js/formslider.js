$(document).ready(function(){
  $("form").submit(function(e) {
    e.preventDefault();
  });
  
  var clogin = $("#content-login");
  var reg1 = $("#register1");
  var reg2 = $("#register2");
  var reg3 = $("#register3");
  /* display the register page */
  $("#showregister").on("click", function(e){
    e.preventDefault();
    var newheight = reg1.height();
    $(reg1).css("display", "block");
    
    $(clogin).stop().animate({
      "left": "-880px"
    }, 800, function(){ /* callback */ });
    
    $(reg1).stop().animate({
      "left": "0px"
    }, 800, function(){ $(clogin).css("display", "none"); });
    
    $("#page").stop().animate({
      "height": newheight+"px"
    }, 550, function(){ /* callback */ });
  });

  
  
  /* display the login page */
  $("#showlogin").on("click", function(e){
    e.preventDefault();
    var newheight = clogin.height();
    $(clogin).css("display", "block");
    
    $(clogin).stop().animate({
      "left": "0px"
    }, 800, function() { /* callback */ });
    $(reg1).stop().animate({
      "left": "880px"
    }, 800, function() { $(reg1).css("display", "none"); });
    
    $("#page").stop().animate({
      "height": newheight+"px"
    }, 550, function(){ /* callback */ });
  });

$("#showReg2").on("click", function(e){
    e.preventDefault();
    var newheight = reg2.height();
    $(reg2).css("display", "block");
    
    $(reg1).stop().animate({
      "left": "-880px"
    }, 800, function(){ /* callback */ });
    
  $(reg2).stop().animate({
      "left": "0px"
    }, 800, function(){ $(reg1).css("display", "none"); });
    
    $("#page").stop().animate({
      "height": newheight+"px"
    }, 550, function(){ /* callback */ });
  });

$("#showReg3").on("click", function(e){
    e.preventDefault();
    var newheight = reg3.height();
    $(reg3).css("display", "block");
    
    $(reg2).stop().animate({
      "left": "-880px"
    }, 800, function(){ /* callback */ });
    
  $(reg3).stop().animate({
      "left": "0px"
    }, 800, function(){ $(reg2).css("display", "none"); });
    
    $("#page").stop().animate({
      "height": newheight+"px"
    }, 550, function(){ /* callback */ });
  });
  
  $("#loginbtn").on("click",function(){
     var email = $("#email").val();
     var pas = $("#pas").val();
     $.ajax({
      url:"http://localhost:8888/login",
      succsess:onSuccess,
      error:console.log,
      type:"POST",
      data:"email:"+email+"&pas:"+pas
     });
  });

});

function onSuccess(response)
{
  alert(response);
};