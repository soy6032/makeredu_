<template>
  <div id="login">
    <div class="loginWrap">
      <!--<h3 style="text-align: center;" class="loginE">-->
      <!--  학습협업툴 꾸럼e-->
      <!--</h3>-->
      <h3 class="loginTitle">
        로그인
      </h3>
      <div class="com_fonts09">
        이메일
      </div>
      <input v-model="mailId" class="com_input loginEmail com_input100p" type="text" name="email" @input="emailError" @keyup.enter="login">
      <p v-show="mailError" class="errorText">
        이메일 형식이 올바르지 않습니다.
      </p>
      <div class="com_fonts09 passwordL">
        비밀번호
      </div>
      <div class="com_fonts08 passwordR">
        <NuxtLink to="findPassword" class="losePassword">
          비밀번호를 잊으셨나요?
        </NuxtLink>
      </div>
      <input v-model="pw" class="com_input com_input100p" type="password" name="password" @keyup.enter="login">
      <button class="com_fonts10 com_btn_100p com_btn_orange loginBtn" @click="login">
        로그인
      </button>
      <div class="com_fonts09 rightnowWrap">
        아직 꾸럼e 회원이 아니신가요?
        <NuxtLink to="signup">
          <span class="rightnow"> 지금 가입하기</span>
        </NuxtLink>
      </div>
    </div>
    <AlertPop :alertState="alertState" @popClose="alertState = false">
      {{alertCon}}
    </AlertPop>
  </div>
</template>
<script>
export default {
  name: 'Login',
  data () {
    return {
      mailId: '',
      mailError: false,
      pw: '',
      alertState: false,
      alertCon: ''
    };
  },
  mounted () {
    if (this.$store.state.loginState) {
      this.$router.push('/');
    }
  },
  methods: {
    emailError () {
      const idValue = /^[a-z0-9]/i;
      const mailValue = /.+@.+\..[a-z0-9]+/;
      if (!idValue.test(this.mailId) || !mailValue.test(this.mailId)) {
        this.mailError = true;
      } else {
        this.mailError = false;
      }
    },
    login () {
      this.$store.dispatch('login', { email: this.mailId, pw: this.pw })
        .then((res) => {
          if (res.state) {
            this.alertState = true;
            this.alertCon = res.msg;
            if (res.items) { 
              if (this.$store.state.projectUrl) {
                //console.log(this.$store.state.projectUrl);
                this.$router.push(`${this.$store.state.projectUrl}`);
              } else {
                this.$router.push('/'); 
              }
            }
          } else {
            this.alertState = true;
            this.alertCon = "잠시 후 다시 시도하세요.";
          }
        });
    }
  }
};
</script>
<style>
  #login {
    width: 100%;
    height: 486px;
  }
  .loginWrap {
    width: 400px;
    margin: 0 auto;
    margin-top: 202px;
    padding-top: 6px;
    /*position: absolute;*/
    /*top: 50%;*/
    /*left: 50%;*/
    /*transform: translate(-50%, -50%);*/
  }
  /*.loginE {*/
  /*  font-size: 1.6rem;*/
  /*  font-weight: 600;*/
    /*margin-bottom: 5px;*/
  /*}*/
  .loginEmail {
    margin: 5px 5px 0 0;
  }
  .loginTitle {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 30px;
    text-align: center;
  }
  .passwordL {
    float: left;
    margin-top: 15px;
  }
  .passwordR {
    float: right;
    color: #ef8454 !important;
    margin-top: 17px;
  }
  .losePassword {
    color: #ef8454 !important;
  }
  .losePassword:hover {
    text-decoration: underline;
  }
  .loginBtn {
    margin-top: 10px;
  }
  .rightnowWrap {
    text-align: center;
    margin-top: 20px;
  }
  .rightnow {
    color: #ef8454;
    font-weight: 600;
  }
  .rightnow:hover {
    text-decoration: underline;
  }
</style>
