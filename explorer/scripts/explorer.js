const session_api = '/api/sessions';
const user_api = '/api/user';
const userId_api = '/api/user/';
const interval = 60000; // 60000 milliseconds = 1 minute
var intervalRefreshId = null;

// start Utils methods
function hideIfLogged(millis) {
    var sessionKeyOnLoadPage = sessionStorage['SessionKey'];
    if (sessionKeyOnLoadPage !== null && sessionKeyOnLoadPage !== undefined) {
        $('.for-login').hide(millis);
        $('#loginBtn').html('logged');
        $('#loginBtn').prop('disabled', 'disabled');
        $('#infoSession').html('Your Session Key is <b>' + sessionStorage['SessionKey'] + '</b>');
    } else {
        $('.for-login').show(millis);
        $('#loginBtn').html('Login');
        $('#loginBtn').removeAttr('disabled');
        $('#infoSession').html('');
    }
}
function loginListener() {
    var sessionKeyOnLoadPage = sessionStorage['SessionKey'];
    if (sessionKeyOnLoadPage !== null && sessionKeyOnLoadPage !== undefined) {
        hideIfLogged(0);
        clearInterval(intervalRefreshId);
        intervalRefreshId = setInterval(listAllSessionsFromUser, interval);
        listAllSessionsFromUser();
    } else {
        hideIfLogged(0);
        clearInterval(intervalRefreshId);
        $('#updateListInfo').html('');
        $('#updateListInfo').html('Nothing to show. Login to checkout your active sessions');
    }
}
function endSessionListener(id) {
    $(id).on('click', (e) => {

        // Dialog
        var dialog = document.querySelector('dialog');
        dialog.showModal();
        dialog.querySelector('.yes').addEventListener('click', () => {
            dialog.close();
            var delSettings = {
                "async": true,
                "crossDomain": true,
                "url": session_api,
                "method": "DELETE",
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "cache-control": "no-cache"
                },
                "data": { SessionKey: $(e.currentTarget).attr('sessionKey') }
            }
            $.ajax(delSettings).done((data) => {

                console.log(data);
                var snackbarContainer = document.querySelector('#toast');
                var info = { message: 'Session ended successfuly' };
                if (data.message !== undefined && data.message !== null) {
                    if ($(e.currentTarget).attr('sessionKey') === sessionStorage['SessionKey']) {
                        sessionStorage.removeItem('SessionKey');
                        $('.list-sessions').html('');
                        hideIfLogged(0);
                        listUserInfo();
                    }
                } else {
                    info = { message: data.message };
                }
                snackbarContainer.MaterialSnackbar.showSnackbar(info);
                loginListener();

            }).fail((err) => {
                console.error(err);
            });

        });

    });
}
// End Utils methods

// start Section methods
function login() {
    $('#loading-login').show(0);

    var inputEmail = $('#email').val(),
        inputPassw = $('#password').val(),
        params = { email: inputEmail, password: inputPassw };


    $.ajax({
        contentType: 'application/x-www-form-urlencoded',
        crossDomain: true,
        type: 'POST',
        url: session_api,
        data: params,
        success: (data) => {
            console.log(data);
            var snackbarContainer = document.querySelector('#toast');
            var info = { message: 'Login successful' };
            if (data.SessionKey !== undefined && data.SessionKey !== null) {
                sessionStorage['SessionKey'] = data.SessionKey;
                hideIfLogged(200);
            }
            else {
                info = { message: data.message };
            }
            snackbarContainer.MaterialSnackbar.showSnackbar(info);
            $('#loading-login').hide(0);
            loginListener();
            listUserInfo();
        },
        error: (err) => {
            var data = { message: 'Failed, something went wrong. Please try later...' };
            var snackbarContainer = document.querySelector('#toast');
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
            console.error(err);
            $('#loading-login').hide(0);
        },
        dataType: 'json'
    });
}

