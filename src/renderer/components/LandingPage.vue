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
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

main {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
	height: 100%;
}
</style>
