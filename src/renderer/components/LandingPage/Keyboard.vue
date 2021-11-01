<template>
  <div :class="keyboardClass"></div>
</template>

<script>
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

export default {
  name: "SimpleKeyboard",
  props: {
    keyboardClass: {
      default: "simple-keyboard",
      type: String
    },
    input: {
			default: '',
      type: String
    }
  },
  data: () => ({
    keyboard: null
  }),
  watch: {
    input(input) {
      this.keyboard.setInput(input);
    }
  },
  mounted() {
    this.keyboard = new Keyboard(this.keyboardClass, {
      onChange: this.onChange,
      onKeyPress: this.onKeyPress,
			layout: {
				'default': [
					'` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
					'{tab} Q W E R T Y U I O P { } |',
					'{lock} A S D F G H J K L : " {enter}',
					'{shift} Z X C V B N M < > ? {shift}',
				],
				'shift': [
					'~ ! @ # $ % ^ & * ( ) _ + {bksp}',
					'{tab} Q W E R T Y U I O P { } |',
					'{lock} A S D F G H J K L : " {enter}',
					'{shift} Z X C V B N M < > ? {shift}',
				]
			},
			buttonTheme: [
				{
					class: "frequent",
					buttons: "A B X -"
				}
			]
    });
  },
  methods: {
    onChange(input) {
      this.$emit("onChange", input);
    },
    onKeyPress(button) {
      this.$emit("onKeyPress", button);

      /**
       * If you want to handle the shift and caps lock buttons
       */
      if (button === "{shift}" || button === "{lock}") this.handleShift();
    },
    handleShift() {
      let currentLayout = this.keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";

      this.keyboard.setOptions({
        layoutName: shiftToggle
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.simple-keyboard.hg-theme-default .hg-button {
  height: 10vh;
	font-size: 3vmin;
}

.simple-keyboard .frequent {
	background-color: rgb(209, 209, 209);
}
</style>
