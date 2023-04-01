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
function order_summary(io) {
    io.on('connection', (socket) => {
        console.log('order_summary connected');
        socket.on('o_s', (data) => {
            let user_decryp = crypto.AES.decrypt(data.user_encryp, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8);
            if (user_decryp.length == 0) {
                socket.emit('o_s', false);
                return;
            }
            else {
                check_user(user_decryp).then((ress) => {
                    switch (data.id) {
                        case 1:
                            socket.emit('o_s', ress);
                            break;
                        case 2:
                            return add_address(data, user_decryp).then((res1) => {
                                socket.emit('o_s', res1);
                            }).catch((rej1) => {
                                socket.emit('o_s', rej1);
                            });
                            break;
                        case 3:
                            return default_address(data, user_decryp).then((res1) => {
                                socket.emit('o_s', res1);
                            }).catch((rej1) => {
                                socket.emit('o_s', rej1);
                            });
                            break;
                        case 4:
                            return edit_address(data, user_decryp).then((res1) => {
                                socket.emit('o_s', res1);
                            }).catch((rej1) => {
                                socket.emit('o_s', rej1);
                            });
                            break;
                        case 5:
                            return delete_address(data, user_decryp).then((res1) => {
                                socket.emit('o_s', res1);
                            }).catch((rej1) => {
                                socket.emit('o_s', rej1);
                            });
                            break;
                        default:
                            break;
                    }
                }).catch((rejj) => {
                    socket.emit('o_s', false);
                });
            }
        });
    });
}
exports.default = order_summary;
//Checking user exist or not //////////////////////////////////////////
//....STARTS....
function check_user(user_decryp_data) {
    return new Promise((res, rej) => {
        (0, database_1.onValue)((0, database_1.ref)(db, 'users/'), (snap) => __awaiter(this, void 0, void 0, function* () {
            // to check whether the user exist or not, if exist proceed
            if (snap.hasChild(user_decryp_data)) {
                console.log(true);
                (0, database_1.onValue)((0, database_1.ref)(db, `users/${user_decryp_data}`), (snaps) => {
                    res(snaps.val());
                }, { onlyOnce: true });
            }
            else {
                console.log(false);
                rej(false);
            }
        }), { onlyOnce: true });
    });
}
//....ENDS....
//Add address of user //////////////////////////////////////////////
//.......STARTS.........
function add_address(data, data1) {
    return __awaiter(this, void 0, void 0, function* () {
        let random = Math.floor(Math.random() * 999999);
        yield random;
        return new Promise((res, rej) => {
            (0, database_1.onValue)((0, database_1.ref)(db, `users/${data1}/address/`), (snapshot) => {
                snapshot.forEach((a) => {
                    if (a.key == String(random)) {
                        (0, database_1.update)((0, database_1.ref)(db, `users/${data1}/address/${a.key}/`), {
                            default: true
                        });
                    }
                    else {
                        (0, database_1.update)((0, database_1.ref)(db, `users/${data1}/address/${a.key}/`), {
                            default: false
                        });
                    }
                });
            }, { onlyOnce: true });
            (0, database_1.update)((0, database_1.ref)(db, `users/${data1}/address/${random}/`), {
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
                (0, database_1.onValue)((0, database_1.ref)(db, `users/${data1}/`), (snapshots) => {
                    res(snapshots.val());
                }, { onlyOnce: true });
            }).catch(() => {
                rej(false);
            });
        });
    });
}
//......ENDS........
//Default address setter //////////////////////////////////////////
//........STARTS.........
function default_address(data, data1) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            (0, database_1.onValue)((0, database_1.ref)(db, `users/${data1}/address/`), (snapshot) => {
                snapshot.forEach((a) => {
                    // console.log(a.key,data)
                    if (a.key == String(data.data.id)) {
                        // console.log(true)0
                        (0, database_1.update)((0, database_1.ref)(db, `users/${data1}/address/${a.key}/`), {
                            default: true
                        }).then(() => {
                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${data1}/`), (snapshots) => {
                                res(snapshots.val());
                            }, { onlyOnce: true });
                        }).catch(() => {
                            rej(false);
                        });
                    }
                    else {
                        // console.log(false)
                        (0, database_1.update)((0, database_1.ref)(db, `users/${data1}/address/${a.key}/`), {
                            default: false
                        }).then(() => {
                            (0, database_1.onValue)((0, database_1.ref)(db, `users/${data1}/`), (snapshots) => {
                                res(snapshots.val());
                            }, { onlyOnce: true });
                        }).catch(() => {
                            rej(false);
                        });
                    }
                });
            }, { onlyOnce: true });
        });
    });
}
//.......ENDS..........
//Edit address of user //////////////////////////////////////////////
//.......STARTS.........
function edit_address(data, data1) {
    return __awaiter(this, void 0, void 0, function* () {
        // let random = Math.floor(Math.random() * 999999)
        // await random
        console.log(data.ids, 8989);
        return new Promise((res, rej) => {
            (0, database_1.update)((0, database_1.ref)(db, `users/${data1}/address/${data.ids}/`), {
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
                (0, database_1.onValue)((0, database_1.ref)(db, `users/${data1}/`), (snapshots) => {
                    res(snapshots.val());
                }, { onlyOnce: true });
            }).catch(() => {
                rej(false);
            });
        });
    });
}
//......ENDS........
//Remove address of user //////////////////////////////////////////////
//.......STARTS.........
function delete_address(data, data1) {
    return __awaiter(this, void 0, void 0, function* () {
        // let random = Math.floor(Math.random() * 999999)
        // await random
        console.log(data.ids.id, 8989);
        return new Promise((res, rej) => {
            (0, database_1.remove)((0, database_1.ref)(db, `users/${data1}/address/${data.ids.id}/`)).then(() => {
                (0, database_1.onValue)((0, database_1.ref)(db, `users/${data1}/address`), (snapshots) => {
                    console.log(snapshots.val(), 9000);
                }, { onlyOnce: true });
            }).catch(() => {
                rej(false);
            });
        });
    });
}
//......ENDS........
