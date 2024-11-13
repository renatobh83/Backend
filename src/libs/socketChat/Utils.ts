/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  each,
  sortBy,
  fromPairs,
  map,
  forEach,
  isNull,
  findKey,
  isUndefined,
} from "lodash";
import type { Socket } from "socket.io";
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const sortByKeys = (obj: any) => {
  const keys = Object.keys(obj);
  const sortedKeys = sortBy(keys);
  return fromPairs(
    map(sortedKeys, (key) => {
      return [key, obj[key]];
    })
  );
};
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const sendToSelf = (socket: Socket, method: any, data: any = {}) => {
  socket.emit(method, data);
};

export const _sendToSelf = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  io: { sockets: { sockets: any } },
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  socketId: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  method: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any
) => {
  each(io.sockets.sockets, (socket) => {
    if (socket.id === socketId) {
      socket.emit(method, data);
    }
  });
};

export const sendToAllConnectedClients = (
  socket: Socket,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  method: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any
) => {
  socket.emit(method, data);
};

export const sendToAllClientsInRoom = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  io: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  room: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  method: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any
) => {
  io.sockets.in(room).emit(method, data);
};

export const sendToUser = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  socketList: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  userList: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  username: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  method: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any
) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let userOnline: any = null;
  forEach(userList, (v, k) => {
    if (k.toLowerCase() === username.toLowerCase()) {
      userOnline = v;
      return true;
    }
  });

  if (isNull(userOnline)) return true;

  forEach(userOnline?.sockets, (socket) => {
    const o = findKey(socketList, { id: socket });
    if (o) {
      const i = o ? socketList[o] : null;
      if (isUndefined(i)) return true;
      i.emit(method, data);
    }
  });
};

export const sendToAllExcept = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  io: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  exceptSocketId: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  method: any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any
) => {
  each(io.sockets.sockets, (socket) => {
    if (socket.id !== exceptSocketId) {
      socket.emit(method, data);
    }
  });
};
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const disconnectAllClients = (io: any) => {
  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.keys(io.sockets.sockets).forEach((sock) => {
    io.sockets.sockets[sock].disconnect(true);
  });
};
