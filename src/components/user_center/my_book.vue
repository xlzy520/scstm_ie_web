<template>
  <div class="my-book">
    <banner
      :navs="navs"
      :banner="banner"
      :title="title"/>
    <bg>
      <div class="book-con">
        <nav-bar :navBar="navBar" @handleClick="handleTypeClick"></nav-bar>
        <div class="order-panel" v-if="reserList.status===0">
          <table class="order-pannel-head">
            <tbody>
            <tr>
              <th style="width: 460px">活动信息</th>
              <th style="width: 260px">预约人信息</th>
              <th style="width: 120px">票价</th>
              <th style="width: 160px">活动状态</th>
              <th>订单状态</th>
            </tr>
            </tbody>
          </table>
          <div class="order-list">
            <div class="order-item" v-for="(item,index) in reserList.data.data">
              <div class="order-item-hd">
                <p class="order-hd-info">
                  <span class="txt-light">订票日期：</span>
                  <span>{{item.addTime | formatDate}}</span>
                </p>
                <p class="order-hd-info">
                  <span class="txt-light">订单号：</span>
                  <span>{{item.order}}</span>
                </p>
                <p class="order-hd-info" v-if="item.status === 1">
                  <span class="txt-light">到期时间：</span>
                  <span style="color:#ff8000">{{item.overdue_time | countTime}}</span>
                </p>
              </div>
              <div class="order-item-bd">
                <table class="order-item-table">
                  <tr>
                    <td style="width: 460px">
                      <p>{{item.type}}——{{item.title}}</p>
                      <p>{{item.sesstime}}&nbsp;&nbsp;&nbsp;&nbsp;{{item.sess}}</p>
                    </td>
                    <td style="width: 260px">{{item.name_user}}</td>
                    <td style="width: 120px">
                      <span class="txt-price">{{item.money}}元</span>
                    </td>
                    <td style="width: 160px">
                      <span class="act-status">{{item.is_end}}</span>
                    </td>
                    <td>
                      <span class="order-status">{{statusObj[item.status]}}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="6" class="order-operation">
                      <div class="btn-right">
                        <a href="javascript:void(0)" v-if="item.status===2" class="btn ivu-btn-warning"
                           @click="reserCancel(item)">取消预约</a>
                        <a href="javascript:void(0)"
                           v-if="item.status===1"
                           v-for="(pay,index) in pays"
                           @click="orderPay(item, pay)"
                           class="btn pay">
                          <img :src="pay.img"/>
                          <span>{{pay.title}}</span>
                        </a>
                        <!--<a href="javascript:void(0)" v-else-if="item.status===1" class="btn ivu-btn-info" @click="orderPay">继续支付</a>-->
                        <a :href="[item.type, item.activity_id] | filterLink" target="_blank" class="btn">活动详情</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
        <no-login title="暂无预约数据" v-if="reserList.status===2"></no-login>
      </div>
    </bg>

    <dialog-con
      :options="options"
      ref="dialog"
      @confirm="confirm">
    </dialog-con>

    <ShowPayEwm
      ref="pay"
      :ewm="pay_ewm"
    />
  </div>
