<template>
  <div class="my-book">
    <banner :navs="navs" :banner="banner" :title="title"/>
    <bg>
      <div class="book-con">
        <nav-bar :navBar="navBar" @handleClick="handleTypeClick"></nav-bar>
        <div class="order-panel" v-if="reserList.status===0 && reserList.data.data.length">
          <table class="order-pannel-head">
            <tbody>
              <tr>
                <th style="width: 460px">活动信息</th>
                <th style="width: 220px">预约人信息</th>
                <th style="width: 130px">票价</th>
                <th style="width: 130px">出票状态</th>
                <th style="width: 130px">活动状态</th>
                <th>订单状态</th>
              </tr>
            </tbody>
          </table>
          <div class="order-list">
            <div class="order-item" :key="index" v-for="(item,index) in reserList.data.data">
              <div class="order-item-hd">
                <p class="order-hd-info">
                  <span class="txt-light">订票日期：</span>
                  <span>{{item.addtime | formatDate}}</span>
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
                      <div class="act-img">
                        <img :src="item.img">
                      </div>
                      <div class="act-txt">
                        <p>{{item.type}}——{{item.title}}</p>
                        <p>{{item.sesstime}}&nbsp;&nbsp;&nbsp;&nbsp;{{item.sess}}</p>
                      </div>
                    </td>
                    <td style="width: 220px">{{item.name_user}}</td>
                    <td style="width: 130px">
                      <span class="txt-price">{{item.money}}元</span>
                    </td>
                    <td style="width: 130px">
                      <!--<span v-if="item.status<6 && item.status > 1"-->
                      <!--class="order-status">{{ticketObj[item.drawer]}}</span>-->
                      <span class="order-status">{{ticketObj[item.drawer]}}</span>
                    </td>
                    <td style="width: 130px">
                      <span class="act-status">{{item.is_end}}</span>
                    </td>
                    <td>
                      <span class="order-status">{{statusObj[item.status]}}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="6" class="order-operation">
                      <div class="btn-right">
                        <Button
                          type="warning"
                          v-if="item.status===1 || item.status===2"
                          class="btn"
                          @click="reserCancel(item)"
                        >取消预约</Button>
                        <Button
                          v-if="item.status===1"
                          class="btn pay"
                          :key="index"
                          v-for="(pay,index) in pays"
                          @click="orderPay(item, pay)"
                        >
                          <img :src="pay.img">
                          <span>{{pay.title}}</span>
                        </Button>
                        <Button
                          type="error"
                          style="backgroundColor:#ed3f14; borderColor:#ed3f14; color:#fff"
                          v-if="item.status>4 && item.status!=7"
                          class="btn"
                          @click="deleteOrder(item)"
                        >删除订单</Button>
                        <a
                          :href="[item.type, item.activity_id] | filterLink"
                          target="_blank"
                          class="btn"
                        >活动详情</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            <Spin size="large" fix v-if="loading"></Spin>
          </div>
          <Pagination
            v-if="reserList.data.total"
            :total="reserList.data.total*10"
            :page="page"
            @handleChange="handlePage"
          ></Pagination>
        </div>
        <no-login title="暂无预约数据" v-if="reserList.status===2 || !reserList.data.data.length"></no-login>
      </div>
    </bg>

    <dialog-con :options="options" ref="dialog" @confirm="confirm"></dialog-con>

    <ShowPayEwm
      ref="pay"
      :pay_channel="pay_channel"
      :money="money"
      @cancel="cancel"
      :ewm="pay_ewm"
    />
  </div>
</template>
<script type="text/ecmascript-6">
import Banner from "@/base/banner";
import Bg from "@/base/bg";
import Expect from "@/base/expect";
import NavBar from "@/base/navBar";
import NoLogin from "@/base/no-login";
import { getAjax, countTime } from "@/public/js/config";
import moment from "moment";
import DialogCon from "@/base/dialog_con";
import ShowPayEwm from "@/base/showPayEwm";
import Pagination from "@/base/pagination";

let timer = null;
let isPayTimer = null;

