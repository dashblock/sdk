from .client import Client
import asyncio

class Dashblock:

    def __init__(self, client):
        self.client = client
        self.client.on('page', lambda page : self.emit('page', page))
        self.client.on('frame', lambda frame : self.emit('frame', frame))
    
    @staticmethod
    async def connect(endpoint, api_key):
        client = await Client.connect(endpoint, api_key)
        return Dashblock(client)

    async def goto(self, url, timeout=5000):
        return await self.client.send('goto', { "url": url, "timeout": 5000 })
    
    async def html(self):
        return await self.client.send('html')
    
    async def on(self, eventName, callback):
        def cb(data):
            print(data)
            callback(data)

        self.client.on(eventName, cb)
        if eventName=='page':
            return await self.client.send('enablePage', { 'enabled': True })
        elif eventName=='frame':
            return await self.client.send('enableFrame', { 'enabled': True })
            
    async def close(self):
        return await self.client.dispose()