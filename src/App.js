
import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyDstGsJQrWRieNmcr9V8mr_DYd93PfTtkw",
  authDomain: "polifacetic-75658.firebaseapp.com",
  databaseURL: "https://polifacetic-75658.firebaseio.com",
  projectId: "polifacetic-75658",
  storageBucket: "polifacetic-75658.appspot.com",
  messagingSenderId: "193059493226",
  appId: "1:193059493226:web:b20298ff2e64e8ec3fc113"
})
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
const storage = firebase.storage();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="header">
        <h4>Polifacetic secret Chat😈😈</h4>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <center><p>Hello madafaca</p></center>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [imageUrl, setImageUrl] = useState();

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName, email } = auth.currentUser;


    await messagesRef.add({
      text: formValue,
      displayName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      email,
      photoURL
    })

    setFormValue('');
    
  }


  useEffect(() => {
    document.querySelector('.chatRoom').scrollTop = document.querySelector('.chatRoom').scrollHeight;
  }, [messagesRef])

  const handleChange = async (e)  => {
    if (e.target.files[0]) {
      var image = e.target.files[0]
    
      var datenow = Date.now() + image.name;

      const { uid, photoURL, displayName, email } = auth.currentUser;
  

      const ref = firebase.storage().ref(`images/${datenow}`).put(image);

     

      await messagesRef.add({
        displayName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        email,
        photoURL,
        image: datenow
      })

     
    }
  };

  return (<>
    <main className="chatRoom">

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage} className="form-f">

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Ditte argo" />

      <button type="submit" disabled={!formValue} className="button-send">🤘</button>
      <label for="img-file" className="labelimage">🖼</label>
      <input type="file" onChange={handleChange} id="img-file" className="inputfileimg"></input>
    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, createdAt, displayName, email, image } = props.message;
  var imageUrl = "";
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  var humanDateFormat = ""
  if(createdAt != undefined){
    const dateObject = new Date(createdAt.seconds * 1000)
     humanDateFormat = dateObject.toLocaleString() 
  }
  var name = "El de la foto";

  if(displayName != undefined){
    name = displayName;
  }else{
    if(email != undefined)
      name = email;
  }
  if(image != undefined){
    imageUrl = "https://firebasestorage.googleapis.com/v0/b/polifacetic-75658.appspot.com/o/images%2F"+image+"?alt=media&token=a13925cc-270a-43e0-bced-6c3a299fdfa2";
  }
  console.log("asdasd",imageUrl)
  
  return (<>
    <div className={`message ${messageClass}`}>
      
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <div >
      
        <p className="msg"><span className="username">{name}</span>{image  ? <img src={imageUrl} class="img-chat"/> : <span>{text}</span> } <span className={`time time${messageClass}`}>{humanDateFormat}</span></p>
        
      </div>
    </div>
  </>)
}


export default App;