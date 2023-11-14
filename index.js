const TelegramApi = require('node-telegram-bot-api');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const { Op } = require('sequelize');

// импорты
const {
    mainMenuOptions,
    toMainMenuOptions,
    settingsOptions,
    chooseCityOptions,
    sendOptions,
    SPB_fromToSendOptions,
    MSK_fromToSendOptions,
    SPB_whereToSendOptions,
    MSK_whereToSendOptions,
    SPB_whereGetOptions, 
    MSK_whereGetOptions,
    commentOptions,
    iAmDriverOptions,
    MSK_subDivisionOptions,
    SPB_subDivisionOptions,
    MSK_sendMessageOptions,
    SPB_sendMessageOptions,
    sendMessageOptions,
    MSK_takeOptions,
    SPB_takeOptions
} = require('./options');
const sequelize = require('./db');
const { UserModel, MoveModel } = require('./models');

const ignoreCommands =  '/mainmenu/mymovements/abilitys/updatelist/settings';

// ======================================================================================================================================
// функция создания нового пользователя =================================================================================================
// ======================================================================================================================================

async function createNewUser(chatId, msg) {
    
    const newUser = await UserModel.create({chatId});

    const user = await UserModel.findOne({
        where: {
            chatId: chatId
        },
        attributes: [
            'id', 
            'chatId', 
            'lastCommand', 
            'userName', 
        ]
    });

    return user.update({
        userName: '/passwordcheck', 
    });
};

// ======================================================================================================================================
// функция проверки пароля ==============================================================================================================
// ======================================================================================================================================

async function chekPassword(chatId, msg) {
    let text = msg.text;
    
    const user = await UserModel.findOne({
        where: {
            chatId: chatId
        }, 
        attributes: [
            'id', 
            'chatId', 
            'lastCommand', 
        ]
    });

    if (text === bot_password) {

        await user.update({
            lastCommand: '/editName', 
            userName: '/editName'
        }, {
            where: {
                chatId: chatId,
            }
        })

        return bot.sendMessage(
            chatId, 
            `Приветcтвую!\n<b>Как вас зовут</b>?\n<i>Имя Фамилия</i>`,
            { parse_mode: 'HTML' }
        );

    } else {

        return bot.sendMessage(
            chatId, 
            `В доступе отказано.\nВведите пароль:`
        );
    }
}

const editName = async (chatId) => {

    const user = await UserModel.findOne({
        where: {
            chatId: chatId
        },
        attributes: [
            'id',
            'chatId',
            'lastCommand'
        ]
    });

    await user.update({
        lastCommand: '/editName'
    }, {
        where: {
            chatId: chatId
        }
    })

    return bot.sendMessage(
        chatId,
        `Введите пожалуйста ваши Имя и Фамилию:`,
        toMainMenuOptions
    );

}

const editCity = async (chatId) => {

    const user = await UserModel.findOne({
        where: {
            chatId: chatId
        },
        attributes: [
            'id',
            'chatId',
            'lastCommand'
        ]
    });

    return bot.sendMessage(
        chatId,
        `В каком городе вы работаете?`,
        chooseCityOptions
    );

}

// ======================================================================================================================================
// старт работы программы ===============================================================================================================
// ======================================================================================================================================

