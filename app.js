class WorkoutSet {
  constructor(name, duration) {
    this.name = name;
    this.duration = duration;
  }
}

var timerCircle;

document.body.onload = () => {
  timerCircle = radialIndicator("#timerCircle", {
    barColor: "#87CEEB",
    barWidth: 10,
    initValue: 0,
    minValue: 0,
    maxValue: 60,
  });
};

var app = new Vue({
  el: "#workout-timer",
  data: {
    timeLeft: 0,
    idx: -1,
    isDone: false,
    title: "",
    paused: false,
    sets: [
      new WorkoutSet("Strikes", 3 * 60),
      new WorkoutSet("Lunge and left hook", 60),
      new WorkoutSet("Strikes", 3 * 60),
      new WorkoutSet("Lunge and right hook", 60),
      new WorkoutSet("Water break", 60),
      new WorkoutSet("Two hand choke from behind", 60),
      new WorkoutSet("Two hand choke from behind then combos", 3 * 60),
      new WorkoutSet(
        "Two hand choke from behind then combos and a 15 count mountain climber burpee",
        3 * 60
      ),
      new WorkoutSet("Water break", 60),
      new WorkoutSet("Extended hook punch defense with combos", 2 * 60),
      new WorkoutSet("Ground and pound", 30),
      new WorkoutSet(
        "Extended hook punch defense with combos and kick",
        2 * 60
      ),
      new WorkoutSet("Squat thrusters", 30),
      new WorkoutSet(
        "Combo with kick then extended hook punch defense",
        2 * 60
      ),
      new WorkoutSet("Burpees", 30),
    ],
  },
});

setInterval(() => {
  if (!app.paused && !window.speechSynthesis.speaking) {
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
