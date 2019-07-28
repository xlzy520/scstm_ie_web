<template>
  <div class="th_detail-con">
    <banner
      v-if="theaterDetail.status===0"
      :navs="navs"
      :banner="theaterDetail.data.img"
      :title="title"
    />
    <bg>
      <div class="movie-detail" v-if="theaterDetail.status===0">
        <div class="m-info clearfix">
          <div class="de-img">
            <img :src="theaterDetail.data.img">
          </div>
          <div class="m-txt">
            <h2 class="m-title">
              {{theaterDetail.data.title}}
              <span class="mold">{{theaterDetail.data.type}}</span>
            </h2>
            <p class="address">
              <Icon type="ios-location-outline" class="location"></Icon>
              {{theaterDetail.data.address}}
            </p>
            <p class="m-time">
              <Icon type="ios-timer-outline" class="time"></Icon>
              {{theaterDetail.data.length}}
            </p>
            <p class="m-time">
              <Icon type="ios-calendar-outline" class="time"></Icon>
              {{theaterDetail.data.time}}
            </p>
            <p class="intr">{{theaterDetail.data.introduce}}</p>
            <!--<p class="btn-book">立即预定</p>-->
          </div>
        </div>
        <OrderBox :details="theaterDetail ? theaterDetail : {}" typeVal="2" :noticeTxt="noticeTxt"></OrderBox>
        <div class="movie-clips clearfix">
          <p class="title">片花 / 剧照</p>
          <clips-roll
            v-if="theaterDetail.data.cinema_img.length"
            :data="theaterDetail.data.cinema_img"
          ></clips-roll>
        </div>
      </div>
    </bg>
  </div>
</template>
<script type="text/ecmascript-6">
import { Icon } from "iview";
import Banner from "@/base/banner";
import { getBannerMixin } from "@/public/js/mixin";
import ClipsRoll from "@/base/clips_roll.vue";
import { getAjax, isMoblie, moblieDomain } from "@/public/js/config";
import Bg from "@/base/bg";
import OrderBox from "@/base/order-box";

export default {
  mixins: [getBannerMixin],
  components: {
    Icon,
    ClipsRoll,
    Banner,
    Bg,
    OrderBox
  },
  data() {
    return {
      noticeTxt:
        "1、一人一券，儿童也需购票，6岁以下儿童观影需家长陪同。身高1.2米以下儿童、孕妇及心脏病、高血压患者不宜观看此类影片。<br/> 2、影片预约成功后，凭身份证前往南广场票务服务领取入馆参观券。入馆后在一楼南厅服务台兑换4D电影票。<br/> 3、取完参观券后4D电影票不可退换。<br/> 4、开场前30分钟停止预约，取消预约场次，须提前24小时提出申请。<br/> 5、如遇机器故障无法正常观影，可在开场后30分钟内前往一楼序厅办理退、换票手续。",
      theaterDetail: "",
      navs: [
        {
          href: "/exhibit/survey",
          title: "展馆概况",
          id: ""
        },
        {
          href: "/exhibit/guide",
          title: "楼层导览",
          id: 1
        },
        {
          href: "/exhibit/round",
          title: "全景环游",
          id: ""
        },
        {
          href: "/exhibit/theater",
          title: "影院剧场",
          id: 2
        },
        {
          href: "/exhibit/succinct",
          title: "展品精粹",
          id: 3
        }
      ],
      title: "常设展览"
    };
  },
  created() {
    if (isMoblie()) {
      window.location.href = moblieDomain + "/theater/" + this.$route.query.id;
      return;
    }
    this.getDetailData();
  },
  methods: {
    getDetailData() {
      const url = "api/cinemadeta";
      getAjax(
        url,
        {
          id: this.$route.query.id
        },
        res => {
          this.theaterDetail = res;
        },
        err => {
          console.log(err);
        },
        this
      );
    }
  }
};
</script>
<style scoped lang="less">
.movie-detail {
  position: relative;
  z-index: 1000;
  width: 1200px;
  margin: -400px auto 0 auto;
  .m-info {
    .de-img {
      width: 340px;
      float: left;
      overflow: hidden;
      border: 8px solid #fff;
      -webkit-border-radius: 2px;
      -moz-border-radius: 2px;
      border-radius: 2px;
      img {
        height: 460px;
      }
    }
    .m-txt {
      float: left;
      margin-top: 60px;
      margin-left: 40px;
      width: 810px;
      text-align: justify;
      .m-title {
        font-size: 30px;
        color: #fff;
        margin-bottom: 15px;
        .mold {
          font-size: 14px;
          background-image: -webkit-linear-gradient(
            -131deg,
            #0097e3 -16%,
            #3bd9d0 100%
          );
          background-image: -moz-linear-gradient(
            -131deg,
            #0097e3 -16%,
            #3bd9d0 100%
          );
          background-image: -o-linear-gradient(
            -131deg,
            #0097e3 -16%,
            #3bd9d0 100%
          );
          background-image: -ms-linear-gradient(
            -131deg,
            #0097e3 -16%,
            #3bd9d0 100%
          );
          background-image: linear-gradient(
            -131deg,
            #0097e3 -16%,
            #3bd9d0 100%
          );
          padding: 0 15px;
          height: 25px;
          margin-left: 10px;
          display: inline-block;
          -webkit-border-radius: 2px;
          -moz-border-radius: 2px;
          border-radius: 2px;
          vertical-align: middle;
          text-align: center;
          line-height: 25px;
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
        color: #fff;
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
        color: #fff;
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
    padding-top: 80px;
    padding-bottom: 50px;
    .title {
      font-size: 25px;
      color: #333;
      margin-bottom: 20px;
    }
  }
}
</style>