function listAllSessionsFromUser() {
    var key = sessionStorage['SessionKey'];
    var keyParam = { SessionKey: key };
    console.log('Get sessions from user of this session:', key);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": session_api,
        "method": "GET",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
        },
        "data": keyParam
    }
    $.ajax(settings).done((data) => {

        if (data.message === undefined) {
            var list = "";
            for (var i = 0; i < data.length; i++) {
                var date = new Date(data[i].created_date);
                list += '<li class="mdl-list__item">';
                list += '<span class="mdl-list__item-primary-content">';
                list += '<div class="mdl-grid">';
                list += '<div class="mdl-cell mdl-cell--11-col">';
                if (data[i]._id === key) {
                    list += '<span><a>Your Session</a></span>' + ': <b>' + data[i]._id + '</b>';
                } else {
                    list += '<span>';
                    list += 'Session ' + (i + 1) + ': <b>' + data[i]._id + '</b>';
                    list += '</span>';
                }
                list += '</div>';
                list += '<div class="mdl-cell mdl-cell--1-col">';
                list += '<a id="endSession' + i + '" sessionKey="' + data[i]._id + '" class="mdl-list__item-secondary-action"><i class="material-icons">close</i></a>';
                list += '</div>';
                list += '<div class="mdl-cell mdl-cell--11-col">';
                list += '<span class="mdl-list__item-text-body">';
                list += 'Started in '
                    + date.getDate()
                    + '/'
                    + (date.getMonth() + 1)
                    + '/'
                    + date.getFullYear()
                    + ' at '
                    + date.getHours()
                    + 'h'
                    + date.getMinutes()
                    + 'm';
                list += '</span>';
                list += '</div>';
                list += '</div>';
                list += '<span>'
                list += '</li>';

            }
            $('.list-sessions').html('');
            $('.list-sessions').html(list);
            for (var i = 0; i < data.length; i++) {
                endSessionListener(("#endSession" + i));
            }
            var update = new Date();
            var time = update.getDate() + '/' + (update.getMonth() + 1) + '/' + update.getFullYear();
            time += ' at ' + update.getHours() + ':' + update.getMinutes();
            $('#updateListInfo').html('');
            $('#updateListInfo').html('List updated in ' + time);
        } else {
            var data = { message: data.message };
            var snackbarContainer = document.querySelector('#toast');
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
            sessionStorage.removeItem('SessionKey');
            loginListener();
        }
    });
}

function createUser() {
    $('#loading-create-user').show(200);
    var usernameInput = $('#create-username').val(),
        emailInput = $('#create-email').val(),
        passwInput = $('#create-password').val(),
        keyParam = {
            name: usernameInput,
            email: emailInput,
            password: passwInput
        };

    var createSettings = {
        "async": true,
        "crossDomain": true,
        "url": user_api,
        "method": "POST",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
        },
        "data": keyParam
    }
    $.ajax(createSettings).done(data => {
        console.log(data);
        var r = { message: '' };
        if (data.code === 11000) {
            r = { message: 'Oops, something went wrong the email used already exist.' };
            $('#create-email').focus();
        } else {
            r = { message: data.message };
            $('#create-username').val('');
            $('#create-email').val('');
            $('#create-password').val('');
            $('#create-username').focus();
        }
        var snackbarContainer = document.querySelector('#toast');
        snackbarContainer.MaterialSnackbar.showSnackbar(r);

    }).fail(err => {
        var data = { message: 'Oops, something went wrong' };
        if (err.code === 11000) {
            data.message += ', the email used already exist'
        }
        var snackbarContainer = document.querySelector('#toast');
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
        console.err(err);
    });
    $('#loading-create-user').hide(200);
}

