import * as crypto from 'crypto-js'
import firebaseConfig from './firebase/firebaseConfig'
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, orderByChild, query, ref, set, update, equalTo, remove } from 'firebase/database';
const configs = initializeApp(firebaseConfig);
const db = getDatabase()

import { Server, Socket } from "socket.io";

export default function order_summary(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('order_summary connected')

        socket.on('o_s', (data) => {
            let user_decryp = crypto.AES.decrypt(data.user_encryp, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8)

            if (user_decryp.length == 0) {
                socket.emit('o_s', false)
                return;
            } else {
                check_user(user_decryp).then((ress: any) => {
                    switch (data.id) {
                        case 1:
                            socket.emit('o_s', ress)
                            break;
                        case 2:
                            return add_address(data, user_decryp).then((res1: any) => {
                                socket.emit('o_s', res1)
                            }).catch((rej1: any) => {
                                socket.emit('o_s', rej1)
                            })
                            break;
                        case 3:
                            return default_address(data, user_decryp).then((res1: any) => {
                                socket.emit('o_s', res1)
                            }).catch((rej1: any) => {
                                socket.emit('o_s', rej1)
                            })
                            break;
                        case 4:
                            return edit_address(data, user_decryp).then((res1: any) => {
                                socket.emit('o_s', res1)
                            }).catch((rej1: any) => {
                                socket.emit('o_s', rej1)
                            })
                            break;
                        case 5:
                            return delete_address(data, user_decryp).then((res1: any) => {
                                socket.emit('o_s', res1)
                            }).catch((rej1: any) => {
                                socket.emit('o_s', rej1)
                            })
                            break;
                        default:
                            break;
                    }

                }).catch((rejj) => {
                    socket.emit('o_s', false)
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




//Add address of user //////////////////////////////////////////////
//.......STARTS.........

async function add_address(data: any, data1: any) {
    let random = Math.floor(Math.random() * 999999)
    await random

    return new Promise((res, rej) => {
        onValue(ref(db, `users/${data1}/address/`), (snapshot) => {
            snapshot.forEach((a) => {
                if (a.key == String(random)) {
                    update(ref(db, `users/${data1}/address/${a.key}/`), {
                        default: true
                    })
                } else {
                    update(ref(db, `users/${data1}/address/${a.key}/`), {
                        default: false
                    })
                }
            })
        }, { onlyOnce: true })

        update(ref(db, `users/${data1}/address/${random}/`), {
            address: data.data.address,
            name: data.data.f_name,
            email: data.data.email,
            phone_number: data.data.p_number,
            pincode: data.data.pincode,
            address_type: data.address_type,
            city: data.city,
            country: data.country,
            id: random,
            default: true
        }).then(() => {
            onValue(ref(db, `users/${data1}/`), (snapshots) => {
                res(snapshots.val())
            }, { onlyOnce: true })
        }).catch(() => {
            rej(false)
        })
    })
}
//......ENDS........






//Default address setter //////////////////////////////////////////
//........STARTS.........

async function default_address(data: any, data1: any) {
    return new Promise((res, rej) => {
        onValue(ref(db, `users/${data1}/address/`), (snapshot) => {
            snapshot.forEach((a) => {
                // console.log(a.key,data)
                if (a.key == String(data.data.id)) {
                    // console.log(true)0
                    update(ref(db, `users/${data1}/address/${a.key}/`), {
                        default: true
                    }).then(() => {
                        onValue(ref(db, `users/${data1}/`), (snapshots) => {
                            res(snapshots.val())
                        }, { onlyOnce: true })
                    }).catch(() => {
                        rej(false)
                    })
                } else {
                    // console.log(false)
                    update(ref(db, `users/${data1}/address/${a.key}/`), {
                        default: false
                    }).then(() => {
                        onValue(ref(db, `users/${data1}/`), (snapshots) => {
                            res(snapshots.val())
                        }, { onlyOnce: true })
                    }).catch(() => {
                        rej(false)
                    })
                }
            })
        }, { onlyOnce: true })
    })
}
//.......ENDS..........





//Edit address of user //////////////////////////////////////////////
//.......STARTS.........

async function edit_address(data: any, data1: any) {
    // let random = Math.floor(Math.random() * 999999)
    // await random

    console.log(data.ids, 8989)

    return new Promise((res, rej) => {
        update(ref(db, `users/${data1}/address/${data.ids}/`), {
            address: data.data.address,
            name: data.data.f_name,
            email: data.data.email,
            phone_number: data.data.p_number,
            pincode: data.data.pincode,
            address_type: data.address_type,
            city: data.city,
            country: data.country,
            default: true
        }).then(() => {
            onValue(ref(db, `users/${data1}/`), (snapshots) => {
                res(snapshots.val())
            }, { onlyOnce: true })
        }).catch(() => {
            rej(false)
        })
    })
}
//......ENDS........



//Remove address of user //////////////////////////////////////////////
//.......STARTS.........

async function delete_address(data: any, data1: any) {
    // let random = Math.floor(Math.random() * 999999)
    // await random

    console.log(data.ids.id, 8989)

    return new Promise((res, rej) => {
        remove(ref(db, `users/${data1}/address/${data.ids.id}/`)).then(() => {
            onValue(ref(db, `users/${data1}/address`), (snapshots) => {
                console.log(snapshots.val(), 9000)
            }, { onlyOnce: true })
        }).catch(() => {
            rej(false)
        })
    })
}
//......ENDS........