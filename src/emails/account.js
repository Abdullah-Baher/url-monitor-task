const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = async (email, name) => {
    await sgMail.send({
        to: email,
        from: 'Abdullah.Mohamed.Baher@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}


const sendWhyCancelEmail = (email,  name) => {
    sgMail.send({
        to: email,
        from: 'Abdullah.Mohamed.Baher@gmail.com',
        subject: 'Canceling Profile',
        text: `Hello ${name}, why are you canceling your account did something happen?`
    })
}

const sendCheckUpEmail = (email, name, url) => {
    sgMail.send({
        to: email,
        from: 'Abdullah.Mohamed.Baher@gmail.com',
        subject: 'URL status health check',
        text: `Hello ${name}, We would like to tell you that your url: ${url} is up and working`
    });
}


const sendCheckDownEmail = (email, name, url) => {
    sgMail.send({
        to: email,
        from: 'Abdullah.Mohamed.Baher@gmail.com',
        subject: 'URL status health check',
        text: `Hello ${name}, Unfortunately we would like to inform you that your url: ${url} is down and not working`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendWhyCancelEmail,
    sendCheckUpEmail,
    sendCheckDownEmail
}