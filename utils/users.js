// create the User Array of Objects
const users = []

// adduser
const addUser = function({id, username, room}){
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    // check for existing user
    const existingUser = users.find(function(user){
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser){
        return {
            error: 'username is already in use'
        }
    }

    // store user
    const user = {id, username, room}
    users.push(user)
    return {user}

}

//removeuser
const removeUser = function(id){
    const index = users.findIndex(function(user){
        return user.id === id
    })
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

// getuser
const getUser = function(id){
    return users.find(function(user){
        return user.id === id
    })
}

//getuserRoom
const getUserInRoom = function(room){
    return users.filter(function(user){
        return user.room === room
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}

