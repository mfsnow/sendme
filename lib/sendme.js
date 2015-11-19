var xl = require('excel4node');
var xml = require('js2xml');
var tabular = require('tabular-json');

module.exports = function(config) {
  return function(req, res, next) {
    res.sendme = function(json) {
      function send(json, extension, filename) {
        var options = {};
        if (typeof config !== 'undefined') {
          for (var prop in config) {
            options[prop] = config[prop];
          }
          if (typeof config[extension] !== 'undefined') {
            for (var p in config[extension]) {
              options[p] = config[extension][p];
            }
          }
        }
        switch (extension) {
        case 'json':
          res.json(json);
          break;
        case 'xml':
          if (json instanceof Array) {
            var wrap = {};
            wrap[filename] = json;
            res.send(xml('data', wrap));
          } else res.send(xml(filename, json));
          break;
        case 'xlsx':
          var wb = new xl.WorkBook();
          var ws = wb.WorkSheet(filename);
          var rows = tabular.array(json, options);
          for (var r=1; r<=rows.length; r++) {
            for (var c=1; c<=rows[r-1].length; c++) {
              var v = rows[r-1][c-1];
              if (typeof v === 'string') {
                ws.Cell(r,c).String(v);
              } else if (v instanceof Date) {
                ws.Cell(r,c).Date(v);
              } else if (v) {
                ws.Cell(r,c).Number(v);
              }
            }
          }
          wb.write(filename+"."+extension, res);
          break;
        case 'csv':
          res.send(tabular.delimit(json, options));
          break;
        case 'html':
          res.send(tabular.html(json, options));
          break;
        default:
          options.separator = typeof options.separator !== 'undefined' ? options.separator : '\t';
          options.stringWrap = typeof options.stringWrap !== 'undefined' ? options.stringWrap : '';
          res.send(tabular.delimit(json, options));
          break;
        }
      }

      var filename = req.path.split('/').pop();
      filename = filename.split('.');
      var extension = filename.pop();
      filename = filename.join('.');
      switch (extension) {
      case 'json':
        res.set('Content-Type', 'application/json');
        send(json, 'json', filename);
        break;
      case 'xml':
        res.set('Content-Type', 'text/xml');
        send(json, 'xml', filename);
        break;
      case 'xlsx':
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        send(json, 'xlsx', filename);
        break;
      case 'csv':
        res.set('Content-Type', 'application/csv');
        send(json, 'csv', filename);
        break;
      case 'html':
        res.set('Content-Type', 'text/html');
        send(json, 'html', filename);
        break;
      case 'txt':
        res.set('Content-Type', 'text/plain');
        send(json, 'txt', filename);
        break;
      default:
        res.format({
          'application/json': function(){
            send(json, 'json', filename);
          },
          'application/xml': function() {
            send(json, 'xml', filename);
          },
          'text/xml': function(){
            send(json, 'xml', filename);
          },
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': function() {
            send(json, 'xlsx', filename);
          },
          'application/csv': function() {
            send(json, 'csv', filename);
          },
          'text/html': function(){
            send(json, 'html', filename);
          },
          'text/plain': function(){
            send(json, 'txt', filename);
          },
          'default': function() {
            res.status(406).json('Not Acceptable');
          }
        });
      }

    };
    next();
  };
};
