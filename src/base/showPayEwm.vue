<template>
  <transition name="model-scale">
    <div class="popup1" v-if="isShow">
      <div class="mask" @click="cancel()"></div>
      <div class="popup-center">
        <div class="popup-content">
          <div class="ewm-box">
            <p class="desc">扫一扫付款(元)</p>
            <p class="money">{{money}}</p>
            <img :src="ewm">
            <div class="notice">
              <img src="../assets/sao.png">
              <div class="txt">
                <p>打开手机{{pay_channel==1 ? '微信' : '支付宝'}}</p>
                <p>扫一扫继续付款</p>
              </div>
            </div>
          </div>
          <div class="sub-mask" v-if="isSubShow">
            <p class="popup-icon" style="color: #19be6b">
              <Icon type="ios-checkmark"></Icon>
            </p>
            <div class="popup-txt">
              <div class="popup-txt-def">
                <p>支付成功！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { fail } from 'assert';
export default {
  name: "showPayEwm",
  props: {
    ewm: {
      type: String,
      default: ""
    },
    money: {
      type: Number,
      default: 0
    },
    pay_channel: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      isShow: false,
      isSubShow: false
    };
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
      this.hide();
    },
    show() {
      this.isShow = true;
    },
    hide() {
      this.isShow = false;
    },
    subShow() {
      this.isSubShow = true;
    },
    subHide() {
      this.isSubShow = false;
    }
  },
  watch:{
    money(val){
      console.log(val)
    }
  }
};
</script>

<style lang="less">
.model-scale-enter-active,
.model-scale-leave-active {
  transition: all 0.4s;
}

.model-scale-enter,
.model-scale-leave-to {
  transform: scale(2);
  opacity: 0;
}

.popup1 {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  pointer-events: auto;
  .mask {
    display: block;
    overflow: hidden;
    background-color: #25262d;
    opacity: 0.4;
    pointer-events: auto;
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .popup-center {
    transform: translate(100%, 100%);
    position: absolute;
    width: 100%;
    height: 100%;
    .popup-content {
      transform: translate(-50%, -50%);
      top: -50%;
      left: -50%;
      width: auto;
      max-width: 100%;
      position: absolute;
      box-sizing: border-box;
      pointer-events: auto;
      .sub-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.7);
      }
      .ewm-box {
        width: 300px;
        background: #fff;
        padding: 15px 0;
        .desc {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-bottom: 5px;
        }
        .money {
          color: #ff6600;
          font-size: 28px;
          text-align: center;
          font-weight: bold;
          margin-bottom: 8px;
        }
        img {
          width: 300px;
          height: 300px;
          margin: auto;
        }
        .notice {
          margin-top: 10px;
          text-align: center;
          img {
            display: inline-block;
            vertical-align: middle;
            margin-right: 5px;
            width: 30px;
            height: 30px;
          }
          .txt {
            display: inline-block;
            vertical-align: middle;
            font-size: 13px;
            color: #333;
            text-align: left;
          }
        }
      }
      .popup-icon {
        margin-top: 100px;
        margin-bottom: 16px;
        line-height: 1;
        color: #4a4c5b;
        font-size: 40px;
        text-align: center;
      }
      .popup-txt {
        margin: 16px 0;
        text-align: left;
        color: #19be6b;
        font-size: 20px;
        line-height: 22px;
        .popup-txt-def {
          padding: 0 16px;
          p {
            display: table;
            margin: auto;
          }
        }
      }
    }
  }
}
</style>
