const TelegramApi = require('node-telegram-bot-api');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');

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
    MSK_takeOptions,
    SPB_takeOptions
} = require('./options');
const sequelize = require('./db');
const { UserModel, MoveModel } = require('./models');

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
    )
}

// ======================================================================================================================================
// старт работы программы ===============================================================================================================
// ======================================================================================================================================

async function start() {
    
    console.log('Бот запущен')

    try {

        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Подключение к базе данных установленно');

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

                        await bot.getFile(msg.document.file_id).then((file) => {
                            const fileStream = bot.getFileStream(file.file_id);
                            fileStream.pipe(fs.createWriteStream(`/root/zak/${fileName}`));
                            fileStream.on('end', () => {
                                bot.sendMessage(
                                    chatId, 
                                    `Файл <b>${fileName}</b>\nуспешно сохранен.`, 
                                    { parse_mode: 'HTML' }
                                );
                            });
                        });
                        return;
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
                    )
                    
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
                    })

                    return bot.sendMessage(
                        chatId, 
                        `Вы в главном меню, ${user.userName}\nВаш персональный id: <code>${chatId}</code>`,
                        mainMenuOptions
                    ); 

                } else if (user.lastCommand === '/toWhomToSend') {

                    await user.update({
                        toWhomToSend: text
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

                } else if ( user.lastCommand === '/whatToSend' ) {

                    await user.update({
                        whatToSend: text
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

                } else if ( user.lastCommand === '/commentMovement' ) {

                    await user.update({
                        lastCommand: null
                    }, {
                        where: {
                            chatId: chatId
                        }
                    })

                    const movement = await MoveModel.findOne({
                        where: {
                            moveId: user.moveId
                        }
                    })
                    
                    await movement.update({
                        comment: text
                    })

                    return bot.sendMessage(
                        chatId,
                        `Ваше замечание сохранено.`
                    )
                } else if ( user.lastCommand === '/sendMessage' ) {

                    await user.update({
                        whatToSend: text
                    }, {
                        where: {
                            chatId: chatId
                        }
                    })

                    if ( user.city === 'MSK' ) {
    
                        return bot.sendMessage(
                            chatId,
                            `Выберите, отправителям <s>и получателям</s> каких подразделений мне разослать ваше сообщение:`,
                            MSK_sendMessageOptions
                        );
    
                    } else {
    
                        return bot.sendMessage(
                            chatId,
                            `Выберите, отправителям <s>и получателям</s> каких подразделений мне разослать ваше сообщение:`,
                            SPB_sendMessageOptions
                        );
    
                    }

                }

            } else {

                await createNewUser(chatId, msg);

                return chekPassword(chatId, msg);
            }

        } catch (e) {
            console.log('Ошибка в слушателе сообщений.', e)
        }
    })
    
    // слушатель коллбэков ==================================================================================================================
    
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
    
        
        let user = await UserModel.findOne({
            where: {
                chatId: chatId
            }
        });

        
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
                    `Вы в главном меню, ${user.userName}\nВаш персональный id: <code>${chatId}</code>`,
                    mainMenuOptions
                ); 
                    
            } else if ( data === '/movementList' ) {
                    
                const movements = await MoveModel.findAll({
                    where: {
                        delivered: 'Нет'
                    }
                });
                
                if ( movements.length > 0 ) {

                    let message = '';

                    movements.forEach( async (movement) => {
                        
                        if ( movement.moveId.includes(user.city) ) {

                            message += `<code>${movement.moveId}</code> ${movement.fromToSend} ${movement.whereToSend}\n`
                            
                        }

                    })

                    return bot.sendMessage(
                        chatId,
                        message,
                        iAmDriverOptions
                    )
                }

            } else if ( data.includes('sendMessage') ) {

                if ( data === '/sendMessage' ) {

                    await user.update({
                        lastCommand: data
                    })

                    return bot.sendMessage(
                        chatId,
                        `Напишите сообщение для получателей сегодняшних перемещений\n<i>подразделение можно будет выбрать после написания сообщения</i>`,
                        { parse_mode: 'HTML' }
                    )

                } else {

                    const subDivision = data.split('=')[1];

                    const message = `${user.whatToSend}`;
                    const driver = `${user.userName}`;

                    const users = await UserModel.findAll({
                        where: {
                            subdivision: subDivision
                        }
                    })

                    users.forEach( async (user) => {

                        return bot.sendMessage(
                            user.chatId,
                            `Пользователь ${driver} попросил меня отправить вам следующее сообщение:\n\n${message}`
                        )

                    })
                }


            } else if ( data.includes('delivered') ) {

                const deliveredMoveId = data.split('=')[1];

                const movement = await MoveModel.findOne({
                    where: {
                        moveId: deliveredMoveId
                    }
                })

                await movement.update({
                    delivered: 'Да',
                })

                await user.update({
                    moveId: deliveredMoveId
                }, {
                    where: {
                        chatId: chatId
                    }
                })
                
                return bot.sendMessage(
                    chatId,
                    `Перемещение ${deliveredMoveId} принято вами.`,
                    commentOptions
                )

            } else if ( data.includes('taked') ) {

                const takedMoveId = data.split('=')[1];
                
                const movement = await MoveModel.findOne({
                    where: {
                        moveId: takedMoveId
                    }
                })
                
                await movement.update({
                    whoDriver: user.userName
                })
                
                await bot.sendMessage(
                    chatId,
                    `Вы подтвердли, что забрали перемещение <code>${takedMoveId}</code>.`,
                    { parse_mode: 'HTML' }
                )
                    
                const senderChatId = movement.whoSend.split('=')[1];
                
                return bot.sendMessage(
                    senderChatId,
                    `Водитель ${user.userName} только что забрал ваше перемещение ${takedMoveId} из подразделения "${movement.fromToSend}".`,
                    { parse_mode: 'HTML' }
                )


            } else if ( data.includes('takeMovement') ) {

                if (data === '/takeMovement') {

                    if ( user.city === 'MSK' ) {
    
                        await bot.sendMessage(
                            chatId,
                            `Укажите место <b>ГДЕ</b> вы забираете перемещение:`,
                            MSK_takeOptions
                        )
    
                    } else {
    
                        await bot.sendMessage(
                            chatId,
                            `Укажите место <b>ГДЕ</b> вы забираете перемещение:`,
                            SPB_takeOptions
                        )
    
                    }

                } else {

                    const dataWhereGet = data.split('=')[1];

                    const movements = await MoveModel.findAll({
                        where: {
                            fromToSend: dataWhereGet,
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
                                        ]
                                    })
                                }
                            )

                        });

                    } else {

                        return bot.sendMessage(
                            chatId,
                            `Отсюда (${dataWhereGet}) нечего забирать.`
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
               
                return bot.sendMessage(
                    chatId,
                    `Перемещение ${newMoveId} создано!`,
                    { parse_mode: 'HTML' }
                )

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
                            delivered: 'Нет'
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

            } else if ( data === '/iamDriver' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                })

                return bot.sendMessage(
                    chatId,
                    `Меню водителя:`,
                    iAmDriverOptions
                )

            } else if ( data === '/commentMovement' ) {

                await user.update({
                    lastCommand: data
                }, {
                    where: {
                        chatId: chatId
                    }
                })

                return bot.sendMessage(
                    chatId,
                    `Напишите свое замечание по данному перемещению:`
                )

            } else if ( data.includes('chooseCity' ) ) {
    
                const chosenCity = data.split('=')[1];
    
                await user.update({
                    city: chosenCity
                }, {
                    where: {
                        chatId: chatId
                    }
                })
    
                await bot.sendMessage(
                    chatId,
                    `Ваш город <b>${chosenCity}</b>`,
                    { parse_mode: 'HTML' }
                )

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
                    )

                }
    
            } else if (data.includes('subDivision')) {

                const subDivision = data.split('=')[1];

                await user.update({
                    subdivision: subDivision
                })

                return bot.sendMessage(
                    chatId,
                    `Ваше подразделение <b>${subDivision}</b>`,
                    toMainMenuOptions
                )

            } else if ( data === '/editName' ) {
    
                return editName(chatId);
    
            }
    
        } catch (e) {

            console.log(e);
            return bot.sendMessage(
                chatId,
                'Ошибка в исполнении кода прослушивателя колбэков',
            )
        }
    
    });

}

// ======================================================================================================================================
// инициализация бота 
// ======================================================================================================================================

function readConfigSync() {
    const data = fs.readFileSync('/root/zak/config.cfg', 'utf-8'); // для рабочей версии
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
        autoStart: true, //обработка всех команд отправленных до запуска программы
        params: {
            timeout:10 //таймаут между запросами "млсек"
        }
    }
});

// меню команд
bot.setMyCommands([
    {command: '/mainmenu', description:'Главное меню'},
    {command: '/abilitys', description:'Актуальные функции бота'},
    {command: '/updatelist', description:'Список обновлений'},
    {command: '/settings', description:'Настройки'},
]);
start();