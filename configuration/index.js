var url_string = window.location.href; 
var url = new URL(url_string);
var prodID = url.searchParams.get("prod");
var buyer = url.searchParams.get("buyer");
//prodID = 41301; // TO DELETE  

async function fetchProd(prodID) {
	var url = "/o/headless-commerce-admin-catalog/v1.0/products/"+prodID;
	const response = await Liferay.Util.fetch(url, {
    method: 'GET'
  });
  const done = await response.json();
  return done; 
}

async function fetchProductsOptions(prodID) {
	var url = "/o/headless-commerce-admin-catalog/v1.0/products/"+prodID+"/productOptions";
	const response = await Liferay.Util.fetch(url, {
    method: 'GET' 
  });
  const done = await response.json();
  return done; 
}

async function fetchProductOptionValues(prodOptID) {
	var url = "/o/headless-commerce-admin-catalog/v1.0/productOptions/"+prodOptID+"/productOptionValues";
	const response = await Liferay.Util.fetch(url, {
    method: 'GET'
  });
  const done = await response.json();
  return done; 
}

async function fetchProductSpecifications(prodID) {
	var url = "/o/headless-commerce-admin-catalog/v1.0/products/"+prodID+"/productSpecifications";
	const response = await Liferay.Util.fetch(url, {
    method: 'GET'
  });
  const done = await response.json();
	var specs = Array();
	for (var i=0; i<done.items.length; i++) {
		specs.push(done.items[i].label.en_US);
	}
  return specs; 
}

var prod = await fetchProd(prodID);
document.getElementById("titleConf").textContent = prod.name.en_US; 
var prodO = await fetchProductsOptions(prodID);
var prodS = await fetchProductSpecifications(prodID);

function orderD(a, b) {
  return b.priority - a.priority;
}

function orderA(a, b) {
  return a.priority - b.priority;
}

console.log(prodO);

var prdOpt = new Array();
for (var i=0; i<prodO.items.length; i++) {
	var obj = new Object();
	if (!prodO.items[i].key.startsWith("base")) {
	  obj.description = prodO.items[i].description.en_US;
    obj.priority = prodO.items[i].priority;
		var values = new Array();
		var pVal = await fetchProductOptionValues(prodO.items[i].id);
		for (var y=0; y<pVal.items.length; y++) {
			var obj2 = new Object();
			obj2.price = pVal.items[y].deltaPrice;
			obj2.name = pVal.items[y].name.en_US;
			obj2.priority = pVal.items[y].priority;
			values.push(obj2);
		}
		values.sort(orderA);
		obj.values = values;
		prdOpt.push(obj);
	} else {
		var pVal = await fetchProductOptionValues(prodO.items[i].id);
		prod.basePrice = pVal.items[0].deltaPrice;
	}
}
prdOpt.sort(orderA); 

function is1T(des) {
	if (des!= null && des.startsWith("Ti attiviamo Internet, dicci tu quando!") || 
			3>4) 
		return true;
}

for (var i=0; i<prdOpt.length; i++) {	
	  console.log("i"+i);
		var div = document.getElementById("conf");
		var h2 = document.createElement('h2');
		h2.classList.add("inline");
		h2.classList.add("number");
		h2.textContent = i+1;
		div.appendChild(h2);
		h2 = document.createElement('h2');
		h2.classList.add("inline");
		h2.textContent = prdOpt[i].description;
		div.appendChild(h2);
		div.appendChild(document.createElement('br'));
		// options
  	var group = document.createElement('div'); 
		group.classList.add("radio-group");
	  
	  console.log(prdOpt); 
	
	  for (var y = 0; y < prdOpt[i].values.length; y++) { 
		  var input = document.createElement('input');
		  input.setAttribute("type", "radio");
			input.setAttribute("id", "option"+i+y);
			input.setAttribute("data-UT", "0");
			if (is1T(prdOpt[i].description)) input.setAttribute("data-UT", "1");
			var label = document.createElement('label');
			label.setAttribute("for", "option"+i+y);
			label.textContent = prdOpt[i].values[y].name;
		  var span = document.createElement('span');
			span.classList.add('price');
			span.textContent = " a $"+money(prdOpt[i].values[y].price);
			label.appendChild(span);
			group.appendChild(input);
			group.appendChild(label);
		}
		div.appendChild(group);
}

const radioGroups = document.querySelectorAll('.radio-group');

radioGroups.forEach(group => {
  const options = group.querySelectorAll('input[type="radio"]');
  
  options.forEach(option => {
    option.addEventListener('change', () => {
      // We deselect all other radio buttons in the same group
      options.forEach(otherOption => {
        if (otherOption !== option) {
          otherOption.checked = false;
        }
      });
			checkSelectedOptions();
    });
  });
});

var total1T = 0;
var totalRecurrent = 0;

function checkSelectedOptions() {
  const allRadioButtons = document.querySelectorAll('input[type="radio"]');
  let totalPrice = 0;
	total1T = 0;
  totalRecurrent = 0;

  allRadioButtons.forEach(radioButton => {
    if (radioButton.checked) {
      // Search label for that radio button
      const label = document.querySelector(`label[for="${radioButton.id}"]`);
      // We extract the price from the label (we assume that the price is always after "$")
      const priceString = label.textContent.split('$')[1];
      const price = parseFloat(priceString);
			console.log("RB"+radioButton.dataset.UT);
      if (radioButton.dataset.ut == 1) {
				total1T += price;  
			}
			else {
				totalRecurrent += price;
			}
    }
  });
	document.getElementById("canone").textContent = "Recurring $"+ money(totalRecurrent+prod.basePrice);
	document.getElementById("UTstring").textContent = "Una tantum $"+ money(total1T);
}

function money(num) {
	return (Math.round((num) * 100) / 100).toFixed(2).replace(".",",");
}
var btn = document.getElementById("pay");
var modal = document.getElementById("myModal");
btn.onclick = function() {
  modal.style.display = "block";
}
modal.onclick = function() {
  modal.style.display = "none";
}

document.getElementById("imgTh").src = prod.thumbnail;
document.getElementById("titleSummary").textContent = prod.name.en_US+" $"+money(prod.basePrice);
document.getElementById("canone").textContent = "Recurring $"+money(prod.basePrice);
document.getElementById("UTstring").textContent = "Una tantum $"+ money(0);
var divS = document.getElementById("PRDdetails");  
	for (var i=0; i<prodS.length;i++) {
		var pS = document.createElement('p');
		pS.classList.add("small");
		pS.textContent = "✔ "+prodS[i];
	  divS.appendChild(pS);
	}

// Credit Card

document.getElementById("buyer").textContent = buyer;