async function start() {
    
    console.log('Бот запущен')

    try {

        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Подключение к базе данных установлено');

    } catch (e) {

        console.log('Ошибка подключения к базе данных')
    }

    bot.onText(/\/start/, async msg => {
        const chatId = msg.chat.id;
        let user = null;

        try {

            user = await UserModel.findOne( {
                where: {
                    chatId: chatId
                }
            });

            if (user) {

                if (user.userName !== '/passwordcheck') {
                    
                    await user.update({
                        lastCommand: null
                    }, {
                        where: {
                            chatId: chatId
                        }
                    })

                    return bot.sendMessage(
                        chatId,
                        `Мы уже знакомы, ${user.userName}`
                    );
                }

            } else {

                await createNewUser(chatId, msg);

                return bot.sendMessage(
                    chatId,
                    `Введите пароль:`
                );
            } 

        } catch (e) {
            
            console.log('Ошибка при создании нового пользователя', e);
        }
    });

    bot.onText(/\/mymovements/, async msg => {
        const chatId = msg.chat.id;

        const movements = await MoveModel.findAll({
            where: {
                whoSend: {
                    [Op.like]: `%${chatId}%`
                },
                delivered: {
                    [Op.or]: [`Нет`, `В пути`]
                }
            }
        })

        if ( movements.length > 0 ) {

            movements.forEach( async (movement) => {
                        
                await bot.sendMessage(
                    chatId,
                    `<pre>${movement.moveId}</pre>\nОткуда: ${movement.fromToSend}\nКуда: ${movement.whereToSend}\nКому: ${movement.toWhomToSend}\nЧто: ${movement.whatToSend}`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: JSON.stringify( {
                            inline_keyboard: [
                                [ { text: 'Добавить фото', callback_data: `addPhoto=${movement.moveId}` } ],
                                [ { text: 'Посмотреть фото', callback_data: `showPhoto=${movement.moveId}` } ],
                            ]
                        })
                    }
                );
    
            });

        } else { 

            return bot.sendMessage(
                chatId,
                `Актуальных перемещений созданных вами нет.`
            )

        }
    });

    bot.onText(/\/settings/, async msg => {
        const chatId = msg.chat.id;

        const user = await UserModel.findOne({
            where: {
                chatId: chatId
            },
            attributes: [
                'id',
                'chatId',
                'lastCommand',
                'userName'
            ]
        });

        if (user.userName !== '/passwordcheck') {

            await user.update({
                lastCommand: null
            }, {
                where: {
                    chatId: chatId
                }
            })

            return bot.sendMessage(
                chatId,
                'Настройки:',
                settingsOptions
            );
        }
    });

    // для тестирования
    bot.onText(/\/x/, async msg => {
        const chatId = msg.chat.id;

        // lc = null; 
        const user = await UserModel.findOne({
            where: {
                chatId: chatId
            },
            attributes: [
                'id', 
                'chatId', 
                'lastCommand'
            ]
        });

        await user.update({lastCommand: null}, {
            where: {
                chatId: chatId
            }
        })

    });

    // слушатель сообщений ==========================================================================

    bot.on( 'message', async msg => {
        const chatId = msg.chat.id;
        let text = msg.text;

        console.log(msg);

        let user = await UserModel.findOne({
            where: {
                chatId: chatId
            }
        });

        try {

            if ( user ) {

                if ( msg.document ) {
                    let file_name = msg.document.file_name;

                    if ( file_name === 'config.cfg' ) {

                        let fileName = `config.cfg`;

                        return bot.getFile(msg.document.file_id).then((file) => {
                            const fileStream = bot.getFileStream(file.file_id);
                            fileStream.pipe(fs.createWriteStream(`/root/shift/${fileName}`));   // Сохраняем файл Linux
                            // fileStream.pipe(fs.createWriteStream(`C:\\node.js\\shift\\photo\\${fileName}`));   // Сохраняем файл Win
                            fileStream.on('end', () => {
                                bot.sendMessage(
                                    chatId, 
                                    `Файл <b>${fileName}</b>\nуспешно сохранен.`, 
                                    { parse_mode: 'HTML' }
                                );
                            });
                        });

                    }

                } else if (msg.photo) {

                    if (user.moveId.toLowerCase().includes(`msk`) ||
                        user.moveId.toLowerCase().includes(`spb`)
                    ) {
                        
                        // const movements = await MoveModel.findAll({
                        //     where: {
                        //         delivered: 'Нет'
                        //     }
                        // });

                        // if ( movements.includes(user.moveId) ) {

                            let fileName = `${user.moveId}.${Date.now()}.jpg`; // Генерируем уникальное имя файла
                            
                            return bot.getFile(msg.photo[msg.photo.length - 1].file_id).then((file) => {
                                const fileStream = bot.getFileStream(file.file_id);
                                fileStream.pipe(fs.createWriteStream(`/root/shift/photo/${fileName}`)); // Сохраняем файл в папку photo Linux
                                // fileStream.pipe(fs.createWriteStream(`C:\\node.js\\shift\\photo\\${fileName}`)); // Сохраняем файл в папку photo Win
                                fileStream.on('end', () => {
                                    bot.sendMessage(
                                        chatId, 
                                        `Фото <b>${fileName}</b>\nуспешно сохранено.`, 
                                        toMainMenuOptions
                                    );
                                });
                            });

                        // } else {

                        //     return bot.sendMessage(
                        //         chatId,
                        //         `Перемещение ${user.moveId} уже доставлено.\nВыберите другое перемещение.`
                        //     );

                        // }

                    } else {

                        return bot.sendMessage(
                            chatId,
                            `Сначала создайте перемещение.`
                        );

                    }

                } else if ( user.userName === '/passwordcheck' ) {

                    return chekPassword(chatId, msg);

                } else if( user.lastCommand === '/editName' ) {

                    await user.update({
                        userName: text,
                        lastCommand: null
                    }, {
                        where: {
                            chatId: chatId
                        }
                    });

                    await bot.sendMessage(
                        chatId,
                        `Теперь я буду называть вас "<b>${user.userName}</b>"`,
                        { parse_mode: 'HTML'}
                    );
                    
                    if ( !user.city ) {

                        await bot.sendMessage(
                            chatId,
                            `В каком городе вы работаете:`,
                            chooseCityOptions
                        );

                    }

                } else if ( text === '/mainmenu' ) {

                    await user.update({lastCommand: text}, {
                        where: {
                            chatId: chatId
                        }
                    });

                    return bot.sendMessage(
                        chatId, 
                        `Вы в главном меню, ${user.userName}\nВаш персональный id: <code>${chatId}</code>\nВаше подразделение: ${user.subdivision}`,
                        mainMenuOptions
                    ); 

                } else if (
                    user.lastCommand === '/toWhomToSend' &&
                    !ignoreCommands.includes(text)
                ) {

                    await user.update({
                        toWhomToSend: text
                    }, {
                        where: {
                            chatId: chatId
                        }
                    });
    
                    user = await UserModel.findOne({
                        where: {
                            chatId: chatId
                        },
                        attributes: [
                            'id',
                            'chatId',
                            'fromToSend',
                            'whereToSend',
                            'toWhomToSend',
                            'whatToSend',
                        ]
                    });
                    
                    return bot.sendMessage(
                        chatId,
                        `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                        sendOptions
                    );

                } else if ( 
                    user.lastCommand === '/whatToSend' &&
                    !ignoreCommands.includes(text)
                    ) {

                    await user.update({
                        whatToSend: text
                    }, {
                        where: {
                            chatId: chatId
                        }
                    });
    
                    user = await UserModel.findOne({
                        where: {
                            chatId: chatId
                        },
                        attributes: [
                            'id',
                            'chatId',
                            'fromToSend',
                            'whereToSend',
                            'toWhomToSend',
                            'whatToSend',
                        ]
                    });
                    
                    return bot.sendMessage(
                        chatId,
                        `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                        sendOptions
                    );

                } else if (
                    user.lastCommand === '/commentMovement' &&
                    !ignoreCommands.includes(text)
                    ) {

                    await user.update({
                        lastCommand: null
                    }, {
                        where: {
                            chatId: chatId
                        }
                    });

                    const movement = await MoveModel.findOne({
                        where: {
                            moveId: user.moveId
                        }
                    });
                    
                    await movement.update({
                        comment: text
                    });

                    const sender = movement.whoSend;
                    const senderID = sender.split("=")[1];
                    const senderName = sender.split("=")[0];

                    await bot.sendMessage(
                        senderID,
                        `Пользователь <b>${user.userName}</b> оставил замечание по перемещению ${user.moveId}:\n\n<pre>${text}</pre>`,
                        { parse_mode: 'HTML' }
                    );

                    return bot.sendMessage(
                        chatId,
                        `Ваше замечание сохранено отправлено отправителю <b>${senderName}</b>.`,
                        { parse_mode: 'HTML' }
                    );

                } else if ( user.lastCommand.includes('sendMessage') ) {

                    const idRecipient = user.lastCommand.split('=')[1];
                    const nameRecipient = user.lastCommand.split('=')[2];
                    const sender = `${user.userName}`;
                    
                    if (idRecipient === `ALL`) {
                        
                        const subDivision = user.lastCommand.split("=")[2];

                        const users = await UserModel.findAll({
                            where: {
                                subdivision: subDivision
                            }
                        });


                        users.forEach( async (user) => {
    
                            await bot.sendMessage(
                                user.chatId,
                                `Пользователь <b>${sender}</b> попросил меня отправить вам следующее сообщение:\n\n<pre>${text}</pre>`,
                                { parse_mode: 'HTML',
                                reply_markup: JSON.stringify( {
                                    inline_keyboard: [
                                        [ {text: 'Написать ответ', callback_data: `reply=${chatId}=${sender}`}]
                                    ]
                                })
                            });

                        });

                    } else {

                        await bot.sendMessage(
                            idRecipient,
                            `Пользователь <b>${sender}</b> попросил меня отправить вам следующее сообщение:\n\n<pre>${text}</pre>`,
                            { parse_mode: 'HTML',
                            reply_markup: JSON.stringify( {
                                inline_keyboard: [
                                    [ {text: 'Написать ответ', callback_data: `reply=${chatId}=${sender}`}]
                                ]
                            })
                        });

                    }

                    return bot.sendMessage(
                        chatId,
                        `Cообщение для <b>${nameRecipient}</b> отправлено!`,
                        { parse_mode: 'HTML' }
                    );

                } else if ( user.lastCommand.includes(`reply`) ) {

                    
                    const idUserForReply = user.lastCommand.split("=")[1];
                    const nameUserForReply = user.lastCommand.split('=')[2];
                    
                    await bot.sendMessage(
                        idUserForReply,
                        `Ответ от пользователя <b>${user.userName}</b>:\n\n<pre>${text}</pre>`,
                        { parse_mode: 'HTML',
                            reply_markup: JSON.stringify( {
                                inline_keyboard: [
                                    [ {text: 'Написать ответ', callback_data: `reply=${chatId}=${user.userName}`}]
                                ]
                            })
                        }
                    );
                        
                    await user.update({
                        lastCommand: null
                    }, {
                        where: {
                            chatId: chatId
                        }
                    });

                    return bot.sendMessage(
                        chatId,
                        `Ответное сообщение пользователю <b>${nameUserForReply}</b> отправлено!`,
                        { parse_mode: 'HTML' }
                    );
                }

            } else {

                if (!user) {
                    await createNewUser(chatId, msg);
                }

                return chekPassword(chatId, msg);
            }

        } catch (e) {
            console.log('Ошибка в слушателе сообщений.', e);
        }
    })
    
    // слушатель колбэков ==================================================================================================================
    
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
    
        
        let user = await UserModel.findOne({
            where: {
                chatId: chatId
            }
        });

        console.log(msg);

        try {
    
            if ( data === '/mainMenu' ) {
               
                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                });
                
                return bot.sendMessage(
                    chatId, 
                    `Вы в главном меню, <b>${user.userName}</b>\nВаш персональный id: <code>${chatId}</code>`,
                    mainMenuOptions
                ); 
                    
            } else if ( data === '/movementList' ) {
                    
                const movements = await MoveModel.findAll({
                    where: {
                        delivered: {
                            [Op.or]: ['Нет', 'В пути']
                        }
                    }
                });
                
                if ( movements.length > 0 ) {

                    let message = '';

                    movements.forEach( async (movement) => {
                        
                        if ( movement.moveId.includes(user.city) ) {

                            message += `<code>${movement.moveId}</code> ${movement.fromToSend} <b>=></b> ${movement.whereToSend}\n`
                            
                            if ( movement.delivered === 'В пути' ) {

                                const nameDriver = movement.whoDriver.split("=")[0];

                                message += `<i>забрал водитель ${nameDriver}</i>\n`
                            }
                        }

                    });

                    if ( message ) {

                        return bot.sendMessage(
                            chatId,
                            message,
                            iAmDriverOptions
                        );

                    } else {

                        return bot.sendMessage(
                            chatId,
                            `На данный момент перемещений нет.`,
                            iAmDriverOptions
                        );

                    }

                } else {

                    if ( user.city === 'MSK' ) {

                        return bot.sendMessage(
                            chatId,
                            `Актуальных задач на перемещение в Москве нет.`
                        );

                    } else {

                        return bot.sendMessage(
                            chatId,
                            `Актуальных задач на перемещение в Санкт-Петербурге нет`
                        );
                    }

                }

            } else if (data === '/takenMovement') {

                const movements = await MoveModel.findAll({
                    where: {
                        delivered: 'В пути',
                        whoDriver: {
                            [Op.like]: `%${chatId}%`
                        }
                    }
                });

                if ( movements.length > 0 ) {

                    let message = '';

                    movements.forEach( async (movement) => {
                        
                        if ( movement.moveId.includes(user.city) ) {

                            message += `<code>${movement.moveId}</code> ${movement.fromToSend} <b>=></b> ${movement.whereToSend}\n`
                            
                        }

                    });

                    if (message) {

                        return bot.sendMessage(
                            chatId,
                            message,
                            iAmDriverOptions
                        );

                    } else {

                        return bot.sendMessage(
                            chatId,
                            `На данный момент перемещений нет.`,
                            iAmDriverOptions
                        );

                    }
                } else {

                    return bot.sendMessage(
                        chatId,
                        `У вас на руках пока нет ни одного актуального перемещения.`
                    );

                }

            } else if ( data.includes('sendMessage') ) {

                if ( data === '/sendMessage' ) {

                    if ( user.city === 'MSK' ) {
    
                        return bot.sendMessage(
                            chatId,
                            `Выберите подразделение к которому принадлежит ваш адресат:`,
                            sendMessageOptions
                        );
    
                    } else {
    
                        return bot.sendMessage(
                            chatId,
                            `Выберите подразделение к которому принадлежит ваш адресат:`,
                            sendMessageOptions
                        );
    
                    }

                } else if ( data.includes(`sendMessageWho`) ) {

                    await user.update({
                        lastCommand: data
                    }, {
                        where: {
                            chatId: chatId
                        }
                    });

                    const recipient = data.split("=")[2];
                    
                    return bot.sendMessage(
                        chatId,
                        `Напишите сообщение которое хотите отправить через меня для пользователя <b>${recipient}</b>:`,
                        { parse_mode: 'HTML' }
                    );
                
                } else {

                    const subDivision = data.split('=')[1];

                    const users = await UserModel.findAll({
                        where: {
                            subdivision: subDivision
                        }
                    });

                    await bot.sendMessage(
                        chatId,
                        `<i>Нажмите кнопку <b>Написать на ${subDivision}</b> под этим сообщением, если хотите уведомить <b>ВСЕХ</b> сотрудников подразделения "<b>${subDivision}</b>"</i>`,
                        { parse_mode: 'HTML',
                            reply_markup: JSON.stringify( {
                                inline_keyboard: [
                                    [ {text: `Написать на ${subDivision}`, callback_data: `sendMessageWhoALL=ALL=${subDivision}`}]
                                ]
                            })
                        }
                    );

                    users.forEach( async (user) => {

                        return bot.sendMessage(
                            chatId,
                            `Написать личное сообщение для:\n<b>${user.userName}</b>\nПодразделение <b>${user.subdivision}</b>`,
                            { parse_mode: 'HTML',
                            reply_markup: JSON.stringify( {
                                inline_keyboard: [
                                    [ {text: 'Написать ему', callback_data: `sendMessageWho=${user.chatId}=${user.userName}`}]
                                ]
                            })
                        });

                    })

                }

            } else if ( data.includes('reply') ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                });

                const nameUserForReply = data.split("=")[2];

                return bot.sendMessage(
                    chatId,
                    `Напишите Ваш ответ пользователю <b>${nameUserForReply}</b>:`,
                    { parse_mode: 'HTML' }
                );

            } else if ( data.includes('delivered') ) {

                const deliveredMoveId = data.split('=')[1];

                const movement = await MoveModel.findOne({
                    where: {
                        moveId: deliveredMoveId
                    }
                });

                await movement.update({
                    delivered: 'Да',
                });

                await user.update({
                    moveId: deliveredMoveId
                }, {
                    where: {
                        chatId: chatId
                    }
                });
                
                const senderID = movement.whoSend.split("=")[1];
                
                await bot.sendMessage(
                    senderID,
                    `Пользователь <b>${user.userName}</b> принял ваше перемещение <b>${deliveredMoveId}</b> на "<b>${user.subdivision}</b>"`,
                    { parse_mode: 'HTML' }
                );

                return bot.sendMessage(
                    chatId,
                    `Перемещение <b>${deliveredMoveId}</b> принято вами.`,
                    commentOptions
                );

            } else if ( data.includes('taked') ) {

                const takedMoveId = data.split('=')[1];
                
                const movement = await MoveModel.findOne({
                    where: {
                        moveId: takedMoveId
                    }
                });
                
                await movement.update({
                    whoDriver: `${user.userName}=${user.chatId}`,
                    delivered: `В пути`
                });
                
                await bot.sendMessage(
                    chatId,
                    `Вы подтвердли, что забрали перемещение <code>${takedMoveId}</code>.`,
                    { parse_mode: 'HTML' }
                );
                    
                const senderChatId = movement.whoSend.split('=')[1];
                
                return bot.sendMessage(
                    senderChatId,
                    `Водитель <b>${user.userName}</b> забрал ваше перемещение <b>${takedMoveId}</b> из подразделения "<b>${movement.fromToSend}</b>".`,
                    { parse_mode: 'HTML' }
                );


            } else if ( data.includes('takeMovement') ) {

                if (data === '/takeMovement') {

                    if ( user.city === 'MSK' ) {
    
                        await bot.sendMessage(
                            chatId,
                            `Укажите место <b>ГДЕ</b> вы забираете перемещение:`,
                            MSK_takeOptions
                        );
    
                    } else {
    
                        await bot.sendMessage(
                            chatId,
                            `Укажите место <b>ГДЕ</b> вы забираете перемещение:`,
                            SPB_takeOptions
                        );
    
                    }

                } else {

                    const dataWhereTake = data.split('=')[1];

                    const movements = await MoveModel.findAll({
                        where: {
                            fromToSend: dataWhereTake,
                            delivered: 'Нет',
                            whoDriver: null
                        }
                    }); 

                    if ( movements.length > 0 ) {

                        movements.forEach( async (movement) => {

                            await bot.sendMessage(
                                chatId,
                                `<pre>${movement.moveId}</pre>\nОткуда: ${movement.fromToSend}\nКуда: ${movement.whereToSend}\nКому: ${movement.toWhomToSend}\nЧто: ${movement.whatToSend}`,
                                {
                                    parse_mode: 'HTML',
                                    reply_markup: JSON.stringify( {
                                        inline_keyboard: [
                                            [ { text: 'Забрал', callback_data: `taked=${movement.moveId}` } ],
                                            [ { text: 'Посмотреть фото груза', callback_data: `showPhoto=${movement.moveId}` } ],
                                        ]
                                    })
                                }
                            );

                        });

                    } else {

                        return bot.sendMessage(
                            chatId,
                            `Отсюда (${dataWhereTake}) нечего забирать.`
                        );

                    }
                
                }

            } else if ( data === '/send' ) {
                
                return bot.sendMessage(
                    chatId,
                    `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                    sendOptions
                )
    
            } else if ( data.includes('fromToSend') ) {
    
                if (data === '/fromToSend') {
    
                    if (user.city === 'MSK') {
        
                        return bot.sendMessage(
                            chatId,
                            `Выберите место <b>ОТКУДА</b> хотите отправить груз:`,
                            MSK_fromToSendOptions
                        )
        
                    } else {
        
                        return bot.sendMessage(
                            chatId,
                            `Выберите место <b>ОТКУДА</b> хотите отправить груз:`,
                            SPB_fromToSendOptions
                        )
        
                    } 
    
                } else {
    
                    const dataFromToSend = data.split('=')[1];
    
                    await user.update({
                        fromToSend: dataFromToSend
                    }, {
                        where: {
                            chatId: chatId
                        }
                    })
    
                    user = await UserModel.findOne({
                        where: {
                            chatId: chatId
                        },
                        attributes: [
                            'id',
                            'chatId',
                            'fromToSend',
                            'whereToSend',
                            'toWhomToSend',
                            'whatToSend',
                        ]
                    });

                    return bot.sendMessage(
                        chatId,
                        `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                        sendOptions
                    ) 
    
                }
    
            } else if ( data.includes('whereToSend') ) {
    
                if ( data === '/whereToSend' ) {
    
                    if ( user.city === 'MSK' ) {
    
                        return bot.sendMessage(
                            chatId,
                            `Выберите место <b>КУДА</b> хотите отправить груз:`,
                            MSK_whereToSendOptions
                        )
                        
                    } else {
    
                        return bot.sendMessage(
                            chatId,
                            `Выберите место <b>КУДА</b> хотите отправить груз:`,
                            SPB_whereToSendOptions
                        )
    
                    } 
    
                } else {
    
                    const dataWhereToSend = data.split('=')[1];
    
                    await user.update({
                        whereToSend: dataWhereToSend
                    }, {
                        where: {
                            chatId: chatId
                        }
                    })
    
                    user = await UserModel.findOne({
                        where: {
                            chatId: chatId
                        },
                        attributes: [
                            'id',
                            'chatId',
                            'fromToSend',
                            'whereToSend',
                            'toWhomToSend',
                            'whatToSend',
                        ]
                    });
                    
                    return bot.sendMessage(
                        chatId,
                        `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                        sendOptions
                    )
    
                }
    
            } else if ( data === '/toWhomToSend' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                })

                return bot.sendMessage(
                    chatId,
                    `Напишите <b>КОМУ</b> вы хотите отправить:`,
                    { parse_mode: 'HTML' }
                )

            } else if ( data === '/whatToSend' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                })

                return bot.sendMessage(
                    chatId,
                    `Опишите <b>ЧТО</b> вы хотите отправить:`,
                    { parse_mode: 'HTML' }
                )

            } else if ( data === '/createMovement' ) {

                const maxId = await MoveModel.max('id');
                const newMoveId = `${user.city}${maxId + 1}`;

                await MoveModel.create({
                    moveId: `${newMoveId}`,
                    fromToSend: user.fromToSend,
                    whereToSend: user.whereToSend,
                    toWhomToSend: user.toWhomToSend,
                    whatToSend: user.whatToSend,
                    whoSend: `${user.userName}=${user.chatId}`,
                    delivered: 'Нет'
                })
               
                await user.update({
                    moveId:  `${newMoveId}`
                }, {
                    where: {
                        chatId: chatId
                    }
                })

                return bot.sendMessage(
                    chatId,
                    `Перемещение ${newMoveId} создано!\nЕсли хотите прикрепить фото к перемещению ${newMoveId}, просто отправьте мне их сейчас.`,
                    { parse_mode: 'HTML' }
                );

            } else if ( data.includes('whereGet') ) {

                if (data === '/whereGet') {

                    if ( user.city === 'MSK' ) {
    
                        await bot.sendMessage(
                            chatId,
                            `Укажите место <b>ГДЕ</b> вы получаете груз:`,
                            MSK_whereGetOptions
                        )
    
                    } else {
    
                        await bot.sendMessage(
                            chatId,
                            `Укажите место <b>ГДЕ</b> вы получаете груз:`,
                            SPB_whereGetOptions
                        )
    
                    }

                } else {

                    const dataWhereGet = data.split('=')[1];

                    const movements = await MoveModel.findAll({
                        where: {
                            whereToSend: dataWhereGet,
                            delivered: 'В пути'
                        }
                    });

                    if ( movements.length > 0 ) {

                        movements.forEach( async (movement) => {

                            await bot.sendMessage(
                                chatId,
                                `<pre>${movement.moveId}</pre>\nОткуда: ${movement.fromToSend}\nКуда: ${movement.whereToSend}\nКому: ${movement.toWhomToSend}\nЧто: ${movement.whatToSend}`,
                                {
                                    parse_mode: 'HTML',
                                    reply_markup: JSON.stringify( {
                                        inline_keyboard: [
                                            [ { text: 'Получено', callback_data: `delivered=${movement.moveId}` } ],
                                            [ { text: 'Посмотреть фото', callback_data: `showPhoto=${movement.moveId}` } ],
                                        ]
                                    })
                                }
                            )

                        });

                    } else {

                        return bot.sendMessage(
                            chatId,
                            `Перемещений на ${dataWhereGet} нет.`
                        );

                    }
                
                }

            } else if ( data.includes('addPhoto') ) {

                const moveIdForPhoto = data.split("=")[1];

                await user.update({
                    moveId: moveIdForPhoto
                });

                return bot.sendMessage(
                    chatId,
                    `Если хотите прикрепить фото к перемещению ${moveIdForPhoto}, просто отправьте мне их сейчас.`
                );

            } else if ( data.includes('showPhoto') ) {

                const moveId = data.split("=")[1];

                fs.readdir(`/root/shift/photo/`, (err, files) => {

                    if (err) {
                      console.error('Error reading directory:', err);
                      return;
                    }

                    const photosToSend = files.filter(file => file.includes(`${moveId}`));

                    if (photosToSend.length > 0) {

                        photosToSend.forEach(photo => {

                            bot.sendPhoto(
                                chatId, 
                                `/root/shift/photo/${photo}`, { caption: `Фото по перемещению: ${moveId}` }
                            );

                        });

                    } else {

                        bot.sendMessage(
                            chatId, 
                            'Фото не найдены'
                        );

                    }
                });

            } else if ( data === '/iamDriver' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                });

                return bot.sendMessage(
                    chatId,
                    `Меню водителя:`,
                    iAmDriverOptions
                );

            } else if ( data === '/commentMovement' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                });

                return bot.sendMessage(
                    chatId,
                    `Напишите свое замечание по данному перемещению:`
                );

            } else if ( data.includes('chooseCity' ) ) {
    
                const chosenCity = data.split('=')[1];
    
                await user.update({
                    city: chosenCity
                }, {
                    where: {
                        chatId: chatId
                    }
                });
    
                await bot.sendMessage(
                    chatId,
                    `Ваш город <b>${chosenCity}</b>`,
                    { parse_mode: 'HTML' }
                );

                if (user.city === 'MSK') {

                    return bot.sendMessage(
                        chatId,
                        `В каком подразделении вы работаете:`,
                        MSK_subDivisionOptions
                    )

                } else {

                    return bot.sendMessage(
                        chatId,
                        `В каком подразделении вы работаете:`,
                        SPB_subDivisionOptions
                    );

                }
    
            } else if (data.includes('subDivision')) {

                const subDivision = data.split('=')[1];

                await user.update({
                    subdivision: subDivision
                });

                return bot.sendMessage(
                    chatId,
                    `Ваше подразделение <b>${subDivision}</b>`,
                    toMainMenuOptions
                );

            } else if ( data === '/editName' ) {
    
                return editName(chatId);
    
            } else if ( data === '/editCity' ) {

                return editCity(chatId);

            }
    
        } catch (e) {

            console.log(e);
            return bot.sendMessage(
                chatId,
                'Ошибка в исполнении кода прослушивателя колбэков',
            );
        }
    
    });

}

// ======================================================================================================================================
// инициализация бота 
// ======================================================================================================================================

function readConfigSync() {
    const data = fs.readFileSync('/root/shift/config.cfg', 'utf-8'); // для рабочей версии
    // const data = fs.readFileSync('C:\\node.js\\shift\\config.cfg', 'utf-8'); // для тестовой версии
    const lines = data.split('\n');
    const config = {};
  
    lines.forEach(line => {
        const [key, value] = line.trim().split('=');
        config[key] = value;
    });
  
    return config;
}
const config = readConfigSync();

const bot_token = config.bot_token; // присвоение глобальной константе значения токена
const bot_password = config.bot_password // присвоение глобальной константе значения пароля

const bot = new TelegramApi(bot_token, {
    polling: {
        interval: 300, //между запросами с клиента на сервер тг "млсек"
        autoStart: true, //обработка всех команд отправленых до запуска программы
        params: {
            timeout:10 //таймаут между запросами "млсек"
        }
    }
});

// меню команд
bot.setMyCommands([
    {command: '/mainmenu', description:'Главное меню'},
    {command: '/mymovements', description:'Ваши актуальные перемещения'},
    {command: '/settings', description:'Настройки'},
    {command: '/updatelist', description:'Список обновлений'},
    {command: '/abilitys', description:'Актуальные функции бота'},
]);
start();