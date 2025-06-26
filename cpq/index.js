var chooseOffer = document.getElementById("chooseOffer");

var url_string = window.location.href;
var url = new URL(url_string); 
var selectedArea = url.searchParams.get("area");
var buyer = url.searchParams.get("buyer");

//selectedArea = "A"; // to DELETE

var productsURL = "/o/headless-commerce-admin-catalog/v1.0/products";
var products = new Array();

async function fetchProducts(page, pageSize, url) {
	const response = await Liferay.Util.fetch(url+"?page="+page+"&pageSize="+pageSize, {
    method: 'GET'
  });
  const done = await response.json();
  return done;
} 

products = await fetchProducts(1, 500, productsURL);

function prodAvInThisArea(prod, area) {
	var prodCats = prod.tags; 
	for (var i=0; i<prod.tags.length;i++) {  
		console.log(area.toString() +" "+ prod.tags[i])
		if (area.toString() == prod.tags[i]) return true;
	}
	return false; 
}

//filter products by Area 
var avProducts = new Array(); 

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

async function getBasePrice(productID) {
  var productOptions = await fetchProductsOptions(productID);
	var pOID = 0;
	console.log("1"); 
	for (var i=0; i< productOptions.items.length; i++) {
	  if (productOptions.items[i].key.startsWith("base")) {
			pOID = productOptions.items[i].id; 
			break;
		} 
	}
	var productOptionValues = await fetchProductOptionValues(pOID);
	return productOptionValues.items[0].deltaPrice;
} 

for (var i=0; i<products.items.length; i++) {
	if (prodAvInThisArea(products.items[i], selectedArea)) {
		const basePrice = await getBasePrice(products.items[i].productId);
		products.items[i].basePrice=basePrice;
		console.log("VA"); 
		const specs = await fetchProductSpecifications(products.items[i].productId);
		products.items[i].specs=specs;
    avProducts.push(products.items[i]);
	}
}
console.log(avProducts);

function createCard(prod, n) {
  const father = document.getElementById('cardList');
  const newDiv = document.createElement('div');
  newDiv.classList.add('offerCard');
	if (prod.best == 0)
	newDiv.classList.add('regularOffer');
	else 
	newDiv.classList.add('bestOffer');	
	const prdImg = document.createElement('img');
	prdImg.classList.add('imgThumb');
	prdImg.src = prod.thumbnail;
	newDiv.appendChild(prdImg);
  const title = document.createElement('H2');
	title.classList.add('titleProduct');
	title.textContent = prod.name.en_US;
	newDiv.appendChild(title);
	const p = document.createElement('p');
	p.textContent = "starting from";
	const price = document.createElement('h2');
	price.classList.add('titleProduct'); 
	price.textContent = "€"+(Math.round(prod.basePrice * 100) / 100).toFixed(2).replace(".",",");
	newDiv.appendChild(p);
	newDiv.appendChild(price);
	const table = document.createElement('table');
	table.classList.add('specTable'); 
	const thead = document.createElement('thead');
	const th1 = document.createElement('th');
	th1.classList.add("centered");
	th1.setAttribute("colspan", "2");	

	thead.appendChild(th1);  
	table.appendChild(thead);
	newDiv.appendChild(table);
	const p1 = document.createElement("p");
	p1.classList.add("subtitle");
	p1.textContent = prod.shortDescription.en_US;
	const thead1 = document.createElement('thead');
	const th2 = document.createElement('th');
	th2.classList.add("centered");
	th2.setAttribute("colspan", "2");	
	th2.appendChild(p1);
	thead1.appendChild(th2);
	table.appendChild(thead1);
	const button1 = document.createElement("button");
	button1.classList.add("verifyButton");
	button1.textContent = "Configurator";
	button1.onclick = function () {
		window.location.replace("/web/cpq-site/configurator?prod="+prod.productId+"&buyer="+buyer);
	}
	const thead2 = document.createElement('thead');
	const th3 = document.createElement('th');
	th3.classList.add("centered");
	th3.setAttribute("colspan", "2");	
	th3.appendChild(button1);
	thead2.appendChild(th3);
	table.appendChild(thead2);
	const thead3 = document.createElement('thead');
	const th4 = document.createElement('th');
	th4.classList.add("lined");
	th4.setAttribute("colspan", "2");	
	thead3.appendChild(th4);
	table.appendChild(thead3);
	const thead4 = document.createElement('thead');
	const th5 = document.createElement('th');
	th5.setAttribute("colspan", "2");	
	thead4.appendChild(th5);

	for (var i=0; i<prod.specs.length;i++) {
		var trx = document.createElement('tr');
		const td = document.createElement('td');
		td.textContent = "✔ "+prod.specs[i];
		td.setAttribute("colspan", "2");
		//td.classList.add("centered");
		trx.appendChild(td);
		table.appendChild(trx);
	}
	
	 
	table.appendChild(thead4);
  father.appendChild(newDiv);
}

function ordinaPerPrezzoDecrescente(a, b) {
  return b.basePrice - a.basePrice;
}

for (var i=0; i<avProducts.length; i++) {
	avProducts[i].best = 0;
}
avProducts.sort(ordinaPerPrezzoDecrescente);
avProducts[0].best = 1;


for (var i=0; i<avProducts.length; i++) { 
  createCard(avProducts[i],i); 
}