export default {
  components: {
    Banner,
    Bg,
    Expect,
    NavBar,
    NoLogin,
    DialogCon,
    ShowPayEwm,
    Pagination
  },
  data() {
    return {
      navs: [
        {
          href: "/user_center/setting",
          title: "个人设置",
          id: ""
        },
        {
          href: "/user_center/manage",
          title: "密码管理",
          id: ""
        },
        {
          href: "/user_center/my_book",
          title: "我的预约",
          id: ""
        }
      ],
      title: "账号设置",
      banner: "../static/images/user.jpg",
      navBar: [
        { title: "未付款", id: 1 },
        { title: "已付款", id: 2 },
        { title: "回收站", id: 7 },
        { title: "全部订单", id: "" }
      ],
      ticketObj: {
        1: "未出票",
        2: "出票中",
        3: "出票成功",
        4: "出票失败",
        5: "已退票"
      },
      statusObj: {
        1: "未支付",
        2: "已支付",
        3: "已使用",
        4: "取消退款中",
        5: "已取消退款",
        6: "超时未支付",
        7: "已删除"
      },
      status: 1,
      reserList: "",
      reserId: "",
      pay_ewm: "",
      pays: [
        {
          img: "/static/images/wxchat.png",
          title: "微信支付",
          tooltip: "微信支付",
          id: 1
        },
        {
          img: "/static/images/alipay.png",
          title: "支付宝支付",
          tooltip: "支付宝支付",
          id: 2
        }
      ],
      options: {
        okText: "确认",
        cancelText: "取消",
        icon: "information-circled",
        title: "",
        content: "",
        showClose: true
      },
      order: "",
      page: 1,
      loading: false,
      pay_channel: 1,
      money: 0
    };
  },
  created() {
    this._Reserlists();
  },
  methods: {
    //查询预约列表
    _Reserlists() {
      const url = "api/reserlists";
      this.loading = true;
      getAjax(
        url,
        {
          number: 6,
          status: this.status,
          page: this.page
        },
        res => {
          this.reserList = res;
          this.loading = false;
          clearInterval(timer);
          timer = setInterval(() => {
            this.reserList.status === 0 &&
              this.reserList.data.data.map((item, index) => {
                //if (item.status !== 1) return
                let diff = item.overdue_time;
                diff--;
                if (diff < 0 && item.status === 1) {
                  clearInterval(timer);
                  this.reserList.data.data.splice(index, 1);
                } else {
                  item.overdue_time = diff;
                }
              });
          }, 1000);
        },
        err => {
          this.loading = false;
          console.log(err);
        },
        this
      );
    },
    //删除订单
    deleteOrder(item) {
      const url = "api/reserdete";
      getAjax(
        url,
        { id: item.id },
        res => {
          if (res.status === 0) {
            this.showDialog({
              type: "",
              title: "温馨提示",
              icon: "ios-checkmark",
              iconColor: "#19be6b",
              content: "删除订单成功！",
              showClose: false
            });
            this._Reserlists();
          } else {
            this.showDialog({
              type: "",
              title: "温馨提示",
              content: res.interpret,
              showClose: false
            });
          }
        },
        err => {
          this.loading = false;
          this.showDialog({
            type: "",
            title: "温馨提示",
            content: "删除订单失败！",
            showClose: false
          });
        },
        this
      );
    },
    /**
     * 获取子组件页码
     * @param page
     */
    handlePage(page) {
      this.page = page;
      this._Reserlists();
    },

    //取消预约
    reserCancel(item) {
      const url = "api/resercancel";
      this.loading = true;
      getAjax(
        url,
        {
          id: item.id,
          order: item.order
        },
        res => {
          this.loading = false;
          if (res.status === 0) {
            this.showDialog({
              type: "",
              title: "温馨提示",
              icon: "ios-checkmark",
              iconColor: "#19be6b",
              content: "取消预约成功！",
              showClose: false
            });
            this._Reserlists();
          } else {
            this.showDialog({
              type: "",
              title: "温馨提示",
              content: res.interpret,
              showClose: false
            });
          }
        },
        err => {
          this.loading = false;
          console.log(err);
        },
        this
      );
    },

    //调用支付
    orderPay(item, pay) {
      this.$refs.pay.subHide();
      const url = "api/order_pay";
      this.loading = true;
      getAjax(
        url,
        {
          order: item.order,
          choose: 2,
          pay_channel: pay.id
        },
        res => {
          this.loading = false;
          if (res.status === 0) {
            this.pay_ewm = res.data.data;
            this.pay_channel = pay.id;
            this.money = item.money;
            this.$refs.pay.show();
            this.order = item;
            this.isPaySucc();
          } else {
            this.showDialog({
              type: "",
              title: "温馨提示",
              content: '调用支付失败，请重试！',
              showClose: false
            });
          }
        },
        err => {
          this.loading = false;
          console.log(err);
        },
        this
      );
    },

    //是否支付成功
    isPaySucc() {
      const url = "api/user_query_pay";
      getAjax(
        url,
        {
          order: this.order.order
        },
        res => {
          if (res.status === 0) {
            this.$refs.pay.subShow();
            setTimeout(() => {
              this.$refs.pay.hide();
              this.paySucc();
            }, 3000);
          } else if (res.status === 2) {
            if (this.order.overdue_time > 0) {
              isPayTimer = setTimeout(() => {
                this.isPaySucc();
              }, 3000);
            }
          }
        },
        err => {
          console.log(err);
        },
        this
      );
    },

    paySucc() {
      this.order = "";
      this._Reserlists();
    },

    handleTypeClick(typeId) {
      this.loading = false;
      this.status = typeId;
      this.page = 1;
      this._Reserlists();
    },

    showDialog(options) {
      this.options = {
        okText: options.okText || "确认",
        cancelText: options.cancelText || "取消",
        icon: options.icon || "information-circled",
        iconColor: options.iconColor,
        title: options.title,
        content: options.content,
        showClose: options.showClose
      };
      this.$refs.dialog.show();
    },

    confirm() {
      this.$refs.dialog.hide();
    },

    cancel() {
      clearInterval(isPayTimer);
    }
  },
  filters: {
    filterLink([type, id]) {
      return (
        (type == "教育活动"
          ? "/edu_activity/course_detail"
          : type == "美科新"
          ? "/mkx_school/mkx_detail"
          : type == "4D影院"
          ? "/exhibit/theater-detail"
          : "") +
        "?id=" +
        id
      );
    },
    formatDate(date) {
      return moment(date * 1000).format("YYYY-MM-DD");
    },
    countTime(diff) {
      if (diff > 0) {
        var dd = Math.floor(diff / 60 / 60 / 24);
        var hh = Math.floor((diff / 60 / 60) % 24);
        var mm = Math.floor((diff / 60) % 60);
        var ss = Math.floor(diff % 60);
        var str =
          (String(hh).length === 1 ? `0${hh}` : hh) +
          ":" +
          (String(mm).length === 1 ? `0${mm}` : mm) +
          ":" +
          (String(ss).length === 1 ? `0${ss}` : ss);
        return str;
      }
    }
  }
};
</script>
<style lang="less">
.book-con {
  width: 1200px;
  padding-top: 50px;
  padding-bottom: 60px;
  margin: 0 auto;
  .order-panel {
    .order-pannel-head {
      width: 100%;
      height: 40px;
      background: rgba(0, 0, 0, 0.04);
      th {
        text-align: center;
        color: #666;
        padding: 0 10px;
        font-size: 14px;
      }
    }
    .order-list {
      position: relative;
      .order-item {
        border: 1px solid #acd1f9;
        margin-top: 10px;
        -webkit-transition: 0.3s linear border;
        transition: 0.3s linear border;
        background: #fff;
        .order-item-hd {
          height: 40px;
          line-height: 40px;
          background: #f0f8ff;
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
              border-top: 1px solid #dedede;
              border-right: 1px solid #dedede;
              line-height: 22px;
              .act-img {
                width: 90px;
                display: inline-block;
                vertical-align: middle;
                img {
                  width: 100%;
                }
              }
              .act-txt {
                text-align: left;
                display: inline-block;
                vertical-align: middle;
                margin-left: 10px;
              }
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
              .btn,
              .pay {
                margin-left: 15px;
                display: inline-block;
                font-size: 14px;
                color: #333;
                min-width: 80px;
                line-height: 20px;
                padding: 6px 12px;
                border: 1px solid #dedede;
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
                -webkit-transition: border-color ease-in-out 0.15s,
                  color ease-in-out 0.15s, background ease-in-out 0.15s,
                  -webkit-box-shadow ease-in-out 0.15s;
                transition: border-color ease-in-out 0.15s,
                  color ease-in-out 0.15s, background ease-in-out 0.15s,
                  -webkit-box-shadow ease-in-out 0.15s;
                transition: border-color ease-in-out 0.15s,
                  box-shadow ease-in-out 0.15s, color ease-in-out 0.15s,
                  background ease-in-out 0.15s;
                transition: border-color ease-in-out 0.15s,
                  box-shadow ease-in-out 0.15s, color ease-in-out 0.15s,
                  background ease-in-out 0.15s,
                  -webkit-box-shadow ease-in-out 0.15s;
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
