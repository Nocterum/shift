const TelegramApi = require('node-telegram-bot-api');
const moment = require('moment');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const { Op } = require('sequelize');

// импорты
const {
    mainMenuUsersOptions,
    mainMenuDriversOptions,
    toMainMenuOptions,
    toMainMenu1Options,
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
    MSK_subDivisionOptions,
    SPB_subDivisionOptions,
    MSK_sendMessageOptions,
    SPB_sendMessageOptions,
    sendMessageOptions,
    MSK_takeOptions,
    SPB_takeOptions
} = require('./options');

const {
    mainMenuUsersReply_markup,
    mainMenuDriversReply_markup,
    toMainMenuReply_markup,
    toMainMenu1Reply_markup,
    settingsReply_markup,
    chooseCityReply_markup,
    sendReply_markup,
    SPB_fromToSendReply_markup,
    MSK_fromToSendReply_markup,
    SPB_whereToSendReply_markup,
    MSK_whereToSendReply_markup,
    SPB_whereGetReply_markup,
    MSK_whereGetReply_markup,
    commentReply_markup,
    MSK_subDivisionReply_markup,
    SPB_subDivisionReply_markup,
    MSK_sendMessageReply_markup,
    SPB_sendMessageReply_markup,
    sendMessageReply_markup,
    SPB_takeReply_markup,
    MSK_takeReply_markup,
    editReply_markup
} = require('./reply_markup');

const sequelize = require('./db');
const { UserModel, MoveModel } = require('./models');

