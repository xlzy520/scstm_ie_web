<template>
  <div class="my-book">
    <banner
      :navs="navs"
      :banner="banner"
      :title="title"/>
    <bg>
      <div class="book-con">
        <nav-bar :navBar="navBar" @handleClick="handleTypeClick"></nav-bar>
        <ul class="book-list clearfix">
          <li v-for="(item,index) in reserList" :key="index">
            <div class="act-img">
              <img v-lazy="item.img"/>
              <div class="mask" v-if="type===1">
                <div class="mask-con">
                  <p class="mask-txt">
                    <router-link :to="[item.type,item.future_id] | filterLink">查看详情</router-link>
                  </p>
                  <p class="mask-txt" style="float: right; background: #ed4014">
                    <span @click="_deleteReser(item.id)">取消预约</span>
                  </p>
                </div>
              </div>
            </div>
            <div class="act-info">
              <div class="time" :style="{color:type===2 ? '#666' : '#05afee'}">
                <p class="date">{{item.sess}}</p>
                <p>{{item.sesstime}}</p>
              </div>
              <div class="act-name">
                <p class="act-title">{{item.title}}</p>
                <p class="number">人数{{item.count}}人</p>
              </div>
            </div>
            <span class="type-name">{{item.type}}</span>
          </li>
        </ul>
        <div class="order-panel">
          <table class="order-pannel-head">
            <tbody>
            <tr>
              <th>活动信息</th>
              <th>预约人信息</th>
              <th>票价</th>
              
            </tr>
            </tbody>
          </table>
        </div>
        <no-login title="暂无预约数据" v-if="!reserList.length"></no-login>
      </div>
    </bg>

    <dialog-con
      :options="options"
      ref="dialog"
      @confirm="confirm">
    </dialog-con>
  </div>
</template>
<script type="text/ecmascript-6">
  import Banner from '@/base/banner'
  import Bg from '@/base/bg'
  import Expect from '@/base/expect'
  import NavBar from '@/base/navBar'
  import NoLogin from '@/base/no-login'
  import {getAjax} from '@/public/js/config'
  import moment from 'moment'
  import DialogCon from '@/base/dialog_con'

  export default {
    components: {
      Banner,
      Bg,
      Expect,
      NavBar,
      NoLogin,
      DialogCon
    },
    data() {
      return {
        navs: [
          {
            href: '/user_center/setting',
            title: '个人设置',
            id: ''
          },
          {
            href: '/user_center/manage',
            title: '密码管理',
            id: ''
          },
          {
            href: '/user_center/my_book',
            title: '我的预约',
            id: ''
          },
        ],
        title: '账号设置',
        banner: '../static/images/user.jpg',
        navBar: [
          {title: '即将进行', id: 1},
          {title: '已经结束', id: 2}
        ],
        type: 1,
        reserList: '',
        reserId: '',
        options: {
          okText: '确认',
          cancelText: '取消',
          icon: 'information-circled',
          title: '',
          content: '',
          showClose: true,
        },
      }
    },
    created() {
      this._Reserlists()
    },
    methods: {
      _Reserlists() {
        const url = 'api/reserlists'
        getAjax(url, {
          type: this.type
        }, (res) => {
          this.reserList = res.data
        }, (err) => {
          console.log(err)
        }, this)
      },
      _deleteReser(id) {
        this.showDialog({title: '温馨提示', content: '是否确认删除预约', showClose: true})
        this.reserId = id
      },
      confirm() {
        this.$refs.dialog.hide()
        if (!this.reserId) return
        const url = 'api/resercancel'
        getAjax(url, {
          id: this.reserId
        }, (res) => {
          this.reserId = ''
          if(res.status == 0){
            this._Reserlists()
          }else if(res.status == 1){
            this.showDialog({title: '温馨提示', content: res.interpret, showClose: false})
          }
        }, (err) => {
          this.reserId = ''
          this.showDialog({title: '温馨提示', content: "您的网络有问题，请重试！", showClose: false})
        }, this)
      },
      handleTypeClick(typeId) {
        this.type = typeId
        this._Reserlists()
      },
      showDialog(options) {
        this.options = {
          okText: options.okText || '确认',
          cancelText: options.cancelText || '取消',
          icon: options.icon || 'information-circled',
          iconColor: options.iconColor,
          title: options.title,
          content: options.content,
          showClose: options.showClose,
        }
        this.$refs.dialog.show()
      }
    },
    filters: {
      filterLink([type, id]) {
        return (type == '教育活动' ? '/edu_activity/course_detail' : type == '美科新' ? '/mkx_school/mkx_detail' : type == '4D影院' ? '/exhibit/theater-detail' : '') + "?id=" + id
      }
    }
  }
