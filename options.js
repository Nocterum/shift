module.exports = {

    mainMenuUsersOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Отправить', callback_data: '/send' } ],
                [ { text: 'Получить', callback_data: '/whereGet' } ],
                [ { text: 'Задания на перемещения', callback_data: '/movementList' } ],
                [ { text: 'Написать сообщение', callback_data: '/sendMessage' } ],

            ]
        })
    },

    mainMenuDriversOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Задания на перемещения', callback_data: '/movementList' } ],
                [ { text: 'Перемещения которые я забрал', callback_data: '/takenMovement' } ],
                [ { text: 'Забираю сейчас (откуда)', callback_data: '/takeMovement' } ],
                [ { text: 'Написать сообщение', callback_data: '/sendMessage' } ],

            ]
        })
    },

    toMainMenuOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'В главное меню', callback_data: '/mainMenu' } ],
            ]
        })
    },

    toMainMenu1Options: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'В главное меню', callback_data: '/mainMenu' } ],
                [ { text: 'Создать ещё одно', callback_data: '/send' } ],
            ]
        })
    },

    settingsOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Изменить имя', callback_data: '/editName' } ],
                [ { text: 'Изменить город и подразделение', callback_data: '/editCity' } ],
            ]
        })
    },

    chooseCityOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Москва', callback_data: 'chooseCity=MSK' } ],
                [ { text: 'Санкт-Петербург', callback_data: 'chooseCity=SPB' } ],
            ]
        })
    },

    sendOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Откуда', callback_data: '/fromToSend' }, { text: 'Куда', callback_data: '/whereToSend' } ],
                [ { text: 'Кому', callback_data: '/toWhomToSend' }, { text: 'Что', callback_data: '/whatToSend' } ],
                [ { text: `Создать перемещение\n+фото`, callback_data: '/createMovement' } ],
            ]
        })
    },

    SPB_fromToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Ланской', callback_data: 'fromToSend=Ланской' } ],
                [ { text: 'Большой', callback_data: 'fromToSend=Большой' } ],
                [ { text: 'Гороховая', callback_data: 'fromToSend=Гороховая' } ],
                [ { text: 'Склад Предпортовая', callback_data: 'fromToSend=Склад Предпортовая' } ],
            ]
        })
    },

    MSK_fromToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Глаголева', callback_data: 'fromToSend=Глаголева' } ],
                [ { text: 'Патрики', callback_data: 'fromToSend=Патрики' } ],
                [ { text: 'Арт-плей', callback_data: 'fromToSend=Арт-плей' } ],
                [ { text: 'Офис', callback_data: 'fromToSend=Офис' } ],
                [ { text: 'Центральный склад', callback_data: 'fromToSend=Центральный склад' } ],
            ]
        })
    },

    SPB_whereToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Ланской', callback_data: 'whereToSend=Ланской' } ],
                [ { text: 'Большой', callback_data: 'whereToSend=Большой' } ],
                [ { text: 'Гороховая', callback_data: 'whereToSend=Гороховая' } ],
                [ { text: 'Склад Предпортовая', callback_data: 'whereToSend=Склад Предпортовая' } ],
            ]
        })
    },

    MSK_whereToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Глаголева', callback_data: 'whereToSend=Глаголева' } ],
                [ { text: 'Патрики', callback_data: 'whereToSend=Патрики' } ],
                [ { text: 'Арт-плей', callback_data: 'whereToSend=Арт-плей' } ],
                [ { text: 'Офис', callback_data: 'whereToSend=Офис' } ],
                [ { text: 'Центральный склад', callback_data: 'whereToSend=Центральный склад' } ],
            ]
        })
    },

    SPB_whereGetOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Ланской', callback_data: 'whereGet=Ланской' } ],
                [ { text: 'Большой', callback_data: 'whereGet=Большой' } ],
                [ { text: 'Гороховая', callback_data: 'whereGet=Гороховая' } ],
                [ { text: 'Склад Предпортовая', callback_data: 'whereGet=Склад Предпортовая' } ],
            ]
        })
    },

    MSK_whereGetOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Глаголева', callback_data: 'whereGet=Глаголева' } ],
                [ { text: 'Патрики', callback_data: 'whereGet=Патрики' } ],
                [ { text: 'Арт-плей', callback_data: 'whereGet=Арт-плей' } ],
                [ { text: 'Офис', callback_data: 'whereGet=Офис' } ],
                [ { text: 'Центральный склад', callback_data: 'whereGet=Центральный склад' } ],
            ]
        })
    },

    commentOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Есть замечания к перемещению?', callback_data: '/commentMovement' } ],
            ]
        })
    },
    
    MSK_subDivisionOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Глаголева', callback_data: 'subDivision=Глаголева' } ],
                [ { text: 'Патрики', callback_data: 'subDivision=Патрики' } ],
                [ { text: 'Арт-плей', callback_data: 'subDivision=Арт-плей' } ],
                [ { text: 'Офис', callback_data: 'subDivision=Офис' } ],
                [ { text: 'Центральный склад', callback_data: 'subDivision=Центральный склад' } ],
                [ { text: 'Я водитель', callback_data: 'subDivision=Водитель' } ],
            ]
        })
    },

    SPB_subDivisionOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Ланской', callback_data: 'subDivision=Ланской' } ],
                [ { text: 'Большой', callback_data: 'subDivision=Большой' } ],
                [ { text: 'Горох', callback_data: 'subDivision=Горох' } ],
                [ { text: 'Склад Предпортовая', callback_data: 'subDivision=Склад Предпортовая' } ],
                [ { text: 'Я водитель', callback_data: 'subDivision=Водитель' } ],
            ]
        })
    },

    MSK_sendMessageOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Глаголева', callback_data: 'sendMessage=Глаголева' } ],
                [ { text: 'Патрики', callback_data: 'sendMessage=Патрики' } ],
                [ { text: 'Арт-плей', callback_data: 'sendMessage=Арт-плей' } ],
                [ { text: 'Офис', callback_data: 'sendMessage=Офис' } ],
                [ { text: 'Центральный склад', callback_data: 'sendMessage=Центральный склад' } ],
                [ { text: 'Водители', callback_data: 'sendMessage=Водитель' } ],
            ]
        })
    },

    SPB_sendMessageOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Ланской', callback_data: 'sendMessage=Ланской' } ],
                [ { text: 'Большой', callback_data: 'sendMessage=Большой' } ],
                [ { text: 'Горох', callback_data: 'sendMessage=Горох' } ],
                [ { text: 'Склад Предпортовая', callback_data: 'sendMessage=Склад Предпортовая' } ],
                [ { text: 'Водители', callback_data: 'sendMessage=Водитель' } ],
            ]
        })
    },

    sendMessageOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Глаголева', callback_data: 'sendMessage=Глаголева' } ],
                [ { text: 'Патрики', callback_data: 'sendMessage=Патрики' } ],
                [ { text: 'Арт-плей', callback_data: 'sendMessage=Арт-плей' } ],
                [ { text: 'Офис', callback_data: 'sendMessage=Офис' } ],
                [ { text: 'Центральный склад', callback_data: 'sendMessage=Центральный склад' } ],
                [ { text: 'Ланской', callback_data: 'sendMessage=Ланской' } ],
                [ { text: 'Большой', callback_data: 'sendMessage=Большой' } ],
                [ { text: 'Горох', callback_data: 'sendMessage=Горох' } ],
                [ { text: 'Склад Предпортовая', callback_data: 'sendMessage=Склад Предпортовая' } ],
                [ { text: 'Водителям', callback_data: 'sendMessage=Водитель' } ],
            ]
        })
    },

    SPB_takeOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Ланской', callback_data: 'takeMovement=Ланской' } ],
                [ { text: 'Большой', callback_data: 'takeMovement=Большой' } ],
                [ { text: 'Гороховая', callback_data: 'takeMovement=Гороховая' } ],
                [ { text: 'Склад Предпортовая', callback_data: 'takeMovement=Склад Предпортовая' } ],
            ]
        })
    },

    MSK_takeOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [ { text: 'Глаголева', callback_data: 'takeMovement=Глаголева' } ],
                [ { text: 'Патрики', callback_data: 'takeMovement=Патрики' } ],
                [ { text: 'Арт-плей', callback_data: 'takeMovement=Арт-плей' } ],
                [ { text: 'Офис', callback_data: 'takeMovement=Офис' } ],
                [ { text: 'Центральный склад', callback_data: 'takeMovement=Центральный склад' } ],
            ]
        })
    },
}