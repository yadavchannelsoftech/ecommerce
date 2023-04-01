import * as crypto from 'crypto-js'
import firebaseConfig from './firebase/firebaseConfig'
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, orderByChild, query, ref, set, update, equalTo, remove } from 'firebase/database';
const configs = initializeApp(firebaseConfig);
const db = getDatabase()



import { Server, Socket } from "socket.io";



let user: any

export default function (io: Server) {

    io.on('connection', (socket: Socket) => {
        console.log('user_cart connected')


        socket.on('send_cart', (data) => {
            let user_decryp = crypto.AES.decrypt(data.user_encryp, 'U2FsdGVkX18osidz6iEFXRLUuvxnTH9hiN0LQ1BZtUIHbzbX1qkV+YCvJ2Hzprdo'.trim()).toString(crypto.enc.Utf8)
            if (user_decryp.length == 0) {
                socket.emit('send_cart', false)
            } else {
                send_user(data, user_decryp).then((ress: any) => {
                    socket.emit('send_cart', ress)
                    product_summary(ress, user_decryp).then((a: any) => {
                        socket.emit('order_summary', a)
                    }).catch((b: any) => {
                        socket.emit('order_summary', b)
                    })
                }).catch((rejj) => {
                    socket.emit('send_cart', false)
                })
            }
        })


    })
}




// function created to check the key sent from angular 
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
async function send_user(data: any, user_decryp_data: any) {

    // this array is used to send all snapshot values obtained from loop in CASE 2
    let chk: any = []
    let refs_item: any = ref(db, 'items_details/categories')
    let refs_user: any = ref(db, 'users/')
    let ress: any
    await data

    return new Promise((res, rej) => {

        onValue(refs_user, async (snap) => {
            if (snap.hasChild(user_decryp_data)==true) {
                // to check whether the user exist or not, if exist proceed

                switch (data.id) {
                    case 1:
                        onValue(ref(db, `users/${user_decryp_data}/cart`), (snapshot) => {
                            res({ cart_value: Object.values(snapshot.val()) })
                        }, {
                            onlyOnce: true
                        })
                        break;
                    case 2:
                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snapshot) => {

                            snapshot.forEach((child) => {
                                chk.push({ id: child.key, val: child.val() })
                            })


                            let jk = await chk.filter((a: any) => {
                                return a.val['ESIN'] === data.data['ESIN']
                            }).slice()

                            await jk


                            switch (jk.length) {
                                case 0:
                                    // if product doesnot exist in the cart means ..
                                    // then the cart gets updated 
                                    update(ref(db, `users/${user_decryp_data}/cart/`), {
                                        // adding the cart items 
                                        [data.data['ESIN']]: data.data
                                    }).finally(() => {
                                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                            await snaps.val()
                                            res({ send_item: true, cart_value: Object.values(snaps.val()) })
                                        }, {
                                            onlyOnce: true
                                        })
                                    })
                                    break;
                                case 1:

                                    jk.map(async (a: any) => {

                                        // //if the checked_item is true then the cart gets updated

                                        update(ref(db, `users/${user_decryp_data}/cart/${a.id}`), {
                                            // adding the cart items for the currently present items
                                            'purchase_quantity': a?.val?.purchase_quantity + 1
                                        }).finally(() => {
                                            onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                                await snaps.val()
                                                res({ send_item: true, cart_value: Object.values(snaps.val()), cart_added: a?.val?.purchase_quantity + 1, updated: true })
                                            }, {
                                                onlyOnce: true
                                            })
                                        })
                                    })
                                    break;

                                default:
                                    break;
                            }

                        }, { onlyOnce: true })
                        break;

                    case 3:
                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snapshot) => {

                            snapshot.forEach((child) => {
                                chk.push({ id: child.key, val: child.val() })
                            })

                            let jk = await chk.filter((a: any) => {
                                return a.val['ESIN'] === data.data['ESIN']
                            }).slice()


                            jk.map(async (a: any) => {
                                //if the checked_item is true then the cart gets updated 
                                if (chk.length <= 1 && a.val.purchase_quantity <= 1) {
                                    update(ref(db, `users/${user_decryp_data}/`), {
                                        // substracting the particular items 
                                        'cart': 0
                                    }).finally(() => {
                                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                            // await snaps.val()
                                            res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                                        }, {
                                            onlyOnce: true
                                        })
                                    })
                                } else if (a.val.purchase_quantity <= 1) {
                                    remove(ref(db, `users/${user_decryp_data}/cart/${a.id}`)).finally(() => {
                                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                            // await snaps.val()
                                            res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                                        }, {
                                            onlyOnce: true
                                        })
                                    })
                                } else {
                                    update(ref(db, `users/${user_decryp_data}/cart/${a.id}`), {
                                        // substracting the particular items 
                                        'purchase_quantity': a?.val?.purchase_quantity - 1
                                    }).finally(() => {
                                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                            // await snaps.val()
                                            res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                                        }, {
                                            onlyOnce: true
                                        })
                                    })
                                }
                            })

                        }, {
                            onlyOnce: true
                        })
                        break;

                    case 4:
                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snapshot) => {

                            snapshot.forEach((child) => {
                                chk.push({ id: child.key, val: child.val() })
                            })

                            let jk = await chk.filter((a: any) => {
                                return a.val['ESIN'] === data.data['ESIN']
                            }).slice()

                            jk.map(async (a: any) => {

                                //if the checked_item is true then the cart gets updated ///////////////
                                if (chk.length <= 1 && data.custom_count == 0) {
                                    update(ref(db, `users/${user_decryp_data}/`), {
                                        // Clearing the cart items 
                                        'cart': 0
                                    }).finally(() => {
                                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                            await snaps.val()
                                            res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                                        }, {
                                            onlyOnce: true
                                        })
                                    })
                                } else if (chk.length >= 1 && data.custom_count == 0) {
                                    remove(ref(db, `users/${user_decryp_data}/cart/${a.id}`)).finally(() => {
                                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                            await snaps.val()
                                            res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                                        }, {
                                            onlyOnce: true
                                        })
                                    })
                                } else {
                                    update(ref(db, `users/${user_decryp_data}/cart/${a.id}`), {
                                        // substracting the particular items 
                                        'purchase_quantity': data.custom_count
                                    }).finally(() => {
                                        onValue(ref(db, `users/${user_decryp_data}/cart/`), async (snaps) => {
                                            await snaps.val()
                                            res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                                        }, {
                                            onlyOnce: true
                                        })
                                    })
                                }
                            })

                        }, {
                            onlyOnce: true
                        })
                        break;
                }
            } else {
                // if user doesnot exist we send false here to angular
                rej(false)
            }
        }, {
            onlyOnce: true
        })
    })
}







