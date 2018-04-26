<template>
    <div>
        <mu-tabs :value="activeTab" @change="handleTabChange">
            <mu-tab value="1" title="审批中"/>
            <mu-tab value="2" title="审批完成"/>
        </mu-tabs>
        <mt-tab-container v-model="activeTab">
            <mt-tab-container-item id="1">
                <mu-list-item v-for="(releasePass,index) in releasePasses"
                              v-if="releasePass.currentNode == '审批中'" :key="index">
                    <div class="list-content" @click="goToDetail(releasePass)">
                        <span slot="describe">
                            <span style="font-size: 20px">{{releasePass.goodsType.name}}</span><br/>
                            <span style="color: rgba(0, 0, 0, .87)">申请人：{{releasePass.reporterName}}</span> <br/>
                            申请时间：{{reportDate(releasePass)}}
                          </span>
                    </div>
                    <mu-icon-menu slot="right" icon="more_vert" tooltip="操作">
                        <mu-menu-item title="批准" @click="onSubmitOpinion(releasePass.id)"/>
                        <mu-menu-item title="终止" @click="stopPass(releasePass.id)"/>
                    </mu-icon-menu>
                    <mu-divider/>
                </mu-list-item>
            </mt-tab-container-item>
            <mt-tab-container-item id="2">
                <mu-list-item v-for="(releasePass,index) in releasePasses"
                              v-if="releasePass.currentNode != '审批中'" :key="index">
                    <div class="list-content" @click="goToDetail(releasePass)">
                        <span slot="describe">
                            <span style="font-size: 20px">{{releasePass.goodsType.name}}</span><br/>
                            <span style="color: rgba(0, 0, 0, .87)">申请人：{{releasePass.reporterName}}</span> <br/>
                            申请时间：{{reportDate(releasePass)}}
                          </span>
                    </div>
                    <mu-icon-menu slot="right" icon="more_vert" tooltip="操作">
                        <mu-menu-item title="二维码" @click="showQrCode(releasePass.id)"/>
                        <mu-menu-item title="终止" @click="stopPass(releasePass.id)"/>
                    </mu-icon-menu>
                    <mu-divider/>
                </mu-list-item>
                <mu-float-button class="qrCode-button" @click="onScanQRCode">
                    <i class='fa fa-qrcode fa-3x' aria-hidden='true'/>
                </mu-float-button>
            </mt-tab-container-item>
        </mt-tab-container>
        <mu-dialog :open=" detailDialog
                        " @close="()=>this.detailDialog = false" title="详情" scrollable dialogClass="detailDialog"
                   bodyClass="detailBody">
            <ReleasePassDetail :releasePass="releasePass"></ReleasePassDetail>
            <mu-raised-button v-if="showPassButton" slot="actions" primary @click="onPass" label="放行"/>
            <mu-flat-button primary label="关闭" @click="()=>this.detailDialog = false" slot="actions"/>
        </mu-dialog>
        <mu-dialog :open="qrDialog" @close="()=>this.qrDialog = false" title="二维码" scrollable>
            <qrcode :value="qrCode" :options="{ size: 200 }"></qrcode>
            <mu-flat-button primary label="关闭" @click="()=>this.qrDialog = false" slot="actions"/>
        </mu-dialog>
    </div>
</template>

