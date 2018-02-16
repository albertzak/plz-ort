const fs = require('fs')
const XLSX = require('xlsx')
const fetch = require('node-fetch')
const { execSync } = require('child_process')

const main = async () => {
  try {
    const { filename, date } = await download()
    const csv = await convert(filename)
    await write(csv)
    await publish(date)
  } catch (e) {
    console.error(e)
  }
}

const download = async () => {
  return new Promise(async (resolve, reject) => {
    const page = await fetch('https://www.post.at/geschaeftlich_werben_produkte_und_services_adressen_postlexikon.php')
    const html = await page.text()
    const { link, filename, date } = extractLink(html)
    const xlsFile = await fetch('https://www.post.at/' + link)

    const stream = fs.createWriteStream(filename)
    await xlsFile.body.pipe(stream)

    stream.on('finish', () => {
      console.log('Downloaded', filename)
      resolve({ filename, date })
    }).on('error', (e) => {
      console.error(e)
      reject(e)
    })
  })
}

const extractLink = html => {
  const linkRegex = /(\/downloads\/(PLZ_Verzeichnis_(...\d\d)\.xls)\?\d+)/

  const match = html.match(linkRegex)
  if (!match) {
    console.log(html)
    throw new Error('Cannot find link to PLZ_Verzeichnis_XXXYY.xls')
  }

  const link = match[1]
  const filename = match[2]
  const date = parseDate(match[3])

  console.log('Extracted', { link, filename, date })
  return { link, filename, date }
}

const parseDate = s => {
  // input format: FEB18
  const month = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAI: 5,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OKT: 10,
    NOV: 11,
    DEZ: 12,
    DEC: 12
  }[s.slice(0, 3)]
  const year = '20' + s.slice(3)

  console.log('Parsed date', { month, year })

  return [year, month].join('.')
}

const convert = xlsFile => {
  const buf = fs.readFileSync(xlsFile)
  console.log('File size', buf.length)
  const workbook = XLSX.read(buf)

  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  const json = XLSX.utils.sheet_to_json(worksheet)

  const result = json.reduce((acc, parsed) => {
    if (parsed.PLZ && parsed.PLZ.length === 4 && parsed.Ort) {
      acc[parsed.PLZ] = parsed.Ort
    }
    return acc
  }, {})

  console.log('Parsed', Object.keys(result).length, 'entries')

  if (Object.keys(result) < 2500) {
    throw new Error('Should have more than 2500 entries')
  }

  return result
}

const write = data => {
  const jsFile = 'data.js'

  return new Promise((resolve, reject) => {
    const stringified = JSON.stringify(data, null, 2)
    const output = '// auto-generated file\n' +
      'module.exports = ' + stringified

    fs.writeFile(jsFile, output, err => {
      if (err) {
        console.error('Failed to write file', jsFile, err)
        reject()
        return
      }

      console.log('Done, saved', jsFile)
      resolve(jsFile)
    })
  })
}

const publish = version => {
  execSync('git add .')
  execSync(`git commit -m ${version}`)

  try {
    execSync(`npm version 1.${version}`)
    execSync(`npm publish`)
  } catch (e) {
    console.log('\nIgnore the above error (if any)')
  }

  console.log('Published to npm as', version)
}

main()
