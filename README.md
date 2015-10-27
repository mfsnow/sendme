# Sendme ExpressJS Middleware
ExpressJS middleware. Send response containing data. Format in `JSON`, `XML`, `csv`, `xlsx`, `html`, and `text`.

## Install
```
$ npm install sendme
```

## Usage
```js
var sendme = require('sendme');

app.use(sendme(config)); // Attaches sendme(data) to res.

app.use(function(req, res) {
  var json;

  // Do work.

  res.sendme(json);
});
```

### require('sendme')(config)
`config` (optional) is a JSON object containing formatting configurations. The `config` is passed to the `delimit()` function in [tabular-json](https://github.com/mfsnow/tabular-json#delimit). Pass format-specific options using a sub-object (e.g. as `{xlsx: {includeHeaders: false}}`), and non-specific options to the base `config` object.

#### Config Examples
```js
var config = {
  includeHeaders: false,
  sort: ['id'],
  txt: {
    separator: ';',
    stringWrap: '"'
  }
};
```
See [tabular-json](https://github.com/mfsnow/tabular-json) for more details on config options

### Formats
sendme will send the response in various formats. Either specify a content type using the `Accept` header, or append a format extension to the end of the `req.path`. A format extension will always override the `Accept` header.
- `.json` - Content-Types: `application/json`
  - `application/json` is the primary response type.
- `.xml` - Content-Types: `application/xml`, `text/xml`
- `.xlsx` - Content-Types: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `.csv` - Content-Types: `application/csv`
- `.html` - Content-Types: `text/html`
- `.txt` - Content-Types: `text/plain`

### Examples
Specify a format in the url path:
```http
GET /foos/1.xml HTTP/1.1
Host: example.com
```

```js
var data = {
  id: 1,
  type: 'widget'
};
res.sendme(data);
```

Response:
```http
HTTP/1.0 200 OK
Content-Type: text/xml

<?xml version="1.0" encoding="UTF-8" ?>
<data>
  <id>1</id>
  <type>widget</type>
</data>
```

Also, specify a format in the `Accept` parameter:
```http
GET /foos HTTP/1.1
Host: example.com
Accept: application/csv
```

Response:
```http
HTTP/1.0 200 OK
Content-Type: application/csv

"id","type"
1,"widget"
2,"gadget"
```
