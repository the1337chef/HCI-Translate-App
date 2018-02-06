let https = require ('https');

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()
const speechKey = '652947f3a3824d30a53e989455bb4166';
const textKey = 'a4e72935ad524d09a33f2e3599087493';
var parseString = require('xml2js').parseString;

var entries = [];

var languageList = ['Afrikaans','Arabic','Bangla','Bosnian (Latin)','Bulgarian','Cantonese (Traditional)','Catalan','Chinese Simplified','Chinese Traditional','Croatian','Czech','Danish','Dutch','English','Estonian','Fijian','Filipino','Finnish','French','German','Greek','Haitian Creole','Hebrew','Hindi','Hmong Daw','Hungarian','Indonesian','Italian','Japanese','Kiswahili','Klingon','Klingon (plqaD)','Korean','Latvian','Lithuanian','Malagasy','Malay','Maltese','Norwegian','Persian','Polish','Portuguese','Queretaro Otomi','Romanian','Russian','Samoan','Serbian (Cyrillic)','Serbian (Latin)','Slovak','Slovenian','Spanish','Swedish','Tahitian','Tamil','Thai','Tongan','Turkish','Ukrainian','Urdu','Vietnamese','Welsh','Yucatec Maya'];
var abbrList = ['af', 'ar', 'bn', 'bs', 'bg', 'yue', 'ca', 'zh-Hans', 'zh-Hant', 'hr', 'cs', 'da', 'nl', 'en', 'et', 'fj', 'fil', 'fi', 'fr', 'de', 'el', 'ht', 'he', 'hi', 'mww', 'hu', 'id', 'it', 'ja', 'sw', 'tlh', 'tlh-Qaak', 'ko', 'lv', 'lt', 'mg', 'ms', 'mt', 'nb', 'fa', 'pl', 'pt', 'otq', 'ro', 'ru', 'sm', 'sr-Cyrl', 'sr-Latn', 'sk', 'sl', 'es', 'sv', 'ty', 'ta', 'th', 'to', 'tr', 'uk', 'ur', 'vi', 'cy', 'yua'];
var selectedEntry = [ "selected","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""];
var selectedIndex = 0;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    res.render('index', {code: null, error: null, languages:languageList, abbr:abbrList, selected:selectedEntry});
  })
  
  app.post('/', function (req, res) {

    let host = 'api.microsofttranslator.com';
    let path = '/V2/Http.svc/Translate';

    let target = req.body.lang;
    let text = req.body.string;

    selectedEntry[selectedIndex] = "";
    selectedIndex = abbrList.indexOf(target);
    selectedEntry[selectedIndex] = "selected";

    let params = '?to=' + target + '&text=' + encodeURI(text);

    let response_handler = function (response) {
        let body = '';
        response.on ('data', function (d) {
            body += d;
        });
        response.on ('end', function () {

            parseString(body, function(err, result){
                let xmlString = JSON.stringify(result);
                let translation = JSON.parse(xmlString);
                if(translation.string != null)
                {
                    if(translation.string._ != null)
                    {
                        entries.push(text);
                        entries.push(translation.string._);
                    }
                }
                res.render('index', {code:entries, error: null, languages:languageList, abbr:abbrList, selected:selectedEntry});
            })
        });
        response.on ('error', function (e) {
            console.log ('Error: ' + e.message);
        });
    };

    let Translate = function () {
        let request_params = {
            method : 'GET',
            hostname : host,
            path : path + params,
            headers : {
                'Ocp-Apim-Subscription-Key' : textKey,
            }
        };

        let req = https.request (request_params, response_handler);
        req.end ();
    }

    Translate ();
  })

app.listen(process.env.PORT || 5000, function () {
  })