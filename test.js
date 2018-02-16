const ort = require('./index.js')

var assertEqual = function (test, expected) {
  if (test === expected) {
    process.stdout.write('.')
  } else {
    throw new Error('Expected ' + test + ' to equal ' + expected)
  }
}

assertEqual(ort(1000), 'Wien')
assertEqual(ort(1070), 'Wien')
assertEqual(ort(9992), 'Iselsberg-Stronach')
assertEqual(ort(9991), 'Dölsach')
assertEqual(ort(1210), 'Wien')
assertEqual(ort(2601), 'Sollenau')
assertEqual(ort(4024), 'Linz, Donau')
assertEqual(ort(9173), 'St. Margareten im Rosental')
assertEqual(ort(4063), 'Hörsching')
assertEqual(ort('4063'), 'Hörsching')
assertEqual(ort('1000'), 'Wien')
assertEqual(ort('1337'), undefined)
