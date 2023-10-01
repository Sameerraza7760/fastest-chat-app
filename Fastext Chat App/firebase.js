import { initializeApp } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, addDoc, getDocs, where, query } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-storage.js"
const firebaseConfig = {
    apiKey: "AIzaSyB0wUItCm3RG-K3ZkWH8vgYyxUDETcAaJs",
    authDomain: "fastext-14475.firebaseapp.com",
    projectId: "fastext-14475",
    storageBucket: "fastext-14475.appspot.com",
    messagingSenderId: "841351686247",
    appId: "1:841351686247:web:0f7099eb8fd58fb5e80cc2",
    measurementId: "G-FNDYS6F6XJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)



async function signupFirebase(userInfo) {
    const { email, password } = userInfo
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await addUserToDB(userInfo)
}

function addUserToDB(userInfo) {
    const uid = auth.currentUser.uid
    const { email, fullname, imageUrl } = userInfo
    return setDoc(doc(db, "users", uid), { email, fullname, imageUrl, userId: uid })
}

// Image profile
async function uploadImage(image) {
    const storageRef = ref(storage, `images/${image.name}`)
    const snapshot = await uploadBytes(storageRef, image)
    const url = await getDownloadURL(snapshot.ref)
    return url
}


// sigin
function signinFirebase(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
}



// Users
function getRealTimeUsers(callback) {
    onSnapshot(collection(db, "users"), (querySnapshot) => {
        const users = []
        querySnapshot.forEach((doc) => {
            if (doc.id !== auth.currentUser.uid) {
                users.push({ id: doc.id, ...doc.data() })
            }
        });
        showCurrentUserInfo(auth.currentUser.uid)

        callback(users)

    })

}


// KeepLoggined
function keeploggined() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            console.log("User is loggined");
            console.log(uid);

        } else {
            console.log("User is signed out");
        }
    });

}
// Logout
function logoutFirebase() {
    auth.signOut();
    console.log('User signed out!')
}

window.showCurrentUserInfo = async function (id) {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        document.getElementById("currentUserName").innerHTML = docSnap.data().fullname
        document.getElementById("currentProfile").setAttribute("src", docSnap.data().imageUrl)

    } else {
        console.log("No such document!");
    }

}


// Chat All Work
async function checkRoom(friendId) {
    try {
        const currentUserId = auth.currentUser.uid
        const users = { [friendId]: true, [currentUserId]: true }
        const q = query(collection(db, "chatrooms"), where(`users.${friendId}`, "==", true), where(`users.${currentUserId}`, "==", true));
        let room = {}
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            room = doc.data()
            room.id = doc.id
        })
        if (!room.id) {
            return addDoc(collection(db, "chatrooms"), { users, createdAt: Date.now(), lastMessage: {} })
        }
        console.log(room);
        return room;
    } catch (e) {
        console.log(e);
    }

}


// Sending and getting msgs from DB
async function sendMessageToDb(text, roomId) {
    var Messageid = roomId + Date.now();

    const message = { text: text, createdAt: Date.now(), userId: auth.currentUser.uid }
    const DocRef = doc(db, "chatrooms", `${roomId}`, "messages", `${Messageid}`);
    await setDoc(DocRef, message);
}


async function getMessagesFromDb(roomId, callback) {
    const q = query(collection(db, "chatrooms", `${roomId}`, "messages"))
    onSnapshot(q, (querySnapshot) => {
        const messages = []
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() })
        })

        console.log(messages);
        callback(messages)
    })
}


















async function showChatroom() {
    const eqto = location.href.indexOf("=")
    const id = window.location.href.slice(eqto + 1,)
    const usersRef = doc(db, "users", id);
    const chatusers = await getDoc(usersRef);
}
showChatroom()







export {
    signinFirebase,
    signupFirebase,
    uploadImage,
    getRealTimeUsers,
    keeploggined,
    logoutFirebase,
    checkRoom,
    sendMessageToDb,
    getMessagesFromDb,
    auth,


}























async function changeChatroomFirebase(id) {
    const usersRef = doc(db, "chatrooms", '${id}', "users ");
    const users = await getDoc(usersRef);
    console.log(users);
    // if (docSnap.exists()) {
    //     console.log("Document data:", docSnap.data());
    //     document.getElementById("currentUserName").innerHTML = docSnap.data().fullname
    //     document.getElementById("currentProfile").src = docSnap.data().imageUrl
    // } else {
    //     // doc.data() will be undefined in this case
    //     console.log("No such document!");
    // }
}

