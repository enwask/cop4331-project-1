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

    loadContacts();
});


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
				window.location.href = "index.html";
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
                    // Get response JSON
                    let jsonObject = JSON.parse(xhr.responseText);
                    if (jsonObject.status) { // Success!
                        window.location.href = "home.html";
                        return;
                    }

                    alert("Error creating contact: " + jsonObject.error);
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

function editContact()
{
		let id = document.getElementById("contactID").value;
		let firstName = document.getElementById("firstName").value;
		let lastName = document.getElementById("lastName").value;
		let phone = document.getElementById("phone").value;
		let email = document.getElementById("email").value;
	
		let tmp = {ID: id, FirstName:firstName, LastName:lastName, Phone: phone, Email:email};
		let jsonPayload = JSON.stringify( tmp );
		console.log(tmp); 

	
		let url = urlBase + '/edit_contact.' + extension;
		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200) 
				{
					document.getElementById("contactEditResult").innerHTML = `${firstName} ${lastName} has been edited!`;
					console.log('Server Response:', this.responseText);
					setTimeout(() =>
					{
						document.getElementById("editContactForm").style.display = "none";
						loadContacts();
					}, 1500);
				}
				else if(this.readyState == 4){
					document.getElementById("contactEditResult").innerHTML = "Could not update";
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
	

function populateContact(id, firstName, lastName, phone, email)
{
	document.getElementById("contactID").value = id;
	document.getElementById("firstName").value = firstName;
	document.getElementById("lastName").value = lastName;
	document.getElementById("phone").value = phone;
	document.getElementById("email").value = email;
	document.getElementById("editContactForm").style.display = "block"; 
}
function deleteContact(contactId){
	let tmp = { ID: contactId};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/delete_contact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST",url,true);
	xhr.setRequestHeader("Content-type","application/json; charset=UTF-8");
	try{
		xhr.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){

				let resBox = document.getElementById("contactSearchResult");
				resBox.innerHTML = "Contact removed";
				
				//refresh
				loadContacts();
			} else if (this.readyState == 4){
				let resBox = document.getElementById("contactSearchResult");
				resBox.innerHTML = "Could not remove contact.";
			}
		};
		xhr.send(jsonPayload);
	} catch(err){
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}

function loadContacts() {
    // API endpoint
    let url = urlBase + "/get_contacts." + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    // No additional data needed since session stores user ID
    let jsonPayload = JSON.stringify({}); // No additional data needed since session stores user ID

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (!jsonObject.status) {
                    console.error("Error loading contacts: ", jsonObject.error);
                    return;
                }

                // Update the HTML table with contact data
                let contacts = jsonObject.contacts;
                let tableBody = document.getElementById("tbody");
                tableBody.innerHTML = ""; // Clear previous entries

                contacts.forEach(contact => {
                    let row = `<tr>
							<td>${contact.firstName}</td>
							<td>${contact.lastName}</td>
							<td>${contact.phone}</td>
							<td>${contact.email}</td>
							<td>
								<button onclick="populateContact(${contact.id}, '${contact.firstName}', '${contact.lastName}', '${contact.phone}', '${contact.email}')" class="edit-button">
									<i class='bx bx-edit-alt'></i>
								</button>
								<button onclick="deleteContact(${contact.id})" class="delete-button">
									<i class='bx bx-trash'></i>
								</button>
							</td>
						</tr>`;
                    tableBody.innerHTML += row;
                });
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.error("Error fetching contacts:", err.message);
    }
}

function searchContacts() {
    const query = document.getElementById("query").value;

    // API endpoint
    let url = urlBase + "/search_contacts." + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    // Prepare the search query
    let jsonPayload = JSON.stringify({
        query: query
    });

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (!jsonObject.status) {
                    console.error("Error loading contacts: ", jsonObject.error);
                    return;
                }

                // Update the HTML table with contact data
                let contacts = jsonObject.contacts;
                let tableBody = document.getElementById("tbody");
                tableBody.innerHTML = ""; // Clear previous entries

                contacts.forEach(contact => {
                    let row = `<tr>
							<td>${contact.firstName}</td>
							<td>${contact.lastName}</td>
							<td>${contact.phone}</td>
							<td>${contact.email}</td>
							<td>
								<button onclick="populateContact(${contact.id}, '${contact.firstName}', '${contact.lastName}', '${contact.phone}', '${contact.email}')" class="edit-button">
									<i class='bx bx-edit-alt'></i>
								</button>
								<button onclick="deleteContact(${contact.id})" class="delete-button">
									<i class='bx bx-trash'></i>
								</button>
							</td>
						</tr>`;
                    tableBody.innerHTML += row;
                });
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.error("Error fetching contacts:", err.message);
    }
    return false;
}

function openModal(contactID, firstName, lastname, phone, email)
{
	document.getElementById("contactID").value = contactID;
	document.getElementById("firstName").value = firstName;
	document.getElementById("lastName").value = lastName;
	document.getElementById("phone").value = phone;
	document.getElementById("email").value = email;

	const modal = document.getElementById("addContactModal");
	modal.style.display = "block";
	
}
function close()
{
	const modal = document.getElementById("addContactModal");
	modal.style.display = "none";
}
