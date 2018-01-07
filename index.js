var data = require('./data')

module.exports = function (plz) {
  if (plz) {
    return data[plz.toString()]
  }
}