function listUserInfo() {
    var key = sessionStorage['SessionKey'];
    if (key !== null && key !== undefined) {
        var consultSettings = {
            "async": true,
            "crossDomain": true,
            "url": session_api,
            "method": "GET",
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache"
            },
            "data": { SessionKey: key }
        };
        $.ajax(consultSettings).done((data) => {
            if (data.length > 0) {
                if (data[0] !== null && data[0] !== undefined) {
                    var userDataSettings = {
                        "async": true,
                        "crossDomain": true,
                        "url": userId_api + data[0].user,
                        "method": "GET",
                        "headers": {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "cache-control": "no-cache"
                        },
                        "data": {}
                    };
                    $.ajax(userDataSettings).done((info) => {
                        if (info.message === null || info.message === undefined) {
                            var list = "";
                            list += '<li class="mdl-list__item mdl-list__item--two-line">';
                            list += '<span class="mdl-list__item-primary-content">';
                            list += '<i class="material-icons mdl-list__item-avatar">person</i>';
                            list += '<span>' + info.name + '</span>';
                            list += '<span class="mdl-list__item-sub-title">' + info.email + '</span>';
                            list += '</span>';
                            list += '</li>';
                            $('.list-user-info').html(list);
                        }
                    }).fail((errUsr) => {
                        var data = { message: 'Oops, something went wrong' };
                        var snackbarContainer = document.querySelector('#toast');
                        snackbarContainer.MaterialSnackbar.showSnackbar(data);
                        console.err(err);
                    })
                }
            }
        }).fail((err) => {
            var data = { message: 'Oops, something went wrong' };
            var snackbarContainer = document.querySelector('#toast');
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
            console.err(err);
        })
    } else {
        $('.list-user-info').html(
            '<div class="mdl-card__actions" align="center">'
            + '<p>Start a session to show data of the user.</p>'
            + '</div>'
        );
    }
}

function deleteUser() {
    var emailInput = $('#delete-email').val();
    var passwInput = $('#delete-password').val();
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": user_api,
        "method": "DELETE",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
        },
        "data": { username: emailInput, password: passwInput }
    };
    $.ajax(settings).done((data) => {
        console.log(data);
        var info = { message: 'Oops, something went wrong.' }
        if (data.message !== undefined && data.message !== null) {
            info.message = data.message;
            $('#delete-email').val('');
            $('#delete-password').val('');
            $('#delete-email').focus();
        }
        var snackbarContainer = document.querySelector('#toast');
        snackbarContainer.MaterialSnackbar.showSnackbar(info);
    }).fail((err) => {
        var data = { message: 'Oops, something went wrong' };
        var snackbarContainer = document.querySelector('#toast');
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
        console.error(err);
    });
}
// End Section methods

// start Trigger on load page:
$('#loading-login').hide(0);
$('#loading-create-user').hide(0);
$('#loginBtn').on('click', login);
$('#createUserBtn').on('click', createUser);
$('#email').keypress((e) => {
    if (e.which == 13) {
        $('#password').focus();
    }
});
$('#password').keypress((e) => {
    if (e.which == 13) {
        if ($('#email').val() !== "") {
            login();
        }
    }
});
$('#create-username').keypress((e) => {
    if (e.which == 13) {
        $('#create-email').focus();
    }
});
$('#create-email').keypress((e) => {
    if (e.which == 13) {
        $('#create-password').focus();
    }
});
$('#create-password').keypress((e) => {
    if (e.which == 13) {
        if ($('#create-username').val() === "") {
            $('#create-username').focus();
            return;
        }
        if ($('#create-email').val() === "") {
            $('#create-email').focus();
            return;
        }
        if ($('#create-password').val() === "") {
            $('#create-password').focus();
            return;
        }
        createUser();
    }
});
$('#delete-email').keypress((e) => {
    if (e.which == 13) {
        $('#delete-password').focus();
    }
});
$('#delete-password').keypress((e) => {
    if (e.which == 13) {
        if ($('#delete-email').val() === "") {
            $('#delete-email').focus();
            return;
        }
        if ($('#delete-password').val() === "") {
            $('#delete-password').focus();
            return;
        }
        deleteUser();
    }
});
$('#deleteBtn').on('click', (e) => {
    if ($('#delete-email').val() === "") {
        $('#delete-email').focus();
        return;
    }
    if ($('#delete-password').val() === "") {
        $('#delete-password').focus();
        return;
    }
    deleteUser();
});

// Dialog starter
var dialog = document.querySelector('dialog');
var showDialogButton = document.querySelector('#show-dialog');

if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
}
dialog.querySelector('.close').addEventListener('click', function () {
    dialog.close();
});

// Hide login form if user already logged
loginListener();
listUserInfo();
// End Trigger on load page