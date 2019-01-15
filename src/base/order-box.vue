<template>
  <div class="order-box">
    <div class="book-box" v-if="token && details.data.state===1">
      <p class="title">活动预约</p>
      <p class="s-tit">预约活动场次前，请先确保已成功预定科技馆门票</p>
      <div class="book">
        <div class="item-group">
          <label class="lab">日期选择：</label>
          <div class="form-item clearfix">
            <div class="item-date">
              <!--<DatePicker type="date"-->
              <!--size="large"-->
              <!--:value="nowDate"-->
              <!--placeholder="请选择查询日期"-->
              <!--@on-change="handleDate"-->
              <!--style="width: 238px">-->
              <!--</DatePicker>-->
              <Select size="large" style="width: 200px" @on-change="handleDate" placeholder="请选择场次日期">
                <Option v-for="item in dateList" :value="item.value" :key="item.value">{{ item.value }}</Option>
              </Select>
            </div>
            <p class="residue">{{residue_num | residueMsg}}</p>
          </div>
        </div>
        <div class="item-group" style="padding-bottom: 0">
          <label class="lab">选择场次：</label>
          <ul class="numbers clearfix" v-if="numbers.length">
            <li
              :class="(item.is_stop == 2 || item.determine ==item.qualified) ? 'not_allow' : current == index ? 'active' : ''"
              @click="item.is_stop===1 && item.determine!=item.qualified ? toggle(index,item.id) : ''"
              v-for="(item,index) in numbers"
              :key="index">
              <Tooltip :content="[item.determine,item.qualified,item.is_stop] | tooltipMsg" placement="top">
                <p>{{item.sess}}（{{[item.determine,item.qualified] | isFull}}）</p>
              </Tooltip>
            </li>
          </ul>
          <p class="no-session" v-if="!numbers.length">暂无场次，请切换日期试试看</p>
        </div>
        <div class="item-group">
          <div class="group">
            <label class="lab">活动参与人（最多三位）：</label>
            <Form ref="formValidate" :model="formValidate">
              <FormItem
                v-for="(item,index) in formValidate.items"
                v-if="item.status"
                :key="index">
                <Row>
                  <Col span="5">
                    <FormItem :prop="'items.' + index + '.name'" label="姓名" :rules="ruleValidate.name">
                      <Input size="large" v-model.trim="item.name" placeholder="请输入参观人姓名"></Input>
                    </FormItem>
                  </Col>
                  <Col span="5">
                    <FormItem :prop="'items.' + index + '.age'" label="年龄" :rules="ruleValidate.age">
                      <Input size="large" v-model.trim="item.age" placeholder="请输入参观人年龄"></Input>
                    </FormItem>
                  </Col>
                  <Col span="8">
                    <FormItem :prop="'items.' + index + '.card'" label="身份证号" :rules="ruleValidate.card">
                      <Input size="large" v-model.trim="item.card" placeholder="请输入参观人身份证号"></Input>
                    </FormItem>
                  </Col>
                  <Col span="2">
                    <div class="icon-minus" @click="minusNumbers(index)">
                      <Icon v-if="index!==0" type="ios-minus"></Icon>
                    </div>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </div>
          <p class="notice">
            <span>*</span> 请准确填写预约人年龄信息，并确认与该活动要求年龄是否符合
          </p>
          <p class="add" @click="addNumbers()">
            <Icon type="ios-plus-empty"></Icon>
            活动参与人（￥{{details.data.money}} / 人）
          </p>
        </div>
        <div class="item-group" style="padding-bottom: 0">
          <label class="lab">选择支付方式：</label>
          <ul class="pays clearfix">
            <li :class="payCurrent == index && 'active'"
                v-for="(item,index) in pays"
                :key="index"
                @click="togglePay(index, item.id)">
              <Tooltip :content="item.tooltip" placement="top">
                <p class="pay">
                  <img :src="item.img"/>
                  <span>{{item.title}}</span>
                </p>
              </Tooltip>
            </li>
          </ul>
        </div>
        <Button :loading="isDisable" class="book-btn" @click="handleSubmit('formValidate')"
                style="display: inline-block; vertical-align: middle">
          立即预约
        </Button>
        <p class="notice" style="display: inline-block; vertical-align: middle;margin-left: 20px">
          <span>*</span> 本活动将于活动开始前半小时停止预约
        </p>
      </div>
    </div>

    <div class="book-box" v-if="!token">
      <p class="title">活动预约</p>
      <p class="s-tit">预约活动场次前，请先确保已成功预定科技馆门票</p>
      <div class="book">
        <no-login title="请先登录"></no-login>
      </div>
    </div>

    <div class="book-box" v-if="token && details.data.state===2">
      <p class="title">活动预约</p>
      <p class="s-tit">预约活动场次前，请先确保已成功预定科技馆门票</p>
      <div class="book">
        <no-login title="暂未开启在线预约"></no-login>
      </div>
    </div>

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

