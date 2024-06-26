const mainMenuUsersReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Отправить', callback_data: '/send' } ],  //внедрён
        [ { text: 'Получить', callback_data: '/whereGet' } ], //внедрён
        [ { text: 'Задания на перемещения', callback_data: '/movementList' } ],
        [ { text: 'Написать сообщение', callback_data: '/sendMessage' } ],
    ]
});
const mainMenuDriversReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Задания на перемещения', callback_data: '/movementList' } ],
        [ { text: 'Перемещения которые я забрал', callback_data: '/takenMovement' } ],
        [ { text: 'Забираю сейчас (откуда)', callback_data: '/takeMovement' } ],
        [ { text: 'Написать сообщение', callback_data: '/sendMessage' } ],
    ]
});
const toMainMenuReply_markup = JSON.stringify( {
    inline_keyboard: [
            [ { text: 'В главное меню', callback_data: '/mainMenu' } ],
        ]
});
const toMainMenu1Reply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'В главное меню', callback_data: '/mainMenu' } ],
        [ { text: 'Создать ещё одно', callback_data: '/send' } ],
    ]
});
const settingsReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Изменить имя', callback_data: '/editName' } ],
        [ { text: 'Изменить город и подразделение', callback_data: '/editCity' } ],
    ]
});
const chooseCityReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Москва', callback_data: 'chooseCity=MSK' } ],
        [ { text: 'Санкт-Петербург', callback_data: 'chooseCity=SPB' } ],
    ]
});
const sendReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Откуда', callback_data: '/fromToSend' }, { text: 'Куда', callback_data: '/whereToSend' } ],  //внедрён //внедрён
        [ { text: 'Кому', callback_data: '/toWhomToSend' }, { text: 'Что', callback_data: '/whatToSend' } ],    // //
        [ { text: `Записать+`, callback_data: '/createMovement' } ],
    ]
});
const SPB_fromToSendReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Ланской', callback_data: 'fromToSend=Ланской' } ],   //внедрён
        [ { text: 'Большой', callback_data: 'fromToSend=Большой' } ],   //внедрён
        [ { text: 'Гороховая', callback_data: 'fromToSend=Гороховая' } ],   //внедрён
        [ { text: 'Склад Предпортовая', callback_data: 'fromToSend=Склад Предпортовая' } ], //внедрён
    ]
});
const MSK_fromToSendReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'fromToSend=Глаголева' }, { text: 'Патрики', callback_data: 'fromToSend=Патрики' } ],   //внедрён
        [ { text: 'Арт-плей', callback_data: 'fromToSend=Арт-плей' }, { text: 'Рублёвка', callback_data: 'fromToSend=Рублёвка' } ], //внедрён
        [ { text: 'Офис', callback_data: 'fromToSend=Офис' } ], //внедрён
        [ { text: 'Центральный склад', callback_data: 'fromToSend=Центральный склад' } ],   //внедрён
    ]
});
const SPB_whereToSendReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Ланской', callback_data: 'whereToSend=Ланской' } ],  //внедрён
        [ { text: 'Большой', callback_data: 'whereToSend=Большой' } ],  //внедрён
        [ { text: 'Гороховая', callback_data: 'whereToSend=Гороховая' } ],  //внедрён
        [ { text: 'Склад Предпортовая', callback_data: 'whereToSend=Склад Предпортовая' } ],    //внедрён
    ]
});
const MSK_whereToSendReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'whereToSend=Глаголева' }, { text: 'Патрики', callback_data: 'whereToSend=Патрики' } ],  //внедрён
        [ { text: 'Арт-плей', callback_data: 'whereToSend=Арт-плей' }, { text: 'Рублёвка', callback_data: 'whereToSend=Рублёвка' } ],    //внедрён
        [ { text: 'Офис', callback_data: 'whereToSend=Офис' } ],    //внедрён
        [ { text: 'Центральный склад', callback_data: 'whereToSend=Центральный склад' } ],  //внедрён
    ]
});
const SPB_whereGetReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Ланской', callback_data: 'whereGet=Ланской' } ], //внедрён
        [ { text: 'Большой', callback_data: 'whereGet=Большой' } ], //внедрён
        [ { text: 'Гороховая', callback_data: 'whereGet=Гороховая' } ], //внедрён
        [ { text: 'Склад Предпортовая', callback_data: 'whereGet=Склад Предпортовая' } ], //внедрён
    ]
});
const MSK_whereGetReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'whereGet=Глаголева' }, { text: 'Патрики', callback_data: 'whereGet=Патрики' } ], //внедрён
        [ { text: 'Арт-плей', callback_data: 'whereGet=Арт-плей' }, { text: 'Рублёвка', callback_data: 'whereGet=Рублёвка' } ], //внедрён
        [ { text: 'Офис', callback_data: 'whereGet=Офис' } ],   //внедрён
        [ { text: 'Центральный склад', callback_data: 'whereGet=Центральный склад' } ], //внедрён
    ]
});
const commentReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Есть замечания к перемещению?', callback_data: '/commentMovement' } ],
    ]
});
const MSK_subDivisionReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'subDivision=Глаголева' }, { text: 'Патрики', callback_data: 'subDivision=Патрики' } ],
        [ { text: 'Арт-плей', callback_data: 'subDivision=Арт-плей' }, { text: 'Рублёвка', callback_data: 'subDivision=Рублёвка' } ],
        [ { text: 'Офис', callback_data: 'subDivision=Офис' }, { text: 'Центральный склад', callback_data: 'subDivision=Центральный склад' } ],
        [ { text: 'Я водитель', callback_data: 'subDivision=Водитель' } ],
    ]
});
const SPB_subDivisionReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Ланской', callback_data: 'subDivision=Ланской' } ],
        [ { text: 'Большой', callback_data: 'subDivision=Большой' } ],
        [ { text: 'Горох', callback_data: 'subDivision=Горох' } ],
        [ { text: 'Склад Предпортовая', callback_data: 'subDivision=Склад Предпортовая' } ],
        [ { text: 'Я водитель', callback_data: 'subDivision=Водитель' } ],
    ]
});
const MSK_sendMessageReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'sendMessage=Глаголева' }, { text: 'Патрики', callback_data: 'sendMessage=Патрики' } ],
        [ { text: 'Арт-плей', callback_data: 'sendMessage=Арт-плей' }, { text: 'Рублёвка', callback_data: 'sendMessage=Рублёвка' } ],
        [ { text: 'Офис', callback_data: 'sendMessage=Офис' }, { text: 'Центральный склад', callback_data: 'sendMessage=Центральный склад' } ],
        [ { text: 'Водители', callback_data: 'sendMessage=Водитель' } ],
    ]
});
const SPB_sendMessageReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Ланской', callback_data: 'sendMessage=Ланской' } ],
        [ { text: 'Большой', callback_data: 'sendMessage=Большой' } ],
        [ { text: 'Горох', callback_data: 'sendMessage=Горох' } ],
        [ { text: 'Склад Предпортовая', callback_data: 'sendMessage=Склад Предпортовая' } ],
        [ { text: 'Водители', callback_data: 'sendMessage=Водитель' } ],
    ]
});
const sendMessageReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'sendMessage=Глаголева' }, { text: 'Патрики', callback_data: 'sendMessage=Патрики' } ],
        [ { text: 'Арт-плей', callback_data: 'sendMessage=Арт-плей' }, { text: 'Рублёвка', callback_data: 'sendMessage=Рублёвка' } ],
        [ { text: 'Офис', callback_data: 'sendMessage=Офис' }, { text: 'Центральный склад', callback_data: 'sendMessage=Центральный склад' } ],
        [ { text: 'Ланской', callback_data: 'sendMessage=Ланской' }, { text: 'Большой', callback_data: 'sendMessage=Большой' } ],
        [ { text: 'Горох', callback_data: 'sendMessage=Горох' }, { text: 'Склад Предпортовая', callback_data: 'sendMessage=Склад Предпортовая' } ],
        [ { text: 'Водителям', callback_data: 'sendMessage=Водитель' } ],
    ]
});
const SPB_takeReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Ланской', callback_data: 'takeMovement=Ланской' } ],
        [ { text: 'Большой', callback_data: 'takeMovement=Большой' } ],
        [ { text: 'Гороховая', callback_data: 'takeMovement=Гороховая' } ],
        [ { text: 'Склад Предпортовая', callback_data: 'takeMovement=Склад Предпортовая' } ],
    ]
});
const MSK_takeReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'takeMovement=Глаголева' }, { text: 'Патрики', callback_data: 'takeMovement=Патрики' } ],
        [ { text: 'Арт-плей', callback_data: 'takeMovement=Арт-плей' }, { text: 'Рублёвка', callback_data: 'takeMovement=Рублёвка' } ],
        [ { text: 'Офис', callback_data: 'takeMovement=Офис' } ],
        [ { text: 'Центральный склад', callback_data: 'takeMovement=Центральный склад' } ],
    ]
});

    module.exports = {
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
    }