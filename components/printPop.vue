<template>
  <div id="printPop">
    <v-dialog
        v-model="printState"
        persistent
        max-width="1000"
      >
        <v-card class="printPopWrap">
          <v-icon class="closeIcon" @click="exit">
            mdi-close
          </v-icon>
          <h3 class="com_fonts11">개인정보를 입력하시면 출력물에 포함이 되어 출력됩니다.</h3>
          <div class="privacy">
            <span class="com_fonts09">학교명</span>
            <input type="text" name="userSchool" v-model="userSchool" class="com_input privName" />
            <input type="text" name="userClass" v-model="userGrade" class="com_input userGrade" />
            <span class="com_fonts09">학년</span>
            <input type="text" name="userClass" v-model="userClass" class="com_input privClass" />
            <span class="com_fonts09">반</span>
            <input type="text" name="userNumber" v-model="userNumber" class="com_input privNumber" />
            <span class="com_fonts09">번호</span>
            <span class="com_fonts09 userName">이름</span>
            <input type="text" name="userName" v-model="userName" class="com_input privName" />
          </div>
          <div class="checkWrap">
            <v-checkbox v-model="checkAll" label="전체페이지출력" value="checkAll" @change="checkAllState" class="checkA"></v-checkbox>
            <v-checkbox v-model="checkPart" label="부분출력" value="checkPart" @change="checkPartState" class="checkP"></v-checkbox>
            <input class="com_input pageInput" type="text" name="pageInput" v-model="pageNum" :disabled="disabled" />
            <p class="checkEx">페이지 번호나 범위를 쉼표( , )나 하이픈( - )으로 구분하여 다음과 같이 입력하세요. 예) 1,3,5-12</p>
          </div>
          <div class="slideImgWrap">
            <client-only>
              <vue-html2pdf
                :filename="fileName"
                :show-layout="true"
                :float-layout="false"
                :enable-download="true"
                :preview-modal="false"
                :manual-pagination="true"
                :pdf-quality="1.0"
                :paginate-elements-by-height="1400"
                pdf-format="a4"
                pdf-orientation="landscape"
                pdf-content-width="1200px"
                ref="html2Pdf"
              >
                <section slot="pdf-content" v-html="html" id="test" ref="myHTML" style="margin-bottom: 0px;"></section>
              </vue-html2pdf>  
            </client-only>
          </div>
          
          <div class="slideNumber">
            <div>{{ page }} / {{ total }}</div>
            <v-icon class="prevIcon" @click="prev">mdi-arrow-left</v-icon>
            <v-icon class="nextIcon" @click="next">mdi-arrow-right</v-icon>
          </div>
          <div class="prinBtnWrap">
            <p class="printBtnEx">*인증출력은 메이커에듀에서 인증하는 인증마크가 포함이 되어 출력됩니다.</p>
            <button class="com_btn com_btn_130 com_btn_orange certifiBtn" @click="certifi">인증출력</button>
            <button class="com_btn com_btn_130 com_btn_darkOrange" @click="print">출력하기</button>
          </div>
        </v-card>
      </v-dialog>
      <AlertPop :alertState="alertState" :alertCon="alertCon" @popClose="alertState = false">
        {{alertCon}}
      </AlertPop>
      <ConfirmPop :confirmState="confirmState" @popClose="confirmState = false" @popOk="popOk">
        <p v-show="certifiShow" style="font-size:0.85rem">메이커에듀의 인증마크가 출력물에 포함이 되어 출력되며 별도의 비용이 발생합니다. 출력하기를 진행하시겠습니까?</p>
        <p v-show="printShow">출력하시겠습니까?</p>
      </ConfirmPop>
    </div>