</template>
<script type="text/ecmascript-6">
  import Banner from '@/base/banner'
  import Bg from '@/base/bg'
  import Expect from '@/base/expect'
  import NavBar from '@/base/navBar'
  import NoLogin from '@/base/no-login'
  import {getAjax, countTime} from '@/public/js/config'
  import moment from 'moment'
  import DialogCon from '@/base/dialog_con'
  import ShowPayEwm from '@/base/showPayEwm'


  let timer = null
  let isPayTimer = null

  export default {
    components: {
      Banner,
      Bg,
      Expect,
      NavBar,
      NoLogin,
      DialogCon,
      ShowPayEwm
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
          {title: '未付款', id: 1},
          {title: '已付款', id: 2},
          {title: '全部订单', id: ''},
        ],
        statusObj: {1: '未支付', 2: '已支付', 3: '已使用', 4: '取消退款中', 5: '已取消退款', 6: '超时未支付', 7: '已删除'},
        status: 1,
        reserList: '',
        reserId: '',
        pay_ewm: '',
        pays: [
          {
            img: '/static/images/wxchat.png',
            title: '微信支付',
            tooltip: '微信支付',
            id: 1
          },
          {
            img: '/static/images/alipay.png',
            title: '支付宝支付',
            tooltip: '支付宝支付',
            id: 2
          }
        ],
        options: {
          okText: '确认',
          cancelText: '取消',
          icon: 'information-circled',
          title: '',
          content: '',
          showClose: true,
        },
        order: ''
      }
    },
    created() {
      this._Reserlists()
    },
    methods: {
      //查询预约列表
      _Reserlists() {
        const url = 'api/reserlists'
        getAjax(url, {
          number: 10,
          status: this.status,
          page: 1
        }, (res) => {
          this.reserList = res
          clearInterval(timer)
          clearInterval(isPayTimer)
          timer = setInterval(() => {
            this.reserList.status === 0 &&
            this.reserList.data.data.map((item, index) => {
              if (item.status !== 1) return
              let diff = item.overdue_time
              diff--;
              if (diff < 0) {
                clearInterval(timer)
                this.reserList.data.data.splice(index, 1)
              } else {
                item.overdue_time = diff
              }
            })
          }, 1000)
        }, (err) => {
          console.log(err)
        }, this)
      },

      confirm() {
        this.$refs.dialog.hide()
      },

      //取消预约
      reserCancel(item) {
        const url = 'api/resercancel'
        getAjax(url, {
          id: item.id,
          order: item.order
        },(res)=>{
          if(res.status === 0){
            this.showDialog({
              type: '',
              title: '温馨提示',
              icon: 'ios-checkmark',
              iconColor: '#19be6b',
              content: '取消预约成功！',
              showClose: false
            })
            this._Reserlists()
          }
        },(err)=>{
          console.log(err)
        },this)
      },

      //调用支付
      orderPay(item, pay) {
        const url = 'api/order_pay'
        getAjax(url, {
          order: item.order,
          choose: 2,
          pay_channel: pay.id
        }, (res) => {
          if (res.status === 0) {
            this.pay_ewm = res.data.data
            this.$refs.pay.show()
            this.order = item
            this.isPaySucc()
          }
        }, (err) => {
          console.log(err)
        }, this)
      },

      //是否支付成功
      isPaySucc() {
        const url = 'api/user_query_pay'
        getAjax(url, {
          order: this.order.order
        }, (res) => {
          if (res.status === 0) {
            this.$refs.pay.hide()
            this.paySucc()
          } else if (res.status === 2) {
            if (this.order.overdue_time > 0) {
              isPayTimer = setTimeout(() => {
                this.isPaySucc()
              }, 3000)
            }
          }
        }, (err) => {
          console.log(err)
        }, this)
      },

      paySucc() {
        this.showDialog({
          type: '',
          title: '温馨提示',
          icon: 'ios-checkmark',
          iconColor: '#19be6b',
          content: '恭喜您，预约成功！',
          showClose: false
        })
        this.order = ''
        this._Reserlists()
      },

      handleTypeClick(typeId) {
        this.status = typeId
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
      },
      formatDate(date) {
        return moment(date).format('YYYY-MM-DD')
      },
      countTime(diff) {
        if (diff > 0) {
          var dd = Math.floor(diff / 60 / 60 / 24);
          var hh = Math.floor(diff / 60 / 60 % 24);
          var mm = Math.floor(diff / 60 % 60);
          var ss = Math.floor(diff % 60);
          var str = (String(hh).length === 1 ? `0${hh}` : hh) + ':' + (String(mm).length === 1 ? `0${mm}` : mm) + ':' + (String(ss).length === 1 ? `0${ss}` : ss)
          return str
        }
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
    .order-panel {
      .order-pannel-head {
        width: 100%;
        height: 40px;
        background: rgba(0, 0, 0, .04);
        th {
          text-align: center;
          color: #666;
          padding: 0 10px;
          font-size: 14px;
        }
      }
      .order-list {
        .order-item {
          border: 1px solid #acd1f9;
          margin-top: 20px;
          -webkit-transition: .3s linear border;
          transition: .3s linear border;
          background: #fff;
          .order-item-hd {
            height: 40px;
            line-height: 40px;
            background: #F0F8FF;
            padding: 0 20px;
            overflow: hidden;
          }
          .order-hd-info {
            float: left;
            margin-right: 20px;
            font-size: 14px;
            color: #333;
            .txt-light {
              color: #666;
            }
          }
          .countTime {
            float: right;
            margin-right: 20px;
            font-size: 14px;
            color: #333;
          }
          .order-item-bd {
            width: 100%;
            text-align: center;
            .order-item-table {
              width: 100%;
              text-align: center;
              td {
                font-size: 15px;
                padding: 20px 10px;
                border-top: 1px solid #DEDEDE;
                border-right: 1px solid #DEDEDE;
                line-height: 22px;
                .txt-price {
                  color: #ff8000;
                }
              }
              .order-operation {
                padding: 20px 10px;
                border-right: none;
                .btn-right {
                  text-align: right;
                  font-size: 0;
                }
                .btn, .pay {
                  margin-left: 15px;
                  display: inline-block;
                  font-size: 14px;
                  color: #333;
                  min-width: 80px;
                  line-height: 20px;
                  padding: 6px 12px;
                  border: 1px solid #DEDEDE;
                  border-radius: 6px;
                  background-color: #fff;
                  text-align: center;
                  white-space: nowrap;
                  vertical-align: middle;
                  cursor: pointer;
                  -webkit-user-select: none;
                  -moz-user-select: none;
                  -ms-user-select: none;
                  user-select: none;
                  outline: none;
                  position: relative;
                  -webkit-transition: border-color ease-in-out .15s, color ease-in-out .15s, background ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
                  transition: border-color ease-in-out .15s, color ease-in-out .15s, background ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
                  transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s, color ease-in-out .15s, background ease-in-out .15s;
                  transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s, color ease-in-out .15s, background ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
                  img {
                    width: 20px;
                  }
                }
                .pay {
                  &:hover {
                    background: #f5f5f5;
                  }
                }
                .ivu-btn-warning {
                  color: #fff;
                  background-color: #f90;
                  border-color: #f90;
                }
                .ivu-btn-info {
                  color: #fff;
                  background-color: #2db7f5;
                  border-color: #2db7f5;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
