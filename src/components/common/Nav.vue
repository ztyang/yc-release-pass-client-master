<template>
    <div>
        <mt-tab-container v-model="selected" swipeable class="content">
            <mt-tab-container-item id="reportForm">
                <ReportForm @changeTab="changeTab($event)"></ReportForm>
            </mt-tab-container-item>
            <mt-tab-container-item id="releasePassList">
                <RleasePassList></RleasePassList>
            </mt-tab-container-item>
        </mt-tab-container>
        <mu-paper :zDepth="5">
            <mu-bottom-nav :value="selected" @change="changeTab">
                <mu-bottom-nav-item value="reportForm" title="单据填报" icon="books"/>
                <mu-bottom-nav-item value="releasePassList" title="单据列表" icon="list"/>
            </mu-bottom-nav>
        </mu-paper>
    </div>
</template>

<script>
    import RleasePassList from '../releasePassList/ReleasePassList'
    import ReportForm from '../report/ReportForm'


    export default {
        name: 'mynav',
        components: {RleasePassList, ReportForm},
        data() {
            return {
                selected: 'releasePassList'
            }
        },
        methods: {
            changeTab(value) {
                this.selected = value
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    .content {
        height: 90vh;
        overflow: scroll;
    }

    .nav {
        height: 10vh;
    }
</style>
