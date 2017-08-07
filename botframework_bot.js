process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var Botkit = require('../lib/Botkit.js');
var os = require('os');
var commandLineArgs = require('command-line-args');
//var localtunnel = require('localtunnel');
var twilio = require('twilio');

//const ops = commandLineArgs([
//      {
//          name: 'lt', alias: 'l', args: 1, description: 'Use localtunnel.me to make your bot available on the web.',
//          type: Boolean, defaultValue: false
//      },
//      {
//          name: 'ltsubdomain', alias: 's', args: 1,
//          description: 'Custom subdomain for the localtunnel.me URL. This option can only be used together with --lt.',
//          type: String, defaultValue: null
//      },
//]);

//if (ops.lt === false && ops.ltsubdomain !== null) {
//    console.log("error: --ltsubdomain can only be used together with --lt.");
////    process.exit();
//}

var controller = Botkit.botframeworkbot({
    debug: true
});

var bot = controller.spawn({
    appId: 'ea9f06e4-e2af-46c9-bcc5-f59c48437d3e',
    appPassword: 'sRYxAJ8Aiu9yy9ejNVgezxW'
});

var ngrok = require('ngrok');

controller.setupWebserver(8080, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        ngrok.connect(8080, function (err, url) {
            console.log("bot is online at: " + url + '/botframework/receive');
            if (err) {
                console.log(err);
                ngrok.disconnect();
            }
        });
    });
});


//controller.setupWebserver(process.env.port || 3000, function (err, webserver) {
//    controller.createWebhookEndpoints(webserver, bot, function () {
//        console.log('ONLINE!');
//        if (ops.lt) {
//            var tunnel = localtunnel(process.env.port || 3000, { subdomain: ops.ltsubdomain }, function (err, tunnel) {
//                if (err) {
//                    console.log(err);
//                    process.exit();
//                }
//                console.log("Your bot is available on the web at the following URL: " + tunnel.url + '/botframework/receive');
//            });

//            tunnel.on('close', function () {
//                console.log("Your bot is no longer available on the web at the localtunnnel.me URL.");
//                process.exit();
//            });
//        }
//    });
//});

controller.hears(['hello', 'hi','hey'], 'message_received', function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '! What can I do for you today?');
        } else {
            bot.reply(message, 'Hello. What can I do for you today?');
        }
    });
});

controller.hears(['I�d like to report a leak', 'I want to report a leak'], 'message_received', function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Bear with me...' + user.name + ' I have ordered an emergency plumber. He should be with you in 90 minutes. His name is Stuart.');
            client.sendMessage({
                to: '+918880344406',
                from: '+14157231576',
                body: 'Hi Stuart, there is a leak in flat 3 on the 2nd floor at Cherry Orchard. Please click here to see the plumbing configuration of the affected area. Seems to be burst pipe. Please confirm that you can get there within 90 mins'
            });

        } else {
            bot.reply(message, 'Bear with me...I have ordered an emergency plumber. He should be with you in 90 minutes. His name is Stuart.');
            client.sendMessage({
                to: '+918880344406',
                from: '+14157231576',
                body: 'Hi Stuart, there is a leak in flat 3 on the 2nd floor at Cherry Orchard. Please click here to see the plumbing configuration of the affected area. Seems to be burst pipe. Please confirm that you can get there within 90 mins'
            });
        }
    });
});

controller.hears(['call me (.*)'], 'message_received', function (bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    controller.storage.users.get(message.user, function (err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function (err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'message_received', function (bot, message) {

    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.reply(message, 'I don\'t know yet!');
        }
    });
});


//controller.hears(['shutdown'], 'message_received', function (bot, message) {

//    bot.startConversation(message, function (err, convo) {
//        convo.ask('Are you sure you want me to shutdown?', [
//            {
//                pattern: bot.utterances.yes,
//                callback: function (response, convo) {
//                    convo.say('Bye!');
//                    convo.next();
//                    setTimeout(function () {
//                        process.exit();
//                    }, 3000);
//                }
//            },
//        {
//            pattern: bot.utterances.no,
//            default: true,
//            callback: function (response, convo) {
//                convo.say('*Phew!*');
//                convo.next();
//            }
//        }
//        ]);
//    });
//});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], 'message_received', function (bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message, 'I am a bot! I have been running for ' + uptime + ' on ' + hostname + '.');

});

controller.hears(['cookies'], 'message_received', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.say('Did someone say cookies!?!!');
        convo.ask('What is your favorite type of cookie?', function (response, convo) {
            convo.say('Golly, I love ' + response.text + ' too!!!');
            convo.next();
        });
    });
});


