class WorkoutSet {
  constructor(name, duration) {
    this.name = name;
    this.duration = duration;
  }
}

let clipboard = new ClipboardJS("#copy-btn");
clipboard.on("success", function (e) {
  let copyBtn = $("#copy-btn");
  copyBtn.tooltip("show");
  setTimeout(() => {
    copyBtn.tooltip("dispose");
  }, 1000);
});

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
    rawWorkout: getInitialRawWorkout(),
    sets: [],
  },
  computed: {
    url: function () {
      return (
        location.origin + `?workout=${encodeURIComponent(this.rawWorkout)}`
      );
    },
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
      if (this.idx <= 0) return;
      this.idx -= 2;
      this.next();
    },
    refresh: function () {
      window.speechSynthesis.cancel();
      location.href = this.url;
    },
  },
});

function getInitialRawWorkout() {
  const inURL = new URLSearchParams(location.search).get("workout");
  if (inURL != null && inURL.trim() !== "") {
    return inURL;
  }

  const inLocalStorage = localStorage.getItem("workout-sets");
  if (inLocalStorage != null && inLocalStorage.trim() !== "") {
    return inLocalStorage;
  }

  return "";
}

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

    if (app.timeLeft === 31) {
      setTimeout(() => speak("30 seconds"), 500);
    }

    if (app.timeLeft === 11) {
      setTimeout(() => speak("10 seconds"), 500);
    }

    if (app.timeLeft <= 6 && app.timeLeft > 1) {
      setTimeout(() => speak(app.timeLeft - 1), 50 * app.timeLeft - 50);
    }
    timerCircle.value(app.timeLeft);
  }
}, 1000);
