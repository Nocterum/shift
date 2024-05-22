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
    MSK_takeReply_markup

} = require('./reply_markup');

module.exports = {

    mainMenuUsersOptions: {
        parse_mode: 'HTML',
        reply_markup: mainMenuUsersReply_markup
    },

    mainMenuDriversOptions: {
        parse_mode: 'HTML',
        reply_markup: mainMenuDriversReply_markup
    },

    toMainMenuOptions: {
        parse_mode: 'HTML',
        reply_markup: toMainMenuReply_markup
    },

    toMainMenu1Options: {
        parse_mode: 'HTML',
        reply_markup: toMainMenu1Reply_markup
    },

    settingsOptions: {
        parse_mode: 'HTML',
        reply_markup: settingsReply_markup
    },

    chooseCityOptions: {
        parse_mode: 'HTML',
        reply_markup: chooseCityReply_markup
    },

    sendOptions: {
        parse_mode: 'HTML',
        reply_markup: sendReply_markup,
    },

    SPB_fromToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: SPB_fromToSendReply_markup
    },

    MSK_fromToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: MSK_fromToSendReply_markup
    },

    SPB_whereToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: SPB_whereToSendReply_markup
    },

    MSK_whereToSendOptions: {
        parse_mode: 'HTML',
        reply_markup: MSK_whereToSendReply_markup
    },

    SPB_whereGetOptions: {
        parse_mode: 'HTML',
        reply_markup: SPB_whereGetReply_markup
    },

    MSK_whereGetOptions: {
        parse_mode: 'HTML',
        reply_markup: MSK_whereGetReply_markup
    },

    commentOptions: {
        parse_mode: 'HTML',
        reply_markup: commentReply_markup
    },
    
    MSK_subDivisionOptions: {
        parse_mode: 'HTML',
        reply_markup: MSK_subDivisionReply_markup
    },

    SPB_subDivisionOptions: {
        parse_mode: 'HTML',
        reply_markup: SPB_subDivisionReply_markup
    },

    MSK_sendMessageOptions: {
        parse_mode: 'HTML',
        reply_markup: MSK_sendMessageReply_markup
    },

    SPB_sendMessageOptions: {
        parse_mode: 'HTML',
        reply_markup: SPB_sendMessageReply_markup
    },

    sendMessageOptions: {
        parse_mode: 'HTML',
        reply_markup: sendMessageReply_markup
    },

    SPB_takeOptions: {
        parse_mode: 'HTML',
        reply_markup: SPB_takeReply_markup
    },

    MSK_takeOptions: {
        parse_mode: 'HTML',
        reply_markup: MSK_takeReply_markup
    },
}