controller.hears(['reset my password', 'reset password', 'change password', 'change my password', 'password reset'], 'message_received', function (bot, message) {
    bot.startConversation(message, function (err, convo) {
        var email;
        var pass;
        var mobile;
        var phoneverified;
        var emailverified;
        var ldapjs = require('ldapjs');
        var errflag = false;
        var conn = new sql.Connection(webconfig);

        convo.say('Sure thing...');
        convo.ask('What is your username? ', function (response, convo) {
            username = response.text;
            //verify if user exists
            ad.userExists(username, function (err, exists) {
                if (exists) {
                    console.log(username + ' exists: ' + exists);
                    conn.connect().then(function () {
                        var req = new sql.Request(conn);
                        req.input('input_parameter', sql.VarChar(20), username).query('SELECT * FROM userdetails where username = @input_parameter').then(function (recordset) {
                            console.log("recordset started");
                            console.log(recordset);
                            console.log("recordset end");
                            email = recordset[0].emailID;
                            mobile = recordset[0].phonenumber;
                            console.log("email ID:" + recordset[0].emailID);

                            phoneverified = recordset[0].phoneverified;
                            emailverified = recordset[0].emailverified;
                            if (phoneverified == 'y' || emailverified == 'y') {
                                otp = generator.generate({
                                    length: 6,
                                    numbers: true
                                });
                                var message = {
                                    text: "This is your One Time Password: " + otp,
                                    from: "saikiran121993@outlook.com",
                                    to: "" + email + "",
                                    cc: "",
                                    subject: "Password Reset",
                                };
                                server.send(message, function (err, message) { console.log(err || message); });
                                convo.next();

                                convo.ask('Please provide your OTP sent to your mail', function (response, convo) {
                                    var verifyOTP = response.text;
                                    convo.next();
                                    if (verifyOTP.toString() == otp.toString()) {
                                        verifyOtpFlag = true;
                                        console.log("OTP verified");
                                        convo.say("OTP verified");
                                        pass = generator.generate({
                                            length: 8,
                                            numbers: true
                                        });
                                        const ldapClient = ldapjs.createClient({
                                            url: 'ldaps://WIN-1L090GJ31KQ'
                                        });
                                        ldapClient.bind(ldapOptions.username, ldapOptions.bindCredentials, function (err) {
                                            var userdn = 'CN=' + username + ',CN=Users,DC=Bangalore,DC=local';
                                            console.log("Binded");
                                            ldapClient.search(userdn, function (err, search) {
                                                search.on('searchEntry', function (entry) {
                                                    var user = entry.object;
                                                    convo.say("Please wait while I reset your password...");
                                                    //convo.say("User: " + JSON.stringify(user));
                                                    console.log(user.objectGUID);
                                                    var passwordNew = pass;
                                                    ldapClient.modify(user.dn, [
                                                        new ldapjs.Change({
                                                            operation: 'replace',
                                                            modification: {
                                                                unicodePwd: encodePassword(passwordNew)
                                                            }
                                                        }),
                                                    ], function (err) {
                                                        if (err) {
                                                            console.log(err.code);
                                                            console.log(err.name);
                                                            console.log(err.message);
                                                            convo.say("Error message: " + err.message);
                                                            ldapClient.unbind();
                                                        }
                                                        else {
                                                            console.log('Password changed!');
                                                            convo.say("Password changed!");
                                                            convo.say("Please Wait while I send you temporary password to your mail and mobile....");
                                                            twilioClient.sendMessage({
                                                                to: mobile,
                                                                from: '+13233103746 ',
                                                                body: 'Please Use' + pass + ' as temporary password for next login, your password is confidential. Sharing it with anyone gives them full access to your account'
                                                            });
                                                            var message = {
                                                                text: 'please Use' + pass + ' as temporary password for login, your password is confidential. Sharing it with anyone gives them full access to your account',
                                                                from: "saikiran121993@outlook.com",
                                                                to: "" + email + "",
                                                                cc: "",
                                                                subject: "Password reset",
                                                            };
                                                            // send the message and get a callback with an error or details of the message that was sent 
                                                            server.send(message, function (err, message) {
                                                                console.log(err || message);
                                                            });
                                                            convo.say("Hey " + username + " ,I sent you temporary password to your mail and mobile");
                                                            convo.say("Anything else you want me to do?");
                                                            convo.next();
                                                        }
                                                    });
                                                });
                                            });
                                        }).catch(function (err) {
                                            console.log(err);
                                        });
                                    }
                                    else {
                                        convo.say("Invalid OTP");
                                        convo.next();
                                    }
                                });
                                conn.close();
                            }
                            else {
                                convo.say('I am sorry, please verify your email ID or phone number');
                                convo.ask('Do you want me to verify?', function (response, convo) {
                                    if (response.text == 'yes') {
                                        if (phoneverified != 'y') {
                                            var mobileOTP = generator.generate({
                                                length: 4,
                                                numbers: true
                                            });
                                            twilioClient.sendMessage({
                                                to: mobile,
                                                from: '+13233103746',
                                                body: 'Your mobile verification OTP: ' + mobileOTP
                                            });
                                            convo.next();
                                            convo.ask('Please enter the OTP sent to your mobile', function (response, convo) {
                                                if (response.text == mobileOTP) {
                                                    convo.say('Mobile verfication done');
                                                    var conn = new sql.Connection(webconfig);
                                                    conn.connect().then(function () {
                                                        var req = new sql.Request(conn);
                                                        req.input('input_parameter1', sql.VarChar(20), username).input('input_parameter2', sql.Char, "y").query('Update userdetails set phoneverified= @input_parameter2 where username = @input_parameter1').then(function (recordset) {
                                                            console.log(recordset);
                                                            conn.close();
                                                        })
                                                        .catch(function (err) {
                                                            console.log(err);
                                                            conn.close();
                                                        });
                                                    })
                                                    .catch(function (err) {
                                                        console.log(err);
                                                    });

                                                    convo.next();
                                                }
                                                else {
                                                    convo.say('Mobile verification failed');
                                                    convo.next();
                                                }
                                            });
                                        }

                                        if (emailverified != 'y') {
                                            var emailOTP = generator.generate({
                                                length: 4,
                                                numbers: true
                                            });
                                            var message = {
                                                text: "Your email verification OTP: " + emailOTP,
                                                from: "saikiran121993@outlook.com",
                                                to: "" + email + "",
                                                cc: "",
                                                subject: "Email Verification",
                                            };
                                            // send the message and get a callback with an error or details of the message that was sent 
                                            server.send(message, function (err, message) {
                                                console.log(err || message);
                                            });
                                            convo.next();
                                            convo.ask('Please enter the OTP sent to your email', function (response, convo) {
                                                if (response.text == emailOTP) {
                                                    convo.say('Email verfication done');
                                                    var conn = new sql.Connection(webconfig);
                                                    conn.connect().then(function () {
                                                        var req = new sql.Request(conn);
                                                        req.input('input_parameter1', sql.VarChar(20), username).input('input_parameter2', sql.Char, "y").query('Update userdetails set emailverified= @input_parameter2 where username = @input_parameter1').then(function (recordset) {
                                                            console.log(recordset);
                                                            conn.close();
                                                        })
                                                        .catch(function (err) {
                                                            console.log(err);
                                                            conn.close();
                                                        });
                                                    })
                                                    .catch(function (err) {
                                                        console.log(err);
                                                    });

                                                    convo.next();
                                                }
                                                else {
                                                    convo.say('email verification failed');
                                                    convo.next();
                                                }
                                            });
                                        }

                                    }
                                    else {
                                        convo.say('Please verify your account to reset the password');
                                        convo.next();
                                    }
                                });
                                convo.next();
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                            conn.close();
                        });
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }
                else {
                    convo.say("Sorry I cannot find you. Please check the username and try again...");
                    convo.say("Anything else you want me to do?");
                    convo.next();
                }
            });
        });
    });
});

function encodePassword(password) {
    return new Buffer('"' + password + '"', 'utf16le').toString();
}


controller.hears(['Users', 'list all users'], 'message_received', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        var ActiveDirectory = require('activedirectory');
        var config = {
            url: 'ldaps://WIN-1L090GJ31KQ',
            baseDN: 'CN=Users,DC=Bangalore,DC=local',
            username: 'Administrator@bangalore.local',
            password: 'Proarch@blr'
        }
        var ad = new ActiveDirectory(config);
        var query = 'cn=*';
        ad.findUsers(query, true, function (err, users) {
            if (err) {
                console.log('ERROR: ' + JSON.stringify(err));
                return;
            }

            if ((!users) || (users.length == 0))
                console.log('No users found.');
            else {
                console.log('findUsers: ' + JSON.stringify(users));
                convo.say("Users: " + JSON.stringify(users));
            }

        });
    });
});





function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
