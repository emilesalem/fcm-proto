const tokens = []

function register (token) {
    tokens.unshift(token)
}

module.exports = {
    register,
    tokens
}
