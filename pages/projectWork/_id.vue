<template>
  <div id="projectWork">
    <div class="proWorkWrap">
      <div class="proTop">
        <div class="projectTitle">
          <h3 class="com_fonts13 proName">
            {{ projectName }}
          </h3>
          <p class="com_fonts10 com_textGray com_fontW600" style="margin-top:-3px;">
            최종완료일<span style="font-size: 1.2rem;"> : </span>{{ projectDate }}
          </p>
        </div>
        <div class="proBtns">
          <button text class="com_btn com_btn_line_orange proBtn120" @click="nickState = true">
            닉네임 설정
          </button>
          <button text class="com_btn com_btn_line_orange proBtn120" @click="entBtn">
            참여자 목록
          </button>
          <button text class="com_btn com_btn_orange proBtn80" @click="invPop = true">
            초대
          </button>
        </div>
      </div>
      <div class="templateWrap">
        <div class="temList">
          <ul class="temLWrap">
            <li v-for="(item, index) in temList" :key="index" class="temItem">
              <div :id="index" :style="{background:'url('+item.img_path+') center center / contain no-repeat'}" class="temImg" @click="changeTem(index)">
              </div>
            </li>
          </ul>
          <v-icon v-show="scrollState" class="listIcon">mdi-arrow-down</v-icon>
        </div>
        <div class="templateWork" id="workArea">
          <div v-html="htmls" ref="myHtml"></div>
        </div>
        <div class="chatWrap">
          <div class="chatting"> 채팅 추후 개발 예정</div>
          <div class="chatInputWrap">
            <input type="text" name="chatting" class="chatInput" />
            <button icon>
              <v-icon class="sendIcon">mdi-arrow-up-circle</v-icon>
            </button>
          </div>
        </div>
      </div>
      <div class="bottomBtn">
        <button class="com_btn_130 com_btn_darkOrange" @click="lastSave">
          최종완료
        </button>
        <button class="com_btn_110 com_btn_orange" @click="saveBtn" style="outline:none;">
          저장
        </button>
      </div>
    </div>
    <v-dialog
      v-model="waitState"
      persistent
      max-width="380"
    >
      <v-card class="alertWrap">
        <div class="waitCon">
          <!--<p class="waitUser"><span style="color:#ef8454;font-size: 0.95rem">{{waitText}}</span> 님이 저장중입니다.</p>-->
          <p class="waitUser">{{waitText}}</p>
        </div>
      </v-card>
    </v-dialog>
    <NickPop :nickState="nickState" :pdx="pdx" @popClose="nickState = false"></NickPop>
    <EntrantPop :entState = "entState" :memList = "memList" @popClose="entState = false" @invOpen="invOpen"></EntrantPop>
    <InvitePop :invPop = "invPop" :URL = "URL" @popClose="invPop = false"></InvitePop>
    <AlertPop :alertState="alertState" :completeSignup="completeSignup" @popClose="alertClose">
      {{alertCon}}
    </AlertPop>
    <ConfirmPop :confirmState="confirmState" @popClose="confirmState = false" @popOk="popOk">
      <p>프로젝트가 최종완료되면 더이상<br>작업이 <span style="color:#ff0000;font-weight: 600;">불가능</span>합니다. 프로젝트를<br>최종완료</span>하시겠습니까?</p>
    </ConfirmPop>
  </div>
