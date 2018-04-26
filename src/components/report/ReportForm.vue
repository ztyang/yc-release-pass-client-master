<template>
    <form @submit.prevent="onSubmit" class="report-form">
        <mu-text-field label="物品携带人：" required labelFloat fullWidth v-model="form.carrierName"></mu-text-field>
        <mu-text-field label="证件号码：" required labelFloat fullWidth v-model="form.carrierId"></mu-text-field>
        <mu-text-field label="所属单位：" required labelFloat fullWidth v-model="form.carrierDepartment"></mu-text-field>
        <mu-text-field label="放行理由：" required labelFloat fullWidth v-model="form.reason"></mu-text-field>
        <mu-paper v-for="(goods,index) in form.goods" :key="index + 'a'" :zDepth="3" class="paper">
            <mu-icon-button @click="deleteGoods(index)" style="float: right;color: red">
                <i class="fa fa-trash"/>
            </mu-icon-button>
            <span style="font-size: 30px;float: left">物品{{index+1}}</span>
            <mu-text-field label='物品名称：' required labelFloat fullWidth v-model="goods.name"
                           class="goods-name"></mu-text-field>
            <mu-text-field label='物品数量：' required labelFloat v-model="goods.quantity"
                           class="goods-quantity"></mu-text-field>
            <mu-text-field label='物品规格：' required labelFloat v-model="goods.specification"
                           class="goods-specification"></mu-text-field>
        </mu-paper>
        <span>图片：</span>
        <mu-avatar v-for="(img,index) in reportImgList" slot="left" :src="SERVER_URL+'/thumbnail/'+img+'.jpg'"
                   :key="index+'b'" @click="previewImg(img)"/>
        <mu-float-button icon="add" mini @click="chooseImage" style="padding-bottom: 10px"></mu-float-button>
        <div>
            <mu-raised-button label="提交" type="submit" primary/>
            <mu-raised-button label="新增物品" @click="addGoods"/>
        </div>
        <mt-actionsheet
                :actions="actions()"
                v-model="sheetVisible">
        </mt-actionsheet>
    </form>
</template>

<script>
    import {wxConfig} from "../../tools/wechatAPI"
    import axios from 'axios'
    import {getCookie} from "../../tools/getCookie"
    import {CREATE_RELEASEPASS_API, DOWNLOAD_FILE_API, GET_GOODSTYPES_API, SERVER_URL} from "../../constants/url";
    import {Toast} from 'mint-ui'

    export default {
        name: 'reportForm',
        data() {
            return {
                empCode: getCookie('EmpCode'),
                empPhone: getCookie('EmpPhone'),
                empName: decodeURI(getCookie('EmpName')),
                form: {
                    carrierName: decodeURI(getCookie('EmpName')),
                    carrierId: getCookie('EmpCode'),
                    goods: [{name: "", quantity: "", specification: ""}]
                },
                reportImgList: [],
                goodsTypes: [],
                sheetVisible: false,
                SERVER_URL
            }
        },
        methods: {
            onSubmit() {
                this.sheetVisible = true
            },
            addGoods() {
                this.form.goods.push({name: "", quantity: "", specification: ""})
            },
            deleteGoods(index) {
                this.form.goods.splice(index, 1)
            },
            chooseImage() {
                wx.chooseImage({
                    count: 9, // 默认9
                    sizeType: [
                        'original', 'compressed'
                    ], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: [
                        'album', 'camera'
                    ], // 可以指定来源是相册还是相机，默认二者都有
                    success: (res) => {
                        const localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                        localIds.map(localId => {
                            wx.uploadImage({
                                localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                                isShowProgressTips: 1, // 默认为1，显示进度提示
                                success: (res) => {
                                    const serverId = res.serverId; // 返回图片的服务器端ID
                                    axios.get(DOWNLOAD_FILE_API, {
                                        params: {
                                            serverId
                                        }
                                    }).then(
                                        res => {
                                            this.reportImgList = this.reportImgList.concat(res.data.data.serverId)
                                        }
                                    )
                                }
                            })
                        })
                    }
                })
            },
            actions: function () {
                let action = []
                this.goodsTypes.map(goodsType => {
                    action = action.concat({
                        name: goodsType.name, method: () => {
                            axios.post(CREATE_RELEASEPASS_API, {

                                ...this.form,
                                reporterId: this.empCode,
                                reporterName: this.empName,
                                reporterPhone: this.empPhone,
                                currentNode: '审批中',
                                goodsType,
                                transferDate: {
                                    reportDate: new Date()
                                },
                                reportImgList: this.reportImgList
                            })
                                .then(res => {
                                    if (res.data.code == 0) {
                                        this.form = {
                                            carrierName: decodeURI(getCookie('EmpName')),
                                            carrierId: getCookie('EmpCode'),
                                            goods: [{name: "", quantity: "", specification: ""}]
                                        }
                                        this.reportImgList = []
                                        Toast({
                                            message: res.data.msg,
                                            iconClass: 'icon icon-success'
                                        })
                                        this.$emit('changeTab', 'releasePassList')
                                    } else {
                                        Toast({
                                            message: '提交失败',
                                            iconClass: 'icon icon-false'
                                        })
                                    }

                                })
                        }
                    })
                })
                return action
            },
            previewImg(img) {
                let urls = []
                this.reportImgList.map(originalImg => {
                    urls = urls.concat(`${SERVER_URL}/img/${originalImg}.jpg`)
                    if (this.reportImgList.length == urls.length) {
                        wx.previewImage({
                            current: `${SERVER_URL}/img/${img}.jpg`, // 当前显示图片的http链接
                            urls // 需要预览的图片http链接列表
                        })
                    }
                })
            }
        }
        ,
        mounted: function () {
            wxConfig(window.location.href.replace(window.location.hash, ''))
            axios.get(GET_GOODSTYPES_API)
                .then(res => {
                    if (res.data.code == 0) {
                        this.goodsTypes = res.data.data.goodsTypes
                    } else {
                        Toast({
                            message: '获取物品类型失败',
                            iconClass: 'icon icon-false'
                        })
                    }
                })
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .goods-quantity {
        width: 40%;
        float: left;
    }

    .goods-specification {
        width: 50%;
        float: right;
    }

    .report-form {
        margin: 10px;
    }

    .paper {
        display: inline-block;
        padding: 10px;
        margin: 10px;
    }

</style>
