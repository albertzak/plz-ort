# PLZ/Ort

Get Ort (City/Locality) associated with Austrian ZIP code (Postleitzahl, PLZ).

Data is sourced from the Austrian Post's [official postcode list](https://www.post.at/en/business_advertise_products_and_services_addresses_postcodes.php).

**Last Updated: January 2018**

## Usage

The module exports a single function that accepts a string or an integer and returns the matching name.

```javascript
import ort from 'plz-ort'

ort(1060) // => 'Wien'
ort('2601') // => 'Sollenau'
ort(1337) // => undefined
```
