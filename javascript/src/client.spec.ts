import test from 'ava';
import { Dashblock } from './dashblock';
import config from "./config.json";

test('Test connection', async t => {
    var dk = await Dashblock.connect("ws://beta.dashblock.io", { api_key: config.API_KEY });
    await dk.goto("https://www.google.com", { timeout: 5000 })
    await dk.html()
    dk.close()
});