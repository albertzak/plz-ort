var fs = require('fs')

// Step 1: Download latest "PLZ Verzeichnis" from
// https://www.post.at/en/business_advertise_products_and_services_addresses_postcodes.php

// Step 2: Convert XLS to CSV
// using eg. https://convertio.co/document-converter/

// Step 3: Edit filename below, run with
//   $ node convert.js
// and re-publish with updated version number
//   major.minor-YYYY.MM

var CSV = 'PLZ_Verzeichnis_JAN18.csv'
var JS = 'data.js'

var parseLine = function (line) {
  var fields = line
    .split('","')
    .slice(0, 2)
    .map(function (cell) {
      if (cell[0] === '"') {
        return cell.slice(1, cell.length)
      } else {
        return cell
      }
    })

  return {
    plz: fields[0],
    ort: fields[1]
  }
}

var collect = function (acc, parsed) {
  if (parsed.plz && parsed.ort) {
    acc[parsed.plz] = parsed.ort
  }
  return acc
}

fs.readFile(CSV, 'utf-8', function (err, content) {
  if (err) {
    console.error('Failed to read file', CSV, err)
    return
  }

  var lines = content
    .split('\n')
    .slice(1)

  var data = lines
    .map(parseLine)
    .reduce(collect, {})

  console.log(data)

  var stringified = JSON.stringify(data, null, 2)
  var output = '// auto-generated file\n' +
    'module.exports = ' + stringified

  fs.writeFile(JS, output, function (err) {
    if (err) {
      console.error('Failed to write file', JS, err)
      return
    }

    console.log('Done, saved', JS)
  })
})
