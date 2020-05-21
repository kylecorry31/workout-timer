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
    rawWorkout: "",
    sets: [],
  },
  methods: {
    start: function () {
      this.sets = parseWorkout(this.rawWorkout);
      this.started = true;
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
      app.idx++;
      if (app.idx < app.sets.length) {
        app.timeLeft = app.sets[app.idx].duration;
        app.title = app.sets[app.idx].name;
        timerCircle.option("maxValue", app.timeLeft);
        var msg = new SpeechSynthesisUtterance(
          `${app.title} - ${app.timeLeft} seconds - begin`
        );
        window.speechSynthesis.speak(msg);
      } else {
        app.title = "done";
        app.timeLeft = 0;
        app.isDone = true;
      }
    }
    timerCircle.value(app.timeLeft);
  }
}, 1000);
