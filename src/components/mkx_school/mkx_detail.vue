<template>
  <div class="th_detail-con">
    <banner
      :navs="navs"
      :banner="banner"
      :title="title"
      @handleClick="getBanner"/>
    <bg>
      <div class="movie-detail" v-if="mkxDetail.status===0">
        <div class="m-info clearfix">
          <div class="de-img">
            <img :src="mkxDetail.data.img"/>
          </div>
          <div class="m-txt">
            <h2 class="m-title">
              {{mkxDetail.data.title}}
              <span class="mold" v-for="(item,index) in mkxDetail.data.courseclass"
                    :key="index">
                {{item}}
              </span>
            </h2>
            <p class="address">
              <Icon type="ios-location-outline" class="location"></Icon>
              {{mkxDetail.data.address}}
            </p>
            <p class="m-time">
              <Icon type="ios-timer-outline" class="time"></Icon>
              {{mkxDetail.data.activity_time}}
            </p>
            <p class="intr">
              简介：{{mkxDetail.data.introduce}}
            </p>
            <!--<p class="btn-book">立即预定</p>-->
          </div>
        </div>

        <order-box :details="mkxDetail ? mkxDetail : {}" typeVal="1"></order-box>

        <div class="movie-clips clearfix">
          <p class="title">活动内容</p>
          <div class="act-content" v-html="mkxDetail.data.content">

          </div>
        </div>
      </div>
    </bg>
  </div>
</template>
<script type="text/ecmascript-6">
  import OrderBox from '@/base/order-box'
  import {Icon, DatePicker} from 'iview'
  import Banner from '@/base/banner'
  import {getBannerMixin} from '@/public/js/mixin'
  import Bg from '@/base/bg'
  import {getAjax, isMoblie, moblieDomain} from '@/public/js/config'

  export default {
    mixins: [getBannerMixin],
    components: {
      Icon,
      Banner,
      Bg,
      DatePicker,
      OrderBox
    },
    data() {
      return {
        mkxDetail: '',
        navs: [
          {
            href: '/mkx_school/school_course',
            title: '学院课程',
            id: 1
          }
        ],
        title: '美科星未来学院',
      }
    },
    created() {
      if(isMoblie()){
        window.location.href = moblieDomain + '/mkx/' + this.$route.query.id
        return
      }
      this.getBanner()
      this.getDetailData()
    },
    methods: {
      /**
       * 获取全部课程banner
       * @param id  分类id
       */
      getBanner(id = 1) {
        this.getBannerData({id: id, url: 'api/futurebanner'})
      },
      getDetailData() {
        const url = 'api/futuredeta'
        getAjax(url, {
          id: this.$route.query.id
        }, (res) => {
          this.mkxDetail = res
        }, (err) => {
          console.log(err)
        }, this)
      },
    }
  }
</script>
<style scoped lang="less">
  .movie-detail {
    width: 1200px;
    margin: 0 auto;
    padding-top: 50px;
    padding-bottom: 60px;
    .m-info {
      .de-img {
        width: 450px;
        height: 320px;
        float: left;
        overflow: hidden;
        border: 8px solid #fff;
        -webkit-border-radius: 2px;
        -moz-border-radius: 2px;
        border-radius: 2px;
        box-shadow: 0 3px 36px 0 #EDEDED;
        img {
          width: 100%;
        }
      }
      .m-txt {
        float: left;
        margin-top: 40px;
        margin-left: 40px;
        width: 710px;
        text-align: justify;
        .m-title {
          font-size: 30px;
          color: #333;
          margin-bottom: 15px;
          .mold {
            font-size: 14px;
            background-image: -webkit-linear-gradient(-131deg, #0097E3 -16%, #3BD9D0 100%);
            background-image: -moz-linear-gradient(-131deg, #0097E3 -16%, #3BD9D0 100%);
            background-image: -o-linear-gradient(-131deg, #0097E3 -16%, #3BD9D0 100%);
            background-image: -ms-linear-gradient(-131deg, #0097E3 -16%, #3BD9D0 100%);
            background-image: linear-gradient(-131deg, #0097E3 -16%, #3BD9D0 100%);
            padding: 0 15px;
            height: 28px;
            margin-left: 10px;
            display: inline-block;
            -webkit-border-radius: 2px;
            -moz-border-radius: 2px;
            border-radius: 2px;
            vertical-align: middle;
            text-align: center;
            line-height: 28px;
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
          color: #596781;
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
          color: #596781;
          line-height: 28px;
          margin-top: 10px;
          margin-bottom: 30px;
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
      }
    }
    .movie-clips {
      padding-top: 40px;
      padding-bottom: 50px;
      .title {
        font-size: 25px;
        color: #333;
        margin-bottom: 40px;
      }
      .act-content {
        border: 1px solid #fff;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        box-shadow: 0 3px 36px 0 #EDEDED;
        padding: 30px 20px;
        color: #596781;
        background: #fff;
      }
    }
  }
</style>
