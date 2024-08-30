export function echo(...args) {
  console.log(...args)
}

export function error(...args) {
  console.log('\x1B[31m%s', ...args)
}
