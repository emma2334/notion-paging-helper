module.exports = { echo, error }

function echo(...args) {
  console.log(...args)
}

function error(...args) {
  console.log('\x1B[31m%s', ...args)
}