</script>
<style lang="less">
  .book-con {
    width: 1200px;
    padding-top: 50px;
    padding-bottom: 60px;
    margin: 0 auto;
    .book-list {
      li {
        width: 385px;
        position: relative;
        -webkit-border-radius: 2px;
        -moz-border-radius: 2px;
        border-radius: 2px;
        overflow: hidden;
        margin-right: 20px;
        margin-bottom: 20px;
        float: left;
        &:nth-child(3n) {
          margin-right: 0;
        }
        .act-img {
          width: 100%;
          height: 257px;
          overflow: hidden;
          position: relative;
          text-align: center;
          img {
            width: 100%;
            transition: opacity 0.35s, transform 0.35s;
            -webkit-transform: scale(1.12);
            transform: scale(1.12);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          .mask {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            background: rgba(0, 0, 0, .6);
            z-index: 100;
            opacity: 0;
            transition: opacity .6s ease 0s;
            cursor: default;
            .mask-con {
              width: 100%;
              padding: 0 65px;
              height: 100%;
              .mask-txt {
                float: left;
                font-size: 15px;
                letter-spacing: 1.5px;
                text-align: center;
                width: 120px;
                height: 40px;
                margin: auto;
                background-image: -webkit-linear-gradient(135deg, #00d0fb, #00acf6);
                background-image: -moz-linear-gradient(135deg, #00d0fb, #00acf6);
                background-image: -o-linear-gradient(135deg, #00d0fb, #00acf6);
                background-image: -ms-linear-gradient(135deg, #00d0fb, #00acf6);
                background-image: linear-gradient(135deg, #00d0fb, #00acf6);
                border-radius: 4px;
                line-height: 40px;
                margin-top: 108px;
                cursor: pointer;
                span {
                  color: #fff;
                  display: block;
                }
                a {
                  color: #fff;
                  display: block;
                }
              }
            }
            &:hover {
              opacity: 1;
            }
          }
          &:hover {
            img {
              background: rgba(255, 255, 255, .8);
              -webkit-transform: scale(1);
              transform: scale(1);
            }
          }
        }
        .act-info {
          width: 100%;
          height: 80px;
          background: #fff;
          padding: 10px;
          text-align: center;
          .time {
            width: 130px;
            height: 100%;
            float: left;
            color: #05afee;
            border-right: 1px solid #d4d4d4;
            font-size: 18px;
            .date {
              font-size: 24px;
            }
          }
          .act-name {
            float: left;
            width: 230px;
            padding-right: 10px;
            padding-left: 10px;
            .act-title {
              font-size: 20px;
              color: #333;
              margin-bottom: 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .number {
              font-size: 16px;
              color: #333;
            }
          }
        }
        .type-name {
          position: absolute;
          width: 150px;
          height: 40px;
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
          text-align: center;
          line-height: 40px;
          left: 0;
          top: 20px;
          background-image: linear-gradient(-131deg, #0097E3 -16%, #3BD9D0 100%);
          color: #fff;
          font-size: 16px;
        }
      }
    }
    .order-panel{
      .order-pannel-head{
        width: 100%;
        height: 40px;
        background: #f8f8f8;
        th{
          text-align: center;
          color: #666;
          padding: 0 10px;
          font-size: 14px;
        }
      }
    }
  }
</style>
