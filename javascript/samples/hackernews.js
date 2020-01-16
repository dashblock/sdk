var config =require("../config.json");
var Dashblock = require('../dist').Dashblock;

var main = async () => {
    var dk = await Dashblock.connect({ api_key: config.API_KEY })
    await dk.goto("https://news.ycombinator.com/")
    var results = await dk.collect([{
                        name: 'title',
                        selection: [{
                            css: 'td.title > a.storylink'
                        }]
                    }, 
                    {
                        name: 'link',
                        attribute: {
                            html: 'href'
                        },
                        selection: [{
                            css: 'td.title > a.storylink'
                        }]
                    },
                    {
                        name: 'points',
                        selection: [{
                            css: 'span.score'
                        }]
                    }, 
                    {
                        name: 'username',
                        selection: [{
                            css: 'td.subtext > a.hnuser'
                        }]
                    },
                    {
                        name: 'posted_ts',
                        format: 'DATE',
                        selection: [{
                            css: 'span.age > a'
                        }]
                    },
                    {
                        name: 'comments',
                        selection: [{
                            css: 'td.subtext > a:nth-child(6)'
                        }]
                    }])
    console.log(results)
    await dk.close()
}

main()