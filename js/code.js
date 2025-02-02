const urlBase = 'http://contactcircle.xyz/api';
const extension = 'php';

document.addEventListener('DOMContentLoaded', function() {
	let btn = document.querySelector('#btn');
	let sidebar = document.querySelector('.sidebar');

	if(btn && sidebar)
	{
		btn.onclick = function () {
			sidebar.classList.toggle('active');
		};
	}

}
);


let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("Login").value;
	let password = document.getElementById("Password").value;

	document.getElementById("loginResult").innerHTML = "";

	let tmp = {Login:login,Password:password};

	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "home.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.substring(data.indexOf(';') + 1).split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		console.log("firstname: ", firstName, "lastname: ",lastName);
		document.getElementById("userName").innerHTML = "Welcome " + firstName + "!";
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function doRegister()
{
	let login = document.getElementById("Login").value;
	let firstName = document.getElementById("FirstName").value;
	let lastName = document.getElementById("LastName").value;
	let password = document.getElementById("Password").value;

	document.getElementById("registerResult").innerHTML = "";
	if(!login || !firstName || !lastName || !password)
	{
		document.getElementById("registerResult").innerHTML = "All fields are required";
		return; 
	}
	let tmp = {Login:login, FirstName:firstName, LastName:lastName, Password:password};

	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("registerResult").innerHTML = `Welcome to Contact Circle ${firstName} ${lastName}!`;
				setTimeout(() =>
					{
						window.location.href = "index.html";
					}, 3000);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("registerResult").innerHTML = err.message;
	}

	
}


function createContact()
{
		let firstName = document.getElementById("firstName").value;
		let lastName = document.getElementById("lastName").value;
		let phone = document.getElementById("phone").value;
		let email = document.getElementById("email").value;

		document.getElementById("contactAddResult").innerHTML = "";

		if(!firstName || !lastName || !phone || !email)
		{
			document.getElementById("contactAddResult").innerHTML = "All fields are requried.";
			return false; 
		}
	
		let tmp = {FirstName:firstName, LastName:lastName, Phone: phone, Email:email, UserId:userId};
		let jsonPayload = JSON.stringify( tmp );
	
		let url = urlBase + '/create_contact.' + extension;
		
		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200) 
				{
					document.getElementById("contactAddResult").innerHTML = `${firstName} ${lastName} has been added`;
					setTimeout(() =>
					{
						window.location.href = "home.html";
					}, 3000);
				}
			};
			xhr.send(jsonPayload);
		}
		catch(err)
		{
			document.getElementById("contactAddResult").innerHTML = err.message;
		}
		return false; 
}
function searchContacts()
{
	const query = document.getElementById("query").value;
	const table = document.getElementById("contacts");
	const tr = table.getElementsByTagName("tr"); //table row
		let tmp = {
			query:search, 
			userId:userId}
			;
		let jsonPayload = JSON.stringify( tmp );
	
		let url = urlBase + '/search_contacts.' + extension;
		
		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200) 
				{
					let jsonObject = JSON.parse( xhr.responseText );
					
					for( let i=0; i<jsonObject.contacts.length; i++ )
					{
						let contact = jsonObject.contacts[i];
						contactList += `${contact.firstName}, ${contact.lastName}, ${contact.phone}, ${contact.email}`;
						if( i < jsonObject.contacts.length - 1 )
						{
							contactList += "<br />\r\n";
						}
					}
					
					document.getElementById("contactList").innerHTML = contactList;
				}
			};
			xhr.send(jsonPayload);
		}
		catch(err)
		{
			document.getElementById("contactSearchResult").innerHTML = err.message;
		}
		
}
function deleteContact(contactId){
	let tmp = { ID: contact, UserId: userId };
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/delete_contact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST",url,true);
	xhr.setRequestHeader("Content-type","application/json; charset = UTF-8");
	try{
		xhr.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){
				let resBox = document.getElementById("contactSearchResult");
				resBox.innerHTML = "Contact removed";
				//refresh
				searchContacts();
			} else if (this.readyState == 4){
				let resBox = document.getElementById("contactSearchResult");
				resBox.innerHTML = "Could not remove contact.";
			}
		}
	} catch(err){
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}
	
	
