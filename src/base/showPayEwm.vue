<template>
  <transition name="model-scale">
    <div class="popup" v-if="isShow">
      <div class="mask" @click="hide()"></div>
      <div class="popup-center">
        <div class="popup-content">
          <img :src="ewm"/>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "showPayEwm",
    props: {
      ewm: {
        type: String,
        default: ''
      },
    },
    data() {
      return {
        isShow: false,
      }
    },
    methods: {
      confirm() {
        this.$emit('confirm')
      },
      cancel() {
        this.$emit('cancel')
        this.hide()
      },
      show() {
        this.isShow = true
      },
      hide() {
        this.isShow = false
      }
    }
  }
</script>

<style lang="less">
  .model-scale-enter-active, .model-scale-leave-active {
    transition: all .4s;
  }

  .model-scale-enter, .model-scale-leave-to {
    transform: scale(2);
    opacity: 0;
  }

  .popup {
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
      opacity: .4;
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
        img{
          width: 300px;
        }
      }
    }
  }
</style>
