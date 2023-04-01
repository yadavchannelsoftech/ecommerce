import * as crypto from 'crypto-js'
import firebaseConfig from './firebase/firebaseConfig'
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, orderByChild, query, ref, set, update, equalTo, remove, child } from 'firebase/database';
const configs = initializeApp(firebaseConfig);
const db = getDatabase()

import { Server, Socket } from "socket.io";


export default function profile(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('profile connected')

        socket.on('profile', (data) => {
            let user_decryp = crypto.AES.decrypt(data.user_encryp, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8)
            if (user_decryp.length == 0) {
                socket.emit('profile', false)
            } else {
                check_user(user_decryp).then((datas) => {
                    switch (data.id) {
                        case 1:
                            city().then((res) => {
                                socket.emit('profile', res)
                            })
                            break;
                        case 2:
                            account_delete(data.user_id).then((res) => {
                                socket.emit('profile', res)
                            }).catch((rej) => {
                                socket.emit('profile', rej)
                            })
                            break;
                        default:
                            break;
                    }
                }).catch((error) => {
                    socket.emit('profile', { name: '' })
                })
            }
        })


    })
}


//Checking user exist or not //////////////////////////////////////////
//....STARTS....

function check_user(user_decryp_data: any) {
    return new Promise((res, rej) => {
        onValue(ref(db, 'users/'), async (snap) => {
            // to check whether the user exist or not, if exist proceed
            if (snap.hasChild(user_decryp_data)) {
                console.log(true)
                onValue(ref(db, `users/${user_decryp_data}`), (snaps) => {
                    res(snaps.val())
                }, { onlyOnce: true })
            } else {
                console.log(false)
                rej(false)
            }
        }, { onlyOnce: true })
    })
}
//....ENDS....



function city() {
    return new Promise(async (res, rej) => {
        let city: any = []
        onValue(ref(db, 'city/'), (snap) => {
            snap.forEach((child) => {
                city.push(child.val())
            })
            res(city)
        }, { onlyOnce: true })
    })
}


function account_delete(data: any) {
    return new Promise(async (res, rej) => {
        remove(ref(db, `users/${data}/`)).then((res1) => {
            res(true)
        }).catch((rej1) => {
            rej(false)
        })
    })
}