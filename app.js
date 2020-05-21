class WorkoutSet {
  constructor(name, duration) {
    this.name = name;
    this.duration = duration;
  }
}

var timerCircle;
var wasStarted = false;

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
      this.sets = parseWorkout(this.rawWorkout);
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
        var msg = new SpeechSynthesisUtterance(
          `${this.title} - ${this.timeLeft} seconds - begin`
        );
        window.speechSynthesis.speak(msg);
      } else {
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

setInterval(() => {
  if (app.started && !wasStarted) {
    timerCircle = radialIndicator("#timerCircle", {
      barColor: "#87CEEB",
      barWidth: 10,
      initValue: 0,
      minValue: 0,
      maxValue: 60,
    });
  }

  wasStarted = app.started;

  if (
    app.started &&
    !app.paused &&
    !window.speechSynthesis.speaking &&
    app.sets.length > 0
  ) {
    app.timeLeft--;
    if (app.timeLeft <= 0) {
      app.next();
    }
    timerCircle.value(app.timeLeft);
  }
}, 1000);