<script>
    import axios from 'axios'
    import {
        GET_RELEASEPASSES_BY_EMP_API,
        SUBMIT_OPINION_API,
        STOP_PASS_API,
        GET_RELEASEPASS_API, GOODS_PASS_API
    } from "../../constants/url"
    import {getCookie} from "../../tools/getCookie"
    import {Toast, MessageBox} from 'mint-ui'
    import moment from 'moment'
    import ReleasePassDetail from '../releasePassDetail/ReleasePassDetail'

    export default {
        name: 'releasePassList',
        data() {
            return {
                empCode: getCookie('EmpCode'),
                detailDialog: false,
                qrDialog: false,
                activeTab: '1',
                releasePasses: [],
                sheetVisible: false,
                releasePass: {},
                qrCode: '',
                showPassButton: false
            }
        },
        components: {ReleasePassDetail},
        mounted: function () {
            axios.get(GET_RELEASEPASSES_BY_EMP_API, {params: {empCode: this.empCode}})
                .then(res => {
                    if (res.data.code == 0) {
                        this.releasePasses = res.data.data.releasePasses
                    } else {
                        Toast({
                            message: '操作失败',
                            iconClass: 'icon icon-false'
                        })
                    }
                })

        },
        methods: {
            goToDetail(releasePass) {
                this.releasePass = releasePass
                this.detailDialog = true
                this.showPassButton = false
            },
            reportDate: function (releasePass) {
                return releasePass.transferDate.reportDate ? moment(releasePass.transferDate.reportDate).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            handleTabChange: function (val) {
                this.activeTab = val
            },
            onSubmitOpinion(id) {
                MessageBox.prompt(null, '审批意见')
                    .then(({value}) => {
                        axios.put(`${SUBMIT_OPINION_API}?empCode=${this.empCode}`, {
                            signer: {
                                signerId: this.empCode,
                                signerName: this.empName,
                                signerPhone: this.empPhone
                            },
                            id,
                            opinion: value
                        }).then(res => {
                            if (res.data.code == 0) {
                                this.releasePasses = res.data.data.releasePasses
                                Toast({
                                    message: '审批成功',
                                    iconClass: 'icon icon-success'
                                })
                            } else {
                                Toast({
                                    message: '操作失败',
                                    iconClass: 'icon icon-false'
                                })
                            }
                        })
                    })
            },
            showQrCode(id) {
                this.qrCode = id.toString()
                this.qrDialog = true
            },
            stopPass(id) {
                MessageBox.confirm('确定终止该出门条?').then(() => {
                    axios.post(`${STOP_PASS_API}?empCode=${this.empCode}`, {id})
                        .then(res => {
                            if (res.data.code == 0) {
                                Toast({
                                    message: '终止成功',
                                    iconClass: 'icon icon-success'
                                })
                                this.releasePasses = res.data.data.releasePasses
                            } else {
                                Toast({
                                    message: '操作失败',
                                    iconClass: 'icon icon-false'
                                })
                            }
                        })
                })

            },
            onScan({resultStr}) {
                axios.get(`${GET_RELEASEPASS_API}?id=${parseInt(resultStr)}&empCode=${this.empCode}`)
                    .then(res => {
                        if (res.data.data) {
                            const releasePass = res.data.data.releasePass
                            if (releasePass.currentNode == '审批完成') {
                                this.releasePass = releasePass
                                this.detailDialog = true
                                this.showPassButton = true
                            } else {
                                MessageBox('提示', `该出门目前状态为${releasePass.currentNode},不满足放行条件。`)
                            }
                        } else {
                            Toast({
                                message: '你没有放行权限',
                                iconClass: 'icon icon-false'
                            })
                        }

                    })
            }
            ,
            onScanQRCode() {
                wx.scanQRCode({
                    desc: 'scanQRCode desc',
                    needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
                    scanType: [
                        'qrCode', 'barCode'
                    ], // 可以指定扫二维码还是一维码，默认二者都有
                    success: this.onScan,
                    error: function (res) {
                        if (res.errMsg.indexOf('function_not_exist') > 0) {
                            alert('版本过低请升级')
                        }
                    }
                })
                // this.onScan({resultStr: 25})
            },
            onPass() {
                this.detailDialog = false
                axios.post(`${GOODS_PASS_API}?empCode=${this.empCode}`, {
                    id: this.releasePass.id,
                    doorKeeper: {
                        doorKeeperId: this.empCode,
                        doorKeeperName: this.empName,
                        doorKeeperPhone: this.empPhone
                    }
                }).then(res => {
                    if (res.data.code == 0) {
                        Toast({
                            message: '放行成功',
                            iconClass: 'icon icon-success'
                        })
                        this.releasePasses = res.data.data.releasePasses
                    } else {
                        Toast({
                            message: '操作失败',
                            iconClass: 'icon icon-false'
                        })
                    }
                })
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .qrCode-button {
        z-index: 99999;
        position: fixed;
        right: 10px;
        bottom: 12vh;
    }

</style>
