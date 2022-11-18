///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
localStorage.openpages = Date.now();
window.onload = () => {

  var NewSession = setTimeout(Create_Session,500)

  document.getElementById("sendbutton").disabled = true;
  document.getElementById("refreshbutton").disabled = true;
  document.getElementById("imageinput").value = "";
  $("#imagebox").attr("src", "");

  if (/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (/iPhone|iPad|iPod/i.test(navigator.platform)) || 
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) 
  {
    $("#refreshbutton").css("margin-left", "-117px");
    $("#refreshbutton").css("padding", "2px 5px");
  }

  $("#sendbutton").click(() => { 

    imagebox = $("#imagebox");
    link = $("#link");
    input = $("#imageinput")[0];

    if (input.files && input.files[0]) {
      document.getElementById("sendbutton").disabled = true;
      document.getElementById("imageinput").disabled = true;
      let formData = new FormData();
      formData.append("image", input.files[0]);
      var intervalID = setInterval(update_info,1000);
      var Conn_Status = setTimeout(Connection_Status,1500)

      $.ajax({
        url: "/detect/"+sessionStorage.getItem('IMG_ID')+"/"+sessionStorage.getItem('JOB_ID'),
        type: "POST",
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        error: function (data) {
          clearInterval(intervalID);
          console.log("upload error", data);
          console.log(data.getAllResponseHeaders());
          update_info();
        },

        success: function (data) {
          console.log(data);
          if (data == "File Not Found")
          {
            var update = document.getElementById("status");
            alert("****Detection Failed****\nError processing input file.")
            clearInterval(intervalID);
            update.innerHTML = "<b></p>****Detection Failed****<br>Error proccesing input file.</p></b>";
            $("#sendbutton").css("visibility", "hidden");
            $("#refreshbutton").css("visibility", "visible");
            document.getElementById("refreshbutton").disabled = false;
          }
          else if (data == "File Not Supported")
          {
            var update = document.getElementById("status");
            alert("****Detection Failed****\nImage extension not supported.\nOnly images with bmp, jpg, jpeg, png, tif, tiff, and dng extensions/format are supported.")
            clearInterval(intervalID);
            update.innerHTML = "<b><p>****Detection Failed****<br>Image extension not supported.<br>Only images with bmp, jpg, jpeg, png, tif, tiff, and dng extensions/format are supported.</p></b>";
            $("#sendbutton").css("visibility", "hidden");
            $("#refreshbutton").css("visibility", "visible");
            document.getElementById("refreshbutton").disabled = false;
          }

          else if (data == "File Corrupted")
          {
            var update = document.getElementById("status");
            alert("****Detection Failed****\nImage corrupted.")
            clearInterval(intervalID);
            update.innerHTML = "<b><p>****Detection Failed****<br>Image corrupted.</p></b>";
            $("#sendbutton").css("visibility", "hidden");
            $("#refreshbutton").css("visibility", "visible");
            document.getElementById("refreshbutton").disabled = false;
          }

          else if (data == "Detection Failed")
          {
            clearInterval(intervalID);
            var update = document.getElementById("status");
            alert("****Detection Failed****")
            update.innerHTML = "<b><p>****Detection Failed****</p></b>";
            $("#sendbutton").css("visibility", "hidden");
            $("#refreshbutton").css("visibility", "visible");
            document.getElementById("refreshbutton").disabled = false;
          }

          else
          {
            clearInterval(intervalID);
            // bytestring = data["status"];
            // image = bytestring.split("'")[1];
            update_info();
            $("#link").css("visibility", "visible");
            $("#sendbutton").css("visibility", "hidden");
            $("#download").attr("href", "static/Detection_Result/" + data);
            imagebox.attr("src", "static/Detection_Result/" + data);
            $("#refreshbutton").css("visibility", "visible");
            document.getElementById("refreshbutton").disabled = false;
            navigator.sendBeacon('/Save/'+sessionStorage.getItem('IMG_ID'));
          }
        },
      });
    }

    else
    {
      if ((document.getElementById("imageinput").value) == ""){
        alert("Select an image to continue");
      }
      else{
        alert("Refresh the page to start a new session");
      }
    }
  });

  $("#refreshbutton").click(() => { 
    window.location.reload();
  });
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("unload", function (event) {
  navigator.sendBeacon("/Clear_Data/"+sessionStorage.getItem('IMG_ID')+"/"+sessionStorage.getItem('JOB_ID'));
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function readUrl(input) {
  imagebox = $("#imagebox");
  link = $("#link");
  console.log(imagebox);
  console.log("evoked readUrl");
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const fileType = file['type'];
    if (((fileType.split('/')[0])=='image')&&((fileType.split('/')[1])!='gif')){
      if((input.files[0].size/1024/1024) > 10){
        alert("File size should not be more than 10MB");
        imagebox.attr("src", "");
        document.getElementById("imageinput").value = "";
        document.getElementById("sendbutton").disabled = true;
      }
      else{
        let reader = new FileReader();
        reader.onload = function (e) {
          console.log(e.target);
          imagebox.attr("src", e.target.result);
          document.getElementById("sendbutton").disabled = false;
        };
        $("#link").css("visibility", "hidden");
        reader.readAsDataURL(input.files[0]);
      }
    }
    else{
      alert("Please select an image file");
      imagebox.attr("src", "");
      document.getElementById("imageinput").value = "";
      document.getElementById("sendbutton").disabled = true;
    }
  }
  else{
    imagebox.attr("src", "");
    document.getElementById("sendbutton").disabled = true;
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function update_info()
{
  var xhr = new XMLHttpRequest();
  var update = document.getElementById("status");
  xhr.onload = function()
  {
    if (xhr.status == 200)
    {
      xhr.responseText
      update.innerHTML = xhr.responseText;
    }
              
    else if (xhr.status > 400)
    {
      console.log("Server returns error");
    }                      
  };
  xhr.open('POST',"/progress_update/"+sessionStorage.getItem('IMG_ID')+"/"+sessionStorage.getItem('JOB_ID'));
  xhr.send();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Create_Session()
{
  var xhr = new XMLHttpRequest();
  xhr.onload = function()
  {
    if (xhr.status == 200)
    {
      xhr.responseText
      ID = xhr.responseText.split("and");
      sessionStorage.setItem('IMG_ID', ID[0]);
      sessionStorage.setItem('JOB_ID', ID[1]);
    }
    else if (xhr.status > 400)
    {
      console.log("Server returns error");
    }                      
  };
  xhr.open('POST','/Create_Session');
  xhr.send();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Connection_Status()
{
  var xhr = new XMLHttpRequest();
  xhr.onload = function()
  {
    if (xhr.status > 400)
    {
      console.log("Server returns error");
    }                      
  };
  xhr.open('POST',"/Connection_Status/"+sessionStorage.getItem('IMG_ID')+"/"+sessionStorage.getItem('JOB_ID'));
  xhr.send();
}
