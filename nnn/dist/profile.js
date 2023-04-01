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
function profile(io) {
    io.on('connection', (socket) => {
        console.log('profile connected');
        socket.on('profile', (data) => {
            let user_decryp = crypto.AES.decrypt(data.user_encryp, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8);
            if (user_decryp.length == 0) {
                socket.emit('profile', false);
            }
            else {
                check_user(user_decryp).then((datas) => {
                    switch (data.id) {
                        case 1:
                            city().then((res) => {
                                socket.emit('profile', res);
                            });
                            break;
                        case 2:
                            account_delete(data.user_id).then((res) => {
                                socket.emit('profile', res);
                            }).catch((rej) => {
                                socket.emit('profile', rej);
                            });
                            break;
                        default:
                            break;
                    }
                }).catch((error) => {
                    socket.emit('profile', { name: '' });
                });
            }
        });
    });
}
exports.default = profile;
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
function city() {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        let city = [];
        (0, database_1.onValue)((0, database_1.ref)(db, 'city/'), (snap) => {
            snap.forEach((child) => {
                city.push(child.val());
            });
            res(city);
        }, { onlyOnce: true });
    }));
}
function account_delete(data) {
    return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
        (0, database_1.remove)((0, database_1.ref)(db, `users/${data}/`)).then((res1) => {
            res(true);
        }).catch((rej1) => {
            rej(false);
        });
    }));
}
