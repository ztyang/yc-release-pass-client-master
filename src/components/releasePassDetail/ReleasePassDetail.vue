<template>
    <div>
        <div>
            物品携带人：{{releasePass.carrierName}}
        </div>
        <div>
            证件号码:{{releasePass.carrierId}}
        </div>
        <div>
            所属单位：{{releasePass.carrierDepartment}}
        </div>
        <div>
            放行理由：{{releasePass.reason}}
        </div>
        <div>
            当前节点：{{releasePass.currentNode}}
        </div>
        <div>
            审批意见：{{releasePass.opinion}}
        </div>
        <div>
            申请人：{{releasePass.reporterName}}
        </div>
        <div>
            审批人：{{releasePass.signerName}}
        </div>
        <div>
            申请时间：{{reportDate}}
        </div>
        <div>
            审批时间：{{signDate}}
        </div>
        <div v-for="(goods,index) in releasePass.goods" :key="index">
            <hr/>
            <!--<div>物品{{index + 1}}</div>-->
            <div>物品名称:{{goods.name}}</div>
            <div>规格:{{goods.specification}}</div>
            <div>数量:{{goods.quantity}}</div>
        </div>
        <span>图片：</span>
        <mu-avatar v-for="(img,index) in releasePass.reportImgList" slot="left"
                   :src="SERVER_URL+'/thumbnail/'+img+'.jpg'"
                   :key="index+'b'" @click="previewImg(img)"/>
    </div>
</template>

<script>
    import moment from 'moment'
    import {wxConfig} from "../../tools/wechatAPI"
    import {SERVER_URL} from "../../constants/url";

    export default {
        name: 'reportForm',
        data() {
            return {
                SERVER_URL
            }
        },
        props: {
            releasePass: {
                reportImgList: []
            }
        },
        computed: {
            reportDate: function () {
                return this.releasePass.transferDate.reportDate ? moment(this.releasePass.transferDate.reportDate).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            signDate: function () {
                return this.releasePass.transferDate.signDate ? moment(this.releasePass.transferDate.signDate).format('YYYY-MM-DD HH:mm:ss') : ''
            }
        },
        mounted: function () {
            wxConfig(window.location.href.replace(window.location.hash, ''))
        },
        methods: {
            previewImg(img) {
                let urls = []
                this.releasePass.reportImgList.map(originalImg => {
                    urls = urls.concat(`${SERVER_URL}/img/${originalImg}.jpg`)
                    if (this.releasePass.reportImgList.length == urls.length) {
                        wx.previewImage({
                            current: `${SERVER_URL}/img/${img}.jpg`, // 当前显示图片的http链接
                            urls // 需要预览的图片http链接列表
                        })
                    }
                })
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