</template>
<script>
  import html2pdf from 'vue-html2pdf';
  import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';

  export default {
    name: 'PrintPop',
    props: {
      printState: Boolean,
      contents: String,
      fileName: String,
      manageTab: Number
    },
    data () {
      return {
        st:'',
        dialog: false,
        checkAll: false,
        checkPart: false,
        disabled: true,
        alertState: false,
        alertCon: '',
        confirmState: false,
        certifiShow: false,
        printShow: false,
        slideImg : [],
        slideArray: 0,
        html: '',
        page: 1,
        total: 0,
        pageNum: '',
        userSchool: '',
        userGrade: '',
        userClass: '',
        userNumber: '',
        userName: ''
      }
    },
    created() {
      this.html = this.contents;
      setTimeout( function() {
        let template = this.$refs.myHTML;
        let section = template.getElementsByClassName('section');
        
        this.total = section.length;
        for(let [i, s] of Object.entries(section)) {
          let selector = s.getElementsByClassName('select');
          if(i == 0) {
            s.style.display = 'block';
          } else {
            s.style.display = 'none';
          }
          s.style.transform = 'scale(0.9)';
          s.style.marginTop = '-40px';
          
          for(let [j, e] of Object.entries(selector)) {
            e.style.color = '#000';
            e.setAttribute('disabled', true);
          }
        }
      }.bind(this), 100);
    },
    methods: {
      exit() {
        this.page = 1;
        let section = this.$refs.myHTML.getElementsByClassName('section');
        for(let[i,e] of Object.entries(section)) {
          if(i == 0) {
            e.style.display = 'block';
          } else {
            e.style.display = 'none';
          }
        }
        this.$emit('popClose');
      },
      checkAllState () {
         this.checkPart = !this.checkAll;
         this.disabled = true;
      },
      checkPartState () {
        this.checkAll = !this.checkPart;
        if(this.checkAll === true){
          this.disabled = true;
        }else {
          this.disabled = false;
        }
      },
      prev () {
        this.page > 1 ? this.page -= 1 : this.page = this.total;
        let section = this.$refs.myHTML.getElementsByClassName('section');
        for(let[i,e] of Object.entries(section)) {
          if(i == (this.page - 1)) {
            e.style.display = 'block';
          } else {
            e.style.display = 'none';
          }
        }
      },
      next () {
        this.total > this.page ? this.page += 1 : this.page = 1;
        let section = this.$refs.myHTML.getElementsByClassName('section');
        for(let[i,e] of Object.entries(section)) {
          if(i == (this.page - 1)) {
            e.style.display = 'block';
          } else {
            e.style.display = 'none';
          }
        }
      },
      certifi () {
        this.confirmState = true;
        this.printShow = false;
        this.certifiShow = true;
      },
      async print () {
        if(!this.checkAll && !this.checkPart) {
          this.alertCon = "출력 범위를 선택해주세요.";
          this.alertState = true;
          return false;
        }

        let template = this.$refs.myHTML.getElementsByTagName('div')[0];
        // template.style.marginBottom = '100px;';
        let div = document.createElement('div');
        template.insertBefore(div, template.getElementsByClassName('section')[0]);
        template.children[0].setAttribute("style", "position: absolute; top:-1215px; right:0px;");
        
        if(this.userSchool !== '') {
          let span = document.createElement('span');
          template.children[0].appendChild(span);
          template.children[0].lastChild.setAttribute('style', "font-weight: 700;font-size: 1rem;margin-right: 5px;");
          template.children[0].lastChild.innerHTML = this.userSchool;
        }
        
        if(this.userGrade !== '') {
          let span = document.createElement('span');
          template.children[0].appendChild(span);
          template.children[0].lastChild.setAttribute('style', "font-weight: 700;font-size: 1rem;margin-right: 5px;");
          template.children[0].lastChild.innerHTML = this.userGrade + '학년';
        }
        
        if(this.userClass !== '') {
          let span = document.createElement('span');
          template.children[0].appendChild(span);
          template.children[0].lastChild.setAttribute('style', "font-weight: 700;font-size: 1rem;margin-right: 5px;");
          template.children[0].lastChild.innerHTML = this.userClass + '반';
        }
        if(this.userNumber !== '') {
          let span = document.createElement('span');
          template.children[0].appendChild(span);
          template.children[0].lastChild.setAttribute('style', "font-weight: 700;font-size: 1rem;margin-right: 5px;");
          template.children[0].lastChild.innerHTML = this.userNumber + '번';
        }
        if(this.userName !== '') {
          let span = document.createElement('span');
          template.children[0].appendChild(span);
          template.children[0].lastChild.setAttribute('style', "font-weight: 700;font-size: 1rem;");
          template.children[0].lastChild.innerHTML = this.userName;
        }
        
        if(this.checkAll) {
          let section = this.$refs.myHTML.getElementsByClassName('section');
          // if(this.manageTab == 0) {
          //   for(let[i,e] of Object.entries(section)) {
          //     e.style.display = 'block';
          //     e.style.marginTop = '-75%';
          //     e.style.transform = 'scale(1)';
          //   }
          // } else {
            for(let[i,e] of Object.entries(section)) {
              e.style.display = 'block';
              e.style.position = 'relative';
              //e.style.bottom = '1225px';
              e.style.transform = 'scale(1)';
              e.style.marginTop = '60px';
            }
          //}
          
          this._htmlChange();
          this.$refs.html2Pdf.generatePdf();
          setTimeout( function() {
            this.exit();
          }.bind(this), 1500);  
        } else {
          this.backupHTML = this.html;
          let pageList = [];
          this.pageNum = this.pageNum.replace(/^\s+|\s+$/gm, '');
          const commaexp = /,/gi;
          const dashexp = /-/gi;
          if(this.pageNum.match(commaexp) !== null) {
            let array = this.pageNum.split(',');
            array.sort( function(a, b){
              return a-b;
            });
            for(let i in array) {
              if(array[i].length > 2) {
                let range = array[i].split('-');
                range.sort( function(a, b) {
                  return a-b;
                });
                let s_page = range[0];
                let e_page = range[1];
                for(let j=parseInt(s_page); j<=this.total; j++) {
                  if(j > e_page) {
                    break;
                  }
                  pageList.push(j);
                } 
              } else if(array[i].length <= 2) {
                pageList.push(parseInt(array[i]));
              }
            }
          } else if(this.pageNum.match(dashexp) !== null) {
            let range = this.pageNum.split('-');
            range.sort( function(a, b) {
              return a-b;
            });
            let s_page = range[0];
            let e_page = range[1];
            for(let j=parseInt(s_page); j<=this.total; j++) {
              if(j > e_page) {
                break;
              }
              pageList.push(j);
            }
          } else {
            pageList.push(parseInt(this.pageNum));
          }
          pageList.sort( function(a, b) {
            return a-b;
          });
          let section = this.$refs.myHTML.getElementsByClassName('section');
          let breakPage = this.$refs.myHTML.getElementsByClassName('html2pdf__page-break');
          for(let i in pageList) {
            section[pageList[i]-1].className += ' check';
            if(pageList[i] < this.total) {
              breakPage[pageList[i]-1].className += ' check';
            }
          }
          for(let [i,e] of Object.entries(section)) {
            if(!e.classList.contains('check')) {
              e.remove();
            } else {
              e.style.display = 'block';
              e.style.position = 'relative';
              //e.style.bottom = '1225px';
              e.style.transform = 'scale(1)';
              e.style.marginTop = '60px';
            }
          }
          for(let [i,e] of Object.entries(breakPage)) {
            if(!e.classList.contains('check')) {
              e.remove();
            }
          }
          
          this._htmlChange();
          this.$refs.html2Pdf.generatePdf();
          setTimeout( function() {
            this.exit();
          }.bind(this), 1500);
        }
      },
      popOk () {
        this.confirmState = false;
        this.alertState = true;
        if(this.certifiShow === true) {
          this.alertCon = '고객센터롤 문의해주세요.';
        }else {
          this.alertCon = '출력되었습니다.';
        }
      },
      _htmlChange(){
        let length = document.getElementsByTagName('textarea').length;
        for(var k=0;k<length;k++){
          var txt = document.getElementsByTagName('textarea')[k];
          if(txt) {
            var dom = document.getElementsByTagName('textarea')[k].outerHTML;
            var _temp = dom.replace(/textarea/g,"div");
            _temp = _temp.replace(/\r\n|\r|\n/g,"</br>");
            document.getElementsByTagName('textarea')[k].outerHTML = _temp;
          }
        }
        if(document.getElementsByTagName('textarea').length != 0){
          this._htmlChange();
        }
      }
    }
  };
