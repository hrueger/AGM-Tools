const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const nspChat = io.of("/chat");
const nspDefault = io.nsps["/"];

let messageList = [];
let userList = [];

io.on("connection", (socket) => {
    // tslint:disable-next-line: no-console
    console.log("User Connected");
    socket.emit("connected", "Welcome");
    let addedUser = false;

    socket.on("add user", (data) => {
        if (addedUser) { return; }
        addedUser = true;
        socket.username = data.username;
        // tslint:disable-next-line: no-console
        console.log("Username: ", data.username);
        userList.push({
            username: data.username,
        });

        socket.emit("login", {
            userList,
        });

        socket.broadcast.emit("user joined", {
            username: data.username,
        });

        socket.join(data.username);
    });

    socket.on("call", (data) => {
        // tslint:disable-next-line: no-console
        console.log("call from", data.from);
        // tslint:disable-next-line: no-console
        console.log("call to", data.to);
        io.sockets.in(data.to).emit("call:incoming", data);
    });

    socket.on("iceCandidate", (data) => {
        io.sockets.in(data.to).emit("call:iceCandidate", data);
    });

    socket.on("answer", (data) => {
        // tslint:disable-next-line: no-console
        console.log("answer from", data.from);
        // tslint:disable-next-line: no-console
        console.log("answer to", data.to);
        io.sockets.in(data.to).emit("call:answer", data);
    });

    socket.on("answered", (data) => {
        // tslint:disable-next-line: no-console
        console.log("answer from", data.from);
        // tslint:disable-next-line: no-console
        console.log("answer to", data.to);
        io.sockets.in(data.to).emit("call:answered", data);
    });

    socket.on("new message", (data, cb) => {
        cb(true);
        // tslint:disable-next-line: no-console
        console.log(data);
        messageList.push(data);
        socket.broadcast.emit("new message", data);
    });

    socket.on("getUsers", () => {
        socket.emit("getUsers", userList);
    });
    socket.on("user count", () => {
        socket.emit("user count", userList.length);
    });
    socket.on("getMessages", () => {
        socket.emit("getMessages", messageList);
    });

    socket.on("disconnect", () => {
        // tslint:disable-next-line: no-console
        console.log("User Disconnected");
        if (addedUser) {
            for (let i = 0; i < userList.length; i++) {
                if (socket.username === userList[i].username) {
                    userList.splice(i, 1);
                }
            }
            socket.broadcast.emit("user left", {
                username: socket.username,
            });

            socket.emit("getUsers", userList);
        }
    });
});

nspDefault.on("connect", (socket) => {
    // tslint:disable-next-line: no-console
    console.log("Joined Namespace: /");
    socket.on("disconnect", () => {
        // tslint:disable-next-line: no-console
        console.log("Left Namespace: /");
    });
});

nspChat.on("connect", (socket) => {
    // tslint:disable-next-line: no-console
    console.log("Joined Namespace: /chat");

    socket.on("disconnect", () => {
        // tslint:disable-next-line: no-console
        console.log("Left Namespace: /chat");
    });
});

server.listen(3001);
