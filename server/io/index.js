let clients = [];
//let records = [];

export default function Svc(socket, io) {
    return Object.freeze({
        leave(data) {
            console.log('leave');
            socket.leave(data);
        },
        async join(data) {
            // console.log(data);
            // console.log(socket.id);
            // console.log(socket.rooms);
            socket.join(data.code);
            //console.log(socket.rooms);
            
            //console.log(socket.adapter.rooms.get(data.code));
            let userList = socket.adapter.rooms.get(data.code);
            let firstUser = '';
            let i = 0;
            userList.forEach( function(user) {
                if(i == 0) {
                    firstUser = user;   
                }
                i++;
            });
            // console.log(firstUser);
            // console.log(i);
            // let user = new Object();
            // user.email = data.email;
            // user.id = socket.id;
            // clients.push(user);
            
            let msg = `${data.code} 프로젝트에 ${data.email}님이 들어왔습니다.`;
            let joinData = new Object();
            joinData.code = data.code;
            joinData.msg = msg;
            joinData.firstUser = firstUser;
            joinData.fu_email = data.email;
            joinData.total = i;
            joinData.sendUser = socket.id;
            io.of('/index').to(data.code).emit('joinUser', joinData);
            
            let initTime = new Date(5 * 60 * 1000).getTime();
            let timer = setInterval( function() {
                initTime = initTime - 1000;
                userList = socket.adapter.rooms.get(joinData.code);
                let i = 0;
                userList.forEach( function(user) {
                    if(i == 0) {
                        firstUser = user;   
                    }
                });
                if(initTime === 0) {
                    initTime = new Date(5 * 60 * 1000).getTime();
                    console.log("autoSave");
                    console.log(firstUser);
                    io.of('/index').to(firstUser).emit('reqAutoSave');
                    //io.of('/index').to(data.code).emit('reqAutoSave');
                    //clearInterval(timer);
                }
            }, 1000);
            
            
            if(joinData.total != 1) {
                //console.log('reqHtml');
                socket.to(joinData.firstUser).emit('reqHtml', joinData);
            }
            
            // 프로젝트 참여 시 작업이력 요청
            socket.to(data.code).emit('requestPushRecord', data.email);
            
            socket.once('disconnect', () => {
                // console.log(joinData.code);
                // console.log(socket.adapter.rooms.get(joinData.code));
               
                //console.log(socket.adapter.rooms.get(data.code))
                if(Object.keys(userList).length === 0) {
                    clearInterval(timer);
                }
                socket.to(data.code).emit('logout', data.email);
                socket.leave(data.code);
            });
            
            // socket.on("disconnect", () => {
            //     // console.log(socket.id);
            //     // console.log(userList);
            //     console.log(socket.adapter.rooms.get(data.code));
            //     if(Object.keys(userList).length === 0) {
            //         clearInterval(timer);
            //     }
            //     socket.to(data.code).emit('logout', data.email);
            //     socket.leave(data.code);
            // });
        },
        push(data) {
            //console.log(data);
            socket.to(data.code).emit('async', data);
        },
        recordsMerge(data) {
            //console.log('recordsMerge');
            for(let i in clients) {
                if(clients[i].email === data.to) {
                    socket.to(clients[i].id).emit('resRecords', data.record);
                    break;
                }
            }
        },
        resHtml(data) {
            //console.log('resHtml');
            socket.to(data.to).emit('reciveHtml', data.htmls);
        },
        saveBtn(data) {
            //console.log('saveBtn');
            io.of('/index').to(data.code).emit('alert', data);
        }
    });
}