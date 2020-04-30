const socket = io()

// Elements variables
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('#message');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const mapTemplate = document.querySelector('#map-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
// options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// autoscroll
const autoscroll = function(){
    // new message element 
    const $newMessage = $messages.lastElementChild

    // height of the new messagee
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of the messages container
    const containerHeight = $messages.scrollHeight

    // how far i have scrolled??
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

// to get the welcome message when used has joined
socket.on('message',function(msg){
    console.log(msg);
    const html = Mustache.render(messageTemplate,{
        username: msg.username,
        textmessage: msg.text,
        time: moment(msg.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

//to send the location in the browser template
socket.on('locationMessage', function(maps){
    console.log(maps.link);
    const maphtml = Mustache.render(mapTemplate, {
        username: maps.username,
        url: maps.link,
        mapTime: moment(maps.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', maphtml);
    autoscroll();
})

socket.on('roomData', function({room, allUsers}){
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: allUsers
    })
    document.querySelector('#sidebar').innerHTML = html;
})

const value = document.querySelector('#message-form').addEventListener('submit', function(event){
    event.preventDefault();

    // disable the send button
    $messageFormButton.setAttribute('disable', 'disable');  //it contains two parameter('event name', 'name of the function of our choice')

    const val = document.querySelector('#message').value;

    // to send the message using the "val" and getting the callback in function
    socket.emit('sendMessage', val, function(error){

        // enable the send button
        $messageFormButton.removeAttribute('disable');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        
        if(error){
            return console.log(error);
        }
        // the callback function
        console.log("message delivered...");
    });
})

// to fetch user's location
document.querySelector('#send-location').addEventListener('click', function(){
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser...');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    // to send location 
    navigator.geolocation.getCurrentPosition(function(position){

        socket.emit('location',{
            latitude: position.coords.latitude,
            longitude:position.coords.longitude
        }, function(){    //---> to get the callback from server
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location Shared!');
        });
    })
})

// username and roomID
socket.emit('joinroom', {username, room},function(error){
    if(error){
        alert(error)
        location.href = '/'
    }
})