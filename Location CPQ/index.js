var modal = document.getElementById("myModal");
var selectedArea = "";
var btn = document.getElementById("verificaCopertura");
var conf = document.getElementById("conferma");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}
span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
conferma.onclick = function() {
  modal.style.display = "none";
	var e = document.getElementById("selectArea");
  var value = e.value;
  selectedArea = e.options[e.selectedIndex].value;
	console.log(selectedArea);
	//redirect
	//https://webserver-lcteolo-prd.lfr.cloud/web/guest/cpq?area=1
	var buyer = document.getElementById("fname").value+" "+
			document.getElementById("fsurn").value;
	window.location.replace("/web/cpq-site/cpq?area="+selectedArea+"&buyer="+buyer);
}