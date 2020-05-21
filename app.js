class WorkoutSet {
  constructor(name, duration) {
    this.name = name;
    this.duration = duration;
  }
}

var timerCircle;
var wasStarted = false;
var speakingActivity = false;

var app = new Vue({
  el: "#workout-timer",
  data: {
    timeLeft: 0,
    idx: -1,
    isDone: false,
    title: "",
    paused: false,
    started: false,
    rawWorkout: localStorage.getItem("workout-sets") || "",
    sets: [],
  },
  methods: {
    start: function () {
      localStorage.setItem("workout-sets", this.rawWorkout);
      timerCircle = null;
      this.sets = parseWorkout(this.rawWorkout);
      this.idx = -1;
      this.isDone = false;
      this.started = true;
    },
    next: function () {
      this.idx++;
      if (this.idx < this.sets.length) {
        this.timeLeft = this.sets[this.idx].duration;
        this.title = this.sets[this.idx].name;
        timerCircle.option("maxValue", this.timeLeft);
        timerCircle.value(this.timeLeft);
        window.speechSynthesis.cancel();
        speak(`${this.title} - ${this.timeLeft} seconds - begin`);
        speakingActivity = true;
      } else {
        this.started = false;
        this.title = "done";
        this.timeLeft = 0;
        this.isDone = true;
      }
    },
    previous: function () {
      // TODO: Make this better
      this.idx -= 2;
      this.timeLeft = 0;
    },
  },
});

function parseWorkout(workout) {
  return workout
    .split("\n")
    .map((it) => it.split(",").map((it) => it.trim()))
    .map((it) => new WorkoutSet(it[0], +it[1]));
}

function speak(text) {
  var msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
}

setInterval(() => {
  if (app.started && !wasStarted && timerCircle == null) {
    timerCircle = radialIndicator("#timerCircle", {
      barColor: "#87CEEB",
      barWidth: 10,
      initValue: 0,
      minValue: 0,
      maxValue: 60,
    });
  }

  wasStarted = app.started;

  speakingActivity = speakingActivity && window.speechSynthesis.speaking;

  if (
    app.started &&
    !app.paused &&
    !speakingActivity && // TODO: only care about initial speaking
    app.sets.length > 0
  ) {
    app.timeLeft--;
    if (app.timeLeft <= 0) {
      app.next();
    }

    if (app.timeLeft === 10) {
      speak("10 seconds");
    }

    if (app.timeLeft <= 5 && app.timeLeft > 0) {
      speak(app.timeLeft);
    }
    timerCircle.value(app.timeLeft);
  }
}, 1000);
