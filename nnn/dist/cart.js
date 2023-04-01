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
const crypto = __importStar(require("crypto-js"));
const firebaseConfig_1 = __importDefault(require("./firebase/firebaseConfig"));
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
const configs = (0, app_1.initializeApp)(firebaseConfig_1.default);
const db = (0, database_1.getDatabase)();
let user;
function default_1(io) {
    io.on('connection', (socket) => {
        console.log('user_cart connected');
        socket.on('send_cart', (data) => {
            let user_decryp = crypto.AES.decrypt(data.user_encryp, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8);
            if (user_decryp.length == 0) {
                socket.emit('send_cart', false);
            }
            else {
                send_user(data, user_decryp).then((ress) => {
                    socket.emit('send_cart', ress);
                    product_summary(ress, user_decryp).then((a) => {
                        socket.emit('order_summary', a);
                    }).catch((b) => {
                        socket.emit('order_summary', b);
                    });
                }).catch((rejj) => {
                    socket.emit('send_cart', false);
                });
            }
        });
    });
}
exports.default = default_1;
// function created to check the key sent from angular 
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
// router.get('/', (req, res) => {
//     res.send('Working')
// })
// router.post('/', (req, res) => {
//     send_user(req.body.data).then((ress) => {
//         res.send(ress)
//     }).catch((rejj) => {
//         res.send(rejj)
//     })
// })
// // function to send user to angular 
function send_user(data, user_decryp_data) {
    return __awaiter(this, void 0, void 0, function* () {
        // this array is used to send all snapshot values obtained from loop in CASE 2
        let chk = [];
        let refs_item = (0, database_1.ref)(db, 'items_details/categories');
        let refs_user = (0, database_1.ref)(db, 'users/');
        let ress;
        yield data;
        return new Promise((res, rej) => {
            (0, database_1.onValue)(refs_user, (snap) => __awaiter(this, void 0, void 0, function* () {
                if (snap.hasChild(user_decryp_data) == true) {
                    // to check whether the user exist or not, if exist proceed
                    switch (data.id) {
                        case 1:
                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart`), (snapshot) => {
                                res({ cart_value: Object.values(snapshot.val()) });
                            }, {
                                onlyOnce: true
                            });
                            break;
                        case 2:
                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snapshot) => __awaiter(this, void 0, void 0, function* () {
                                snapshot.forEach((child) => {
                                    chk.push({ id: child.key, val: child.val() });
                                });
                                let jk = yield chk.filter((a) => {
                                    return a.val['ESIN'] === data.data['ESIN'];
                                }).slice();
                                yield jk;
                                switch (jk.length) {
                                    case 0:
                                        // if product doesnot exist in the cart means ..
                                        // then the cart gets updated 
                                        (0, database_1.update)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), {
                                            // adding the cart items 
                                            [data.data['ESIN']]: data.data
                                        }).finally(() => {
                                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                yield snaps.val();
                                                res({ send_item: true, cart_value: Object.values(snaps.val()) });
                                            }), {
                                                onlyOnce: true
                                            });
                                        });
                                        break;
                                    case 1:
                                        jk.map((a) => __awaiter(this, void 0, void 0, function* () {
                                            // //if the checked_item is true then the cart gets updated
                                            var _a;
                                            (0, database_1.update)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/${a.id}`), {
                                                // adding the cart items for the currently present items
                                                'purchase_quantity': ((_a = a === null || a === void 0 ? void 0 : a.val) === null || _a === void 0 ? void 0 : _a.purchase_quantity) + 1
                                            }).finally(() => {
                                                (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                    var _a;
                                                    yield snaps.val();
                                                    res({ send_item: true, cart_value: Object.values(snaps.val()), cart_added: ((_a = a === null || a === void 0 ? void 0 : a.val) === null || _a === void 0 ? void 0 : _a.purchase_quantity) + 1, updated: true });
                                                }), {
                                                    onlyOnce: true
                                                });
                                            });
                                        }));
                                        break;
                                    default:
                                        break;
                                }
                            }), { onlyOnce: true });
                            break;
                        case 3:
                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snapshot) => __awaiter(this, void 0, void 0, function* () {
                                snapshot.forEach((child) => {
                                    chk.push({ id: child.key, val: child.val() });
                                });
                                let jk = yield chk.filter((a) => {
                                    return a.val['ESIN'] === data.data['ESIN'];
                                }).slice();
                                jk.map((a) => __awaiter(this, void 0, void 0, function* () {
                                    var _b;
                                    //if the checked_item is true then the cart gets updated 
                                    if (chk.length <= 1 && a.val.purchase_quantity <= 1) {
                                        (0, database_1.update)((0, database_1.ref)(db, `users/${user_decryp_data}/`), {
                                            // substracting the particular items 
                                            'cart': 0
                                        }).finally(() => {
                                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                // await snaps.val()
                                                res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true });
                                            }), {
                                                onlyOnce: true
                                            });
                                        });
                                    }
                                    else if (a.val.purchase_quantity <= 1) {
                                        (0, database_1.remove)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/${a.id}`)).finally(() => {
                                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                // await snaps.val()
                                                res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true });
                                            }), {
                                                onlyOnce: true
                                            });
                                        });
                                    }
                                    else {
                                        (0, database_1.update)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/${a.id}`), {
                                            // substracting the particular items 
                                            'purchase_quantity': ((_b = a === null || a === void 0 ? void 0 : a.val) === null || _b === void 0 ? void 0 : _b.purchase_quantity) - 1
                                        }).finally(() => {
                                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                // await snaps.val()
                                                res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true });
                                            }), {
                                                onlyOnce: true
                                            });
                                        });
                                    }
                                }));
                            }), {
                                onlyOnce: true
                            });
                            break;
                        case 4:
                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snapshot) => __awaiter(this, void 0, void 0, function* () {
                                snapshot.forEach((child) => {
                                    chk.push({ id: child.key, val: child.val() });
                                });
                                let jk = yield chk.filter((a) => {
                                    return a.val['ESIN'] === data.data['ESIN'];
                                }).slice();
                                jk.map((a) => __awaiter(this, void 0, void 0, function* () {
                                    //if the checked_item is true then the cart gets updated ///////////////
                                    if (chk.length <= 1 && data.custom_count == 0) {
                                        (0, database_1.update)((0, database_1.ref)(db, `users/${user_decryp_data}/`), {
                                            // Clearing the cart items 
                                            'cart': 0
                                        }).finally(() => {
                                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                yield snaps.val();
                                                res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true });
                                            }), {
                                                onlyOnce: true
                                            });
                                        });
                                    }
                                    else if (chk.length >= 1 && data.custom_count == 0) {
                                        (0, database_1.remove)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/${a.id}`)).finally(() => {
                                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                yield snaps.val();
                                                res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true });
                                            }), {
                                                onlyOnce: true
                                            });
                                        });
                                    }
                                    else {
                                        (0, database_1.update)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/${a.id}`), {
                                            // substracting the particular items 
                                            'purchase_quantity': data.custom_count
                                        }).finally(() => {
                                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}/cart/`), (snaps) => __awaiter(this, void 0, void 0, function* () {
                                                yield snaps.val();
                                                res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true });
                                            }), {
                                                onlyOnce: true
                                            });
                                        });
                                    }
                                }));
                            }), {
                                onlyOnce: true
                            });
                            break;
                    }
                }
                else {
                    // if user doesnot exist we send false here to angular
                    rej(false);
                }
            }), {
                onlyOnce: true
            });
        });
    });
}
function product_summary(data, user_decryp_data) {
    return __awaiter(this, void 0, void 0, function* () {
        let subtotal = 0;
        let discount = 0;
        let shipping = 0;
        let subt = [];
        let dis = [];
        let shp = [];
        yield data.cart_value;
        return new Promise((res, rej) => {
            // subtotal 
            data['cart_value'].map((a) => {
                subt += (Number(a.selling_price) * Number(a.purchase_quantity)) - 1;
                dis += ((Number(a.listing_price) - Number(a.selling_price)) * a.purchase_quantity) - 1;
                shp += Number(a.shipping_price) - 1;
                subtotal = (subt++);
                discount = (dis++);
                shipping = (shp++);
            });
            // 111111111111111111111
            if (subt || dis || shp) {
                res({ subtotal: subtotal, discount: discount, shipping: shipping });
                (0, database_1.onValue)((0, database_1.ref)(db, `users/`), (snap) => {
                    if (snap.hasChild(user_decryp_data)) {
                        (0, database_1.update)((0, database_1.ref)(db, `users/${user_decryp_data}/order_summary/`), {
                            subtotal: subtotal + 1,
                            discount: discount + 1,
                            shipping: shipping + 1
                        });
                        // .finally(() => {
                        //     onValue(ref(db, `users/${user}/cart/`), async (snaps) => {
                        //         // await snaps.val()
                        //         res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                        //     }, {
                        //         onlyOnce: true
                        //     })
                        // })
                        console.log(true);
                    }
                    else {
                        console.log(false);
                    }
                }, {
                    onlyOnce: true
                });
            }
            else {
                rej(false);
            }
            // // discount 
            // data.map((a: any) => {
            //     dis += ((Number(a.listing_price) - Number(a.selling_price)) * a.purchase_quantity)
            //     return discount = (dis++)
            // })
            // // shipping charges 
            // data.map((a: any) => {
            //     shp += Number(a.shipping_price)
            //     return shipping = (shp++)
            // })
        });
    });
}
