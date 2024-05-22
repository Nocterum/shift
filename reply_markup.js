const mainMenuUsersReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Отправить', callback_data: '/send' } ],
        [ { text: 'Получить', callback_data: '/whereGet' } ],
        [ { text: 'Задания на перемещения', callback_data: '/movementList' } ],
        [ { text: 'Написать сообщение', callback_data: '/sendMessage' } ],

    ]
});

const MSK_fromToSendOptionsReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Глаголева', callback_data: 'fromToSend=Глаголева' } ],
        [ { text: 'Патрики', callback_data: 'fromToSend=Патрики' } ],
        [ { text: 'Арт-плей', callback_data: 'fromToSend=Арт-плей' } ],
        [ { text: 'Рублёвка', callback_data: 'fromToSend=Рублёвка' } ],
        [ { text: 'Офис', callback_data: 'fromToSend=Офис' } ],
        [ { text: 'Центральный склад', callback_data: 'fromToSend=Центральный склад' } ],
    ]
});

const sendReply_markup = JSON.stringify( {
    inline_keyboard: [
        [ { text: 'Откуда', callback_data: '/fromToSend' }, { text: 'Куда', callback_data: '/whereToSend' } ],
        [ { text: 'Кому', callback_data: '/toWhomToSend' }, { text: 'Что', callback_data: '/whatToSend' } ],
        [ { text: `Создать перемещение+`, callback_data: '/createMovement' } ],
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
    })

module.exports = {
    mainMenuUsersReply_markup,
    MSK_fromToSendOptionsReply_markup,
    sendReply_markup,
    mainMenuDriversReply_markup,
    toMainMenuReply_markup,
}