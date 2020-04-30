const generateMessage = function(username, text){
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime()
    }
}

const generateMap = function(username, map){
    return {
        username: username,
        link: map,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateMap
}