<template>
  <div class="m-item clearfix">
    <router-link :to="{path:'/mkx_school/mkx_detail',query:{id:data.id}}" class="mkx-img">
      <img v-lazy="data.img"/>
    </router-link>
    <div class="m-txt">
      <h2 class="m-title">
        <router-link :to="{path:'/mkx_school/mkx_detail',query:{id:data.id}}">{{data.title}}</router-link>
        <img src="../../assets/new.png" v-if="data.new===1" class="icon-status"/>
        <img src="../../assets/hot.png" v-if="data.hot===1" class="icon-status"/>
      </h2>
      <p class="m-time">
        <Icon type="ios-calendar-outline" class="time"></Icon>
        {{data.time}}
      </p>
      <p class="address">
        <Icon type="ios-location-outline" class="location"></Icon>
        {{data.address}}
      </p>
      <p class="intr">
        {{data.introduce}}
      </p>
      <div class="keywords" v-if="data.courseclass">
        <span v-if="index <= 5" v-for="(item,index) in data.courseclass" :key="index">
          {{item}}
        </span>
      </div>
      <!--<p class="btn-book">立即预定</p>-->
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import {Icon} from 'iview'

  export default {
    props: {
      data: {
        type: Object,
        default: ''
      }
    },
    components: {
      Icon,
    },
    data() {
      return {}
    }
  }
</script>
<style scoped lang="less">
  .m-item {
    margin-bottom: 25px;
    background: #fff;
    box-shadow: 0 3px 36px 0 #EDEDED;
    .mkx-img {
      width: 450px;
      height: 320px;
      overflow: hidden;
      float: left;
      text-align: center;
      line-height: 320px;
      img {
        width: 100%;
      }
    }
    .m-txt {
      float: left;
      margin-top: 40px;
      margin-left: 40px;
      width: 700px;
      text-align: justify;
      .m-title {
        font-size: 28px;
        color: #333;
        margin-bottom: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        a {
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 600px;
          display: inline-block;
          vertical-align: middle;
          &:hover {
            color: #28bbff;
          }
          .icon-status {
            width: 22px;
            display: inline-block;
            vertical-align: middle;
          }
        }
        .mold {
          font-size: 14px;
          background-image: -webkit-linear-gradient(135deg, #00d0fb, #00acf6);
          background-image: -moz-linear-gradient(135deg, #00d0fb, #00acf6);
          background-image: -o-linear-gradient(135deg, #00d0fb, #00acf6);
          background-image: -ms-linear-gradient(135deg, #00d0fb, #00acf6);
          background-image: linear-gradient(135deg, #00d0fb, #00acf6);
          width: 46px;
          height: 25px;
          margin-left: 10px;
          display: inline-block;
          -webkit-border-radius: 2px;
          -moz-border-radius: 2px;
          border-radius: 2px;
          vertical-align: middle;
          text-align: center;
          line-height: 25px;
          color: #fff;
        }
      }
      .address {
        color: #28bbff;
        font-size: 16px;
        margin-bottom: 10px;
        .location {
          width: 18px;
          font-size: 20px;
          font-weight: bold;
          margin-right: 5px;
        }
      }
      .m-time {
        color: #5e6d84;
        font-size: 16px;
        margin-bottom: 10px;
        .time {
          width: 18px;
          font-size: 20px;
          font-weight: bold;
          margin-right: 5px;
        }
      }
      .intr {
        font-size: 16px;
        color: #9a9a9a;
        line-height: 28px;
        margin-top: 10px;
        margin-bottom: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
      .btn-book {
        width: 130px;
        height: 45px;
        background-image: -webkit-linear-gradient(135deg, #00d0fb, #00acf6);
        background-image: -moz-linear-gradient(135deg, #00d0fb, #00acf6);
        background-image: -o-linear-gradient(135deg, #00d0fb, #00acf6);
        background-image: -ms-linear-gradient(135deg, #00d0fb, #00acf6);
        background-image: linear-gradient(135deg, #00d0fb, #00acf6);
        text-align: center;
        line-height: 45px;
        -webkit-border-radius: 2px;
        -moz-border-radius: 2px;
        border-radius: 2px;
        font-size: 16px;
        color: #fff;
        cursor: pointer;
      }
      .keywords {
        color: #a3a3a3;
        display: inline-block;
        span {
          display: inline-block;
          margin-right: 10px;
          padding: 10px 20px;
          background: #f0f0f0;
          -webkit-border-radius: 4px;
          -moz-border-radius: 4px;
          border-radius: 4px;
        }
      }
    }
  }
</style>
