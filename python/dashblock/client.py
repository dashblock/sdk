#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Connection/Session management module."""

import asyncio
import json
import logging
from typing import Awaitable, Callable, Dict, Union, TYPE_CHECKING

from pyee import EventEmitter
import websockets

if TYPE_CHECKING:
    from typing import Optional  # noqa: F401

logger = logging.getLogger(__name__)
logger_connection = logging.getLogger(__name__ + '.Connection')
logger_session = logging.getLogger(__name__ + '.CDPSession')


class Client(EventEmitter):
    """Connection management class."""

    def __init__(self, 
                 url: str, 
                 api_key: str) -> None:
        """Make connection.
        :arg str url: WebSocket url to connect devtool.
        :arg int delay: delay to wait before processing received messages.
        """
        super().__init__()
        self._url = url
        self._lastId = 0
        self._callbacks: Dict[int, asyncio.Future] = dict()
        self._delay = 0
        self._loop = asyncio.get_event_loop()

        self._connected = False
        self._ws = websockets.client.connect(
            self._url, extra_headers={'authorization': 'Bearer '+api_key}, max_size=None, loop=self._loop)
        self._recv_fut = self._loop.create_task(self._recv_loop())
    
    @staticmethod
    async def connect(endpoint: str, api_key: str) -> Awaitable:
        connection = Client(endpoint, api_key)
        callback = connection._loop.create_future()
        callback.error: Exception = Exception()  # type: ignore
        callback.method: str = 'Connection'  # type: ignore
        connection._callbacks[0] = callback
        await callback
        return connection

    @property
    def url(self) -> str:
        """Get connected WebSocket url."""
        return self._url

    async def _recv_loop(self) -> None:
        async with self._ws as connection:
            self._connected = True
            self.connection = connection
            while self._connected:
                try:
                    resp = await self.connection.recv()
                    if resp:
                        await self._on_message(resp)
                except (websockets.ConnectionClosed, ConnectionResetError):
                    logger.info('connection closed')
                    break
                await asyncio.sleep(0)
        if self._connected:
            self._loop.create_task(self.dispose())

    async def _async_send(self, msg: str, callback_id: int) -> None:
        while not self._connected:
            await asyncio.sleep(self._delay)
        try:
            await self.connection.send(msg)
        except websockets.ConnectionClosed:
            logger.error('connection unexpectedly closed')
            callback = self._callbacks.get(callback_id, None)
            if callback and not callback.done():
                callback.set_result(None)
                await self.dispose()

    def send(self, method: str, params: dict = None) -> Awaitable:
        """Send message via the connection."""
        # Detect connection availability from the second transmission
        if self._lastId and not self._connected:
            raise ConnectionError('Connection is closed')
        if params is None:
            params = dict()
        self._lastId += 1
        _id = self._lastId
        msg = json.dumps(dict(
            id=_id,
            method=method,
            params=params,
        ))
        logger_connection.debug(f'SEND: {msg}')
        self._loop.create_task(self._async_send(msg, _id))
        callback = self._loop.create_future()
        self._callbacks[_id] = callback
        callback.error: Exception = Exception()  # type: ignore
        callback.method: str = method  # type: ignore
        return callback

    def _on_response(self, msg: dict) -> None:
        callback = self._callbacks.pop(msg.get('id', -1))
        if msg.get('error'):
            callback.set_exception(
                _createProtocolError(
                    callback.error,  # type: ignore
                    callback.method,  # type: ignore
                    msg
                )
            )
        else:
            callback.set_result(msg.get('results'))

    def _on_query(self, msg: dict) -> None:
        print(msg)
        event = msg.get('event', '')
        data = msg.get('data', {}).get('data', {})
        metadata = msg.get('metadata', {})
        self.emit(event, data, metadata)

    async def _on_message(self, message: str) -> None:
        print(message)
        await asyncio.sleep(self._delay)
        logger_connection.debug(f'RECV: {message}')
        msg = json.loads(message)
        if msg.get('id') in self._callbacks:
            self._on_response(msg)
        else:
            self._on_query(msg)

    async def _on_close(self) -> None:
        for cb in self._callbacks.values():
            cb.set_exception(_rewriteError(
                cb.error,  # type: ignore
                f'Protocol error {cb.method}: Target closed.',  # type: ignore
            ))
        self._callbacks.clear()

        # close connection
        if hasattr(self, 'connection'):  # may not have connection
            await self.connection.close()
        if not self._recv_fut.done():
            self._recv_fut.cancel()

    async def dispose(self) -> None:
        """Close all connection."""
        self._connected = False
        await self._on_close()

def _createProtocolError(error: Exception, method: str, obj: Dict
                         ) -> Exception:
    message = f'Protocol error ({method}): {obj["error"]["message"]}'
    if 'data' in obj['error']:
        message += f' {obj["error"]["data"]}'
    return _rewriteError(error, message)


def _rewriteError(error: Exception, message: str) -> Exception:
    error.args = (message, )
    return error