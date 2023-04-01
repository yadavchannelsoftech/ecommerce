"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const crypto = __importStar(require("crypto-js"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cart_1 = __importDefault(require("./cart"));
const order_summary_1 = __importDefault(require("./order_summary"));
const profile_1 = __importDefault(require("./profile"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
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
const firebaseConfig_1 = __importDefault(require("./firebase/firebaseConfig"));
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
const configs = (0, app_1.initializeApp)(firebaseConfig_1.default);
const db = (0, database_1.getDatabase)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// sending io to cart 
(0, cart_1.default)(io);
// sending io to order_summary 
(0, order_summary_1.default)(io);
// sending io to profile 
(0, profile_1.default)(io);
server.listen(process.env.PORT, () => {
    console.log('Socket Working...');
});
app.get('/', (req, res) => {
    (0, database_1.onValue)((0, database_1.ref)(db, 'items_details'), (snap) => {
        res.send(snap.val());
    }, {
        onlyOnce: true
    });
});
// Register event listeners for Socket.io connections
io.on('connection', (socket) => {
    console.log('Socket connected');
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });
    // TO CHECK THE (USER & PASSWORD) & PRIVATE KEY OF APP SENT BY US 
    socket.on('check_key', (data) => {
        let ki = crypto.AES.decrypt(data.key, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8);
        key_checker(ki).then((resolve) => {
            socket.emit('check_key', resolve);
            if (data.user.length == 0) {
                socket.emit('check_user', false);
            }
            else {
                check_user(data.user).then((res1) => {
                    socket.emit('check_user', res1);
                }).catch((rej1) => {
                    socket.emit('check_user', rej1);
                });
            }
        }).catch((rejected) => {
            socket.emit('check_key', rejected);
        });
    });
});
// Validating the encrypted key ///////////////////////////
//.......STARTS....... 
function key_checker(data) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        yield data;
        if (data == 'eCommerce_project') {
            res(true);
        }
        else {
            rej(false);
        }
    }));
}
//.......ENDS........
//Checking user exist or not //////////////////////////////////////////
//....STARTS....
function check_user(user_decryp_data) {
    return new Promise((res, rej) => {
        (0, database_1.onValue)((0, database_1.ref)(db, 'users/'), (snap) => __awaiter(this, void 0, void 0, function* () {
            // to check whether the user exist or not, if exist proceed
            if (snap.hasChild(user_decryp_data) == true) {
                console.log(true);
                res({ valid: true, data: snap.child(user_decryp_data).val() });
            }
            else {
                console.log(false);
                rej(false);
            }
        }), { onlyOnce: true });
    });
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