</template>
<script>
export default {
  name: 'ProjectWork',
  middleware: 'client',
  data () {
    return {
      selectSection: 1,
      htmls: '',
      code: '',
      projectName: '',
      projectDate: '',
      pickTemplate: null,
      nickState: false,
      entState: false,
      invPop: false,
      confirmState:false,
      alertState: false,
      alertCon: '',
      scrollState: false,
      temList: [],
      pdx: null,
      memList: [],
      URL: null,
      save: 0,
      socket: '',
      pushRecord: [],
      contentsRecord:[],
      waitState: false,
      waitText : '',
      resState: '',
      completeSignup: false,
      keypressing: false,
      ctrlkey: '',
      ctrlDown: false,
      ctrlKey: 17,
      cmdKey: 91,
      vKey: 86,
      cKey: 67
    };
  },
  created() {
    if (!this.$store.state.loginState) {
      this.$store.commit('setProjectUrl', window.location.pathname);
      this.$router.push('/login');
    }
    
  },
  mounted() {
    //console.log(this.$route.params.id);
    this.$route.params.id ? this.code = this.$route.params.id : this.$router.push('/');
    this.projectCheck();
    this.socketEvent();
    //this.autoSaveTimer();
  },
  methods: {
    socketEvent() {
      this.socket = this.$nuxtSocket({
        name: 'projectRoom',
        channel: '/index'
      });
      
      this.socket.emit('join', {
        code: this.code, 
        email: this.$store.state.email
      });
      
      this.socket.on('joinUser', data => {
        // console.log(data);
        // console.log(data.msg);
        if(data.total === 1) {
          //this.getProject(data.total);
          this.getProject(data.total);
        }
      });
      
      this.socket.on('reqHtml', data => {
        //console.log('client reqHtml');
        //console.log(this.$refs.myHtml.innerHTML);
        let resData = new Object();
        resData.to = data.sendUser;
        resData.htmls = this.$refs.myHtml.innerHTML;
        this.socket.emit('resHtml', resData);
      });
      
      this.socket.on('reciveHtml', data => {
        // console.log('reciveHtml');
        // console.log(data);
        this.getProject();
        this.htmls = data;
      });
      
      this.socket.on('logout', (data) => {
        // console.log(`${data} 님이 나갔습니다.`);
        this.logoutInit(data);
      });
      
      this.socket.on('async', (data) => {
        //console.log(data);
        this.merge(data);
      });
      // 중도 입장 유저가 현재 유저들이 선택중인 영역 요청
      this.socket.on('requestPushRecord', (data) => {
        //console.log('pushRecords request');
        this.socket.emit('recordsMerge', {
          to: data,
          record: this.pushRecord 
        });
      });
      // 위의 요청에 대한 응답
      this.socket.on('resRecords', (data) => {
        // console.log(data);
        if(data.length > 0) this.merge(data[0]);
      });
      
      this.socket.on('reqAutoSave', () => {
        // console.log("autoSave");
        this.saveBtn('auto');
      });
      
      this.socket.on('alert', (data) => {
        // console.log('saveBtn');
        if(data.email !== this.$store.state.email) {
          // console.log(data);
          if(data.action === 'save') {
            this.waitText = `${data.email} 님이 저장 중 입니다.`;
            this.waitState = true;
          }
          if(data.action === 'saveEnd') {
            this.waitText = data.msg;
            setTimeout( function(){
              this.waitState = false;
            }.bind(this), 1000);
          }
          if(data.action === 'finalSave') {
            this.waitText = data.msg;
            this.waitState = true;
          }
          if(data.action === 'finalSaveEnd') {
            this.waitState = false;
            this.resState = data.result;
            this.alertCon = data.msg;
            this.alertState = true;
          }
        }
      });
    },
    projectCheck() {
      this.$axios.get(`/client/checkProject/${this.code}`)
      .then((res) => {
        // console.log(res);
        if(!res.data.state) {
          this.alertCon = res.data.msg;
          this.alertState = true;
          this.resState = res.data.state;
        }
      });
    
    },
    logoutInit(email) {
      const section = this.$refs.myHtml.getElementsByClassName('section');
      for(let[i, e] of Object.entries(section)) {
        let select = e.getElementsByClassName('select');
        for(let[j, el] of Object.entries(select)) {
          if(el.getAttribute('data-user') == email) {
            // console.log('here');
            el.removeAttribute('data-user');
            el.removeAttribute('data-state');
          }
        }
      }
    },
    merge(data) {
      //console.log(data);
      this.contentsRecord.push(data);
      let section = this.$refs.myHtml.getElementsByClassName(data.section);
      let select = section[0].getElementsByClassName(data.select);
      
      if(data.type === 'action') {
        if(data.action_type ==='in') {
          select[0].setAttribute('data-user', data.who);
          select[0].setAttribute('data-state', data.state);
          select[0].setAttribute('disabled', true);
        }
        if(data.action_type == 'out') {
          select[0].removeAttribute('data-user');
          select[0].removeAttribute('data-state');
          select[0].removeAttribute('disabled');
        }  
      }
      if(data.type === 'keyEvent') {
        if(select[0].tagName === 'INPUT') select[0].value = data.str;
        if(select[0].tagName === 'TEXTAREA') select[0].innerText = data.str;
      }
      if(data.type === 'img') {
        if(select[0].getElementsByTagName('img')[0]) {
          select[0].removeChild(select[0].getElementsByTagName('img')[0]);
        }
        let img = document.createElement('img');
        img.setAttribute('src', data.str);
        img.addEventListener('click', function(e) {
          select[0].getElementsByTagName('input')[0].click();
        });
        select[0].getElementsByTagName('p')[0].style.display = 'none';
        select[0].getElementsByTagName('label')[0].style.display = 'none';
        select[0].appendChild(img);
      }
    },
    getProject(total = 0) {
      this.URL = window.location.href;
      this.$refs.myHtml.style.display = 'none';
      this.$axios.post('/client/getProject', {
        code: this.code
      }).then((res) => {
        //console.log(res);
        if(res.data.state) {
          this.projectName = res.data.item[0].name;
          this.projectDate = this.convertDate(res.data.item[0].close_date);
          this.temList = res.data.item;
          this.pdx = res.data.item[0].idx;
          this.save = res.data.item[0].save;
          if(total === 1) {
            this.htmls = res.data.item[0].contents;
          }
          setTimeout( function(){
            this.initTemplate();
            this.$refs.myHtml.style.display = 'block';
            this.initPage();
          }.bind(this),500);
          if(this.temList.length >= 6) {
            this.scrollState = true;
          } else {
            this.scrollState = false;
          }
          this.checkFirstjoin();
        } else {
          this.alertCon = res.data.msg;
          this.alertState = true;
          this.resState = res.data.state;
        }
      });
    },
    alertClose() {
      this.alertState = false;
      if(!this.resState) {
        this.$router.push(`/management`);
        // if(data.items === "management") this.$router.push(`/management`);
        // else this.$router.push('/');
      }
    },
    initTemplate() {
      let section = this.$refs.myHtml.getElementsByClassName('section');
      for(let[i, el] of Object.entries(section)) {
        if(i == 0) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
        if(this.save === 0) {
          let select = el.getElementsByClassName('select');
          for(let[j, sel] of Object.entries(select)) {
            sel.className += " select_"+j;
          }
        }
      }
    },
    initPage() {
      let currentSection = this.$refs.myHtml.getElementsByClassName('section'+this.selectSection);
      let inputArea = currentSection[0].getElementsByClassName('select');
      let imgArea = currentSection[0].getElementsByClassName('imgUpload');
      for(let [i, el] of Object.entries(imgArea)) {
        let input = el.getElementsByTagName('input')[0];
        let select = el.className.split(" ")[1];
        var _this = this;
        input.addEventListener('change', function(e) {
          if(e.target.files.length > 0) {
            let formData = new FormData();
            formData.append('url', _this.code);
            formData.append('email', _this.$store.state.email);
            formData.append('section', 'section' + _this.selectSection);
            formData.append('select', select);
            formData.append('img', e.target.files[0]);
            _this.$axios.post("/client/imagesUpload", formData,
            { headers : { "enctype": "multipart/form-data" }})
            .then((res) => {
              // console.log(res);
              if(el.getElementsByTagName('img')[0]) {
                el.removeChild(el.getElementsByTagName('img')[0]);
              }
              let src = `..${res.data.items[0].path}`;
              let img = document.createElement('img');
              img.setAttribute('src', src);
              img.addEventListener('click', function(e) {
                e.preventDefault();
                el.getElementsByTagName('input')[0].click();
              });
              el.appendChild(img);
              el.getElementsByTagName('label')[0].style.display = 'none';
              el.getElementsByTagName('p')[0].style.display = 'none';
              _this.socket.emit('push', _this.setData(select, 'img', 'insert', '', src));
            });
          } else {
            return false;
          }
        });
        
        if(el.getElementsByTagName('img')[0]){
          el.getElementsByTagName('img')[0].addEventListener('click', function(e) {
            el.getElementsByTagName('input')[0].click();
          });
        }
      }
      
      for(let [i, el] of Object.entries(inputArea)) {
        el.addEventListener('focusin', (e) => {
          // console.log(`${e.target.getAttribute('data-user')} ${e.target.getAttribute('data-state')}`);
          // 1. 선택한 영역이 선택되어있는 영역인가? v
          // YES: 선택 불가 
          // NO : local dom에  data-user , data-state 세팅 (pull) v
          // 2. socket 에 email, section, select, state (push) v
          // 3. socket 에서 나를 제외한 프로젝트 참여자들에게 (socket.to().emit()) (send) v
          // 4. 데이터를 받은 참여자들은 data 동기화 (merge) v
          
            
          if(e.target.getAttribute('data-user') && e.target.getAttribute('data-state')) {
            
          } else {
            el.style.border = "2px solid #ef8454";
            el.style.outline = "none";
            e.target.setAttribute('data-user', this.$store.state.email);
            e.target.setAttribute('data-state', 'w');
            let select = el.className.split(' ')[1];
            this.socket.emit('push', this.setData(select, 'action', 'in', 'w'));
            this.pushRecord.push(this.setData(select, 'action', 'in', 'w')); 
          }
        });
        
        el.addEventListener('focusout', (e) => {
          if(el.tagName === 'INPUT') el.style.border ="none";
          if(el.tagName === 'TEXTAREA') el.style.border ="none";
          let select = el.className.split(' ')[1];
          e.target.removeAttribute('data-user');
          e.target.removeAttribute('data-state');
          let outData = this.setData(select, 'action', 'out', '', el.value);
          this.contentsRecord.push(outData);
          this.socket.emit('push', outData);
          
        });
        
        el.addEventListener('keydown', (e) => {
          // if((e.keyCode == 17 || e.keyCode === 86 || e.keyCode === 91) && this.ctrlkey == '') {
          //   this.ctrlkey = e.keyCode;
          // }
          // if((e.keyCode === 86 || e.keyCode === 91) && this.ctrlkey!='') {
          //   alert("복사되었습니다.");
          //   this.ctrlkey = '';
          // }
          // console.log(e.keyCode);
          // if(e.keyCode == this.ctrlKey || e.keyCode == this.cmdKey) {
          //   this.ctrlDown = true;
          //   console.log(this.ctrlDown);
          // }
          // if(this.ctrlDown && (e.keyCode == this.cKey)) {
          //   alert('복사됨');
          // }
          // if(this.ctrlDown && (e.keyCode == this.vKey)) { 
          //   alert('붙여넣기');
          // }
        });
        
        el.addEventListener('keyup', (e) => {
          if(e.keyCode == this.ctrlKey || e.keyCode == this.cmdKey) this.ctrlDown = false; 
          let select = el.className.split(' ')[1];
          if(el.tagName === "INPUT") el.setAttribute('value', el.value);
          if(el.tagName === "TEXTAREA") {
            if(el.scrollTop > 0) {
              alert("허용된 영역을 벗어났습니다.\n출력시 글자가 짤릴 수 있습니다.");
              el.scrollTop = 0;
              return false;
            } else {
              el.innerText = el.value;
            }
          }
          this.socket.emit('push', this.setData(select, 'keyEvent', 'insert', '', el.value));
        });
      }
    },
    // select : 선택한 영역
    // type : action or keyEvent or img
    // action_type : in or out or insert
    // state : w ( write ) or ''
    // str : string
    setData(select, type, action_type, state = '', str = '') {
      let pushData = {
        code: this.code,
        who: this.$store.state.email,
        section: 'section' + this.selectSection,
        select: select,
        action_type: action_type,
        state: state,
        type: type,
        str: str
      }
      return pushData;
    },
    checkFirstjoin() {
      this.$axios.post('/client/checkMember',{
        email: this.$store.state.email,
        pdx: this.pdx
      })
      .then((res) => {
        if(!res.data.items) {
          this.nickState = true;
        }
      });
    },
    entBtn() {
      this.$axios.post('/client/getJoinMembers', { pdx: this.pdx })
      .then((res) => {
        this.entState = true;
        this.memList = res.data.items;
      });
    },
    changeTem (index) {
      this.selectSection = index + 1;
      let section = this.$refs.myHtml.getElementsByClassName('section');
      document.getElementById(0).style.border = "none";
      for(let i = 0; i<this.temList.length; i++) {
        if(i !== index) {
          document.getElementById(i).style.border = "none";
        }else {
          document.getElementById(i).style.border = "2px solid #ef8454";
          document.getElementById(i).style.borderRadius = "5px";
        }
      }
      for(let [i, el] of Object.entries(section)) {
        if(index == i) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      }
      this.initPage();
    },
    lastSave() {
      this.$axios.post(`/client/checkCreator`, {
        code: this.code,
        idx: this.$store.state.userIdx
      }).then((res) => {
        if(!res.data.state) {
          this.alertCon = res.data.msg;
          this.alertState = true;
          this.resState = true;
        } else {
          this.confirmState = true; //프로젝트 장일때만
        }
      });
    },
    saveBtn(type="") {
      let data = {
        code: this.code,
        email: this.$store.state.email,
        action: 'save',
        msg: '저장중 입니다.'
      };
      if(type !== "auto") this.socket.emit('saveBtn', data);
      
      //console.log(this.$refs.myHtml.innerHTML);
      let htmls = this.$refs.myHtml.innerHTML;
      this.$axios.post('/client/saveHtml', {
        html: htmls,
        code: this.code
      }).then((res) => {
        if(type !=="auto") {
          data.action = "saveEnd";
          this.waitState = true;
          this.waitText = res.data.msg;
          setTimeout( function() {
            data.msg = res.data.msg;
            this.socket.emit('saveBtn', data);
            this.waitState = false;
          }.bind(this), 1000);
        } 
      });
    },
    invOpen() {
      this.entState = false;
      this.invPop = true;
    },
    popOk() {
      this.confirmState = false;
      let data = {
        code: this.code,
        action: 'finalSave',
        result: false,
        msg: '프로젝트 장이 최종완료 중 입니다.'
      };
      let htmls = this.$refs.myHtml.innerHTML;
      this.socket.emit('saveBtn', data);
      this.$axios.post('/client/finalSave', {
        html: htmls,
        code: this.code,
        idx: this.$store.state.userIdx
      }).then((res) => {
        if(res.data.state) this.resState = false;
        else this.resState = true;
        data.msg = res.data.msg;
        data.action = 'finalSaveEnd';
        data.result = this.resState;
        setTimeout( function() {
          this.socket.emit('saveBtn', data);
          this.alertCon = res.data.msg;
          this.alertState = true;
        }.bind(this), 1000);
      });
    },
    convertDate(oriDate) {
      let cDate = new Date(oriDate),
          year  = cDate.getFullYear(),
          m     = cDate.getMonth()+1,
          month = m > 10 ? m : '0'+m,
          date  = cDate.getDate() > 10 ? cDate.getDate() : '0'+cDate.getDate(),
          hour  = cDate.getHours(),
          min   = cDate.getMinutes(),
          sec   = cDate.getSeconds();
      // return [year,month,date].join('-') + " " + [hour,min,sec].join(':');
      return [year,month,date].join('-');
    }
  }
};
</script>
<style>
  .proWorkWrap {
    width: 1200px;
    margin: 0 auto;
    margin-top: 110px;
    overflow: hidden;
  }
  .proTop {
    width: 100%;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .projectTitle {
    float: left;
  }
  .proName {
    width: 700px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1; /* 라인수 */
    -webkit-box-orient: vertical;
    word-wrap:break-word;
  }
  .proBtns {
    float: right;
    margin-top: 15px;
  }
  .proBtns button {
    margin-right: 5px;
  }
  .proBtns button:last-child {
    margin-right: 0;
  }
  .proBtn120 {
    width: 120px;
    height: 40px;
  }
  .proBtn80 {
    width: 80px;
    height: 40px;
  }
  .templateWrap {
    width: 100%;
    height: 630px;
  }
  .temList {
    float: left;
    width: 150px;
    height: 100%;
    /*background-color: #e5e5e5;*/
    margin-right: 20px;
    padding: 10px;
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    border: 1px solid #959595;
  }
  .temLWrap {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding-left: 0 !important;
  }
  .temLWrap::-webkit-scrollbar {
    display: none;
  }
  .listIcon {
    position: absolute !important;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: #ef8454 !important;
    background: white;
    border-radius: 50px;
    font-size: 1.6rem !important;
  }
  .temItem {
    width: 100%;
    height: 95px;
    margin-bottom: 15px;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    cursor: pointer;
    /*padding: 5px;*/
  }
  .temItem:first-child div {
    border: 2px solid #ef8454;
    border-radius: 5px;
  }
  .temItem:last-child {
    margin-bottom: 0;
  }
  .templateWork {
    float: left;
    border: 1px solid #959595;
    border-radius: 5px;
    width: calc(100% - 420px);
    height: 100%;
    padding: 10px;
    overflow: hidden;
    position: relative;
  }
  .chatWrap {
    float: right;
    width: 230px;
    height: 100%;
    /*background-color: #e5e5e5;*/
    border: 1px solid #959595;
    /*box-shadow: 0 0 10px #959595;*/
    margin-left: 20px;
    /*padding: 10px;*/
    border-radius: 5px;
  }
  .chatting {
    /*width: 100%;*/
    height: 563px;
    border: 1px solid #e5e5e5;
    margin: 10px 10px 0px 10px;
    border-radius: 5px;
    /*padding: 10px;*/
    /*border-bottom: 1px solid #959595;*/
  }
  .chatInputWrap {
    width: 100%;
    /*height: 35px;*/
    padding: 10px;
  }
  .chatInput {
    width: calc(100% - 37.2px);
    height: 35px;
    float: left;
    padding-left: 5px;
    font-size: 0.9rem;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
  }
  .sendIcon {
    font-size: 1.7rem;
    color: #ef8454 !important;
    float: left;
    padding-top: 5px;
    margin-left: 10px;
  }
  .bottomBtn {
    float:right;
    margin-top: 20px
  }
  .bottomBtn button:first-child {
    margin-right: 5px;
  }
  .waitCon {
    text-align: center;
    font-size: 1rem;
  }
  .waitUser {
    font-size: 0.9rem !important;
    margin-bottom: 10px !important;
  }
  .waitCon p {
    font-weight: 600;
  }
</style>
