const nodemailer = require("nodemailer");

module.exports = {
  makeId: (length, mail=false) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    if(mail) {
      return result;  
    } else {
      return result + parseInt(new Date().getTime()/1000);  
    }
  },
  sendEmail: async (email, authString) => {
    let transporter = nodemailer.createTransport({
      host: 'smtp.naver.com',
      //port: 465,
      secure: true,
      auth: {
        user: 'choo1982',
        pass: 'choo121903',
      },
    });
    let info = await transporter.sendMail({
      from: 'choo1982@naver.com',
      to: email,
      subject: '꾸럼e 회원가입 인증번호 입니다.',
      text: `인증번호 : ${authString}`
    });
    return info;
  },
  convertDate: (d) => {
    let cDate = new Date(d),
        year  = cDate.getFullYear(),
        m     = cDate.getMonth()+1,
        month = m > 10 ? m : '0'+m,
        date  = cDate.getDate() > 10 ? cDate.getDate() : '0'+cDate.getDate();
    return [year,month,date].join('-');
  }
};