<script>
  import moment from 'moment'
  import NoLogin from '@/base/no-login'
  import {getAjax, isMoblie} from '@/public/js/config'
  import DialogCon from '@/base/dialog_con'
  import ShowPayEwm from '@/base/showPayEwm'

  let count = 0
  const MAX = 100

  export default {
    name: "order-box",
    props: {
      details: {
        type: Object,
        default: {}
      },
      typeVal: {
        default: 1
      }
    },
    components: {
      NoLogin,
      DialogCon,
      ShowPayEwm
    },
    data() {
      const validateAge = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入参观人年龄'))
        } else if (!/^[0-9]*$/.test(value)) {
          return callback(new Error('请输入1~200内的数字'))
        } else if (value > 200 || value <= 0) {
          return callback(new Error('请输入1~200内的数字'))
        } else {
          callback()
        }
      }
      return {
        type: '',
        inputIndex: 1,
        date: '',
        numbers: '',   //场次
        current: -1,
        payCurrent: -1,
        pay_channel: 0,
        reser_id: '',  //场次id
        token: false,
        nowDate: moment().format('YYYY-MM-DD'),
        formValidate: {
          items: [
            {
              name: '',
              age: '',
              card: '',
              index: 1,
              status: 1
            }
          ]
        },
        ruleValidate: {
          name: [
            {required: true, message: '请输入参观人姓名', trigger: 'blur'}
          ],
          age: [
            {required: true, validator: validateAge, trigger: 'blur'},
          ],
          card: [
            {required: true, message: '请输入参观人身份证号', trigger: 'blur'},
            {
              pattern: /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/,
              message: '请输入有效身份证号'
            }
          ]
        },
        options: {
          okText: '确认',
          cancelText: '取消',
          icon: 'information-circled',
          title: '',
          content: '',
          showClose: true,
        },
        isDisable: false,
        residue_num: -2,
        dateList: [],
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
        pay_ewm: ''
      }
    },
    created() {
      //this.handleDate(moment().format('YYYY-MM-DD'))
      this.getUserInfo()
      this._token()
      this.getOrderList()
    },
    methods: {
      _token() {
        this.token = sessionStorage.getItem('token')
      },
      toggle(index, id) {
        this.current = index
        this.reser_id = id
      },
      togglePay(index, id) {
        this.payCurrent = index
        this.pay_channel = id
      },
      /**
       * 日期
       * @param date
       */
      // handleDate(date) {
      //   this.date = parseInt(moment(date).format('X')) + 12 * 60 * 60
      //   this.current = -1
      //   this.reser_id = ''
      //   this.getNumbers()
      // },

      /**
       * 获取场次日期
       */
      getOrderList() {
        const url = 'api/sessa'
        getAjax(url, {
            activity_id: this.$route.query.id,
            type: this.typeVal
          },
          (res) => {
            if (res.status === 0) {
              res.data.forEach(item => {
                this.dateList.push({
                  value: moment.unix(item.sesstime).format('YYYY-MM-DD')
                })
              })
            }
          }, (err) => {
            console.log(err)
          }, this)
      },

      handleDate(date) {
        this.date = parseInt(moment(date).format('X')) + 12 * 60 * 60
        this.current = -1
        this.reser_id = ''
        this.getNumbers()
      },
      /**
       * 验证token是否过期
       */
      getUserInfo() {
        const url = 'api/user'
        getAjax(url, {},
          (res) => {
          }, (err) => {
            if (err.status === 401) {
              this.token = false
            }
          }, this)
      },
      /**
       * 获取场次
       */
      getNumbers() {
        this.residue_num = 0;
        const url = 'api/sess'
        getAjax(url, {
          activity_id: this.$route.query.id,
          sesstime: this.date,
          type: this.typeVal
        }, (res) => {
          this.numbers = res.data
          if (res.data.length) {
            res.data.forEach((item) => {
              this.residue_num += item.qualified - item.determine
            })
          } else {
            this.residue_num = -1
          }
        }, (err) => {
          if (err.status === 401) {
            this.token = ''
          }
        }, this)
      },
      /**
       * 添加人数
       */
      addNumbers() {
        this.inputIndex++;
        let arr = this.formValidate.items.filter(item => item.status)
        if (arr.length < 3) {
          this.formValidate.items.push({
            name: '',
            age: '',
            card: '',
            status: 1,
            index: this.inputIndex
          })
        } else {
          this.showDialog({type: '', title: '温馨提示', content: '最多只能添加三位活动参与人', showClose: false})
        }
      },
      /**
       * 删除
       */
      minusNumbers(index) {
        this.formValidate.items[index].status = 0
      },
      /**
       * 立即预约
       */
      handleSubmit(name) {
        count = 0
        if (!this.verifyOrderItem()) return
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.isDisable = true
            this.bookSumbit()
          }
        })
      },
      bookSumbit() {
        let details = []
        let items = this.formValidate.items
        for (let k in items) {
          if (items[k].status) {
            details.push(
              {
                age: items[k].age,
                name: items[k].name,
                card: items[k].card
              }
            )
          }
        }
        this._bookSubmit(details)
      },
      _bookSubmit(details) {
        const url = 'api/reser'
        getAjax(url, {
          reser_id: this.reser_id,
          details: details
        }, (res) => {
          this.isDisable = false
          if (res.status === 0) {
            this.order = res.data.order
            //发起支付
            this.orderPay()
          } else {
            if (res.status === 2) {
              if (res.data[0]) {
                this.showDialog({
                  type: '',
                  title: '温馨提示',
                  content: `第${res.data + 1}条数据，${res.interpret}`,
                  showClose: false
                })
                return
              } else {
                this.type = ''
                this.showDialog({
                  type: '',
                  title: '温馨提示',
                  content: res.interpret ? res.interpret : '您的网络有问题，请重试！',
                  showClose: false
                })
                return
              }
            } else if (res.status === 3) {
              this.showDialog({type: 'href', title: '温馨提示', content: res.interpret, showClose: true})
            }
          }
        }, (err) => {
          this.isDisable = false
          this.showDialog({type: '', title: '温馨提示', content: "您的网络有问题，请重试！", showClose: false})
        }, this)
      },

      //调用支付
      orderPay() {
        const url = 'api/order_pay'
        getAjax(url, {
          order: this.order,
          choose: 2,
          pay_channel: this.pay_channel
        }, (res) => {
          if (res.status === 0) {
            this.pay_ewm = res.data.data
            this.$refs.pay.show()
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
          order: this.order
        }, (res) => {
          console.log(res)
          if (res.status === 0) {
            this.$refs.pay.hide()
            this.paySucc()
          } else if (res.status === 2) {
            count++
            if (count < MAX) {
              setTimeout(()=>{
                this.isPaySucc()
              },3000)
            }else {
              this.$refs.pay.hide()
              this.showDialog({type: '', title: '温馨提示', content: "订单已超时，请到我的预约完成订单！", showClose: false})
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
        this.getNumbers()
        this.formValidate = {
          items: [
            {
              name: '',
              age: '',
              card: '',
              index: 1,
              status: 1
            }
          ]
        }
        this.reser_id = ''
        this.current = -1
      },

      //验证预约格式
      verifyOrderItem() {
        if (!this.date) {
          this.showDialog({type: '', title: '温馨提示', content: '请选择场次日期', showClose: false})
          return false
        } else if (!this.reser_id) {
          this.showDialog({type: '', title: '温馨提示', content: '请选择场次后进行预约', showClose: false})
          return false
        } else if (!this.pay_channel) {
          this.showDialog({type: '', title: '温馨提示', content: '请选择支付方式', showClose: false})
          return false
        }
        return true
      },

      confirm() {
        if (this.type === 'href') {
          this.$router.push({
            path: '/user_center/setting',
            query: {callback: this.$route.fullPath}
          })
        }
        this.$refs.dialog.hide()
      },


      showDialog(options) {
        this.type = options.type
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
      },
    },
    filters: {
      isFull([num1, num2]) {
        return num1 == num2 ? '已满' : (num1 + '/' + num2)
      },
      tooltipMsg([num1, num2, status]) {
        return status == 1 ? num1 == num2 ? '本场次预约人数已满，请选择其他场次试试看' : ('本场次总共可预约' + num2 + '人，已预约' + num1 + '人') : '本场次预约时间已过'
      },
      residueMsg(num) {
        return num > 0 ? '当前日期总剩余预约名额：' + num + '人' : num == 0 ? '当前日期名额已满，请切换日期试试看' : num == -1 ? '暂无场次，请切换日期试试看' : ''
      }
    }
  }
</script>

<style lang="less">
  .book-box {
    margin-top: 40px;
    .title {
      font-size: 25px;
      margin-bottom: 20px;
      color: #333;
    }
    .s-tit {
      font-size: 16px;
      color: #333;
    }
    .book {
      margin-top: 40px;
      background: #fff;
      -webkit-border-radius: 2px;
      -moz-border-radius: 2px;
      border-radius: 2px;
      padding: 30px;
      .ivu-input-wrapper {
        width: 70%;
      }
      .ivu-form-item-error-tip {
        margin-left: 19%;
      }
      .icon-minus {
        cursor: pointer;
        font-size: 30px;
        display: inline-block;
        vertical-align: middle;
      }
      .item-group {
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 1px solid #f5f5f5;
        .item-date {
          float: left;
          .ivu-select-dropdown {
            z-index: 1100;
          }
        }
        .residue {
          float: left;
          line-height: 36px;
          font-size: 16px;
          color: #ff1010;
          margin-left: 20px;
        }
        .lab {
          font-size: 16px;
          margin-bottom: 10px;
          display: block;
        }
        .no-session {
          font-size: 20px;
          color: #d2d2d2;
          padding-bottom: 15px;
        }
        .pays {
          li {
            margin-right: 20px;
            font-size: 18px;
            color: #9b9b9b;
            float: left;
            cursor: pointer;
            margin-bottom: 15px;
            p {
              background: #fff;
              padding: 10px 30px;
              border: 1px solid #dcdee2;
              -webkit-border-radius: 4px;
              -moz-border-radius: 4px;
              border-radius: 4px;
              img {
                width: 34px;
              }
              span {
                font-size: 18px;
              }
              &:hover {
                background: #f5f5f5;
              }
            }
            &.active {
              p {
                background: #f5f5f5;
              }
            }
          }
        }
        .numbers {
          li {
            margin-right: 20px;
            font-size: 18px;
            color: #9b9b9b;
            float: left;
            cursor: pointer;
            margin-bottom: 15px;
            &.not_allow {
              .ivu-tooltip {
                p {
                  background: #dcdee2;
                  color: #fff;
                  cursor: not-allowed;
                  &:hover {
                    background: #dcdee2;
                    color: #fff;
                    border: 1px solid #dcdee2;
                  }
                }
              }
            }
            .ivu-tooltip {
              .ivu-tooltip-inner {
                max-width: 300px;
              }
              p {
                background: #fff;
                padding: 10px 30px;
                border: 1px solid #dcdee2;
                -webkit-border-radius: 4px;
                -moz-border-radius: 4px;
                border-radius: 4px;
                img {
                  width: 34px;
                }
                span {
                  font-size: 18px;
                }
                &:hover {
                  border: 1px solid #57a3f3;
                  color: #57a3f3;
                }
              }
            }
            &.active {
              .ivu-tooltip {
                p {
                  background-image: linear-gradient(90deg,
                  #00b3f7 0%,
                  #00b2f7 0%,
                  #00b1f6 0%,
                  #21bef8 0%,
                  #41cbfa 0%,
                  #38a6f4 100%),
                  linear-gradient(
                    #f5f5f5,
                    #f5f5f5);
                  color: #fff;
                  border: 1px solid #41cafa;
                }
              }
            }
          }
        }
        .peoples {
          li {
            margin-bottom: 15px;
            .form-box {
              background: #f5f5f5;
              padding: 10px 30px;
              -webkit-border-radius: 2px;
              -moz-border-radius: 2px;
              border-radius: 2px;
              display: inline-block;
              vertical-align: middle;
              p {
                float: left;
                color: #9b9b9b;
                font-size: 18px;
                margin-right: 20px;
                .lab {
                  display: inline-block;
                  vertical-align: middle;
                  margin-bottom: 0;
                }
                .inp {
                  width: 100px;
                  height: 30px;
                  display: inline-block;
                  vertical-align: middle;
                  font-size: 16px;
                  text-align: center;
                  padding: 0 10px;
                }
              }
            }
            .icon-minus {
              cursor: pointer;
              font-size: 30px;
              display: inline-block;
              vertical-align: middle;
              margin-left: 20px;
            }
          }
        }
        .add {
          padding: 10px 20px;
          background: #fff;
          color: #9b9b9b;
          -webkit-border-radius: 4px;
          -moz-border-radius: 4px;
          border-radius: 4px;
          display: inline-block;
          font-size: 15px;
          cursor: pointer;
          margin-top: 20px;
          border: 1px solid #dcdee2;
          &:hover {
            border: 1px solid #57a3f3;
            color: #57a3f3;
          }
        }

      }
      .book-btn {
        padding: 10px 20px;
        background-image: linear-gradient(90deg,
        #00b3f7 0%,
        #00b2f7 0%,
        #00b1f6 0%,
        #21bef8 0%,
        #41cbfa 0%,
        #38a6f4 100%),
        linear-gradient(
          #f5f5f5,
          #f5f5f5);
        color: #fff;
        display: inline-block;
        font-size: 15px;
        cursor: pointer;
      }
      .notice {
        margin-top: 10px;
        font-size: 14px;
        color: #9b9b9b;
        span {
          color: #ff1010;
        }
      }
    }
  }
</style>
