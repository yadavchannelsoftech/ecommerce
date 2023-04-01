
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as crypto from 'crypto-js'
import http from "http";
import { Server, Socket } from "socket.io";

import cart from './cart'
import order_summary from "./order_summary";
import profile from "./profile";


const app = express()
app.use(bodyParser.json())
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();

});



import firebaseConfig from './firebase/firebaseConfig'
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, orderByChild, query, ref, set, update, equalTo, remove } from 'firebase/database';
const configs = initializeApp(firebaseConfig);
const db = getDatabase()



const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})


// sending io to cart 
cart(io)
// sending io to order_summary 
order_summary(io)
// sending io to profile 
profile(io)


server.listen(process.env.PORT, () => {
    console.log('Socket Working...')
})



app.get('/', (req, res) => {
    onValue(ref(db, 'items_details'), (snap) => {
        res.send(snap.val())
    }, {
        onlyOnce: true
    })
})



// Register event listeners for Socket.io connections
io.on('connection', (socket) => {
    console.log('Socket connected');


    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });


    // TO CHECK THE (USER & PASSWORD) & PRIVATE KEY OF APP SENT BY US 
    socket.on('check_key', (data) => {
        let ki = crypto.AES.decrypt(data.key, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8)
        key_checker(ki).then((resolve: any) => {
            socket.emit('check_key', resolve)
            if (data.user.length == 0) {
                socket.emit('check_user', false)
            } else {
                check_user(data.user).then((res1) => {
                    socket.emit('check_user', res1)
                }).catch((rej1) => {
                    socket.emit('check_user', rej1)
                })
            }
        }).catch((rejected) => {
            socket.emit('check_key', rejected)
        })
    })
});




// Validating the encrypted key ///////////////////////////
//.......STARTS....... 
function key_checker(data: any) {
    return new Promise(async (res, rej) => {
        await data;
        if (data == 'eCommerce_project') {
            res(true)
        } else {
            rej(false)
        }
    })
}
//.......ENDS........


//Checking user exist or not //////////////////////////////////////////
//....STARTS....

function check_user(user_decryp_data: any) {
    return new Promise((res, rej) => {
        onValue(ref(db, 'users/'), async (snap) => {
            // to check whether the user exist or not, if exist proceed
            if (snap.hasChild(user_decryp_data) == true) {
                console.log(true)
                res({ valid: true, data: snap.child(user_decryp_data).val() })
            } else {

                console.log(false)
                rej(false)
            }
        }, { onlyOnce: true })
    })
}
//....ENDS....






// // let me take ESIN = 'Ecommerce Standard Identification Number'
// // i.e custom generated id for the product
// // function to check the product exist or not to add items to cart by using generated custom ESIN id
// async function add_cart(data: any) {

//     // this array is used to send all snapshot values obtained from loop
//     let chk: any = []
//     let refs: any = ref(db, 'items_details/categories')
//     await data
//     // console.log(data.data['ESIN'])

//     return new Promise(async (res, rej) => {

//         onValue(refs, async (snap) => {

//             snap.forEach((child) => {
//                 child.child('items_list').forEach((sub_child) => {
//                     chk.push(sub_child.val())
//                 })
//             })

//             let jk = await chk.filter((a: any) => {
//                 return a['ESIN'] === data.data['ESIN']
//             }).slice()


//             if (jk.length < 1) {
//                 rej(false)
//             } else {
//                 jk.map((a: any) => {
//                     // console.log(a,9999)
//                     res(a)
//                 })
//             }

//         }, { onlyOnce: true })
//     })


// }





// app.post('/', (req, res) => {
//     let ki = crypto.AES.decrypt(req.body.stat, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8)

//     // console.log(req.body.data.user)

//     key_checker(ki).then((resolve: any) => {

//         add_cart(req.body.data).then((resolved: any) => {
//             // console.log(resolved, 898989)
//             res.send(resolved)
//         }).catch((reject) => {
//             res.send(reject)
//         })
//         // send_user(req.body.data).then((resolved: any) => {
//         //     res.send(resolved)
//         // }).catch((reject) => {
//         //     res.send(reject)
//         // })

//     }).catch((rejected: any) => {
//         console.log(rejected)
//     })

// })


