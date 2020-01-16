var config =require("../config.json");
var Dashblock = require('../dist').Dashblock;

var main = async () => {
    var dk = await Dashblock.connect({ api_key: config.API_KEY });
    await dk.goto("https://www.hofffuneral.com/obituaries/")
    var results = await dk.collect([{
            name: "name",
            selection: {
                css: "#obits-layout > div.obits-container.pure-g > div.obits-left-col.pull-left.pure-u-1.pure-u-md-18-24 > div.obits-content.obits-search-content > div > div > div.obituary-body.obit-info > div.name > h3 > a", 
            }
        },
        {
            name: "link",
            format: "URL",
            attribute: {
                html: "href"
            },
            selection: {
                css: "#obits-layout > div.obits-container.pure-g > div.obits-left-col.pull-left.pure-u-1.pure-u-md-18-24 > div.obits-content.obits-search-content > div > div > div.obituary-body.obit-info > div.name > h3 > a", 
            }
        },
        {
            name: "dates",
            format: "DATE_RANGE",
            selection: {
                css: "#obits-layout > div.obits-container.pure-g > div.obits-left-col.pull-left.pure-u-1.pure-u-md-18-24 > div.obits-content.obits-search-content > div > div > div.obituary-body.obit-info > div.name > h3 > small", 
            }
        },
        {
            name: "description",
            selection: {
                css: "#obits-layout > div.obits-container.pure-g > div.obits-left-col.pull-left.pure-u-1.pure-u-md-18-24 > div.obits-content.obits-search-content > div > div > div.obituary-body.obit-info > div.description", 
            }
        },
        {
            name: "images",
            format: "URL",
            attribute: {
                css: 'backgroundImage'
            },
            selection: {
                css: "#obits-layout > div.obits-container.pure-g > div.obits-left-col.pull-left.pure-u-1.pure-u-md-18-24 > div.obits-content.obits-search-content > div > div > div.obituary-left.obit-profile > a > span", 
            }
        }
    ])
    console.log(results)
    await dk.close()
}

main()