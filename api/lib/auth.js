const jwt = require("jsonwebtoken");
const secret = require("../config/jwt.js");

module.exports = {
  createToken: (userid, account_type) => {
    let token = jwt.sign({ id: userid }, secret.secretKey, { expiresIn: '360m' });
    return token;
  },
  decodeToken: async (token) => {
    try{
      // 현재 토큰을 받아서 디코드
      let decoded = await jwt.verify(token, secret.secretKey);
      // 토큰이 현재 유효한지 체크
      if(decoded) return decoded;
      else return false;
    } catch(e) {
      return false;
    }
  }
};