</script>
<style>
.content-wrapper {
  width: 760px !important;
  margin: 0 auto;
}
.v-dialog:not(.v-dialog--fullscreen) {
  max-height: 100% !important;
}
.printPopWrap {
  padding: 20px;
  height: 850px;
}
.privacy {
  margin-top: 15px;
}
.privName {
  width: 200px;
  height: 30px;
  margin-right: 15px;
  font-size: 0.9rem;
}
.userGrade {
  width: 50px;
  height: 30px;
  font-size: 0.9rem;
}
.privClass {
  width: 50px;
  height: 30px;
  font-size: 0.9rem;
  margin-left: 15px;
}
.privNumber {
  width: 50px;
  height: 30px;
  font-size: 0.9rem;
  margin-left: 15px;
}
.userName {
  margin-left: 15px;
}
.checkWrap {
  overflow: hidden;
  margin: 15px 0 10px 0;
}
.checkA {
  float: left;
  margin: 0 0 0 0;
}
.checkA label {
  margin-top: -3px;
}
.checkP {
  float: left;
  margin: 0 7px 0 25px;
}
.checkP label {
  margin-top: -3px;
}
.pageInput {
  float: left;
  width: 100px;
  height: 25px;
  margin: 4px 10px 0 0;
  font-size: 0.8rem;
}
.checkEx {
  float: left;
  font-size: 0.75rem;
  color: #797979;
  margin-top: 8px;
}
.v-input--selection-controls__input + .v-label {
  color: #000;
  font-size: 0.9rem;
  /*margin-top: -1px;*/
}/*02.26 향 체크박스 라벨*/
.v-application--is-ltr .v-input--selection-controls__input {
  margin-right: 0;
}/*02.26 향 체크박스 마진 삭제*/
.v-input--selection-controls .v-input--selection-controls__input:hover .v-input--selection-controls__ripple:before {
  background: transparent;
}/*02.26 향 체크박스 호버시 배경색 투명*/
.v-input--selection-controls__ripple {
  width: auto;
  height: auto;
}/*02.26 향 체크박스 클릭시 배경에 나타나는 이벤트 삭제*/