async function product_summary(data: any, user_decryp_data: any) {

    let subtotal: any = 0
    let discount: any = 0
    let shipping: any = 0


    let subt: any = []
    let dis: any = []
    let shp: any = []

    await data.cart_value

    return new Promise((res, rej) => {
        // subtotal 
        data['cart_value'].map((a: any) => {
            subt += (Number(a.selling_price) * Number(a.purchase_quantity)) - 1
            dis += ((Number(a.listing_price) - Number(a.selling_price)) * a.purchase_quantity) - 1
            shp += Number(a.shipping_price) - 1
            subtotal = (subt++)
            discount = (dis++)
            shipping = (shp++)
        })
        // 111111111111111111111
        if (subt || dis || shp) {
            res({ subtotal: subtotal, discount: discount, shipping: shipping })

            onValue(ref(db, `users/`), (snap) => {
                if (snap.hasChild(user_decryp_data)) {

                    update(ref(db, `users/${user_decryp_data}/order_summary/`), {
                        subtotal: subtotal + 1,
                        discount: discount + 1,
                        shipping: shipping + 1
                    })
                    // .finally(() => {
                    //     onValue(ref(db, `users/${user}/cart/`), async (snaps) => {
                    //         // await snaps.val()
                    //         res({ send_item: true, cart_value: Object.values(snaps.val()), updated: true })
                    //     }, {
                    //         onlyOnce: true
                    //     })
                    // })
                    console.log(true)

                } else {
                    console.log(false)
                }
            }, {
                onlyOnce: true
            })

        } else {
            rej(false)
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
    })




}


