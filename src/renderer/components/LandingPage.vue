<template>
  <div id="wrapper">
    <main>
			<SystemInformation />
			<!-- <Number /> -->
    </main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
	// import Number from './LandingPage/Number'

  export default {
    name: 'LandingPage',
    components: {
			SystemInformation,
			// Number
		},
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
/* @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro"); */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  background-color: white;
  min-height: 100vh;
  padding: 3vh 3vw;
  width: 100%;
}

main {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
	height: 100%;
}
</style>