/*slide*/
.slideWrap {
  width: 100%;
  height: 600px;
  overflow: hidden;
  position: relative;
  padding-left: 0 !important;
}
.slideList {
  width: 100%;
  height: 100%;
}
.slideImgWrap {
  width: 100%;
  height: 545px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  border-radius: 5px;
}
.slideImg {
  /*width: 100%;*/
   height: 100%; 
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  overflow: hidden;
  object-fit: contain;
}
.slideNumber {
  text-align: center;
  position: relative;
  top: 10px;
}
.fade-transition {
  transition: all 0.8s ease;
  overflow: hidden;
  visibility: visible;
  opacity: 1;
  position: absolute;
}
.fade-enter, .fade-leave {
  opacity: 0;
  visibility: hidden;
}
.prevIcon {
  position: absolute !important;
  top: 3px;
  left: 414px;
  font-size: 23px !important;
  color: #ef8454 !important;
}
.prevIcon:hover {
  color: #ffb557 !important;
}
.nextIcon {
  position: absolute !important;
  top: 3px;
  right: 414px;
  font-size: 23px !important;
  color: #ef8454 !important;
}
.nextIcon:hover {
  color: #ffb557 !important;
}
.v-icon.v-icon::after {
  background-color: transparent !important;
}
.prinBtnWrap {
  overflow: hidden;
  margin: 40px 0 0 0;
  text-align: right;
  float: right;
}
.printBtnEx {
  float: left;
  font-size: 0.8rem;
  color: #797979;
  margin-top: 25px;
  margin-right: 10px;
}
.certifiBtn {
  margin-right: 5px;
}
.vue-html2pdf .layout-container.unset-all[data-v-1fd3ad26] {
  all: inherit !important;
}
/*textarea {*/
/*  overflow-wrap:break-word;*/
/*  word-wrap: break-word;*/
/*  word-break: break-word;*/
/*}*/
</style>