const ignoreCommands =  '/mainmenu/mymovements/abilitys/updatelist/settings'; // Команды которые надо игнорировать
botMsgIdx = {};    //айди последнего сообщения от бота


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
            },
            order: [['id', 'DESC']]
        })

        let user = await UserModel.findOne({
            where: {
                chatId: chatId
            }
        });

        //Запись ID следующего сообщения 
        await user.update({
            messageId: msg.message_id += 1
        }, {
            where: {
                    chatId: chatId
                }
            }
        );


        if ( movements.length > 0 ) {

            let i = 0; // Модификатор messageId

            for (const movement of movements) {

                let nextMessageId = user.messageId + i;

                const createdDateTime = moment.utc(movement.createdAt).utcOffset('+03:00').format('DD.MM.YY HH:mm');
                const updatedDateTime = moment.utc(movement.updatedAt).utcOffset('+03:00').format('DD.MM.YY HH:mm');

                let message = `<code>${movement.moveId}</code> от ${createdDateTime}\nОткуда: ${movement.fromToSend}\nКуда: ${movement.whereToSend}\nКому: ${movement.toWhomToSend}\nЧто: ${movement.whatToSend}\n`;

                if ( movement.delivered === 'Нет' ) {

                    message += `\nСтатус: Ожидает водителя в точке отправления`

                } else if ( movement.delivered === 'В пути' ) {

                    message += `\nИстория:\n${movement.comment}`

                }

                await bot.sendMessage(
                    chatId,
                    message,
                    {
                        parse_mode: 'HTML',
                        reply_markup: JSON.stringify( {
                            inline_keyboard: [
                                [ { text: 'Добавить фото', callback_data: `addPhoto=${movement.moveId}` }, { text: 'Посмотреть фото', callback_data: `showPhoto=${movement.moveId}` } ],
                                [ { text: 'Редактировать', callback_data: `editMovement=${movement.moveId}=${nextMessageId}`}, { text: 'Отменить', callback_data: `cancelMovement=${movement.moveId}=${nextMessageId}`} ],
                            ]
                        })
                    }
                );
                i++; // +1 к значению модификатора после одной итерации
            };
            return;

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

        await user.update({lastCommand: '/x'}, {
            where: {
                chatId: chatId
            }
        })

        try {


        } catch (e) {
            
            console.log(e);
            return bot.sendMessage(
                chatId,
                `Возникла ошибка в исполнении кода поиска Ultrawood:\n${e}`
            );
        }

    });

        // обновления
        bot.onText(/\/updatelist/, (msg) => {
            const chatId = msg.chat.id;
    
        bot.sendMessage(chatId,
        `<b>Версия 2.0
        Что нового:</b>

        Новый принцип работы интерфейса: теперь его обновление осуществляется благодаря
        функции edit, а не send, что делает интерфейс динамичным, обновляющимся лишь в одном сообщении,
        а не статичным, обновление которого происходило отправкой нового сообщения.

        Изменения для отправителей: Теперь появилась возможность редактировать и отменять уже созданные перемещения.
        Кнопка "Ваши актуальные перемещения" и её опции "Редактировать" "Отменить".

        Изменения для водителей: теперь полностью корректно работает кнопка "Перемещения которые я забрал" 
        и её опции "сдал на склад" и "доставил". Теперь водитель может самостоятельно может зафиксировать факт передачи ответсвенности.

        -----------------------------------------------------
        <b>Версия 1.5
        Что нового:</b>

        Исправлен баг из-за которого не самоочищалось поле "Куда";
        Тепреь создать перемещение с пустыми полями не получится;
        Теперь меню "Водителя" доступно только водителям,
        Для остальных пользователей кнопка "Я водитель" заменилась
        на "Задания на перемещения";
        Изменена логика поиска и выгрузки фото;
        -----------------------------------------------------
        <b>Версия 1.2
        Что нового:</b>

        Теперь форма для создания перемещения самоочищается
        при создании перемещения.
        `,
                { parse_mode: 'HTML' }
            );
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
                        
                        let fileName = `${user.moveId}.${Date.now()}.jpg`; // Генерируем уникальное имя файла
                        
                        return bot.getFile(msg.photo[msg.photo.length - 1].file_id).then((file) => {
                            const fileStream = bot.getFileStream(file.file_id);
                            fileStream.pipe(fs.createWriteStream(`/root/shift/photo/${fileName}`)); // Сохраняем файл в папку photo Linux
                            // fileStream.pipe(fs.createWriteStream(`C:\\node.js\\shift\\photo\\${fileName}`)); // Сохраняем файл в папку photo Win
                            fileStream.on('end', () => {
                                bot.sendMessage(
                                    chatId, 
                                    `Фото <b>${fileName}</b>\nуспешно сохранено.`, 
                                    toMainMenu1Options
                                );
                            });
                        });

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

                    await user.update({
                        lastCommand: text,
                        messageId: msg.message_id += 1,
                    }, {
                        where: {
                            chatId: chatId
                        }
                    });

                    if ( user.subDivision === 'Водитель' ) {

                        return bot.sendMessage(
                            chatId, 
                            `Вы в главном меню, ${user.userName}\nВаш персональный id: <code>${chatId}</code>\nВаше подразделение: ${user.subDivision}`,
                            mainMenuDriversOptions
                        );

                    } else {

                        return bot.sendMessage(
                            chatId, 
                            `Вы в главном меню, ${user.userName}\nВаш персональный id: <code>${chatId}</code>\nВаше подразделение: ${user.subDivision}`,
                            mainMenuUsersOptions
                        );

                    }

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
                            'messageId'
                        ]
                    });
                                                                
                    if ( user.messageId ) {
                        await bot.deleteMessage(chatId, msg.message_id);
                        
                        //Редактировать сообщение при наличии id сообщения
                        return bot.editMessageText(
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`, 
                            {
                                chat_id: chatId,
                                message_id: user.messageId,
                                parse_mode: 'HTML',
                                reply_markup: sendReply_markup,
                            }
                        );

                    } else {
                        //Запись ID следующего сообщения 
                        await user.update({
                            messageId: msg.message_id += 1
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        return bot.sendMessage(
                            chatId,
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                            sendOptions
                        );
                    }

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
                            'messageId'
                        ]
                    });
                                            
                    if ( user.messageId ) { 
                        await bot.deleteMessage(chatId, msg.message_id);

                        //Редактировать сообщение при наличии id сообщения
                        return bot.editMessageText(
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`, 
                            {
                                chat_id: chatId,
                                message_id: user.messageId,
                                parse_mode: 'HTML',
                                reply_markup: sendReply_markup,
                            }
                        );

                    } else {
                        //Запись ID следующего сообщения 
                        await user.update({
                            messageId: msg.message_id += 1
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        return bot.sendMessage(
                            chatId,
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                            sendOptions
                        );
                    }

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
                        comment: `${movement.comment}\n//Комментарий: ${text}`
                    });

                    const sender = movement.whoSend;
                    const senderID = sender.split("=")[1];
                    const senderName = sender.split("=")[0];

                    
                    await bot.sendMessage(
                        chatId,
                        `Ваше замечание сохранено отправлено отправителю <b>${senderName}</b>.`,
                        { parse_mode: 'HTML' }
                    );
                    
                    return bot.sendMessage(
                        senderID,
                        `Пользователь <b>${user.userName}</b> оставил замечание по перемещению ${user.moveId}:\n\n<pre>${text}</pre>`,
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
                                subDivision: subDivision
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
                
                if ( user.subDivision === 'Водитель' ) {

                    return bot.sendMessage(
                        chatId, 
                        `Вы в главном меню, ${user.userName}\nВаш персональный id: <code>${chatId}</code>\nВаше подразделение: ${user.subDivision}`,
                        mainMenuDriversOptions
                    );

                } else {

                    return bot.sendMessage(
                        chatId, 
                        `Вы в главном меню, ${user.userName}\nВаш персональный id: <code>${chatId}</code>\nВаше подразделение: ${user.subDivision}`,
                        mainMenuUsersOptions
                    );

                }
                    
            } else if ( data === '/movementList' ) {
                    
                const movements = await MoveModel.findAll({
                    where: {
                        delivered: {
                            [Op.or]: ['Нет', 'В пути']
                        }
                    },
                    order: [['id', 'DESC']]
                });
                
                if ( movements.length > 0 ) {

                    let message = '';
                    const messages = []; 
                    
                    for (const movement of movements) {
                        
                        if ( movement.moveId.includes(user.city) ) {
                            
                            const createdDateTime = moment.utc(movement.createdAt).utcOffset('+03:00').format('DD.MM.YY HH:mm');
                            const updatedDateTime = moment.utc(movement.updatedAt).utcOffset('+03:00').format('DD.MM.YY HH:mm');

                            if ( movement.delivered === 'В пути' ) {

                                const nameDriver = movement.whoDriver.split("=")[0];
                                messages.push(`<code>${movement.moveId}</code> от ${createdDateTime}\n<b>${movement.fromToSend} => ${movement.whereToSend}</b>\n--<i>забрал водитель ${nameDriver}\n${updatedDateTime}</i>`);

                            } else {
                                messages.push(`<code>${movement.moveId}</code> от ${createdDateTime}\n<b>${movement.fromToSend} => ${movement.whereToSend}</b>`);
                            }
                        }

                    };
                    message = messages.join(`\n\n`);

                    if ( message ) {

                        if (user.subDivision === 'Водитель') {

                            if ( user.messageId ) { 
                                //Редактировать сообщение при наличии id сообщения
                                return bot.editMessageText(
                                    message, 
                                    {
                                        chat_id: chatId,
                                        message_id: user.messageId,
                                        parse_mode: 'HTML',
                                        reply_markup: mainMenuDriversReply_markup,
                                    }
                                );
        
                            } else {
                                //Запись ID следующего сообщения 
                                await user.update({
                                    messageId: msg.message.message_id += 1
                                }, {
                                    where: {
                                            chatId: chatId
                                        }
                                    }
                                );
        
                                return bot.sendMessage(
                                    chatId,
                                    message,
                                    mainMenuDriversOptions
                                );
                            }

                        } else {

                            if ( user.messageId ) { 
                                //Редактировать сообщение при наличии id сообщения
                                return bot.editMessageText(
                                    message, 
                                    {
                                        chat_id: chatId,
                                        message_id: user.messageId,
                                        parse_mode: 'HTML',
                                        reply_markup: mainMenuUsersReply_markup,
                                    }
                                );
        
                            } else {
                                //Запись ID следующего сообщения 
                                await user.update({
                                    messageId: msg.message.message_id += 1
                                }, {
                                    where: {
                                            chatId: chatId
                                        }
                                    }
                                );
        
                                return bot.sendMessage(
                                    chatId,
                                    message,
                                    mainMenuUsersOptions
                                );
                            }
                        }

                    } else {

                        if (user.subDivision === 'Водитель') {

                            return bot.sendMessage(
                                chatId,
                                `На данный момент перемещений нет.`,
                                mainMenuDriversOptions
                            );

                        } else {

                            return bot.sendMessage(
                                chatId,
                                `На данный момент перемещений нет.`,
                                mainMenuUsersOptions
                            );

                        }

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
                    },
                    order: [['id', 'DESC']]
                });

                if ( movements.length > 0 ) {

                    for (const movement of movements) {
                        let message = '';

                        const createdDateTime = moment.utc(movement.createdAt).utcOffset('+03:00').format('DD.MM.YY HH:mm');

                        if ( movement.moveId.includes(user.city) ) {

                            message +=`<code>${movement.moveId}</code> от ${createdDateTime}\n<b>${movement.fromToSend} => ${movement.whereToSend}</b>\n`;
                            
                        }

                        if (message) {
                            
                            await bot.sendMessage(
                                chatId,
                                message,
                                {
                                    parse_mode: 'HTML',
                                    reply_markup: JSON.stringify( {
                                        inline_keyboard: [
                                            [ { text: 'Сдал на склад', callback_data: `dropToStorage=${movement.moveId}` }, { text: 'Доставил', callback_data: `drop=${movement.moveId}` } ],
                                        ]
                                    })
                                }
                            );
                                
                        } else {

                            return bot.editMessageText(
                                `У вас на руках пока нет ни одного актуального перемещения.`,
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: mainMenuDriversReply_markup
                                }
                            );
                                    
                        }
                    };

                } else {

                    return bot.editMessageText(
                        `У вас на руках пока нет ни одного актуального перемещения.`,
                        {
                            chat_id: chatId,
                            message_id: user.messageId,
                            parse_mode: 'HTML',
                            reply_markup: mainMenuDriversReply_markup
                        }
                    );

                }

            } else if ( data.includes('editMovement') ) {

                await user.update({
                    lastCommand: `/editMovement`
                }, {
                    where: {
                        chatId: chatId
                    }
                });

                const dataMoveId = data.split("=")[1];
                const dataMessageId = data.split("=")[2];
                // Читаем все данные редактируемого перемещения
                const movement = await MoveModel.findOne({
                    where: {
                        moveId: dataMoveId
                    }
                });
                // Заполняем переменные пользователя значениями редактируемого перемещения
                await user.update({
                    fromToSend: movement.fromToSend,
                    whereToSend: movement.whereToSend,
                    toWhomToSend: movement.toWhomToSend,
                    whatToSend: movement.whatToSend,
                    moveId: movement.moveId,
                    messageId: movement.messageId
                }, {
                    where: {
                            chatId: chatId
                        }
                    }
                );
                // Обновляем только что записанные данные в переменной user
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

                const createdDateTime = moment.utc(movement.createdAt).utcOffset('+03:00').format('DD.MM.YY HH:mm');
                
                await bot.editMessageText(
                    `<code>${movement.moveId}</code> от ${createdDateTime}\nОткуда: ${movement.fromToSend}\nКуда: ${movement.whereToSend}\nКому: ${movement.toWhomToSend}\nЧто: ${movement.whatToSend}\n`,
                    {
                        chat_id: chatId,
                        message_id: dataMessageId,
                        parse_mode: 'HTML',
                        reply_markup: sendReply_markup
                    }
                );

            } else if ( data.includes('cancelMovement') ) {

                const dataMoveId = data.split("=")[1];
                const dataMessageId = data.split("=")[2];
                // Читаем все данные редактируемого перемещения
                const movement = await MoveModel.findOne({
                    where: {
                        moveId: dataMoveId
                    }
                });
                // Заполняем переменные пользователя значениями редактируемого перемещения
                await movement.update({
                    delivered: `Отменен`,
                    comment: `Отменен создателем`,
                });

                return bot.editMessageText(
                    `Перемещение <b>${dataMoveId}</b> отменено.`, 
                    {
                        chat_id: chatId,
                        message_id: dataMessageId,
                        parse_mode: 'HTML',
                    }
                );

            } else if ( data.includes('sendMessage') ) {

                if ( data === '/sendMessage' ) {

                    return bot.editMessageText(
                        `Выберите подразделение к которому принадлежит ваш адресат:`,
                        {
                            chat_id: chatId,
                            message_id: user.messageId,
                            parse_mode: 'HTML',
                            reply_markup: sendMessageReply_markup
                        }
                    );
    
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
                            subDivision: subDivision
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
                            `Написать личное сообщение для:\n<b>${user.userName}</b>\nПодразделение <b>${user.subDivision}</b>`,
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
                const takaedMoveIdMessageId = data.split('=')[2];

                const movement = await MoveModel.findOne({
                    where: {
                        moveId: deliveredMoveId
                    }
                });

                const currentDateTime = moment().utcOffset('+03:00').format('DD.MM.YY HH:mm');

                await movement.update({
                    delivered: 'Да',
                    comment: `${movement.comment}${currentDateTime} Получил ${user.userName};\n`
                });

                await user.update({
                    moveId: deliveredMoveId
                }, {
                    where: {
                        chatId: chatId
                    }
                });
                
                const senderID = movement.whoSend.split("=")[1];
                
                
                await bot.editMessageText(
                    `Перемещение <b>${deliveredMoveId}</b> принято вами.`,
                    {
                        chat_id: chatId,
                        message_id: takaedMoveIdMessageId,
                        parse_mode: 'HTML',
                        reply_markup: commentReply_markup
                    }
                );

                return bot.sendMessage(
                    senderID,
                    `Пользователь <b>${user.userName}</b> принял ваше перемещение <b>${deliveredMoveId}</b> на "<b>${user.subDivision}</b>"`,
                    { parse_mode: 'HTML' }
                );

            } else if ( data.includes('taked') ) {

                const takedMoveId = data.split('=')[1];
                const takaedMoveIdMessageId = data.split('=')[2];

                const movement = await MoveModel.findOne({
                    where: {
                        moveId: takedMoveId
                    }
                });

                const currentDateTime = moment().utcOffset('+03:00').format('DD.MM.YY HH:mm');

                await movement.update({
                    comment: `${movement.comment}${currentDateTime} Забрал ${user.userName};\n`,
                    whoDriver: `${user.userName}=${user.chatId}`,
                    delivered: `В пути`
                });
                                                

                //Редактировать сообщение при наличии id сообщения
                await bot.editMessageText(
                    `Вы подтвердли, что забрали перемещение <code>${takedMoveId}</code>.`, 
                    {
                        chat_id: chatId,
                        message_id: takaedMoveIdMessageId,
                        parse_mode: 'HTML',
                    }
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
                                        
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Укажите место <b>ГДЕ</b> вы забираете перемещение:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: MSK_takeReply_markup,
                                }
                            );

                        } else {

                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Укажите место <b>ГДЕ</b> вы забираете перемещение:`,
                                MSK_takeOptions
                            );
                        }

                    } else {
                                            
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Укажите место <b>ГДЕ</b> вы забираете перемещение:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: SPB_takeReply_markup,
                                }
                            );

                        } else {

                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Укажите место <b>ГДЕ</b> вы забираете перемещение:`,
                                SPB_takeOptions
                            );
                        }
                    }

                } else {

                    const dataWhereTake = data.split('=')[1];
                    
                    const movements = await MoveModel.findAll({
                        where: {
                                fromToSend: {
                                    [Op.or]: [
                                        { [Op.like]: `%${dataWhereTake}%` }
                                    ]
                                },
                                delivered: 'Нет',
                                whoDriver: null
                            },
                            order: [['id', 'DESC']]
                        });


                    const user = await UserModel.findOne({
                        where: {
                            chatId: chatId
                        },
                        attributes: [
                            'id',
                            'chatId',
                            'lastCommand',
                            'userName',
                            'messageId'
                        ]
                    });
                    
                    if ( movements.length > 0 ) {
                        
                        let i = 0; // Объявление переменной-счетчика итераций
                        const takeMenu = user.messageId;
                        

                        //Запись ID следующего сообщения                      
                        await user.update({
                            messageId: msg.message.message_id += 1
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        for (const movement of movements) {
                            
                            let nextMessageId = user.messageId + i; // Добавление в модификатора к messageId
                            const createdDateTime = moment.utc(movement.createdAt).utcOffset('+03:00').format('DD.MM.YY HH:mm');

                            await bot.sendMessage(
                                chatId,
                                `<strong>${movement.moveId}</strong> от ${createdDateTime}\nОткуда: ${movement.fromToSend}\nКуда: ${movement.whereToSend}\nКому: ${movement.toWhomToSend}\nЧто: ${movement.whatToSend}`,
                                {
                                    parse_mode: 'HTML',
                                    reply_markup: JSON.stringify( {
                                        inline_keyboard: [
                                            [ { text: 'Забрал', callback_data: `taked=${movement.moveId}=${nextMessageId}` } ],
                                            [ { text: 'Посмотреть фото груза', callback_data: `showPhoto=${movement.moveId}=${nextMessageId}` } ],
                                        ]
                                    })
                                }
                            );
                            i++; // Счетчик +1 в конце очередной итерации
                        };
                        return bot.deleteMessage(chatId, takeMenu);
                        
                    } else {

                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Отсюда (${dataWhereTake}) нечего забирать.`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Отсюда (${dataWhereTake}) нечего забирать.`
                            );
                        }
                    }
                
                }

            } else if ( data.includes('drop') ) {

                if ( data.includes('dropToStorage') ) {

                    const dropedToStorageMoveId = data.split("=")[1];

                    const movement = await MoveModel.findOne({
                        where: {
                            moveId: dropedToStorageMoveId
                        }
                    });
    
                    const currentDateTime = moment().utcOffset('+03:00').format('DD.MM.YY HH:mm');
                    
                    if ( movement.whereToSend === 'Центральный склад' ) {

                        await movement.update({
                            comment: `${movement.comment}${currentDateTime} Доставил на склад ${user.userName};\n`,
                            delivered: 'Да',
                        });

                    } else {

                        await movement.update({
                            comment: `${movement.comment}${currentDateTime} Сдал на склад ${user.userName};\n`,
                            delivered: 'Нет',
                            fromToSend: `Центральный склад (${movement.fromToSend})`,
                            whoDriver: null
                        });

                    }
                    
                    await bot.sendMessage(
                        chatId,
                        `Вы подтвердли, что сдали на склад перемещение <code>${dropedToStorageMoveId}</code>.`,
                        { parse_mode: 'HTML' }
                    );
                        
                    const senderChatId = movement.whoSend.split('=')[1];
                    
                    return bot.sendMessage(
                        senderChatId,
                        `Водитель <b>${user.userName}</b> сдал на склад перемещение <b>${dropedToStorageMoveId}</b>.`,
                        { parse_mode: 'HTML' }
                    );
    
                } else {

                    const dropedMoveId = data.split("=")[1];

                    const movement = await MoveModel.findOne({
                        where: {
                            moveId: dropedMoveId
                        }
                    });
    
                    const currentDateTime = moment().utcOffset('+03:00').format('DD.MM.YY HH:mm');
    
                    await movement.update({
                        comment: `${movement.comment}${currentDateTime} Доставил ${user.userName};\n`,
                        whoDriver: user.userName
                    });
    
                    await bot.sendMessage(
                        chatId,
                        `Вы подтвердли, что доставили перемещение <code>${dropedMoveId}</code>, но чтобы закрыть перемещение его должны принять.`,
                        { parse_mode: 'HTML' }
                    );
                        
                    const senderChatId = movement.whoSend.split('=')[1];
                    
                    return bot.sendMessage(
                        senderChatId,
                        `Водитель <b>${user.userName}</b> доставил перемещение <b>${dropedMoveId}</b>.`,
                        { parse_mode: 'HTML' }
                    );

                }
                
            } else if ( data === '/send' ) {
                
                if ( user.messageId ) {

                    //Редактировать сообщение при наличии id сообщения
                    return bot.editMessageText(
                        `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`, 
                        {
                            chat_id: chatId,
                            message_id: user.messageId,
                            parse_mode: 'HTML',
                            reply_markup: sendReply_markup,
                        }
                    );

                } else {
                    //Запись ID следующего сообщения                      
                    await user.update({
                        messageId: msg.message.message_id += 1
                    }, {
                        where: {
                                chatId: chatId
                            }
                        }
                    );

                    return bot.sendMessage(
                        chatId,
                        `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                        sendOptions
                    );
                }
    
            } else if ( data.includes('fromToSend') ) {
    
                if (data === '/fromToSend') {

                    if (user.city === 'MSK') {
                        
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Выберите место <b>ОТКУДА</b> хотите отправить груз:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: MSK_fromToSendReply_markup,
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Выберите место <b>ОТКУДА</b> хотите отправить груз:`,
                                MSK_fromToSendOptions
                            );
                        }
                            
                    } else {

                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии ID сообщения
                            return bot.editMessageText(
                                `Выберите место <b>ОТКУДА</b> хотите отправить груз:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: SPB_fromToSendReply_markup,
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Выберите место <b>ОТКУДА</b> хотите отправить груз:`,
                                SPB_fromToSendOptions
                            );
                        }
                    } 
                        
                } else {
    
                    const dataFromToSend = data.split('=')[1];
    
                    await user.update({
                        fromToSend: dataFromToSend
                    }, {
                        where: {
                                chatId: chatId
                            }
                        }
                    );
    
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
                            'messageId'
                        ]
                    });

                    if ( user.messageId ) { 
                        //Редактировать сообщение при наличии id сообщения
                        return bot.editMessageText(
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`, 
                            {
                                chat_id: chatId,
                                message_id: user.messageId,
                                parse_mode: 'HTML',
                                reply_markup: sendReply_markup,
                            }
                        );

                    } else {
                        //Запись ID следующего сообщения    
                        await user.update({
                            messageId: msg.message.message_id += 1
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        return bot.sendMessage(
                            chatId,
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                            sendOptions
                        );
                    }
                }
    
            } else if ( data.includes('whereToSend') ) {
    
                if ( data === '/whereToSend' ) {
    
                    if ( user.city === 'MSK' ) {
                            
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Выберите место <b>КУДА</b> хотите отправить груз:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: MSK_whereToSendReply_markup,
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Выберите место <b>КУДА</b> хотите отправить груз:`,
                                MSK_whereToSendOptions
                            );
                        }
                        
                    } else {
                        if ( user.messageId ) {
                            //Редактировать сообщение при наличии ID сообщения
                            return bot.editMessageText(
                                `Выберите место <b>ОТКУДА</b> хотите отправить груз:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: SPB_whereToSendReply_markup,
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Выберите место <b>КУДА</b> хотите отправить груз:`,
                                SPB_whereToSendOptions
                            );
                        }
                    } 
    
                } else {
    
                    const dataWhereToSend = data.split('=')[1];

                    await user.update({
                        whereToSend: dataWhereToSend
                    }, {
                        where: {
                                chatId: chatId
                            }
                        }
                    );
    
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
                            'messageId'
                        ]
                    });
                    
                    if ( user.messageId ) { 
                        //Редактировать сообщение при наличии id сообщения
                        return bot.editMessageText(
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`, 
                            {
                                chat_id: chatId,
                                message_id: user.messageId,
                                parse_mode: 'HTML',
                                reply_markup: sendReply_markup,
                            }
                        );

                    } else {
                        //Запись ID следующего сообщения    
                        await user.update({
                            messageId: msg.message.message_id += 1
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        return bot.sendMessage(
                            chatId,
                            `<b>Вы желаете отправить:</b>\nОткуда: ${user.fromToSend}\nКуда: ${user.whereToSend}\nКому: ${user.toWhomToSend}\nЧто: ${user.whatToSend}`,
                            sendOptions
                        );
                    }
                }
    
            } else if ( data === '/toWhomToSend' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                })

                if ( user.messageId ) { 
                    //Редактировать сообщение при наличии id сообщения
                    return bot.editMessageText(
                        `Напишите <b>КОМУ</b> вы хотите отправить:`, 
                        {
                            chat_id: chatId,
                            message_id: user.messageId,
                            parse_mode: 'HTML',
                        }
                    );

                } else {
                    //Запись ID следующего сообщения 
                    await user.update({
                        messageId: msg.message.message_id += 1
                    }, {
                        where: {
                                chatId: chatId
                            }
                        }
                    );

                    return bot.sendMessage(
                        chatId,
                        `Напишите <b>КОМУ</b> вы хотите отправить:`,
                        { parse_mode: 'HTML' }
                    )
                }

            } else if ( data === '/whatToSend' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                })

                if ( user.messageId ) { 
                    //Редактировать сообщение при наличии id сообщения
                    return bot.editMessageText(
                        `Опишите <b>ЧТО</b> вы хотите отправить:`, 
                        {
                            chat_id: chatId,
                            message_id: user.messageId,
                            parse_mode: 'HTML',
                        }
                    );

                } else {
                    //Запись ID следующего сообщения 
                    await user.update({
                        messageId: msg.message.message_id += 1
                    }, {
                        where: {
                                chatId: chatId
                            }
                        }
                    );

                    return bot.sendMessage(
                        chatId,
                        `Опишите <b>ЧТО</b> вы хотите отправить:`,
                        { parse_mode: 'HTML' }
                    );
                }

            } else if ( data === '/createMovement' ) {

                if (
                    user.fromToSend.length > 1 &&
                    user.whereToSend.length > 1 &&
                    user.toWhomToSend.length > 1 &&
                    user.whatToSend.length > 1
                ) {

                    if ( user.lastCommand === `/editMovement` ) {

                        await MoveModel.update({
                            fromToSend: `${user.fromToSend}`,
                            whereToSend: `${user.whereToSend}`,
                            toWhomToSend: `${user.toWhomToSend}`,
                            whatToSend: `${user.whatToSend}`
                        }, {
                            where: {
                                moveId: user.moveId
                            }
                        });

                        await user.update({
                                lastCommand: null,  
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        return bot.editMessageText(
                            `Перемещение ${user.moveId} успешно отредактированно`,
                            {
                                chat_id: chatId,
                                message_id: user.messageId,
                                parse_mode: 'HTML'
                            }
                        );

                    } else {

                        const maxId = await MoveModel.max('id');
                        const newMoveId = `${user.city}${maxId + 1}`;
        
                        await MoveModel.create({
                            comment: '',
                            moveId: `${newMoveId}`,
                            fromToSend: user.fromToSend,
                            whereToSend: user.whereToSend,
                            toWhomToSend: user.toWhomToSend,
                            whatToSend: user.whatToSend,
                            whoSend: `${user.userName}=${user.chatId}`,
                            delivered: 'Нет'
                        });
                       
                        await user.update({
                            moveId:  `${newMoveId}`,
                            fromToSend: '',
                            whereToSend: '',
                            toWhomToSend: '',
                            whatToSend: ''
                        }, {
                            where: {
                                chatId: chatId
                            }
                        });
                        
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Перемещение ${newMoveId} создано!\nЕсли хотите <b>прикрепить фото</b> к перемещению ${newMoveId}, просто отправьте мне их сейчас.`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: toMainMenu1Reply_markup,
                                }
                            );
    
                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );
    
                            return bot.sendMessage(
                                chatId,
                                `Перемещение ${newMoveId} создано!\nЕсли хотите <b>прикрепить фото</b> к перемещению ${newMoveId}, просто отправьте мне их сейчас.`,
                                toMainMenu1Options
                            );
                        }
                    }

                } else {

                                        
                    if ( user.messageId ) { 
                        //Редактировать сообщение при наличии id сообщения
                        return bot.editMessageText(
                            `Перемещение ${newMoveId} создано!\nЕсли хотите <b>прикрепить фото</b> к перемещению ${newMoveId}, просто отправьте мне их сейчас.`, 
                            {
                                chat_id: chatId,
                                message_id: user.messageId,
                                parse_mode: 'HTML',
                                reply_markup: toMainMenu1Reply_markup,
                            }
                        );

                    } else {
                        //Запись ID следующего сообщения 
                        await user.update({
                            messageId: msg.message.message_id += 1
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        return bot.sendMessage(
                            chatId,
                            `Перемещение с пустыми полями создать невозможно.\nПожалуйста заполните все поля для создания перемещения.`
                        );
                    }
                }

            } else if ( data.includes('whereGet') ) {

                if (data === '/whereGet') {

                    if ( user.city === 'MSK' ) {
                                
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Укажите место <b>ГДЕ</b> вы получаете груз:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: MSK_whereGetReply_markup,
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Укажите место <b>ГДЕ</b> вы получаете груз:`,
                                MSK_whereGetOptions
                            );
                        }
                    
                    } else {
                                    
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Укажите место <b>ГДЕ</b> вы получаете груз:`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                    reply_markup: SPB_whereGetReply_markup,
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Укажите место <b>ГДЕ</b> вы получаете груз:`,
                                SPB_whereGetOptions
                            );
                        }
                    }

                } else {

                    const dataWhereGet = data.split('=')[1];

                    const movements = await MoveModel.findAll({
                        where: {
                            whereToSend: dataWhereGet,
                            delivered: 'В пути'
                        },
                        order: [['id', 'DESC']]
                    });
                    
                    const user = await UserModel.findOne({
                        where: {
                            chatId: chatId
                        },
                        attributes: [
                            'id',
                            'chatId',
                            'lastCommand',
                            'userName',
                            'messageId'
                        ]
                    });

                    if ( movements.length > 0 ) {

                        let i = 0; // Объявление переменной-счетчика итераций
                        const whereGetMenu = user.messageId;

                        //Запись ID следующего сообщения                      
                        await user.update({
                            messageId: msg.message.message_id += 1
                        }, {
                            where: {
                                    chatId: chatId
                                }
                            }
                        );

                        for (const movement of movements) {

                            let nextMessageId = user.messageId + i; // Добавление в модификатора к messa

                            await bot.sendMessage(
                                chatId,
                                `<pre>${movement.moveId}</pre>\nОткуда: ${movement.fromToSend}\nКуда: ${movement.whereToSend}\nКому: ${movement.toWhomToSend}\nЧто: ${movement.whatToSend}`,
                                {
                                    parse_mode: 'HTML',
                                    reply_markup: JSON.stringify( {
                                        inline_keyboard: [
                                            [ { text: 'Получено', callback_data: `delivered=${movement.moveId}=${nextMessageId}` } ],
                                            [ { text: 'Посмотреть фото', callback_data: `showPhoto=${movement.moveId}=${nextMessageId}` } ],
                                        ]
                                    })
                                }
                            );
                            i++; // Счетчик +1 в конце очередной итерации
                        };
                        return bot.deleteMessage(chatId, whereGetMenu);

                    } else {
                                
                        if ( user.messageId ) { 
                            //Редактировать сообщение при наличии id сообщения
                            return bot.editMessageText(
                                `Перемещений на ${dataWhereGet} нет.`, 
                                {
                                    chat_id: chatId,
                                    message_id: user.messageId,
                                    parse_mode: 'HTML',
                                }
                            );

                        } else {
                            //Запись ID следующего сообщения 
                            await user.update({
                                messageId: msg.message.message_id += 1
                            }, {
                                where: {
                                        chatId: chatId
                                    }
                                }
                            );

                            return bot.sendMessage(
                                chatId,
                                `Перемещений на ${dataWhereGet} нет.`
                            );
                        }
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

                    const photosToSend = files.filter(file => file.split(".")[0] === moveId);

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
                    mainMenuDriversOptions
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
                    subDivision: subDivision
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
const bot_password = config.bot_password; // присвоение глобальной константе значения пароля

const bot = new TelegramApi(bot_token, {
    polling: {
        interval: 1000, //между запросами с клиента на сервер тг "млсек"
        autoStart: true, //обработка всех команд отправленых до запуска программы
        params: {
            timeout:30000 //таймаут между запросами "млсек"
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