<template>
  <div class="app-container">
  <real-chart2 />
  </div>
</template>

<script>

import RealChart2 from './RealChart2'

export default {
  name: 'RealCalc',
  components: { RealChart2 },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>
  .edit-input {
    padding-right: 100px;
  }

  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>
