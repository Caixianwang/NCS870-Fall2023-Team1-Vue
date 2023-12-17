<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu @select="handleSelect"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <el-menu-item  index="3" v-if="['admin','user1'].includes(userName)">
          <template slot="title">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
            <span>Introduce</span>
          </template>
        </el-menu-item>
        <el-menu-item  index="1">
          <template slot="title">
            <svg-icon icon-class="table" class-name="card-panel-icon" />
            <span>Real-Time</span>
          </template>
        </el-menu-item>
        <el-menu-item  index="2">
          <template slot="title">
            <svg-icon icon-class="table" class-name="card-panel-icon" />
            <span>Topology</span>
          </template>
        </el-menu-item>
        <el-menu-item  index="5" v-if="['admin', 'poweruser1', 'user1'].includes(userName)">
          <template slot="title">
            <svg-icon icon-class="table" class-name="card-panel-icon" />
            <span>IP location</span>
          </template>
        </el-menu-item>
        <el-menu-item  index="6" v-if="['admin', 'poweruser1', 'user1'].includes(userName)">
          <template slot="title">
            <svg-icon icon-class="table" class-name="card-panel-icon" />
            <span>Path correlation</span>
          </template>
        </el-menu-item>
        <el-menu-item  index="4" v-if="['admin', 'poweruser1', 'user1'].includes(userName)">
          <template slot="title">
            <svg-icon icon-class="table" class-name="card-panel-icon" />
            <span>Data Show</span>
          </template>
        </el-menu-item>

<!--        <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />-->
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import global from '@/Globl'
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import AppLink from '@/layout/components/Sidebar/Link.vue'

export default {
  data() {
    return {
      userName: 'admin',
    }
  },
  components: { AppLink, SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar',
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  created() {
    this.userName = global.userName

  },
  mounted() {
    console.log(global.userName)
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      if(key=="1"){
        this.$router.push({ path: "dash" })
      }else if(key=="2"){
        this.$router.push({ path: "topo" })
      }else if(key=="3"){
        this.$router.push({ path: "intr" })
      }else if(key=="4"){
        this.$router.push({ path: "data" })
      }else if(key=="5"){
        this.$router.push({ path: "gis" })
      }else if(key=="6"){
        this.$router.push({ path: "matrix" })
      }


    }
  }
}
</script>
