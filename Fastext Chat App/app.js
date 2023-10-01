import {
    signinFirebase,
    signupFirebase,
    uploadImage,
    keeploggined,
    logoutFirebase,
    getRealTimeUsers,
    checkRoom,
    sendMessageToDb,
    getMessagesFromDb,
    auth,
    

} from "./firebase.js";



//SignUP
window.signUp = async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const fullname = document.getElementById("fName").value + " " + document.getElementById("lName").value;
    const image = document.getElementById("image-input").files[0]
    try {
        const imageUrl = await uploadImage(image)
        await signupFirebase({ email, password, fullname, imageUrl });
        await swal("Congratulations!", "Your account created successfully!", "success");
        location.href = "login.html";
    }
    catch (e) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: e.message
            // footer: '<a href="">Why do I have this issue?</a>'
        })
    }
}



// SignIN
window.signIn = async function () {
    let email = document.getElementById("login-email").value
    let password = document.getElementById("login-password").value
    try {
        await signinFirebase(email, password);
        await swal("Congratulations!", "Loggined successfully!", "success");
        location.href = "users.html";

    } catch (e) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: e.message
            // footer: '<a href="">Why do I have this issue?</a>'
        })
    }
}

// Dropdown Logout
window.openDropdown = function () {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}




// Chat  ...........
const slash = window.location.href.lastIndexOf('/')
const currentURL = window.location.href.slice(slash + 1,)

//   Users
function getUsers() {
    getRealTimeUsers((users) => {
        const usersElem = document.getElementById("all-users")
        usersElem.innerHTML = ''
        for (let item of users) {


            usersElem.innerHTML += `
            <div class="user-item-div" onclick = "initiateChat('${item.userId}')" >
                <div class="user-item-left-profile">
                    <div class="user-pic">
                        <img src="${item.imageUrl}" alt="">
                    </div>
                    <div class="user-item-left-name-and-message">
                        <div class="user-item-name"><span>${item.fullname}</span></div>
                        <div id = "last-msg" class="user-item-last-msg"><span></span></div>
                    </div>
                </div>

                <div class="user-item-right-profile">
                    <div class="last-msg-time">
                        <span id="last-msg-time"><span>
                    </div>
                </div>
            </div>
`
        }
    })
}


if (currentURL == 'users.html') {
    getUsers()
}


// keeploggined function is inside firebase 
keeploggined()


// Logout
window.logout = function () {
    logoutFirebase()
}




// Chats Work app.js
window.initiateChat = async function (friendId) {
    const chatRoom = await checkRoom(friendId);
    window.location.href = `chat-page.html?id=${chatRoom.id}`
}




window.senddMessage = function () {
    let text = document.getElementById("msg-inp");
    if (text.value == "") {
        return
    }
    else {
        const eqTo = location.href.indexOf('=')
        const myroomId = location.href.slice(eqTo + 1,)
        sendMessageToDb(text.value, myroomId);
        text.value = ""
    }
}

// Current Page
const qmark = location.href.indexOf("?")
const currPage = location.href.slice(qmark-14,qmark)
if(currPage == "chat-page.html"){
    getMessages()
}


getMessages()
function getMessages() {
    const eqTo = location.href.indexOf('=')
    const myroomId = location.href.slice(eqTo + 1,)
    getMessagesFromDb(myroomId, (messages) => {
        const MessagesDiv = document.getElementById("messages")
        MessagesDiv.innerHTML = ''
        
        for (let item of messages) {
            if (auth.currentUser.uid == item.userId) {
                MessagesDiv.innerHTML += `
                <div class="msg-item right">
                 <div> ${item.text}  </div>
                 <div> <span class = "msg-time">${convertMsToTime(item.createdAt)}</span>  </div>
            </div>
    `
            }
            else {
                MessagesDiv.innerHTML += `
                <div class="msg-item">
                 <div> ${item.text}  </div>
                 <div> <span class = "msg-time">${convertMsToTime(item.createdAt)}</span></div>
            </div>
    `
            }
        }
        
    })

}

function convertMsToTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;
    if (hours > 12) {
        hours = 24 - hours
        return `${hours}:${minutes} PM`;
    }


    return `${hours}:${minutes} AM`;
}
